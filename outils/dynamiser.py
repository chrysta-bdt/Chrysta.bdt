"""Rend une vidéo plus dynamique, sans ajouter de texte.

Usage : python3 dynamiser.py entree.mp4 sortie.mp4 [--fin SECONDES] [--sans-whoosh]

- détecte automatiquement les changements de plan
- zoom "punch" + flash léger à chaque coupe
- couleurs plus vives, image plus nette
- barre de progression jaune en haut
- whoosh discret sur les coupes
--fin : instant où commence la carte de fin (aucun effet après)
"""
import argparse, re, subprocess

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("out")
ap.add_argument("--fin", type=float, default=None)
ap.add_argument("--sans-whoosh", action="store_true")
ap.add_argument("--zoom", type=float, default=0.10)
a = ap.parse_args()

FPS = 30

def probe(entry):
    return subprocess.run(["ffprobe", "-v", "error", "-show_entries", entry, "-of",
                           "default=nw=1:nk=1", a.src], capture_output=True, text=True).stdout.split()

dur = float(probe("format=duration")[0])
has_audio = "audio" in probe("stream=codec_type")
fin = a.fin if a.fin is not None else dur

# changements de plan, en ignorant ceux trop rapprochés
log = subprocess.run(["ffmpeg", "-hide_banner", "-i", a.src, "-an", "-vf",
                      "select='gt(scene,0.25)',showinfo", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
cuts = [0.0]
for t in map(float, re.findall(r"pts_time:([0-9.]+)", log)):
    if t - cuts[-1] >= 0.4 and t < fin - 0.2:
        cuts.append(t)

z = a.zoom
punch = "+".join(f"if(between(in/{FPS},{c},{c+0.3}),{z}*(1-(in/{FPS}-{c})/0.3),0)" for c in cuts)
flashes = [f"drawbox=x=0:y=0:w=iw:h=ih:color=white@0.35:t=fill:enable='between(t,{c},{c+0.06})'"
           for c in cuts[1:]]

vf = ",".join([
    f"fps={FPS}",
    "scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840",
    f"zoompan=z='1+{punch}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps={FPS}",
    f"eq=contrast=1.08:saturation=1.25:enable='lt(t,{fin})'",
    f"unsharp=5:5:0.5",
    *flashes,
    f"drawbox=x=0:y=0:w='iw*t/{dur}':h=10:color=0xFFD400@1:t=fill:enable='lt(t,{fin})'",
    "format=yuv420p",
])

graph = f"[0:v]{vf}[v]"
maps = ["-map", "[v]"]
if has_audio:
    if a.sans_whoosh or len(cuts) < 2:
        graph += ";[0:a]anull[a]"
    else:
        n = len(cuts) - 1
        whoosh = ("anoisesrc=d=0.3:c=pink:a=0.5,highpass=f=700,lowpass=f=5000,"
                  "afade=t=in:d=0.1,afade=t=out:st=0.1:d=0.2,volume=0.22")
        graph += (f";{whoosh},asplit={n}" + "".join(f"[w{i}]" for i in range(n)) + ";"
                  + "".join(f"[w{i}]adelay={max(0, int((c - 0.12) * 1000))}:all=1[d{i}];"
                            for i, c in enumerate(cuts[1:]))
                  + "[0:a]" + "".join(f"[d{i}]" for i in range(n))
                  + f"amix=inputs={n+1}:normalize=0:duration=first,alimiter=limit=0.95[a]")
    maps += ["-map", "[a]"]

subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.src, "-filter_complex", graph, *maps,
                "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-profile:v", "high",
                "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", a.out], check=True)
print(f"{len(cuts) - 1} coupes dynamisées -> {a.out}")
