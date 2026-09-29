# Dependencies — pinned versions

A pinned dependency is held to one exact version instead of the `^` range npm writes. Each row says why it's pinned
and what ends the pin. Pinning a package means adding a row here, and unpinning one means deleting it.

## Pinned pre-releases

| package                              | pinned to        | why                                                                                           | unpin when                      |
| ------------------------------------ | ---------------- | --------------------------------------------------------------------------------------------- | ------------------------------- |
| `storybook` and every `@storybook/*` | `11.0.0-alpha.1` | stable `@storybook/addon-vitest` (10.6.0) accepts only Vitest `^3 \|\| ^4`; we're on Vitest 5 | npm's `latest` tag reaches 11.x |

**Why exact, not `^`.** A `^` range on a pre-release also matches every later pre-release of that version:
`^11.0.0-alpha.1` accepts `11.0.0-alpha.2`, `11.0.0-beta.1` and so on. `npm update`, or an install without the
lockfile, would then move to a newer alpha nobody chose. An exact pin means a pre-release only changes when someone
upgrades it on purpose.

## Checking for a stable release

`npm outdated` doesn't help here. It compares against the `latest` tag, so it lists Storybook with 10.6.0 as "Latest",
which looks like a downgrade, and it never shows a newer alpha. Ask npm for the release tags instead:

```bash
npm view storybook dist-tags                                   # latest = stable, next = the pre-release line
npm view @storybook/addon-vitest@latest peerDependencies       # does stable accept Vitest 5 yet?
```

Checked on 2026-09-29: `latest` 10.6.0, `next` 11.0.0-alpha.1.

## Unpinning

Once `latest` is 11.x, upgrade with the `front-storybook` skill's procedure, using `storybook@latest` in place of
`storybook@next`. Keep the `^` ranges the upgrade writes, and delete the row above.
