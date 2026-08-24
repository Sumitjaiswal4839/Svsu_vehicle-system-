const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const profiles = await prisma.userVehicleProfile.findMany();
  for (const p of profiles) {
    if (p.rollNo !== p.rollNo.trim()) {
      await prisma.userVehicleProfile.update({
        where: { id: p.id },
        data: { rollNo: p.rollNo.trim() }
      });
      console.log('Fixed Roll No:', p.rollNo);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
