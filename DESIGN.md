---
name: EUV Mod Creator
description: A tool for making Europa Universalis V mods.
colors:
  background: "oklch(0.965 0.006 70)"
  surface: "oklch(0.985 0.005 70)"
  foreground: "oklch(0.25 0.011 70)"
  muted: "oklch(0.49 0.011 70)"
  border: "oklch(0.87 0.009 70)"
  input: "oklch(0.6 0.011 70)"
  ring: "oklch(0.56 0.11 82)"
  primary: "oklch(0.74 0.14 82)"
  primary-foreground: "oklch(0.18 0.011 70)"
  primary-soft: "oklch(0.95 0.07 82)"
  primary-strong: "oklch(0.47 0.09 82)"
  secondary: "oklch(0.5 0.155 262)"
  secondary-foreground: "#fff"
  secondary-soft: "oklch(0.94 0.03 262)"
  secondary-strong: "oklch(0.36 0.115 262)"
  tertiary: "oklch(0.52 0.15 320)"
  tertiary-foreground: "#fff"
  tertiary-soft: "oklch(0.94 0.03 320)"
  tertiary-strong: "oklch(0.38 0.11 320)"
  success: "oklch(0.52 0.12 148)"
  success-foreground: "#fff"
  success-soft: "oklch(0.94 0.04 148)"
  success-strong: "oklch(0.38 0.09 148)"
  info: "oklch(0.53 0.1 235)"
  info-foreground: "#fff"
  info-soft: "oklch(0.94 0.025 235)"
  info-strong: "oklch(0.38 0.075 235)"
  warning: "oklch(0.67 0.17 52)"
  warning-foreground: "oklch(0.18 0.011 70)"
  warning-soft: "oklch(0.95 0.045 52)"
  warning-strong: "oklch(0.42 0.115 52)"
  error: "oklch(0.51 0.19 25)"
  error-foreground: "#fff"
  error-soft: "oklch(0.94 0.03 25)"
  error-strong: "oklch(0.37 0.14 25)"
typography:
  display:
    fontFamily: "Cormorant Garamond"
    fontSize: "3rem"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Cormorant Garamond"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  heading:
    fontFamily: "Cormorant Garamond"
    fontSize: "1.625rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.005em"
  subheading:
    fontFamily: "Noto Sans"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Noto Sans"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "Noto Sans"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Noto Sans"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0.005em"
  caption:
    fontFamily: "Noto Sans"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0.02em"
rounded:
  none: "0"
  sm: "0.25rem"
  md: "0.375rem"
  full: "9999px"
components:
  button-solid:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "0 1rem"
    height: "2.5rem"
  button-solid-hover:
    backgroundColor: "color-mix(in oklab, oklch(0.74 0.14 82), oklch(0.47 0.09 82) 25%)"
---

# Design System: EUV Mod Creator

Early and mostly undecided. This file records what the code does today and nothing more; `src/styles/index.css`
holds the values.

## Overview

A modern app UI in a heraldic palette. Light is the default theme; dark is applied with `data-theme="dark"` on an
ancestor.

## Colors

Eight `oklch()` ramps (50–950): warm-grey **neutral** and seven roles, **primary** (gold), **secondary** (lapis
blue), **tertiary** (plum), **success** (green), **info** (steel blue), **warning** (orange), **error** (red). The
frontmatter lists the light-theme values.

Each role has four theme-aware tokens: the fill (`bg-primary`), text on that fill (`text-primary-foreground`), a soft
tint (`bg-primary-soft`), and a strong tone for role-coloured text on the page or on soft (`text-primary-strong`).
Neutrals: `background`, `surface`, `foreground`, `muted`, `border`, `input`, `ring`.

## Typography

Two faces, both of which ship with the game: **Cormorant Garamond** for display and **Noto Sans** for everything
else. They are self-hosted as variable fonts.

Text comes in eight roles, each a whole style (family, size, line height, weight, tracking): three serif,
**display**, **title** and **heading**, and five sans, **subheading**, **body**, **small**, **label** and
**caption**. The frontmatter lists the values. Body is the page default, and `h1`, `h2` and `h3` take title,
heading and subheading. Cormorant is only used at 26px and up. Weights are 400, 500 and 600. Headings are balanced.

## Shapes

Buttons and text inputs default to a 6px radius, with square, 4px and pill options. Borders are 1px.

## Components

### Buttons

`AppButton` takes `variant` (colour role, default primary), `fill` (solid, soft, outline or ghost; default solid),
`size` (sm, md or lg; default md) and `radius` (default md). Solid hover blends 25% toward the role's strong tone;
outline and ghost hover to the soft tint. Neutral's soft tint is the text colour at 8% opacity. Pressing moves the
button 1px down. Focus uses the global 2px ring.

Labels are Noto Sans at weight 500: 14px (sm), 16px (md) or 18px (lg). Optional `startIcon` and `endIcon` take
Phosphor icons, drawn at the text size in the text colour, 8px from the label. Without `text` the button is icon-only: a square of the size's height (32, 40 or 48px) with the icon at half
its width, named by an `aria-label`. Ghost is the transparent option. A label wider than the button's container ends
in an ellipsis.

### Text input

`AppTextInput` stacks a label (label role), the field, and a footer for the error and the character count. With
`isOptional`, the label ends in a muted "(optional)" at weight 400. A `description` isn't shown on the page: it opens
in an `AppTooltip` from a muted 16px info icon beside the label's first line, on hover, Tab, click or tap; a tap
outside closes it. The field is a surface fill with a 1px `input` border; hover blends the border 50% toward the text
colour. `size` and `radius` match the button's: 32, 40 or 48px tall, so a field and a button of the same size line up
in a row. The value is 14px (sm), 16px (md) or 18px (lg), at weight 400. Placeholders are muted. The focus ring is the
global 2px one, drawn around the whole field.

Inside the field, in order: an optional `startIcon`, the value, a muted `suffix` (a unit such as "%"), an optional
`endIcon`, a spinner while `isLoading`, and, with `isClearable` and a value, a ghost × button named by a "Clear"
tooltip that empties the field and puts focus back in it. Icons are muted, 16px on sm and md and 20px on lg; the
spinner turns only when motion is allowed. Clicking anywhere in the field outside the value focuses the value.

With `maxLength`, the footer shows the count, as "12/40", at its end, muted, turning warning-strong from 90% of the
limit. With an `error`, the border and the focus ring turn to the error colour, and the message sits at the footer's
start in the small role, error-strong, after a filled warning-circle icon. Disabled fades the whole field, label
included, to 50%.

### Modal

`AppModal` is a surface panel, 512px wide at most, with an 8px radius, a 1px border and a large soft shadow, over a
50% near-black scrim. It is centred from the `sm` breakpoint up and sits at the bottom of the screen on a phone, 16px
from every edge. The title is in the heading role, with a ghost neutral close button in the top corner, named by a
"Close" tooltip. The body scrolls when it runs past the screen height. The footer is a tray in the page background
colour, separated by a 1px border; its buttons sit at the right, Cancel (neutral outline) before Confirm (primary
solid), and stack full-width with Confirm on top on a phone. It fades in and rises 12px over 200ms, fading only under reduced motion.

### Tooltip

`AppTooltip` inverts the page: `foreground` fill with `background` text, so it is dark in the light theme and light in
the dark one. Small text role, 6px radius, a medium shadow, 256px wide at most. It sits 8px above its trigger, centred,
opens below when there is no room above, and keeps 8px from the sides of the screen. It fades and grows from 95% over
150ms, fading only under reduced motion. It opens 128ms after the pointer arrives, or at once when Tab moves focus to
its trigger; once one tooltip has been open, its neighbours open at once. Touch never opens it, and neither does the
focus a modal moves to its first button when it opens. With `openOnClick` (the text input's info icon), a click, tap
or Enter on the trigger opens it too, and a tap or click outside closes it.

## Do's and Don'ts

### Do:

- **Do** prefer the theme-aware tokens over numbered ramp steps.
- **Do** use `text-<role>-strong` for role-coloured text.
- **Do** style text with one of the eight roles.

### Don't:

- **Don't** use `hover:bg-<role>-strong` on a solid fill; on primary and warning the text drops to 2.7:1 and 2.1:1.
