# SVSU Vehicle Security System - Project Summary
**Status**: Enterprise Ready (v2.5) | **Last Updated**: April 30, 2026

## 📌 Project Overview
The SVSU Vehicle Security System is a high-performance, QR-based ecosystem designed for Shri Vishwakarma Skill University. It provides a dual-method authorization system: Guard-controlled verification and Student-led self-entry, ensuring 100% campus security and operational efficiency.

---

## 🛡️ Enterprise Security & Automation
- **Dual-Scan Logic**: Supports both Guard scanning Student QR AND Student scanning Gate QR (Self-Entry).
- **JWT Rotation**: 15m Access / 7d Refresh token rotation for military-grade session security.
- **Audit Logging**: Real-time tracking of all security events with IP and metadata.
- **Smart Gate Recognition**: Machine-readable 'ENTRY_GATE' and 'EXIT_GATE' identifiers for automated traffic flow.

---

## 🚀 Key Features

### 1. Student Portal (Self-Service)
- **Digital Gate Pass**: Dynamic personal QR code for guard verification.
- **Self-Entry Scanner**: Built-in mobile scanner to scan university gate signs for instant, contactless entry.
- **Profile History**: Real-time view of personal entry/exit logs and verification status.

### 2. Guard Console (Field Security)
- **High-Speed Scanner**: Optimized for low-light and rapid vehicle processing.
- **Live Monitoring**: Pulse-status indicators for real-time connection feedback.
- **Instant Exit**: One-click vehicle departure registration.

### 3. Admin Command Center (Management)
- **Real-Time Analytics**: Deep-dive metrics including Role-wise Activity and Peak Traffic Analysis.
- **Guard Approval Workflow**: Centralized system to authorize/revoke security personnel.
- **Security Auditing**: Exportable CSV logs for university compliance and audits.

---

## 🛠️ Technical Stack
- **Frontend**: Next.js 16 (Turbopack), Tailwind CSS, Framer Motion.
- **Database**: PostgreSQL (Supabase) via Prisma with **Connection Pooling (Port 6543)**.
- **Branding**: Professional SVSU Shield Branding & Enterprise UX.
- **A11y**: Full ARIA accessibility support for mobile-first security operations.

---
**Engineered for Scale, Security & Speed by Antigravity AI**
