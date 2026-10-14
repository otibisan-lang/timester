"""
共有ウインドウに出す QR コード（public/share-qr.png）を作る。
サイトのアドレスを変えたら（独自ドメインへの引っ越しなど）、URL を直して作り直す。
"""
from pathlib import Path

import qrcode

URL = "https://otibisan-lang.github.io/timester/"
OUT = Path(__file__).resolve().parent.parent / "public" / "share-qr.png"

qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=2, box_size=12)
qr.add_data(URL)
qr.make(fit=True)
qr.make_image(fill_color="#1F2937", back_color="white").save(OUT)
print("saved:", OUT)
