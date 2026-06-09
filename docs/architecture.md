# Architecture

## Routing

- Next.js App Router with `trailingSlash: true` (configured in `next.config.ts`)
- Route segments: `/login`, `/dashboard`, `/master/*`, `/request/*`, `/delivery/*`, `/refund/*`, `/download/*`, `/correction`
- Auth API: `/api/auth/[...nextauth]/route.ts`

## Auth

- NextAuth.js with hardcoded demo credentials (identifier: `admin`, password: `password`)
- Middleware in `src/proxy.ts` protects routes — redirects unauthenticated users to `/login`
- Session provided via `<AppSessionProvider>` wrapping root layout

## Path Alias

- `@/*` maps to `./src/*` in tsconfig.json

## Config

- `next.config.ts`: `trailingSlash: true`
- `src/proxy.ts`: route protection middleware (export `config = { matcher: [...] }`)
- `src/app/globals.css`: global styles with Tailwind CSS 4 (PostCSS)
