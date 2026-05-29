# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 16 (App Router) business management application with authentication. Built with TypeScript, Tailwind CSS 4, and NextAuth.js. The app is a Japanese-language business tool covering master data management, request processing, cash-on-delivery (代引) operations, refunds, and detail downloads.

## Key Commands

```bash
npm run dev    # Start development server (turbopack)
npm run build  # Production build
npm run start  # Start production server
npm run lint   # Run ESLint
```

## Architecture

### Routing
- Uses Next.js App Router with `trailingSlash: true` (configured in `next.config.ts`)
- Route segments: `/login`, `/dashboard`, `/master/*`, `/request/*`, `/delivery/*`, `/refund/*`, `/download/*`, `/correction`
- Auth API: `/api/auth/[...nextauth]/route.ts`

### Auth
- NextAuth.js with hardcoded demo credentials (identifier: `admin`, password: `password`)
- Middleware in `src/proxy.ts` protects routes — redirects unauthenticated users to `/login`
- Session provided via `<AppSessionProvider>` wrapping root layout

### Components
- `src/app/components/Navbar.tsx` — navigation with nested dropdown menus (Master管理, 请求业务, 代引业务, 退款业务, 明细下载)
- `src/app/components/Footer.tsx` — footer
- `src/app/components/LayoutClient.tsx` — client component that conditionally renders Navbar/Footer (hidden on `/login`)
- `src/app/components/SessionProvider.tsx` — wraps NextAuth's SessionProvider

### Path Alias
- `@/*` maps to `./src/*` in tsconfig.json

### Config
- `next.config.ts`: `trailingSlash: true`
- `src/proxy.ts`: route protection middleware (export `config = { matcher: [...] }`)
- `src/app/globals.css`: global styles with Tailwind CSS 4 (PostCSS)
