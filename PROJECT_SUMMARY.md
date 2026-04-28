# SVSU Vehicle Security System - Project Summary
**Status**: Production Ready | **Last Updated**: April 30, 2026

## 📌 Project Overview
The SVSU Vehicle Security System is a modern, QR-based entry and exit management platform designed for Shri Vishwakarma Skill University. It automates vehicle tracking, student verification, and visitor management using a high-performance tech stack.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 16 (Turbopack), Tailwind CSS, Framer Motion (Animations).
- **Backend**: Next.js App Router (API Routes).
- **Database**: PostgreSQL (Supabase) with Prisma ORM.
- **Storage**: Supabase Storage (for RC photos, ID cards, and profile pictures).
- **Authentication**: JWT-based secure sessions with HttpOnly cookies.
- **Icons**: Lucide React.

---

## 🚀 Key Features Implemented

### 1. Student Portal (Vehicle Registration)
- **Multi-Step Registration**: Smooth onboarding for students to register their vehicles.
- **Photo Verification**: Integrated camera capture for:
  - Vehicle RC (Registration Certificate).
  - College ID Card (Front & Back).
  - Profile Photo (Selfie for live verification).
- **Digital Gate Pass**: Automatic generation of a permanent QR Code for registered students.
- **Profile Management**: Ability to view and update vehicle details.

### 2. Guard Console (Security Dashboard)
- **Live Activity Feed**: Real-time polling of entry/exit records.
- **QR Scanner**: Mobile-optimized scanner to verify student QR codes at the gate.
- **Verification Modal**: Displays student's live photo and details upon scanning to prevent unauthorized entry.
- **Entry/Exit Logic**:
  - One-click entry authorization.
  - Automatic exit registration with toast notifications for guards.
- **Visitor Management**: Dedicated form for temporary visitors (guests/parents).

### 3. Admin Core (Hidden Management)
- **Hidden Terminal**: An "Easter Egg" terminal accessible via specific keystrokes or the navbar.
- **`siteadmin` Command**: Unlocks the Admin Dashboard globally.
- **Management Console**: (Pending/In-Progress) Interface to approve guard registrations and view campus-wide analytics.

### 4. Global Navigation & UI/UX
- **Dynamic Navbar**: Role-based visibility (Student, Guard, or Admin).
- **Mobile First**: Fully responsive design optimized for mobile devices used by guards.
- **Premium Aesthetics**: Dark mode theme with glassmorphism effects and smooth transitions.

---

## ⚙️ Technical Stabilizations & Fixes
- **Database Stability**: Optimized Prisma connection pooling (`max: 1`) to prevent Supabase "Circuit Breaker" errors.
- **SSR Optimization**: Implemented dynamic imports for Framer Motion components to ensure SSR compatibility in Next.js 16.
- **Secure Sessions**: Developed a server-side logout API to reliably clear HttpOnly authentication cookies.
- **Storage Security**: Configured Supabase RLS (Row Level Security) policies for secure photo uploads.
- **Build Fixes**: Resolved TypeScript property errors (e.g., Framer Motion `w` vs `width`) to enable Vercel production deployment.

---

## 📂 Project Structure
- `/app`: Main application routes and APIs.
- `/components`: Reusable UI components (Navbar, QR Scanner, Camera, etc.).
- `/lib`: Database and Storage configurations (Prisma, Supabase).
- `/prisma`: Database schema and migration logs.
- `/public`: Static assets and icons.

---

## 📝 Next Steps
1. **Admin Approval Workflow**: Finalize the interface for admins to approve new guard registrations.
2. **Analytics Dashboard**: Add charts for peak entry/exit hours.
3. **Email Notifications**: (Optional) Send alerts for overstayed vehicles.

---
**Engineered for Safety by Antigravity AI**
