# UI styling — style props on `ui/` components

How a `ui/` component takes its look from props. `AppButton` is the reference implementation. What things look like
is in `../DESIGN.md`; this file is only how the code is put together.

## The pattern

Each style prop is independent and has a default: today `variant` (colour role), `fill`, `size`, `radius`.

```
constants/styles/<prop>.ts      APP_FILL_SOLID … + APP_FILLS array      one file per prop
types/styles.ts                 AppFill = (typeof APP_FILLS)[number]    all style types, one file
components/ui/X/X.classes.ts    one Record<AppFill, string> map per prop
components/ui/X/X.tsx           props, defaults, clsx(...) of the maps, JSX
components/ui/X/X.stories.tsx   control + every-value story per prop    see the front-storybook skill
```

`Record<AppFill, string>` makes a missing key a build error, so adding a value to `APP_FILLS` fails the build until
every component's map handles it.

`ghost` is the transparent fill: no background or border until hover. There is no separate `transparent` fill.

## The `--tone-*` variables

The variant map only **sets** four CSS variables on the element — `--tone`, `--tone-foreground`, `--tone-soft`,
`--tone-strong` — pointing at its role's theme tokens. The fill map only **reads** them (`bg-(--tone)`). That makes
colours × fills cost M + N map entries instead of M × N, and a new fill works with every colour for free.

`neutral` has no role tokens of its own: it points at `--border` and `--foreground`, and its soft tint is the
foreground at 8% opacity. An opaque neutral step can't work, because neutral shares the page's hue: the old
`neutral-900` soft was exactly dark `--surface`, so on a card a soft button had no fill and ghost hover did nothing. A
see-through tint always differs from what is behind it. It is declared on the button, so `var(--foreground)` resolves
to the current theme there; declared on `:root` it would keep the light value under a `data-theme="dark"` wrapper.

## Rules the pattern depends on

- **Class names appear in full under `src/`.** Tailwind finds classes by reading the files in `src/` as plain text.
  `` `bg-${variant}` `` never produces CSS, which is why every map is written out.
- **No `className` prop.** Without a class-merging helper, a caller's `bg-*` next to the component's own is decided by
  stylesheet order, not class order. Style props are the only styling API; wrap the component for layout.
- **One class per CSS property per element.** The same conflict applies inside the component: the base classes hold
  `border`, and each fill sets its own border colour, rather than a base colour that a fill overrides.
- **Recheck contrast after changing a ramp or a hover mix.** Compute it from the `oklch()` values in `index.css`
  (OKLab → sRGB → WCAG luminance) for every variant, fill and theme; eyeballing missed the old 2.7:1 hover.

## Icons

`startIcon` and `endIcon` take a Phosphor component (`FloppyDiskIcon`, not `<FloppyDiskIcon />`), so the button
decides how it renders. It adds `aria-hidden`, and Phosphor's own defaults, `1em` and `currentColor`, make the icon
follow the size's `text-*` and the fill's text colour with no map of its own. Start and end come from DOM order, so
they stay right in a right-to-left language.

`BASE_CLASSES` holds `inline-flex items-center gap-2` because Tailwind's preflight sets `svg { display: block }`;
without flex the icon stacks above the text.

**Icon-only.** Without `text`, the button takes `ICON_ONLY_SIZE_CLASSES` instead of `SIZE_CLASSES`: a square of the
same height, with a font size that draws the icon at half its width (16, 20 and 24px), because alone it carries the
whole meaning. The two maps are alternatives, never both, so one class per property still holds.

`AppButtonProps` is one flat interface, so the types don't enforce the icon-only case. An icon-only button needs an
`aria-label` and a `startIcon` — without the label a screen reader announces a nameless button, which Storybook's
a11y panel flags.

## Long labels

The label sits in a `truncate` span and the button is `max-w-full`, so a label longer than its container ends in an
ellipsis instead of pushing the page sideways. Translations run about 30% longer than English. `min-w-0` does the same
in a flex or grid row, where an item otherwise never gets narrower than its content. The icons and the icon-only
squares are `shrink-0`, so the label gives way first. Truncation is the safety net; labels should still be short.

Check it in the `LongLabel` story. Storybook's centered layout sizes the story to its content, so in `Playground` a
long label never truncates.

The span also protects against browser translation, which replaces text nodes with its own elements. As the span's only
child, the label is written with `textContent`, which overwrites whatever translation put there. A bare text node next
to the icons is one React keeps a reference to, and once translation has swapped it out, adding an icon in front of it
or removing it crashes the render.

## Pressed

`active:translate-y-px` in `BASE_CLASSES` moves the button 1px down while pressed, the same for every fill. On a phone
it is the only feedback a tap gets, because `hover:` in Tailwind v4 only applies on devices that can hover. It isn't a
colour change: a mix deeper than the hover's 25% drops warning's text below 4.5:1 (40% gives 4.00:1).
`transition-colors` doesn't cover `translate`, so the press shows instantly.

## When to move maps out of the component

The variant map and the radius map aren't button-specific. When a second component (Badge, Alert, Chip) needs them,
move those two to a shared place. Fill and size maps hold per-component heights, padding and hovers, so they stay.
