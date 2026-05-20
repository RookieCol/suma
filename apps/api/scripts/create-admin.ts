// Creates the first admin user directly in the database.
// Usage: pnpm tsx scripts/create-admin.ts <email> <contraseña> [nombre]
import { db } from '../src/db/connection';
import { hashPassword, generateRandomString } from 'better-auth/crypto';

async function main() {
  const [,, email, password, name = 'Admin'] = process.argv;

  if (!email || !password) {
    console.error('Uso: pnpm tsx scripts/create-admin.ts <email> <contraseña> [nombre]');
    process.exit(1);
  }

  const userId    = generateRandomString(32);
  const accountId = generateRandomString(32);
  const hashed    = await hashPassword(password);

  await db.query(
    `INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt", role)
     VALUES ($1, $2, $3, true, now(), now(), 'admin')`,
    [userId, name, email],
  );

  await db.query(
    `INSERT INTO account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
     VALUES ($1, $2, 'credential', $3, $4, now(), now())`,
    [accountId, email, userId, hashed],
  );

  console.log('Admin creado:', email);
  process.exit(0);
}

main();
