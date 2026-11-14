#!/usr/bin/env python3
"""Print-ready Dink House newsletter flyer, US Letter at 300 DPI."""

from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FONTS = Path(__file__).resolve().parent / "flyer-fonts"
OUT = ROOT / "public" / "flyers"
LOGO = ROOT / "public" / "dinklogo.jpg"

W, H = 2550, 3300
LIME = (179, 255, 0)
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
MUTED = (186, 186, 186)
JOIN_URL = "https://thedinkhousepb.com/newsletter"
DISPLAY_URL = "thedinkhousepb.com/newsletter"


def font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONTS / name), size)


def bbox(font_obj, text: str):
    return font_obj.getbbox(text)


def text_width(font_obj, text: str) -> int:
    box = bbox(font_obj, text)
    return box[2] - box[0]


def text_height(font_obj, text: str) -> int:
    box = bbox(font_obj, text)
    return box[3] - box[1]


def draw_centered(draw, text, font_obj, y, fill, canvas_w=W) -> int:
    box = bbox(font_obj, text)
    x = (canvas_w - (box[2] - box[0])) // 2 - box[0]
    draw.text((x, y - box[1]), text, font=font_obj, fill=fill)
    return text_height(font_obj, text)


def draw_tracked(draw, text, font_obj, y, fill, tracking, canvas_w=W) -> int:
    widths = [text_width(font_obj, ch) for ch in text]
    total = sum(widths) + tracking * max(len(text) - 1, 0)
    x = (canvas_w - total) // 2
    top = min(bbox(font_obj, ch)[1] for ch in text)
    for ch, width in zip(text, widths):
        box = bbox(font_obj, ch)
        draw.text((x - box[0], y - top), ch, font=font_obj, fill=fill)
        x += width + tracking
    return text_height(font_obj, text)


def crop_logo(path: Path) -> Image.Image:
    image = Image.open(path).convert("RGB")
    gray = image.convert("L")
    mask = gray.point(lambda pixel: 255 if pixel > 18 else 0)
    box = mask.getbbox()
    if not box:
        return image
    pad = 8
    left = max(box[0] - pad, 0)
    top = max(box[1] - pad, 0)
    right = min(box[2] + pad, image.width)
    bottom = min(box[3] + pad, image.height)
    return image.crop((left, top, right, bottom))


def court_lines(base: Image.Image) -> None:
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    step = 150
    color = (179, 255, 0, 26)
    for x in range(0, W, step):
        draw.line([(x, 0), (x, H)], fill=color, width=2)
    for y in range(0, H, step):
        draw.line([(0, y), (W, y)], fill=color, width=2)
    base.alpha_composite(overlay)


def star(draw, cx: int, cy: int, outer: int, fill) -> None:
    import math

    points = []
    for i in range(10):
        radius = outer if i % 2 == 0 else outer * 0.42
        angle = math.radians(-90 + i * 36)
        points.append((cx + radius * math.cos(angle), cy + radius * math.sin(angle)))
    draw.polygon(points, fill=fill)


def make_qr(size: int) -> Image.Image:
    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=20,
        border=1,
    )
    qr.add_data(JOIN_URL)
    qr.make(fit=True)
    image = qr.make_image(fill_color="black", back_color="white").convert("RGB")
    return image.resize((size, size), Image.Resampling.NEAREST)


def build() -> Image.Image:
    canvas = Image.new("RGBA", (W, H), (*BLACK, 255))
    court_lines(canvas)
    draw = ImageDraw.Draw(canvas)

    bar = 36
    draw.rectangle([0, 0, W, bar], fill=LIME)
    draw.rectangle([0, H - bar, W, H], fill=LIME)

    y = 96
    logo = crop_logo(LOGO)
    target_w = 1080
    target_h = round(logo.height * (target_w / logo.width))
    logo = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)
    canvas.paste(logo, ((W - target_w) // 2, y))
    y += target_h + 18

    tag = font("Inter-SemiBold.ttf", 32)
    y += draw_tracked(draw, "WHERE PICKLEBALL LIVES", tag, y, LIME, 10)
    y += 28

    line_w = 200
    draw.rectangle([(W - line_w) // 2, y, (W + line_w) // 2, y + 6], fill=LIME)
    y += 40

    eyebrow = font("Inter-Bold.ttf", 30)
    y += draw_tracked(draw, "OPENING  2027   ·   BELL COUNTY", eyebrow, y, LIME, 4)
    y += 26

    display = font("BebasNeue-Regular.ttf", 196)
    y += draw_centered(draw, "JOIN THE", display, y, WHITE)
    y += 6

    word = "NEWSLETTER"
    word_font = font("BebasNeue-Regular.ttf", 176)
    word_box = bbox(word_font, word)
    word_w = word_box[2] - word_box[0]
    word_h = word_box[3] - word_box[1]
    pad_x, pad_y = 34, 4
    bar_w = word_w + pad_x * 2
    bar_h = word_h + pad_y * 2
    bar_x = (W - bar_w) // 2
    draw.rectangle([bar_x, y, bar_x + bar_w, y + bar_h], fill=LIME)
    draw.text(
        (bar_x + pad_x - word_box[0], y + pad_y - word_box[1]),
        word,
        font=word_font,
        fill=BLACK,
    )
    y += bar_h + 36

    body = font("Inter-Regular.ttf", 40)
    for line in (
        "Construction milestones, opening dates,",
        "and first word on memberships.",
    ):
        y += draw_centered(draw, line, body, y, MUTED) + 10
    y += 26

    chips = ["5 Indoor Courts", "5 Outdoor Courts", "Central Texas"]
    chip_font = font("Inter-SemiBold.ttf", 30)
    gap = 24
    chip_h = 72
    chip_pad = 34
    chip_widths = [text_width(chip_font, label) + chip_pad * 2 for label in chips]
    row_w = sum(chip_widths) + gap * (len(chips) - 1)
    x = (W - row_w) // 2
    for label, width in zip(chips, chip_widths):
        draw.rounded_rectangle(
            [x, y, x + width, y + chip_h],
            radius=36,
            outline=LIME,
            width=3,
        )
        label_box = bbox(chip_font, label)
        draw.text(
            (
                x + (width - (label_box[2] - label_box[0])) // 2 - label_box[0],
                y + (chip_h - (label_box[3] - label_box[1])) // 2 - label_box[1],
            ),
            label,
            font=chip_font,
            fill=WHITE,
        )
        x += width + gap
    y += chip_h

    footer_top = H - bar - 210
    scan = font("Inter-Bold.ttf", 38)
    url_font = font("Inter-SemiBold.ttf", 34)
    name = font("BebasNeue-Regular.ttf", 58)
    foot = font("Inter-Regular.ttf", 28)
    caption_h = text_height(scan, "SCAN TO JOIN") + 16 + text_height(url_font, DISPLAY_URL)
    qr_top = y + 48
    qr_bottom = footer_top - caption_h - 36
    card = qr_bottom - qr_top
    quiet = 44
    qr_size = card - quiet * 2
    card_x = (W - card) // 2
    draw.rounded_rectangle(
        [card_x - 10, qr_top - 10, card_x + card + 10, qr_top + card + 10],
        radius=36,
        fill=LIME,
    )
    draw.rounded_rectangle(
        [card_x, qr_top, card_x + card, qr_top + card],
        radius=28,
        fill=WHITE,
    )
    qr = make_qr(qr_size)
    canvas.paste(qr, (card_x + quiet, qr_top + quiet))

    caption_y = qr_top + card + 32
    caption_y += draw_tracked(draw, "SCAN TO JOIN", scan, caption_y, LIME, 8) + 14
    draw_centered(draw, DISPLAY_URL, url_font, caption_y, WHITE)

    star_y = footer_top + 28
    gap_star = 70
    for offset in (-gap_star, 0, gap_star):
        star(draw, W // 2 + offset, star_y, 16, LIME)

    name_y = star_y + 28
    name_y += draw_centered(draw, "THE DINK HOUSE", name, name_y, WHITE) + 8
    draw_centered(
        draw,
        "Belton   ·   Temple   ·   Killeen   ·   @the.dink.house",
        foot,
        name_y,
        MUTED,
    )

    return canvas.convert("RGB")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    flyer = build()
    png = OUT / "newsletter-flyer.png"
    pdf = OUT / "newsletter-flyer.pdf"
    flyer.save(png, "PNG", dpi=(300, 300))
    flyer.save(pdf, "PDF", resolution=300.0, title="The Dink House — Join the Newsletter")
    print(f"wrote {png} {flyer.size}")
    print(f"wrote {pdf}")


if __name__ == "__main__":
    main()
