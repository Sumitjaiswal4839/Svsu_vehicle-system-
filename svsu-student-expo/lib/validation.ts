// Ported 1:1 from lib/validation.ts in the web app.

const VEHICLE_REGEX = /^[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,3}\s?\d{1,4}$/i;

export function isValidVehicleNumber(vehicleNo: string): boolean {
  if (!vehicleNo) return false;
  const cleaned = vehicleNo.replace(/\s+/g, '').toUpperCase();
  return VEHICLE_REGEX.test(cleaned);
}

export function formatVehicleNumber(vehicleNo: string): string {
  const cleaned = vehicleNo.replace(/\s+/g, '').toUpperCase();
  const match = cleaned.match(/^([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d{1,4})$/);
  if (!match) return vehicleNo.toUpperCase();
  return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
}

export function validateRollNo(rollNo: string): boolean {
  return rollNo.trim().length >= 5;
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) return { valid: false, message: 'Password must be at least 6 characters' };
  return { valid: true };
}
