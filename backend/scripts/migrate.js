require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, '../models/schema.sql'), 'utf8');
  try {
    await pool.query(sql);
    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
