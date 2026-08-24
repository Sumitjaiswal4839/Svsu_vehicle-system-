/**
 * Indian vehicle number validation.
 * Formats: HR 26 AB 1234 | HR26AB1234 | DL 1C AB 1234
 * Also accepts 2-wheelers: HR 26 A 1234
 */
const VEHICLE_REGEX = /^[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,3}\s?\d{1,4}$/i;

export function isValidVehicleNumber(vehicleNo: string): boolean {
  if (!vehicleNo) return false;
  const cleaned = vehicleNo.replace(/\s+/g, '').toUpperCase();
  return VEHICLE_REGEX.test(cleaned);
}

export function formatVehicleNumber(vehicleNo: string): string {
  // Normalize to uppercase with spaces: "HR26AB1234" → "HR 26 AB 1234"
  const cleaned = vehicleNo.replace(/\s+/g, '').toUpperCase();
  const match = cleaned.match(/^([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d{1,4})$/);
  if (!match) return vehicleNo.toUpperCase();
  return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
}

export function validateRollNo(rollNo: string): boolean {
  // Basic check — non-empty, at least 5 chars
  return rollNo.trim().length >= 5;
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Must contain an uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Must contain a lowercase letter' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Must contain a number' };
  if (!/[!@#$%^&*]/.test(password)) return { valid: false, message: 'Must contain a special character' };
  return { valid: true };
}
