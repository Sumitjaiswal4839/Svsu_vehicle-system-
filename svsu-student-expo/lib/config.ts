import Constants from 'expo-constants';

/**
 * Resolve the backend base URL.
 * Priority: EXPO_PUBLIC_API_BASE_URL (.env) -> app.json "extra.apiBaseUrl" -> localhost fallback (dev only).
 *
 * IMPORTANT: This app talks to the SAME backend (Svsu-Control-Center Next.js app)
 * that already connects to Supabase / Postgres via Prisma. Nothing on the backend
 * needs to change — this app only calls the existing REST API routes
 * (/api/auth/student/login, /api/profile, /api/entry, /api/exit, etc).
 */
const extra = (Constants.expoConfig?.extra ?? {}) as { apiBaseUrl?: string };

const RAW_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  extra.apiBaseUrl ||
  'http://localhost:3000';

// Strip trailing slash if present
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

export const GATE_QR_ENTRY = 'SVSU_GATE_ENTRY';
export const GATE_QR_EXIT = 'SVSU_GATE_EXIT';
