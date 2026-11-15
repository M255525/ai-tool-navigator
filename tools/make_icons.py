# PWA 圖示：深藍站牌底＋三條彩色路線與車站（python tools/make_icons.py）
import os
from PIL import Image, ImageDraw
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'icons')
os.makedirs(out, exist_ok=True)
def draw(size, pad):
    s = 4 * size; im = Image.new('RGB', (s, s), '#1d2b3a'); d = ImageDraw.Draw(im)
    x0 = pad * s; w = s - 2 * x0; lw = int(w * .07)
    P = lambda a, b: (x0 + w * a, x0 + w * b)
    d.line([P(.15, .3), P(.5, .3), P(.85, .65)], fill='#e3402f', width=lw, joint='curve')
    d.line([P(.15, .7), P(.5, .7), P(.85, .3)], fill='#f2a900', width=lw, joint='curve')
    d.line([P(.5, .12), P(.5, .88)], fill='#0f62fe', width=lw)
    for (a, b) in [(.15, .3), (.5, .3), (.5, .7), (.15, .7), (.85, .65), (.85, .3), (.5, .12), (.5, .88)]:
        r = w * .065; cx, cy = P(a, b); d.ellipse([cx - r, cy - r, cx + r, cy + r], fill='#ffffff', outline='#1d2b3a', width=int(w * .02))
    return im.resize((size, size), Image.LANCZOS)
draw(192, .06).save(os.path.join(out, 'icon-192.png')); draw(512, .06).save(os.path.join(out, 'icon-512.png')); draw(512, .18).save(os.path.join(out, 'icon-maskable-512.png'))
print('ok')
