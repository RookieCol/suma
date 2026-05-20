# Suma

Panel web + bot de Telegram para gestión de cobros, clientes y cartera.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| API | Hono · Node.js · TypeScript |
| Auth | Better Auth (sesiones + roles) |
| Bot | Telegram Webhook |
| Base de datos | PostgreSQL 16 |
| Frontend | React 19 · Vite · Tailwind v4 · shadcn/ui |
| Estado / datos | Zustand · TanStack Query |
| Gráficas | Recharts |
| Monorepo | pnpm workspaces · Turbo |

---

## Estructura

```
.
├── apps/
│   ├── api/          # Backend — Hono + Better Auth + bot Telegram
│   │   └── sql/      # Migraciones (001 → 010)
│   └── web/          # SPA — React 19 + Vite
├── packages/
│   └── types/        # Tipos compartidos entre api y web
├── docker-compose.yml
└── Dockerfile
```

### Páginas del panel

| Ruta | Descripción | Roles |
|------|-------------|-------|
| `/resumen` | KPIs diarios, tendencia, top deudores | Todos |
| `/reportes/cartera` | Aging por antigüedad, concentración de riesgo | Todos |
| `/reportes/cobro` | Actividad por período, métodos de pago, DSO | Todos |
| `/reportes/riesgo` | Clientes en riesgo, vencimientos próximos, castigos | Todos |
| `/cartera` | Saldos, pagos, notas de crédito, castigos | Todos / admin+contabilidad |
| `/clientes` | CRUD de clientes | Todos |
| `/usuarios` | Administración de usuarios y roles | admin |

### Roles de usuario

| Rol | Acceso |
|-----|--------|
| `admin` | Acceso completo, usuarios, ajustes |
| `cobrador` | Resumen, cartera, clientes, reportes |
| `contabilidad` | Todo excepto usuarios; puede crear notas y castigos |

---

## Desarrollo local

### Requisitos

- Node.js 20+
- pnpm 10+
- Docker + Docker Compose

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Variables de entorno

Crea `apps/api/.env` a partir del siguiente template:

```env
DATABASE_URL=postgres://recaudos:password@localhost:5432/recaudos
TELEGRAM_BOT_TOKEN=
WEBHOOK_URL=https://tu-dominio.com
WEBHOOK_SECRET=secreto-largo-aleatorio
AUTHORIZED_USER_ID=123456789
BETTER_AUTH_SECRET=otro-secreto-largo
BETTER_AUTH_URL=http://localhost:3000
PORT=3000
```

### 3. Levantar la base de datos

```bash
docker compose up db -d
```

### 4. Aplicar migraciones

```bash
# Vía Docker (sin psql en el host)
for f in apps/api/sql/*.sql; do
  docker exec -i <nombre-contenedor-db> psql -U recaudos -d recaudos < "$f"
done
```

### 5. Arrancar en modo desarrollo

```bash
# API + Web en paralelo
pnpm dev

# O por separado
pnpm --filter @suma/api dev    # :3000
pnpm --filter @suma/web dev    # :5173
```

El frontend usa proxy de Vite para `/api/*` → `localhost:3000`.

---

## Migraciones

Los archivos SQL están en `apps/api/sql/` y se aplican en orden numérico:

| Archivo | Contenido |
|---------|-----------|
| `001_initial_schema.sql` | Esquema base: clientes, ventas, pagos |
| `002_seed.sql` | Datos de prueba iniciales |
| `003_add_company.sql` | Campo empresa en clientes |
| `004_seed_demo.sql` | Datos de ejemplo |
| `005_seed_demo.sql` | Datos demo adicionales |
| `006_auth_schema.sql` | Tablas de Better Auth |
| `007_customer_fields.sql` | zone, customer_type, payment_terms_days, credit_limit |
| `008_sale_due_date.sql` | due_date en ventas (backfill +30d) |
| `009_credit_notes.sql` | Tabla de notas de crédito |
| `010_write_offs.sql` | Tabla de castigos de cartera |

---

## Despliegue con Docker

```bash
docker compose up -d --build
```

Variables requeridas en el entorno o en un archivo `.env` en la raíz:

```env
DB_PASSWORD=
TELEGRAM_BOT_TOKEN=
WEBHOOK_URL=
WEBHOOK_SECRET=
AUTHORIZED_USER_ID=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
```

Servicios expuestos:

| Servicio | Puerto | Descripción |
|---------|--------|-------------|
| `bot` | 3000 | API + webhook Telegram |
| `db` | 5432 | PostgreSQL 16 |
| `adminer` | 8080 | Cliente web de BD |
