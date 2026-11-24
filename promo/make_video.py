# Scribble Kick tanitim videosu: python3 make_video.py <dil> <yatay|dikey> <cikti.mp4>
# Kareler: capture.js ile alinan oyun goruntuleri (FR=/tmp/vid). Yazilar strings.json'dan gelir;
# yeni dil icin strings.json'a ekle, oyun goruntusu olarak 'en' kareleri kullanilir.
import json, os, sys, subprocess, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

LANG, ORI, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
FR = os.environ.get('FR', '/tmp/vid')
HERE = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(HERE, 'strings.json')))[LANG]
SRC = LANG if LANG in ('tr', 'en') else 'en'
W, H = (1920, 1080) if ORI == 'yatay' else (1080, 1920)
FPS = 30
FB = '/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf'
ASSET = '/home/claude/kroki-football/www/assets/'
ICON = Image.open('/mnt/user-data/outputs/play-store/icon-512.png').convert('RGBA')
BG = Image.open(ASSET + 'bg.jpg').convert('RGB')
GOLD, DARK = (255, 200, 58), (12, 34, 44)

def font(sz): return ImageFont.truetype(FB, sz)

def ease(t): return 1 - (1 - max(0, min(1, t))) ** 3

def cover(im, w, h):
    r = max(w / im.width, h / im.height)
    im = im.resize((math.ceil(im.width * r), math.ceil(im.height * r)), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))

BGV = cover(BG, W, H).filter(ImageFilter.GaussianBlur(10))
BGV = Image.blend(BGV, Image.new('RGB', (W, H), DARK), 0.45)

def text_block(d, txt, cx, cy, sz, fill=(255, 255, 255), stroke=8, maxw=None):
    f = font(sz)
    while maxw and d.textlength(txt, font=f) > maxw and sz > 30:
        sz -= 4; f = font(sz)
    d.text((cx, cy), txt, font=f, fill=fill, anchor='mm', stroke_width=stroke, stroke_fill=(20, 24, 40))

def pill(img, txt, cx, cy, sz, a=1.0):
    """Altin rozetli baslik seridi (alt yazi)."""
    lay = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    f = font(sz); maxw = W - 120
    while d.textlength(txt, font=f) > maxw - 80 and sz > 30:
        sz -= 4; f = font(sz)
    tw = d.textlength(txt, font=f); pw, ph = tw + 90, sz * 1.75
    x0, y0 = cx - pw / 2, cy - ph / 2
    d.rounded_rectangle((x0, y0 + 8, x0 + pw, y0 + ph + 8), radius=ph / 2, fill=(90, 45, 0, int(255 * a)))
    d.rounded_rectangle((x0, y0, x0 + pw, y0 + ph), radius=ph / 2, fill=(255, 190, 50, int(255 * a)), outline=(120, 60, 5, int(255 * a)), width=6)
    d.text((cx, cy + 2), txt, font=f, fill=(58, 28, 0, int(255 * a)), anchor='mm')
    img.alpha_composite(lay)

def logo(img, cx, cy, scale=1.0, a=1.0):
    lay = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    sz = int(150 * scale)
    d.text((cx, cy), 'SCRIBBLE KICK', font=font(sz), fill=GOLD + (int(255 * a),), anchor='mm', stroke_width=max(4, int(12 * scale)), stroke_fill=(70, 30, 0, int(255 * a)))
    img.alpha_composite(lay)

# ---- kareler ----
def gframes(a, b):
    lg = open(f'{FR}/g_{SRC}/log.txt').read().split('\n')
    out = []
    for i in range(a, b):
        p = lg[i].split(','); out.append((f'{FR}/g_{SRC}/{i:05d}.jpg', float(p[3]), float(p[4])))
    return out

def goalframes():
    t, gi = open(f'{FR}/h_{SRC}/goal.txt').read().split(',')
    pre = [f'{FR}/h_{SRC}/t{t}_pre{i:02d}.jpg' for i in range(14)]
    gi = int(gi)
    post = [f'{FR}/h_{SRC}/t{t}_{i:04d}.jpg' for i in range(0, gi + 44)]
    out = [(f, 'S', (1480, 540)) for f in pre] + [(f, 'S', (1480, 540) if i < gi + 6 else (960, 520)) for i, f in enumerate(post)]
    return [o for o in out if os.path.exists(o[0])]

def world2scr(x, y): return 215 + (x - 70) / 1020 * 1492, 148 + (y - 100) / 550 * 800

class Cam:
    def __init__(s): s.x, s.y = 960, 540
    def frame(s, path, bx, by, zoom, cw, ch):
        im = Image.open(path).convert('RGB')
        if bx == 'S':
            tx, ty = by
        elif bx is not None:
            tx, ty = world2scr(bx, by)
        else:
            tx, ty = 1250, 540
        kf = 0.25 if bx == 'S' else 0.12
        s.x += (tx - s.x) * kf; s.y += (ty - s.y) * kf
        # kirpma kutusu (cw:ch orani), yakinlik
        h = 1080 / zoom; w = h * cw / ch
        if w > 1920: w = 1920; h = w * ch / cw
        x = min(max(s.x - w / 2, 0), 1920 - w); y = min(max(s.y - h / 2, 0), 1080 - h)
        return im.crop((int(x), int(y), int(x + w), int(y + h))).resize((cw, ch), Image.LANCZOS)

cam = Cam()
V = ORI == 'dikey'
GW, GH = (W, H) if not V else (1080, 1240)   # oyun alani boyutu
GY = 0 if not V else 400

def bottom_cta(img):
    d = ImageDraw.Draw(img)
    text_block(d, S['end1'], W // 2, 1780, 56, stroke=6, maxw=W - 120)

def game_canvas(gimg):
    if not V: return gimg.convert('RGBA')
    c = BGV.copy().convert('RGBA'); c.paste(gimg, (0, GY)); return c

def cap_pos(): return (W // 2, H - 120) if not V else (W // 2, 250)

frames = []   # her biri: fonksiyon(i_local) -> RGBA

def scene(n, fn): frames.extend([(fn, k, n) for k in range(n)])

# 1) Acilis
first = gframes(120, 121)[0][0]
def s_title(k, n):
    base = cover(Image.open(first).convert('RGB'), W, H).filter(ImageFilter.GaussianBlur(14))
    img = Image.blend(base, Image.new('RGB', (W, H), DARK), 0.5).convert('RGBA')
    t = ease(k / 18)
    isz = int((300 if not V else 420) * (0.6 + 0.4 * t))
    ic = ICON.resize((isz, isz), Image.LANCZOS)
    cy = H // 2 - (120 if not V else 260)
    img.alpha_composite(ic, (W // 2 - isz // 2, cy - isz // 2))
    logo(img, W // 2, cy + (260 if not V else 360), (1.0 if not V else 0.82), ease((k - 8) / 14))
    d = ImageDraw.Draw(img)
    if k > 16:
        a = ease((k - 16) / 12)
        lay = Image.new('RGBA', img.size, (0, 0, 0, 0)); dl = ImageDraw.Draw(lay)
        text_block(dl, S['tag'], W // 2, cy + (390 if not V else 500), 64 if not V else 60, fill=(255, 255, 255, int(255 * a)), stroke=6, maxw=W - 140)
        img.alpha_composite(lay)
    return img
scene(75, s_title)

def game_scene(src, zoom, cap):
    def fn(k, n):
        path, bx, by = src[k]
        g = cam.frame(path, bx, by, zoom, GW, GH)
        img = game_canvas(g)
        if V: logo(img, W // 2, 110, 0.62); bottom_cta(img)
        a = min(1, k / 8, (n - k) / 8)
        cx, cy = cap_pos()
        pill(img, cap, cx, cy if not V else 300, 66 if not V else 64, max(0, a))
        return img
    scene(len(src), fn)

# 2) Oyun
game_scene(gframes(100, 250), 1.45, S['c1'])
# 3) Yetenekler: UFO + buz + super hiz
ab = gframes(296, 366) + gframes(696, 766) + gframes(1000, 1040)
game_scene(ab, 1.35, S['c2'])
# 4) Gol
cam.x, cam.y = 1250, 540
game_scene(goalframes(), 1.3, S['c3'])

# 5) Menuler
MN = ['menu', 'team', 'diff', 'shop', 'wheel', 'badges']
def s_menu(k, n):
    per = n / len(MN); j = min(len(MN) - 1, int(k / per)); kk = k - j * per
    im = Image.open(f'{FR}/m_{SRC}/{MN[j]}.jpg').convert('RGB')
    z = 1.0 + 0.05 * kk / per
    if not V:
        im = cover(im, int(W * z), int(H * z)); x, y = (im.width - W) // 2, (im.height - H) // 2
        img = im.crop((x, y, x + W, y + H)).convert('RGBA')
        a = min(1, k / 8, (n - k) / 8)
        pill(img, S['c4'], W // 2, H - 110, 66, a)
    else:
        img = BGV.copy().convert('RGBA')
        cw = im.width * 0.62; ch = cw * 1.0
        x0 = (im.width - cw) / 2; y0 = (im.height - ch) / 2
        crop = im.crop((int(x0), int(max(0, y0)), int(x0 + cw), int(min(im.height, y0 + ch))))
        ww = int(1080 * z); hh = int(crop.height * ww / crop.width)
        img.paste(crop.resize((ww, hh), Image.LANCZOS), ((W - ww) // 2, 1010 - hh // 2))
        logo(img, W // 2, 110, 0.62); bottom_cta(img)
        pill(img, S['c4'], W // 2, 300, 64, min(1, k / 8))
    if kk < 4:   # kisa beyaz flas gecis
        img = Image.blend(img, Image.new('RGBA', img.size, (255, 255, 255, 255)), 0.35 * (1 - kk / 4))
    return img
scene(6 * 27, s_menu)

# 6) Kapanis
def s_end(k, n):
    img = BGV.copy().convert('RGBA'); d = ImageDraw.Draw(img)
    t = ease(k / 14)
    isz = int((260 if not V else 400) * (0.7 + 0.3 * t))
    cy = H // 2 - (170 if not V else 330)
    img.alpha_composite(ICON.resize((isz, isz), Image.LANCZOS), (W // 2 - isz // 2, cy - isz // 2))
    logo(img, W // 2, cy + (230 if not V else 330), (0.9 if not V else 0.8))
    text_block(d, S['end1'], W // 2, cy + (350 if not V else 460), 62 if not V else 60, stroke=6, maxw=W - 140)
    # buton (nabiz)
    s = 1 + 0.04 * math.sin(k / 4)
    bw, bh = int(620 * s), int(130 * s); bx, by = W // 2 - bw // 2, cy + (470 if not V else 600)
    d.rounded_rectangle((bx, by + 10, bx + bw, by + bh + 10), radius=34, fill=(20, 80, 10))
    d.rounded_rectangle((bx, by, bx + bw, by + bh), radius=34, fill=(70, 190, 40), outline=(20, 90, 10), width=6)
    # Play ucgeni (genel bir oynat isareti, marka logosu degil)
    tx, ty = bx + 70, by + bh // 2
    d.polygon([(tx - 18, ty - 30), (tx - 18, ty + 30), (tx + 30, ty)], fill=(255, 255, 255))
    f = font(58)
    while d.textlength(S['btn'], font=f) > bw - 170: f = font(f.size - 4)
    d.text((bx + bw // 2 + 35, by + bh // 2 + 2), S['btn'], font=f, fill=(255, 255, 255), anchor='mm', stroke_width=4, stroke_fill=(20, 90, 10))
    return img
scene(105, s_end)

# ---- yaz ----
if os.environ.get('PREV'):
    for idx in map(int, os.environ['PREV'].split(',')):
        fn, k, n = frames[idx]; fn(k, n).convert('RGB').save(f'{OUT}_{idx}.jpg', quality=85)
    print(len(frames)); sys.exit()
tmp = OUT + '.tmp.mp4'
p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                      '-c:v', 'libx264', '-crf', '19', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', tmp], stdin=subprocess.PIPE)
for fn, k, n in frames:
    p.stdin.write(fn(k, n).convert('RGB').tobytes())
p.stdin.close(); p.wait()
assert p.returncode == 0
os.replace(tmp, OUT)
print(OUT, len(frames) / FPS, 's')
