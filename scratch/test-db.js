const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log('Attempting to connect to:', process.env.DATABASE_URL.split('@')[1]);
    await client.connect();
    console.log('Connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Query result:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection failed:', err.message);
    if (err.message.includes('ETIMEDOUT') || err.message.includes('ENOTFOUND')) {
      console.log('Possible reasons: Database is paused, wrong host, or network restriction.');
    }
  }
}

testConnection();
