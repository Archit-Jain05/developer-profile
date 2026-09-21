# Portfolio redesign: neutral graphite, properly lit

Design spec for the second redesign of `developer-profile`. Supersedes the visual
direction in `2026-09-13-portfolio-redesign-supabase-admin-design.md`; the Supabase
schema, admin CRUD and content-loading architecture described there still stand.

## Why

The site owner raised four complaints about the shipped "graphite & silver" build:

1. The WebGL laptop sits in the hero's right column and crowds out his portrait. He
   wants his photo in that space, and the 3D moved somewhere it earns its place.
2. The colour scheme "looks too plain and blank". He wants it rich.
3. The site is effectively one page. The homepage should still carry all the data, but
   real routes should exist alongside it.
4. The design "looks ai generated and it doesn't have the authenticity of a good ui/ux
   design".

Four independent design directions were drafted and put through an adversarial
critique. This spec takes the convergent findings plus the owner's decisions.

## The measured diagnosis

Complaints 2 and 4 share one mechanical cause: the page has almost no value range and
no real accent.

| Element | L\* |
| --- | --- |
| page ground `--ink #0a0a0b` | 2.8 |
| `.glass` card, bottom-right | 3.4 |
| `.glass` card, top-left | 8.4 |
| `--chalk` body text | 93.8 |
| `--silver` accent | 86.3 |

`--glass-fill` is `linear-gradient(155deg, rgba(58,58,66,.3), rgba(18,18,22,.24))`.
Composited over `--ink`, its bottom-right corner lands at `#0c0c0e` — **0.6 L\* from the
page behind it**. The lower half of every card dissolves into the background, so nothing
reads as sitting on anything. The whole page lives inside a 5.6 L\* band.

Separately, the accent sits 7.5 L\* from the body text, which at that lightness is
indistinguishable. The site does not have a weak accent; it has none.

Depth in a dark interface comes from stacked values, not from shadow. That is the fix.

## Decisions taken

The owner's choices moved over the course of the session, and the final set is recorded
here rather than the intermediate ones.

**Palette: neutral graphite.** A saturated oxblood ground was tried and rejected — the
request was to "switch to simpler tones". This matters because it is the fourth palette
rejection in a row (cyan-to-violet, gold, graphite-and-silver, oxblood), and the two
live constraints are narrow: neutral tones, but not a flat page.

The resolution is that "plain and blank" was never a hue problem. It was a contrast
problem, and a neutral palette with a genuine value ladder satisfies both complaints
without reaching for chroma at all.

**No invented accent.** Offered a flat verdigris green, the owner chose the option where
the only chroma on the site comes from the technology logos and GitHub's own contribution
greens. Emphasis is therefore inversion — the brightest value on the ladder, filled, with
the page's ground as the label — not colour. A restrained orange-red is kept for form
errors, because that is semantic rather than decorative.

**Type: one superfamily.** Bricolage Grotesque was tried for display and rejected on
sight as "too cramped up"; it is a condensed, deliberately quirky grotesque, and the
request was for something "spaced out and modern and formal". Archivo now does all three
registers through its width axis: expanded at `wdth` 116 for display, normal for prose
and UI, narrowed to `wdth` 78 with tabular figures for the dense data register. Display
tracking is slightly positive rather than the -0.035em that caused the complaint.

## Tokens

### Colour

```
--void      #000000   L*  0.0   wells only — screen recesses, inputs
--ground    #08090A   L*  2.4   the page
--plinth    #0F1113   L*  4.4   alternating full-bleed bands
--surface   #16181B   L*  6.5   panels and cards
--riser     #1E2126   L*  9.3   tags, tiles, elements raised inside a card
--bevel     #3A3F46   L* 26.4   lit edges and hairline rules

--chalk     #EDEFF2   17.3:1 on ground — text, and the primary button fill
--ash       #A6ACB4    8.7:1 — secondary text
--slate     #7C848D    5.0:1 — dates, counts, metadata only
--danger    #F2764C    form errors only
```

The ladder spans 26 L* and is anchored on true black, against the previous scheme's 5.6
L* with no black anywhere. That single change is what makes a neutral page read as lit
rather than as empty.

### Light

One source, fixed at upper-right, and everything on the page derives from it. Speculars
are brightest at the top-right corner and die at the bottom-left; every shadow carries a
negative x-offset so it falls down-and-left. Nothing in the previous build had a non-zero
shadow x-offset, and its one light source drifted on a 26-second loop, so nothing could
cast a consistent shadow.

### Type

```
display   Archivo  wdth 116, wght 600, tracking +0.012em
headings  Archivo  wdth 112, wght 600, tracking +0.005em
body/UI   Archivo  wdth 100, wght 400, line-height 1.65
data      Archivo  wdth 78 + font-variant-numeric: tabular-nums
```

One family, three widths. Width does the work two extra typefaces would otherwise be
hired for, and an expanded grotesque heading reads as formal signage rather than as a
default. There is no monospace face, which also avoids the tracked-out mono data label
that appears on the generated-design tell list.

### Surfaces

`.glass` is retired. Three roles replace it, each visually distinct at a glance:

- **Plate** — solid `--ox-surface`, 2px radius, 1px `--ox-rule` border, a 1px inset
  highlight on the top edge, no drop shadow, no blur. Content panels.
- **Well** — `--ox-ground`, inset shade on the top edge. Screens, code, the contribution
  calendar, form fields. Reads as cut *into* the page.
- **Field** — no fill at all; columns separated by 1px rules. Long-form reading.

`backdrop-filter` is dropped from content surfaces and kept for exactly two elements
where it carries meaning: the sticky nav over moving content, and the modal scrim.

Depth comes from `inset 0 1px 0 var(--ox-rule)` over `inset 0 -1px 0 var(--ox-ground)` —
an embossed edge in the ground's own hue — rather than from the one drop shadow that is
currently under nine different surfaces.

## Page architecture

Four public routes. The critique's standing objection to the larger proposals was that
two pages the owner maintains beat five he abandons; `/about` and `/path` are both
longer versions of homepage sections and were cut.

| Route | Purpose |
| --- | --- |
| `/` | Everything, as now. The career timeline gets the depth treatment. |
| `/work/:slug` | One case study per project, with the device viewer. |
| `/now` | What he is building this month, dated, plus the live GitHub data. |
| `/contact` | The form, rebuilt. |
| `/admin/*` | Unchanged CRUD; picks up the new tokens automatically. |

`/now` is an indie-web convention rather than a portfolio-template section. It gives the
GitHub data a home instead of stranding it between Skills and Contact, and it is where
short build notes live. Prose is the one thing a template cannot supply, so it is the
cheapest real answer to complaint 4.

## The 3D

`HeroScene.jsx` leaves the hero. Its `Laptop`, `Phone`, instanced `Keys` and
`screenTexture.js` are extracted into a `DeviceViewer` used on `/work/:slug`.

The device body is chosen from the project's own `tech` row — Flutter renders a phone,
Shopify and Next.js render a laptop — via an explicit `platform` column so it stays
editable in the existing admin rather than being inferred forever. The screen carries
the project's real screenshot. `createScreenTexture(project)` already does this; it was
being fed `projects[0]` and `projects[1]` in a hero where nobody had selected them.

Dropped from the scene: `Float` (ambient bobbing with no meaning), `ScrollRig` (scroll
rotation belonged to a hero), the `mask-image` feathering on `.hero-scene` (feathered
canvas edges hide the fact that an object has nowhere to sit), and the "Drag to turn the
devices" hint. `PresentationControls` stays — dragging is genuine user-triggered motion.
The `lite` / `coarse` / `reducedMotion` detection and the `IntersectionObserver` frameloop
gating are kept verbatim.

The career timeline on `/` keeps a canvas, lazily loaded and intersection-gated. It must
not block first paint: the `sceneReady` gate at `PublicSite.jsx:47` currently holds the
loader until 3D textures resolve, and that gate is removed.

WebGL fallback is the project's screenshot at full width in the same plate — a better
fallback than the current ghost-glass device shapes, and less code.

## Verified defects to fix

Five problems confirmed in the current build, independent of any design change.

1. **`/contact` 404s on refresh.** `vercel.json` rewrites only `/admin/:path*`, so a
   contact link pasted into an email is broken for whoever clicks it. This is a
   prerequisite for every new route, not a risk.
2. **Nobody can copy the contact details.** `base.css:27-31` sets `user-select: none` on
   `body`, on a site whose purpose is being contacted.
3. **`[Placeholder]` is live in production** — `fallback.js:12`, `:144`, `:155`.
4. **Every project shows `/placeholder-project.svg`.** There is not one real screenshot
   in the content.
5. **`src/assets/` holds ten unused files** — duplicates of `public/seed/` plus a second
   copy of the portrait. Only `pfp.svg` is imported.

## Deletions

All four directions independently proposed each of these.

- `CodeCard.jsx` — the fake `developer.js` with macOS traffic lights and
  `alwaysLearning: true`. The most recognisable generated-portfolio object in the build.
- The two drifting blurred blobs, `Backdrop.css:12-56`.
- The cursor-following heading spotlight (`base.css:114-146`, `Hero.css:33-50`,
  `useSpotlightTitles.js`). It also sets `color: transparent` on every heading, which
  breaks Windows High Contrast.
- `useTilt` and `.project__sheen`.
- The nine identical `percent: 80` skill meters. The column stays in Supabase,
  unrendered, so the admin does not break. Skills regroup by how they are actually
  used — shipping with, building with, learning — tied to the projects that used them.
- `.link-arrow` on everything except outbound links, where the arrow means "new tab".
- The `linear-gradient(160deg,#ffffff,#e6f1fb)` logo tile — a pale blue left over from
  the rejected blue scheme, on a site with no other blue.

## Content, which blocks the design

The device viewer, the project plates and the case pages all render a generated mock
screen until real assets exist. This is sequenced first because it costs no code:

- Four real project screenshots, replacing `/placeholder-project.svg`.
- Real descriptions for Velora and bb3, and a real `profile.intro`.
- A background-removed cut-out of the portrait. Every direction proposed filtering around
  the pale blue studio backdrop; removing it lets the portrait bleed onto the ground with
  no rectangle at all. Ten minutes, and it improves every other decision here.

Each case page takes its tint from the documented client's real brand colours. Colour
sourced from shipped work is the one kind that structurally cannot look generated,
because it came from outside the design.

## Logo tiles

Each technology logo's tile colour is derived from its own relative luminance rather than
being one shared treatment. This fixes a real defect: Flutter's `#02569b` sits at 2.65:1
on the current ground and is effectively invisible, while reaching 6.07:1 on a bone tile.
React's `#61dafb` is the reverse. The alternating light and dark chips also give the
skills strip a rhythm it does not have.

## Quality floor

Not announced in the interface, but required of it: responsive to 360px; visible
`:focus-visible` on every interactive element in `--verdigris`; 44px minimum touch
targets; `prefers-reduced-motion` respected on the timeline, the device viewer and the
page-load sequence; AA contrast on every ramp step that carries text; the canvas
`aria-hidden` with the project list in the DOM first and each device separately tabbable.

Motion is one orchestrated page-load moment plus user-triggered responses. The
fade-and-slide-up entrance currently on each section is removed — scattered per-section
reveals are a generated-design default.

## Staging

1. **Tokens and truth.** The five verified defects, the new oxblood tokens, and the
   deletions above. Answers complaint 2 and most of complaint 4 in one commit, before any
   component moves, so the colour can be judged before the rebuild is committed to.
2. **Hero and type.** Portrait-led hero, Bricolage and Archivo, the three surface roles
   replacing `.glass`.
3. **Sections.** Re-laid-out on an asymmetric grid; the timeline gains depth.
4. **Routes.** `/work/:slug`, `/now` and the rebuilt `/contact`, with the Supabase
   migration and admin updates.
5. **README.** An SVG banner served from the same deployment and a generated profile
   README body, both driven from the same Supabase content.
