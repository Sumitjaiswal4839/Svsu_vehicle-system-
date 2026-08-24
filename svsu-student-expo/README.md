# SVSU Gate Pass — Student App (Expo / React Native)

Yeh app **Svsu-Control-Center** ke student portion (login, register, digital
gate pass QR, gate QR scan for entry/exit, profile, activity history, forgot
password) ka mobile (Android + iOS) version hai — **Expo Router** se bana hai.

Yeh existing backend (Next.js API routes jo Supabase/Postgres se Prisma ke
zariye connected hain) ko **as-is** use karta hai. Backend me koi change
nahi kiya gaya — sirf wahi REST endpoints call ho rahe hain jo web app already
use karta hai:

- `POST /api/auth/student/login`
- `POST /api/auth/student/reset-password`
- `POST /api/auth/logout`
- `GET / POST / DELETE /api/profile`
- `POST /api/entry`
- `POST /api/exit`

## 1. Setup

```bash
cd svsu-student-expo
npm install
```

Root project me jo dependency versions maine `package.json` me di hain wo
Expo SDK 52 ke sath compatible hain. Agar `npx expo install --fix` chalate ho
to versions apne aap sahi ho jayengi.

## 2. Backend URL configure karo

Backend (Svsu-Control-Center) deploy hona chahiye (Vercel ya kahin bhi) taaki
mobile device usse hit kar sake — `localhost` sirf simulator me chalega, real
device pe nahi.

`.env.example` ko `.env` me copy karo aur apna deployed backend URL daalo:

```bash
cp .env.example .env
```

```
EXPO_PUBLIC_API_BASE_URL=https://your-deployed-backend-url.example.com
```

(Fallback ke liye `app.json` -> `expo.extra.apiBaseUrl` bhi update kar sakte
ho.)

## 3. Run

```bash
npx expo start
```

- `a` — Android emulator/device
- `i` — iOS simulator (macOS only)
- Ya Expo Go app se QR scan karo (development build).

Native camera/QR-scanner features (`expo-camera`) ke liye **development
build** (`npx expo run:android` / `npx expo run:ios`) ya `eas build` use
karna better rahega production ke liye — Expo Go me bhi camera kaam karta
hai, but final APK/IPA ke liye dev build recommended hai.

## 4. APK / IPA banane ke liye

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android   # APK/AAB
eas build --platform ios       # IPA (Apple Developer account required)
```

## App structure

```
app/
  _layout.tsx        Root stack (expo-router)
  index.tsx           Splash — checks session, redirects to login/dashboard
  login.tsx            Student login (roll no + password + captcha)
  forgot-password.tsx  Reset password via roll no + vehicle no
  register.tsx          3-step registration / edit profile
  dashboard.tsx          QR Pass / Profile / Activity tabs + gate QR scanner
components/
  CameraCaptureField.tsx  Camera/gallery capture -> base64 data URI
  QRScannerModal.tsx      Full-screen camera QR scanner (entry/exit gate)
  MathCaptcha.tsx          Same math captcha as web app
  FormField.tsx / SelectField.tsx / PrimaryButton.tsx  Shared UI
lib/
  api.ts            fetch wrapper -> backend REST API
  auth.ts            Local "is logged in" flag (SecureStore)
  config.ts           API_BASE_URL resolution
  buildingLogic.ts     Ported 1:1 from web app's lib/building-logic.ts
  validation.ts         Ported 1:1 from web app's lib/validation.ts
  theme.ts               Shared color tokens (matches web app's dark theme)
  types.ts                 Shared TypeScript types
```

## Auth / cookie note

Backend login sets an **httpOnly cookie** (`student_token`). React Native's
networking layer (native `URLSession` on iOS, `OkHttp`/`CookieManager` on
Android) automatically stores and replays cookies for requests to the same
host — same as a browser — so no extra cookie-handling code was needed for
the session to persist while the app is open. `lib/auth.ts` just keeps a
tiny local flag so the splash screen knows whether to try `/api/profile`
first.

If you ever see login "succeeding" but the dashboard immediately kicking you
back to login, it almost always means the API base URL points to a
different host than the one that set the cookie (e.g. http vs https, or a
redirect changing the domain) — double check `EXPO_PUBLIC_API_BASE_URL`.

## What's NOT included

Guard/admin/visitor portions of the original project (`app/admin`,
`app/login`, `app/entry`, `app/exit`, `app/visitor-entry`, admin API routes)
are intentionally **not** ported — you asked only for the student side.
