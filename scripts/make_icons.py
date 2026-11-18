"""PWA 用アイコンを作る：夕方の空のグラデーション + ねこ（public/avatar/lv1_normal.png）。
使い方: python3 scripts/make_icons.py
"""
from PIL import Image, ImageDraw

SKY = [(0xBC, 0xA9, 0xE3), (0xEB, 0xBA, 0xD6), (0xFC, 0xE0, 0xDE)]  # 夕方の空（上 → 下）
cat = Image.open("public/avatar/lv1_normal.png").convert("RGBA")  # 32×32


def lerp(a, b, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(a, b))


def icon(size: int, path: str) -> None:
    img = Image.new("RGBA", (size, size))
    d = ImageDraw.Draw(img)
    for y in range(size):
        t = y / (size - 1)
        c = lerp(SKY[0], SKY[1], t * 2) if t < 0.5 else lerp(SKY[1], SKY[2], t * 2 - 1)
        d.line([(0, y), (size, y)], fill=c + (255,))
    # ねこはアイコンの約 62%（マスク可能アイコンの安全領域に収める）。整数倍で拡大してドットをくっきり
    scale = max(1, round(size * 0.62 / 32))
    big = cat.resize((32 * scale, 32 * scale), Image.NEAREST)
    off = ((size - big.width) // 2, (size - big.height) // 2)
    img.alpha_composite(big, off)
    img.convert("RGB").save(path)


for size, name in [(192, "icon-192.png"), (512, "icon-512.png"), (180, "apple-touch-icon.png"), (32, "favicon.png")]:
    icon(size, f"public/{name}")
print("ok")
