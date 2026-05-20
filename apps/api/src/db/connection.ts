import { Pool } from 'pg';
import { config } from '../config';

export const db = new Pool({
  connectionString: config.databaseUrl,
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

db.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});
