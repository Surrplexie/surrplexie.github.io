"""Import bookmarks from a txt file into s/websites.json and push to GitHub."""
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

from bookmark_utils import load_json, merge_categories, parse_txt_lines, write_json

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "s" / "websites.json"
DEFAULT_TEMPLATE = Path.home() / "Downloads" / "websites-import-template.txt"

TEMPLATE = """# Websites import file for surrplexie.github.io/s
# One link per row. Lines starting with # are comments.
#
# Category header (optional):
▸ Imported
#
# Named link:
My Example Site | https://example.com
#
# URL only (auto-named):
https://github.com/Surrplexie
https://cursor.com
"""


def export_template(destination: Path) -> Path:
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(TEMPLATE, encoding="utf-8")
    return destination


def choose_txt_file() -> Path | None:
    try:
        import tkinter as tk
        from tkinter import filedialog
    except ImportError:
        print("Tkinter is not available. Pass --file path\\to\\links.txt instead.")
        return None

    root = tk.Tk()
    root.withdraw()
    root.attributes("-topmost", True)
    selected = filedialog.askopenfilename(
        title="Select websites txt file",
        filetypes=[("Text files", "*.txt"), ("All files", "*.*")],
    )
    root.destroy()
    return Path(selected) if selected else None


def git_push(message: str) -> None:
    subprocess.run(["git", "add", "s/websites.json"], cwd=ROOT, check=True)
    status = subprocess.run(
        ["git", "diff", "--cached", "--quiet"],
        cwd=ROOT,
    )
    if status.returncode == 0:
        print("No changes to commit.")
        return

    subprocess.run(["git", "commit", "-m", message], cwd=ROOT, check=True)
    subprocess.run(["git", "push"], cwd=ROOT, check=True)
    print("Pushed to GitHub.")


def import_txt(txt_path: Path, default_category: str) -> tuple[int, int]:
    if not txt_path.exists():
        raise FileNotFoundError(f"Txt file not found: {txt_path}")

    lines = txt_path.read_text(encoding="utf-8").splitlines()
    incoming = parse_txt_lines(lines, default_category=default_category)
    if not incoming:
        raise ValueError("No valid links found in the selected txt file.")

    existing = load_json(JSON_PATH)
    merged, added = merge_categories(existing.get("categories", []), incoming)
    write_json(JSON_PATH, merged)

    total = sum(len(category["links"]) for category in merged)
    return added, total


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Import website bookmarks from a txt file into s/websites.json.",
    )
    parser.add_argument(
        "--file",
        type=Path,
        help="Path to txt file (one link per row). Opens a file picker if omitted.",
    )
    parser.add_argument(
        "--template",
        type=Path,
        nargs="?",
        const=DEFAULT_TEMPLATE,
        help="Download an import template txt to Downloads (or a custom path).",
    )
    parser.add_argument(
        "--category",
        default="Imported",
        help="Default category when txt rows have no section header.",
    )
    parser.add_argument(
        "--push",
        action="store_true",
        help="Commit and push s/websites.json to GitHub after import.",
    )
    parser.add_argument(
        "--message",
        default="Update /s bookmarks from txt import",
        help="Git commit message when using --push.",
    )
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    if args.template is not None:
        path = export_template(args.template)
        print(f"Template saved to {path}")
        if args.file is None and not args.push:
            return 0

    txt_path = args.file
    if txt_path is None:
        txt_path = choose_txt_file()
        if txt_path is None:
            print("No file selected.")
            return 1

    try:
        added, total = import_txt(txt_path, args.category)
    except (FileNotFoundError, ValueError) as error:
        print(error)
        return 1

    print(f"Updated {JSON_PATH}")
    print(f"Added {added} new link(s). Site now has {total} bookmark(s).")

    if args.push:
        try:
            git_push(args.message)
        except subprocess.CalledProcessError as error:
            print(f"Git push failed: {error}")
            return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
