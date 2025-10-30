# Styles architecture

## Generated sources
- `scripts/generate-style-assets.ts` produces `src/styles/tokens.css`, `src/styles/critical.css`, and `src/styles/critical-inline.ts` from the TypeScript design token modules in `src/styles/tokens/`. Run `npm run extract-critical` after adjusting any token values to regenerate the CSS bundles.
- `src/styles/tokens/` now consolidates all foundations (`foundation.ts`) and higher-level tokens (colors, spacing, radius, typography, shadows, animations). These modules expose both semantic objects for runtime styling and prebuilt CSS class strings consumed by the generator.
- `tokens.css` is the single source for CSS custom properties (`--color-*`, `--space-*`, `--radius-*`, typography font stacks, animation keyframes, and shadow classes). Components should never redefine the same variables manually.

## Global stylesheet (`globals.css`)
- Imports the generated token stylesheet first, then the Tailwind layers.
- Ships only the utility classes referenced by runtime components: accessibility helpers (`sr-only`), horizontal scroll helpers (`hscroll*`), glow ring and aurora blur helpers, the FAB safe-area offset, and the `token-*` interaction primitives.
- Each retained utility uses token-driven values—colors resolve to `var(--color-*)`, spacing relies on `var(--space-*)`, and hover/active states piggyback on `color-mix` with safe fallbacks.
- Base rules set the body typography/background through tokens and restyle scrollbars via token gradients. Focus outlines, skip links, and global overflow rules are also token-aligned.

## Critical CSS
- `critical.css` and `critical-inline.ts` are regenerated from the same token source so the inline critical styles and the standalone stylesheet stay in sync.
- The generator also emits animation keyframes and the reusable skeleton shimmer track, removing the need for hand-maintained duplicates in `globals.css`.

## Working with tokens
- Consume token values in components via `import { colors, spacing, componentRadius, shadows, animations } from '@/styles/tokens';` and pass them to inline styles or component variants.
- When a new visual primitive is needed, add it to the relevant token module (and `foundation.ts` if it is a core scale), then regenerate the CSS assets.
- Avoid hard-coded Tailwind utility class strings for colors/radii/shadows—prefer the exported helpers or inline styles built from tokens.

## Follow-up opportunities
- Migrate remaining Tailwind-only views (notably legacy Academy bundle pages) to the new token utilities to eliminate the lint warnings around unused imports produced during the refactor.
- Fold legacy `dark:` utility usage (e.g., in `AuroraBackground`) into token-aware variants to fully retire Tailwind dark-mode overrides.
- Consider surfacing a small documentation site or Storybook page that showcases each token-driven utility and animation preset for faster onboarding.
