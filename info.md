# SVSU Vehicle Security System (VSS) v2.0
## Project Analysis & Complete API Documentation

---

## Overview

SVSU Vehicle Security System is a QR-based vehicle management platform for the SVSU campus. It features a triple-role architecture (Student, Guard, Admin) with real-time tracking, automated audit logs, and secure document verification.

---

## Directory Structure

### Core Application (`/app`)

| Path | Description |
|---|---|
| `/admin` | Guard Control Center — real-time stats, active vehicle list, QR scanner |
| `/admin/dashboard` | Admin Core — approve/revoke guard access, manage sessions |
| `/admin/gate-qr` | Print high-quality Entry/Exit QR posters for campus gates |
| `/profile` | Student registration & digital gate pass generation |
| `/student/dashboard` | Student dashboard — QR pass, profile, entry history |
| `/student-login` | Student login page |
| `/visitor-entry` | Temporary visitor registration form |
| `/entry` | QR-triggered entry page (scanned by student) |
| `/exit` | QR-triggered exit page |
| `/forgot-password` | Student password reset |

### Components (`/components`)

| Component | Description |
|---|---|
| `Navbar.tsx` | Dynamic navigation adapting to user role |
| `HiddenTerminal.tsx` | Developer console (Space x5) for `siteadmin` access |
| `QRScanner.tsx` | Camera-based QR scanner with verification modal |
| `QRGenerator.tsx` | Gate QR code generator for printing |
| `CameraCapture.tsx` | Camera capture with frame-ready check |
| `VisitorForm.tsx` | Visitor entry form modal |
| `MathCaptcha.tsx` | Simple math CAPTCHA for bot prevention |
| `ErrorBoundary.tsx` | React error boundary wrapper |

### Library (`/lib`)

| File | Description |
|---|---|
| `auth.ts` | `verifyActiveSession()` — validates guard/admin JWT + DB session |
| `audit.ts` | `logAudit()` — writes structured audit log entries |
| `jwt.ts` | Exports `JWT_SECRET` with startup validation (throws if unset) |
| `logger.ts` | Structured JSON logger (`logger.info/warn/error`) |
| `prisma.ts` | Prisma client singleton with PG adapter |
| `sanitize.ts` | `sanitizeString()` — trims, strips HTML, limits to 500 chars |
| `supabase.ts` | Supabase storage client for photo uploads |
| `rate-limit.ts` | In-memory rate limiter (5 attempts / 15 min per IP) |
| `validation.ts` | Vehicle number format validation |
| `building-logic.ts` | Auto-assign building based on faculty/course |
| `csv.ts` | CSV log writer for entry/exit events |
| `export.ts` | CSV export utilities for dashboard |

---

## Complete API Reference

### Authentication

#### `POST /api/auth/login`
Guard and Admin login.

**Request body:**
```json
{ "username": "string", "password": "string" }
```

**Response (200):**
```json
{ "message": "Login successful", "role": "GUARD" | "ADMIN" }
```

**Cookies set:** `auth_token` (15 min), `refresh_token` (7 days), `admin_token` (if ADMIN)

**Errors:** `400` missing fields, `401` invalid credentials, `403` unauthorized account, `429` rate limited

---

#### `POST /api/auth/student/login`
Student login by roll number and password.

**Request body:**
```json
{ "rollNo": "string", "password": "string" }
```

**Response (200):**
```json
{ "message": "Logged in successfully", "student": { "name": "...", "rollNo": "..." }, "redirectTo": "/student/dashboard" }
```

**Cookie set:** `student_token` (5 days, SameSite=strict)

**Errors:** `400` missing fields, `401` wrong password, `404` student not found, `429` rate limited

---

#### `POST /api/auth/student/reset-password`
Reset student password using roll number + vehicle number verification.

**Request body:**
```json
{ "rollNo": "string", "vehicleNo": "string", "newPassword": "string" }
```

**Response (200):**
```json
{ "message": "Password reset successfully!", "name": "Student Name" }
```

**Errors:** `400` missing/short fields, `404` no matching profile

---

#### `POST /api/auth/logout`
Clears all auth cookies and deletes the DB session.

**Response (200):** `{ "message": "Logged out" }`

---

#### `GET /api/auth/refresh`
Refreshes the access token using the refresh cookie.

**Response (200):** `{ "message": "Token refreshed" }` — sets new `auth_token` cookie

**Errors:** `401` missing/invalid refresh token

---

### Dashboard

#### `GET /api/dashboard`
Returns live dashboard data for guards/admin.

**Auth:** `auth_token` cookie (guard or admin)

**Query params:**
| Param | Default | Description |
|---|---|---|
| `search` | `""` | Filter by vehicle no, name, roll no |
| `date` | today | Filter history by date (YYYY-MM-DD) |
| `page` | `1` | Page number for history (exited vehicles) |
| `limit` | `20` | Records per page (max 100) |

**Response (200):**
```json
{
  "activeVehicles": [...],
  "exitedVehicles": [...],
  "temporaryVisitors": [...],
  "guardBuildingId": "string | null",
  "guardBuildingName": "string | null",
  "guardName": "string | null",
  "is_admin": false,
  "pagination": { "page": 1, "limit": 20, "totalPages": 5, "totalExited": 98 },
  "stats": { "totalToday": 42, "insideCount": 7, "overstayedCount": 1 }
}
```

**Notes:**
- Guards only see records for their assigned building.
- Vehicles with no exit and entry older than 8 hours are auto-moved to history.

---

### Entry & Exit

#### `POST /api/entry`
Register a vehicle entry.

**Auth:** `auth_token` cookie

**Request body (student entry):**
```json
{ "profileId": "uuid", "vehicleNo": "HR 26 AB 1234" }
```

**Request body (visitor entry via guard):**
```json
{
  "isTemporary": true,
  "visitorName": "string",
  "visitorPurpose": "string",
  "visitorContact": "string",
  "visitorPhoto": "base64 or URL",
  "vehicleNo": "string",
  "buildingId": "string"
}
```

**Response (201):** `{ "message": "Entry registered successfully", "entry": {...} }`

**Errors:** `401` session expired, `500` DB error

---

#### `POST /api/exit`
Register a vehicle exit.

**Auth:** `auth_token` cookie

**Request body:**
```json
{ "entryId": "uuid" }
```
or
```json
{ "vehicleNo": "string" }
```
or
```json
{ "profileId": "uuid" }
```

**Response (200):**
```json
{ "message": "Exit registered successfully", "fullName": "...", "vehicleNo": "...", "exitTime": "ISO string" }
```

**Notes:** Temporary visitor records are permanently deleted on exit (privacy).

**Errors:** `401` session expired, `404` no active entry found

---

### Student Profile

#### `GET /api/profile`
Get the authenticated student's profile and last 10 entry records.

**Auth:** `student_token` cookie

**Response (200):** Full `UserVehicleProfile` object with `entries[]`

**Errors:** `401` unauthorized/expired

---

#### `POST /api/profile`
Create or update a student profile (registration/edit).

**Auth:** Optional `student_token` (required for edit, not for new registration)

**Request body:**
```json
{
  "name": "string",
  "rollNo": "string",
  "password": "string",
  "course": "string",
  "semester": "string",
  "faculty": "string",
  "vehicleNo": "string",
  "license": "string",
  "rcPhoto": "base64 or URL",
  "idCardFront": "base64 or URL",
  "idCardBack": "base64 or URL",
  "profilePhoto": "base64 or URL",
  "buildingId": "string"
}
```

**Response (201):** `{ "message": "Success", "profile": {...} }`

**Errors:** `400` missing fields, `409` roll number already registered by another user, `500` DB/upload error

---

#### `DELETE /api/profile`
Delete the authenticated student's account and all entry records (GDPR).

**Auth:** `student_token` cookie

**Response (200):** `{ "message": "Account deleted successfully" }` — clears `student_token` cookie

**Errors:** `401` unauthorized, `500` deletion failed

---

### Visitor Entry

#### `POST /api/visitor/entry`
Register a temporary visitor (creates both `VisitorEntry` and `EntryRecord`).

**Auth:** `auth_token` cookie

**Request body:**
```json
{
  "name": "string",
  "purpose": "string",
  "contact": "string",
  "photo": "base64 or URL",
  "buildingId": "string",
  "vehicleNo": "string",
  "isHackathon": false
}
```

**Response (200):** Created `VisitorEntry` object

**Errors:** `400` missing required fields, `500` DB error

---

### Buildings

#### `GET /api/buildings`
List all campus buildings ordered by code.

**Auth:** None

**Response (200):** `[{ "id": "...", "code": "A", "name": "Engineering Block" }, ...]`

**Cache:** `public, max-age=3600` (1 hour)

---

### Admin

#### `GET /api/admin/stats`
System-wide statistics for the admin panel.

**Auth:** `admin_token` cookie (ADMIN role required)

**Response (200):**
```json
{
  "totalEntries": 42,
  "activeVehicles": 7,
  "totalStudents": 312,
  "pendingGuards": 2,
  "hourlyStats": [0, 0, ..., 12, 8, ...],
  "auditStats": [{ "action": "LOGIN", "_count": { "_all": 50 } }],
  "buildingStats": [{ "buildingId": "A", "_count": { "_all": 20 } }],
  "topGuards": [...]
}
```

**Cache:** `private, max-age=30` (30 seconds)

---

#### `GET /api/admin/guards`
List all guards.

**Auth:** `admin_token` cookie (ADMIN role)

**Response (200):** `[{ "id": "...", "username": "...", "isAuthorized": true, "buildingId": "..." }]`

---

#### `PATCH /api/admin/guards`
Authorize/deauthorize a guard or assign a building.

**Auth:** `admin_token` cookie (ADMIN role)

**Request body:**
```json
{ "guardId": "uuid", "isAuthorized": true, "buildingId": "optional" }
```

---

#### `POST /api/admin/guards`
Create a new guard account.

**Auth:** `admin_token` cookie (ADMIN role)

**Request body:**
```json
{ "username": "string", "password": "string", "buildingId": "optional" }
```

---

#### `GET /api/admin/management?type=students|sessions`
List all students or active sessions.

**Auth:** `admin_token` cookie (ADMIN role)

---

#### `DELETE /api/admin/management`
Terminate a guard session (force logout).

**Auth:** `admin_token` cookie (ADMIN role)

**Request body:** `{ "sessionId": "uuid" }`

---

#### `GET /api/admin/audit-logs`
Export all audit log entries.

**Auth:** `admin_token` cookie (ADMIN role)

---

#### `GET /api/admin/verify?id=<profileId>`
Verify a student profile by ID (used by guard after QR scan).

**Auth:** `auth_token` cookie

**Response (200):** Student profile object

---

### Health Check

#### `GET /api/health`
Check system health and database connectivity.

**Auth:** None

**Response (200):**
```json
{ "status": "ok", "timestamp": "ISO string", "database": "connected", "version": "0.1.0" }
```

**Response (503):**
```json
{ "status": "error", "database": "disconnected", "timestamp": "ISO string" }
```

---

## Key Features

| Feature | Description |
|---|---|
| Instant Verification | Guards see student photo, vehicle number, and roll number instantly upon scanning |
| Live Exit Monitoring | Real-time "Vehicle Out" notifications when a student scans the exit QR |
| Paginated History | Dashboard history supports page/limit params with Load More UI |
| Hidden Admin Panel | `siteadmin` command unlocks Admin Core button in Navbar |
| Document Security | Mandatory RC and ID card uploads for every student profile |
| Temporary Visitors | Guest/delivery flow with auto-deletion of data on exit |
| Audit Logs | Structured JSON logs + CSV export for all entry/exit/login events |
| GDPR Deletion | Students can delete their account and all associated data |
| Health Endpoint | `/api/health` for uptime monitoring and DB connectivity checks |

---

## Deployment

1. `npx prisma db push` (first time) or `npm run migrate` (subsequent)
2. `npm run seed` — creates default Admin and Guard accounts
3. **Vercel**: Set `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Environment Variables
