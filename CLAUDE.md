# CLAUDE.md — EUVModCreatorFront

React + TypeScript + Vite frontend for the EU5 mod creator. Workspace context — what the app is for, how Andre
wants to work, commit message rules — is in the parent `../CLAUDE.md`, which loads alongside this file.

## Commands

Run these from this folder, not the workspace root.

```bash
npm install          # node_modules is gitignored and may be absent
npm run dev          # vite dev server
npm run build        # compiles i18n, then tsc -b && vite build — typechecks project references, then builds
npm run lint         # oxlint
npm run format       # oxfmt (writes in place)
npm run format:check
npm run preview      # serve the production build locally
```

No test framework is configured. Don't assume `npm test` exists — offer to set one up rather than inventing a
command.

## Source layout

Organized **by type, not by feature.** The app is small and the EU5 domain objects aren't known yet, so
`features/` folders would mean guessing domain boundaries before they exist.

```
src/
├─ components/       <- UI components, grouped in subfolders by kind (layout/ holds the app shell)
├─ i18n/             <- Paraglide: project.inlang/ config, labels/ source strings, paraglide/ generated
├─ styles/index.css  <- @import "tailwindcss"; @theme customizations go here
└─ main.tsx          <- entry point: createRoot + <StrictMode> + <AppMain />
```

Revisit when the first real mod-editing feature lands — that is the trigger to consider `src/features/<name>/`,
not before.

## Internationalization (i18n)

**All user-facing text goes through Paraglide (`@inlang/paraglide-js`) — never hardcoded.** Config lives in
`src/i18n/project.inlang/`, source strings in `src/i18n/labels/{locale}.json`. `src/i18n/paraglide/` is
generated (gitignored) — don't hand-edit it.

```tsx
import { m } from "@paraglide/messages.js";

<span>{m.app_title()}</span>;
```

Adding a string: add a key to `src/i18n/labels/en.json`, then call `m.yourKey()`.

Gotcha: `tsc -b` runs before Vite in `npm run build` and can't see the Vite plugin, so `build` runs
`compile:i18n` first to put `src/i18n/paraglide/` on disk before typechecking. `dev` doesn't need this — the Vite
plugin generates it itself before serving.

**Write for a non-technical player, not a developer.** Short, plain sentences, no jargon — same target
audience as the rest of the app, applied to copy.

## Toolchain gotchas

**Oxc, not ESLint/Prettier.** Linting is `oxlint`, formatting is `oxfmt`. Never add `.eslintrc`, `.prettierrc`,
or their packages — config lives in `.oxlintrc.json` and `.oxfmtrc.json`.

**Tabs, not spaces.** `printWidth` is 120 and `oxfmt` sorts imports. Match this when writing code by hand.

**Tailwind v4, with no config file.** Wired through the `@tailwindcss/vite` plugin in `vite.config.ts` plus
`@import "tailwindcss"` in `src/styles/index.css`. There is deliberately **no `tailwind.config.js` and no PostCSS
config** — do not create them. Customize the theme with `@theme { ... }` in CSS.

**Theme tokens.** `src/styles/index.css` replaces Tailwind's stock palette (`--color-*: initial`) with eight ramps
named after their role — `neutral`, `primary` (gold), `secondary` (lapis blue), `tertiary` (plum), `success`
(green), `info` (steel blue), `warning` (orange), `error` (red) — and layers theme-aware semantic tokens on top
through `@theme inline`. That gives two kinds of utility:

- **Numbered** — `bg-primary-500`, `border-primary-300`, `text-neutral-700`. A fixed colour; it does **not** follow
  the theme, so handle dark yourself: `border-primary-800 dark:border-primary-300`.
- **Unnumbered** — theme-aware, swaps automatically under `[data-theme="dark"]`. Prefer these.

Neutrals: `bg-background`, `bg-surface`, `text-foreground`, `text-muted`, `border-border`, `border-input`, `ring-ring`.

Each of the seven roles has the same four theme-aware tokens — swap the role name and they behave identically:

| token                     | use                                                                       |
| ------------------------- | ------------------------------------------------------------------------- |
| `bg-primary`              | the solid fill — buttons, active tabs, filled badges                      |
| `text-primary-foreground` | text on that fill; only ever paired with `bg-primary`                     |
| `bg-primary-soft`         | tinted panel — alerts, chips; put `text-primary-strong` on it             |
| `text-primary-strong`     | role-coloured text/icons on background, surface or soft; also `hover:bg-` |

`-strong` means strongest against the page: darker in light mode, lighter in dark mode. Dark mode is
`data-theme="dark"` on an ancestor, light is the default. Web fonts are not set up yet; `--font-display` is a
fallback stack until that is decided.

**TypeScript settings that fail the build:**

- `verbatimModuleSyntax` — type-only imports must be written `import type { Foo } from "..."`.
- `erasableSyntaxOnly` — no `enum` and no constructor parameter properties. Use `const` objects plus union types.
- `noUnusedLocals` / `noUnusedParameters` — a single unused variable breaks `npm run build`.
- `allowImportingTsExtensions` is on, and existing code writes the extension:
  `import AppMain from "./components/AppMain.tsx"`. Follow that.

**Lint rules promoted to errors:** `react/exhaustive-deps`, `react/rules-of-hooks`, `react/jsx-key`,
`react/no-danger`, `eqeqeq`, `import/no-cycle`, `import/no-duplicates`. `console.log` warns — only `console.warn`
and `console.error` are allowed.

## Pre-commit hook

`.githooks/pre-commit` runs `format:check`, then `lint`, then `build` — cheapest first — and blocks the commit if
any of them fails. `core.hooksPath` points git at that tracked directory, and the `prepare` script sets it during
`npm install`, so a fresh clone is covered after the first install.

The hook only checks — it never rewrites staged files. When it stops you on formatting, run `npm run format`,
re-stage, and commit again. Fix what fails instead of reaching for `--no-verify`.
