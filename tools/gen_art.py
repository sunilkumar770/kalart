#!/usr/bin/env python3
"""KALART procedural art generator.

Renders original artwork (handloom weaves, block prints, pottery, jewelry,
madhubani-style paintings, lifestyle scenes, artisan portraits) with PIL and
exports optimized JPEGs to public/img/. All artwork is generated locally —
no external assets are fetched.
"""
import math
import os
import random
from PIL import Image, ImageDraw, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "img")
os.makedirs(OUT, exist_ok=True)

IVORY = "#F6F1E7"
STONE = "#EAE2D3"

PALETTES = {
    "indigo": ["#2B3A67", "#3E5488", "#8FA8C8", "#C9D5E4", "#1E2A4A"],
    "terracotta": ["#B45B3E", "#D98E63", "#EBC9A8", "#7A3B28", "#F3E3CF"],
    "burgundy": ["#6E2B3B", "#93404F", "#C08690", "#E4CBCB", "#4A1C28"],
    "forest": ["#31493C", "#4E6E58", "#8FAE8B", "#D0DFC5", "#1F3229"],
    "ochre": ["#B98A2F", "#D9B360", "#EBD9A8", "#7C5C1E", "#F2EAD2"],
}


def mix(a, b, t):
    def hx(c):
        c = c.lstrip("#")
        if len(c) == 3:
            c = "".join(ch * 2 for ch in c)
        return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))
    ca, cb = hx(a), hx(b)
    return "#%02X%02X%02X" % tuple(round(ca[i] + (cb[i] - ca[i]) * t) for i in range(3))


def canvas(w, h, bg):
    img = Image.new("RGB", (w, h), bg)
    return img, ImageDraw.Draw(img)


def add_grain(img, amount=14):
    """Subtle paper grain + vignette for a photographed-textile feel."""
    w, h = img.size
    noise = Image.effect_noise((w, h), amount).convert("L")
    gray = Image.merge("L", (noise,)).convert("RGB")
    img = Image.blend(img, gray, 0.05)
    vig = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(vig)
    d.ellipse((-w * 0.25, -h * 0.25, w * 1.25, h * 1.25), fill=255)
    vig = vig.filter(ImageFilter.GaussianBlur(min(w, h) // 8))
    dark = Image.new("RGB", (w, h), (30, 24, 18))
    img = Image.composite(img, dark, vig)
    return img


# ---------------------------------------------------------------- weaves
def ikat(colors, w=900, h=900, seed=0, cell=46):
    rng = random.Random(seed)
    img, d = canvas(w, h, IVORY)
    pal = colors
    xs = list(range(-cell, w + cell, cell))
    ys = list(range(-cell, h + cell, cell))
    for i, x in enumerate(xs):
        c = pal[i % len(pal)]
        for k in range(3):
            off = (k - 1) * 5
            dd = ImageDraw.Draw(img)
            dd.rectangle([x + off - cell / 2 + 1, 0, x + off + cell / 2 - 1, h],
                         fill=mix(c, IVORY, 0.15 * k))
    d = ImageDraw.Draw(img)
    for j, y in enumerate(ys):
        c = pal[(j + 1) % len(pal)]
        for i, x in enumerate(xs):
            if (i + j) % 2 == 0:
                s = cell * 0.42
                pts = [(x, y - s), (x + s, y), (x, y + s), (x - s, y)]
                d.polygon(pts, fill=mix(c, "#FFFFFF", 0.10), outline=mix(c, "#000000", 0.15))
    return add_grain(img)


def weave_plain(colors, w=900, h=900, seed=0, scale=26):
    rng = random.Random(seed)
    img, d = canvas(w, h, IVORY)
    a, b = colors[0], colors[2]
    for y in range(0, h, scale):
        for x in range(0, w, scale):
            over = ((x // scale) + (y // scale)) % 2 == 0
            c = mix(a if over else b, "#000000", rng.uniform(0.0, 0.06))
            d.rounded_rectangle([x + 1, y + 1, x + scale - 1, y + scale - 1], radius=3, fill=c)
    return add_grain(img)


def weave_stripes(colors, w=900, h=900, seed=1):
    rng = random.Random(seed)
    img, d = canvas(w, h, IVORY)
    x = 0
    while x < w:
        bw = rng.randint(14, 70)
        c = rng.choice(colors)
        d.rectangle([x, 0, x + bw, h], fill=c)
        for tx in range(x, x + bw, 4):
            d.line([tx, 0, tx, h], fill=mix(c, "#000000", 0.08), width=1)
        x += bw + 2
    gx = int(w * 0.72)
    d.rectangle([gx, 0, gx + 8, h], fill="#C9A24B")
    for gy in range(0, h, 12):
        d.line([gx, gy, gx + 8, gy + 6], fill=mix("#C9A24B", "#000", 0.25))
    return add_grain(img)


def weave_chevron(colors, w=900, h=900, seed=2):
    img, d = canvas(w, h, IVORY)
    step = 34
    for band, c in enumerate(colors * 3):
        off = band * step
        for x in range(-step, w + step, step):
            y0 = off + (0 if (x // step) % 2 == 0 else step // 2)
            d.polygon([(x, y0), (x + step / 2, y0 + step), (x, y0 + 2 * step),
                       (x - step / 2, y0 + step)], fill=c)
    img = img.crop((0, 0, w, h))
    return add_grain(img)


# ---------------------------------------------------------------- block print
def block_print(base, ink, accent, w=900, h=900, seed=3):
    rng = random.Random(seed)
    img, d = canvas(w, h, base)
    grid = 3
    cw, ch = w // grid, h // grid

    def paisley(cx, cy, s, rot):
        pts = []
        for i in range(61):
            t = i * math.pi * 2 / 60
            r = s * (1 + 0.5 * math.cos(t)) * math.sin(t / 2 + 0.35)
            pts.append((cx + r * math.cos(t + rot), cy + r * math.sin(t + rot) * 0.9))
        d.polygon(pts, outline=ink, fill=mix(ink, base, 0.82))
        d.ellipse([cx - s * .18, cy - s * .18, cx + s * .18, cy + s * .18], fill=accent)

    def flower(cx, cy, s):
        for k in range(8):
            ang = k * math.pi / 4
            px, py = cx + math.cos(ang) * s * .55, cy + math.sin(ang) * s * .55
            d.ellipse([px - s * .28, py - s * .28, px + s * .28, py + s * .28],
                      outline=ink, fill=mix(ink, base, 0.75))
        d.ellipse([cx - s * .2, cy - s * .2, cx + s * .2, cy + s * .2], fill=accent)

    def dots(cx, cy, s):
        for gx in range(-2, 3):
            for gy in range(-2, 3):
                d.ellipse([cx + gx * s / 3 - 3, cy + gy * s / 3 - 3,
                           cx + gx * s / 3 + 3, cy + gy * s / 3 + 3], fill=ink)

    for j in range(grid):
        for i in range(grid):
            cx, cy = i * cw + cw // 2, j * ch + ch // 2
            pick = (i + j) % 3
            if pick == 0:
                paisley(cx, cy, cw * 0.30, rng.uniform(0, 6.28))
            elif pick == 1:
                flower(cx, cy, cw * 0.30)
            else:
                dots(cx, cy, cw * 0.30)
    m = 26
    d.rectangle([m, m, w - m, h - m], outline=ink, width=3)
    d.rectangle([m + 8, m + 8, w - m - 8, h - m - 8], outline=ink, width=1)
    for x in range(m + 20, w - m - 10, 26):
        d.ellipse([x, m - 2, x + 6, m + 4], fill=accent)
    return add_grain(img)


# ---------------------------------------------------------------- pottery
def vessel(silhouette, body, deco, w=900, h=900, seed=5):
    img, d = canvas(w, h, STONE)
    cx = w // 2
    top, bot = int(h * 0.16), int(h * 0.86)
    prof = {
        "amphora": [(0.16, 0.0), (0.30, 0.06), (0.24, 0.16), (0.38, 0.34),
                    (0.46, 0.55), (0.40, 0.78), (0.30, 0.95), (0.30, 1.0)],
        "wide": [(0.22, 0.0), (0.22, 0.10), (0.44, 0.30), (0.50, 0.60),
                 (0.42, 0.88), (0.34, 1.0)],
        "tall": [(0.18, 0.0), (0.26, 0.05), (0.22, 0.12), (0.30, 0.30),
                 (0.34, 0.70), (0.26, 0.95), (0.26, 1.0)],
    }[silhouette]
    left, right = [], []
    for frac, yy in prof:
        y = top + (bot - top) * yy
        xoff = (w * 0.46) * frac * 2
        left.append((cx - xoff / 2, y))
        right.append((cx + xoff / 2, y))
    poly = left + list(reversed(right))
    d.polygon([(x + 10, y + 14) for x, y in poly], fill=mix(STONE, "#000000", 0.12))
    d.polygon(poly, fill=body)
    for i in range(60):
        t = i / 60
        c = mix(body, "#FFFFFF", 0.10 - t * 0.2) if t < .5 else mix(body, "#000000", (t - .5) * .3)
        d.line([cx - w * .24 + i * 3, top, cx - w * .24 + i * 3, bot], fill=c)
    for (fy0, fy1) in [(0.28, 0.34), (0.5, 0.58), (0.72, 0.76)]:
        y0 = top + (bot - top) * fy0
        y1 = top + (bot - top) * fy1
        d.rectangle([cx - w * .3, y0, cx + w * .3, y1], fill=deco)
        n = 14
        for k in range(n):
            x = cx - w * .3 + (w * .6) * (k + 0.5) / n
            d.ellipse([x - 5, (y0 + y1) / 2 - 5, x + 5, (y0 + y1) / 2 + 5],
                      fill=mix(deco, "#FFFFFF", 0.55))
        d.line([cx - w * .3, y0, cx + w * .3, y0], fill=mix(deco, "#000", 0.3), width=2)
    ry = top
    rx = (right[0][0] - left[0][0]) / 2
    d.ellipse([cx - rx, ry - 8, cx + rx, ry + 12], fill=mix(body, "#000000", 0.22))
    d.ellipse([cx - rx + 8, ry - 3, cx + rx - 8, ry + 7], fill=mix(body, "#000000", 0.45))
    return add_grain(img)


# ---------------------------------------------------------------- jewelry
def jewelry(w=900, h=900, seed=7):
    rng = random.Random(seed)
    img, d = canvas(w, h, "#241F26")
    gold = "#C9A24B"; gold_hi = "#EFD9A0"; gem = "#6E2B3B"; gem2 = "#2B3A67"
    cx, cy = w // 2, h // 2
    R = w * 0.36
    for a in range(0, 181, 2):
        rad = math.radians(a)
        x = cx + R * math.cos(rad)
        y = cy - R * 0.35 + R * math.sin(rad) * 0.8
        d.ellipse([x - 5, y - 5, x + 5, y + 5], fill=gold)
        d.ellipse([x - 3, y - 3, x + 2, y + 2], fill=gold_hi)
    py = cy - R * 0.35 + R * 0.8 + 30
    d.polygon([(cx, py), (cx + 46, py + 60), (cx, py + 130), (cx - 46, py + 60)],
              fill=gold, outline=gold_hi)
    d.polygon([(cx, py + 22), (cx + 26, py + 60), (cx, py + 100), (cx - 26, py + 60)], fill=gem)
    for gx, gy, gr, gc in [(cx, py + 60, 10, gem2), (cx - 60, py + 10, 7, gem2), (cx + 60, py + 10, 7, gem2)]:
        d.ellipse([gx - gr, gy - gr, gx + gr, gy + gr], fill=gc)
    for ex in (cx - 260, cx + 260):
        ey = cy + 190
        d.line([ex, ey - 40, ex, ey], fill=gold, width=4)
        d.ellipse([ex - 26, ey, ex + 26, ey + 52], outline=gold, width=5, fill=mix(gold, "#000", 0.25))
        d.ellipse([ex - 8, ey + 18, ex + 8, ey + 34], fill=gem)
    for _ in range(40):
        sx, sy = rng.randint(0, w), rng.randint(0, h)
        s = rng.randint(1, 2)
        d.line([sx - s, sy, sx + s, sy], fill="#FFF6DC")
        d.line([sx, sy - s, sx, sy + s], fill="#FFF6DC")
    return add_grain(img, 8)


# ---------------------------------------------------------------- footwear
def footwear(w=900, h=900, seed=9):
    img, d = canvas(w, h, "#EFE7DA")
    hide = "#8A5A3B"; hide_d = "#6B4226"; thread = "#E4C89B"; sole = "#4A3222"

    def jutti(fx, fy):
        pts = [(fx, fy), (fx + 210, fy - 20), (fx + 300, fy - 90),
               (fx + 250, fy - 150), (fx + 120, fy - 170),
               (fx + 20, fy - 120), (fx - 20, fy - 40)]
        d.polygon([(x, y + 26) for x, y in pts], fill=sole)
        d.polygon(pts, fill=hide, outline=hide_d)
        for i in range(len(pts)):
            x1, y1 = pts[i]; x2, y2 = pts[(i + 1) % len(pts)]
            for t in [k / 12 for k in range(12)]:
                px, py = x1 + (x2 - x1) * t, y1 + (y2 - y1) * t
                d.ellipse([px - 3, py - 3, px + 3, py + 3], fill=thread)
        tx, ty = fx + 300, fy - 90
        for rr in range(26, 4, -6):
            d.arc([tx - rr, ty - rr, tx + rr, ty + rr], 0, 360, fill=thread, width=3)
        d.ellipse([tx - 6, ty - 6, tx + 6, ty + 6], fill="#B45B3E")
    jutti(140, 620)
    jutti(430, 470)
    return add_grain(img)


# ---------------------------------------------------------------- brass lamp
def brass_lamp(w=900, h=900, seed=11):
    rng = random.Random(seed)
    img, d = canvas(w, h, "#2A2118")
    gold = "#C9A24B"; hi = "#F0DCA6"; lo = "#8A6A24"; flame = "#F6C453"
    cx = w // 2
    tiers = [(0.78, 300), (0.58, 230), (0.40, 160)]
    d.rectangle([cx - 120, 760, cx + 120, 790], fill=lo)
    d.rectangle([cx - 90, 730, cx + 90, 760], fill=gold)
    d.rectangle([cx - 14, 300, cx + 14, 730], fill=gold)
    d.rectangle([cx - 6, 300, cx + 2, 730], fill=hi)
    prev_y = 730
    for fy, fw in tiers:
        y = int(h * fy)
        d.polygon([(cx - fw, y), (cx + fw, y), (cx + fw - 30, y - 16), (cx - fw + 30, y - 16)],
                  fill=gold, outline=lo)
        d.rectangle([cx - 8, y - 16, cx + 8, prev_y], fill=gold)
        prev_y = y - 16
        for side in (-1, 1):
            ox = cx + side * (fw - 40)
            d.ellipse([ox - 22, y - 34, ox + 22, y - 18], fill=lo)
            d.ellipse([ox - 16, y - 32, ox + 16, y - 20], fill="#3A2E1E")
            d.polygon([(ox - 7, y - 26), (ox, y - 66), (ox + 7, y - 26)], fill=flame)
            d.polygon([(ox - 3, y - 28), (ox, y - 48), (ox + 3, y - 28)], fill="#FFF2CC")
    top_y = int(h * 0.40) - 40
    d.polygon([(cx - 10, top_y), (cx, top_y - 46), (cx + 10, top_y)], fill=hi)
    for _ in range(26):
        d.point((rng.randint(0, w), rng.randint(0, h)), fill="#FFE9B8")
    return add_grain(img, 8)


# ---------------------------------------------------------------- toys
def toys(w=900, h=900, seed=13):
    img, d = canvas(w, h, "#F1E9DB")
    ch = "#B45B3E"; ind = "#2B3A67"; och = "#D9B360"; grn = "#4E6E58"

    def toy(cx, cy, base_r, cols):
        y = cy
        for i, c in enumerate(cols):
            r = base_r * (1 - i * 0.16)
            d.ellipse([cx - r, y - 2 * r, cx + r, y], fill=c)
            d.arc([cx - r, y - 2 * r, cx + r, y], 200, 340, fill=mix(c, "#FFF", .45), width=3)
            y -= r * 1.5
        d.rectangle([cx - 3, cy - 6, cx + 3, cy + 40], fill="#7A5A38")
        d.ellipse([cx - base_r * 1.1, cy + 34, cx + base_r * 1.1, cy + 62], fill="#7A5A38")
    toy(230, 640, 70, [ch, och, ind, ch, grn])
    toy(560, 700, 52, [ind, grn, och, ch])
    ex, ey = 640, 420
    d.ellipse([ex - 110, ey - 90, ex + 110, ey + 60], fill=grn)
    d.ellipse([ex - 150, ey - 120, ex - 30, ey + 10], fill=mix(grn, "#FFF", .15))
    d.arc([ex - 190, ey - 60, ex - 60, ey + 90], 90, 270, fill=mix(grn, "#FFF", .15), width=26)
    d.ellipse([ex - 120, ey - 90, ex - 70, ey - 40], fill=mix(ch, "#FFF", .3))
    for lx in (ex - 60, ex + 40):
        d.rectangle([lx - 12, ey + 30, lx + 12, ey + 90], fill=mix(grn, "#000", .2))
    d.ellipse([ex + 60, ey - 60, ex + 100, ey - 20], fill=mix(ind, "#FFF", .5))
    return add_grain(img)


# ---------------------------------------------------------------- baskets
def baskets(w=900, h=900, seed=15):
    img, d = canvas(w, h, "#EDE4D2")
    tones = ["#A8794A", "#C39A6B", "#8A5A3B", "#D9BE94"]

    def basket(cx, cy, rw, rh, pattern):
        d.ellipse([cx - rw, cy, cx + rw, cy + rh * 1.4], fill=mix(tones[2], "#000", .1))
        rows = 9
        for r in range(rows):
            t = r / rows
            y = cy + rh * 1.3 * t
            wr = rw * (1 - 0.55 * t)
            c = tones[r % 2] if pattern == "stripe" else (tones[(r // 2) % 2] if pattern == "check" else mix(tones[1], "#000", .08))
            d.ellipse([cx - wr, y - 8, cx + wr, y + 12], fill=c)
            for k in range(14):
                xx = cx - wr + (2 * wr) * k / 14
                d.line([xx, y - 6, xx + 6, y + 10], fill=mix(c, "#000", .18))
        d.ellipse([cx - rw, cy - 16, cx + rw, cy + 14], outline=mix(tones[0], "#000", .25), width=5)
        d.arc([cx - rw * .8, cy - rh * 1.1, cx + rw * .8, cy + 10], 180, 360,
              fill=mix(tones[0], "#000", .1), width=9)
    basket(260, 300, 150, 130, "stripe")
    basket(620, 420, 120, 110, "check")
    basket(430, 600, 170, 150, "plain")
    return add_grain(img)


# ---------------------------------------------------------------- wall hanging
def wall_hanging(w=900, h=900, seed=17):
    img, d = canvas(w, h, "#E9DFCB")
    ind = "#2B3A67"; terra = "#B45B3E"; cream = "#F6F1E7"; och = "#D9B360"
    d.rectangle([120, 90, 780, 104], fill="#6B4A2C")
    d.ellipse([108, 84, 132, 110], fill="#54381F"); d.ellipse([768, 84, 792, 110], fill="#54381F")
    px0, px1, py0, py1 = 170, 730, 104, 760
    d.rectangle([px0, py0, px1, py1], fill=ind)
    for fold_x in range(px0, px1, 40):
        sh = mix(ind, "#000", 0.12) if (fold_x // 40) % 2 else mix(ind, "#FFF", 0.08)
        d.polygon([(fold_x, py0), (fold_x + 40, py0), (fold_x + 46, py1), (fold_x + 34, py1)], fill=sh)
    cx, cy, R = (px0 + px1) // 2, (py0 + py1) // 2 - 20, 150
    for ring, c in [(R, cream), (R * .78, och), (R * .55, terra), (R * .3, cream)]:
        d.ellipse([cx - ring, cy - ring, cx + ring, cy + ring], outline=c, width=4)
    for k in range(16):
        a = k * math.tau / 16
        x1, y1 = cx + math.cos(a) * R * .78, cy + math.sin(a) * R * .78
        x2, y2 = cx + math.cos(a) * R * 1.12, cy + math.sin(a) * R * 1.12
        xm, ym = (x1 + x2) / 2 + math.cos(a + .3) * 14, (y1 + y2) / 2 + math.sin(a + .3) * 14
        d.polygon([(x1, y1), (xm, ym), (x2, y2)], fill=cream)
        d.line([cx, cy, x1, y1], fill=mix(cream, ind, .4), width=1)
    d.ellipse([cx - 18, cy - 18, cx + 18, cy + 18], fill=terra)
    for tx in range(px0 + 10, px1, 26):
        d.line([tx, py1, tx, py1 + 46], fill=och, width=3)
        d.ellipse([tx - 4, py1 + 42, tx + 4, py1 + 52], fill=terra)
    return add_grain(img)


# ---------------------------------------------------------------- painting
def painting(w=900, h=900, seed=19):
    img, d = canvas(w, h, "#F3E7CE")
    terra = "#B45B3E"; och = "#C9822B"; ind = "#2B3A67"; blk = "#241B14"; cream = "#F6F1E7"
    for x in range(40, w - 40, 60):
        for (yy, up) in [(60, True), (h - 60, False)]:
            d.line([x, yy, x, yy - 18 if up else yy + 18], fill=blk, width=3)
            d.ellipse([x - 5, yy - 26 if up else yy + 12, x + 5, yy - 16 if up else yy + 22], fill=blk)
    d.ellipse([w // 2 - 90, 110, w // 2 + 90, 290], fill=terra, outline=blk, width=4)
    for k in range(12):
        a = k * math.tau / 12
        x1 = w // 2 + math.cos(a) * 100; y1 = 200 + math.sin(a) * 100
        x2 = w // 2 + math.cos(a) * 135; y2 = 200 + math.sin(a) * 135
        d.line([x1, y1, x2, y2], fill=terra, width=6)
    d.ellipse([w // 2 - 34, 165, w // 2 - 10, 195], fill=cream)
    d.ellipse([w // 2 + 10, 165, w // 2 + 34, 195], fill=cream)
    d.ellipse([w // 2 - 28, 175, w // 2 - 16, 189], fill=blk)
    d.ellipse([w // 2 + 16, 175, w // 2 + 28, 189], fill=blk)
    d.arc([w // 2 - 40, 210, w // 2 + 40, 260], 20, 160, fill=blk, width=4)

    def fish(cx, cy, s, c):
        d.polygon([(cx - s, cy), (cx + s * .6, cy - s * .55), (cx + s, cy), (cx + s * .6, cy + s * .55)],
                  fill=c, outline=blk)
        d.polygon([(cx + s, cy), (cx + s * 1.4, cy - s * .4), (cx + s * 1.4, cy + s * .4)], fill=c, outline=blk)
        d.ellipse([cx - s * .5, cy - 6, cx - s * .3, cy + 6], fill=blk)
        for k in range(4):
            d.arc([cx - s + k * s * .35, cy - s * .4, cx - s * .2 + k * s * .35, cy + s * .4], 0, 360, fill=blk, width=2)
    fish(260, 470, 110, ind)
    fish(640, 500, 90, och)
    cx, cy = w // 2, 720
    for k in range(9):
        a = math.pi + k * math.pi / 8
        px, py = cx + math.cos(a) * 120, cy + math.sin(a) * 60
        d.polygon([(cx, cy), (px, py - 30), (px + 30, py)], fill=terra, outline=blk)
    d.ellipse([cx - 26, cy - 40, cx + 26, cy], fill=och, outline=blk)
    return add_grain(img)


# ---------------------------------------------------------------- decor showpiece
def decor(w=900, h=900, seed=21):
    img, d = canvas(w, h, "#E7DECD")
    terra = "#B45B3E"
    ex, ey = 450, 560
    body = "#7A4A2B"; dark = "#5A3218"; light = "#9A6A40"
    d.ellipse([ex - 240, ey - 200, ex + 200, ey + 40], fill=body)
    d.ellipse([ex + 60, ey - 260, ex + 260, ey - 40], fill=mix(body, "#FFF", .08))
    d.arc([ex + 120, ey - 160, ex + 300, ey + 120], 90, 260, fill=light, width=34)
    d.rectangle([ex - 160, ey + 20, ex - 100, ey + 160], fill=dark)
    d.rectangle([ex + 20, ey + 20, ex + 80, ey + 160], fill=dark)
    d.rectangle([ex - 60, ey + 30, ex - 10, ey + 150], fill=body)
    d.rectangle([ex + 100, ey + 10, ex + 150, ey + 140], fill=body)
    for k in range(6):
        d.arc([ex - 240 + k * 20, ey - 200 + k * 12, ex + 200 - k * 20, ey + 40 - k * 6], 180, 360, fill=dark, width=3)
    d.ellipse([ex + 140, ey - 190, ex + 170, ey - 160], fill="#241B14")
    for rr in range(70, 20, -14):
        d.arc([ex + 100 - rr / 2, ey - 180 - rr / 2, ex + 100 + rr / 2 * 3, ey - 180 + rr / 2 * 3], 0, 360, fill=terra, width=3)
    d.rectangle([ex - 280, ey + 160, ex + 280, ey + 210], fill="#5A3218")
    d.rectangle([ex - 280, ey + 150, ex + 280, ey + 168], fill="#9A6A40")
    return add_grain(img)


# ---------------------------------------------------------------- hero scene
def hero_scene(w=1400, h=1000, seed=23):
    img, d = canvas(w, h, "#F2E9D8")
    ax0, ay0, ax1, ay1 = w * .30, h * .06, w * .72, h * .96
    d.rounded_rectangle([ax0, ay0, ax1, ay1], radius=int(w * .21), fill="#E4D3B8")
    d.rounded_rectangle([ax0 + 16, ay0 + 16, ax1 - 16, ay1 - 16], radius=int(w * .2), outline="#C9A24B", width=3)
    d.rectangle([0, h * .82, w, h], fill="#DCCBAE")
    d.line([0, h * .82, w, h * .82], fill="#C4B08C", width=3)
    skin = "#8A5A3B"; hair = "#241B14"
    sari_ind = "#2B3A67"; sari_terra = "#B45B3E"; gold = "#C9A24B"
    cx = w * .51
    flow = [(cx - 240, h * .30), (cx - 60, h * .26), (cx + 190, h * .34),
            (cx + 300, h * .62), (cx + 240, h * .9), (cx + 40, h * .78),
            (cx - 180, h * .66), (cx - 260, h * .46)]
    d.polygon(flow, fill=sari_terra)
    for i in range(6):
        t = i / 5
        d.line([cx - 240 + t * 200, h * .32 + t * 60, cx + 280 - t * 60, h * .5 + t * 80],
               fill=mix(sari_terra, "#FFF", .3), width=4)
    d.polygon([(cx - 90, h * .92), (cx - 70, h * .5), (cx - 30, h * .38),
               (cx + 40, h * .38), (cx + 80, h * .52), (cx + 100, h * .92)], fill=sari_ind)
    for k in range(8):
        yy = h * .45 + k * h * .06
        d.line([cx - 85, yy, cx + 95, yy + 10], fill=mix(sari_ind, "#FFF", .16), width=3)
    d.rectangle([cx - 90, h * .88, cx + 100, h * .92], fill=gold)
    hy = h * .30
    d.ellipse([cx - 46, hy - 60, cx + 46, hy + 50], fill=skin)
    d.pieslice([cx - 52, hy - 74, cx + 52, hy + 20], 180, 360, fill=hair)
    d.ellipse([cx + 60, hy - 40, cx + 130, hy + 120], fill=hair)
    for by in range(int(hy - 20), int(hy + 110), 22):
        d.arc([cx + 56, by - 12, cx + 134, by + 12], 0, 180, fill=mix(hair, "#FFF", .18), width=3)
    d.ellipse([cx + 88, hy - 52, cx + 112, hy - 28], fill=gold)
    d.line([cx + 40, h * .44, cx + 120, h * .60], fill=skin, width=26)
    d.line([cx + 120, h * .60, cx + 150, h * .74], fill=skin, width=22)
    d.ellipse([cx + 140, h * .73, cx + 168, h * .78], fill=skin)
    d.line([cx - 60, h * .44, cx - 130, h * .58], fill=skin, width=26)
    d.ellipse([cx - 150, h * .56, cx - 120, h * .62], fill=skin)
    for bx in range(3):
        d.ellipse([cx + 118 + bx * 8, h * .60, cx + 138 + bx * 8, h * .64], outline=gold, width=3)
    dx, dy = cx - 260, h * .86
    d.ellipse([dx - 46, dy - 12, dx + 46, dy + 18], fill="#7A3B28")
    d.ellipse([dx - 34, dy - 10, dx + 34, dy + 8], fill="#9A5A40")
    d.polygon([(dx - 8, dy - 12), (dx, dy - 54), (dx + 8, dy - 12)], fill="#F6C453")
    d.polygon([(dx - 3, dy - 14), (dx, dy - 36), (dx + 3, dy - 14)], fill="#FFF2CC")
    for hx_ in (w * .12, w * .88):
        d.line([hx_, 0, hx_, h * .28], fill="#8A6A24", width=3)
        d.polygon([(hx_ - 34, h * .30), (hx_ + 34, h * .30), (hx_ + 20, h * .24), (hx_ - 20, h * .24)], fill=gold)
        d.ellipse([hx_ - 10, h * .30, hx_ + 10, h * .34], fill="#F6C453")
    rx, ry = w * .14, h * .78
    for k in range(10):
        a = k * math.tau / 10
        d.ellipse([rx + math.cos(a) * 60 - 6, ry + math.sin(a) * 24 - 6,
                   rx + math.cos(a) * 60 + 6, ry + math.sin(a) * 24 + 6], fill=sari_terra)
    return add_grain(img, 10)


# ---------------------------------------------------------------- portraits
def portrait(craft, w=800, h=800, seed=30):
    bg = ["#E8DCC4", "#E2D2B8", "#DED0BC", "#E6DAC8"][seed % 4]
    img, d = canvas(w, h, bg)
    skin = ["#8A5A3B", "#7A4A2E", "#9A6A45", "#6E4326"][seed % 4]
    cloth = PALETTES[["indigo", "terracotta", "burgundy", "forest"][seed % 4]][0]
    cx, cy = w // 2, int(h * .42)
    d.ellipse([cx - 250, cy - 250, cx + 250, cy + 250], fill=mix(bg, "#FFF", .35))
    d.pieslice([cx - 240, cy + 40, cx + 240, cy + 560], 180, 360, fill=cloth)
    d.line([cx - 120, cy + 120, cx + 120, cy + 60], fill=mix(cloth, "#FFF", .3), width=10)
    d.rectangle([cx - 34, cy + 20, cx + 34, cy + 90], fill=skin)
    d.ellipse([cx - 92, cy - 110, cx + 92, cy + 70], fill=skin)
    style = seed % 3
    if style == 0:
        d.pieslice([cx - 100, cy - 130, cx + 100, cy + 30], 160, 380, fill="#241B14")
        d.ellipse([cx + 84, cy - 60, cx + 130, cy + 10], fill="#241B14")
    elif style == 1:
        d.pieslice([cx - 104, cy - 134, cx + 104, cy + 40], 150, 390, fill="#2B2B2B")
        d.rectangle([cx - 104, cy - 40, cx - 78, cy + 60], fill="#2B2B2B")
        d.rectangle([cx + 78, cy - 40, cx + 104, cy + 60], fill="#2B2B2B")
    else:
        d.pieslice([cx - 98, cy - 126, cx + 98, cy + 10], 170, 370, fill="#241B14")
    d.line([cx - 40, cy - 20, cx - 14, cy - 22], fill="#241B14", width=4)
    d.line([cx + 14, cy - 22, cx + 40, cy - 20], fill="#241B14", width=4)
    d.ellipse([cx - 34, cy - 14, cx - 18, cy - 2], fill="#FFF")
    d.ellipse([cx + 18, cy - 14, cx + 34, cy - 2], fill="#FFF")
    d.ellipse([cx - 29, cy - 11, cx - 22, cy - 4], fill="#241B14")
    d.ellipse([cx + 22, cy - 11, cx + 29, cy - 4], fill="#241B14")
    d.arc([cx - 12, cy + 4, cx + 12, cy + 26], 40, 140, fill=mix(skin, "#000", .25), width=3)
    d.arc([cx - 22, cy + 24, cx + 22, cy + 52], 20, 160, fill=mix(skin, "#000", .3), width=4)
    if seed % 2 == 0:
        d.ellipse([cx - 6, cy - 40, cx + 6, cy - 28], fill="#B45B3E")
    if craft == "weave":
        d.rectangle([cx - 210, cy + 220, cx + 210, cy + 250], fill="#7A5A38")
        for tx in range(-200, 210, 18):
            d.line([cx + tx, cy + 250, cx + tx, cy + 330], fill="#C9A24B", width=3)
    elif craft == "pottery":
        d.ellipse([cx + 120, cy + 240, cx + 260, cy + 330], fill="#9A5A40")
        d.ellipse([cx + 150, cy + 260, cx + 230, cy + 310], fill="#6B4226")
    elif craft == "paint":
        d.rectangle([cx - 250, cy + 230, cx + 60, cy + 330], fill="#F3E7CE", outline="#7A5A38", width=6)
        d.ellipse([cx - 160, cy + 260, cx - 100, cy + 300], fill="#B45B3E")
        d.line([cx + 80, cy + 330, cx + 150, cy + 240], fill="#7A5A38", width=10)
        d.polygon([(cx + 150, cy + 240), (cx + 168, cy + 222), (cx + 176, cy + 246)], fill="#2B3A67")
    else:
        d.ellipse([cx + 130, cy + 250, cx + 210, cy + 330], fill="#C9A24B")
        d.ellipse([cx + 148, cy + 264, cx + 192, cy + 312], fill="#8A6A24")
    return add_grain(img, 10)


# ---------------------------------------------------------------- lifestyle
def lifestyle_table(w=900, h=900, seed=40):
    img, d = canvas(w, h, "#E9DFCB")
    d.ellipse([80, 80, 820, 820], fill="#DCCBAE")
    d.ellipse([110, 110, 790, 790], outline="#C4B08C", width=3)
    ind = "#2B3A67"; terra = "#B45B3E"; cream = "#F6F1E7"; gold = "#C9A24B"
    for y in range(220, 680, 16):
        d.rectangle([180, y, 720, y + 10], fill=ind if (y // 16) % 2 else mix(ind, "#FFF", .2))
    d.ellipse([300, 300, 600, 600], fill=cream, outline=mix(cream, "#000", .15), width=3)
    d.ellipse([340, 340, 560, 560], outline=gold, width=3)
    for k in range(12):
        a = k * math.tau / 12
        d.ellipse([450 + math.cos(a) * 120 - 6, 450 + math.sin(a) * 120 - 6,
                   450 + math.cos(a) * 120 + 6, 450 + math.sin(a) * 120 + 6], fill=terra)
    d.ellipse([620, 200, 780, 360], fill=terra, outline=mix(terra, "#000", .2), width=3)
    d.ellipse([645, 225, 755, 335], fill=mix(terra, "#000", .28))
    for (ux, uy) in [(210, 700), (300, 730)]:
        d.ellipse([ux, uy, ux + 70, uy + 50], fill="#D9BE94", outline="#8A5A3B", width=3)
        d.ellipse([ux + 12, uy + 10, ux + 58, uy + 40], fill="#6B4226")
    return add_grain(img)


def lifestyle_bedding(w=900, h=900, seed=41):
    img, d = canvas(w, h, "#EFE6D4")
    ind = "#2B3A67"; cream = "#F6F1E7"; terra = "#B45B3E"; och = "#D9B360"
    layers = [(mix(ind, "#FFF", .08), ind), (cream, mix(cream, "#000", .1)), (mix(och, "#000", .1), och)]
    y = 700
    for i in range(5):
        c, o = layers[i % 3]
        d.polygon([(140 + i * 8, y), (760 - i * 6, y - 24), (760 - i * 6, y - 96), (140 + i * 8, y - 70)],
                  fill=c, outline=o)
        for lx in range(160, 740, 26):
            d.line([lx, y - 78 + (lx % 3), lx + 12, y - 12], fill=mix(c, "#000", .12))
        y -= 78
    d.ellipse([300, 300, 600, 430], fill=mix(ind, "#FFF", .1))
    for k in range(6):
        d.arc([330 + k * 40, 320, 410 + k * 40, 410], 0, 360, fill=terra, width=4)
    return add_grain(img)


def lifestyle_bag(w=900, h=900, seed=42):
    img, d = canvas(w, h, "#E4DAC6")
    base = "#31493C"; flap = "#4E6E58"; thread = "#D9B360"; buckle = "#C9A24B"
    cx = w // 2
    d.rounded_rectangle([cx - 220, 300, cx + 220, 720], radius=26, fill=base)
    d.polygon([(cx - 220, 300), (cx + 220, 300), (cx + 200, 460), (cx - 200, 460)], fill=flap)
    for row in range(4):
        yy = 500 + row * 44
        for k in range(12):
            xx = cx - 190 + k * 34
            d.polygon([(xx, yy), (xx + 17, yy + 20), (xx, yy + 40), (xx - 17, yy + 20)],
                      outline=thread, fill=mix(base, "#FFF", .06))
    d.arc([cx - 260, 60, cx + 260, 560], 200, 340, fill=base, width=26)
    d.rounded_rectangle([cx - 30, 430, cx + 30, 490], radius=8, fill=buckle)
    d.rounded_rectangle([cx - 14, 444, cx + 14, 476], radius=6, fill=mix(buckle, "#000", .35))
    return add_grain(img)


CATEGORY_ART = {
    "textiles": lambda: weave_stripes(PALETTES["indigo"], 600, 600, seed=101),
    "block-print": lambda: block_print("#F3E3CF", "#6E2B3B", "#C9822B", seed=102),
    "pottery": lambda: vessel("wide", "#B45B3E", "#F3E3CF", 600, 600, 103),
    "jewelry": lambda: jewelry(600, 600, 104),
    "footwear": lambda: footwear(600, 600, 105),
    "home-decor": lambda: decor(600, 600, 106),
    "paintings": lambda: painting(600, 600, 107),
    "toys": lambda: toys(600, 600, 108),
    "baskets": lambda: baskets(600, 600, 109),
    "lamps": lambda: brass_lamp(600, 600, 110),
}

PRODUCT_ART = {
    "ikat-shawl": lambda: ikat(PALETTES["indigo"], seed=201),
    "durable-mat": lambda: weave_plain(PALETTES["forest"], seed=202, scale=30),
    "soft-throw": lambda: weave_chevron(PALETTES["terracotta"], seed=203),
    "table-runner": lambda: weave_stripes(PALETTES["burgundy"], seed=204),
    "bed-sheet": lambda: weave_plain(PALETTES["ochre"], seed=205, scale=22),
    "kurta-fabric": lambda: block_print("#F6F1E7", "#2B3A67", "#B45B3E", seed=206),
    "cushion-set": lambda: block_print("#EAE2D3", "#6E2B3B", "#C9A24B", seed=207),
    "curtain-pair": lambda: weave_chevron(PALETTES["indigo"], seed=208),
    "vase": lambda: vessel("amphora", "#B45B3E", "#F3E3CF", seed=209),
    "water-jug": lambda: vessel("tall", "#7A3B28", "#D98E63", seed=210),
    "tea-set": lambda: vessel("wide", "#93404F", "#E4CBCB", seed=211),
    "necklace": lambda: jewelry(seed=212),
    "jhumkas": lambda: jewelry(seed=213),
    "bangles": lambda: jewelry(seed=214),
    "jutti-pair": lambda: footwear(seed=215),
    "bag": lambda: lifestyle_bag(seed=216),
    "wall-piece": lambda: wall_hanging(seed=217),
    "showpiece": lambda: decor(seed=218),
    "placemats": lambda: lifestyle_table(seed=219),
    "diya-set": lambda: brass_lamp(seed=220),
    "floor-lamp": lambda: brass_lamp(seed=221),
    "lacquer-toys": lambda: toys(seed=222),
    "elephant-toy": lambda: toys(seed=223),
    "storage-basket": lambda: baskets(seed=224),
    "market-bag": lambda: baskets(seed=225),
    "pashua-painting": lambda: painting(seed=226),
    "mural-canvas": lambda: painting(seed=227),
}

PORTRAITS = {
    "ravi": ("weave", 30), "meera": ("paint", 31), "arjun": ("pottery", 32),
    "lakshmi": ("weave", 33), "farhan": ("other", 34), "divya": ("paint", 35),
    "shankar": ("pottery", 36), "zoya": ("other", 37),
}


def save(img, name, q=82):
    path = os.path.join(OUT, name + ".jpg")
    img.save(path, "JPEG", quality=q, optimize=True, progressive=True)
    print(f"{name}.jpg {img.size[0]}x{img.size[1]} {os.path.getsize(path)//1024}KB")


def main():
    for key, fn in CATEGORY_ART.items():
        save(fn(), "cat-" + key, q=80)
    for key, fn in PRODUCT_ART.items():
        save(fn(), "p-" + key, q=82)
    for key, (craft, seed) in PORTRAITS.items():
        save(portrait(craft, seed=seed), "artisan-" + key, q=80)
    save(hero_scene(), "hero-main", q=84)
    save(lifestyle_table(900, 900, 43), "story-table", q=80)
    save(lifestyle_bedding(900, 900, 44), "story-bedding", q=80)
    save(block_print("#EAE2D3", "#2B3A67", "#B45B3E", seed=45), "story-print", q=80)
    save(wall_hanging(900, 900, 46), "story-decor", q=80)
    save(portrait("weave", 800, 800, 47), "story-workshop", q=80)


if __name__ == "__main__":
    main()
