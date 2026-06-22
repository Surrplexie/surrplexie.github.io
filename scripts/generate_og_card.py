"""Generate og-card.png for Open Graph previews."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "images" / "og-card.png"

W, H = 1200, 630


def main():
    img = Image.new("RGB", (W, H), "#1e1e1e")
    draw = ImageDraw.Draw(img)

    draw.rectangle([(0, 0), (W, 8)], fill="#00bcd4")
    draw.rectangle([(40, 40), (W - 40, H - 40)], outline="#00bcd4", width=3)

    title_font = ImageFont.load_default()
    body_font = ImageFont.load_default()

    draw.text((80, 120), "Kai Morgan", fill="#00bcd4", font=title_font)
    draw.text((80, 170), "IT Support & Help Desk", fill="#f0f0f0", font=title_font)
    draw.text(
        (80, 230),
        "Entry-level help desk, desktop support, and internship candidate.",
        fill="#cccccc",
        font=body_font,
    )
    draw.text(
        (80, 270),
        "MATC IT Computer Support Specialist  |  GPA 3.2  |  surrplexie.github.io",
        fill="#888888",
        font=body_font,
    )

    img.save(OUT)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
