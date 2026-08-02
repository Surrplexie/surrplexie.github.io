"""Import website links from a txt file into s/websites.json and push to GitHub."""
from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from website_utils import (
    JSON_PATH,
    ROOT,
    SOURCE_TXT_PATH,
    TEMPLATE_TEXT,
    categories_to_txt,
    load_json,
    merge_categories,
    parse_txt,
    write_json,
)


def downloads_dir() -> Path:
    return Path.home() / "Downloads"


def pick_txt_file() -> Path | None:
    try:
        import tkinter as tk
        from tkinter import filedialog
    except ImportError:
        return None

    root = tk.Tk()
    root.withdraw()
    root.attributes("-topmost", True)
    selected = filedialog.askopenfilename(
        title="Select website links txt file",
        filetypes=[("Text files", "*.txt"), ("All files", "*.*")],
        initialdir=str(downloads_dir()),
    )
    root.destroy()
    return Path(selected) if selected else None


def export_template() -> Path:
    target = downloads_dir() / "website-links-template.txt"
    target.write_text(TEMPLATE_TEXT, encoding="utf-8")
    return target


def export_current() -> Path:
    data = load_json()
    target = downloads_dir() / "website-links-export.txt"
    target.write_text(categories_to_txt(data.get("categories", [])), encoding="utf-8")
    return target


def run_git_push(message: str) -> None:
    subprocess.run(["git", "add", str(JSON_PATH.relative_to(ROOT)), str(SOURCE_TXT_PATH.relative_to(ROOT))], cwd=ROOT, check=True)
    status = subprocess.run(["git", "status", "--porcelain"], cwd=ROOT, capture_output=True, text=True, check=True)
    if not status.stdout.strip():
        print("No changes to commit.")
        return

    subprocess.run(["git", "commit", "-m", message], cwd=ROOT, check=True)
    subprocess.run(["git", "push"], cwd=ROOT, check=True)
    print("Pushed to GitHub.")


def import_txt(path: Path, default_category: str, dry_run: bool) -> int:
    text = path.read_text(encoding="utf-8")
    incoming = parse_txt(text, default_category=default_category)
    existing = load_json().get("categories", [])
    merged, added = merge_categories(existing, incoming)

    print(f"Scanned: {path}")
    print(f"New links added: {added}")
    print(f"Total links: {sum(len(category['links']) for category in merged)}")

    if dry_run:
        print("Dry run only — no files written.")
        return added

    write_json(merged)
    SOURCE_TXT_PATH.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, SOURCE_TXT_PATH)
    print(f"Updated {JSON_PATH}")
    print(f"Saved source copy to {SOURCE_TXT_PATH}")
    return added


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Import website links from txt into s/websites.json")
    parser.add_argument("--template", action="store_true", help="Download a blank template txt to Downloads")
    parser.add_argument("--export", action="store_true", help="Export current site links to Downloads as txt")
    parser.add_argument("--file", type=Path, help="Path to txt file with one link per row")
    parser.add_argument("--pick", action="store_true", help="Open a file picker for the txt file")
    parser.add_argument("--category", default="Imported", help="Default category when txt has no section header")
    parser.add_argument("--push", action="store_true", help="Commit and push updated files to GitHub")
    parser.add_argument("--dry-run", action="store_true", help="Preview import without writing files")
    return parser


def main() -> int:
    args = build_parser().parse_args()

    if args.template:
        target = export_template()
        print(f"Template saved to {target}")
        return 0

    if args.export:
        target = export_current()
        print(f"Current links exported to {target}")
        return 0

    txt_path = args.file
    if txt_path is None and args.pick:
        txt_path = pick_txt_file()
    if txt_path is None and args.file is None and not args.template and not args.export:
        txt_path = pick_txt_file()

    if txt_path is None:
        print("No txt file selected.")
        print("Use --template to download a starter file, or --file PATH / --pick.")
        return 1

    if not txt_path.exists():
        print(f"File not found: {txt_path}")
        return 1

    added = import_txt(txt_path, args.category, args.dry_run)
    if args.dry_run or added == 0:
        if added == 0 and not args.dry_run:
            print("Nothing new to upload.")
        return 0

    if args.push:
        run_git_push("Update website bookmarks from links txt")
    else:
        print("Local files updated. Re-run with --push to upload to GitHub.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
