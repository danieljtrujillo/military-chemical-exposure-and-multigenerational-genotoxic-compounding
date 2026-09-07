#!/usr/bin/env python3
"""Generate the raster assets the site and repo need.

Everything here is derived from one palette so the social card, the icons and
the README banner stay in step. Run after changing PALETTE or the title:

    python tools/make_assets.py

Requires Pillow. Nothing in the shipped site depends on it.
"""
from __future__ import annotations

import math
import os
import random
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")

# --- Palette ---------------------------------------------------------------
INK      = (11, 11, 12)
INK_SOFT = (24, 24, 27)
PAPER    = (244, 241, 234)
GREY     = (139, 138, 133)
GREY_DIM = (94, 93, 89)
ORANGE   = (232, 98, 42)

FONTS = "C:/Windows/Fonts"


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    for candidate in (os.path.join(FONTS, name), name):
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    return ImageFont.load_default()


def semibold(size): return font("segoeuisl.ttf", size)
def bold(size):     return font("segoeuib.ttf", size)
def regular(size):  return font("segoeui.ttf", size)
def light(size):    return font("segoeuil.ttf", size)
def mono(size):     return font("consola.ttf", size)


def network(draw: ImageDraw.ImageDraw, cx, cy, radius, seed=7, n=16):
    """A small abstract node graph — the visual signature of the project."""
    rng = random.Random(seed)
    pts = []
    for i in range(n):
        angle = (i / n) * math.tau + rng.uniform(-0.16, 0.16)
        dist = radius * rng.uniform(0.34, 1.0)
        pts.append((cx + math.cos(angle) * dist, cy + math.sin(angle) * dist * 0.9))

    for i, a in enumerate(pts):
        for j in range(i + 1, len(pts)):
            b = pts[j]
            if math.dist(a, b) < radius * 0.62:
                draw.line([a, b], fill=(*GREY_DIM, 90), width=1)

    for i, (x, y) in enumerate(pts):
        r = 3 + (i % 4)
        hot = i % 5 == 0
        colour = ORANGE if hot else GREY
        draw.ellipse([x - r, y - r, x + r, y + r], fill=(*colour, 235))
        if hot:
            draw.ellipse([x - r - 4, y - r - 4, x + r + 4, y + r + 4],
                         outline=(*ORANGE, 70), width=1)


def make_og(path: str, w=1200, h=630):
    img = Image.new("RGB", (w, h), INK)
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    for y in range(h):  # faint vertical lift
        d.line([(0, y), (w, y)], fill=(*INK_SOFT, int(70 * (1 - y / h))))

    network(d, int(w * 0.795), int(h * 0.5), 210)
    img = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")

    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 6, h], fill=ORANGE)

    x = 84
    d.text((x, 128), "EVIDENCE MAP", font=semibold(19), fill=ORANGE)
    d.text((x, 178), "Military toxic exposure", font=bold(58), fill=PAPER)
    d.text((x, 246), "and heritable disease", font=bold(58), fill=PAPER)
    d.line([(x, 336), (x + 62, 336)], fill=ORANGE, width=3)
    d.text((x, 366), "Six toxicants. Fifteen conditions.", font=light(30), fill=GREY)
    d.text((x, 406), "Three generations. One gene pool.", font=light(30), fill=GREY)

    chips = ["Agent Orange", "Cr(VI)", "Perchlorate", "Radiation", "Hydrazine"]
    cx = x
    for label in chips:
        f = regular(17)
        tw = d.textlength(label, font=f)
        d.rounded_rectangle([cx, 484, cx + tw + 26, 518], radius=17,
                            outline=(58, 57, 55), width=1)
        d.text((cx + 13, 492), label, font=f, fill=GREY)
        cx += tw + 36

    d.text((x, 556), "GANTASMO", font=semibold(15), fill=GREY_DIM)
    img.save(path, "PNG", optimize=True)
    print("wrote", path)


def make_icon(path: str, size: int, pad_ratio=0.0):
    ss = 8
    s = size * ss
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = int(s * 0.22)
    d.rounded_rectangle([0, 0, s, s], radius=r, fill=INK)

    pad = s * (0.22 + pad_ratio)
    # Three nodes and their links: the multi-hit model, reduced to a glyph.
    top = (s / 2, pad)
    left = (pad, s - pad)
    right = (s - pad, s - pad)
    d.line([top, left], fill=GREY_DIM, width=max(1, int(s * 0.035)))
    d.line([top, right], fill=GREY_DIM, width=max(1, int(s * 0.035)))
    d.line([left, right], fill=GREY_DIM, width=max(1, int(s * 0.035)))

    nr = s * 0.115
    for pt, colour in ((top, ORANGE), (left, PAPER), (right, PAPER)):
        d.ellipse([pt[0] - nr, pt[1] - nr, pt[0] + nr, pt[1] + nr], fill=colour)

    img.resize((size, size), Image.LANCZOS).save(path, "PNG", optimize=True)
    print("wrote", path)


def make_banner(path: str, w=1280, h=340, scale=2):
    """The README banner. Rendered at 2x and downsampled so it stays crisp
    on high-density displays without relying on the viewer having any font."""
    W, H = w * scale, h * scale
    img = Image.new("RGB", (W, H), INK)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    for y in range(H):
        d.line([(0, y), (W, y)], fill=(*INK_SOFT, int(85 * (1 - y / H))))

    network(d, int(W * 0.815), int(H * 0.5), int(128 * scale), seed=19, n=15)
    img = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")

    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, 7 * scale, H], fill=ORANGE)

    x = 64 * scale
    d.text((x, 64 * scale), "EVIDENCE MAP  /  OPEN RESEARCH", font=semibold(15 * scale), fill=ORANGE)
    d.text((x, 104 * scale), "Multigenerational", font=bold(46 * scale), fill=PAPER)
    d.text((x, 158 * scale), "genotoxic compounding", font=bold(46 * scale), fill=PAPER)
    d.line([(x, 232 * scale), (x + 52 * scale, 232 * scale)], fill=ORANGE, width=3 * scale)
    d.text((x, 252 * scale), "Military toxicant exposure and heritable disease across generations",
           font=light(20 * scale), fill=GREY)

    img.resize((w, h), Image.LANCZOS).save(path, "PNG", optimize=True)
    print("wrote", path)


if __name__ == "__main__":
    make_og(os.path.join(SRC, "og-image.png"))
    make_icon(os.path.join(SRC, "apple-touch-icon.png"), 180)
    make_icon(os.path.join(SRC, "icon-192.png"), 192)
    make_icon(os.path.join(SRC, "icon-512.png"), 512)
    make_banner(os.path.join(ROOT, ".github", "assets", "banner.png"))
