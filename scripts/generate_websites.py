"""Generate s/websites.json from the bookmarks CSV export."""
import csv
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from website_utils import display_name, write_json

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = Path(r"C:\Users\surrp\Downloads\s - Sheet1.csv")


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
    write_json(categories)
    total = sum(len(category["links"]) for category in categories)
    print(f"Wrote {ROOT / 's' / 'websites.json'} ({total} links in {len(categories)} categories)")


if __name__ == "__main__":
    main()
