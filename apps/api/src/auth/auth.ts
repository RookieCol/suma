import { betterAuth } from 'better-auth';
import { admin } from 'better-auth/plugins/admin';
import { bearer } from 'better-auth/plugins/bearer';
import { db } from '../db/connection';
import { config } from '../config';

export const auth = betterAuth({
  database: db,
  baseURL: config.appUrl,
  secret: config.betterAuthSecret,
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  trustedOrigins: [
    config.appUrl,
    ...( process.env.EXTRA_TRUSTED_ORIGINS ? process.env.EXTRA_TRUSTED_ORIGINS.split(',') : [] ),
  ],
  plugins: [
    admin({ defaultRole: 'vendedor' }),
    bearer(),
  ],
});
