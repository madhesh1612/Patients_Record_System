const db = require('./db');
const auth = require('./auth');

async function seedDatabase() {
  try {
    await db.dbReady;
    console.log('Seeding demo users...');

    // Patient user
    const patientHash = await auth.hashPassword('password123');
    await db.execute(
      'INSERT OR IGNORE INTO users (username, email, password_hash, role, phone_number) VALUES (?, ?, ?, ?, ?)',
      ['john_patient', 'john@example.com', patientHash, 'patient', '+1234567890']
    );
    console.log('✓ Created patient: john_patient / password123');

    // Clinician user
    const clinicianHash = await auth.hashPassword('password123');
    await db.execute(
      'INSERT OR IGNORE INTO users (username, email, password_hash, role, phone_number) VALUES (?, ?, ?, ?, ?)',
      ['dr_smith', 'dr.smith@example.com', clinicianHash, 'clinician', '+1987654321']
    );
    console.log('✓ Created clinician: dr_smith / password123');

    console.log('\nDemo users ready for testing!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
