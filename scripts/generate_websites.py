"""Generate s/websites.json from a local bookmarks txt/csv export."""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = Path(r"C:\Users\surrp\Downloads\s - Sheet1.csv")
OUT_PATH = ROOT / "s" / "websites.json"
SCRIPT_DIR = Path(__file__).resolve().parent

if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from bookmarks_parser import write_websites_json  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate s/websites.json locally.")
    parser.add_argument(
        "--file",
        type=Path,
        default=DEFAULT_SOURCE,
        help=f"Bookmarks txt/csv path (default: {DEFAULT_SOURCE})",
    )
    args = parser.parse_args()

    payload = write_websites_json(args.file, OUT_PATH)
    print(f"Wrote {OUT_PATH} ({payload['total']} links in {len(payload['categories'])} categories)")


if __name__ == "__main__":
    main()
