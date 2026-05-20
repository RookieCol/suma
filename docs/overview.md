# Suma — Resumen ejecutivo

## Componentes

| Capa | Tecnología | Responsabilidad |
|------|-----------|-----------------|
| **Web** | React 19 + Vite + shadcn/ui | Panel de gestión |
| **API** | Hono + Better Auth + PostgreSQL | Datos y autenticación |
| **Bot** | Telegram Webhook | Cobros en campo |
| **Tipos** | `@suma/types` (shared) | Contratos entre capas |

## Módulos del panel web

- **Resumen** — KPIs diarios: cartera total, cobrado hoy, DSO, tasa de recaudo.
- **Cartera** — Listado de deudas activas; registrar cobro, venta, nota crédito o castigo.
- **Clientes** — CRUD de clientes con historial de pagos y perfil detallado.
- **Reportes** — Tres vistas: aging por antigüedad, actividad/métodos de pago, clientes en riesgo.
- **Usuarios** *(admin)* — Crear, editar rol y eliminar cuentas de empleados.
- **Mi perfil** — Cambiar contraseña y vincular ID de Telegram.

## Flujos de empleado

### Cobro desde el panel
`Cartera → fila del cliente → Registrar cobro → monto + método → confirmar`

### Cobro desde Telegram
`/cobrar → buscar cliente → monto → método → confirmar`
El bot autentica al vendedor por su `telegramId` registrado en el perfil.

### Alta de cliente nuevo
`Clientes → Nuevo → nombre / empresa / teléfono / dirección → guardar`

### Acceso de nuevo vendedor *(admin)*
1. Admin crea usuario en **Usuarios**.
2. Vendedor inicia sesión, va a **Mi perfil** y guarda su ID de Telegram (`@userinfobot`).
3. El bot lo reconoce en el siguiente mensaje.
