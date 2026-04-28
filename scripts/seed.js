const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({
  connectionString,
  // Supabase pooler TLS chain can fail local validation.
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const guardPassword = process.env.SEED_GUARD_PASSWORD;

  if (!adminPassword || !guardPassword) {
    throw new Error(
      'Missing SEED_ADMIN_PASSWORD or SEED_GUARD_PASSWORD. Set both env vars before running the seed.'
    );
  }

  if (adminPassword === guardPassword) {
    throw new Error('SEED_ADMIN_PASSWORD and SEED_GUARD_PASSWORD must be different.');
  }

  const [adminHash, guardHash] = await Promise.all([
    bcrypt.hash(adminPassword, 10),
    bcrypt.hash(guardPassword, 10),
  ]);

  const admin = await prisma.user.upsert({
    where: { username: 'svsuadmin' },
    update: {},
    create: {
      username: 'svsuadmin',
      password: adminHash,
      role: 'ADMIN',
    },
  });

  const guard = await prisma.user.upsert({
    where: { username: 'guard' },
    update: {},
    create: {
      username: 'guard',
      password: guardHash,
      role: 'GUARD',
    },
  });

  console.log('Admin user created/verified:', admin.username);
  console.log('Guard user created/verified:', guard.username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
