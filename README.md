# 🛡️ SVSU Vehicle Security System (SV-VSS)

A high-performance, premium QR-based vehicle management system designed for **SVSU Campus**. This system automates the entry and exit of vehicles using digital gate passes, ensuring security and efficiency at scale (5,000+ students).

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript)

---

## ✨ Key Features

### 🎓 Student Portal
*   **Secure Registration**: Students create profiles with Roll No, Vehicle Details, and mandatory RC photo upload.
*   **Identity Verification**: Roll No + Password based secure login.
*   **Digital Gate Pass**: Instant generation of a permanent QR pass that can be saved as a PWA on iOS/Android.
*   **5-Day Session**: Smart session management that prompts for re-authentication every 5 days.

### 💂 Guard Control Center
*   **Real-time Dashboard**: Live monitoring of "Active", "Exited", and "Temporary" vehicles.
*   **Quick Scan**: Integrated QR scanner to process entry/exit in milliseconds.
*   **Overstay Alerts**: Automatic visual alerts for vehicles staying inside for more than 12 hours.
*   **Gate Sign Printing**: Built-in tool to generate and print physical QR signs for gates.

### 🔒 Security & Performance
*   **JWT Authentication**: Secure session tracking for both guards and students.
*   **Database Indexing**: Optimized for fast lookups even with 5,000+ student records.
*   **Privacy-First**: Temporary visitor data is permanently deleted upon exit.

---

## 🛠️ Technical Stack

*   **Frontend**: Next.js 15 (App Router), Framer Motion (Animations), Lucide (Icons).
*   **Backend**: Next.js Server Actions & API Routes, Prisma ORM.
*   **Database**: Supabase PostgreSQL.
*   **Auth**: JWT (jose) & BCryptJS for password hashing.
*   **PWA**: Manifest & Service Worker for cross-platform "Add to Home Screen" support.

---

## 🚀 Quick Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/svsu-vehicle-info.git
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables (.env):**
   ```env
   DATABASE_URL="your_supabase_url"
   JWT_SECRET="your_secret"
   NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"   
   ```

4. **Sync Database:**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Run Development Server:**
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

*   `/app/admin`: Guard Dashboard & Gate Control.
*   `/app/profile`: Student Registration & Gate Pass view.
*   `/app/student-login`: Secure entry for students.
*   `/app/visitor-entry`: Temporary visitor registration.
*   `/api`: Backend endpoints for entry/exit logic.

---

## 🛡️ License
This project is developed for SVSU Campus Security. Unauthorized distribution is prohibited.
# Svsu_vehicle-system-
# Svsu_vehicle-system-
