# Progress Log

Lightweight running notes for terjeofnorway.no — state that `git log` and `CLAUDE.md`
don't already capture. This is a solo repo, so there's no `feature_list.json`; if the
project ever grows to a team, work-tracking belongs in GitHub Issues/Projects, not here.

**Last updated:** 2026-07-20

## Current state

- Harness is intentionally minimal: `CLAUDE.md` (instructions) + `init.sh` (verification
  gate) + this log.
- Baseline verified: `pnpm run build` is green (client Astro build + server `tsc`).
- `CLAUDE.md` is pnpm-correct (it was stale on npm before).
- **`sitemap.xml` added** (2026-07-20): build-time endpoint at
  `packages/client/src/pages/sitemap.xml.ts`, zero new deps, reuses `SITE_URL` from
  `src/data/profile.ts`. Currently lists the single homepage route (`/`); add to its
  `ROUTES` array if real pages are introduced. Verified: `pnpm run build` emits
  `dist/sitemap.xml`, `xmllint` reports well-formed. Not yet referenced from a
  `robots.txt` (none exists) — optional follow-up.

## Known issues

- **`pnpm run lint` fails on a clean checkout — pre-existing `eslint.config.js` bug, not
  source code.** Two root causes:
  1. The `**/*.astro` block spreads only the `.rules` from `astro.configs['flat/recommended']`
     and never sets `languageOptions.parser` to `astro-eslint-parser`, so ESLint parses Astro
     frontmatter with the default JS parser → "Unexpected token". Fix: set the Astro parser
     (+ `parserOptions.parser: tsparser`, `extraFileExtensions: ['.astro']`).
     `astro-eslint-parser@2.1.0` is already in the pnpm store (transitive dep of
     eslint-plugin-astro); add it to the root `devDependencies` so the import isn't a phantom
     dependency under pnpm's strict layout.
  2. `ignores: ['dist/**']` only matches root `dist/`, so build artifacts under
     `packages/server/dist/` get linted. Change to `**/dist/**` (and `**/.astro/**`).
  - `init.sh` runs lint non-fatally until this is fixed. Once `pnpm run lint` exits 0 on a
    clean checkout, remove the `|| ...` fallback in `init.sh` to promote lint to a hard gate.

## Next step

- Nothing in flight. If you want a green lint gate, fix the two items above.

## Notes

- Site copy lives in `packages/client/content/*.md` frontmatter, **not** in `src/` — see
  `CLAUDE.md`. The build (not tests) is the verification gate; there are no tests.
