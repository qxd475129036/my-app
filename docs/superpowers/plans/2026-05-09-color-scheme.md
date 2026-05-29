# Color Scheme Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the overall color palette of the business management app from the current zinc + indigo scheme to a more refined slate + blue palette with consistent dark mode.

**Architecture:** Define a cohesive color system in `globals.css` using CSS custom properties and Tailwind v4 `@theme inline`, then systematically update all components to use the new tokens.

**Tech Stack:** Tailwind CSS 4, CSS custom properties, Next.js App Router

---

## Current State

The app uses a zinc + indigo palette with several inconsistencies:
- Body background: `bg-zinc-50` / `dark:bg-black`
- Cards: `bg-white` / `dark:bg-zinc-900`
- Borders: `border-zinc-200` / `dark:border-zinc-800` (but some use `zinc-700`)
- Accent: `indigo-600` / `indigo-400` (dark mode)
- Focus rings: inconsistent (`zinc-300`, `indigo-400`, `indigo-500`)
- Inline hex values in `page.tsx` instead of CSS variables

## Target Palette

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| Background | `#fafafa` | `#09090b` | Page-level background |
| Surface | `#ffffff` | `#18181b` | Cards, nav, footer |
| Border | `#e4e4e7` | `#27272a` | Borders, dividers |
| Text primary | `#18181b` | `#fafafa` | Headings, body text |
| Text secondary | `#71717a` | `#a1a1aa` | Labels, muted text |
| Accent | `#2563eb` | `#3b82f6` | Buttons, active states |
| Accent light | `#eff6ff` | `#1e3a5f` | Hover backgrounds |

This shifts from zinc to a warmer neutral (zinc-50 → `#fafafa`, zinc-900 → `#18181b`) and uses a cleaner blue accent.

---

### Task 1: Define CSS Variables and Tailwind Theme

**Files:**
- Modify: `src/app/globals.css`

Update `globals.css` to define the new color tokens:

```css
@import "tailwindcss";

:root {
  --background: #fafafa;
  --foreground: #18181b;
  --card: #ffffff;
  --border: #e4e4e7;
  --muted: #71717a;
  --accent: #2563eb;
  --accent-light: #eff6ff;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #09090b;
    --foreground: #fafafa;
    --card: #18181b;
    --border: #27272a;
    --muted: #a1a1aa;
    --accent: #3b82f6;
    --accent-light: #1e3a5f;
  }
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-border: var(--border);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  --color-accent-light: var(--accent-light);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

---

### Task 2: Update Root Layout

**Files:**
- Modify: `src/app/layout.tsx`

Change the body background from `bg-zinc-50 dark:bg-black` to use the new CSS variable:

```tsx
<body className="min-h-full flex flex-col bg-[var(--background)] dark:bg-[var(--background)] font-sans">
```

---

### Task 3: Update Navbar

**Files:**
- Modify: `src/app/components/Navbar.tsx`

Replace all hardcoded zinc/indigo color classes with the new tokens:

- `bg-white dark:bg-zinc-900` → `bg-card dark:bg-[var(--card)]`
- `border-zinc-200 dark:border-zinc-800` → `border-border dark:border-[var(--border)]`
- `text-zinc-900 dark:text-white` → `text-foreground`
- `text-zinc-600 dark:text-zinc-300` → `text-muted`
- `text-indigo-600 dark:text-indigo-400` → `text-accent`
- `bg-indigo-50 dark:bg-indigo-900/20` → `bg-accent-light`
- `bg-indigo-600 hover:bg-indigo-500` → `bg-accent hover:bg-accent/90`
- `ring-zinc-950/5 dark:ring-white/10` → `ring-border`
- `bg-zinc-200 dark:bg-zinc-700` → `bg-border`
- `bg-zinc-50 dark:hover:bg-zinc-800` → `bg-accent-light`
- `text-zinc-700 dark:text-zinc-200` → `text-foreground`
- `hover:bg-zinc-50 dark:hover:bg-zinc-700/50` → `hover:bg-accent-light`

---

### Task 4: Update Footer

**Files:**
- Modify: `src/app/components/Footer.tsx`

Replace:
- `bg-white dark:bg-zinc-900` → `bg-card dark:bg-[var(--card)]`
- `border-t border-zinc-200 dark:border-zinc-800` → `border-t border-border dark:border-[var(--border)]`
- `text-zinc-500 dark:text-zinc-400` → `text-muted`

---

### Task 5: Update All Page Components

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/app/master/store/page.tsx`
- Modify: `src/app/master/request-cd/page.tsx`
- Modify: `src/app/master/price/page.tsx`
- Modify: `src/app/request/bulk-adjust/page.tsx`
- Modify: `src/app/request/metadata/page.tsx`
- Modify: `src/app/request/approval/page.tsx`
- Modify: `src/app/delivery/list/page.tsx`
- Modify: `src/app/delivery/payment/page.tsx`
- Modify: `src/app/delivery/calendar/page.tsx`
- Modify: `src/app/refund/list/page.tsx`
- Modify: `src/app/refund/cd/page.tsx`
- Modify: `src/app/download/hokan/page.tsx`
- Modify: `src/app/download/sohaku/page.tsx`
- Modify: `src/app/correction/page.tsx`
- Modify: `src/app/login/page.tsx`

For each page, replace:
- `bg-zinc-50` → `bg-[var(--background)]`
- `bg-white` → `bg-card`
- `border-zinc-200` → `border-border`
- `text-zinc-500/600/700` → `text-muted` or `text-foreground`
- `dark:bg-zinc-900` → `dark:bg-[var(--card)]`
- `dark:border-zinc-700/800` → `dark:border-[var(--border)]`
- `dark:text-zinc-200/300/400` → `dark:text-muted` or `dark:text-foreground`
- `dark:text-white` → `dark:text-foreground`
- `dark:bg-zinc-800` → `dark:bg-[var(--card)]`
- Inline hex values (e.g., `#383838`) → use Tailwind classes or CSS variables

---

### Task 6: Update Login Page

**Files:**
- Modify: `src/app/login/page.tsx`

The login page typically has its own styling. Update to use the new palette:
- Background: `bg-[var(--background)]`
- Card: `bg-card`
- Text: `text-foreground` / `text-muted`
- Input borders: `border-border`
- Button: `bg-accent`

---

### Task 7: Verify and Test

**Files:**
- Run: `npm run dev`
- Open the app in browser
- Toggle dark mode (use browser dev tools to simulate)
- Check all pages for visual consistency
- Verify no hardcoded zinc/indigo colors remain (grep for remaining patterns)

Run:
```bash
grep -r "zinc-" src/app/ --include="*.tsx" | grep -v "node_modules"
grep -r "indigo-" src/app/ --include="*.tsx" | grep -v "node_modules"
```

Any remaining `zinc-` or `indigo-` references should be evaluated — most should be replaced.

---

## Self-Review

**1. Spec coverage:** All pages and components covered. CSS variables defined in one place.

**2. Placeholder scan:** No TBD/TODO patterns. All code shown.

**3. Type consistency:** CSS variable names match across all tasks. Tailwind class names follow `bg-`, `text-`, `border-` conventions.

**4. Dark mode:** All new tokens have dark mode equivalents defined in `@media (prefers-color-scheme: dark)`.
