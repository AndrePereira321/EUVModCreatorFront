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
components/ui/X/X.stories.tsx   control + every-value story per prop    see storybook.md
```

`Record<AppFill, string>` makes a missing key a build error, so adding a value to `APP_FILLS` fails the build until
every component's map handles it.

`ghost` is the transparent fill: no background or border until hover. There is no separate `transparent` fill.

## The `--tone-*` variables

The variant map only **sets** four CSS variables on the element — `--tone`, `--tone-foreground`, `--tone-soft`,
`--tone-strong` — pointing at its role's theme tokens. The fill map only **reads** them (`bg-(--tone)`). That makes
colours × fills cost M + N map entries instead of M × N, and a new fill works with every colour for free.

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
whole meaning. The two maps are alternatives, never both, so one class per property still holds. Nothing forces an
`aria-label`; a missing one shows up as `button-name` in Storybook's a11y panel.

## When to move maps out of the component

The variant map and the radius map aren't button-specific. When a second component (Badge, Alert, Chip) needs them,
move those two to a shared place. Fill and size maps hold per-component heights, padding and hovers, so they stay.
