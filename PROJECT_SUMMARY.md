# SVSU Vehicle Security System - Project Summary
**Status**: Enterprise Ready | **Last Updated**: April 30, 2026

## 📌 Project Overview
The SVSU Vehicle Security System is a modern, QR-based entry and exit management platform designed for Shri Vishwakarma Skill University. It automates vehicle tracking, student verification, and visitor management using an enterprise-grade architecture.

---

## 🛡️ Enterprise Security Stack
- **JWT Rotation**: Implemented short-lived Access Tokens (15m) and long-lived Refresh Tokens (7d) for maximum session security.
- **Silent Refresh**: Middleware-level automatic token renewal for a seamless user experience.
- **Audit Logging**: Every sensitive action (Login, Entry, Exit, Admin Unlock) is logged with UserID, Action, Resource, IP Address, and Metadata.
- **RBAC (Role-Based Access Control)**: Strict enforcement for STUDENT, GUARD, and ADMIN roles at both API and UI levels.

---

## 🛠️ Technical Architecture
- **Frontend**: Next.js 16 (Turbopack), Tailwind CSS, Framer Motion.
- **Backend**: Next.js App Router with secure HttpOnly cookie management.
- **Database**: PostgreSQL (Supabase) with Prisma ORM.
- **Scalability**: Optimized via Prisma Connection Pooling (pgBouncer) on Port 6543 to handle 5000+ student profiles.
- **Storage**: Supabase Storage with RLS policies for RC and ID photo management.

---

## 🚀 Key Features

### 1. Student Portal
- **Verification System**: 4-point registration (RC, ID Front/Back, Profile Photo).
- **Gate Pass**: Dynamic QR code generation for authenticated campus access.

### 2. Guard Console (Security Dashboard)
- **Live Monitoring**: Real-time polling with a "Live Status" indicator.
- **QR Scanner**: Mobile-optimized scanner with instant student identity verification.
- **Exit Notifications**: Auto-toast alerts for vehicle departures.
- **Export**: Ability to download current vehicle logs as CSV for physical record keeping.

### 3. Admin Command Center (Enterprise Management)
- **Guard Approval Workflow**: Manual authorization/revocation system for security personnel.
- **Real-time Analytics**: Dashboard stats for Today's Entries, Active Vehicles, and Pending Approvals.
- **Peak Traffic Insights**: Historical analysis of gate activity for management reporting.
- **Global Auditing**: Exportable CSV logs of all system-wide security actions.

---

## ⚙️ Recent Technical Enhancements
- **Auth Hardening**: Transitioned to server-side logout and enterprise JWT rotation.
- **Performance**: Integrated `lib/export.ts` for fast, client-side CSV processing.
- **Reliability**: Implemented Audit Log middleware and hardened Entry/Exit APIs against unauthorized access.
- **Layout**: Full mobile responsiveness across all dashboards with a premium glassmorphism aesthetic.

---
**Engineered for Scale & Safety by Antigravity AI**
