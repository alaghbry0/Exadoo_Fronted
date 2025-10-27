# AGENTS.md — Codex Playbook (Exaado)

> **Purpose:** Run Codex as a first‑class contributor that executes wide, repo‑scale changes (refactors, migrations, architecture cleanup) while enforcing our Design System and app conventions.
>
> **Primary reference:** `DESIGN_SYSTEM.md` (v3.0 — 24 Oct 2025)

---

## 1) Roles & Authority

**Codex (Primary Implementer)**

* Executes large‑scale changes across the codebase (dozens → hundreds of files) without hesitation.
* Owns plan → execution → validation, not just suggestions.
* Commits in coherent phases and performs self‑review per phase.

**Reviewer/Verifier (optional, may be done by Codex itself)**

* Runs checks (migration scanner, visual tests).
* Flags regressions and requests follow‑ups before finalization.

**Authority**

* You have full permission to reorganize, move, split, merge, rename files; normalize imports; enforce conventions; and delete dead code.

---

## 2) Architecture & Conventions (Non‑negotiable)

* **Feature‑Based Architecture** (from `DESIGN_SYSTEM.md`).
* **Files ≤ 300 lines** — split components/logic where needed.
* **No hard‑coded colors/styles** — use `@/styles/tokens` (colors/bg/border/shadows/spacing, `shadowClasses`, `componentRadius`).
* **No inline framer‑motion configs** — use `@/styles/animations` variants.
* **Import aliases** — prefer `@/...` over deep relative paths.
* **Accessibility & Dark Mode** must be preserved.

**UI Components Policy (centralized & deduplicated)**

* **Authoritative UI library lives in** `src/components/ui/` (shadcn/ui + our wrappers).
* **If a repeated UI pattern exists anywhere else**, refactor it into a reusable component under `src/components/ui/` and replace all duplicates with the centralized version.
* **Third‑party primitives (e.g., Radix)** should be **wrapped once** in `src/components/ui/` (e.g., `ScrollArea`, `Dialog`, `Select`…), then **consumed only via** those wrappers across the app.
* **Migration rule:** prefer composition/props over ad‑hoc class duplication; expose variants via props; use `cn` utility from `@/lib/utils`.
* **Example direction:** the provided `ScrollArea` wrapper pattern is correct; ensure all uses across the app import it from `@/components/ui/scroll-area` and remove local re‑implementations.

**Shared vs Feature**

* **Feature code** lives in `src/features/<feature>/`.
* **Shared code** lives in `src/shared/` (common/layout/hooks/utils) and must be broadly reusable.
* **UI components** that are generic belong in `src/components/ui/`; feature‑specific UI belongs under that feature.

---

## 3) System Prompt (Short, English)

> Put this in the model’s System slot when available.

```
You are a Codex software agent with full authorization to execute large-scale changes across this repository.
Non-negotiables:
- Execute, don’t just suggest.
- Enforce Feature-Based Architecture, files ≤ 300 lines.
- Use Design Tokens from `@/styles/tokens` (no hard-coded styles).
- Use Animation Variants from `@/styles/animations` (no inline configs).
- Centralize generic UI in `src/components/ui/` and deduplicate.
- Use `@/...` aliases for imports.
- Preserve A11y and Dark Mode.
Process:
- Work in phases; commit coherently (WHY/WHAT/NOTES); self-review diffs per phase.
- Ask at most one clarification question if strictly necessary, then proceed.
Validation:
- `npm run migration:scan`
- `npm run test:visual`
```

---

## 4) End‑to‑End Workflow (Phased)

**Phase 0 — Discovery & Plan**

* Scan `src/` for anti‑patterns: duplication, giant files, deep relatives, scattered utilities, feature code inside shared, inlined animations, hard‑coded colors.
* Produce a short plan: moves, dedupe targets, UI centralization tasks, risk points.

**Phase 1 — Structure & Moves**

* Enforce Feature‑Based layout: move files to proper features; update imports to `@/...`.
* Normalize naming and folder shape; keep files ≤ 300 lines.

**Phase 2 — UI Centralization & Tokens**

* Identify repeated UI patterns across features/shared.
* Create or extend canonical components under `src/components/ui/`.
* Replace duplicates to consume canonical components.
* Tokenize all styles (colors/bg/border/shadows/spacing) and apply `shadowClasses`/`componentRadius`.
* Replace inline framer‑motion configs with `@/styles/animations` variants.

**Phase 3 — Dedup & Utilities**

* Consolidate utilities/services: prefer feature‑local utils if feature‑specific; otherwise move to `src/shared/utils/`.
* Remove dead/legacy code and stale components.

**Phase 4 — Performance & Polish**

* Memoization where beneficial; lazy‑load large feature chunks if safe.
* Simplify props, naming, and public APIs of components.

**Phase 5 — Validation Gates**

* Run `npm run migration:scan` and address findings.
* Run `npm run test:visual`; resolve visual regressions or adapt tokens/components accordingly.
* Self‑review the full diff; ensure DX (developer experience) clarity.

**Rule:** do not move to the next phase until the current phase is logically complete and commit‑ready.

---

## 5) Commit Policy

* **Granular but coherent**: each phase 1–3 commits max; avoid mega‑commits.
* Message template:

```
<type>(scope): short summary

WHY:
- rationale #1
- rationale #2

WHAT:
- action #1
- action #2

NOTES:
- moved/renamed paths
- tokens applied (colors/bg/border/shadows/spacing)
- ui centralized in src/components/ui/*
```

Types: `refactor`, `feat`, `fix`, `chore`, `test`, `docs`.

---

## 6) Quality Gates (Before advancing)

1. ESLint/TS clean (if configured).
2. Design Tokens applied — **no** hard‑coded colors/styles.
3. Animation Variants used — **no** inline framer‑motion configs.
4. **UI centralization complete** for the touched scope — duplicates removed; imports point to `@/components/ui/*`.
5. A11y labels present; Dark Mode verified.
6. Visual tests pass or diffs explained and approved.
7. File size ≤ 300 lines (split where needed).

---

## 7) Clarification Policy

* If a blocking ambiguity exists, ask **one** concise question (e.g., confirm strict Feature‑Based for all features and generic UI under `src/components/ui/`).
* Proceed immediately after; do not pause work awaiting non‑critical input.

---

## 8) Prompt Templates (Ready‑to‑run)

**A) Full `src/` Cleanup (structure + tokens + UI centralization)**

```
Perform a full cleanup and restructuring of `src/` per our Feature-Based Architecture.
Goals:
- Normalize feature folders and update imports to `@/...`.
- Centralize generic UI into `src/components/ui/` and replace duplicates project-wide.
- Apply Design Tokens (colors/bg/border/shadows/spacing, componentRadius).
- Replace inline framer-motion configs with `@/styles/animations` variants.
- Ensure files ≤ 300 lines, A11y labels, and robust Dark Mode.
Phases: 1) structure & moves  2) UI centralization & tokens  3) dedup & utilities  4) performance & polish  5) validation (migration:scan, test:visual)
Commit policy: granular with WHY/WHAT/NOTES; list moved paths.
```

**B) UI Centralization Sweep**

```
Find repeated UI patterns across features/shared and move them into `src/components/ui/` (or extend existing components).
Replace all duplicates to consume the canonical components.
Expose variants via props; use `cn` util; remove local re-implementations of Radix primitives; maintain A11y and Dark Mode.
Run `npm run migration:scan` and `npm run test:visual` afterwards.
```

**C) Tokenization Sweep (feature‑scoped)**

```
Apply Design Tokens to all files under `features/<name>/**`:
- Replace hard-coded styles with tokens from `@/styles/tokens`.
- Use `shadowClasses` and `componentRadius`; follow spacing scale.
- Replace inline motion configs with `@/styles/animations` variants.
- Keep files ≤ 300 lines; ensure A11y & Dark Mode; then run the scanners/tests.
```

**D) Import Alias Normalization**

```
Replace deep relative imports across `src/` with aliases `@/...`.
Ensure builds pass and scanners/tests are clean.
```

---

## 9) Component Migration Checklist

* [ ] Identify duplicate UI patterns and their call sites.
* [ ] Create/extend canonical components in `src/components/ui/`.
* [ ] Provide variant props (size, intent, density) rather than class duplication.
* [ ] Use `cn` for conditional classes; prefer tokens over Tailwind hardcodes.
* [ ] Remove local wrappers; update imports to `@/components/ui/*`.
* [ ] Verify A11y/Dark Mode; run scanners/tests.

---

## 10) Reference Structure (Target)

```
src/
├─ features/
│  ├─ auth/
│  ├─ payments/
│  └─ academy/
├─ shared/
│  ├─ components/
│  │  ├─ common/
│  │  └─ layout/
│  ├─ hooks/
│  └─ utils/
├─ components/
│  └─ ui/            # shadcn/ui + our canonical wrappers (e.g., ScrollArea, Dialog, Select)
├─ styles/
│  ├─ tokens.ts      # colors, spacing, shadowClasses, componentRadius
│  └─ animations.ts
└─ pages/ or app/
```

---

## 11) Tools & Commands

```bash
npm run migration:scan       # design-tokens & conventions scanner
npm run migration:dashboard -- --scan-ui
```

---

## 12) KPIs (Success Signals)

* Duplicates removed; UI usage unified through `src/components/ui/`.
* Clean scan results; visual tests stable.
* Imports normalized to aliases; fewer deep relatives.
* Reduced average lines per file; easier onboarding and navigation.
* Clear feature boundaries; predictable component APIs.
