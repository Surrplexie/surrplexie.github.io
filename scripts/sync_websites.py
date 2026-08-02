"""Pull repo, parse a selected bookmarks txt/csv, and push s/websites.json to GitHub."""
from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "s" / "websites.json"
SCRIPT_DIR = Path(__file__).resolve().parent

if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from bookmarks_parser import write_websites_json  # noqa: E402


def run_git(args: list[str], *, check: bool = True) -> subprocess.CompletedProcess[str]:
    command = ["git", *args]
    print(f"$ {' '.join(command)}")
    return subprocess.run(
        command,
        cwd=ROOT,
        check=check,
        text=True,
        capture_output=True,
    )


def current_branch() -> str:
    result = run_git(["rev-parse", "--abbrev-ref", "HEAD"])
    return result.stdout.strip()


def pull_latest(branch: str) -> None:
    result = run_git(["pull", "--rebase", "origin", branch], check=False)
    if result.returncode != 0:
        stderr = result.stderr.strip()
        stdout = result.stdout.strip()
        message = stderr or stdout or "git pull failed"
        raise RuntimeError(message)
    if result.stdout.strip():
        print(result.stdout.strip())


def pick_source_file() -> Path | None:
    import tkinter as tk
    from tkinter import filedialog

    root = tk.Tk()
    root.withdraw()
    root.update()
    selected = filedialog.askopenfilename(
        title="Select bookmarks file",
        filetypes=[
            ("Bookmark files", "*.txt *.csv"),
            ("Text files", "*.txt"),
            ("CSV files", "*.csv"),
            ("All files", "*.*"),
        ],
    )
    root.destroy()
    if not selected:
        return None
    return Path(selected)


def commit_and_push(branch: str, source_name: str, total: int, category_count: int) -> None:
    run_git(["add", "s/websites.json"])

    status = run_git(["diff", "--cached", "--quiet"], check=False)
    if status.returncode == 0:
        print("No changes to s/websites.json — nothing to commit.")
        return

    message = f"Update bookmarks from {source_name} ({total} links, {category_count} categories)"
    run_git(["commit", "-m", message])
    push = run_git(["push", "origin", branch], check=False)
    if push.returncode != 0:
        stderr = push.stderr.strip()
        stdout = push.stdout.strip()
        raise RuntimeError(stderr or stdout or "git push failed")
    if push.stdout.strip():
        print(push.stdout.strip())
    print(f"Pushed to origin/{branch}")


def sync(source_path: Path, *, skip_pull: bool = False, skip_push: bool = False) -> None:
    if not source_path.is_file():
        raise FileNotFoundError(f"Bookmarks file not found: {source_path}")

    branch = current_branch()
    print(f"Repository: {ROOT}")
    print(f"Branch: {branch}")

    if not skip_pull:
        print("Downloading latest changes from GitHub...")
        pull_latest(branch)

    print(f"Scanning {source_path}...")
    payload = write_websites_json(source_path, OUT_PATH)
    total = payload["total"]
    category_count = len(payload["categories"])
    print(f"Wrote {OUT_PATH} ({total} links in {category_count} categories)")

    if skip_push:
        print("Skipping git push (--no-push).")
        return

    print("Uploading to GitHub...")
    commit_and_push(branch, source_path.name, total, category_count)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Pull repo, parse bookmarks txt/csv, and push s/websites.json to GitHub.",
    )
    parser.add_argument(
        "--file",
        type=Path,
        help="Path to bookmarks txt/csv. Opens a file picker if omitted.",
    )
    parser.add_argument(
        "--no-pull",
        action="store_true",
        help="Skip git pull before generating JSON.",
    )
    parser.add_argument(
        "--no-push",
        action="store_true",
        help="Generate JSON locally without committing or pushing.",
    )
    args = parser.parse_args()

    source_path = args.file
    if source_path is None:
        source_path = pick_source_file()
        if source_path is None:
            print("No file selected.")
            raise SystemExit(1)

    try:
        sync(source_path, skip_pull=args.no_pull, skip_push=args.no_push)
    except (RuntimeError, FileNotFoundError) as error:
        print(f"Error: {error}", file=sys.stderr)
        raise SystemExit(1) from error


if __name__ == "__main__":
    main()
