# CLAUDE.md

Personal portfolio site for terjeofnorway.no. pnpm-workspaces monorepo: `packages/client` (Astro) + `packages/server` (Express). The notes below cover things that aren't obvious from a quick read of the files.

## Working here (agent harness)

**Startup workflow** — before writing code: run `./init.sh` (installs deps, then runs the build gate), then read `progress.md`. Working rules:

- **Keep changes scoped** — one logical change at a time; don't widen scope mid-task.
- **Definition of done** — `pnpm run build` is green **and** the evidence (command + result) is recorded in `progress.md`. There are no tests, so the build is the gate.
- **Lint is a *soft* gate for now** — `pnpm run lint` is currently red due to a pre-existing ESLint flat-config bug (see "Known issues" in `progress.md`); `init.sh` runs it non-fatally until that is fixed, then it becomes a hard gate.
- **End of session** — update `progress.md` so the next session can run `./init.sh` immediately.

## The one thing to understand: the server only serves static files

`packages/server` is **not** an application backend. `src/server.ts` is ~20 lines: an Express app that does nothing but `express.static()` over `../../client/dist`. There is no API, no routing, no SSR, no database. The client is a fully static Astro build; the server's only job is to host those built files in production (where a plain CDN/static host would also work).

Implications:
- Don't look for "backend logic" — there is none. Site content and behavior all live in the client.
- The server resolves the client dist by **relative path** (`path.join(__dirname, '../../client/dist')`), so the two packages' `dist/` folders must keep their relative layout. Don't relocate them independently.

## Content lives in markdown frontmatter, NOT Astro content collections

This is the most surprising part of the client and easy to waste time on:

- Site copy lives in `packages/client/content/*.md` (`about.md`, `articles.md`, `project.md`, `skills.md`) — **outside** `src/`. There is **no `src/content/` and no content-collection config/schema.**
- These are imported as raw Astro markdown modules via relative paths, e.g. `import * as skillsData from '../../content/skills.md'`, then read through `.frontmatter` (and `.compiledContent()` for rendered body HTML). `astro:content` / `getCollection()` is **not** used anywhere.
- **To edit site text/data, edit the YAML frontmatter in those `.md` files** (skills list, articles array, projects array, about body). Most files carry their data entirely in frontmatter; the markdown body is often empty.

## SEO / JSON-LD

`src/pages/index.astro` assembles a schema.org JSON-LD graph (`Person` + per-article `Article` + per-project `CreativeWork`) directly from the content frontmatter, and injects it via `JsonLd.astro` into the layout's `<slot name="head" />`. `helpers/strings.ts#stripTags` cleans compiled-markdown HTML before it goes into the JSON-LD `description`. If you change content frontmatter shapes, this graph-building code is what breaks.

## Styling conventions (SCSS modules + CSS custom properties)

- Design tokens are **CSS custom properties** declared in `src/styles/theme.module.scss` `:root` (colors, spacing, font sizes/weights). Use `var(--color-…)` / `var(--spacing-…)` in component styles — do not hardcode.
- Responsive breakpoints are **SCSS mixins** in `src/styles/breakpoints.module.scss` (`mobile`, `tablet`, `desktop`, plus mobile-first `*-up` variants). `global.module.scss` `@forward`s them and adds a shared `section` mixin.
- Component pattern: each component is `Name/Name.astro` + `Name/Name.module.scss`, co-located. The scss starts with `@use '../../styles/global.module.scss' as *;` to pull in the `section` mixin and breakpoints.
- Gotcha: `theme.module.scss` defines `--font-size-{small,regular,large,xlarge}` but `SkillsSection.module.scss` references the **undefined** `--font-size-base`. Existing latent bug; don't copy that token name.

## Build, run, deploy

This repo is **pnpm-only** (`pnpm-lock.yaml`, `pnpm-workspace.yaml`, and a `packageManager` pin in the root `package.json`). Don't use `npm`/`yarn` — a stray `package-lock.json` will diverge from the pnpm lockfile CI and Docker rely on.

Commands (run from repo root):
- `pnpm run dev` → **client only** (`astro dev --host`, port **3000**). The Express server is not involved in dev.
- `pnpm run build` → builds client **then** server, in that order (server tsc compile is cheap; the meaningful artifact is the client static build the server serves).
- `pnpm run start` → runs the built server (`node dist/server.js`), reading `PORT` from `.env` (defaults to 3000; prod uses **8080**). Binds `0.0.0.0`.
- `pnpm run lint` / `lint:fix` → flat-config ESLint at root over `.ts/.tsx/.astro`. (React/jsx-a11y plugins are configured for hypothetical React components; the project currently has none.) **Currently failing** — `eslint.config.js` doesn't wire the Astro parser and doesn't ignore nested `dist/`; see "Known issues" in `progress.md`.
- **No tests exist** — every `test` script just echoes an error and exits 1. The build is the de-facto verification gate.

Deployment (`.github/workflows/build_and_deploy.yml`, on push to `main`):
1. `pnpm install --frozen-lockfile` + `pnpm run build` **on the CI runner** (Node 22, pnpm via `pnpm/action-setup`), producing `packages/*/dist`.
2. Docker image built and pushed to `ghcr.io/terjeofnorway/terjeofnorway.no`.
3. SSH into a **DigitalOcean** droplet → prune old images → `docker pull` + `docker run` on port 8080 (`--restart unless-stopped`, container name `terjeofnorway.no`), then prune again so only the running image remains. The droplet is ~10 GB; the prune steps exist because images used to accumulate until the disk filled (`no space left on device` during `docker pull`).

**The Dockerfile does not build the app** — it relies on the CI-built `packages/client/dist` and `packages/server/dist`, so the image is only valid after a prior `pnpm run build`. It installs **only the server's production deps** (`express`, `dotenv`) via `pnpm install --frozen-lockfile --prod --filter=terjeofnorway.no-server --ignore-scripts` against the single root `pnpm-lock.yaml` (pnpm provided by Corepack, pinned by the root `package.json` `packageManager` field) — it deliberately does **not** ship the dev/build toolchain (`astro`, `sharp`, `sass`, `typescript`, `@types/*`), which keeps the image small and off the runtime attack surface. The runtime `CMD` is `node dist/server.js` (cwd `/app/packages/server`, so `dotenv` reads `./.env`). `.env` is generated in CI (`PORT=8080`, `GIT_SHA=<sha>`) and copied to `packages/server/.env`. `.dockerignore` keeps `node_modules`/`.git` out of the build context.

## Misc gotchas

- `README.md` is partly stale: it lists a `celestial-comet/` component that **does not exist** in the repo.
- TS path aliases (`@/*`, `~/*` → `src/*`) are declared in the client `tsconfig.json` but **not used** — all imports in `src/` are relative. Match the existing relative style.
- `tsconfig.json` at root is just a project-references stub (no compilation itself).
