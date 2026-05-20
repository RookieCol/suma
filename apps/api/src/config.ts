// Load .env for local development — production uses container env vars
import { readFileSync } from 'fs';
import { resolve } from 'path';

if (!process.env.TELEGRAM_BOT_TOKEN) {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
    for (const line of raw.split('\n')) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/);
      if (match) process.env[match[1]] = match[2].trim();
    }
  } catch { /* .env not found — env vars expected from the environment */ }
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Required environment variable missing: ${name}`);
  return value;
}

export const config = {
  telegramBotToken: required('TELEGRAM_BOT_TOKEN'),
  webhookUrl: required('WEBHOOK_URL'),
  webhookSecret: required('WEBHOOK_SECRET'),
  authorizedUserId: process.env.AUTHORIZED_USER_ID ? parseInt(process.env.AUTHORIZED_USER_ID, 10) : null,
  databaseUrl: required('DATABASE_URL'),
  betterAuthSecret: required('BETTER_AUTH_SECRET'),
  appUrl: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  port: parseInt(process.env.PORT ?? '3000', 10),
};
