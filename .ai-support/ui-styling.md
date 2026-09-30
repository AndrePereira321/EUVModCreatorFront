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

### Types and autofill

`type` takes one of `APP_TEXT_INPUT_TYPES`: text, email, tel, url, search and password, the types whose value is one
line of text. A number gets its own component, because its value isn't a string; dates and files are other controls.

- **Autofill:** `DEFAULT_AUTO_COMPLETE` gives each type its browser hint: `off` for text and search (a mod name gains
  nothing from the browser's history), `email`, `tel` and `url` for those. A caller's `autoComplete` wins, `off`
  included.
- **Password has no default.** `AppTextInputTypeProps` is a union whose password half makes `autoComplete` required:
  `current-password` to sign in, `new-password` to sign up (Chrome then offers to generate one), or `off`. Forgetting
  it fails the build.
- **Why the props are split** into `AppTextInputBaseProps` and `AppTextInputTypeProps`: a `Partial` of the union can't
  be spread back into the component, because its password half loses the required `autoComplete`. Test and story
  helpers take `Partial<AppTextInputBaseProps> & AppTextInputTypeProps`.
- **The story decorator is a typed `Decorator` const.** Written inline, Storybook infers its args from the component
  and turns them into an intersection; the union's two halves intersect to `never`, and so does every story's args.
- **Reveal:** the eye button swaps `type` to text. It changes its name, Show or Hide password, rather than using
  `aria-pressed`, so the tooltip always says what a click does. A password field always sets `spellCheck={false}`,
  `autoCapitalize="none"` and `autoCorrect="off"`: once shown it is a text field, where a phone capitalises the first
  letter and Chrome's enhanced spellcheck sends the text to a server.
- **Browser-drawn buttons:** Chrome and Safari draw a × in a search field, Edge an eye in a password field.
  `INPUT_CLASSES` hides both, so they don't double the component's own.

### Validation lives outside the component

The component shows an error and never decides one: the form passes the message in `error`. That fits a form library
with no adapter. React Hook Form's `Controller` hands over `field` (`value`, `onChange(value)`, `onBlur`, `name`,
`ref`) and `fieldState.error?.message`, and `<AppTextInput {...field} error={fieldState.error?.message} />` works. To
keep it working:

- `onChange` passes the raw text. Trimming and lowercasing are the schema's job, or what the player sees and what gets
  validated drift apart.
- `ref` and `onBlur` reach the `<input>` through `{...rest}`. The library focuses the first invalid field with the ref
  and validates on leaving a field with `onBlur`.
- **A form sets `noValidate`.** Without it, `type="email"`, `type="url"`, `required` and `pattern` make the browser
  block the submit with its own bubble, unstyled and in the browser's language, before the form's validation runs.

## Number input

`AppNumberInput` renders `AppTextInput` and adds the number rules, so label, description, error, suffix, loading,
clear, sizes and radii come from the text input unchanged. The text input has two openings for it: `children`, drawn
inside the field after its own buttons (the − and + go there), and `hint`, a short muted note at the footer's end (the
range goes there). `children` was already in the props through `ComponentProps<"input">`; now it's taken out before
`{...rest}` reaches the `<input>`, which can't have children.

- **`type="text"`, not `type="number"`.** A number input lets "e" in, changes the value on a scroll over the field,
  draws spinners no CSS styles the same everywhere, and reports `""` for anything it can't parse, so "-" or "1." halfway
  through typing can't be told from an empty field. A text input with `role="spinbutton"`, `aria-valuenow`, `-valuemin`
  and `-valuemax` gives screen readers the same control. oxlint's `prefer-tag-over-role` is disabled on that line.
- **`inputMode`:** `numeric` for whole numbers, `decimal` when the step has decimals, `text` when `min` allows
  negatives, because the iPhone's number keypads have no minus key. Editing happens on a desktop (PRODUCT.md), so
  this only matters on the gallery's phone users, if a form ever reaches them.
- **The value is `number | null`.** Empty is `null`, never 0. The text the player is typing is a draft, kept with the
  value it parsed to (`{ text, value }`), and shown only while that value is still the prop. If the form changes the
  value, a Reset say, the draft no longer matches and the field shows the form's value. No effect syncs them: it is
  derived during render.
- **What goes in:** each change is tested against a pattern built from `min` (minus sign or not) and the decimals
  (`maxDecimals`, by default as many as `step` has, so a step of 1 takes whole numbers). A change that fails is
  dropped, and React puts the old text back. A comma is read as the decimal point, for players who write 2,5; the
  field shows a point once it loses focus. Grouping (1,000) isn't read, since it would clash with that comma.
- **Clamping:** a typed value outside `min`–`max` is reported as typed, then brought inside the range when the field
  loses focus or on Enter. Only a value the player typed: one the form passes in out of range stays until the player
  edits it, so opening a saved mod doesn't silently change it; the form's validation reports it instead. So the range
  is the component's job and every other rule, required fields included, is the form's.
- **Stepping** snaps to the grid of `min` (or 0) plus whole steps: from 23 with a step of 5, + gives 25 and − gives 20,
  as the browser's own `stepUp` does. From empty it starts at 0, clamped into the range. Results are rounded to the
  step's decimals, so 0.2 + 0.1 is 0.3 and not 0.30000000000000004. Past a limit a step lands on the limit.
- **Keys:** arrows step; Shift with an arrow, Page Up and Page Down take `largeStep` (10 steps by default). Home and End
  keep moving the caret rather than jumping to the limits, which the ARIA pattern allows but a typed field needs more.
- **The buttons aren't Tab stops** (`tabIndex={-1}`): the arrow keys do the same from the field, and three stops per
  field would slow a form down. `onMouseDown` prevents the default, and a mouse press moves focus into the field, so
  the arrow keys work straight after a click. A touch press leaves focus where it is, so the phone keyboard doesn't
  open. When a step happens while focus is outside the field (a screen reader or a touch press), a polite live region
  reads the new value, since nothing else would.
- **Holding a button repeats.** The step happens on `click`, the one event every way of pressing a button sends.
  `pointerdown` stores the held direction in state with a 400ms delay; an effect waits that long, steps, and stores the
  60ms repeat. Each stored object is new, so the effect runs again: the chain lasts while the value moves and stops
  at a limit, on release, or when the pointer leaves. The tick calls `stepBy` through `useEffectEvent`, so it reads
  the current value without the effect depending on it. After a repeat, the release's click is skipped; a click with
  `detail === 0` (keyboard, screen reader) always steps.
- **Buttons at a limit** are disabled, not hidden, so the field keeps its shape. `FIELD_BUTTON_CLASSES` hovers only
  `enabled:` buttons and fades disabled ones to 40%. Read-only and disabled fields have no buttons, like the clear
  and reveal buttons.
- **Width:** a spin button keeps at least 6ch, and a long suffix truncates first, so a crowded field never shows
  12500 as "12". The digits are `tabular-nums`, so they don't shift as the value steps.
