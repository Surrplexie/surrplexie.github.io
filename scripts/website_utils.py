"""Shared helpers for website bookmark import/export."""
from __future__ import annotations

import json
import re
from pathlib import Path
from urllib.parse import urlparse

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

TEMPLATE_TEXT = """# Website links for surrplexie.github.io/s
# One link per row. Lines starting with # are ignored.
#
# Start a category section:
# ▸ Miscellaneous
#
# Auto-named URL:
# https://example.com
#
# Optional custom name (name | url):
# My Label | https://example.com

▸ Miscellaneous
https://example.com
"""

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "s" / "websites.json"
SOURCE_TXT_PATH = ROOT / "s" / "links.txt"


def normalize_url(url: str) -> str:
    trimmed = url.strip()
    if not trimmed:
        return ""

    with_protocol = trimmed if re.match(r"^https?://", trimmed, re.I) else f"https://{trimmed}"

    try:
        parsed = urlparse(with_protocol)
        if not parsed.netloc:
            return ""
        return parsed._replace(fragment="").geturl().rstrip("/")
    except ValueError:
        return ""


def url_key(url: str) -> str:
    return normalize_url(url).lower()


def display_name(url: str, provided_name: str | None = None) -> str:
    if provided_name and provided_name.strip():
        return provided_name.strip()

    parsed = urlparse(normalize_url(url))
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


def load_json(path: Path = JSON_PATH) -> dict:
    if not path.exists():
        return {"categories": [], "total": 0}
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(categories: list[dict], path: Path = JSON_PATH) -> None:
    payload = {
        "categories": categories,
        "total": sum(len(category["links"]) for category in categories),
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def parse_link_line(line: str) -> tuple[str | None, str] | None:
    stripped = line.strip()
    if not stripped or stripped.startswith("#"):
        return None

    if "|" in stripped:
        name_part, url_part = stripped.split("|", 1)
        url = normalize_url(url_part)
        if url:
            return name_part.strip() or None, url
        return None

    if stripped.startswith("http") or "." in stripped:
        url = normalize_url(stripped)
        if url:
            return None, url

    return None


def parse_category_line(line: str) -> str | None:
    stripped = line.strip()
    if not stripped or stripped.startswith("#"):
        return None
    if stripped.startswith("▸"):
        return stripped.lstrip("▸").strip()
    return None


def parse_txt(text: str, default_category: str = "Imported") -> list[dict]:
    categories: list[dict] = []
    current_name = default_category
    current_links: list[dict] = []
    seen: set[str] = set()

    def flush() -> None:
        nonlocal current_links
        if current_links:
            categories.append({"name": current_name, "links": current_links})
            current_links = []

    for raw_line in text.splitlines():
        category_name = parse_category_line(raw_line)
        if category_name:
            flush()
            current_name = category_name
            continue

        parsed = parse_link_line(raw_line)
        if not parsed:
            continue

        provided_name, url = parsed
        key = url_key(url)
        if key in seen:
            continue
        seen.add(key)
        current_links.append({"name": display_name(url, provided_name), "url": url})

    flush()
    return categories


def merge_categories(existing: list[dict], incoming: list[dict]) -> tuple[list[dict], int]:
    merged = [
        {"name": category["name"], "links": [dict(link) for link in category["links"]]}
        for category in existing
    ]
    seen = {url_key(link["url"]) for category in merged for link in category["links"]}
    added = 0

    for incoming_category in incoming:
        target = next((category for category in merged if category["name"] == incoming_category["name"]), None)
        if target is None:
            target = {"name": incoming_category["name"], "links": []}
            merged.append(target)

        for link in incoming_category["links"]:
            key = url_key(link["url"])
            if key in seen:
                continue
            seen.add(key)
            target["links"].append(dict(link))
            added += 1

    return [category for category in merged if category["links"]], added


def categories_to_txt(categories: list[dict]) -> str:
    lines = [
        "# Exported website links for surrplexie.github.io/s",
        "# Edit and re-import with scripts/upload_websites.py",
        "",
    ]
    for category in categories:
        lines.append(f"▸ {category['name']}")
        for link in category["links"]:
            lines.append(f"{link['name']} | {link['url']}")
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"
