# SVSU Vehicle Security System (VSS) v2.0
## Project Analysis & Documentation

### 🚀 Overview
SVSU Vehicle Security System is a state-of-the-art, QR-based vehicle management platform designed for the SVSU campus. It features a triple-role architecture (Student, Guard, Admin) with real-time tracking, automated audit logs, and secure document verification.

---

### 📂 Directory Structure Analysis

#### 1. Core Application (`/app`)
*   **`/admin`**: The **Guard Control Center**. Includes real-time statistics, active vehicle lists, and the QR Scanner for student entry.
    *   **`/admin/dashboard`**: **Admin Core**. Hidden panel to approve or revoke Guard access.
    *   **`/admin/gate-qr`**: Utility to print high-quality Entry/Exit posters for campus gates.
*   **`/api`**: Backend logic layer.
    *   `auth/`: Handles secure sessions for Students, Guards, and the Hidden Terminal.
    *   `entry/exit/`: Core transactional logic for recording vehicle movements.
    *   `admin/verify/`: Dedicated endpoint for Guard-side identity verification.
*   **`/profile`**: Student Registration & Digital Pass generation.
*   **`/guard-register`**: Public application form for security personnel.

#### 2. Components (`/components`)
*   **`Navbar.tsx`**: Dynamic global navigation that adapts to user role (Student/Guard/Admin).
*   **`HiddenTerminal.tsx`**: A secret developer console accessible via special keystrokes (Space x5) for `siteadmin` access.
*   **`QRScanner.tsx`**: Upgraded scanner using core libraries for better mobile compatibility, featuring a **Verification Modal**.
*   **`CameraCapture.tsx`**: Advanced camera logic that ensures video frames are ready before capture to prevent blank images.

#### 3. Database & Storage (`/prisma`, `/lib`)
*   **Prisma Schema**: Models for `UserVehicleProfile`, `EntryRecord`, and `Guard`.
*   **Supabase Integration**: Used for both PostgreSQL database and Cloud Storage (RC photos, Profile photos).

---

### 💎 Key Features

| Feature | Description |
| :--- | :--- |
| **Instant Verification** | Guards see student photo, vehicle number, and roll number instantly upon scanning. |
| **Live Exit Monitoring** | Guards receive real-time "Vehicle Out" notifications when a student scans the exit QR. |
| **Hidden Admin Panel** | `siteadmin` command unlocks a special "Admin Core" button in the Navbar. |
| **Document Security** | Mandatory RC and ID card uploads for every student profile. |
| **Temporary Visitors** | Flow for guests/deliveries with auto-deletion of data on exit for privacy. |
| **Audit Logs** | Automatic CSV generation for all entry/exit events for campus security audits. |
| **Stability Logic** | Camera frame-check ensures high-quality photo captures even on slower devices. |

---

### 🛠️ Technical Specifications
*   **Frontend**: Next.js 16 (App Router), Tailwind CSS, Framer Motion.
*   **Backend**: Next.js Serverless Functions, Prisma ORM.
*   **Database**: Supabase (PostgreSQL).
*   **Auth**: JWT (Jose) with Secure HttpOnly Cookies.
*   **Icons**: Lucide React.
*   **Toasts**: Sonner.

---

### 📝 Deployment Guide
1.  **DB Push**: `npx prisma db push` (Ensure port 5432 is open).
2.  **Seed**: `npm run seed` (Creates default Admin and Guard).
3.  **Vercel**: Set `DATABASE_URL`, `JWT_SECRET`, and Supabase keys in Environment Variables.
