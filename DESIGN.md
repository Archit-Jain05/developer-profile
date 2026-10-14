---
name: Archit Jain, developer portfolio
description: A night studio in black, white and Signature Burgundy, where finished work sits in a warm burgundy light.
colors:
  signature-burgundy: "#6d001a"
  burgundy-haze: "rgba(109, 0, 26, 0.35)"
  studio-black: "#000000"
  well-black: "#0d0d0d"
  workbench-charcoal: "#1a1a1a"
  raised-charcoal: "#262626"
  chalk-white: "#ffffff"
  silver-ink: "#d0d0d0"
  ash-ink: "#a6a6a6"
  hairline: "rgba(255, 255, 255, 0.12)"
  hairline-strong: "rgba(255, 255, 255, 0.24)"
  paper-white: "#ffffff"
  day-well: "#f4f7fd"
  day-card: "#e8eefa"
  day-raised: "#dae3f6"
  day-blue: "#1b3a9e"
  ink-navy: "#0a0f24"
  navy-body: "#1f2a44"
  navy-meta: "#4a5878"
  day-hairline: "rgba(20, 40, 110, 0.14)"
  day-hairline-strong: "rgba(20, 40, 110, 0.28)"
typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(5rem, 15vw, 18rem)"
    fontWeight: 500
    lineHeight: 0.8
    letterSpacing: "-0.065em"
  headline:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(3rem, 7vw, 7.5rem)"
    fontWeight: 500
    lineHeight: 0.95
    letterSpacing: "-0.05em"
  title:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(2rem, 3.4vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0"
  label:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.01em"
  meta:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
  accent-serif:
    fontFamily: "Bodoni Moda, Didot, Georgia, Times New Roman, serif"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0"
rounded:
  sm: "8px"
  md: "16px"
  lg: "24px"
  pill: "999px"
spacing:
  sp-1: "8px"
  sp-2: "16px"
  sp-3: "24px"
  sp-4: "32px"
  sp-5: "40px"
  sp-6: "48px"
  sp-8: "64px"
  sp-10: "80px"
  sp-12: "96px"
  sp-16: "128px"
components:
  button-primary:
    backgroundColor: "{colors.signature-burgundy}"
    textColor: "{colors.chalk-white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.chalk-white}"
    textColor: "{colors.signature-burgundy}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.chalk-white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 24px"
    height: "48px"
  button-ghost-hover:
    backgroundColor: "{colors.chalk-white}"
    textColor: "{colors.studio-black}"
  card:
    backgroundColor: "{colors.workbench-charcoal}"
    textColor: "{colors.silver-ink}"
    rounded: "{rounded.md}"
    padding: "32px"
  card-hover:
    backgroundColor: "{colors.raised-charcoal}"
  input:
    backgroundColor: "{colors.well-black}"
    textColor: "{colors.chalk-white}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
    height: "48px"
  tag:
    backgroundColor: "{colors.raised-charcoal}"
    textColor: "{colors.silver-ink}"
    typography: "{typography.meta}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "32px"
  nav-bar:
    textColor: "{colors.silver-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "64px"
---

# Design System: Archit Jain, developer portfolio

## Overview

**Creative North Star: "The Night Studio"**

A dark workshop after hours. The room is black and quiet; the finished pieces sit under a single warm light and can be picked up and turned. Every page is that studio: a calm black ground, white type that speaks plainly and with confidence, and burgundy light that drifts through the room, gathering on the work and on Archit himself. Nothing competes with it, and nothing in the room is there for decoration.

The mood is **calm, premium and crafted**. At rest the page is still, spacious and expensive-feeling, with care visible in the edges, spacing and type. Under the hand it becomes **tactile and playful**: buttons fill as you reach for them, the shattered A pulls itself together as you scroll, rows wipe white under the pointer. Calm is the resting state; play is the response to touch. The site never moves just to attract attention.

The studio also has a day. By day the blinds are up: a plain white page, deep-navy type and a single blue accent, with the hero's smoke turned to dark blue ink drifting through white. Day is a plain, clean white by choice (a rose-tinted version and a burgundy-tinted one were both tried and rejected as pink and plain). The site follows the device's light or dark setting until the visitor uses the switch in the nav, and then remembers their choice. Burgundy is the night accent; blue is the day one.

Scale does the talking instead of colour. The name is set as a wall of type across the foot of the hero, with the background-removed portrait standing in the gap between first name and surname; section headings are set nearly as large and just as tight, and the reading text underneath relaxes to normal spacing. Burgundy is rare enough that wherever it appears, it means something.

**Key Characteristics:**
- Two themes: a plain white page with navy type and a blue accent by day, and a black page with white type and Signature Burgundy `#6D001A` (exactly as supplied) at night. The theme follows the device until the visitor chooses.
- At night, burgundy light everywhere, never flat: a moving fluid light in the hero, a glow behind the portrait, and two faint glows behind every other section that drift as you scroll. By day there are no glows; the smoke is dark blue.
- Huge, tightly tracked Inter for names and headings; the surname and a few phrases in Bodoni Moda italic.
- Full-width 12-column compositions on an 8-point spacing grid.
- Generously rounded, lifted surfaces; pill-shaped controls.
- Interactive 3D where it earns its place: a floor of tiles showing the real sites he has built inside the opening frame, and a wall of project panels that file in, circle the text and file out.
- Day and night, following the device, swapped by a switch in the nav (and in the phone menu) and remembered per visitor. The admin is always night.

## Colors

A near-monochrome studio in two themes: white over black at night and navy over white by day, with one accent each (burgundy at night, blue by day) reserved for actions and light. Every colour is a token in `tokens.css`: day is `:root`, night is `[data-theme="dark"]`, and components only ever use the tokens. Two multipliers carry the difference in mood: `--glow` (burgundy light, 1 at night, 0 by day) and `--shade` (black shadows, 1 at night, 0.25 by day).

### Primary
- **Signature Burgundy** (`signature-burgundy`): the night accent (day uses Day Blue instead). Primary buttons, the "Now" badge, the current-section underline in the nav, form focus edges, the cracks inside the stone A, and every light on the page: the hero's fluid light, the glow behind the portrait and the drifting glows behind the sections. Always the exact supplied value.
- **Burgundy Haze** (`burgundy-haze`): the same burgundy at 35% for soft fills, such as the focus glow on inputs, a selected topic chip, or the glow inside a project's preview card. It is a transparency of Signature Burgundy, never a new tint.

### Night neutrals
- **Studio Black** (`studio-black`): the page itself, about 80% of every screen.
- **Well Black** (`well-black`): recessed wells: input fields, the contribution calendar.
- **Workbench Charcoal** (`workbench-charcoal`): preview cards, the wall's project covers, dialogs and the form card, roughly 15% of the page. It is 9 L* above the page so it reads as its own surface.
- **Raised Charcoal** (`raised-charcoal`): something raised inside a card, card hover, tags.
- **Chalk White** (`chalk-white`): the lead colour: headings, the name, primary text, the keyboard focus ring.
- **Silver Ink** (`silver-ink`): body text (11.9:1 on a card).
- **Ash Ink** (`ash-ink`): meta such as dates, counts and captions (7.6:1 on a card).
- **Hairline / Strong Hairline** (`hairline`, `hairline-strong`): dividers, field borders, ghost button outlines.

### Day neutrals
By day the page is plain white, and every grey is a pale blue instead, so the whole room reads as one cool light. Cards are clearly off the page.
- **Paper White** (`paper-white`): the page by day, about 80% of every screen.
- **Day Well** (`day-well`): recessed wells: input fields, the contribution calendar.
- **Day Card** (`day-card`): cards, dialogs and the form card by day.
- **Day Raised** (`day-raised`): raised inside a card, card hover, tags.
- **Day Blue** (`day-blue`, `#1B3A9E`): the accent by day: buttons, the "Now" badge, the nav underline, focus tints, the hero smoke's family.
- **Ink Navy** (`ink-navy`): the lead colour by day: headings, the name, primary text, the keyboard focus ring.
- **Navy Body** (`navy-body`): body text (12:1 on a card). **Navy Meta** (`navy-meta`): dates, counts, captions (5.6:1).
- **Day Hairlines** (`day-hairline`, `day-hairline-strong`): navy at 14% and 28%.

### Fixed in both themes
- Text on the accent (burgundy at night, blue by day) is always white (`--on-accent`).
- The company and school logo tiles are always white (with a hairline edge by day), because the logos were drawn for white pages.
- Text laid over the photo (the hero links on a phone) is set for the photo: white on a dark halo.
- Monochrome technology logos (Next.js, GitHub, Vercel and the like) are drawn in the ink colour; the rest keep their brand colours. The contribution calendar uses GitHub's own greens for each theme.

### Named Rules
**The Signature Rule.** Burgundy appears only where Archit would sign: actions, the light, and the current or selected state. It is always `#6D001A`. If a burgundy element is too dark to read, change its size or what sits behind it, never its hex.

**The Plain Day Rule.** By day there are no tinted washes: a white page, pale-blue cards, and one blue accent. Italic phrases and the surname stay in the text colour (`--emphasis` is `currentColor`). Never tint the white.

**The Ink Leads Rule.** "Main colour" means the ink, not the background: Chalk White at night, Ink Navy by day. Headings, the name and every primary label are set in it.

**The Burgundy Light Rule.** At night all light in the studio is Signature Burgundy: the hero's fluid light, the solid-cored glow behind the portrait, and two faint glows (60% at the core, fading to nothing) fixed behind the rest of the page and drifting as it scrolls. No night section is ever flat black, and no light is ever another colour. By day the same smoke is dark blue and there are no glows.

## Typography

**Display Font:** Inter (with -apple-system, Segoe UI, sans-serif)
**Body Font:** Inter (same stack)
**Accent Font:** Bodoni Moda, italic (with Didot, Georgia, serif)

**Character:** Inter, clean and neutral, turns monumental when set huge and tight; Bodoni Moda italic, high-contrast and elegant, sets the surname and a few phrases as the human counterpoint. Modern and composed, never quirky.

### Hierarchy
- **Display** (500, `clamp(5rem, 15vw, 18rem)`, 0.8, -0.065em): the first name across the foot of the hero, with the surname beside it in the accent serif at the same size.
- **Headline** (500, `clamp(3rem, 7vw, 7.5rem)`, 0.95, -0.05em): section titles and the project names in the index, set like the name. The contact heading goes larger still.
- **Title** (600, `clamp(2rem, 3.4vw, 3rem)`, 1.2): smaller section titles, such as GitHub. The heading inside the opening frame and the line on the project wall sit between Title and Headline, at medium weight.
- **Body** (400, 1.0625rem / 17px, 1.65): reading text, capped around 65–75 characters a line.
- **Label** (600, 0.9375rem / 15px, +0.01em): buttons, nav links, text links.
- **Meta** (400, 0.8125rem / 13px): dates, counts, tags and captions, in Ash Ink.
- **Accent serif** (Bodoni Moda italic, weight 500, optical size 28): the surname in the hero, and phrases marked with *asterisks* in the content (the tagline, the intro, the frame heading, the wall line, the skills statement). Set inline on the same baseline, in the colour of the text around it. Weight 500 at optical size 28 because at display size the browser would choose Bodoni's largest optical size, whose hairlines all but vanish.

### Named Rules
**The Wall of Type Rule.** Tight tracking belongs only to huge type (display and headline). Everything a visitor reads at length uses normal spacing; tight tracking at reading size reads as cramped.

**The Sparing Serif Rule.** The serif italic appears in a phrase or two per section at most, marked in the content with asterisks, and never for whole paragraphs.

## Layout

The page uses the full width with gutters (24px, 48px from 768px, 80px from 1200px) on a **12-column grid** with 24/32/40px gaps. Width is capped at 1760px only so lines don't run absurdly long on ultra-wide screens. Sections use real compositions: the parted name in the hero, a statement beside an arched portrait, a full-width index of project names, rows that read across the whole width, and a sticky statement beside the skills groups, rather than one centred column. Section spacing is 96px, 128px from 768px, and 160px from 1200px.

The opening is pinned for about three screens: the name parts, the portrait steps back and a frame opens out of the gap until it fills the screen. The project wall pins for about four screens while the panels file through. Below 1024px the hero stacks the name and tagline above the portrait, with the links at its foot; below 768px every composition is one column and side-sliding entrances become rising ones. On a phone held sideways, the hero is sized from the screen height.

**The Eight-Point Rule.** Every margin, padding, gap and offset is a multiple of 8 (8, 16, 24, 32, 40, 48, 64, 80, 96, 128). A test fails the build if one slips. Positions anchored to fluid type go through a named variable, never a raw `vw` offset.

**The Full-Width Rule.** No section lives in a narrow centred column. If a layout could be a single column down the middle, compose it across the grid instead.

## Elevation & Depth

Surfaces are **lifted**: cards, panels and floating controls sit above the black page on a soft, deep, downward shadow. The shadow is diffuse and dark, never a crisp outline or a coloured halo. On top of that, depth comes from the burgundy light: the light behind the portrait and behind every section gives the studio its z-axis, and the 3D scenes add real perspective.

Current state: the scrolled nav, dialogs and the project preview card use the lifted shadow; the contact form card is still flat. Bring it into line when it is next touched.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0 24px 48px -24px rgba(0, 0, 0, 0.9)`): the standard elevation for cards, the scrolled nav pill and floating panels.
- **Dialog** (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 40px 100px -30px rgba(0, 0, 0, 0.9)`): the detail dialog, the highest surface, with a faint top highlight.
- **Burgundy pull** (`box-shadow: 0 16px 32px -16px rgba(109, 0, 26, 0.9)`): under a primary button only while hovered, as if the light caught it.
- **Well** (`box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.6)`): pressed-in wells.

### Named Rules
**The Downward Light Rule.** Shadows always fall down and away (a positive y offset with a negative spread). Zero-offset glows and hard offset shadows don't belong in the studio.

## Shapes

Forms are generously rounded on the 8-point scale, with corner size growing with the surface: 8px for fields and small media, 16px for cards and wells, 24px for big panels and the form card, and fully round pills for every button, tag, chip and the nav bar. White logo tiles (48px square with 8px corners in the rows, 72px in dialogs) hold company and school marks that were drawn for white pages. The portrait in About sits in an arch: fully round at the top, 24px corners at the foot. Near-square 2–4px corners were rejected and don't return.

## Components

### Buttons
Soft pills that are fun to press.
- **Shape:** fully round (999px), at least 48px tall (40px for the small variant).
- **Primary:** Signature Burgundy with white text and a burgundy border in both themes, padded 8px by 24px, in the label style.
- **Hover / Focus:** a fill in the ink colour rises from the bottom (0.5s ease-out), the button lifts 2px and picks up the burgundy pull shadow, and any icon dips once. At night the fill is white and the label turns burgundy; by day the fill is black and the label stays white, since burgundy on black is 1.67:1. Pressing scales it to 96%. Focus uses the same fill plus the focus ring.
- **Ghost:** transparent with a Strong Hairline outline; on hover the ink fill rises and the text takes the page colour.
- **Loading:** while sending, the label changes ("Sending…") and the paper-plane icon flies out of the button and loops back in.

### Text links
A label in Chalk White resting on a faint hairline; on hover a white rule draws in from the left. They never get a trailing arrow. On touch screens they, and the links in the hero bar, gain an invisible 8px hit area.

Short labels (the nav, the hero bar, the contact links) roll when pointed at or focused: each letter slides up and an identical copy rises in behind it, one letter after another, 16ms apart (`RollText.jsx`). Screen readers get the plain word. Under reduced motion they stay put.

### Cards / Containers
- **Corner Style:** 16px (24px for large panels and the form card).
- **Background:** Workbench Charcoal; Raised Charcoal on hover for clickable cards.
- **Shadow Strategy:** Lift (see Elevation & Depth).
- **Border:** none on content cards; hairline on dialogs and wells.
- **Internal Padding:** 32px, 24px on phones.
- Rows open a detail dialog that grows out of the row and shrinks back into it.

### Inputs / Fields
- **Style:** Well Black, a 1px Hairline border, 8px corners, 48px minimum height. Labels sit above in Silver Ink.
- **Focus:** the border turns Signature Burgundy with a 4px Burgundy Haze ring, inside a 2px outline in the ink colour set 2px off the field, so focus is plain in either theme.
- **Error:** a Silver Ink border with a Burgundy Haze ring, and the message in white below the field so it stays legible, easing in. On a failed send, focus moves to the first field to fix and the status line says so.

### Tags and chips
Pills in Raised Charcoal with Silver Ink meta text, 32px tall. A selectable topic chip turns Burgundy Haze with a burgundy edge when chosen.

### Day/night switch
In the nav bar, after the Résumé button on desktop and beside the menu button on phones; the phone and tablet menu drawer also carries a "Theme" row with its own switch. An 80 by 40px pill with a Strong Hairline edge holding a sun and a moon; a 40px knob in the ink colour slides under the current one (0.5s ease-out) and its icon takes the page colour. It is a `role="switch"` labelled "Night mode". The site follows the device's `prefers-color-scheme` (live, if the device changes) until the switch is used; the choice is then stored per visitor. A script in `index.html` applies the theme before the first paint, so a reload never flashes the other one. Switching opens the new theme as a circle growing out of the switch over the whole screen (a View Transition, 0.7s ease-out); without View Transitions, or under reduced motion, it swaps at once. The 3D scenes read the theme every frame and follow it. On phones and tablets, opening the menu moves focus into it; Escape closes it and hands focus back.

### Navigation
A pill bar 64px tall. Over the hero it is transparent, on a black fade; once you scroll it becomes a floating Lift pill in translucent charcoal with a light blur. Links are labels in Silver Ink, turning white on hover with a burgundy underline that grows from the centre. The section currently in view keeps its link white and underlined. On phones the links fold into a round menu button that opens a staggered drawer; opening it moves focus to the first link, and Escape closes it and hands focus back to the button. The first Tab on any page shows a "Skip to content" pill at the top left.

### The splash (Archit's signature)
The first screen of a visit: Archit's own signature writes itself straight onto the page (no card behind it), in the text colour (navy by day, white at night). It is one smooth pen line of even width along 12 strokes, drawn in his writing order (the A, its big loop running straight on into the underline, r, c, h, i and its dot, t, the loop over the top, the arrow swash last), each for its share of 2.2s by length, with no pause between strokes. The strokes follow a photo of his real signature, so the shape is his; the weight is even (an earlier traced version showed jagged edges). His printed name fades in underneath as it finishes, the counter rolls to 100, and the signature lifts a little and the screen fades into the hero. Under reduced motion the signature is shown whole. It plays once per visit.

### The opening (signature)
The hero and the frame are one pinned scene. A slow fluid light moves behind the page (burgundy smoke at night, dark blue ink in white by day), and the pointer repels it the way a magnet repels dots: a grid of springy points is pushed away from the pointer, overshoots a little and settles back, and the smoke is shifted by that displacement (so it parts around the cursor and drifts back, with no lens effect). The name runs across the foot of the screen, first name in Inter and surname in Bodoni Moda italic, with the portrait standing in the gap between them (the surname passes in front of it) and a hairline bar of links behind it, led by "Skip intro" (top right on wide screens, first in the bar on narrow ones). The tagline is "You dream it, we make it." Scrolling parts the name to the edges, the portrait steps back, and once it has gone a frame with "+" marks in its corners opens out of the gap until it fills the screen. Inside, under the heading (set at the top), a floor of tiles seen from above shows only the real screenshots of the sites he has built, shown whole and never cropped, fading out toward the edges, with a black tile carrying his A in the middle. Tiles rise when pointed at (the A tile too); the floor turns slowly, faster as you scroll. It starts loading as soon as the page is idle and is flat textured quads, so it is light.

### Project index
The project names set large, one per row between hairlines, with no tech list. The row nearest the middle of the screen is brightest and the others dim. Rows with a screenshot carry a small thumbnail at the far right (160px wide, 96px on phones). With a mouse, pointing at that thumbnail (and only it) opens a larger preview beside the pointer, leaning up to 6° toward the way it is moving and kept below the nav; the hovered name slides 16px right. On touch, the description shows under each name and rows never dim below 60%. A row opens the project's dialog.

### Project wall
One conveyor of project panels, in three beats as you scroll. They file in from the left one by one in a line along the foot of the screen, each wrapping onto a tilted circle around the line of text in the middle (front low, back high). The last one arrives just as the circle is full, so there is a moment when every panel is on it together, turning. Then the first to go in is the first out: they leave one by one along the foot to the right. Panels are evenly spaced and move at one pace; further back is darker at night and paler by day. Panels seen from behind show their screenshot the right way round. A project with no screenshot gets a drawn cover (name and stack), and every panel starts with its cover so the wall is full at once, each real screenshot swapping in as it loads; the code and images preload when the page is idle. The pointer leans the whole circle a touch; under reduced motion it holds still at mid-scroll. The circle's size is fixed, so it crowds past about 12 projects. `wallMotion.test.js` checks the order and spacing.

### About
The intro set large on the left, over the portrait. The portrait fills the right of the section out to the screen edge, one big curved side, sized to the photo (so it is shown whole rather than cropped into a tall box), tinted with the accent colour and fading into the page where the text sits; it comes into focus as it rises. On narrower screens it goes back to an arched card between the text.

### Footer
The A mark as tall as the Pages column beside it, with "Get your idea made into reality" under it, then Pages, Elsewhere and Contact link columns on the 12-column grid (email, phone if shown, "Send a message"), and a credit line along the bottom. On phones the mark is small above the tagline and the contact column takes the whole row so the email never breaks.

### Scroll reveals
All scroll-driven CSS, off under reduced motion. Section titles wipe up out of a clip. Project rows, record rows and skills arrive one after another. The About intro lights up word by word as it crosses the screen, and the About portrait comes into focus as it rises (16px blur to sharp, 114% to 100%).

### Record rows
Experience and education as rows reading across the full width: mark, name, detail, dates and a last column ("Now", "Details" or the score). On hover a white fill wipes in from the left (and out to the right after) and the text turns black. A row opens its dialog.

### Skills groups
"Shipped with" and "Working with" as groups that open and close, the height easing where the browser supports it and a plus turning into a cross. Shipped skills list the projects they were used in.

### Scroll guide
On large screens with a mouse: a tick per section down the right edge, the current one long and white, beside a line that fills as the page scrolls. Labels appear when the guide is pointed at or focused.

## Do's and Don'ts

### Do:
- **Do** use `#6D001A` exactly for every burgundy element, and Burgundy Haze (the same colour at 35%) for soft fills.
- **Do** let white lead: headings, the name and primary labels in Chalk White on Studio Black.
- **Do** keep every spacing value on the 8-point scale, and compose sections across the 12-column grid.
- **Do** set names and section headings huge and tight, and reading text at normal spacing.
- **Do** keep the hero portrait in full colour, background-removed, standing in the gap in the name, with the surname passing in front of it so it stays whole.
- **Do** make interactive things answer the hand: rising fills, presses to 96%, rows that wipe white, a preview that follows the pointer, a frame and an A that respond to scroll.
- **Do** give every animation a reduced-motion path that removes movement but keeps fades and colour changes.

### Don't:
- **Don't** invent lighter, brighter or greyed variants of the burgundy.
- **Don't** add a light theme or a second accent colour.
- **Don't** use gradient text, or any gradient other than the burgundy lights.
- **Don't** put glass and blur on every surface. Blur is for the scrolled nav and the dialog scrim only.
- **Don't** use Arial, Poppins, Space Grotesk or Bricolage Grotesque, or tight tracking at reading sizes.
- **Don't** give every section the same title-plus-subtitle header, add skill percentage bars, or append "→" to links.
- **Don't** desaturate or greyscale the portrait.
- **Don't** use near-square 2–4px corners.
- **Don't** bring back the hold-to-charge hero: no page tilt, trembling text, lightning or strike.
- **Don't** leave a section on flat black: some burgundy light always sits behind the content.
