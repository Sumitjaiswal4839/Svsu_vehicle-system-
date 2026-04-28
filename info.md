# 🛡️ SVSU Vehicle Security System (SV-VSS) - Project Status

## 🚀 Current Milestone: Enterprise Security & Student Portal (V2)
The system has been upgraded from a basic entry logger to a full-scale **Identity & Access Management (IAM)** platform for SVSU Campus. It is now optimized for security, performance (5000+ students), and professional aesthetics.

---

## 🛠️ Key Features Implemented

### 1. 🎓 Advanced Student Portal (`/profile`, `/student/dashboard`)
- **Multi-Step Onboarding**: Secure registration flow with mandatory document verification.
- **Identity Documents**: Compulsory upload of **RC Photo**, **College ID (Front)**, and **College ID (Back)**.
- **Profile Management**: Students can update their details and documents via a secure update flow.
- **Digital Gate Pass**: Instant QR generation for students, optimized for mobile home-screen (PWA).

### 2. 🔐 Multi-Layered Security
- **Authentication**: JWT-based session management with **5-day persistence**.
- **Industry Standards**: BCrypt hashing for passwords and Row Level Security (RLS) support.
- **Human Verification**: Custom **Math Captcha** on Login and Reset Password pages.
- **Secure Recovery**: Password reset using Roll No + Vehicle No verification.

### 3. 📊 Guard Control Center (`/admin`)
- **Live Security Feed**: 3-tab monitoring (Active, Temporary, Exited) with overstay alerts (>12h).
- **Smart Scanning**: Integrated `html5-qrcode` scanner for instant student entry/exit.
- **Gate Signage**: Dedicated page (`/admin/gate-qr`) for printing high-quality Entry/Exit QR signs.

### 4. 🎨 Premium Design & PWA
- **Theme**: Dark "Security Center" aesthetic with glassmorphism and Framer Motion animations.
- **Mobile Optimized**: Fully responsive UI with PWA metadata for home-screen installation.
- **Professional Assets**: Custom motorbike/shield favicon and curated typography.

---

## 🏗️ Technical Progress

### Database & Storage (Supabase + Prisma)
- **High-Scale Schema**: Optimized `UserVehicleProfile` and `EntryRecord` models.
- **Performance**: Instant lookups via `@@index` on `rollNo`, `vehicleNo`, and `profileId`.
- **Integrity**: Enforced `unique` constraints and auto-cleanup of temporary visitor data.

### API & Infrastructure
- **Secure Endpoints**: Auth, Profile, and Dashboard APIs with robust error handling.
- **Image Processing**: Supabase storage integration for mandatory student documents.

---

## 📋 Pending & Next Steps
- [ ] **Deployment**: Finalize hosting on **Railway** or **Render**.
- [ ] **Repository Setup**: Push to a private GitHub repository and link to hosting.
- [ ] **Storage Config**: Create a public "photos" bucket in Supabase for image rendering.
- [ ] **Email Alerts**: (Optional) Add notifications for security breaches.
- [ ] **Audit Export**: Enable CSV/PDF export for university records.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 15, React 19, Framer Motion, Lucide Icons, Sonner.
- **Backend**: Next.js API Routes, Prisma ORM.
- **Database/Storage**: Supabase (PostgreSQL).
- **Tools**: html5-qrcode, BCrypt, Jose (JWT).

**Last Updated**: 2026-04-28
**Status**: Stable & Secure
