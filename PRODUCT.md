# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Players of Europa Universalis V who want to change something in their game but have never opened a text editor and
don't know how a mod is put together. Their job is to make a mod of their own, from changing a value the game already
has to adding something new, and to get it running in their game.

Players also come to browse the public gallery: to download someone else's mod, or to copy one and remix it into their
own.

## Product Purpose

EUV Mod Creator lets a player make simple mods for Europa Universalis V without ever handling a mod file. The app hides
the file format behind its UI, builds the mod's files, and hands them over as a download with instructions for
installing it.

Success is a player who has never modded making a change and seeing it in their game.

## Positioning

Modding the game otherwise starts from files: a text editor, a folder layout, the game's script syntax. This app starts
from what the player wants to change; the files are its output, never its interface. Public mods can be copied and
remixed, so a first-time modder can begin from someone else's working mod instead of an empty one.

## Operating Context

- Making and editing mods happens on a desktop or laptop. The gallery and creator profiles also have to work on a
  phone.
- The app has no connection to the player's game. The player downloads the mod, puts it in the game's mod folder by
  hand following the app's instructions, and launches the game to see the change. Every round of "change something,
  check it in the game" passes through that download-and-install step.

## Capabilities and Constraints

- **Mod scope:** changing values the game already has, and adding new content. Which game concepts the app covers,
  and in what order, is not decided.
- **Output:** a download of the mod's files, plus in-app install instructions. Publishing to a mod platform (Paradox
  Mods, Steam Workshop) from the app was considered and not chosen.
- **Community:** a public mod gallery, public creator profiles, and copy-and-remix of public mods. The creator decides
  whether their work is public or private. The default visibility, and how a remix credits the mod it came from, are
  not decided.
- **Accounts:** username and password. Accounts hold no email address, so there is no password reset yet. Whether to
  add or switch to Discord sign-in is not decided.
- **Profiles:** display name, bio, and links to Steam, the Paradox forum and a Discord server, all optional. A missing
  display name falls back to the username. Display names aren't unique, so the username appears beside one wherever
  impersonation would matter.
- **Scale:** built for a few hundred users.
- **Languages:** every user-facing string goes through translation (i18next). English is the only language today;
  which languages follow is not decided.
- **Game art:** whether the app may show the game's own flags, icons, portraits or map is not decided. Until it is, no
  surface uses game art or assumes it will.
- **Game knowledge:** every game concept, name, value and file format the app shows or writes comes from the game's
  real files or the [modding wiki](https://eu5.paradoxwikis.com/Modding), never from memory. The game install is a
  read-only reference; its path is in `../CLAUDE.md`.

## Brand Commitments

- **Name:** EUV Mod Creator. The name uses "EUV", not "EU5"; that was a deliberate change.
- **Voice:** written for a player, not a developer. Short, plain sentences, no jargon, no modding terms a newcomer
  wouldn't know.
- **No official connection:** nothing on hand shows an agreement with Paradox Interactive, so no surface may claim or
  imply one.

## Evidence on Hand

- No gallery entries, users, testimonials, download counts or reviews exist yet. None may be invented and shipped as
  real.
- No logo or brand mark exists; `public/favicon.svg` is the Vite template's placeholder.
- Nothing states whether the app is free or paid. Don't claim either.

## Product Principles

1. **The files stay out of sight.** Players work with what they want to change (a country, a province, a number the
   game uses), never with paths, folder layouts or script syntax. The one file-level step is installing the download,
   and the app walks them through it.
2. **Done means working in the game.** A mod the player can't install, or that doesn't load, is a failure however good
   the editor felt. The download and the install instructions are part of the product.
3. **Never guess the game.** A plausible but wrong name or value makes a mod that doesn't work, and a non-technical
   player has no way to find out why.
4. **The creator decides who sees it.** Whether a mod is public or private is its creator's choice, and the app always
   makes clear which one it is.
