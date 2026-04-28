# 🛡️ SVSU Vehicle Security System (SV-VSS) - Project Status

## 🚀 Current Milestone: Enterprise Security & Student Portal (V2)
The system has been upgraded from a basic entry logger to a full-scale **Identity & Access Management (IAM)** platform for SVSU Campus. It is now optimized for security, performance (5000+ students), and professional aesthetics.

---

## 🛠️ Key Features Implemented

### 1. 🎓 Advanced Student Portal
- **Secure Onboarding**: Multi-step registration flow with mandatory document verification.
- **Identity Documents**: Compulsory upload of **RC Photo**, **College ID (Front)**, and **College ID (Back)**.
- **Edit Profile**: Students can now update their details and documents via a secure update flow.
- **Digital Gate Pass**: Instant QR generation for students, optimized for mobile home-screen (PWA).

### 2. 🔐 Multi-Layered Security
- **Authentication**: JWT-based session management with **5-day persistence**.
- **Password Protection**: Industry-standard **BCrypt hashing** for all student passwords.
- **Human Verification**: Custom **Math Captcha** on Login and Reset Password pages to block bots.
- **Duplicate Prevention**: Logic to prevent multiple registrations for the same Roll Number.
- **Secure Reset**: Password recovery using **Roll No + Vehicle No** verification (No email required).

### 3. 📊 Guard Control Center
- **Live Security Feed**: Real-time monitoring of active/exited vehicles.
- **Smart Scanning**: Integrated scanner that handles instant registration of entries/exits via student QR.
- **Overstay Monitoring**: Automated alerts for vehicles inside the campus for >12 hours.
- **Gate Sign Generator**: Built-in tool to print high-quality physical QR signs for campus gates.

### 4. 🎨 Premium Design System
- **Theme**: Dark "Security Center" aesthetic with blue/purple accents.
- **Visuals**: Glassmorphism, smooth animations (Framer Motion), and subtle SVSU logo watermarks.
- **Favicon**: Custom motorbike + shield icon for a professional browser experience.

---

## 🏗️ Technical Progress

### Database (Supabase + Prisma)
- **Schema**: Updated with `UserVehicleProfile` and `EntryRecord` models.
- **Performance**: Added `@@index` on `rollNo`, `vehicleNo`, and `profileId` for high-speed lookups.
- **Integrity**: Enforced `unique` constraints on Roll Numbers to prevent data duplication.

### API Infrastructure
- **Auth APIs**: Secure endpoints for student login, registration, and password reset.
- **Profile APIs**: Image processing and Supabase storage integration for mandatory documents.
- **Dashboard APIs**: Aggregated statistics and filtered records for guard monitoring.

---

## 📋 Pending & Next Steps
- [ ] **Deployment**: Finalize hosting on Railway/Render as per user preference.
- [ ] **Email Notifications**: (Optional) Add email alerts for security breaches.
- [ ] **Guard Management**: Add an Admin dashboard to manage Guard credentials.
- [ ] **Audit Export**: Enable CSV/PDF export of all entry logs for university records.

---

## 📂 Project Structure (Latest)
- `/app/student/dashboard`: Secure student portal.
- `/app/profile`: Multi-step registration & Edit flow.
- `/app/admin`: Guard management interface.
- `/app/forgot-password`: Identity-based recovery.
- `/components`: Reusable UI elements (Captcha, Scanner, Camera).
- `/api`: Secure server-side logic.

**Last Updated**: 2026-04-28
**Status**: Stable & Secure
