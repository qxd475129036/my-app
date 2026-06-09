# Environment Theme System Design

## Overview

Unify the sidebar theme with 4 environment-specific color schemes, switched via URL query parameter `?env=`. Affects sidebar gradient background, text colors, group-active state, and page-active state. All functional UI elements (buttons, links, form inputs) stay the original blue `#2563eb`.

## Environments & Colors

| Environment | Query | Gradient | Muted Text | Page-Active | Group-Active |
|------------|-------|----------|------------|-------------|-------------|
| Local | `?env=local` (default) | `#15803d → #0f766e → #0e7490` | `#6ee7b7` | `#fff` bg / `#14532d` text | 10% white bg / white text |
| Dev | `?env=dev` | `#b45309 → #d97706 → #ea580c` | `#fcd34d` | `#fff` bg / `#78350f` text | 10% white bg / white text |
| Staging | `?env=stg` | `#6d28d9 → #7c3aed → #c026d3` | `#c4b5fd` | `#fff` bg / `#4c1d95` text | 10% white bg / white text |
| Production | `?env=prd` | `#0369a1 → #0284c7 → #6366f1` | `#7dd3fc` | `#fff` bg / `#0c4a6e` text | 10% white bg / white text |

Gradient direction: 160deg for all environments (top-to-bottom-right).

## Two Active States

### Page-Active (画面菜单) — Strong
Actual page links (child items, direct top-level items like Dashboard). White background + dark env-colored text + bold. Prominent and clear.

### Group-Active (菜单Group) — Subtle
Expandable group headers whose children include the current page. 10% white translucent background + white text. Gentle indication of current section without competing with the page-active state.

## CSS Variables

Each `[data-env]` block defines:

- `--env-gradient` — sidebar background
- `--env-sidebar-muted` — default/dimmed text color
- `--env-page-active-bg` — page-active background (white)
- `--env-page-active-text` — page-active text (dark env color)
- `--env-group-active-bg` — group-active background (translucent white)
- `--env-group-active-text` — group-active text (white)

## Data Flow

1. User visits `/dashboard?env=dev`
2. `LayoutClient` reads `env` from `useSearchParams()`
3. `useEffect` sets `document.documentElement.dataset.env = "dev"`
4. CSS selector `[data-env="dev"]` activates dev variables
5. Sidebar uses `var(--env-*)` references, all other components unchanged

## Component Scope

| Component | Affected by env theme |
|-----------|----------------------|
| Sidebar | Background gradient, text, active states |
| Login page | Brand panel gradient background |
| Buttons/links/inputs | Not affected — stay blue `#2563eb` |
