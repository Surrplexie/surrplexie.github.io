"""Generate Kai_Morgan_Resume.pdf from site content."""

from pathlib import Path

from fpdf import FPDF

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "files" / "Kai_Morgan_Resume.pdf"


class ResumePDF(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(0, 80, 90)
        self.cell(0, 10, "Kai Morgan", ln=True)
        self.set_font("Helvetica", "", 11)
        self.set_text_color(60, 60, 60)
        self.cell(0, 6, "IT Support & Help Desk | Entry-Level & Internship Roles", ln=True)
        self.ln(2)
        self.set_font("Helvetica", "", 9)
        self.cell(0, 5, "Milwaukee, WI area  |  kaibmorgan1@protonmail.com", ln=True)
        self.cell(0, 5, "linkedin.com/in/surrplexie  |  github.com/surrplexie  |  surrplexie.github.io", ln=True)
        self.ln(4)
        self.set_draw_color(0, 188, 212)
        self.set_line_width(0.4)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(6)

    def section(self, title: str):
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(0, 80, 90)
        self.cell(0, 7, title.upper(), ln=True)
        self.ln(1)

    def body_text(self, text: str):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 5, text)
        self.ln(2)

    def bullet(self, text: str):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 30, 30)
        self.set_x(12)
        self.multi_cell(0, 5, f"- {text}")


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)

    pdf = ResumePDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    pdf.section("Objective")
    pdf.body_text(
        "Seeking an internship or entry-level IT support, help desk, or desktop support role "
        "where I can apply methodical troubleshooting, clear user communication, and thorough "
        "documentation while learning production environments."
    )

    pdf.section("Education")
    pdf.body_text(
        "Associate of Applied Science, IT Computer Support Specialist\n"
        "Milwaukee Area Technical College (MATC)  |  GPA: 3.2 / 4.0\n"
        "Planned concentration: IT Information Systems Security"
    )

    pdf.section("Technical Skills")
    for item in [
        "Windows 10/11 administration, hardware and software troubleshooting, ticket documentation",
        "VirtualBox virtualization, TCP/IP networking (DNS, DHCP), Linux (Ubuntu, Kali)",
        "Wireshark, Nmap, Python; IDA Pro / Ghidra for lab and CTF work",
    ]:
        pdf.bullet(item)
    pdf.ln(2)

    pdf.section("Certifications")
    for item in [
        "Microsoft Enterprise Desktop Support Specialist (earned, Dec 2025)",
        "Competency in IT Hardware and Network Support - CompTIA (earned, May 2025)",
        "Competency in IT Software and Systems Support - CompTIA (earned, May 2025)",
        "CompTIA A+ and Security+ (in progress)",
    ]:
        pdf.bullet(item)
    pdf.ln(2)

    pdf.section("Selected Projects")
    for item in [
        "Binary Analysis Tool (Python) - CLI static analysis utility for string extraction and triage",
        "File Hash Scanner (Python) - SHA-256 directory scanning with VirusTotal API integration (in progress)",
        "TOTP Authenticator (Rust) - cross-platform RFC 6238 authenticator with local encrypted storage (in progress)",
    ]:
        pdf.bullet(item)
    pdf.ln(2)

    pdf.section("Professional Focus")
    pdf.body_text(
        "Primary career focus is IT support and help desk work. Security analysis, reverse engineering, "
        "and CTF participation support continuous learning and are discussed as supplemental experience."
    )

    pdf.output(str(OUT))
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
