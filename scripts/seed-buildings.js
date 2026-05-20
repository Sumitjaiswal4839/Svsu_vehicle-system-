const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const buildings = [
  { name: 'Building 1 East', code: '1E' },
  { name: 'Building 2 East', code: '2E' },
  { name: 'Building 3 East', code: '3E' },
  { name: 'Building 2 West', code: '2W' },
  { name: 'Building 3 West', code: '3W' },
  { name: 'Workshop', code: 'Workshop' },
  { name: 'Gymnasium', code: 'Gymnasium' },
];

async function main() {
  console.log('Seeding buildings...');
  for (const b of buildings) {
    const building = await prisma.building.upsert({
      where: { code: b.code },
      update: { name: b.name },
      create: b,
    });
    console.log(`Building ${building.code} created/updated.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
