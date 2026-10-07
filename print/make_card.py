"""
タイムスター 配布用カード（名刺サイズ 91×55mm・白黒・片面）を作る。
実行: python print/make_card.py  → print/ に PNG（600dpi）と PDF を出力

アプリのUIを白黒に置き換えている:
  太い角丸の枠＋ずらした影 / 斜体の TIMESTER / 丸いラベル / ふせんのタイムライン
"""
from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).parent
URL = "https://otibisan-lang.github.io/timester/"

DPI = 600
MM = DPI / 25.4
W, H = round(91 * MM), round(55 * MM)
BLACK, WHITE = "#000000", "#FFFFFF"
# 家庭用プリンターのインク節約のため、ベタ塗りは薄いグレーにする（黒は線と文字だけ）
GRAY, LIGHT = "#C8C8C8", "#E6E6E6"
FONT_DIR = Path("C:/Windows/Fonts")


def mm(v):
    return round(v * MM)


def jp(size_mm, weight=900):
    f = ImageFont.truetype(str(FONT_DIR / "NotoSansJP-VF.ttf"), mm(size_mm))
    try:
        f.set_variation_by_axes([weight])
    except Exception:
        pass
    return f


def latin_italic(size_mm):
    return ImageFont.truetype(str(FONT_DIR / "NotoSans-BoldItalic.ttf"), mm(size_mm))


def rrect(d, x0, y0, x1, y1, r, **kw):
    d.rounded_rectangle([mm(x0), mm(y0), mm(x1), mm(y1)], radius=mm(r), **kw)


def text_center(d, cx, y, s, font, fill):
    w = d.textlength(s, font=font)
    d.text((mm(cx) - w / 2, mm(y)), s, font=font, fill=fill)


def frame(d):
    """アプリのカード：ずらした影＋太い角丸の枠"""
    rrect(d, 4.2, 4.2, 88.2, 52.2, 4.5, fill=GRAY)
    rrect(d, 2.8, 2.8, 86.8, 50.8, 4.5, fill=WHITE, outline=BLACK, width=mm(0.9))


def hourglass(img, x, y, size):
    """黄色いタイルの砂時計を白黒で（薄いグレーのタイル・黒い線の砂時計）"""
    S = mm(size)
    tile = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    td = ImageDraw.Draw(tile)
    k = S / 150
    td.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(32 * k), fill=LIGHT, outline=BLACK, width=max(2, int(5 * k)))
    cx = cy = S / 2
    w = max(2, int(9 * k))
    td.line([(cx - 34 * k, cy - 46 * k), (cx + 34 * k, cy - 46 * k)], fill=BLACK, width=w)
    td.line([(cx - 34 * k, cy + 46 * k), (cx + 34 * k, cy + 46 * k)], fill=BLACK, width=w)
    td.polygon(
        [(cx - 27 * k, cy - 40 * k), (cx + 27 * k, cy - 40 * k), (cx + 5 * k, cy),
         (cx + 27 * k, cy + 40 * k), (cx - 27 * k, cy + 40 * k), (cx - 5 * k, cy)],
        outline=BLACK, width=max(2, int(8 * k)),
    )
    td.polygon([(cx - 14 * k, cy + 33 * k), (cx + 14 * k, cy + 33 * k), (cx, cy + 15 * k)], fill=BLACK)
    tile = tile.rotate(-6, resample=Image.BICUBIC)
    img.paste(tile, (mm(x), mm(y)), tile)


def pill(d, x, y, label, font, h=4.2, pad=1.8, inverted=True):
    tw = d.textlength(label, font=font) / MM
    rrect(d, x, y, x + tw + pad * 2, y + h, h / 2,
          fill=LIGHT if inverted else WHITE, outline=BLACK, width=mm(0.3))
    d.text((mm(x + pad), mm(y + h / 2)), label, font=font, fill=BLACK, anchor="lm")
    return x + tw + pad * 2


def front():
    img = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(img)
    frame(d)

    # タイトル（左）
    hourglass(img, 7.5, 6.6, 9.5)
    d.text((mm(19.2), mm(5.0)), "TIMESTER", font=latin_italic(8.6), fill=BLACK)
    f_sub = jp(3.5)
    d.text((mm(19.8), mm(16.6)), "タイムスター", font=f_sub, fill=BLACK)
    sub_w = d.textlength("タイムスター", font=f_sub) / MM
    pill(d, 19.8 + sub_w + 1.4, 17.0, "現代アイテム", jp(2.1), h=3.8, pad=1.5)
    # QR の下の余白（4モジュール分）にかからないよう、少し下げて1行で置く
    d.text((mm(8), mm(27.4)), "身近な商品の発売年を当てて、タイムラインを作ろう！", font=jp(2.3, 700), fill=BLACK)

    # QR コード（右）
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=0, box_size=10)
    qr.add_data(URL)
    qr.make(fit=True)
    qs = 18.0
    qx, qy = 81.8 - qs, 6.4
    q = qr.make_image(fill_color=BLACK, back_color=WHITE).convert("RGB").resize((mm(qs), mm(qs)), Image.NEAREST)
    img.paste(q, (mm(qx), mm(qy)))

    # ふせんのタイムライン（「？」だけ薄いグレーで目立たせる）
    notes = [("1915", "電気アイロン"), ("1971", "カップラーメン"), ("？", "何年？"), ("1996", "たまごっち"), ("2017", "Switch")]
    y_line, top = 41.2, 33.2
    d.line([(mm(8), mm(y_line)), (mm(81.6), mm(y_line))], fill=BLACK, width=mm(0.35))
    n, w = len(notes), 13.4
    gap = (73.6 - n * w) / (n - 1)
    f_year, f_name = jp(3.3), jp(1.55, 800)
    for i, (year, name) in enumerate(notes):
        x = 8 + i * (w + gap)
        hot = year == "？"
        rrect(d, x + 0.6, top + 0.6, x + w + 0.6, top + 12.6, 1.6, fill=GRAY)  # ふせんの影
        rrect(d, x, top, x + w, top + 12, 1.6, fill=LIGHT if hot else WHITE, outline=BLACK, width=mm(0.35 if not hot else 0.6))
        c = BLACK
        text_center(d, x + w / 2, top + 1.3, year, f_year, c)
        text_center(d, x + w / 2, top + 7.6, name, f_name, c)

    # クレジット（ふせんの列の下・中央）
    f_by = ImageFont.truetype(str(FONT_DIR / "NotoSans-Italic.ttf"), mm(1.7))
    f_org = jp(2.0, 800)
    by, org = "presented by ", "つくばフリースクール・コンシェルジュ"
    total = d.textlength(by, font=f_by) + d.textlength(org, font=f_org)
    x0, cy = mm(44.8) - total / 2, mm(48.0)
    d.text((x0, cy), by, font=f_by, fill=BLACK, anchor="lm")
    d.text((x0 + d.textlength(by, font=f_by), cy), org, font=f_org, fill=BLACK, anchor="lm")
    return img


def main():
    f = front()
    f.save(OUT / "card.png", dpi=(DPI, DPI))
    f.save(OUT / "card.pdf", resolution=DPI)
    print("saved:", OUT / "card.png", OUT / "card.pdf")


if __name__ == "__main__":
    main()
