require('dotenv').config();
const pg = require('pg');

async function test() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true },
    max: 1,
  });

  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connected to PG successfully:', res.rows[0]);
  } catch (e) {
    console.error('PG Connection Error (rejectUnauthorized=true):', e.message);
  }

  const pool2 = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1,
  });

  try {
    const res2 = await pool2.query('SELECT NOW()');
    console.log('Connected to PG successfully (rejectUnauthorized=false):', res2.rows[0]);
  } catch (e) {
    console.error('PG Connection Error (rejectUnauthorized=false):', e.message);
  }

  pool.end();
  pool2.end();
}

test();
