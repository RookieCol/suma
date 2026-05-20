import { Hono } from 'hono';
import { config } from './config';
import { db } from './db/connection';
import { processUpdate } from './bot/dispatcher';
import { registerWebhook } from './bot/telegram';
import { createApiRouter } from './api/router';
import { auth } from './auth/auth';

const app = new Hono();

// Better Auth handles all /api/auth/* routes
app.all('/api/auth/*', (c) => auth.handler(c.req.raw));

app.route('/', createApiRouter(db));

app.get('/health', (c) => c.json({ status: 'ok' }));

app.post('/webhook', async (c) => {
  const secret = c.req.header('X-Telegram-Bot-Api-Secret-Token');
  if (secret !== config.webhookSecret) {
    return c.text('Forbidden', 403);
  }

  let update: unknown;
  try {
    update = await c.req.json();
  } catch {
    return c.text('Bad Request', 400);
  }

  // Process in background — Telegram requires a fast 200 response
  processUpdate(db, update as Parameters<typeof processUpdate>[1]).catch((err) => {
    console.error('Error processing update:', err);
  });

  return c.text('OK');
});

async function bootstrap() {
  try {
    await db.query('SELECT 1');
    console.log('PostgreSQL connection established');
  } catch (err) {
    console.error('Could not connect to PostgreSQL:', err);
    process.exit(1);
  }

  try {
    await registerWebhook();
  } catch (err) {
    console.error('Failed to register webhook:', err);
  }

  const { serve } = await import('@hono/node-server');
  serve({ fetch: app.fetch, port: config.port }, () => {
    console.log(`Bot running on port ${config.port}`);
  });
}

bootstrap();
