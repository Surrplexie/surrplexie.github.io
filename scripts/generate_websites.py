"""Generate s/websites.json from the bookmarks CSV export."""
import csv
import json
import re
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = Path(r"C:\Users\surrp\Downloads\s - Sheet1.csv")
OUT_PATH = ROOT / "s" / "websites.json"

DOMAIN_NAMES = {
    "chatgpt.com": "ChatGPT",
    "claude.ai": "Claude",
    "cursor.com": "Cursor",
    "gemini.google.com": "Google Gemini",
    "perplexity.ai": "Perplexity",
    "github.com": "GitHub",
    "stackoverflow.com": "Stack Overflow",
    "reddit.com": "Reddit",
    "youtube.com": "YouTube",
    "google.com": "Google",
    "linkedin.com": "LinkedIn",
    "discord.com": "Discord",
    "twitter.com": "X",
    "x.com": "X",
    "instagram.com": "Instagram",
    "tiktok.com": "TikTok",
    "twitch.tv": "Twitch",
    "amazon.com": "Amazon",
    "netflix.com": "Netflix",
    "spotify.com": "Spotify",
    "wikipedia.org": "Wikipedia",
}


def display_name(url: str) -> str:
    parsed = urlparse(url.strip())
    host = (parsed.netloc or "").lower().replace("www.", "")
    if not host:
        return url.strip()

    for domain, name in DOMAIN_NAMES.items():
        if host == domain or host.endswith("." + domain):
            path = parsed.path.strip("/")
            if domain == "github.com" and path:
                parts = path.split("/")
                if parts and parts[0].lower() == "orgs" and len(parts) >= 2:
                    return f"{parts[1]} · GitHub"
                if parts:
                    return f"{parts[0]} · GitHub"
                return name
            if domain == "reddit.com" and path:
                segments = [segment for segment in path.split("/") if segment]
                if segments and segments[0] == "r":
                    return f"r/{segments[1]} · Reddit"
                if segments and segments[0] == "user":
                    return f"u/{segments[1]} · Reddit"
            return name

    path = parsed.path.rstrip("/")
    if path and path != "/":
        segment = path.split("/")[-1] or path.split("/")[-2]
        segment = re.sub(r"[-_.]", " ", segment)[:48].strip()
        if segment:
            brand = host.split(".")[0].replace("-", " ").title()
            return f"{segment.title()} · {brand}"

    return host.split(".")[0].replace("-", " ").title()


def parse_csv() -> list[dict]:
    categories: list[dict] = []
    current: dict | None = None
    seen: set[str] = set()

    with CSV_PATH.open(newline="", encoding="utf-8-sig") as handle:
        for row in csv.reader(handle):
            cell = ""
            for column in row:
                column = column.strip()
                if column:
                    cell = column
                    break

            if not cell:
                continue

            if cell.startswith("▸"):
                current = {"name": cell.lstrip("▸").strip(), "links": []}
                categories.append(current)
                continue

            if cell.startswith("http"):
                key = cell.lower().rstrip("/")
                if key in seen:
                    continue
                seen.add(key)
                if current is None:
                    current = {"name": "Uncategorized", "links": []}
                    categories.append(current)
                current["links"].append({"name": display_name(cell), "url": cell})

    return [category for category in categories if category["links"]]


def main() -> None:
    categories = parse_csv()
    payload = {
        "categories": categories,
        "total": sum(len(category["links"]) for category in categories),
    }
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {OUT_PATH} ({payload['total']} links in {len(categories)} categories)")


if __name__ == "__main__":
    main()
