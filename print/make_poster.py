"""
タイムスター 宣伝用ポスター（A4横・カラー）を作る。
実行: python print/make_poster.py  → print/poster.png（300dpi）と poster.pdf

家庭用プリンターで刷るため、ベタ塗りはしない（線と、ごく薄い色だけで塗る）。
デザインは配布用カード（make_card.py）がベース。QRコードは入れない。
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).parent
DPI = 300
MM = DPI / 25.4
W, H = round(297 * MM), round(210 * MM)
FONT_DIR = Path("C:/Windows/Fonts")

INK = "#1F2937"
WHITE = "#FFFFFF"
# 線に使う色（アプリと同じ）
CORAL, BLUE, GREEN, YELLOW = "#FF6B6B", "#4D96FF", "#6BCB77", "#F5C400"
# 塗りに使うごく薄い色（インク節約）
CORAL_T, BLUE_T, GREEN_T, YELLOW_T = "#FFECEC", "#EAF2FF", "#EAF7EC", "#FFF7D1"


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


def tlen(d, s, font):
    return d.textlength(s, font=font) / MM


def text_center(d, cx, y, s, font, fill):
    d.text((mm(cx) - d.textlength(s, font=font) / 2, mm(y)), s, font=font, fill=fill)


def rich_line(d, cx, y, parts, font):
    """色ちがいの文字を1行に中央そろえで並べる。parts = [(文字, 色), ...]"""
    total = sum(tlen(d, s, font) for s, _ in parts)
    x = cx - total / 2
    for s, color in parts:
        d.text((mm(x), mm(y)), s, font=font, fill=color)
        x += tlen(d, s, font)


def hourglass(img, x, y, size):
    """薄い黄色のタイルに、線だけの砂時計"""
    S = mm(size)
    tile = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    td = ImageDraw.Draw(tile)
    k = S / 150
    td.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(32 * k), fill=YELLOW_T, outline=YELLOW, width=max(2, int(7 * k)))
    cx = cy = S / 2
    w = max(2, int(9 * k))
    td.line([(cx - 34 * k, cy - 46 * k), (cx + 34 * k, cy - 46 * k)], fill=INK, width=w)
    td.line([(cx - 34 * k, cy + 46 * k), (cx + 34 * k, cy + 46 * k)], fill=INK, width=w)
    td.polygon(
        [(cx - 27 * k, cy - 40 * k), (cx + 27 * k, cy - 40 * k), (cx + 5 * k, cy),
         (cx + 27 * k, cy + 40 * k), (cx - 27 * k, cy + 40 * k), (cx - 5 * k, cy)],
        outline=INK, width=max(2, int(8 * k)),
    )
    td.polygon([(cx - 14 * k, cy + 33 * k), (cx + 14 * k, cy + 33 * k), (cx, cy + 15 * k)], fill=INK)
    tile = tile.rotate(-6, resample=Image.BICUBIC)
    img.paste(tile, (mm(x), mm(y)), tile)


def poster():
    img = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(img)
    cx = 297 / 2

    # 外枠：アプリのカード（太い角丸の枠＋ずらした影）。影は薄い青で
    rrect(d, 12, 12, 289, 202, 10, fill=BLUE_T)
    rrect(d, 8, 8, 285, 198, 10, fill=WHITE, outline=BLUE, width=mm(1.6))

    # ===== 上半分：大きなキャッチコピー =====
    f_big = jp(17.5)
    # 「無料配布中」の下に、蛍光ペン風の薄い黄色の帯
    line2 = [("ミニゲームを", INK), ("無料配布中", CORAL), ("です", INK)]
    total2 = sum(tlen(d, s, f_big) for s, _ in line2)
    hx0 = cx - total2 / 2 + tlen(d, "ミニゲームを", f_big)
    hx1 = hx0 + tlen(d, "無料配布中", f_big)
    rrect(d, hx0 - 1, 63.5, hx1 + 1, 73.5, 2, fill=YELLOW_T)

    rich_line(d, cx, 22, [("紙", CORAL), ("と", INK), ("スマホ", CORAL), ("があれば遊べる", INK)], f_big)
    rich_line(d, cx, 54, line2, f_big)

    # 区切りの点線
    y_div = 100
    x = 24
    while x < 273:
        d.line([(mm(x), mm(y_div)), (mm(min(x + 3, 273)), mm(y_div))], fill="#D1D5DB", width=mm(0.6))
        x += 5.5

    # ===== 下半分：配布用カードのデザイン =====
    # タイトル
    hourglass(img, 40, 108, 26)
    d.text((mm(72), mm(104)), "TIMESTER", font=latin_italic(21), fill=INK)
    f_sub = jp(8)
    d.text((mm(73.5), mm(131.5)), "タイムスター", font=f_sub, fill=CORAL)
    sub_w = tlen(d, "タイムスター", f_sub)
    f_pill = jp(4.6)
    px = 73.5 + sub_w + 4
    pw = tlen(d, "現代アイテム", f_pill) + 7
    rrect(d, px, 133, px + pw, 141.5, 4.25, fill=YELLOW_T, outline=YELLOW, width=mm(0.5))
    d.text((mm(px + 3.5), mm(137.25)), "現代アイテム", font=f_pill, fill=INK, anchor="lm")
    # 右側：遊べる人数など
    f_meta = jp(4.4, 800)
    for i, (label, value) in enumerate([("人数", "2〜5人"), ("時間", "5〜10分")]):
        y = 115 + i * 10.5
        rrect(d, 200, y, 214, y + 7.5, 3.75, outline=BLUE, width=mm(0.45), fill=BLUE_T)
        d.text((mm(207), mm(y + 3.75)), label, font=jp(3.4, 900), fill=BLUE, anchor="mm")
        d.text((mm(217), mm(y + 3.75)), value, font=f_meta, fill=INK, anchor="lm")

    text_center(d, cx, 146.5, "身近な商品の発売年を当てて、タイムラインを作ろう！", jp(5.6, 700), INK)

    # ふせんのタイムライン（線＋薄い色。「？」だけ太い枠で目立たせる）
    notes = [
        ("1914", "電気アイロン", YELLOW, YELLOW_T),
        ("1971", "カップヌードル", CORAL, CORAL_T),
        ("？", "", CORAL, WHITE),
        ("1996", "たまごっち", BLUE, BLUE_T),
        ("2017", "Switch", GREEN, GREEN_T),
    ]
    top, nh, nw = 158, 24, 40
    left, right = 34, 263
    gap = (right - left - len(notes) * nw) / (len(notes) - 1)
    y_line = top + nh / 2
    d.line([(mm(left), mm(y_line)), (mm(right), mm(y_line))], fill="#D1D5DB", width=mm(0.8))
    f_year, f_name = jp(9.5), jp(3.9, 800)
    for i, (year, name, line, tint) in enumerate(notes):
        x = left + i * (nw + gap)
        hot = year == "？"
        rrect(d, x + 1.6, top + 1.6, x + nw + 1.6, top + nh + 1.6, 3, fill="#EDEDED")  # 薄い影
        rrect(d, x, top, x + nw, top + nh, 3, fill=tint, outline=line, width=mm(1.1 if hot else 0.6))
        if hot:
            # 「？」だけは名前を出さず、大きな？をふせんの真ん中に
            d.text((mm(x + nw / 2), mm(top + nh / 2)), year, font=jp(16), fill=CORAL, anchor="mm")
            continue
        text_center(d, x + nw / 2, top + 2.2, year, f_year, INK)
        text_center(d, x + nw / 2, top + 15.6, name, f_name, INK)

    # クレジット
    f_by = ImageFont.truetype(str(FONT_DIR / "NotoSans-Italic.ttf"), mm(4.2))
    f_org = jp(5.0, 800)
    by, org = "presented by ", "つくばフリースクール・コンシェルジュ"
    total = d.textlength(by, font=f_by) + d.textlength(org, font=f_org)
    x0, cy_ = mm(cx) - total / 2, mm(190)
    d.text((x0, cy_), by, font=f_by, fill=INK, anchor="lm")
    d.text((x0 + d.textlength(by, font=f_by), cy_), org, font=f_org, fill=INK, anchor="lm")
    return img


def main():
    p = poster()
    p.save(OUT / "poster.png", dpi=(DPI, DPI))
    p.save(OUT / "poster.pdf", resolution=DPI)
    print("saved:", OUT / "poster.png", OUT / "poster.pdf")


if __name__ == "__main__":
    main()
