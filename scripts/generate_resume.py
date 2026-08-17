"""Copy Kai_Morgan_IT_Sup_Resume.docx into files/ and export the site PDF."""

from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r"E:\Personal\Career\Kai_Morgan_IT_Sup_Resume.docx")
DOCX = ROOT / "files" / "Kai_Morgan_IT_Sup_Resume.docx"
PDF = ROOT / "files" / "Kai_Morgan_Resume.pdf"

EXPORT_PS = r"""
$ErrorActionPreference = "Stop"
$docx = $env:RESUME_DOCX
$pdf = $env:RESUME_PDF
$word = $null
$doc = $null
try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $word.DisplayAlerts = 0
    $doc = $word.Documents.Open($docx, $false, $true)
    if (Test-Path -LiteralPath $pdf) {
        Remove-Item -LiteralPath $pdf -Force
    }
    $doc.ExportAsFixedFormat($pdf, 17)
} finally {
    if ($doc) { $null = $doc.Close($false) }
    if ($word) { $null = $word.Quit() }
    if ($doc) { [System.Runtime.Interopservices.Marshal]::ReleaseComObject($doc) | Out-Null }
    if ($word) { [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
"""


def copy_docx() -> Path:
    source = SOURCE if SOURCE.exists() else DOCX
    if not source.exists():
        raise SystemExit(
            "Resume source not found. Place Kai_Morgan_IT_Sup_Resume.docx in files/ "
            f"or at {SOURCE}"
        )

    DOCX.parent.mkdir(parents=True, exist_ok=True)
    if source.resolve() != DOCX.resolve():
        shutil.copy2(source, DOCX)
        print(f"Copied {source} -> {DOCX}")
    else:
        print(f"Using existing {DOCX}")
    return DOCX


def export_pdf(docx: Path) -> None:
    env = os.environ.copy()
    env["RESUME_DOCX"] = str(docx)
    env["RESUME_PDF"] = str(PDF)
    subprocess.run(
        ["powershell", "-NoProfile", "-Command", EXPORT_PS],
        check=True,
        env=env,
    )
    print(f"Wrote {PDF} ({PDF.stat().st_size} bytes)")


def main() -> None:
    export_pdf(copy_docx())


if __name__ == "__main__":
    main()
