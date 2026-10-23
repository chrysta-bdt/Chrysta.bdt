"""Efface les légendes incrustées d'une vidéo et les remplace par des légendes animées.

Usage : python3 legendes_dynamiques.py entree.mp4 legendes.json sortie.mp4

legendes.json :
{
  "effacer": [{"x": 60, "y": 945, "w": 520, "h": 165, "debut": 1.2, "fin": 19.5}],  # zones en pixels source, une ou plusieurs
  "fin": 19.5,                       # fin des légendes (début de la carte de fin)
  "zoom": 0.08,                      # force des zooms punch sur les coupes (0 = aucun)
  "whoosh": true,
  "legendes": [
    {"t": 1.2, "texte": "LE NETTOYAGE QUI"},
    {"t": 2.5, "lignes": ["CANAPÉ", "MATELAS"], "decalage": [0, 0.9]},
    {"t": 4.1, "texte": "DIRECTEMENT CHEZ VOUS", "jaune": ["CHEZ", "VOUS"]}
  ]
}
Chaque légende reste affichée jusqu'au début de la suivante. Les mots apparaissent
un par un avec un effet "pop" ; les mots listés dans "jaune" sont en jaune.
"""
import json, re, subprocess, sys
from PIL import ImageFont

SRC, CFG, OUT = sys.argv[1:4]
cfg = json.load(open(CFG))

FPS, W, H = 30, 1080, 1920
FONT = "/usr/share/fonts/opentype/inter/Inter-Black.otf"
SIZE = 92
LINE_H = int(SIZE * 1.18)
MAX_W = 940
CENTER_Y = cfg.get("centre_y", 1500)
STAGGER = 0.07
YELLOW = "0xFFD400"

def probe(entry):
    return subprocess.run(["ffprobe", "-v", "error", "-show_entries", entry, "-of",
                           "default=nw=1:nk=1", SRC], capture_output=True, text=True).stdout.split()

dur = float(probe("format=duration")[0])
src_w, src_h = (int(v) for v in probe("stream=width,height")[:2])
fin = cfg.get("fin", dur)
font = ImageFont.truetype(FONT, SIZE)
space = font.getlength(" ")

def wrap(words):
    lines, cur = [], []
    for w in words:
        if cur and font.getlength(" ".join(cur + [w])) > MAX_W:
            lines.append(cur); cur = []
        cur.append(w)
    return lines + [cur]

def esc(s):
    return s.replace("\\", "\\\\").replace("'", "’").replace(":", "\\:").replace("%", "\\%")

def word_filter(word, cx, cy, ts, te, color):
    d = f"(t-{ts})"
    scale = f"if(lt({d},0.09),0.6+0.6*{d}/0.09,if(lt({d},0.18),1.2-0.2*({d}-0.09)/0.09,1))"
    fs = f"{SIZE}*{scale}"
    return (f"drawtext=fontfile={FONT}:text='{esc(word)}':fontcolor={color}:fontsize='{fs}'"
            f":borderw=7:bordercolor=black:shadowx=0:shadowy=6:shadowcolor=black@0.5"
            f":x='{cx:.1f}-text_w/2':y='{cy:.1f}+0.36*{fs}-ascent'"
            f":enable='between(t,{ts:.3f},{te:.3f})'")

# --- légendes animées
caps = sorted(cfg["legendes"], key=lambda c: c["t"])
texts = []
for i, c in enumerate(caps):
    end = caps[i + 1]["t"] if i + 1 < len(caps) else fin
    yellow = {w.upper() for w in c.get("jaune", [])}
    if "lignes" in c:
        lines = [l.split() for l in c["lignes"]]
        offsets = c.get("decalage", [0] * len(lines))
    else:
        lines = wrap(c["texte"].split())
        offsets = [0] * len(lines)
    top = CENTER_Y - (len(lines) - 1) * LINE_H / 2
    k = 0
    for li, (words, off) in enumerate(zip(lines, offsets)):
        widths = [font.getlength(w) for w in words]
        x = (W - (sum(widths) + space * (len(words) - 1))) / 2
        cy = top + li * LINE_H
        for w, wd in zip(words, widths):
            ts = c["t"] + off + k * STAGGER
            color = YELLOW if re.sub(r"[^\w]", "", w.upper()) in yellow or w.upper() in yellow else "white"
            texts.append(word_filter(w, x + wd / 2, cy, ts, end, color))
            x += wd + space
            k += 1

# --- effacement des anciennes légendes : interpolation puis flou adouci sur les bords
zones = cfg["effacer"] if isinstance(cfg["effacer"], list) else [cfg["effacer"]]
m = 20  # marge de flou autour de chaque zone
chain, prev = [f"[0:v]fps={FPS}[c0]"], "c0"
for i, e in enumerate(zones):
    ex, ey, ew, eh = e["x"], e["y"], e["w"], e["h"]
    bx, by = max(0, ex - m), max(0, ey - m)
    bw, bh = min(ew + 2 * m, src_w - bx), min(eh + 2 * m, src_h - by)
    on = f"between(t,{e['debut']},{e['fin']})"
    chain.append(
        f"[{prev}]delogo=x={ex}:y={ey}:w={ew}:h={eh}:enable='{on}',split[base{i}][b{i}];"
        f"[b{i}]crop={bw}:{bh}:{bx}:{by},boxblur=14:2,eq=brightness=-0.04,format=yuva444p,"
        f"geq=lum='lum(X,Y)':cb='cb(X,Y)':cr='cr(X,Y)':"
        f"a='255*min(1,min(min(X,W-1-X),min(Y,H-1-Y))/{m})'[band{i}];"
        f"[base{i}][band{i}]overlay={bx}:{by}:enable='{on}'[c{i+1}]")
    prev = f"c{i+1}"
erase = ";".join(chain)

# --- zooms punch sur les coupes
log = subprocess.run(["ffmpeg", "-hide_banner", "-i", SRC, "-an", "-vf",
                      "select='gt(scene,0.25)',showinfo", "-f", "null", "-"],
                     capture_output=True, text=True).stderr
cuts = [0.0]
for t in map(float, re.findall(r"pts_time:([0-9.]+)", log)):
    if t - cuts[-1] >= 0.4 and t < fin - 0.2:
        cuts.append(t)
z = cfg.get("zoom", 0.08)
punch = "+".join(f"if(between(in/{FPS},{c},{c+0.3}),{z}*(1-(in/{FPS}-{c})/0.3),0)" for c in cuts)

vf = ",".join([
    f"scale={W*2}:{H*2}:force_original_aspect_ratio=increase,crop={W*2}:{H*2}",
    f"zoompan=z='1+{punch}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s={W}x{H}:fps={FPS}",
    f"eq=contrast=1.08:saturation=1.25:enable='lt(t,{fin})'",
    "unsharp=5:5:0.5",
    *texts,
    "format=yuv420p",
])
graph = f"{erase};[{prev}]{vf}[v]"
maps = ["-map", "[v]"]
if "audio" in probe("stream=codec_type"):
    if cfg.get("whoosh", True) and len(cuts) > 1:
        n = len(cuts) - 1
        whoosh = ("anoisesrc=d=0.3:c=pink:a=0.5,highpass=f=700,lowpass=f=5000,"
                  "afade=t=in:d=0.1,afade=t=out:st=0.1:d=0.2,volume=0.22")
        graph += (f";{whoosh},asplit={n}" + "".join(f"[w{i}]" for i in range(n)) + ";"
                  + "".join(f"[w{i}]adelay={max(0, int((c - 0.12) * 1000))}:all=1[d{i}];"
                            for i, c in enumerate(cuts[1:]))
                  + "[0:a]" + "".join(f"[d{i}]" for i in range(n))
                  + f"amix=inputs={n+1}:normalize=0:duration=first,alimiter=limit=0.95[a]")
    else:
        graph += ";[0:a]anull[a]"
    maps += ["-map", "[a]"]

subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", SRC, "-filter_complex", graph, *maps,
                "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-profile:v", "high",
                "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", OUT], check=True)
print(f"{len(caps)} légendes, {len(cuts) - 1} coupes -> {OUT}")
