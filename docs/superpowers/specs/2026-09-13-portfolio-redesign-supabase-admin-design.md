# Portfolio Redesign + Supabase Backend + Admin Dashboard — Design

**Date:** 2026-09-13
**Status:** Implemented (2026-09-13)
**Visual reference:** Pinterest pin "Professional Portfolio Website Design for Developers" (dark theme, hero with photo + code card, about + stats, skill bars, project cards, contact footer)

## 1. Goals

1. Redesign the public portfolio to follow the reference layout, using the existing cyan-blue brand colour instead of the reference's purple.
2. Move all content into a free Supabase backend so it can be edited without touching code.
3. Add a password-protected `/admin` dashboard to create, edit, delete and reorder every piece of content, upload images and the résumé, and read contact-form messages.
4. Ship with placeholder content wherever real content is missing, so the site is complete now and gets filled in through the admin.

## 2. Non-goals

- Blog, testimonials, multiple admin users, public sign-up.
- Email notifications for new messages (possible later).
- Server-side rate limiting of the contact form beyond the measures in §7.4.
- Drag-and-drop reordering (up/down buttons instead).

## 3. Tech stack

| Concern | Choice |
|---|---|
| Build | Vite + React 19 (existing) |
| Routing | `react-router-dom` — `/` public site, `/admin/*` dashboard |
| Backend | Supabase free plan: Postgres, Auth (email + password), Storage |
| Client | `@supabase/supabase-js` |
| Icons | `react-icons` (brand logos for skills + UI icons). `@mui/icons-material`, `@emotion/*` are removed. |
| Styling | Plain CSS, one file per component, shared design tokens as CSS custom properties in `src/styles/tokens.css` |
| Fonts | Montserrat (existing Google Fonts link); Cinzel font link removed (unused) |
| Hosting | Vercel (free), SPA rewrite so `/admin` deep links work |

## 4. Visual design

**Tokens (`tokens.css`)**
- Background: `--bg: #020d14`, `--bg-alt: #04151f` (alternating section bands), `--surface: #071c28` (cards)
- Border: `--border: rgba(13,156,233,0.22)`
- Accent: `--accent: #0d9ce9`, `--accent-strong: #3fb6f5` (hover), `--accent-glow: rgba(13,156,233,0.35)`
- Text: `--text: #e8f4fa`, `--text-muted: #8aa4b3`
- Radius: `--radius: 14px`; spacing scale `--s-1…--s-8` (4 → 96px); content max width `1200px`
- Hover states use `--accent-strong` (the current 22%-opacity hover colour is dropped; it was near-invisible).

**Section pattern:** small uppercase eyebrow label in accent colour → section heading → content. Sections alternate `--bg` / `--bg-alt`.

**Breakpoints:** mobile-first; `≥768px` tablet, `≥1024px` desktop. No horizontal scroll at 360px.

## 5. Public site — content flow

| # | Section (anchor id) | Desktop layout | Mobile layout |
|---|---|---|---|
| 1 | Nav (sticky) | Logo mark + "Archit Jain" · About · Skills · Experience · Education · Projects · Contact · **Resume ↓** button (accent) | Logo + hamburger; hamburger opens a full-width drop-down menu that closes on link click |
| 2 | Hero `#home` | Left: eyebrow (`profile.eyebrow`), "Hi, I'm **{first name}**" (name in accent), `profile.tagline` as second headline line, `profile.intro`, buttons **View My Work** (→ `#projects`) and **Download CV** (`profile.resume_url`), "Technologies I work with" row of skill icons (skills flagged `show_in_hero`). Right: `profile.hero_image_url` over a glowing accent circle, floating code card | Photo above text, code card hidden below 480px |
| 3 | About `#about` | Left: eyebrow "About me", `profile.about_heading`, `profile.about_body` (paragraphs split on blank lines). Right: 2×2 stat tiles from `profile.stats` | Stats 2×2 below text |
| 4 | Skills `#skills` | "Technologies I Master": 3-column grid of icon · name · percent · bar; bars animate from 0 to value when scrolled into view (IntersectionObserver; respects `prefers-reduced-motion`) | 1 column |
| 5 | Experience `#experience` | Full-width card rows ordered by `sort_order`: white logo panel · company · role · date range ("Present" when `end_date` null) · description · **Visit ↗** (if `website_url`) | Logo panel above text |
| 6 | Education `#education` | 3-across cards: logo panel · institution · course · score · years | Stacked |
| 7 | Projects `#projects` | Grid (3 across desktop, 2 tablet) of numbered cards: screenshot · title · description · tech tag chips · **GitHub ↗** / **Live ↗** (each only if set) | 1 column |
| 8 | Contact `#contact` | Three columns: (a) "Let's work together" eyebrow, "Have a project in mind?", `profile.contact_blurb`; (b) contact form — name, email, message, hidden honeypot, **Send**; (c) "Follow me": social icons (GitHub, LinkedIn), email, phone (phone only if `profile.show_phone`) | Stacked |
| 9 | Credit bar | "© {current year} Archit Jain." | Same |

**Code card** (hero) is generated, not stored:
```js
const developer = {
  name: "{profile.full_name}",
  skills: [ /* first 4 skill names by sort_order */ ],
  passion: "{profile.tagline}"
};
```

**Contact form states:** idle → sending (button disabled, "Sending…") → success ("Thanks! I'll get back to you soon.", form cleared) or error ("Couldn't send. Email me directly at {email}."). Client validation: all fields required, valid email, message 10–2000 chars.

**Accessibility:** all images have `alt` (from item name); icon-only links have `aria-label`; visible focus ring (`outline: 2px solid var(--accent)`); nav menu button has `aria-expanded`.

**Page `<title>`:** "{full_name} — {eyebrow}", default "Archit Jain — Software Developer".

## 6. Data model (Supabase Postgres)

All content tables have `id uuid primary key default gen_random_uuid()`, `created_at timestamptz default now()`, `updated_at timestamptz default now()` (trigger-maintained). List tables also have `sort_order int not null default 0`.

**`profile`** — exactly one row (enforced by `id int primary key default 1 check (id = 1)`)
| column | type | notes |
|---|---|---|
| full_name | text | "Archit Jain" |
| eyebrow | text | e.g. "SOFTWARE DEVELOPER" |
| tagline | text | hero second line |
| intro | text | hero paragraph |
| about_heading | text | |
| about_body | text | paragraphs separated by blank lines |
| hero_image_url | text | Storage public URL |
| resume_url | text | Storage public URL (PDF) |
| email | text | |
| phone | text | |
| show_phone | boolean | default true |
| github_url, linkedin_url | text | |
| contact_blurb | text | |
| stats | jsonb | array of exactly 4 `{ "value": "4+", "label": "Years building", "icon": "calendar" }`; `icon` ∈ `calendar, code, briefcase, graduation, trophy, star` |

**`skills`**: `name text not null`, `icon text` (react-icons key from a curated map, e.g. `SiReact`), `percent int not null check (percent between 0 and 100)`, `show_in_hero boolean default false`, `sort_order`.

**`experience`**: `company text not null`, `role text not null`, `logo_url text`, `start_date date not null`, `end_date date` (null = present), `description text`, `website_url text`, `sort_order`.

**`education`**: `institution text not null`, `course text not null`, `logo_url text`, `score text` (free text: "93.5%", "9.18 / 10 CGPA"), `start_year int`, `end_year int`, `sort_order`.

**`projects`**: `title text not null`, `description text`, `image_url text`, `tech text[] default '{}'`, `github_url text`, `live_url text`, `sort_order`.

**`messages`**: `name text not null check (char_length(name) between 1 and 100)`, `email text not null check (char_length(email) <= 254)`, `body text not null check (char_length(body) between 10 and 2000)`, `is_read boolean default false`, `created_at`.

**`admins`**: `user_id uuid primary key references auth.users(id) on delete cascade`. Helper `is_admin()` returns `exists (select 1 from admins where user_id = auth.uid())`, declared `security definer` with a fixed `search_path`.

**Storage:** one public-read bucket `media`, folders `profile/`, `logos/`, `projects/`, `resume/`. Object names `{folder}/{uuid}-{sanitised-filename}`. Limits: images (`jpeg, png, webp, avif, svg+xml`) ≤ 5 MB; résumé `application/pdf` ≤ 10 MB.

## 7. Security

### 7.1 Row Level Security (RLS enabled on every table)
| Table | anon + authenticated | admin (`is_admin()`) |
|---|---|---|
| profile, skills, experience, education, projects | `select` | `insert`, `update`, `delete` |
| messages | `insert` only (no select) | `select`, `update`, `delete` |
| admins | none | `select` own row |

### 7.2 Storage policies (`media` bucket)
Public read. `insert`, `update`, `delete` only when `is_admin()`.

### 7.3 Auth
- Email + password. Public sign-ups **disabled** in Supabase Auth settings.
- The admin user is created once in the Supabase dashboard; its UUID is inserted into `admins` by the setup script instructions.
- The client-side `/admin` route guard is UX only; RLS is the actual protection.
- Only the **anon (publishable) key** is used in the frontend. The service-role key is never put in the repo, `.env`, or the client.

### 7.4 Contact form abuse
- Hidden honeypot field; submissions with it filled are silently dropped client-side (success message shown).
- DB `check` constraints on lengths (above).
- Client disables Send for 30 s after a successful submit.

## 8. Data flow and resilience

- `src/lib/supabase.js` creates the client from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- `src/lib/content.js` exposes `fetchContent()` → `{ profile, skills, experience, education, projects }`, loading the five tables in parallel, each ordered by `sort_order`.
- `useContent()` hook states: `loading` → `ready` | `fallback`.
  - While loading: section skeletons (grey blocks), no placeholder text flash.
  - On error, or no response within 8 s: use `src/data/fallback.js` (same shape) and log a console warning.
  - If env vars are missing (e.g. a fresh clone): go straight to fallback, so `npm run dev` always renders.
- **Keep-alive** (prevents the free-plan 1-week inactivity pause): `.github/workflows/supabase-keepalive.yml`, cron every 3 days plus manual trigger, runs one `curl` GET against `/rest/v1/profile?select=id` using repo secrets `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
- `fallback.js` holds the same seed content as the database (§10). Edits made in `/admin` are not written back to it; this is accepted for now.

## 9. Admin dashboard (`/admin`)

**Routes**
- `/admin/login` — email + password form; errors shown inline ("Invalid email or password"). On success → `/admin`.
- `/admin` (guarded) — layout with sidebar tabs: **Profile · Skills · Experience · Education · Projects · Messages** (Messages shows an unread count badge), plus **View site ↗** and **Log out**. On mobile the sidebar becomes a top tab bar.
- A signed-in user whose id is not in `admins` sees "This account is not an admin" and a Log out button.

**Profile tab:** one form for all `profile` fields; image and résumé upload fields; stats editor with 4 rows (value, label, icon dropdown); **Save** button with "Saved ✓" / error feedback.

**List tabs (Skills, Experience, Education, Projects):** shared `CrudList` component.
- Table/list of items with thumbnail (where applicable), main text, **↑ ↓** reorder buttons, **Edit**, **Delete** (with confirmation built into the page — no `window.confirm`).
- **+ Add** opens an in-page form panel; the same panel is used for edit.
- Reorder swaps `sort_order` of two neighbours and saves both.
- Per-tab field config drives the form (text, textarea, number, date, checkbox, image upload, tag list, icon picker), so each tab is a config object and not a bespoke form.
- Skills icon picker: searchable dropdown over a curated map of ~40 `react-icons` (HTML, CSS, JS, TS, React, Next.js, Node, Flutter, Dart, Shopify, Python, Java, Git, Tailwind, Firebase, Supabase, Figma, etc.) showing the icon.

**Image upload component:** file picker + preview; validates type/size client-side; uploads to Storage; on save stores the public URL; when an image is replaced or its item deleted, the old object is deleted (best-effort — failure is logged, not blocking).

**Messages tab:** newest first; each shows name, email (mailto link), time, body; actions **Mark read/unread**, **Delete**. Unread ones visually highlighted.

**Unsaved changes:** navigating away from a dirty form shows an in-page "Discard changes?" prompt.

## 10. Seed and placeholder content

`src/data/fallback.js` is the source of truth; `npm run seed:generate` writes `supabase/seed.sql` from it. Seed images are served from `public/seed/` so seeded rows work before anything is uploaded to Storage.

- **profile:** full_name "Archit Jain"; eyebrow "SOFTWARE DEVELOPER"; tagline "I build apps for web and mobile."; intro — placeholder "[Placeholder] Two-line intro about what you build."; about_heading "I'm passionate about building useful software"; about_body — the current About Me text rewritten into two paragraphs with typos fixed; email architjain2005@gmail.com; phone +91 7710990629 with `show_phone = true`; GitHub and LinkedIn from the current header; hero image = current `archit.png` (uploaded to Storage during setup; fallback uses the bundled asset); résumé = current `resume.pdf` (same); stats: `4+ Years building`, `3 Roles`, `4+ Projects`, `9.18 CGPA`.
- **skills (placeholder percentages, all 80% until edited in admin):** HTML, CSS, JavaScript, React, Next.js, TypeScript, Flutter, Shopify, Git. First 6 have `show_in_hero = true`.
- **experience (real, newest first):** ZootechX — Software Developer — Aug 2026–present; Hophead.co — Web Developer Intern — Aug 2023–Aug 2024; Dcyber Techlabs Pvt. Ltd — Web Developer Intern — Aug 2022–Sep 2022. Descriptions from current site with typos fixed; logos = current assets; websites = current links.
- **education (real, newest first):** DJSCE — B.Tech — 9.18 / 10 CGPA — 2024–2027; SBMP — Diploma in Information Technology — 89.0% — 2021–2024; Utpal Sanghvi Global School — X Standard IGCSE — 93.5% — 2011–2021.
- **projects:** ASMAAN (drinkasmaan) — "Immersive 3D Shopify storefront for India's first botanical focus drink" — Shopify, Liquid, JavaScript — GitHub + live store; MoneyMind — "Flutter app for tracking expenses, scanning bills and creating invoices" — Flutter, Dart — GitHub; Velora — "[Placeholder] One-line description" — Next.js, TypeScript — GitHub + live; bb3 — "[Placeholder] One-line description" — Next.js, TypeScript — GitHub + live. Screenshots: placeholder image (`/placeholder-project.svg`) until uploaded.

Placeholder text always begins with `[Placeholder]` so it is easy to spot.

## 11. File structure

```
.github/workflows/supabase-keepalive.yml
supabase/
  config.toml           local Supabase CLI config (sign-ups disabled)
  migrations/20260913000000_portfolio_schema.sql   tables, triggers, is_admin(), RLS, bucket + policies
  seed.sql              generated from src/data/fallback.js
  verify-rls.mjs        anon-key security checks
  SETUP.md              step-by-step: create project, run SQL, disable sign-ups,
                        create admin user, insert into admins, upload assets, .env, Vercel
public/placeholder-project.svg
src/
  main.jsx              router: "/" → PublicSite, "/admin/*" → AdminApp
  styles/tokens.css, base.css
  lib/supabase.js, content.js, storage.js, format.js (dates, paragraphs)
  hooks/useContent.js, useInView.js
  data/fallback.js, iconMap.js
  components/public/    Nav, Hero, CodeCard, About, StatTile, Skills, SkillBar,
                        Experience, Education, Projects, ProjectCard, Contact,
                        ContactForm, Footer, Skeleton  (+ matching .css)
  components/admin/     AdminApp, RequireAdmin, Login, AdminLayout, ProfileTab,
                        CrudList, EntityForm, fields/(TextField, ImageField,
                        TagsField, IconPicker, …), MessagesTab, ConfirmDialog
  admin/config/         skills.js, experience.js, education.js, projects.js
.env.example            VITE_SUPABASE_URL=, VITE_SUPABASE_ANON_KEY=
vercel.json             SPA rewrite
```
The old `src/components/*.jsx`, `src/style/*.css` and `App.jsx` are replaced. `index.html` entry changes to `/src/main.jsx`. Existing image assets move to Storage via setup; copies stay in `src/assets` for the fallback.

## 12. Build phases (each reviewed before the next)

1. **Public site on fallback data** — tokens, all public sections, responsive behaviour, fallback.js. Works with no backend.
2. **Supabase backend** — `schema.sql`, `seed.sql`, `SETUP.md`, client + `useContent`, contact form writes to `messages`, keep-alive workflow. User creates the project and runs setup.
3. **Admin dashboard** — login, guard, Profile tab, CrudList + 4 configs, image upload, Messages tab.
4. **Deploy** — Vercel config, env vars, final checks.

## 13. Testing and verification

- `npm run lint` and `npm run build` pass at the end of every phase.
- Unit tests (Vitest) for pure logic: `format.js` (date ranges, "Present", paragraph splitting), contact form validation, reorder swap logic, fallback selection in `useContent` (error / timeout / missing env).
- Browser checks with Playwright at 1440px and 390px for each phase: every nav link scrolls to its section, mobile menu opens/closes, no horizontal scroll, no console errors, skill bars animate.
- **RLS verification script** (`supabase/verify-rls.mjs`, uses anon key only): confirms anonymous read of content works, anonymous insert/update/delete on content tables fails, anonymous message insert works, anonymous message select returns nothing, anonymous storage upload fails.
- Admin flow checks: login fails with a wrong password; non-admin account is blocked; add → edit → reorder → delete an item in each tab and see it reflected on `/`; image replace removes the old object; message submitted on `/` appears in Messages and can be marked read and deleted.

## 14. What the user provides

- Supabase account + project (free), then `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` and as GitHub repo secrets for keep-alive.
- An admin email + password (created in the Supabase dashboard, never shared in chat).
- Later, via `/admin`: skill percentages, Velora/bb3 descriptions, project screenshots, hero intro text.
