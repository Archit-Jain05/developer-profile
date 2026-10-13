---
target: home
total_score: 21
max_score: 36
na_heuristics: 10
p0_count: 0
p1_count: 3
target_identity: "file:D:\\Projects\\developer-profile\\src\\components\\public\\PublicSite.jsx"
target_fingerprint: "sha256:5735e8de949a42bb5b26363dca5546cc7161571d229ef85d83090ba5333b3427"
target_path: "D:\\Projects\\developer-profile\\src\\components\\public\\PublicSite.jsx"
timestamp: 2026-10-13T08-16-49Z
slug: src-components-public-publicsite-jsx
---
Method: dual-agent (A: design review agent · B: detector agent)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|-----------|-------|-----------|
| 1 | Visibility of system status | 3 | Nav underline, scroll guide and form states work; the 3.6-screen opening gives no progress cue and form errors are not announced. |
| 2 | Match with the real world | 3 | Plain voice; the résumé button shows a download icon but opens a tab; "4+ Projects" beside 10 listed. |
| 3 | User control and freedom | 2 | No way to skip the long pinned opening; Back from /contact replays the loader and lands at the top. |
| 4 | Consistency and standards | 2 | Two different contact forms; nav "Contact" leaves the page while the guide's scrolls; GitHub in neither nav. |
| 5 | Error prevention | 2 | Velora and bb3 "Open live site" return 404; wall panels can render blank white before images load. |
| 6 | Recognition rather than recall | 2 | You must hover or open each project to learn what it is and whose it was. |
| 7 | Flexibility and efficiency | 2 | Deep links work, but ~5 screens to Projects, behind a loader every visit. |
| 8 | Aesthetic and minimalist design | 2 | Polished and disciplined, but 46% of the page is pinned scroll and the wall repeats the index. |
| 9 | Error recovery | 3 | Plain per-field messages and a fallback email; focus doesn't move to the first error; error border is low-contrast. |
| 10 | Help and documentation | n/a | A one-page portfolio needs no help system. |
| **Total** | | **21/36** | **Acceptable (58%)** |

## Design Specificity Verdict

Design review: about half specific. Yours: the exact #6D001A as light, the A through loader, nav and 3D, Bodoni accents authored in your copy, "Shipped with" skills that cite real projects, plain first-person writing. Category kit: loader counting to 100, giant name with cutout, shader smoke, pinned scroll reveal, big-name project index with cursor preview, WebGL gallery, white-wipe rows, giant "Contact". Biggest issue: the spectacle points at the logo, not at the seven live client storefronts.

Detector: 27 code findings (18 font sizes off the documented scale, six of them icons and three sanctioned in DESIGN.md prose; 4 radii incl. a true 4px on calendar cells; 4 GitHub greens; 1 width transition on the scroll-guide tick). In-page: 16 elements; 9 "low contrast" misreads of hidden hover fills and 2 "buried image" pre-animation states are false positives; Bodoni frame heading, portrait glow and Inter are documented choices; tight line height on About and Skills statements and the width transition are real. No gradient text exists. Overlays live in the "[Human]" tab of the DevTools Chrome window.

## Overall Impression

The hero is the best moment. Structure is solid underneath. Biggest opportunity: put the client proof where the spectacle is, and make the long scroll scenes earn their length.

## What's Working

1. Disciplined identity: burgundy rare enough to mean something; the A threads through loader, nav and 3D.
2. Skills tied to evidence: "Shipped with Shopify" lists the seven stores.
3. Sturdy fundamentals: dialogs grow from their row and return focus; full render with Supabase down; honest GitHub error; complete reduced-motion version.

## Priority Issues

[P1] The proof is buried and partly dead. Seven client stores as one-word rows; screenshots only on desktop hover, dialogs or the wall, never in the list on touch; 8 of 10 dialogs don't say whose project it was or what you did; Velora and bb3 link to 404s. Fix: thumbnails in rows (touch too), relationship per project and client work first, a line on what you did, fix or drop dead links. Command: /impeccable clarify

[P1] The scroll scenes cost time and the opening undercuts itself. First beat opens a black window over the face; the heading collides with the A, which ends grey on flat black; wall panels can be blank white before images load; no way to skip. Fix: portrait leaves before the frame opens; keep burgundy at the climax and move the A clear; quiet "Skip intro"; wait for wall images. Command: /impeccable distill

[P1] Continuity breaks on Back. Back from /contact replays the loader and lands at the top. Fix: loader once per visit; restore scroll on in-app Back while still opening at the top on a fresh load. Command: /impeccable harden

[P2] The last evidence before the ask is the weakest: "Stars earned 0", "Followers 8" and a mostly empty calendar right before Contact. Fix: hide zero stats or end on client work. Command: /impeccable distill

[P2] Accessibility gaps in the contact path: burgundy-only focus/error borders ~1.5:1; errors not announced, focus stays on Send; no skip link; 18px hero tap targets; phone rows dim to ~0.25. Fix: white focus outline, focus and announce first error, skip link, bigger tap areas, brighter rows on touch. Command: /impeccable harden

## Persona Red Flags

First-timer: black box on the face at the first scroll; no length cue for the opening; rows don't look clickable; unlabelled guide. Stress tester: Back lands at top behind the loader; Velora/bb3 404; jump to wall shows blank panels; no empty states. Phone: loader before everything and after Back; Projects ~6 screens down; tiny hero tap targets; no screenshots in the list. Recruiter: Velora 404; "Software Developer" vs "intern"; only 2 of 10 projects say where they were built. Founder: hero never says Shopify; no scope or outcome per store; two .myshopify.com preview URLs read as unlaunched.

## Minor Observations

At 1440 the portrait hides the "J" (reads "lain"); preview card slides under the nav; "Visit ZootechX" stretches full width; About has no heading and the form sits in the footer landmark; no link-preview tags; same photo in hero and About.

## Questions to Consider

If the opening assembled a client's storefront instead of your logo, would anyone miss the A? Why are seven live stores labelled with one word and hidden behind a hover? Would you put "Stars earned 0" on your CV?
