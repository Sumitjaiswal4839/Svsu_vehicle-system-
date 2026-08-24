import crypto from 'crypto';
import { JWT_SECRET } from './jwt';

export function generateSecureQR(data: any) {
  const payload = JSON.stringify(data);
  const secretHex = Buffer.from(JWT_SECRET).toString('hex');
  const signature = crypto.createHmac('sha256', secretHex).update(payload).digest('hex');
  return JSON.stringify({ payload, signature });
}

export function verifySecureQR(qrString: string) {
  const { payload, signature } = JSON.parse(qrString);
  const secretHex = Buffer.from(JWT_SECRET).toString('hex');
  const expectedSignature = crypto.createHmac('sha256', secretHex).update(payload).digest('hex');
  if (signature !== expectedSignature) throw new Error('Invalid QR Signature');
  return JSON.parse(payload);
}
