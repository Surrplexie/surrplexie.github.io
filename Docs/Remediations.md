Dev logs rules; REM-1, REM-2 any of these terms are the new 'updates' like "Update 1", all major logs entered here. Note; REM-1.2, REM-1.4 etc. are only for GitHub commits and pushing, never named here.

---

## REM-1

**Navigation and internal links** — fixed broken routing before and during the Jekyll migration.

- Home page nav used wrong `../certs/`, `../labs/`, `../socials/` from site root; changed to `certs/`, `labs/`, `socials/` so links resolve on `/`.
- Socials page nav used bare `index.html` and same-folder paths; updated to `../index.html`, `../certs/`, `../labs/` so links work from the `socials/` subfolder.
- Standardized labels on all pages: **Home**, **Certifications**, **Labs & Projects**, **Socials** (socials had shortened “Certs” / “Labs” before).
- After Jekyll: primary nav moved into `_layouts/default.html` with `{{ '/' | relative_url }}` (and section paths) plus `aria-current="page"` on the active link.

---

## REM-2

**Homepage copy** — repositioned **surrplexie.github.io** for IT support / help desk internships and entry-level roles.

- Page title and banner set to **Kai Morgan | IT Support & Help Desk** (replacing generic portfolio / cyber-first headline).
- About section leads with help desk, desktop support, troubleshooting, documentation, and MATC **IT Computer Support Specialist** program.
- Security, reversing, and CTF framed as a **growth area**, not the primary job-search message.
- Resume toggle retitled **View Key Qualifications**; removed stray `[cite: …]` placeholders; bullet order: objective → support skills → also proficient → education → certifications.
- Focus cards reframed toward **certifications** and **labs** as interview talking points for IT roles (not malware-first security framing).
- Removed **Site is WIP!** line from final copy.

---

## REM-3

**HTML, grammar, and accessibility** — cleanup and assistive-tech improvements across pages.

- Fixed broken `<strong>` close tag on homepage (WIP banner era).
- Removed stray extra `</p>` tags on labs project blocks.
- Grammar and clarity pass on homepage and labs (e.g. “Primarily” vs “Primally”, SHA-256 / VirusTotal wording, clearer project descriptions).
- Cert images: alt text changed from generic “My Photo” to certificate-specific descriptions.
- Socials: `aria-label` on every icon-only link (email, Discord, LinkedIn, GitHub, Instagram, X, YouTube, Twitch, TikTok, Reddit, Pinterest, Snapchat).
- Jekyll layout: skip-to-main-content link; resume toggle uses `aria-expanded` / `aria-controls`; scroll-reveal in `script.js` only runs when `prefers-reduced-motion: no-preference`; `:focus-visible` styles added in CSS.

---

## REM-4

**Media paths (`images/` folder)** — local assets instead of remote GitHub Media URLs.

- Stopped hotlinking certificate and background assets from repo **Media/** raw URLs.
- Background in `style.css`: `images/bgrd.png` (renamed from `Untitled.png`).
- Microsoft cert image path updated from `IMG_5697.png` to **`Microsoft Enterprise Desktop Support Specialist.png`**.
- CompTIA competency images stored under `/images/` with full certificate titles as filenames:
  - `Competency in IT Hardware and Network Support.png`
  - `Competency in IT Software and Systems Support.png`
- Cert page image `src` values use Jekyll `{{ '/images/…' | relative_url }}` so paths work on GitHub Pages from any route.

---

## REM-5

**Layout and wide-screen UX** — homepage structure and header bar for large monitors.

- Added **`layout-intro`** grid: main about card plus **At a glance** sidebar (target roles, program, GPA, skill tags, quick links).
- Widened `.container` at large breakpoints (`1160px` / `1280px`) with `clamp()` horizontal padding.
- Added **`site-banner`** header at ~80–90% viewport width (`clamp(80vw, 86vw, 90vw)`), centered, `.banner-inner` flex for title + nav (later owned by Jekyll layout on all pages).

---

## REM-6

**Jekyll / GitHub Pages structure** — shared layout and build config.

- Added **`Gemfile`** with `github-pages` gem.
- Added **`_config.yml`**: site title (Kai Morgan), footer text, `url`, `baseurl`, exclude list (README, SECURITY, Gemfile, etc.).
- Added **`_layouts/default.html`**: charset/viewport, title, Font Awesome CDN, `style.css`, optional per-page `extra_stylesheets` / `scripts`, banner nav, footer, `{{ content }}`.
- Converted **`index.html`**, **`certs/index.html`**, **`labs/index.html`**, **`socials/index.html`** to front matter + layout (removed duplicated full HTML shells per page).
- Removed unused **`script.js`** copies under `certs/`, `labs/`, `socials/`; kept root **`script.js`** for homepage toggle and scroll reveal.
- Expanded **`style.css`**: cert entries, status badges (Earned / In Progress), labs project cards, responsive rules, reveal animation classes; **`socials.css`** for contact grid.

---

## REM-7

**Certifications page (`certs/index.html`)** — rebuilt list with renamed images and CompTIA slots.

- Replaced single Microsoft block with **`.cert-entry`** rows: header, issuer/meta line, optional image, status badge.
- **Microsoft Enterprise Desktop Support Specialist** — **Earned**, date issued 13 December 2025, image `Microsoft Enterprise Desktop Support Specialist.png`.
- Added two **earned** CompTIA competency entries (user-requested extra slots), each with image and **Earned** badge:
  - **Competency in IT Hardware and Network Support** — `Competency in IT Hardware and Network Support.png`, meta **Date Issued: 17 May 2025**.
  - **Competency in IT Software and Systems Support** — `Competency in IT Software and Systems Support.png`, meta **Date Issued: 17 May 2025**.
- **CompTIA Security+** — **In Progress** only (not attained): no certificate image; meta line **Date Issued:** left blank for later.
- **CompTIA A+** full-cert row was tried during editing then **removed** from the cert page so only earned/competency rows plus Security+ in-progress show there; homepage qualifications toggle still lists **CompTIA A+ & Security+ (in progress)**.
- Corrected invalid **`<motion>`** tags (editor typo) to **`<div>`** where they appeared.
- **Back to Profile** link uses `{{ '/' | relative_url }}`.

---

## REM-8

**Labs and socials** — same remediation era as homepage/cert work.

- **Labs:** projects rewritten as interview-ready blocks (problem, stack tags, outcomes); security work kept but described in professional, support-relevant language.
- **Socials:** contact grid structure unchanged; accessibility labels from REM-3. Heading still **`> Get In Touch`** (terminal style); noted for optional later polish to match IT-support tone on homepage.

---

## REM-9

**Planning review (May 2026)** — recommendations recorded only; no code shipped in that pass.

- Reviewed live site and backlog: replace template **`SECURITY.md`**, add meta description and Open Graph tags in layout, pin or add SRI to Font Awesome CDN, align socials intro copy with IT-support positioning, optional resume PDF on site, labs proof links (GitHub repos or screenshots).

---

## REM-10

**Dev log scaffold** — `Docs/Remediations.md` added to the repo.

- Created **`Docs/Remediations.md`** with cascading empty `## REM-*` headers (REM-2 through REM-128) and no body text yet.
- Git commit on **main** used message **REM-1** for that scaffold file only.

---

## REM-11

**Remediation log populated** — this file; end-to-end history from REM-1 through REM-11.

- Replaced corrupted empty header scaffold with sequential **REM-1 … REM-11** entries (no REM-x.y subsections).
- Documented navigation fixes, homepage repositioning, accessibility, media renames, layout, Jekyll migration, cert page final state, labs/socials pass, planning backlog, and log maintenance.
- **Live cert page after REM-7:** three **Earned** rows with images (Microsoft + two CompTIA competencies), one **In Progress** Security+ row without image; CompTIA A+ not listed on cert page.
- **Repo note:** `Docs/` holds internal dev history; add `Docs` to `_config.yml` `exclude` if this markdown should not publish as a public page on GitHub Pages.

---

## REM-13

**P0 and P1 job-search polish** — UI fixes, SEO, branding, proof links, and resume download.

- **P0:** Added missing `.github` brand color in `socials.css`; bumped Font Awesome from 6.0.0 to **6.7.2** (with SRI) in `_layouts/default.html` and `db-streaming1122/index.html` so `fa-x-twitter` renders.
- **P0:** Added **CompTIA A+** as **In Progress** on `certs/index.html` to match homepage qualifications toggle.
- **P1:** `_layouts/default.html` — `meta description`, canonical URL, favicon (`images/favicon.svg`), Open Graph and Twitter Card tags; per-page `description` in front matter; `_config.yml` site `description` and `og_image`.
- **P1:** Generated `images/og-card.png` and `files/Kai_Morgan_Resume.pdf`; `scripts/generate_resume.py` and `scripts/generate_og_card.py` (excluded from Jekyll build).
- **P1:** Homepage — **Download Resume (PDF)** button and aside link; `.cta-row` / `.cta-button-secondary` styles.
- **P1:** Socials — title/banner **Kai Morgan // Contact**; intro copy aligned to IT support / help desk hiring; external links use `rel="noopener noreferrer"`; social grid font matches site (`Roboto Mono`).
- **P1:** Labs — repository links for **binary-analyzer** and **custom2fa**; hash scanner links to contact page (no public repo yet); `.project-links` style.
- **P1:** Footer text updated to **© Kai Morgan (Surrplexie)** for consistent professional branding.
