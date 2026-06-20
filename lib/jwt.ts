if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
