"""Montage dynamique v1 : zooms punch sur les coupes, flash, étalonnage, textes, carte de fin."""
import subprocess, sys

SRC, OUT = sys.argv[1], sys.argv[2]
FPS = 30
DUR = 10.17          # durée de la vidéo source
END = 2.8            # durée de la carte de fin
CUTS = [0.0, 1.40, 3.25, 4.15, 5.02, 5.80, 7.09, 7.91]
FONT = "/usr/share/fonts/opentype/inter/Inter-Black.otf"
FONT2 = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"

# zoom "punch" : 1.14 au moment de la coupe, retour à 1.0 en 0.3 s
punch = "+".join(
    f"if(between(in/{FPS},{c},{c+0.3}),0.14*(1-(in/{FPS}-{c})/0.3),0)" for c in CUTS
)
zoom = f"1+{punch}"

def text(t, start, end, y, size, font=FONT, box="black@0.0", color="white", pop=True):
    t = t.replace("'", "’").replace(":", "\\:")
    fs = f"{size}*min(1\\,0.6+0.4*(t-{start})/0.12)" if pop else str(size)
    return (f"drawtext=fontfile={font}:text='{t}':fontcolor={color}:fontsize='{fs}'"
            f":borderw={0 if color=='black' else 7}:bordercolor=black:box=1:boxcolor={box}:boxborderw=18"
            f":x=(w-text_w)/2:y={y}:enable='between(t,{start},{end})'")

flashes = ",".join(
    f"drawbox=x=0:y=0:w=iw:h=ih:color=white@0.55:t=fill:enable='between(t,{c},{c+0.07})'"
    for c in CUTS[1:]
)

total = DUR + END
vf = ",".join([
    f"fps={FPS}",
    "scale=2160:3840",
    f"zoompan=z='{zoom}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps={FPS}",
    "eq=contrast=1.08:saturation=1.3:brightness=0.01",
    "unsharp=5:5:0.6",
    flashes,
    # carte de fin : on fige la dernière image, floutée et assombrie
    f"tpad=stop_mode=clone:stop_duration={END}",
    f"boxblur=20:enable='gte(t,{DUR})'",
    f"drawbox=x=0:y=0:w=iw:h=ih:color=black@0.45:t=fill:enable='gte(t,{DUR})'",
    # textes
    text("...jusqu'à ce qu'il", 4.15, DUR, "h*0.60", 70),
    text("te tende le tuyau", 4.25, DUR, "h*0.60+95", 70, box="0xFFD400@1", color="black"),
    text("LAVAGE AUTO", DUR, total, "h*0.33", 110),
    text("À DOMICILE", DUR + 0.1, total, "h*0.33+135", 110, box="0xFFD400@1", color="black"),
    text("On se déplace chez vous", DUR + 0.5, total, "h*0.52", 62, font=FONT2),
    text("Réservez en message privé", DUR + 0.9, total, "h*0.60", 62, font=FONT2),
    # barre de progression en haut (aide à la rétention)
    f"drawbox=x=0:y=0:w='iw*t/{total}':h=12:color=0xFFD400@1:t=fill",
    "format=yuv420p",
])

# whoosh synthétique sur chaque coupe
whoosh = "anoisesrc=d=0.35:c=pink:a=0.5,highpass=f=600,lowpass=f=5000,afade=t=in:d=0.12,afade=t=out:st=0.12:d=0.23,volume=0.35"
n = len(CUTS) - 1
af = (f"[0:a]apad=pad_dur={END},afade=t=out:st={DUR-0.3}:d=0.5[a0];"
      f"{whoosh},asplit={n}" + "".join(f"[w{i}]" for i in range(n)) + ";"
      + "".join(f"[w{i}]adelay={int((c-0.15)*1000)}:all=1[d{i}];" for i, c in enumerate(CUTS[1:]))
      + "[a0]" + "".join(f"[d{i}]" for i in range(n))
      + f"amix=inputs={n+1}:normalize=0:duration=first,alimiter=limit=0.9[a]")

cmd = ["ffmpeg", "-v", "error", "-y", "-i", SRC,
       "-filter_complex", f"[0:v]{vf}[v];{af}",
       "-map", "[v]", "-map", "[a]", "-t", str(total),
       "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-profile:v", "high",
       "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", OUT]
subprocess.run(cmd, check=True)
