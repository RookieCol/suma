-- Better Auth authentication tables

CREATE TABLE IF NOT EXISTS "user" (
  "id"            TEXT PRIMARY KEY,
  "name"          TEXT NOT NULL,
  "email"         TEXT NOT NULL UNIQUE,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "image"         TEXT,
  "createdAt"     TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt"     TIMESTAMP NOT NULL DEFAULT now(),
  "role"          TEXT DEFAULT 'vendedor',
  "banned"        BOOLEAN DEFAULT false,
  "banReason"     TEXT,
  "banExpires"    TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "session" (
  "id"             TEXT PRIMARY KEY,
  "expiresAt"      TIMESTAMP NOT NULL,
  "token"          TEXT NOT NULL UNIQUE,
  "createdAt"      TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt"      TIMESTAMP NOT NULL DEFAULT now(),
  "ipAddress"      TEXT,
  "userAgent"      TEXT,
  "userId"         TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "impersonatedBy" TEXT
);

CREATE TABLE IF NOT EXISTS "account" (
  "id"                    TEXT PRIMARY KEY,
  "accountId"             TEXT NOT NULL,
  "providerId"            TEXT NOT NULL,
  "userId"                TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken"           TEXT,
  "refreshToken"          TEXT,
  "idToken"               TEXT,
  "accessTokenExpiresAt"  TIMESTAMP,
  "refreshTokenExpiresAt" TIMESTAMP,
  "scope"                 TEXT,
  "password"              TEXT,
  "createdAt"             TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt"             TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id"         TEXT PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value"      TEXT NOT NULL,
  "expiresAt"  TIMESTAMP NOT NULL,
  "createdAt"  TIMESTAMP,
  "updatedAt"  TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "session_userId_idx"          ON "session"      ("userId");
CREATE INDEX IF NOT EXISTS "account_userId_idx"          ON "account"      ("userId");
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" ("identifier");
