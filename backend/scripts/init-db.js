import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { Client } = pg;

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT, 10) || 5432;
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';
const dbName = process.env.DB_NAME || 'retail_inventory_db';

async function initDatabase() {
  console.log(`\n=== 1. Connecting to PostgreSQL server at ${dbHost}:${dbPort} as '${dbUser}' ===`);

  // First connect to default 'postgres' database to create the target DB if it doesn't exist
  const serverClient = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: 'postgres',
  });

  try {
    await serverClient.connect();
    console.log('✓ Successfully connected to PostgreSQL server.');

    // Check if target database exists
    const checkDbRes = await serverClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1;`,
      [dbName]
    );

    if (checkDbRes.rowCount === 0) {
      console.log(`Creating database '${dbName}'...`);
      await serverClient.query(`CREATE DATABASE "${dbName}";`);
      console.log(`✓ Database '${dbName}' created.`);
    } else {
      console.log(`✓ Database '${dbName}' already exists.`);
    }
  } catch (err) {
    console.error('✗ Connection or database creation failed:', err.message);
    if (err.code === '28P01') {
      console.error('\n[HINT] PostgreSQL password authentication failed.');
      console.error(`Please update DB_PASSWORD in backend/.env with your PostgreSQL 'postgres' user password.`);
    }
    process.exit(1);
  } finally {
    await serverClient.end();
  }

  // Connect directly to the target application database
  console.log(`\n=== 2. Connecting to application database '${dbName}' ===`);
  const appClient = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
  });

  try {
    await appClient.connect();
    console.log(`✓ Connected to '${dbName}'.`);

    // Read and run schema.sql
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    console.log(`Reading schema from: ${schemaPath}`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Applying database schema (15 tables, constraints, indexes)...');
    await appClient.query(schemaSql);
    console.log('✓ Schema applied successfully.');

    // Read and run seed.sql
    const seedPath = path.resolve(__dirname, '../../database/seed.sql');
    console.log(`Reading seed data from: ${seedPath}`);
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('Applying seed data (roles, users, products, warehouses, orders)...');
    await appClient.query(seedSql);
    console.log('✓ Seed data ingested successfully.');

    // Verification queries
    console.log('\n=== 3. Database Ingestion Verification ===');
    const tables = ['roles', 'users', 'categories', 'products', 'warehouses', 'inventory', 'customers', 'orders', 'suppliers', 'purchase_orders', 'stock_movements', 'notifications'];
    for (const t of tables) {
      const countRes = await appClient.query(`SELECT COUNT(*) FROM "${t}";`);
      console.log(` - Table '${t}': ${countRes.rows[0].count} records`);
    }

    console.log('\n✓ Database initialization and seeding completed with 100% success!\n');
  } catch (err) {
    console.error('✗ Error applying schema or seed:', err);
    process.exit(1);
  } finally {
    await appClient.end();
  }
}

initDatabase();
