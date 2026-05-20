import { db } from '../src/db/connection';
import { hashPassword } from 'better-auth/crypto';

async function main() {
  const [,, email, password] = process.argv;
  if (!email || !password) {
    console.error('Uso: pnpm tsx scripts/reset-password.ts <email> <nueva-contraseña>');
    process.exit(1);
  }
  const hashed = await hashPassword(password);
  const { rowCount } = await db.query(
    `UPDATE account SET password=$1 WHERE "userId"=(SELECT id FROM "user" WHERE email=$2)`,
    [hashed, email],
  );
  if (rowCount === 0) {
    console.error('Usuario no encontrado:', email);
    process.exit(1);
  }
  console.log('Contraseña actualizada para:', email);
  process.exit(0);
}

main();
