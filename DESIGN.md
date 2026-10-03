---
name: Archit Jain, developer portfolio
description: A night studio in black, white and Signature Burgundy, where finished work sits under one warm light.
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
typography:
  display:
    fontFamily: "Instrument Sans, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(6rem, 29vw, 30rem)"
    fontWeight: 700
    lineHeight: 0.8
    letterSpacing: "-0.055em"
  headline:
    fontFamily: "Instrument Sans, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(3rem, 7.5vw, 8rem)"
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: "-0.045em"
  title:
    fontFamily: "Instrument Sans, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(2rem, 3.4vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Instrument Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0"
  label:
    fontFamily: "Instrument Sans, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.01em"
  meta:
    fontFamily: "Instrument Sans, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
  accent-serif:
    fontFamily: "Instrument Serif, Georgia, Times New Roman, serif"
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

A dark workshop after hours. The room is black and quiet; the finished pieces sit under a single warm light and can be picked up and turned. Every page is that studio: a calm black ground, white type that speaks plainly and with confidence, and one burgundy light that falls on the work and on Archit himself. Nothing competes with the light, and nothing in the room is there for decoration.

The mood is **calm, premium and crafted**. At rest the page is still, spacious and expensive-feeling, with care visible in the edges, spacing and type. Under the hand it becomes **tactile and playful**: buttons fill as you reach for them, the 3D pieces turn when you move, the keyboard's keys go down. Calm is the resting state; play is the response to touch. The site never moves just to attract attention.

Scale does the talking instead of colour. The first name is set as a wall of type behind a background-removed portrait, section headings are set nearly as large and just as tight, and the reading text underneath relaxes to normal spacing. Burgundy is rare enough that wherever it appears, it means something.

**Key Characteristics:**
- Black page, white type, one accent: Signature Burgundy `#6D001A`, exactly as supplied.
- A single burgundy light source, behind the portrait and behind each project device.
- Huge, tightly tracked Instrument Sans for names and headings; a few phrases in Instrument Serif italic.
- Full-width 12-column compositions on an 8-point spacing grid.
- Generously rounded, lifted surfaces; pill-shaped controls.
- Interactive 3D where it shows something real: the A logo, the project devices, the skills keyboard.
- Dark only.

## Colors

A near-monochrome studio, white over black, with one deep burgundy reserved for actions and light.

### Primary
- **Signature Burgundy** (`signature-burgundy`): the only accent. Primary buttons, the end of the hero name's gradient, timeline lines and dots, the "Now" badge, the current-section underline in the nav, form focus edges and the radial light behind the portrait and devices. Always the exact supplied value.
- **Burgundy Haze** (`burgundy-haze`): the same burgundy at 35% for soft fills, such as the focus glow on inputs, a selected topic chip, or a skill row lighting up when its key is pressed. It is a transparency of Signature Burgundy, never a new tint.

### Neutral
- **Studio Black** (`studio-black`): the page itself, about 80% of every screen.
- **Well Black** (`well-black`): recessed wells: input fields, the contribution calendar.
- **Workbench Charcoal** (`workbench-charcoal`): cards, panels, device stages and the form card, roughly 15% of the page. It is 9 L* above the page so it reads as its own surface.
- **Raised Charcoal** (`raised-charcoal`): something raised inside a card, card hover, tags.
- **Chalk White** (`chalk-white`): the lead colour: headings, the name, primary text, the keyboard focus ring.
- **Silver Ink** (`silver-ink`): body text (11.9:1 on a card).
- **Ash Ink** (`ash-ink`): meta such as dates, counts and captions (7.6:1 on a card).
- **Hairline / Strong Hairline** (`hairline`, `hairline-strong`): dividers, field borders, ghost button outlines.

### Named Rules
**The Signature Rule.** Burgundy appears only where Archit would sign: actions, the light, and the current or selected state. It is always `#6D001A`. If a burgundy element is too dark to read, change its size or what sits behind it, never its hex.

**The White Leads Rule.** "Main colour" means white, not the background. Headings, the name and every primary label are Chalk White on black.

**The One Light Rule.** There is one light in the studio: a radial burgundy glow with a solid core. It sits behind the portrait and behind each project device, and nowhere else. A second, differently coloured glow is a different room.

## Typography

**Display Font:** Instrument Sans (with -apple-system, Segoe UI, sans-serif)
**Body Font:** Instrument Sans (same stack)
**Accent Font:** Instrument Serif, italic (with Georgia, serif)

**Character:** A clean, formal grotesk that turns monumental when set huge and tight, paired with a soft serif italic that adds one human, handwritten note. Modern and composed, never quirky.

### Hierarchy
- **Display** (700, `clamp(6rem, 29vw, 30rem)`, 0.8): the first name in the hero, and nothing else. It carries the one gradient on the site, white into Signature Burgundy across the whole word.
- **Headline** (600, `clamp(3rem, 7.5vw, 8rem)`, 0.95, -0.045em): full-width section titles, set like the name.
- **Title** (600, `clamp(2rem, 3.4vw, 3rem)`, 1.2): section titles in a side column, and the contact heading.
- **Body** (400, 1.0625rem / 17px, 1.65): reading text, capped around 65–75 characters a line.
- **Label** (600, 0.9375rem / 15px, +0.01em): buttons, nav links, text links.
- **Meta** (400, 0.8125rem / 13px): dates, counts, tags and captions, in Ash Ink.
- **Accent serif** (Instrument Serif italic, 400): a phrase inside a heading, such as "Jain", "that shipped" or "so far". It is set in Silver Ink, rotated -4° and dropped slightly, crossing the heavy sans.

### Named Rules
**The Wall of Type Rule.** Tight tracking belongs only to huge type (display and headline). Everything a visitor reads at length uses normal spacing; tight tracking at reading size reads as cramped.

**The Sparing Serif Rule.** The serif italic appears in two or three headings across the whole site, never all of them, and never for body text.

## Layout

The page uses the full width with gutters (24px, 48px from 768px, 80px from 1200px) on a **12-column grid** with 24/32/40px gaps. Width is capped at 1760px only so lines don't run absurdly long on ultra-wide screens. Sections use real compositions such as side titles, splits, a bento of education cards, an alternating timeline and a pinned horizontal gallery, rather than one centred column. Section spacing is 96px, 128px from 768px, and 160px from 1200px.

The hero is pinned: it fills the screen while the rest of the page slides up over it on a slanted edge. Projects pin too, and scrolling moves the track sideways. Below 768px every composition collapses to one column, side-sliding entrances become rising ones, and the hero stacks name, surname, tagline and buttons in the band above the portrait. On a phone held sideways, the hero is sized from the screen height.

**The Eight-Point Rule.** Every margin, padding, gap and offset is a multiple of 8 (8, 16, 24, 32, 40, 48, 64, 80, 96, 128). A test fails the build if one slips. Positions anchored to fluid type go through a named variable, never a raw `vw` offset.

**The Full-Width Rule.** No section lives in a narrow centred column. If a layout could be a single column down the middle, compose it across the grid instead.

## Elevation & Depth

Surfaces are **lifted**: cards, panels and floating controls sit above the black page on a soft, deep, downward shadow. The shadow is diffuse and dark, never a crisp outline or a coloured halo. On top of that, depth comes from the One Light: the burgundy glow behind the portrait and devices gives the studio its z-axis, and the 3D scenes add real perspective.

Current state: the scrolled nav and dialogs already use the lifted shadow, but content cards are still flat tones. Bring them into line with this rule when cards are next touched.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0 24px 48px -24px rgba(0, 0, 0, 0.9)`): the standard elevation for cards, the scrolled nav pill and floating panels.
- **Dialog** (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 40px 100px -30px rgba(0, 0, 0, 0.9)`): the detail dialog, the highest surface, with a faint top highlight.
- **Burgundy pull** (`box-shadow: 0 16px 32px -16px rgba(109, 0, 26, 0.9)`): under a primary button only while hovered, as if the light caught it.
- **Well** (`box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.6)`): pressed-in wells.

### Named Rules
**The Downward Light Rule.** Shadows always fall down and away (a positive y offset with a negative spread). Zero-offset glows and hard offset shadows don't belong in the studio.

## Shapes

Forms are generously rounded on the 8-point scale, with corner size growing with the surface: 8px for fields and small media, 16px for cards and wells, 24px for big panels, device stages and the form card, and fully round pills for every button, tag, chip and the nav bar. White logo tiles (80px square, 16px corners; 56px on phones) hold company and school marks that were drawn for white pages. Sections meet the pinned hero on a slanted edge. Near-square 2–4px corners were rejected and don't return.

## Components

### Buttons
Soft pills that are fun to press.
- **Shape:** fully round (999px), at least 48px tall (40px for the small variant).
- **Primary:** Signature Burgundy with Chalk White text and a burgundy border, padded 8px by 24px, in the label style.
- **Hover / Focus:** a white fill rises from the bottom (0.5s ease-out), the label turns burgundy, the button lifts 2px and picks up the burgundy pull shadow, and any icon dips once. Pressing scales it to 96%. Focus uses the same fill plus the white focus ring.
- **Ghost:** transparent with a Strong Hairline outline; on hover the same white fill rises and the text turns black.
- **Loading:** while sending, the label changes ("Sending…") and the paper-plane icon flies out of the button and loops back in.

### Text links
A label in Chalk White resting on a faint hairline; on hover a white rule draws in from the left. They never get a trailing arrow. On touch screens they gain an invisible 8px hit area.

### Cards / Containers
- **Corner Style:** 16px (24px for large panels and the form card).
- **Background:** Workbench Charcoal; Raised Charcoal on hover for clickable cards.
- **Shadow Strategy:** Lift (see Elevation & Depth).
- **Border:** none on content cards; hairline on dialogs and wells.
- **Internal Padding:** 32px, 24px on phones.
- Clickable cards open a detail dialog that grows out of the card and shrinks back into it.

### Inputs / Fields
- **Style:** Well Black, a 1px Hairline border, 8px corners, 48px minimum height. Labels sit above in Silver Ink.
- **Focus:** the border turns Signature Burgundy with a 4px Burgundy Haze ring.
- **Error:** burgundy border, with the message in white below the field so it stays legible, easing in.

### Tags and chips
Pills in Raised Charcoal with Silver Ink meta text, 32px tall. A selectable topic chip turns Burgundy Haze with a burgundy edge when chosen.

### Navigation
A pill bar 64px tall. Over the hero it is transparent, on a black fade; once you scroll it becomes a floating Lift pill in translucent charcoal with a light blur. Links are labels in Silver Ink, turning white on hover with a burgundy underline that grows from the centre. The section currently in view keeps its link white and underlined. On phones the links fold into a round menu button that opens a staggered drawer.

### The lit device stage (signature)
Each project is shown on a 3D laptop or phone (Flutter and Dart projects get a phone) inside a 24px Workbench Charcoal panel lit from behind by the One Light. The devices turn when dragged with a mouse, and all of them share a single 3D canvas.

### The magnetic A (signature)
Behind the hero, the A logo is a white wireframe among drifting dark shards, light streaks and long orbital lines. It turns and leans toward the cursor like a magnet, its edges brighten while the cursor moves, and circling the cursor around it sets the shards swirling. It never needs a click.

## Do's and Don'ts

### Do:
- **Do** use `#6D001A` exactly for every burgundy element, and Burgundy Haze (the same colour at 35%) for soft fills.
- **Do** let white lead: headings, the name and primary labels in Chalk White on Studio Black.
- **Do** keep every spacing value on the 8-point scale, and compose sections across the 12-column grid.
- **Do** set names and section headings huge and tight, and reading text at normal spacing.
- **Do** keep the portrait in full colour, background-removed, standing in front of the name.
- **Do** make interactive things answer the hand: rising fills, presses to 96%, keys that go down, an A that turns to the cursor.
- **Do** give every animation a reduced-motion path that removes movement but keeps fades and colour changes.

### Don't:
- **Don't** invent lighter, brighter or greyed variants of the burgundy.
- **Don't** add a light theme or a second accent colour.
- **Don't** use gradients as decoration. The hero name's white-to-burgundy sweep is the only gradient text on the site.
- **Don't** put glass and blur on every surface. Blur is for the scrolled nav and the dialog scrim only.
- **Don't** use Arial, Inter, Poppins, Space Grotesk or Bricolage Grotesque, or tight tracking at reading sizes.
- **Don't** give every section the same title-plus-subtitle header, add skill percentage bars, or append "→" to links.
- **Don't** desaturate or greyscale the portrait.
- **Don't** use near-square 2–4px corners.
- **Don't** bring back the hold-to-charge hero: no page tilt, trembling text, lightning or strike.
