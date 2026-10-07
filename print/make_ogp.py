"""
OGP画像（public/ogp.png, 1200×630）と、あそびかた冒頭用の画像（public/howto-header.png）を作る。
実行: python print/make_ogp.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).parent.parent
PUBLIC = ROOT / "public"
FONT_DIR = Path("C:/Windows/Fonts")

W, H = 1200, 630
S = 2  # 2倍で描いて縮小（なめらかに）
BG = "#FFFAE5"
CORAL, BLUE, YEL, INK, GRAY = "#FF6B6B", "#4D96FF", "#FFD93D", "#1F2937", "#6B7280"

# タイムラインに並べるふせん（年, 名前, 色）
NOTES = [
    ("1915", "電気アイロン", YEL),
    ("1971", "カップラーメン", "#FFE0E0"),
    ("？", "この商品は何年？", CORAL),
    ("1996", "たまごっち", "#DDEBFF"),
    ("2017", "Switch", "#DFF5E3"),
]


def jp(size, weight=900):
    f = ImageFont.truetype(str(FONT_DIR / "NotoSansJP-VF.ttf"), size * S)
    try:
        f.set_variation_by_axes([weight])
    except Exception:
        pass
    return f


def make_ogp():
    img = Image.new("RGB", (W * S, H * S), BG)
    d = ImageDraw.Draw(img)
    latin = ImageFont.truetype(str(FONT_DIR / "NotoSans-BoldItalic.ttf"), 150 * S)

    def R(x0, y0, x1, y1, r, **k):
        d.rounded_rectangle([x0 * S, y0 * S, x1 * S, y1 * S], radius=r * S, **k)

    # カード（オフセット影つき）
    R(56, 46, 1164, 600, 48, fill=BLUE)
    R(40, 30, 1148, 584, 48, fill="white", outline=BLUE, width=10 * S)

    # 砂時計タイル
    tile = Image.new("RGBA", (150 * S, 150 * S), (0, 0, 0, 0))
    td = ImageDraw.Draw(tile)
    td.rounded_rectangle([8 * S, 8 * S, 142 * S, 142 * S], radius=32 * S, fill=YEL, outline="white", width=6 * S)
    cx = cy = 75 * S
    td.line([(cx - 30 * S, cy - 42 * S), (cx + 30 * S, cy - 42 * S)], fill=INK, width=8 * S)
    td.line([(cx - 30 * S, cy + 42 * S), (cx + 30 * S, cy + 42 * S)], fill=INK, width=8 * S)
    td.polygon(
        [(cx - 24 * S, cy - 36 * S), (cx + 24 * S, cy - 36 * S), (cx + 4 * S, cy),
         (cx + 24 * S, cy + 36 * S), (cx - 24 * S, cy + 36 * S), (cx - 4 * S, cy)],
        outline=INK, width=7 * S,
    )
    td.polygon([(cx - 12 * S, cy + 30 * S), (cx + 12 * S, cy + 30 * S), (cx, cy + 14 * S)], fill=INK)
    tile = tile.rotate(-6, resample=Image.BICUBIC, expand=False)
    img.paste(tile, (100 * S, 72 * S), tile)

    # タイトル
    d.text((278 * S, 40 * S), "TIMESTER", font=latin, fill=INK)
    f1 = jp(52)
    d.text((288 * S, 218 * S), "タイムスター", font=f1, fill=CORAL)
    tw = d.textlength("タイムスター", font=f1) / S
    f2 = jp(30)
    pw = d.textlength("現代アイテム", font=f2) / S
    px = 288 + tw + 22
    R(px, 228, px + pw + 40, 282, 27, fill=YEL)
    d.text(((px + 20) * S, 231 * S), "現代アイテム", font=f2, fill=INK)
    d.text((290 * S, 300 * S), "身近な商品の発売年を当てて、タイムラインを作ろう！", font=jp(32, 700), fill=GRAY)

    # タイムライン（ふせん）
    y = 470
    d.line([(100 * S, y * S), (1088 * S, y * S)], fill="#E5E7EB", width=8 * S)
    fy, fn = jp(40), jp(22, 800)
    n, w = len(NOTES), 178
    gap = (988 - n * w) / (n - 1)
    for i, (yr, name, col) in enumerate(NOTES):
        x = 100 + i * (w + gap)
        top = y - 62
        tc = "white" if yr == "？" else INK
        R(x + 6, top + 8, x + w + 6, top + 132, 18, fill="#E8E2C8")
        R(x, top, x + w, top + 124, 18, fill=col)
        yw = d.textlength(yr, font=fy) / S
        d.text(((x + (w - yw) / 2) * S, (top + 12) * S), yr, font=fy, fill=tc)
        nw = d.textlength(name, font=fn) / S
        d.text(((x + (w - nw) / 2) * S, (top + 78) * S), name, font=fn, fill=tc)

    return img.resize((W, H), Image.LANCZOS)


def make_howto_header(ogp):
    """OGP画像のまわりの余白を切り落とし、背景色を透明にする"""
    im = ogp.convert("RGBA").crop((34, 24, 1170, 606))
    px = im.load()
    bg = (0xFF, 0xFA, 0xE5)
    for yy in range(im.size[1]):
        for xx in range(im.size[0]):
            r, g, b, _ = px[xx, yy]
            if abs(r - bg[0]) < 6 and abs(g - bg[1]) < 6 and abs(b - bg[2]) < 10:
                px[xx, yy] = (r, g, b, 0)
    return im


def main():
    ogp = make_ogp()
    ogp.save(PUBLIC / "ogp.png", optimize=True)
    make_howto_header(ogp).save(PUBLIC / "howto-header.png", optimize=True)
    print("saved:", PUBLIC / "ogp.png", PUBLIC / "howto-header.png")


if __name__ == "__main__":
    main()
