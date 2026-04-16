import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

let poolConfig;

if (process.env.CLOUD_SQL_INSTANCE) {
  // Cloud Run: connect via Unix socket injected by Cloud SQL Proxy
  const socketPath = `/cloudsql/${process.env.CLOUD_SQL_INSTANCE}`;
  const url = new URL(process.env.DATABASE_URL);
  poolConfig = {
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    host: socketPath,
    ssl: false,
  };
} else {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
}

// Shared connection pool so requests reuse database connections.
const pool = new Pool(poolConfig);

export default pool;
