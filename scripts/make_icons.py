"""PWA 用アイコンを作る（仮の形象のドット絵）。形象が決まったら作り直す。
使い方: python3 scripts/make_icons.py
"""
from PIL import Image, ImageDraw

BODY = [
    "....BBBB....",
    "..BBBBBBBB..",
    ".BBWBBBBBBB.",
    ".BBBBBBBBBB.",
    "BBBEBBBBEBBB",
    "BBBEBBBBEBBB",
    "BBBBBBBBBBBB",
    "BBCBBEEBBCBB",
    ".BBBBBBBBBB.",
    ".BBBBBBBBBB.",
    "..BBBBBBBB..",
    "...BB..BB...",
]
COLORS = {"B": (165, 180, 252), "W": (255, 255, 255), "E": (30, 41, 59), "C": (253, 164, 175)}
TOP, BOTTOM = (253, 242, 248), (224, 231, 255)


def icon(size: int, path: str) -> None:
    img = Image.new("RGB", (size, size))
    d = ImageDraw.Draw(img)
    for y in range(size):  # 縦のグラデーション
        t = y / (size - 1)
        d.line([(0, y), (size, y)], fill=tuple(round(a + (b - a) * t) for a, b in zip(TOP, BOTTOM)))
    cell = size * 0.6 / 12  # 形象はアイコンの 60%（マスク可能アイコンの安全領域に収める）
    off = (size - cell * 12) / 2
    for y, row in enumerate(BODY):
        for x, ch in enumerate(row):
            if ch == ".":
                continue
            x0, y0 = off + x * cell, off + y * cell
            d.rectangle([round(x0), round(y0), round(x0 + cell) - 1, round(y0 + cell) - 1], fill=COLORS[ch])
    img.save(path)


for size, name in [(192, "icon-192.png"), (512, "icon-512.png"), (180, "apple-touch-icon.png"), (32, "favicon.png")]:
    icon(size, f"public/{name}")
print("ok")
