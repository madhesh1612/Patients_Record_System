const fs = require('fs');
const path = require('path');
const db = require('./db');

async function run() {
  try {
    const sqlPath = path.join(__dirname, '../sql/schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Running DB schema...');
    await db.pool.query(sql);
    console.log('Schema executed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to execute schema:', err.message || err);
    process.exit(1);
  }
}

run();
