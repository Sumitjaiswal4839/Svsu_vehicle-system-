import { API_BASE_URL } from './config';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Thin wrapper around fetch talking to the existing Next.js backend.
 *
 * Auth note: the backend sets an httpOnly `student_token` cookie on login
 * (see /api/auth/student/login). React Native's networking layer (native
 * URLSession on iOS, OkHttp on Android) automatically stores and replays
 * Set-Cookie / Cookie headers for requests to the same host, exactly like a
 * browser does — so we don't need to manually read/store the cookie for the
 * app to stay logged in while it's running. We DO keep a lightweight local
 * flag (see lib/auth.ts) purely to skip the network call on cold start and
 * to know whether to show the login screen.
 */
async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON response (e.g. network/HTML error page)
  }

  if (!res.ok) {
    const message =
      (data && (data.error || data.message)) ||
      `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return data as T;
}

export const api = {
  get: <T = any>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T = any>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  del: <T = any>(path: string) => request<T>(path, { method: 'DELETE' }),
};
