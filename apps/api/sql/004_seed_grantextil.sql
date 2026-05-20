-- Seed: mercado La Alquería y Restrepo (Bogotá)
-- 12 clientes, cartera activa ~$40.000.000 COP distribuida en 30 días
-- Ejecutar manualmente: docker exec -i bot-grantextil-db-1 psql -U recaudos -d recaudos < sql/004_seed_grantextil.sql

-- Limpia datos existentes (orden por FK: pagos → ventas → clientes)
TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE sales    CASCADE;
TRUNCATE TABLE customers CASCADE;

-- ─── CLIENTES ────────────────────────────────────────────────────────────────
-- 6 de La Alquería, 6 de Restrepo

INSERT INTO customers (id, name, company, phone, address, neighborhood) VALUES
  ('b2000000-0000-0000-0000-000000000001', 'Gloria Amparo Niño',      'Confecciones Niño',     '310-821-4567', 'Cra 47 # 38-12',     'La Alquería'),
  ('b2000000-0000-0000-0000-000000000002', 'Yaneth Bernal Parra',     'Modas Bernal',          '311-432-8901', 'Cl 38B # 45-30',     'La Alquería'),
  ('b2000000-0000-0000-0000-000000000003', 'Cecilia Vargas de Ríos',  NULL,                    '312-765-2345', 'Cra 51 # 40-08',     'La Alquería'),
  ('b2000000-0000-0000-0000-000000000004', 'Héctor Mauricio Suárez',  'Uniformes Suárez',      '313-198-6789', 'Cl 39 # 50-22',      'La Alquería'),
  ('b2000000-0000-0000-0000-000000000005', 'Luz Marina Castro',       'Uniformes Castro',      '314-543-0123', 'Cra 48 # 37-15',     'La Alquería'),
  ('b2000000-0000-0000-0000-000000000006', 'Sandra Milena Ramos',     'Diseños Ramos',         '315-876-4567', 'Cl 40 # 46-05',      'La Alquería'),
  ('b2000000-0000-0000-0000-000000000007', 'Marta Inés Pedraza',      'Confecciones Pedraza',  '316-209-8901', 'Cl 15 Sur # 20-40',  'Restrepo'),
  ('b2000000-0000-0000-0000-000000000008', 'Rodrigo Alejandro Mora',  'Telas & Cortes Mora',   '317-542-2345', 'Cra 18 # 16S-12',    'Restrepo'),
  ('b2000000-0000-0000-0000-000000000009', 'Claudia Patricia Torres', 'Modas Torres',          '318-875-6789', 'Cl 17 Sur # 22-08',  'Restrepo'),
  ('b2000000-0000-0000-0000-000000000010', 'Edwin Josué Fonseca',     NULL,                    '319-108-0123', 'Cra 19 # 15S-30',    'Restrepo'),
  ('b2000000-0000-0000-0000-000000000011', 'Nubia Esperanza Herrera', 'Herrera Tejidos',       '320-441-4567', 'Cl 14 Sur # 18-55',  'Restrepo'),
  ('b2000000-0000-0000-0000-000000000012', 'Dolores Amparo Pinilla',  'Taller Pinilla',        '321-774-8901', 'Cra 20 # 14S-20',    'Restrepo');

-- ─── VENTAS (crédito fiado) ───────────────────────────────────────────────────
-- Total ventas brutas: $43.500.000
-- Total cobros:         $3.500.000
-- Cartera pendiente:   $40.000.000 ✓

INSERT INTO sales (customer_id, sale_date, description, total_amount) VALUES

  -- Gloria Amparo Niño | ventas: $6.800.000 | cobros: $300.000 | pendiente: $6.500.000
  ('b2000000-0000-0000-0000-000000000001', CURRENT_DATE - 28, 'Jersey estampado 180 m',                2160000),
  ('b2000000-0000-0000-0000-000000000001', CURRENT_DATE - 20, 'Dril caqui 200 m',                      2300000),
  ('b2000000-0000-0000-0000-000000000001', CURRENT_DATE - 12, 'Lino bordado 100 m',                    1400000),
  ('b2000000-0000-0000-0000-000000000001', CURRENT_DATE -  4, 'Encajes y cintas surtido',               940000),

  -- Yaneth Bernal Parra | ventas: $4.500.000 | cobros: $500.000 | pendiente: $4.000.000
  ('b2000000-0000-0000-0000-000000000002', CURRENT_DATE - 25, 'Algodón pima blanco 150 m',             2025000),
  ('b2000000-0000-0000-0000-000000000002', CURRENT_DATE - 14, 'Polyester floreado 120 m',              1260000),
  ('b2000000-0000-0000-0000-000000000002', CURRENT_DATE -  6, 'Hebillas y cierres surtidos',           1215000),

  -- Cecilia Vargas de Ríos | ventas: $2.000.000 | cobros: $0 | pendiente: $2.000.000
  ('b2000000-0000-0000-0000-000000000003', CURRENT_DATE - 22, 'Satín duchesse 80 m',                   1280000),
  ('b2000000-0000-0000-0000-000000000003', CURRENT_DATE -  9, 'Tul bordado 60 m',                       720000),

  -- Héctor Mauricio Suárez | ventas: $5.800.000 | cobros: $800.000 | pendiente: $5.000.000
  ('b2000000-0000-0000-0000-000000000004', CURRENT_DATE - 29, 'Dril para uniformes 250 m',             2625000),
  ('b2000000-0000-0000-0000-000000000004', CURRENT_DATE - 18, 'Tela antifluido 150 m',                 1650000),
  ('b2000000-0000-0000-0000-000000000004', CURRENT_DATE -  7, 'Cierres, botones y velcro para uniformes', 1525000),

  -- Luz Marina Castro | ventas: $3.700.000 | cobros: $500.000 | pendiente: $3.200.000
  ('b2000000-0000-0000-0000-000000000005', CURRENT_DATE - 24, 'Poly-algodón 120 m',                    1140000),
  ('b2000000-0000-0000-0000-000000000005', CURRENT_DATE - 16, 'Jersey deportivo 130 m',                1365000),
  ('b2000000-0000-0000-0000-000000000005', CURRENT_DATE -  5, 'Ribetes, elásticos y cremalleras',      1195000),

  -- Sandra Milena Ramos | ventas: $3.000.000 | cobros: $200.000 | pendiente: $2.800.000
  ('b2000000-0000-0000-0000-000000000006', CURRENT_DATE - 27, 'Viscosa floreada 100 m',                1300000),
  ('b2000000-0000-0000-0000-000000000006', CURRENT_DATE - 15, 'Chalís estampado 100 m',                1150000),
  ('b2000000-0000-0000-0000-000000000006', CURRENT_DATE -  8, 'Forros y entretelas surtidos',           550000),

  -- Marta Inés Pedraza | ventas: $5.900.000 | cobros: $400.000 | pendiente: $5.500.000
  ('b2000000-0000-0000-0000-000000000007', CURRENT_DATE - 30, 'Denim azul 200 m',                      2900000),
  ('b2000000-0000-0000-0000-000000000007', CURRENT_DATE - 17, 'Jean negro 150 m',                      2100000),
  ('b2000000-0000-0000-0000-000000000007', CURRENT_DATE -  6, 'Parches, tachas y ribetes denim',        900000),

  -- Rodrigo Alejandro Mora | ventas: $4.000.000 | cobros: $500.000 | pendiente: $3.500.000
  ('b2000000-0000-0000-0000-000000000008', CURRENT_DATE - 26, 'Tela de paño 100 m',                    2200000),
  ('b2000000-0000-0000-0000-000000000008', CURRENT_DATE - 13, 'Casimir clásico 70 m',                  1470000),
  ('b2000000-0000-0000-0000-000000000008', CURRENT_DATE -  4, 'Entretela doble faz',                    330000),

  -- Claudia Patricia Torres | ventas: $2.500.000 | cobros: $0 | pendiente: $2.500.000
  ('b2000000-0000-0000-0000-000000000009', CURRENT_DATE - 23, 'Encaje francés 70 m',                   1260000),
  ('b2000000-0000-0000-0000-000000000009', CURRENT_DATE - 10, 'Tul bordado fino 80 m',                 1240000),

  -- Edwin Josué Fonseca | ventas: $1.300.000 | cobros: $100.000 | pendiente: $1.200.000
  ('b2000000-0000-0000-0000-000000000010', CURRENT_DATE - 19, 'Tela polar 80 m',                        680000),
  ('b2000000-0000-0000-0000-000000000010', CURRENT_DATE -  8, 'Velour estampado 50 m',                  500000),
  ('b2000000-0000-0000-0000-000000000010', CURRENT_DATE -  3, 'Ojetes, corchetes y cierres',            120000),

  -- Nubia Esperanza Herrera | ventas: $2.500.000 | cobros: $200.000 | pendiente: $2.300.000
  ('b2000000-0000-0000-0000-000000000011', CURRENT_DATE - 21, 'Lino crudo 100 m',                      1150000),
  ('b2000000-0000-0000-0000-000000000011', CURRENT_DATE - 11, 'Rafia tejida 80 m',                      800000),
  ('b2000000-0000-0000-0000-000000000011', CURRENT_DATE -  2, 'Hilos industriales surtidos',            550000),

  -- Dolores Amparo Pinilla | ventas: $1.500.000 | cobros: $0 | pendiente: $1.500.000
  ('b2000000-0000-0000-0000-000000000012', CURRENT_DATE - 20, 'Algodón básico 100 m',                   750000),
  ('b2000000-0000-0000-0000-000000000012', CURRENT_DATE -  9, 'Tela lycra 60 m',                        750000);

-- ─── COBROS ──────────────────────────────────────────────────────────────────
-- Total cobros: $3.500.000

INSERT INTO payments (customer_id, payment_date, amount, payment_method, notes) VALUES

  -- Gloria Amparo Niño
  ('b2000000-0000-0000-0000-000000000001', CURRENT_DATE - 22,  300000, 'Efectivo',     NULL),

  -- Yaneth Bernal Parra
  ('b2000000-0000-0000-0000-000000000002', CURRENT_DATE - 10,  500000, 'Nequi',        NULL),

  -- Héctor Mauricio Suárez (4 cuotas)
  ('b2000000-0000-0000-0000-000000000004', CURRENT_DATE - 25,  200000, 'Efectivo',     NULL),
  ('b2000000-0000-0000-0000-000000000004', CURRENT_DATE - 20,  300000, 'Efectivo',     NULL),
  ('b2000000-0000-0000-0000-000000000004', CURRENT_DATE - 14,  200000, 'Nequi',        NULL),
  ('b2000000-0000-0000-0000-000000000004', CURRENT_DATE,       100000, 'Efectivo',     'Cuota del día'),

  -- Luz Marina Castro (2 cuotas)
  ('b2000000-0000-0000-0000-000000000005', CURRENT_DATE - 18,  200000, 'Efectivo',     NULL),
  ('b2000000-0000-0000-0000-000000000005', CURRENT_DATE - 12,  300000, 'Transferencia',NULL),

  -- Sandra Milena Ramos
  ('b2000000-0000-0000-0000-000000000006', CURRENT_DATE - 18,  200000, 'Efectivo',     NULL),

  -- Marta Inés Pedraza
  ('b2000000-0000-0000-0000-000000000007', CURRENT_DATE - 22,  400000, 'Efectivo',     NULL),

  -- Rodrigo Alejandro Mora
  ('b2000000-0000-0000-0000-000000000008', CURRENT_DATE - 15,  500000, 'Daviplata',    NULL),

  -- Edwin Josué Fonseca
  ('b2000000-0000-0000-0000-000000000010', CURRENT_DATE,       100000, 'Efectivo',     'Cuota del día'),

  -- Nubia Esperanza Herrera (2 cuotas)
  ('b2000000-0000-0000-0000-000000000011', CURRENT_DATE - 16,  100000, 'Transferencia',NULL),
  ('b2000000-0000-0000-0000-000000000011', CURRENT_DATE,       100000, 'Nequi',        'Cuota del día');

-- ─── VERIFICACIÓN ─────────────────────────────────────────────────────────────
SELECT
  neighborhood,
  COUNT(*)                        AS clientes,
  SUM(pending_balance)::BIGINT    AS cartera_pendiente
FROM customer_balances
GROUP BY neighborhood
ORDER BY neighborhood;

SELECT
  SUM(pending_balance)::BIGINT AS total_cartera
FROM customer_balances;
