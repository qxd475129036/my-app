# MyApp Design System

> Business management application design language. Built on Next.js 16 (App Router) with Tailwind CSS 4.

---

## 1. Color Palette

### Core Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#ffffff` | Page background |
| `--foreground` | `#1e293b` | Primary text, headings (slate-800) |
| `--card` | `#f8fafc` | Card surface (slate-50) |
| `--card-border` | `#e2e8f0` | Card border (slate-200) |
| `--border` | `#e2e8f0` | Borders, dividers (slate-200) |
| `--muted` | `#64748b` | Secondary/muted text (slate-500) |

### Accent (Business Blue)

| Token | Value | Usage |
|-------|-------|-------|
| `--accent` | `#2563eb` | Primary buttons, links, active states (blue-600) |
| `--accent-light` | `#eff6ff` | Hover backgrounds, selected rows (blue-50) |
| `--accent-hover` | `#1d4ed8` | Button hover state (blue-700) |

### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--danger` | `#dc2626` | Errors, delete, reject (red-600) |
| `--success` | `#16a34a` | Completed, approved (green-600) |
| `--warning` | `#d97706` | Pending, processing (amber-600) |

### Sidebar (Dark Theme)

| Token | Value | Usage |
|-------|-------|-------|
| `--sidebar-bg` | `#1e293b` | Sidebar background (slate-800) |
| `--sidebar-text` | `#cbd5e1` | Sidebar nav text (slate-300) |
| `--sidebar-active` | `#2563eb` | Active nav item background |

### Shadows

| Token | Value |
|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1)` |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` |

All tokens are defined as CSS custom properties in `globals.css` and mapped to Tailwind theme via `@theme inline {}`.

---

## 2. Typography

### Font Family

- **Sans**: Geist Sans (`var(--font-geist-sans)`) via `next/font/google`
- **Mono**: Geist Mono (`var(--font-geist-mono)`) via `next/font/google`
- Body defaults to `font-sans` via CSS variable

### Font Scale

| Purpose | Size | Line Height | Weight |
|---------|------|-------------|--------|
| Table cell / label | 12px | 1.4 | 400 |
| Body / UI text | 14px | 1.5 | 400 |
| Large body | 16px | 1.5 | 400 |
| Subheading | 20px | 1.4 | 600 |
| Page title | 24px | 1.3 | 700 |
| Dashboard stat | 30px | 1.2 | 700 |

### Usage Guidelines

- Table headers: 12px, uppercase, `tracking-wider`, `font-semibold`, `text-muted`
- Action buttons: 14px, `font-medium`
- Status badges: 12px, `font-medium`, rounded-full
- Breadcrumbs: 14px, muted for parent, foreground for current

---

## 3. Spacing System

8px base unit. Scale: `2/4/6/8/12/16/20/24/32/40/48/64`

Common patterns:
- Page padding: `px-8 py-8` (32px)
- Card padding: `p-6` (24px)
- Section gap: `gap-6` (24px)
- Table cell: `px-4 py-3` (16px / 12px)
- Form input: `px-3 py-2` (12px / 8px)

---

## 4. Layout Architecture

```
+-------------------------------------------------------+
|  Sidebar (fixed left)   |  TopBar (sticky, h-16)      |
|  w-64 / w-16 collapsed  |  breadcrumb | user avatar   |
|  bg-[#1e293b]           |------------------------------|
|                         |  Content Area                |
|                         |  (flex-1, bg-gray-50)        |
|                         |                              |
|                         |  - Index: max-w-7xl mx-auto  |
|                         |  - Table: w-full px-8        |
|                         |                              |
|                         |------------------------------|
|                         |  Footer (border-t, text-xs)  |
+-------------------------------------------------------+
```

### Sidebar
- `fixed left-0 top-0 h-full`, z-40
- Dark background `#1e293b`
- Collapsible: w-64 → w-16 (icon-only)
- Groups with expandable/collapsible sub-items
- Chevron icon rotates 90° on expand
- Active item: `bg-[#2563eb] text-white`
- Sub-item active: `bg-[#2563eb]/20 text-[#2563eb]`
- User section at bottom with avatar + logout

### TopBar
- `sticky top-0 z-30`, h-16, `bg-white/95 backdrop-blur-sm`
- Left: breadcrumb trail with chevron separators
- Right: user avatar (rounded-full, bg-accent, white initial)

### Width Strategy
- **Index / landing pages**: `max-w-7xl mx-auto`
- **Data table pages**: `w-full px-8` (full-width)

### Login Page
- No sidebar/topbar — full-screen split layout
- Left panel (lg+): blue gradient `#2563eb` → `#1d4ed8`, app branding, stats
- Right panel: centered login form, max-w-sm

---

## 5. Component Library

All shared components live in `src/app/components/`. Client components with `"use client"`.

### DataTable (`DataTable.tsx`)
Generic typed data table with:
- Column definition via `Column<T>[]` with `key`, `label`, `sortable`, `render`, `width`, `align`
- Checkbox selection (select all + individual)
- Sortable column headers with sort direction indicator
- Zebra stripes: `even:bg-gray-50/50`
- Row hover: `hover:bg-blue-50/40`
- Selected row: `bg-accent-light`
- Loading spinner state
- Empty state message
- Integrated pagination (internal `Pagination` component)

### Pagination (`Pagination.tsx`)
- Page number buttons with ellipsis for large ranges
- Previous / Next navigation
- Item count display: `{start}-{end} / {total}件`
- Page size selector (25/50/100)

### Modal (`Modal.tsx`)
- Overlay with `bg-black/40`
- Close on Escape key or backdrop click
- Body scroll lock when open
- Sizes: sm (`max-w-sm`), md (`max-w-lg`), lg (`max-w-2xl`), xl (`max-w-4xl`)
- Animation: `animate-scaleIn` (0.2s scale(0.95→1) + fade)
- Header with title + close button, scrollable body

### Sidebar (`Sidebar.tsx`)
- Dark left navigation with collapsible groups
- Items with emoji icons
- User info + logout at bottom
- Logo + collapse toggle at top

### TopBar (`TopBar.tsx`)
- Breadcrumb nav based on route labels
- User avatar with initial letter

### ActionBar (`ActionBar.tsx`)
- Floating bar shown when items selected
- Selected count + clear button
- Action buttons (primary/danger/outline variants)
- Animation: `animate-slideUp`

### SearchInput (`SearchInput.tsx`)
- Search icon on left, clear button on right
- Rounded, border, focus ring

### FilterSelect (`FilterSelect.tsx`)
- Styled `<select>` with placeholder option
- Consistent with input border/focus styles

### StatusBadge (`StatusBadge.tsx`)
- Rounded-full pill badge
- Variants: `default` (gray), `success` (green), `warning` (amber), `danger` (red), `info` (blue)

### StatCard (`StatCard.tsx`)
- Dashboard metric card with label, value, optional icon + trend
- Value at 30px bold, label at 12px uppercase tracking-wide

### PageHeader (`PageHeader.tsx`)
- Title (24px bold) + description (14px muted) + action buttons slot

### StepIndicator (`StepIndicator.tsx`)
- Horizontal step progress with numbered circles
- Completed (accent bg + checkmark), current (accent border), pending (gray border)

---

## 6. Animations

Defined in `globals.css` as utility classes:

| Class | Keyframes | Duration | Timing |
|-------|-----------|----------|--------|
| `.animate-fadeIn` | `opacity: 0 → 1` | 0.2s | ease-out |
| `.animate-slideUp` | `translateY(8px) + opacity 0→1` | 0.25s | ease-out |
| `.animate-scaleIn` | `scale(0.95) + opacity 0→1` | 0.2s | ease-out |

Used for:
- Modal open/close (`scaleIn`)
- ActionBar appearance (`slideUp`)
- Generic transitions (`fadeIn`)

Hover transitions: `transition-colors`, `transition-shadow`, `transition-all` with `duration-300` on cards.

---

## 7. Component Design Patterns

### Card
- `rounded-xl border border-card-border bg-card`
- Hover: `hover:shadow-lg hover:border-accent/30`
- Index page cards: icon in `bg-accent-light text-accent` that transitions to `bg-accent text-white` on group hover

### Table
- Container: `rounded-xl border border-border bg-white overflow-hidden`
- Header: `border-b border-border bg-gray-50/80`
- Body: `divide-y divide-border`
- Pagination: `border-t border-border px-4 py-3`

### Form Input
- `rounded-lg border border-border bg-white px-3 py-2 text-sm`
- Focus: `focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent`
- Disabled: `bg-gray-50 text-muted`

### Button
- Primary: `rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover`
- Outline: `rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-gray-50`
- Danger: `rounded-lg bg-danger px-4 py-2 text-sm text-white hover:bg-red-700`

### Action Button (in action bar)
- Primary: `bg-accent text-white hover:bg-accent-hover`
- Danger: `bg-danger text-white hover:bg-red-700`
- Outline: `border border-border bg-white text-foreground hover:bg-gray-50`

---

## 8. Dark Mode

Not supported. The design is light-mode only. The `@custom-variant dark` directive exists as a no-op — no dark mode variables are defined.

---

## 9. CSS Architecture

- `globals.css`: Design tokens, `@theme`, keyframe animations, body defaults
- Tailwind utility classes used for all component styling
- No module CSS or CSS-in-JS
- All colors referenced via Tailwind theme (`bg-accent`, `text-muted`, etc.) or CSS vars (`var(--xxx)`)
- No hardcoded color values in component files

---

## 10. Responsive Behavior

- Desktop-first (1280px+ optimized)
- Sidebar collapses from w-64 to w-16 on toggle
- Grid layouts: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` or `lg:grid-cols-4`
- Login page hides left brand panel below `lg` breakpoint
- Table horizontally scrollable on small screens (`overflow-x-auto`)
