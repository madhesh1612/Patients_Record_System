const dotenv = require('dotenv');
const net = require('net');

dotenv.config();

let db = null;
let isPostgres = false;

// Helper to check if Postgres is available
const checkPostgresAvailable = () => {
  return new Promise((resolve) => {
    const socket = net.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      timeout: 2000,
    });

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
  });
};

// Initialize database
const initDB = async () => {
  try {
    const postgresAvailable = await checkPostgresAvailable();

    if (postgresAvailable) {
      // Use PostgreSQL
      const { Pool } = require('pg');
      db = new Pool({
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'patient_records',
      });

      db.on('connect', () => {
        console.log('✓ Connected to PostgreSQL database');
      });

      db.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
      });

      isPostgres = true;
    } else {
      // Fallback to SQLite
      const sqlite = require('./db_sqlite');
      db = sqlite;
      isPostgres = false;
      console.log('⚠ PostgreSQL unavailable, using SQLite for demo purposes');
    }
  } catch (err) {
    console.error('Error initializing database:', err.message);
  }
};

// Initialize DB without waiting - return resolved promise
let dbReady = Promise.resolve().then(() => initDB());

/**
 * Execute a query
 * @param {string} query - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise} Query result
 */
const query = (text, params) => {
  return dbReady.then(() => db.query(text, params));
};

/**
 * Get a single row
 * @param {string} query - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise} Single row or null
 */
const getOne = async (text, params) => {
  await dbReady;
  return db.getOne(text, params);
};

/**
 * Get all rows
 * @param {string} query - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise} Array of rows
 */
const getAll = async (text, params) => {
  await dbReady;
  return db.getAll(text, params);
};

/**
 * Execute insert/update/delete
 * @param {string} query - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise} Number of affected rows
 */
const execute = async (text, params) => {
  await dbReady;
  return db.execute(text, params);
};

/**
 * Begin a transaction
 * @returns {Promise} Client object
 */
const beginTransaction = async () => {
  await dbReady;
  return db.beginTransaction();
};

module.exports = {
  db,
  query,
  getOne,
  getAll,
  execute,
  beginTransaction,
  isPostgres: () => isPostgres,
  dbReady,
};
