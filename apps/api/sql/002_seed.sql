-- Seed data for development/testing
-- Realistic Colombian fabric vendor scenario

-- Customers
INSERT INTO customers (id, name, company, phone, address, neighborhood) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Rosa María López',       'Confecciones Rosi',      '310-555-1234', 'Cra 5 # 12-34',    'San José'),
  ('a1000000-0000-0000-0000-000000000002', 'Carmen Inés Martínez',   'Modas Carmen',           '311-555-5678', 'Cl 8 # 3-15',      'El Prado'),
  ('a1000000-0000-0000-0000-000000000003', 'Luis Hernando Pérez',    NULL,                     '312-555-9012', 'Cra 10 # 20-05',   'Centro'),
  ('a1000000-0000-0000-0000-000000000004', 'Marleny Ríos Cardona',   'Taller Marleny',         '313-555-3456', 'Cl 15 # 8-22',     'La Esperanza'),
  ('a1000000-0000-0000-0000-000000000005', 'Jorge Iván Gómez',       NULL,                     NULL,           'Cra 3 # 5-10',     'Villa Nueva'),
  ('a1000000-0000-0000-0000-000000000006', 'Patricia Salazar',       'Diseños Pati',           '314-555-7890', 'Cl 22 # 11-40',    'San José'),
  ('a1000000-0000-0000-0000-000000000007', 'Doña Amparo Restrepo',   NULL,                     '315-555-2345', 'Cra 7 # 18-30',    'El Prado'),
  ('a1000000-0000-0000-0000-000000000008', 'Yaneth Correa Muñoz',    'Uniformes YC',           '316-555-6789', 'Cl 30 # 6-12',     'Los Álamos'),
  ('a1000000-0000-0000-0000-000000000009', 'Blanca Nieves Torres',   NULL,                     NULL,           'Cra 12 # 25-08',   'Centro'),
  ('a1000000-0000-0000-0000-000000000010', 'Esperanza Díaz Vargas',  'Costura Esperanza',      '317-555-1011', 'Cl 5 # 2-50',      'La Esperanza');

-- Sales (credit, these create the debt)
INSERT INTO sales (customer_id, sale_date, description, total_amount) VALUES
  -- Rosa: two sales
  ('a1000000-0000-0000-0000-000000000001', CURRENT_DATE - 45, 'Tela lino blanco 8m',         120000),
  ('a1000000-0000-0000-0000-000000000001', CURRENT_DATE - 20, 'Encaje dorado 3m',             80000),

  -- Carmen: one big sale
  ('a1000000-0000-0000-0000-000000000002', CURRENT_DATE - 30, 'Tela de algodón estampada 12m',200000),

  -- Luis: three sales
  ('a1000000-0000-0000-0000-000000000003', CURRENT_DATE - 60, 'Tela denim azul 5m',           90000),
  ('a1000000-0000-0000-0000-000000000003', CURRENT_DATE - 40, 'Forro negro 6m',               54000),
  ('a1000000-0000-0000-0000-000000000003', CURRENT_DATE - 10, 'Cinta elástica 20m',           30000),

  -- Marleny: one sale, fully paid (to test $0 balance)
  ('a1000000-0000-0000-0000-000000000004', CURRENT_DATE - 25, 'Tela satín rosado 4m',         60000),

  -- Jorge: one sale
  ('a1000000-0000-0000-0000-000000000005', CURRENT_DATE - 15, 'Lino gris 7m',                 98000),

  -- Patricia: two sales
  ('a1000000-0000-0000-0000-000000000006', CURRENT_DATE - 50, 'Tela camuflado 5m',            75000),
  ('a1000000-0000-0000-0000-000000000006', CURRENT_DATE - 8,  'Botones variados x100',        25000),

  -- Doña Amparo: one large sale
  ('a1000000-0000-0000-0000-000000000007', CURRENT_DATE - 35, 'Tela paño lana 10m',          250000),

  -- Yaneth: one sale
  ('a1000000-0000-0000-0000-000000000008', CURRENT_DATE - 12, 'Tela polar estampada 6m',      84000),

  -- Blanca: one sale
  ('a1000000-0000-0000-0000-000000000009', CURRENT_DATE - 22, 'Encaje blanco 5m',             45000),

  -- Esperanza: one sale, partially paid
  ('a1000000-0000-0000-0000-000000000010', CURRENT_DATE - 18, 'Tela viscosa floreada 8m',    110000);

-- Payments (reduce debt)
INSERT INTO payments (customer_id, payment_date, amount, payment_method) VALUES
  -- Rosa: partial payment
  ('a1000000-0000-0000-0000-000000000001', CURRENT_DATE - 10, 50000, 'Nequi'),

  -- Carmen: partial payment
  ('a1000000-0000-0000-0000-000000000002', CURRENT_DATE - 15, 80000, 'Efectivo'),
  ('a1000000-0000-0000-0000-000000000002', CURRENT_DATE - 5,  40000, 'Daviplata'),

  -- Luis: small payment
  ('a1000000-0000-0000-0000-000000000003', CURRENT_DATE - 20, 50000, 'Efectivo'),

  -- Marleny: paid in full
  ('a1000000-0000-0000-0000-000000000004', CURRENT_DATE - 10, 60000, 'Transferencia'),

  -- Patricia: one payment
  ('a1000000-0000-0000-0000-000000000006', CURRENT_DATE - 3,  30000, 'Efectivo'),

  -- Doña Amparo: two payments
  ('a1000000-0000-0000-0000-000000000007', CURRENT_DATE - 20, 100000, 'Efectivo'),
  ('a1000000-0000-0000-0000-000000000007', CURRENT_DATE - 7,   50000, 'Nequi'),

  -- Esperanza: partial payment
  ('a1000000-0000-0000-0000-000000000010', CURRENT_DATE - 5,  50000, 'Efectivo'),

  -- Today's payments (for /reporte to show something)
  ('a1000000-0000-0000-0000-000000000001', CURRENT_DATE, 30000, 'Nequi'),
  ('a1000000-0000-0000-0000-000000000003', CURRENT_DATE, 24000, 'Efectivo'),
  ('a1000000-0000-0000-0000-000000000008', CURRENT_DATE, 40000, 'Daviplata'),
  ('a1000000-0000-0000-0000-000000000009', CURRENT_DATE, 20000, 'Efectivo');
