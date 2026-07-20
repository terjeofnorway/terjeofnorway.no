#!/usr/bin/env bash
# Harness startup + verification for terjeofnorway.no.
# Run from the repo root. Gets a clean checkout to a verified baseline
# (install -> build) before any feature work begins.
set -euo pipefail

echo "=== terjeofnorway.no :: harness init ==="

# --- Package manager -------------------------------------------------------
# pnpm-only repo: pnpm-lock.yaml, pnpm-workspace.yaml, and a packageManager pin.
# Do NOT use npm/yarn here.
if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found. Enable it with: corepack enable" >&2
  exit 1
fi
echo "pnpm $(pnpm --version)"

# --- Install ---------------------------------------------------------------
echo "=== Installing dependencies ==="
pnpm install

# --- HARD GATE: build ------------------------------------------------------
# Client Astro static build, then server tsc compile. There are no tests in
# this project, so a green build is the source of truth for "does it work".
echo "=== Verifying: pnpm run build (HARD GATE) ==="
pnpm run build

# --- SOFT GATE: lint -------------------------------------------------------
# `pnpm run lint` is currently RED: eslint.config.js does not wire the Astro
# parser and does not ignore nested dist/ (see "Known issues" in progress.md).
# Kept non-fatal until that is fixed -- then delete the `|| ...` line below and
# this comment to promote lint to a hard gate.
echo "=== Checking: pnpm run lint (SOFT GATE — see progress.md) ==="
pnpm run lint || echo "!! lint failed (see progress.md) — non-fatal for now"

echo ""
echo "=== Baseline verified: build is green ==="
echo "Next steps:"
echo "  1. Read progress.md — current state, next step, and known issues"
echo "  2. Make one scoped change"
echo "  3. Re-run ./init.sh before claiming done; record evidence in progress.md"
