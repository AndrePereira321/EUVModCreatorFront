# Storybook — the component workshop

Storybook 11 (alpha) renders each component on its own, outside the app: a canvas with **Controls** for every prop, a
**Docs** page per component, an **Accessibility** check, and a light/dark toggle. `npm run storybook` serves it on
port 6006.

```
.storybook/main.ts               framework, story glob, addons (docs, a11y), backgrounds off
.storybook/preview.tsx           imports index.css; theme toolbar + decorator; autodocs; centered layout
src/components/**/X.stories.tsx  one per component, next to X.tsx
```

`main.ts` is in `tsconfig.node.json` and `preview.tsx` in `tsconfig.app.json`, so `npm run build` — and the
pre-commit hook — typechecks them along with the stories. A new file in `.storybook/` needs adding to one of those
`include`s, or nothing checks it.

## Writing a story

`ui/AppButton/AppButton.stories.tsx` is the reference.

- **CSF 3:** `const meta = { component: X, … } satisfies Meta<typeof X>`, `export default meta`,
  `type Story = StoryObj<typeof meta>`. `Meta` and `StoryObj` come from `@storybook/react-vite`, `fn` from
  `storybook/test`. Not CSF Next (`definePreview`, `meta.story()`) — still a preview feature in 10.6.
- **No `title`.** The glob starts at `src/components`, so the sidebar path is the folder path: `ui/AppButton`. Story
  ids follow it: `ui-appbutton--playground`.
- **Style props get `argTypes` built from their `APP_*` array**, with the type named for the Docs table:
  `variant: { control: "inline-radio", options: APP_VARIANTS, table: { type: { summary: "AppVariant" } } }`.
  react-docgen can't follow `(typeof APP_VARIANTS)[number]` — without this the control is a text box and the type
  reads `unknown[number]`. `react-docgen-typescript` would resolve it, but it needs the TypeScript JS API, which TS 7
  no longer ships. Taking `options` from the array means a new value appears in Storybook without touching the story.
- **Icon props get a select through `mapping`.** A control can only hold plain values, so the select lists the keys of
  an `ICONS` object and `mapping` swaps the chosen key for its component:
  `startIcon: { control: "select", options: Object.keys(ICONS), mapping: ICONS }`. Its `none: undefined` entry is the
  select's way back to no icon.
- **Props inherited from `ComponentProps<"button">` are invisible to react-docgen.** Give the ones worth toggling a
  control (`disabled: { control: "boolean" }`) and switch off the ones it guesses wrong (`type: { control: false }`).
- **Callback props get `fn()` in `meta.args`**, so every call shows in the Actions panel.
- **Which stories:** `Playground`, empty and driven by Controls; one every-value story per style prop, mapping over its
  `APP_*` array (`VariantsByFill`, `Sizes`, `Radii`); one per state Controls don't show at a glance (`Disabled`;
  `Icons` for start, end and both at every size; `IconOnly` for every fill at every size). An every-value story sets
  those props itself, so it hides them with `parameters: { controls: { exclude: [...] } }` — left in, those controls
  do nothing.
- **Sample text is plain English, not `t()`.** Stories aren't user-facing, and `ui/` components take resolved strings
  anyway. A `layout/` or `domain/` story that renders `t()` needs `import "../src/i18n/config.ts"` in `preview.tsx`
  first.
- **Tailwind classes work in stories, not in `.storybook/`.** Stories live under `src/`, so Tailwind scans them — and
  their classes ship in the app CSS too, so keep story wrappers to a few layout utilities. `.storybook/` is outside
  `source("..")`: style there with inline styles and the CSS variables, like the docs wrapper in `preview.tsx`.

## Theme toolbar

The toolbar's **Theme** menu sets `globals.theme`. The decorator in `preview.tsx` writes it to `data-theme` on
`<html>`, synchronously, while the story renders.

**Don't swap that for `@storybook/addon-themes` or move it into an effect.** Storybook waits for running transitions
before it announces a story as rendered, and the a11y scan runs right after that announcement. addon-themes sets the
attribute on the announcement itself — after the wait — so the scan lands in the middle of the buttons' 150ms
`transition-colors` fade and flags contrast failures that don't exist: 16 buttons in dark mode, the first time. Set
during render, the fade starts inside the window Storybook already waits on.

On a **Docs** page the page around the stories is Storybook's own light UI, so the theme goes on a wrapper around each
story instead, and `<html>` loses the attribute — otherwise `color-scheme: dark` turns the Docs table's radio buttons
dark on a white page.

`features.backgrounds` is off in `main.ts`: the canvas background comes from the theme
(`body { background-color: var(--background) }`), and a second background picker would only fight it.

## Accessibility panel

`@storybook/addon-a11y` runs axe on every story after it renders. Read the **Accessibility** tab in both themes after
touching a ramp, a fill or a colour mix — `VariantsByFill` covers every variant × fill in one scan. Axe sees only the
resting state: hover and focus contrast still need the calculation in `ui-styling.md`.

## Checking a component in the browser

After changing how a `ui/` component looks, check it here in both themes. With the Playwright MCP:

1. Start `npm run storybook -- --ci` in the background — `--ci` skips prompts and doesn't open a browser. It's ready
   when the log prints `Local: http://localhost:6006/`.
2. Open the story alone: `http://localhost:6006/iframe.html?id=ui-appbutton--variants-by-fill&viewMode=story`, plus
   `&globals=theme:dark` for dark. Every story id is listed in `http://localhost:6006/index.json`.
3. For the a11y result, open `http://localhost:6006/?path=/story/<id>&addonPanel=storybook/a11y/panel` and read the
   panel text once the scan has finished.
4. Stop it. On Windows, stopping the background task leaves Storybook's `node` process holding port 6006: find it with
   `Get-NetTCPConnection -LocalPort 6006 -State Listen`, check its command line is `storybook … dev`, and stop it.

Screenshots from the Playwright MCP land in the workspace root or its `.playwright-mcp/` — delete them when done.

## Not set up

- **Story tests.** `@storybook/addon-vitest` runs every story, and its `play` function, as a test. It needs Vitest and
  Playwright browsers, and no test framework is chosen yet.
- **Storybook MCP.** `@storybook/addon-mcp`, or Storybook's own Claude Code plugin, gives an agent tools to list
  components, read their docs and preview stories. It only answers while the dev server runs.
- **Upgrades.** `npx storybook@next upgrade` moves `storybook` and every `@storybook/*` package together. Don't bump
  them one at a time — they're released as a set and expect the same version. We're on an 11.0 alpha, taken early
  because its `addon-vitest` supports Vitest 5, so the versions are **pinned exactly**: the upgrade writes `^`
  ranges, and a `^` on an alpha lets `npm install` pull the next alpha. Re-pin after upgrading. Automigrations run
  under `--yes`, and 11.0.0-alpha.1 offered one that adds `addon-mcp` — pass `--skip-automigrations` unless we want
  what it adds.
