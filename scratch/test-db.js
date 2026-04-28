const pg = require('pg');
require('dotenv').config();

async function test() {
  const rawUrl = process.env.DATABASE_URL;
  // Simple string replace to remove sslmode but keep the rest exactly as is
  const connectionString = rawUrl.split('?')[0]; 
  
  console.log('Testing raw string connection (no params)...');
  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connection Successful!', res.rows[0]);
  } catch (err) {
    console.error('Connection Failed:', err.message);
  } finally {
    await pool.end();
  }
}

test();
