const db = require('./db');
const auth = require('./auth');

async function createAdmin() {
  const { ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Set ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD in backend/.env before running this command.');
  }

  await db.dbReady;
  const existing = await db.getOne(
    'SELECT id FROM admins WHERE username = $1 OR email = $2',
    [ADMIN_USERNAME, ADMIN_EMAIL]
  );
  const existingUser = await db.getOne(
    'SELECT id FROM users WHERE username = $1 OR email = $2',
    [ADMIN_USERNAME, ADMIN_EMAIL]
  );
  if (existing || existingUser) {
    throw new Error('That username or email already belongs to an account.');
  }

  const passwordHash = await auth.hashPassword(ADMIN_PASSWORD);
  await db.query(
    'INSERT INTO admins (username, email, password_hash) VALUES ($1, $2, $3)',
    [ADMIN_USERNAME, ADMIN_EMAIL, passwordHash]
  );
  console.log(`Administrator created: ${ADMIN_USERNAME}`);
}

createAdmin()
  .catch((error) => {
    console.error(`Admin creation failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => db.close());
