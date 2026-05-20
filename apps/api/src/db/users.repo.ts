import { Pool } from 'pg';

export interface BotUser {
  id: string;
  name: string;
  role: string | null;
}

export async function findByTelegramId(db: Pool, telegramId: number): Promise<BotUser | null> {
  const { rows } = await db.query<BotUser>(
    `SELECT id, name, role FROM "user" WHERE "telegramId" = $1 AND (banned IS NOT TRUE)`,
    [String(telegramId)]
  );
  return rows[0] ?? null;
}
