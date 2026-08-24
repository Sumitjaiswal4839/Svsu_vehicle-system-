import pg from 'pg';
import "dotenv/config";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  try {
    console.log("Adding refreshTokenHash column...");
    await pool.query('ALTER TABLE "Session" ADD COLUMN "refreshTokenHash" TEXT;');
    console.log("Adding UNIQUE constraint...");
    await pool.query('ALTER TABLE "Session" ADD CONSTRAINT "Session_refreshTokenHash_key" UNIQUE("refreshTokenHash");');
    console.log("Success!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await pool.end();
  }
}

main();
