# SVSU Vehicle Security System (SV-VSS)

A QR-based vehicle management system for SVSU Campus. Automates entry/exit of vehicles using digital gate passes, ensuring security and efficiency at scale (5,000+ students).

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)

---

## Project Overview

SV-VSS provides a triple-role architecture:

- **Student Portal** — Register vehicle, generate a permanent QR gate pass, track entry/exit history.
- **Guard Control Center** — Real-time dashboard, QR scanner for student entry, visitor management.
- **Admin Panel** — Guard authorization, session management, audit logs, system statistics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| ORM | Prisma 7 (with `prisma.config.ts`, no `url` in schema) |
| Database | Supabase PostgreSQL |
| Auth | JWT via `jose`, HttpOnly cookies |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Storage | Supabase Storage (photos) |
| Language | TypeScript (strict mode) |

---

## Prerequisites

- Node.js 20+
- npm 10+
- A Supabase project with PostgreSQL database
- A Supabase storage bucket named `vehicle-photos`

---

## Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/svsu-vehicle-info.git
   cd svsu-vehicle-info
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Fill in all required values (see table below).

4. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

5. **Push schema to database (first time):**
   ```bash
   npx prisma db push
   ```

6. **Seed default admin/guard accounts:**
   ```bash
   npm run seed
   ```

7. **Start development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Supabase PostgreSQL connection string (with `?sslmode=require`) |
| `JWT_SECRET` | ✅ | Secret key for signing JWTs (min 32 chars, random) |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous/public API key |
| `NEXT_PUBLIC_APP_URL` | ⚠️ | Public URL of the app (e.g. `https://your-app.vercel.app`) |
| `NODE_ENV` | auto | Set to `production` by Vercel automatically |

> **Security:** `JWT_SECRET` must be set. The app will throw an error at startup if it is missing — there is no fallback.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run seed` | Seed default admin and guard accounts |
| `npm run migrate` | Deploy Prisma migrations (`prisma migrate deploy`) |
| `npm run migrate:dev` | Create and apply a new migration (`prisma migrate dev`) |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | — | Guard/Admin login |
| POST | `/api/auth/student/login` | — | Student login |
| POST | `/api/auth/student/reset-password` | — | Student password reset |
| POST | `/api/auth/logout` | Cookie | Logout (clears session) |
| GET | `/api/auth/refresh` | Cookie | Refresh access token |
| GET | `/api/dashboard` | Guard cookie | Live dashboard data (paginated) |
| POST | `/api/entry` | Guard cookie | Register vehicle entry |
| POST | `/api/exit` | Guard cookie | Register vehicle exit |
| GET/POST | `/api/profile` | Student cookie | Get or create student profile |
| DELETE | `/api/profile` | Student cookie | Delete account (GDPR) |
| POST | `/api/visitor/entry` | Guard cookie | Register temporary visitor |
| GET | `/api/buildings` | — | List all buildings (cached 1h) |
| GET | `/api/admin/stats` | Admin cookie | System statistics (cached 30s) |
| GET/PATCH/POST | `/api/admin/guards` | Admin cookie | Manage guards |
| GET/DELETE | `/api/admin/management` | Admin cookie | Manage students & sessions |
| GET | `/api/admin/audit-logs` | Admin cookie | Audit log export |
| GET | `/api/admin/verify` | Guard cookie | Verify student by QR |
| GET | `/api/health` | — | Health check (DB connectivity) |

---

## Architecture Overview

```
app/
├── admin/           # Guard dashboard + Admin panel
├── api/             # All API routes (Next.js Route Handlers)
├── profile/         # Student registration & QR gate pass
├── student/         # Student dashboard
├── visitor-entry/   # Temporary visitor form
lib/
├── auth.ts          # Session verification
├── audit.ts         # Audit log helper
├── jwt.ts           # JWT_SECRET with startup validation
├── logger.ts        # Structured JSON logger
├── prisma.ts        # Prisma client (singleton)
├── sanitize.ts      # Input sanitization
├── supabase.ts      # Supabase storage client
prisma/
└── schema.prisma    # Database schema
prisma.config.ts     # Prisma 7 config (datasource URL)
```

---

## Deployment (Vercel)

1. Push to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Add all environment variables from the table above in the Vercel project settings.
4. Vercel will run `npm run postinstall` (`prisma generate`) automatically.
5. For database migrations, run `npm run migrate` from your local machine or a CI step pointing at the production `DATABASE_URL`.

> **Note on Prisma Migrations:** This project uses Supabase with existing data. For production schema changes, use `npm run migrate:dev` locally to generate migration files, commit them, then run `npm run migrate` in CI/CD to apply them safely.

---

## Security Features

- HttpOnly, `SameSite=strict` cookies for all auth tokens
- JWT secret validated at startup (no fallback)
- HTTP security headers (X-Frame-Options, CSP, etc.)
- Input sanitization on all string fields
- Rate limiting on login endpoints (5 attempts / 15 min)
- Audit logging for all entry/exit/login events
- GDPR account deletion endpoint

---

## License

Developed for SVSU Campus Security. Unauthorized distribution is prohibited.
