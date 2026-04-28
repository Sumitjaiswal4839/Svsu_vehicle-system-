import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const rawConnectionString = process.env.DATABASE_URL;

if (!rawConnectionString) {
  throw new Error("DATABASE_URL is not set");
}

const parsedConnection = new URL(rawConnectionString);
// Let pg's explicit ssl object drive TLS behavior for Supabase pooler.
parsedConnection.searchParams.delete("sslmode");

const pool = new pg.Pool({
  connectionString: parsedConnection.toString(),
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
