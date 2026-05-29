# MyApp

A Next.js application with authentication.

## Features

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS
- NextAuth.js for authentication
- Protected routes

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
cd my-app
npm install
```

### Environment Variables

Create a `.env.local` file:

```
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pages

### Login (`/login`)
Authentication page. Demo credentials:
- Email: `admin`
- Password: `password`

### Dashboard (`/dashboard`)
Protected page - requires authentication.

## Project Structure

```
src/app/
├── api/auth/[...nextauth]/
│   └── route.ts      # NextAuth configuration
├── components/
│   ├── Navbar.tsx    # Navigation component
│   ├── Footer.tsx    # Footer component
│   └── SessionProvider.tsx
├── login/
│   └── page.tsx      # Login page
├── dashboard/
│   └── page.tsx      # Dashboard page
├── middleware.ts     # Route protection
├── layout.tsx        # Root layout
└── globals.css       # Global styles
```
