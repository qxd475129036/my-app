# Environment Theme System Design

## Overview

Unify the page theme with 4 environment-specific gradient color schemes, switched via URL query parameter `?env=`. Each environment gets a distinct accent color that drives the sidebar gradient, button styles, and active states.

## Environments & Colors

| Environment | Query | Primary Gradient | Visual Character |
|------------|-------|-----------------|------------------|
| Local | `?env=local` (default) | `#22c55e` → `#10b981` (翠绿→青绿) | Fresh, natural |
| Dev | `?env=dev` | `#f59e0b` → `#ea580c` (琥珀→橙黄) | Warm, alert |
| Staging | `?env=stg` | `#8b5cf6` → `#c026d3` (紫罗兰→品红) | Mysterious, polished |
| Production | `?env=prd` | `#0ea5e9` → `#6366f1` (天蓝→靛蓝) | Cool, professional |

Gradient direction: top-left to bottom-right (135deg) for all environments.

## Architecture

```
<html data-env="local|dev|stg|prd">
  globals.css           ← CSS variables switch via [data-env] selector
  LayoutClient.tsx      ← Reads ?env=, sets data-env attribute
  Sidebar.tsx           ← Uses var(--env-gradient), var(--env-accent)
  Navbar.tsx            ← Uses var(--env-accent) for active states
  Other components      ← Inherit via CSS variable cascade
```

## Data Flow

1. User visits `/dashboard?env=dev`
2. `LayoutClient` reads `env` from `useSearchParams()`
3. `useEffect` sets `document.documentElement.dataset.env = "dev"`
4. CSS selector `[data-env="dev"]` activates dev variables
5. All components using CSS variables re-render automatically
6. Default (no param / invalid): falls back to `local`

## CSS Variable Scheme

Each `[data-env]` block overrides these variables:

- `--env-accent` — primary accent color (buttons, links, active indicators)
- `--env-accent-light` — light tint for hover/selected backgrounds
- `--env-gradient` — sidebar background gradient
- `--env-top-bar` — subtle page-top gradient bar (thin strip)

## Component Changes

### globals.css
- Add 4 `html[data-env="..."]` blocks defining env-specific variables
- Existing `:root` variables stay as defaults (local)
- Replace hardcoded `--sidebar-bg` with `--env-gradient`

### LayoutClient.tsx
- Add `useSearchParams()` to read `env` param
- Add `useEffect` to sync `data-env` on `<html>`
- Validate enum: only `local|dev|stg|prd`, fallback to `local`

### Sidebar.tsx
- Replace hardcoded `#1e293b` with `var(--env-gradient)` as background
- Replace hardcoded `#2563eb` with `var(--env-accent)` for active states
- Keep text colors (`text-white`, `text-slate-300`) unchanged

### Navbar.tsx
- Replace hardcoded `#2563eb` references with `var(--env-accent)`
- Active link underline and menu highlight use `--env-accent`

## Error Handling

- Invalid `env` value → treat as `local`
- Missing `env` param → default `local`
- SSR stage has no `data-env` → CSS falls back to local theme; no flash on hydration

## Non-Goals

- No localStorage persistence (pure URL-driven)
- No per-user preference storage
- No dark mode integration (separate concern)
- No runtime palette editor
