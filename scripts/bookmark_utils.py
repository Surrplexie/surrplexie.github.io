"""Shared bookmark parsing and naming helpers for the /s/ page."""
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

CATEGORY_PREFIXES = ("▸", "#", "[", "##")


def normalize_url(url: str) -> str:
    trimmed = url.strip()
    if not trimmed:
        return ""

    with_protocol = trimmed if re.match(r"^https?://", trimmed, re.I) else f"https://{trimmed}"

    try:
        parsed = urlparse(with_protocol)
    except ValueError:
        return ""

    if not parsed.netloc:
        return ""

    return parsed._replace(fragment="").geturl().rstrip("/")


def url_key(url: str) -> str:
    return normalize_url(url).lower()


def display_name(url: str, provided_name: str | None = None) -> str:
    if provided_name and provided_name.strip():
        return provided_name.strip()

    parsed = urlparse(normalize_url(url) or url.strip())
    host = (parsed.netloc or "").lower().replace("www.", "")
    if not host:
        return (provided_name or url).strip()

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


def is_category_line(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return False
    if stripped.startswith("▸"):
        return True
    if stripped.startswith("#") and not stripped.lower().startswith("http"):
        return stripped not in {"#", "##"}
    if stripped.startswith("[") and stripped.endswith("]"):
        return True
    return False


def parse_category_name(line: str) -> str:
    stripped = line.strip()
    if stripped.startswith("▸"):
        return stripped.lstrip("▸").strip()
    if stripped.startswith("[") and stripped.endswith("]"):
        return stripped[1:-1].strip()
    if stripped.startswith("#"):
        return stripped.lstrip("#").strip()
    return stripped


def parse_link_line(line: str) -> tuple[str | None, str] | None:
    stripped = line.strip()
    if not stripped or is_category_line(stripped):
        return None

    for separator in ("|", "\t"):
        if separator in stripped:
            left, right = stripped.split(separator, 1)
            left = left.strip()
            right = right.strip()
            if right.startswith("http") or "." in right:
                return left or None, right
            if left.startswith("http") or "." in left:
                return right or None, left

    if "," in stripped and not stripped.startswith("http"):
        left, right = stripped.split(",", 1)
        left = left.strip()
        right = right.strip()
        if right.startswith("http") or re.match(r"^[\w.-]+\.[a-z]{2,}", right, re.I):
            return left or None, right

    if stripped.startswith("http") or re.match(r"^[\w.-]+\.[a-z]{2,}", stripped, re.I):
        return None, stripped

    return None


def parse_txt_lines(lines: list[str], default_category: str = "Imported") -> list[dict]:
    categories: list[dict] = []
    current: dict | None = None

    def ensure_category(name: str) -> dict:
        nonlocal current
        for category in categories:
            if category["name"] == name:
                current = category
                return category
        current = {"name": name, "links": []}
        categories.append(current)
        return current

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue

        if is_category_line(line):
            ensure_category(parse_category_name(line))
            continue

        parsed = parse_link_line(line)
        if not parsed:
            continue

        provided_name, raw_url = parsed
        normalized = normalize_url(raw_url)
        if not normalized:
            continue

        if current is None:
            ensure_category(default_category)

        current["links"].append(
            {
                "name": display_name(normalized, provided_name),
                "url": normalized,
            }
        )

    return [category for category in categories if category["links"]]


def load_json(path: Path) -> dict:
    if not path.exists():
        return {"categories": [], "total": 0}
    return json.loads(path.read_text(encoding="utf-8"))


def merge_categories(existing: list[dict], incoming: list[dict]) -> tuple[list[dict], int]:
    merged = [
        {"name": category["name"], "links": [dict(link) for link in category["links"]]}
        for category in existing
    ]
    seen = {url_key(link["url"]) for category in merged for link in category["links"]}
    added = 0

    for incoming_category in incoming:
        target = next((item for item in merged if item["name"] == incoming_category["name"]), None)
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

    merged = [category for category in merged if category["links"]]
    return merged, added


def write_json(path: Path, categories: list[dict]) -> None:
    payload = {
        "categories": categories,
        "total": sum(len(category["links"]) for category in categories),
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
