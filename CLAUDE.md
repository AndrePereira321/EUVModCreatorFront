# CLAUDE.md — EUVModCreatorFront

React + TypeScript + Vite frontend for the EU5 mod creator. Workspace context — what the app is for, how Andre
wants to work, commit message rules — is in the parent `../CLAUDE.md`, which loads alongside this file.

## Skills

Procedures — writing stories, writing tests — are the `front-*` skills. They live in the workspace, not this repo;
`../CLAUDE.md` lists them and holds the convention.

## `.ai-support/` docs

Frontend notes too long for this file. The convention, and the rule to keep this index in sync: `../CLAUDE.md`.

- [UI styling](.ai-support/ui-styling.md) — **read before adding a styled `ui/` component or a new style prop.**
  How `variant` / `fill` / `size` / `radius` are built, the `--tone-*` variables, icons and icon-only buttons, and
  why components take no `className`.

## Commands

Run these from this folder, not the workspace root.

```bash
npm install              # node_modules is gitignored and may be absent
npm run dev              # vite dev server
npm run build            # tsc -b && vite build — typechecks project references, then builds
npm run lint             # oxlint
npm run format           # oxfmt (writes in place)
npm run format:check
npm run preview          # serve the production build locally
npm run storybook        # component workshop on :6006
npm run build-storybook  # static Storybook into storybook-static/
npm test                 # vitest run: unit, browser and storybook projects, once
npm run test:watch       # vitest in watch mode
npx vitest run --project unit      # one project: unit | browser | storybook
npx playwright install chromium    # once per clone, and after bumping playwright — npm install doesn't fetch it
```

**Tests sit beside the code:** `X.test.ts` is logic and runs in Node, `X.test.tsx` renders a component and runs in
headless Chromium. Every story is also a test that fails on an axe violation. Details: the `front-testing` skill.

## Source layout

Organized **by type, not by feature.** The app is small and the EU5 domain objects aren't known yet, so
`features/` folders would mean guessing domain boundaries before they exist.

```
src/
├─ components/
│  ├─ ui/            <- generic building blocks: Button, Modal, Input
│  ├─ domain/        <- EU5-aware components, one subfolder per game concept (province/, country/)
│  └─ layout/        <- the app shell: AppMain.tsx, AppMenu/
├─ constants/        <- runtime values; types/ derives unions from them, never the reverse
├─ i18n/             <- i18next: config.ts init, i18next.d.ts key types, labels/ source strings
├─ styles/index.css  <- @import "tailwindcss"; @theme customizations go here
├─ types/            <- types only, always imported with `import type`
└─ main.tsx          <- entry point: createRoot + <StrictMode> + <AppMain />
```

Revisit when the first real mod-editing feature lands — that is the trigger to consider `src/features/<name>/`,
not before.

### Components

- **`ui/`** knows nothing about EU5 and never calls `t()` — everything comes in through props. The test: could it
  be dropped into another app unchanged? If not, it belongs in `domain/` or `layout/`.
- **`domain/`** holds components that know EU5 concepts, one subfolder per concept. It doesn't exist yet — create
  it with the first such component. A concept folder doesn't import from a sibling; combine them in `layout/`.
- **`layout/`** is the frame around the content — menu, header, page shell — and, until routing exists, the
  screens themselves. Once routes land, screens move to `src/pages/`.

**Imports flow one way: `ui` ← `domain` ← `layout`.** `ui/` imports from neither, `domain/` only from `ui/`,
`layout/` from both. `import/no-cycle` catches loops, not a wrong-direction import — that one is caught in review.

**One file until it has pieces.** `Button.tsx` sits directly in `ui/`; a component gets its own folder once it
has sub-components or a private hook, like `layout/AppMenu/`. **No `index.ts` barrels** — imports use explicit
`.tsx` paths, and barrels are a common source of `import/no-cycle` errors.

**Every `ui/` component has a story** — `X.stories.tsx` beside `X.tsx`, written or updated in the same change as the
component. A story doesn't count as a piece: `Badge.tsx` and `Badge.stories.tsx` both sit directly in `ui/`.

## Internationalization (i18n)

**All user-facing text goes through i18next (`react-i18next`) — never hardcoded.** Strings live in
`src/i18n/labels/{locale}.json` under the `labels` namespace. `src/i18n/config.ts` initializes i18next with those
resources and is imported once, for its side effect, from `src/main.tsx`.

```tsx
import { useTranslation } from "react-i18next";

const { t } = useTranslation();

<span>{t("app.title")}</span>;
```

Adding a string: add a key to `src/i18n/labels/en.json`, then call `t("group.key")`. Nothing to compile — the JSON
is imported directly. `src/i18n/i18next.d.ts` augments i18next's `CustomTypeOptions` with `typeof en`, so keys
autocomplete and a typo fails `npm run build`.

**Group keys by nesting one level** — `app.title`, `generic.home`, later `menu.*`, `province.*`. i18next reads
nested JSON natively and flattens it to dotted keys; the key type follows, so `t("generic.home")` autocompletes.

**Only components that own their copy call `t()`.** A component that just renders a label it was handed takes a
resolved string, and the parent does the lookup: `<AppMenuItem title={t("generic.home")} />`.

**Write for a non-technical player, not a developer.** Short, plain sentences, no jargon — same target
audience as the rest of the app, applied to copy.

## Toolchain gotchas

**Oxc, not ESLint/Prettier.** Linting is `oxlint`, formatting is `oxfmt`. Never add `.eslintrc`, `.prettierrc`,
or their packages — config lives in `.oxlintrc.json` and `.oxfmtrc.json`.

**Tabs, not spaces.** `printWidth` is 120 and `oxfmt` sorts imports. Match this when writing code by hand.

**Tailwind v4, with no config file.** Wired through the `@tailwindcss/vite` plugin in `vite.config.ts` plus
`@import "tailwindcss" source("..")` in `src/styles/index.css`. There is deliberately **no `tailwind.config.js` and
no PostCSS config** — do not create them. Customize the theme with `@theme { ... }` in CSS. `source("..")` limits
class scanning to `src/`: a class written only outside it (docs, `index.html`) produces no CSS.

**Theme tokens.** `src/styles/index.css` replaces Tailwind's stock palette (`--color-*: initial`) with eight ramps
named after their role — `neutral`, `primary` (gold), `secondary` (lapis blue), `tertiary` (plum), `success`
(green), `info` (steel blue), `warning` (orange), `error` (red) — and layers theme-aware semantic tokens on top
through `@theme inline`. That gives two kinds of utility:

- **Numbered** — `bg-primary-500`, `border-primary-300`, `text-neutral-700`. A fixed colour; it does **not** follow
  the theme, so handle dark yourself: `border-primary-800 dark:border-primary-300`.
- **Unnumbered** — theme-aware, swaps automatically under `[data-theme="dark"]`. Prefer these.

Neutrals: `bg-background`, `bg-surface`, `text-foreground`, `text-muted`, `border-border`, `border-input`, `ring-ring`.

Each of the seven roles has the same four theme-aware tokens — swap the role name and they behave identically:

| token                     | use                                                           |
| ------------------------- | ------------------------------------------------------------- |
| `bg-primary`              | the solid fill — buttons, active tabs, filled badges          |
| `text-primary-foreground` | text on that fill; only ever paired with `bg-primary`         |
| `bg-primary-soft`         | tinted panel — alerts, chips; put `text-primary-strong` on it |
| `text-primary-strong`     | role-coloured text/icons on background, surface or soft       |

**A solid fill's hover is never `hover:bg-primary-strong`** — on `primary` and `warning`, whose foreground is dark,
that drops the text to 2.7:1 and 2.1:1. Blend 25% toward `-strong` instead:
`hover:bg-[color-mix(in_oklab,var(--primary),var(--primary-strong)_25%)]`.

`-strong` means strongest against the page: darker in light mode, lighter in dark mode. Dark mode is
`data-theme="dark"` on an ancestor, light is the default. Web fonts are not set up yet; `--font-display` is a
fallback stack until that is decided.

**TypeScript settings that fail the build:**

- `verbatimModuleSyntax` — type-only imports must be written `import type { Foo } from "..."`.
- `erasableSyntaxOnly` — no `enum` and no constructor parameter properties. Use `const` objects plus union types.
- `noUnusedLocals` / `noUnusedParameters` — a single unused variable breaks `npm run build`.
- `allowImportingTsExtensions` is on, and existing code writes the extension:
  `import AppMain from "./components/layout/AppMain.tsx"`. Follow that.

**Lint rules promoted to errors:** `react/exhaustive-deps`, `react/rules-of-hooks`, `react/jsx-key`,
`react/no-danger`, `eqeqeq`, `import/no-cycle`, `import/no-duplicates`. `console.log` warns — only `console.warn`
and `console.error` are allowed.

## Pre-commit hook

`.githooks/pre-commit` runs `format:check`, then `lint`, then `build`, then `test` — cheapest first — and blocks the
commit if any of them fails. `core.hooksPath` points git at that tracked directory, and the `prepare` script sets it during
`npm install`, so a fresh clone is covered after the first install.

The hook only checks — it never rewrites staged files. When it stops you on formatting, run `npm run format`,
re-stage, and commit again. Fix what fails instead of reaching for `--no-verify`.
