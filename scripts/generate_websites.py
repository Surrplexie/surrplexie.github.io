"""Generate s/websites.json from the bookmarks CSV export."""
from __future__ import annotations

import csv
from pathlib import Path

from bookmark_utils import display_name, url_key, write_json

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = Path(r"C:\Users\surrp\Downloads\s - Sheet1.csv")
OUT_PATH = ROOT / "s" / "websites.json"


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
                key = url_key(cell)
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
    write_json(OUT_PATH, categories)
    total = sum(len(category["links"]) for category in categories)
    print(f"Wrote {OUT_PATH} ({total} links in {len(categories)} categories)")


if __name__ == "__main__":
    main()
