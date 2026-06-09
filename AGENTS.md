# AGENTS.md

This file provides guidance to Codex when working with code in this repository.

## Project Overview

A Next.js 16 (App Router) business management application with authentication. Built with TypeScript, Tailwind CSS 4, and NextAuth.js. The app is a Japanese-language business tool covering master data management, request processing, cash-on-delivery (代引) operations, refunds, and detail downloads.

## Key Commands

```bash
npm run dev    # Start development server (turbopack)
npm run build  # Production build
npm run start  # Start production server
npm run lint   # Run ESLint
```

## Documentation

Detailed documentation is organized under `docs/`:

### Core

| Document | Description |
|---|---|
| [docs/architecture.md](docs/architecture.md) | Routing, Auth, Path Alias, Config |
| [docs/conventions.md](docs/conventions.md) | Layout & styling conventions, mock data, naming |

### Components

| Document | Description |
|---|---|
| [docs/components/DataTable.md](docs/components/DataTable.md) | DataTable component styling, modes, and performance |
| [docs/Docs/](docs/Docs/) | Per-page documentation (00-22) covering each route segment |

### Design & Planning

| Document | Description |
|---|---|
| [docs/charge-cd-design.md](docs/charge-cd-design.md) | Charge CD design spec |
| [docs/store-page-design.md](docs/store-page-design.md) | Store page design spec |
| [docs/redesign-plan.md](docs/redesign-plan.md) | Redesign plan |
| [docs/superpowers/](docs/superpowers/) | Superpowers plans and specs |
