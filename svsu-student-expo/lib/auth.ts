import * as SecureStore from 'expo-secure-store';

const SESSION_FLAG_KEY = 'svsu_student_session_active';

/**
 * We don't store the JWT ourselves (it lives in the httpOnly cookie managed
 * by the OS network stack). This flag is only a hint so the splash screen
 * knows whether to attempt `/api/profile` right away or send the user to
 * the login screen immediately.
 */
export async function setSessionActive(active: boolean) {
  if (active) {
    await SecureStore.setItemAsync(SESSION_FLAG_KEY, '1');
  } else {
    await SecureStore.deleteItemAsync(SESSION_FLAG_KEY);
  }
}

export async function getSessionActive(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(SESSION_FLAG_KEY);
  return value === '1';
}
