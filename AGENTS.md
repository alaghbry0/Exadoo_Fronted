# Exaado Frontend — Developer Handbook (Final Version)

## 1. Philosophy & Design Principles

Exaado follows a **unified Design System** to ensure consistency, performance, accessibility, and maintainability across all pages and features. Developers must treat UI primitives and domain abstractions as **canonical sources of truth**. No local duplicates or overrides.

**Core principles:**

* One canonical source of UI primitives under `src/shared/components/ui/*`
* One import convention: `@/` aliases only
* No hard‑coded colors, borders, or `dark:` classes — always use tokens
* Components should be variant‑driven, not copy‑pasted forks
* Small files, modular structure (≤ 300 LOC)

---

## 2. Project Structure Rules

### ✅ Canonical Sources

| Concern       | Location                         |
| ------------- | -------------------------------- |
| UI Primitives | `src/shared/components/ui/*`     |
| Shared Hooks  | `src/shared/hooks/*`             |
| Shared Utils  | `src/shared/utils/*`             |
| Domain Logic  | `src/domains/<domain>/*`         |
| App Layouts   | `src/shared/components/layout/*` |
| Pages         | `src/pages/*`                    |

### ✅ Import Convention

All project imports **must** use aliases:

```ts
import { Button } from '@/shared/components/ui';
import { useToast } from '@/shared/hooks/useToast';
import PurchaseModal from '@/domains/billing/components/PurchaseModal';
```

❌ Disallowed:

```ts
import Button from '../../components/ui/button';
import useToast from '../hooks/toast';
```

---

## 3. Design Tokens & Theming

Tokens are the **only** source of color, spacing, radius, and shadow values.

```ts
import {
  colors,
  spacing,
  typography,
  shadows,
  componentRadius,
  animations,
  shadowClasses,
} from '@/styles/tokens';
```

### ❌ Not allowed

* `bg-gray-*`
* `text-white`
* `border-neutral-800`
* `dark:` classes

### ✅ Allowed

```tsx
<div style={{ background: colors.bg.primary }} />
<Card className={shadowClasses.elevated} />
```

---

## 4. Component Design Rules

* One canonical primitive per concern (Button, Card, Modal, Drawer, Toast, etc)
* Use **variants** instead of separate component forks
* If you add new UI logic → it must live inside shared UI or a composable hook
* Files ≤ 300 LOC, split into subcomponents when needed

### Skeleton & Empty State

There must be **one** Skeleton primitive and **one** EmptyState primitive project‑wide.

### Modals

All billing modals must unify under `PurchaseModal` with strategy‑based logic:

| Previous                    | Replaced With   |
| --------------------------- | --------------- |
| `TradingPanelPurchaseModal` | `PurchaseModal` |
| `AcademyPurchaseModal`      | `PurchaseModal` |
| `ExchangePaymentModal`      | `PurchaseModal` |
| `SubscriptionModal`         | `PurchaseModal` |

---

## 5. Hooks & Utilities

| Concern   | Canonical Hook       |
| --------- | -------------------- |
| Toast     | `useToast()`         |
| Clipboard | `useClipboard()`     |
| Billing   | `usePaymentIntent()` |

Billing SSE must be unified into a single client: `@/domains/billing/sse.ts`.

---

## 6. Pages & Navigation

The app should open on **/shop** by default (mobile‑first entrypoint).

Academy `Top Courses` should render **inside** `background_banner.svg` as its content container.

Shared card/rail patterns must be used across both Shop and Academy.

---

## 7. Accessibility & RTL

* Every icon‑only button **must have** `aria-label`
* Focus ring must come from tokens
* RTL safe by default — no hardcoded padding/margins

---

## 8. CI & Code Quality

* ESLint blocks restricted classes/imports
* Playwright visual snapshots for `/shop`, `/academy`, `/profile`, billing screens
* Lighthouse analysis for `/shop` and `/academy`

---

## 9. Migration Phases (Execution Roadmap)

1. **UI Canonicalization** (merge Navbar, Skeleton/Empty, unify imports)
2. **PurchaseModal unification** + `usePaymentIntent`
3. Tokens rollout — remove all tailwind color/border/dark classes
4. Page structure cleanup (Shop first, Academy rails unified)
5. Hooks unification (Toast, Clipboard, SmartImage)
6. A11y/RTL refinements
7. CI + visual baselines

---

## 10. Golden Rules (Summary)

* One UI source of truth
* One billing modal
* One toast hook
* Tokens everywhere
* Imports via `@/` only
* Variants > duplication
* Accessible by default
