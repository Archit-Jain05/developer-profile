# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, weighted equally (confirmed 2026-10-03):

- **Recruiters and hiring managers** deciding whether to put Archit forward for an internship or a first full-time developer role.
- **Freelance clients** (founders and small brands) deciding whether to hire him to build a storefront, web platform or app.

Both arrive wanting to answer the same question quickly: has this person actually shipped real work, and how do I reach him?

## Product Purpose

The personal portfolio of Archit Jain, an IT student at DJSCE, Mumbai, who is also a software developer at ZootechX. It exists to get him hired or commissioned.

Success is any of these three visitor actions, all treated as equally valid outcomes (confirmed):

1. sending a message through the contact form or by email;
2. downloading the CV;
3. opening his live projects or GitHub to judge the work directly.

## Positioning

He is still studying but already ships for real, paying clients: ZootechX (current role, where he built Velora), Hophead.co (a year on their Shopify and React storefronts) and ASMAAN (a freelance Shopify storefront in pre-launch). Real client work, not coursework, is the claim another student portfolio cannot copy (confirmed).

## Operating Context

- Content is edited by Archit himself at `/admin` (email and password login, Supabase row-level security). Nothing on the public site should need a code change to update.
- Routes: `/` (every section on one scrolling page), `/contact`, `/admin/*`. Per-project case studies (`/work/:slug`) and a `/now` page are planned but not built.
- Contact form messages are stored in Supabase and read in `/admin`.
- The GitHub section pulls live public activity from the GitHub API.

## Capabilities and Constraints

- React 19 + Vite, React Three Fiber for 3D, Supabase for content, deployed on Vercel from `main`. npm is the package manager; `pnpm-lock.yaml` must stay untracked.
- If Supabase is unreachable, the site falls back to bundled copy in `src/data/fallback.js`; it must never break or show an empty page.
- Only the public anon key is ever used. The `service_role` key must never enter this project.
- A hidden heartbeat (`internal.heartbeat`, written twice a week by a GitHub Action) keeps the free Supabase project awake. It must stay invisible on the site and in `/admin`.
- Multi-page structure is a standing requirement: the homepage carries all the data, with real routes alongside it.

## Brand Commitments

Stated by Archit as binding across earlier sessions:

- Name **Archit Jain**; the **A** logo mark doubles as the first letter of the name.
- His own photo, background-removed and always in colour, is the face of the site.
- Palette from his own swatch: black `#000000`, burgundy **exactly `#6D001A`** (no derived tints), white. Dark only.
- 8-point spacing throughout.
- Voice: plain, first person, specific; describes real work without hype.

## Evidence on Hand

Real, usable now:

- Experience: ZootechX (software developer, Aug 2026 to present), Hophead.co (web developer intern, Aug 2023 to Aug 2024), Dcyber Techlabs (web developer intern, Aug to Sep 2022).
- Education: B.Tech at DJSCE (9.18 CGPA), Diploma in IT at SVKM's Shri Bhagubhai Mafatlal Polytechnic (89.0%), IGCSE at Utpal Sanghvi Global School (93.5%).
- Projects: ASMAAN, MoneyMind, Velora, bb3, with descriptions drawn from their repositories.
- Portrait cutout: `public/seed/archit-cutout.webp`. CV via the profile's `resume_url`.
- Live GitHub numbers, languages and contribution calendar.

Absent, and not to be fabricated:

- Project screenshots (the 3D devices show a placeholder screen until real ones are added in `/admin`).
- Working live links for Velora and bb3 (both currently return 404).
- Testimonials, client quotes, client logos, metrics or results.

## Product Principles

1. **Proof before claims.** Lead with shipped client work and links that open; never assert a skill the projects do not show.
2. **Two audiences, one page.** Every section should work for a recruiter scanning and a client evaluating, without a separate path for each.
3. **Three exits, always close.** A message, the CV and the real work should each be reachable from anywhere in a scroll or two.
4. **The site is part of the evidence.** Its own craft and interactivity show what he can build, but never at the cost of reaching the content or the contact.
5. **Editable without code.** Every visible fact comes from `/admin`, with a sensible fallback.

## Accessibility & Inclusion

No external standard has been set. Established in the project so far: `prefers-reduced-motion` removes movement while keeping state feedback, the keyboard focus ring stays white for 3:1 contrast, and body text is kept readable on the dark ground.
