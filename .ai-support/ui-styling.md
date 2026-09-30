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
  `border`, and each fill sets its own border colour, rather than a base colour that a fill overrides. One exception
  is safe: `font-medium` in the base classes next to a size's text role (`text-body`). The role reads its weight
  through Tailwind's `--tw-font-weight`, which `font-medium` sets, so the result is 500 whatever the stylesheet order.
- **Recheck contrast after changing a ramp or a hover mix.** Compute it from the `oklch()` values in `index.css`
  (OKLab → sRGB → WCAG luminance) for every variant, fill and theme; eyeballing missed the old 2.7:1 hover.

## Icons

`startIcon` and `endIcon` take a Phosphor component (`FloppyDiskIcon`, not `<FloppyDiskIcon />`), so the button
decides how it renders. It adds `aria-hidden`, and Phosphor's own defaults, `1em` and `currentColor`, make the icon
follow the size's text role and the fill's text colour with no map of its own. Start and end come from DOM order, so
they stay right in a right-to-left language.

`BASE_CLASSES` holds `inline-flex items-center gap-2` because Tailwind's preflight sets `svg { display: block }`;
without flex the icon stacks above the text.

**Icon-only.** Without `text`, the button takes `ICON_ONLY_SIZE_CLASSES` instead of `SIZE_CLASSES`: a square of the
same height, with the icon at half its width (16, 20 and 24px), because alone it carries the whole meaning. The
icon is sized directly with `*:size-4` (`*:` targets the button's direct children), not through the font size,
because there are no text sizes outside the type roles and none of them is 20 or 24px. The two maps are
alternatives, never both, so one class per property still holds.

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

A map moves to `components/ui/<prop>.classes.ts` once a second component needs it. The radius map has:
`ui/radius.classes.ts` serves `AppButton` and `AppTextInput`. The variant map is still button-only; move it the same
way when a Badge, Alert or Chip needs it. Fill and size maps hold per-component heights, padding and hovers, so they
stay in each component's own `.classes.ts`.

## Text input states

`AppTextInput` has no `variant` or `fill`: colour on a field means state, not role. Valid and invalid are two
alternative class strings, like the button's two size maps, so each keeps one border colour.

**The bordered box is a `<div>`, not the `<input>`.** Icons, a suffix, a spinner and a clear button can all sit at the
end at once, and their widths vary, so padding the input around absolutely placed items can't work. The div is a flex
row with the border, fill, height and padding; the `<input>` inside is borderless, `flex-1`, and stretched to full
height. Flex order is DOM order, so the ends swap in a right-to-left language with nothing extra.

- **Focus ring:** the input sets `outline-none`, and the div draws the ring with `has-[input:focus-visible]:outline-*`,
  reading `var(--ring)`. It's `has-[input:…]` and not `focus-within`, so a focused clear button gets its own ring and
  the field doesn't get a second one. The invalid class sets `[--ring:var(--error)]` on the div, so the ring turns red.
- **Clicks on the box:** `onMouseDown` on the div focuses the input when the click lands on padding or an icon, and
  `preventDefault` stops the browser moving focus to the page first. Clicks on the input or a button pass through.
  Keyboard users never land on the div, which is why the lint rule for handlers on static elements is disabled there.
- **Focus by id:** `clear` and the click shortcut call `document.getElementById(inputId)`, not a ref. A ref of our own
  would have to be merged with the one a caller may pass through `{...rest}`; the id is already unique.

Translated words the component shows itself, "(optional)", "Clear" and "Loading…", come from `DefaultLabels`, each with
a prop to override it (`optionalLabel`, `clearLabel`, `loadingLabel`), the same as `AppModal`'s "Close". `isLoading`
also writes "Loading…" into a visually hidden `<output aria-live="polite">`, which is always rendered, because a
live region added at the same moment as its text is often not announced.

The description lives in a tooltip, so the input can't point `aria-describedby` at visible text. A `hidden` span holds
a copy for it: a hidden element still counts when an ARIA attribute references it by id. The info button takes the
tooltip as its name (`isLabel`), as the icon-only buttons in the `AppTooltip` story do.

The border is the `--input` token, the only thing that uses it. Non-text UI needs 3:1 against what is around it, and a
field sits on the page or on a surface (a modal, a card): `neutral-500` gives 3.57 / 3.78 in light and 4.76 / 4.05 in
dark. Dark's old `neutral-600` gave 2.55 on surface. Axe doesn't check borders, so recheck by calculation after
changing either ramp.
