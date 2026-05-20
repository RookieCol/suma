-- =============================================================================
-- DEMO: Distribuidor de telas — La Alquería, Restrepo, Quiroga, Ricaurte
-- 30 clientes | Cartera activa: $200.000.000 COP | Historial: ~100 días
-- Aging FIFO: 90+: ~$25M | 61-90: ~$30M | 31-60: ~$65M | 0-30: ~$80M
-- =============================================================================

TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE sales    CASCADE;
TRUNCATE TABLE customers CASCADE;

-- ─── CLIENTES ─────────────────────────────────────────────────────────────────

INSERT INTO customers (id, name, company, phone, address, neighborhood) VALUES
  -- La Alquería (12)
  ('b3000000-0000-0000-0000-000000000001','Gloria Amparo Niño',         'Confecciones Niño',       '310-821-4567','Cra 47 # 38-12',     'La Alquería'),
  ('b3000000-0000-0000-0000-000000000002','Yaneth Bernal Parra',        'Modas Bernal',            '311-432-8901','Cl 38B # 45-30',     'La Alquería'),
  ('b3000000-0000-0000-0000-000000000003','Cecilia Vargas de Ríos',     NULL,                      '312-765-2345','Cra 51 # 40-08',     'La Alquería'),
  ('b3000000-0000-0000-0000-000000000004','Héctor Mauricio Suárez',     'Uniformes Suárez',        '313-198-6789','Cl 39 # 50-22',      'La Alquería'),
  ('b3000000-0000-0000-0000-000000000005','Luz Marina Castro',          'Uniformes Castro',        '314-543-0123','Cra 48 # 37-15',     'La Alquería'),
  ('b3000000-0000-0000-0000-000000000006','Sandra Milena Ramos',        'Diseños Ramos',           '315-876-4567','Cl 40 # 46-05',      'La Alquería'),
  ('b3000000-0000-0000-0000-000000000007','Fabiola Moreno de Gutiérrez','Fabiola Modas',           '316-234-1020','Cra 49 # 39-18',     'La Alquería'),
  ('b3000000-0000-0000-0000-000000000008','Blanca Inés Acosta',         'Confecciones Acosta',     '317-567-3456','Cl 37 # 48-22',      'La Alquería'),
  ('b3000000-0000-0000-0000-000000000009','Nelson Ríos Torres',         'Ríos Distribuciones',     '318-890-6789','Cra 50 # 36-10',     'La Alquería'),
  ('b3000000-0000-0000-0000-000000000010','Amparo del Carmen Jiménez',  NULL,                      '319-123-9012','Cl 38 # 52-05',      'La Alquería'),
  ('b3000000-0000-0000-0000-000000000011','Jorge Enrique Patiño',       'Patiño Sport',            '320-456-2345','Cra 46 # 40-30',     'La Alquería'),
  ('b3000000-0000-0000-0000-000000000012','Rosalba Quintero Leal',      'Moda Rosalba',            '321-789-5678','Cl 41 # 47-14',      'La Alquería'),
  -- Restrepo (10)
  ('b3000000-0000-0000-0000-000000000013','Marta Inés Pedraza',         'Confecciones Pedraza',    '310-209-8901','Cl 15 Sur # 20-40',  'Restrepo'),
  ('b3000000-0000-0000-0000-000000000014','Rodrigo Alejandro Mora',     'Telas & Cortes Mora',     '311-542-2345','Cra 18 # 16S-12',    'Restrepo'),
  ('b3000000-0000-0000-0000-000000000015','Claudia Patricia Torres',    'Modas Torres',            '312-875-6789','Cl 17 Sur # 22-08',  'Restrepo'),
  ('b3000000-0000-0000-0000-000000000016','Edwin Josué Fonseca',        NULL,                      '313-108-0123','Cra 19 # 15S-30',    'Restrepo'),
  ('b3000000-0000-0000-0000-000000000017','Nubia Esperanza Herrera',    'Herrera Tejidos',         '314-441-4567','Cl 14 Sur # 18-55',  'Restrepo'),
  ('b3000000-0000-0000-0000-000000000018','Dolores Amparo Pinilla',     'Taller Pinilla',          '315-774-8901','Cra 20 # 14S-20',    'Restrepo'),
  ('b3000000-0000-0000-0000-000000000019','Carlos Alberto Rojas',       'Rojas Confecciones',      '316-107-2345','Cl 16 Sur # 19-08',  'Restrepo'),
  ('b3000000-0000-0000-0000-000000000020','Martha Cecilia Ávila',       'Ávila Sport',             '317-440-6789','Cra 17 # 17S-42',    'Restrepo'),
  ('b3000000-0000-0000-0000-000000000021','Germán Augusto Barrera',     'Barrera Uniformes',       '318-773-0123','Cl 13 Sur # 21-15',  'Restrepo'),
  ('b3000000-0000-0000-0000-000000000022','Lilia Rosa Bejarano',        NULL,                      '319-106-4567','Cra 21 # 13S-28',    'Restrepo'),
  -- Quiroga (5)
  ('b3000000-0000-0000-0000-000000000023','Esperanza Díaz de Morales',  NULL,                      '310-439-8901','Cl 39 Sur # 24-12',  'Quiroga'),
  ('b3000000-0000-0000-0000-000000000024','Hilda Patricia Camacho',     'Camacho Modas',           '311-772-2345','Cra 26 # 41S-08',    'Quiroga'),
  ('b3000000-0000-0000-0000-000000000025','José Manuel Garzón',         'Garzón Textiles',         '312-005-6789','Cl 40 Sur # 23-30',  'Quiroga'),
  ('b3000000-0000-0000-0000-000000000026','Consuelo Herrera Ríos',      NULL,                      '313-338-0123','Cra 25 # 42S-16',    'Quiroga'),
  ('b3000000-0000-0000-0000-000000000027','Margoth Castellanos',        NULL,                      '314-671-4567','Cl 41 Sur # 22-44',  'Quiroga'),
  -- Ricaurte (3)
  ('b3000000-0000-0000-0000-000000000028','Leonor Romero de Vargas',    'Romero Telas',            '315-004-8901','Cl 13 # 22-40',      'Ricaurte'),
  ('b3000000-0000-0000-0000-000000000029','Alirio Guerrero',            'Guerrero Sport',          '316-337-2345','Cra 23 # 12-18',     'Ricaurte'),
  ('b3000000-0000-0000-0000-000000000030','Patricia del Socorro Nieto', 'Nieto Confecciones',      '317-670-6789','Cl 14 # 21-06',      'Ricaurte');

-- ─── VENTAS ───────────────────────────────────────────────────────────────────
-- Total bruto: $232.000.000

INSERT INTO sales (customer_id, sale_date, description, total_amount) VALUES

  -- C01 Gloria Niño | ventas $18M | cobros $2M | pendiente $16M
  ('b3000000-0000-0000-0000-000000000001', CURRENT_DATE - 92, 'Lote denim azul 250 m',                4500000),
  ('b3000000-0000-0000-0000-000000000001', CURRENT_DATE - 55, 'Jersey estampado 300 m',               3600000),
  ('b3000000-0000-0000-0000-000000000001', CURRENT_DATE - 35, 'Dril caqui 350 m',                     4000000),
  ('b3000000-0000-0000-0000-000000000001', CURRENT_DATE - 14, 'Lino bordado 200 m',                   3400000),
  ('b3000000-0000-0000-0000-000000000001', CURRENT_DATE -  4, 'Encajes y cintas surtido',             2500000),

  -- C02 Yaneth Bernal | $9.5M | $1.5M | $8M
  ('b3000000-0000-0000-0000-000000000002', CURRENT_DATE - 70, 'Algodón pima blanco 185 m',            2500000),
  ('b3000000-0000-0000-0000-000000000002', CURRENT_DATE - 40, 'Polyester floreado 285 m',             3000000),
  ('b3000000-0000-0000-0000-000000000002', CURRENT_DATE - 15, 'Chalís estampado 215 m',               2500000),
  ('b3000000-0000-0000-0000-000000000002', CURRENT_DATE -  3, 'Hebillas, cierres y botones surtido',  1500000),

  -- C03 Cecilia Vargas | $3.5M | $0.5M | $3M
  ('b3000000-0000-0000-0000-000000000003', CURRENT_DATE - 40, 'Satín duchesse 112 m',                 1800000),
  ('b3000000-0000-0000-0000-000000000003', CURRENT_DATE - 12, 'Tul bordado y organza 140 m',          1700000),

  -- C04 Héctor Suárez | $16M | $2M | $14M
  ('b3000000-0000-0000-0000-000000000004', CURRENT_DATE - 95, 'Dril para uniformes lote A — 475 m',   5000000),
  ('b3000000-0000-0000-0000-000000000004', CURRENT_DATE - 65, 'Tela antifluido 318 m',                3500000),
  ('b3000000-0000-0000-0000-000000000004', CURRENT_DATE - 38, 'Dril para uniformes lote B — 333 m',   3500000),
  ('b3000000-0000-0000-0000-000000000004', CURRENT_DATE - 18, 'Tela piqué polo 227 m',                2500000),
  ('b3000000-0000-0000-0000-000000000004', CURRENT_DATE -  5, 'Cierres, botones y velcro surtido',    1500000),

  -- C05 Luz Marina | $4M | $0.5M | $3.5M
  ('b3000000-0000-0000-0000-000000000005', CURRENT_DATE - 45, 'Poly-algodón 157 m',                   1500000),
  ('b3000000-0000-0000-0000-000000000005', CURRENT_DATE - 22, 'Jersey deportivo 142 m',               1500000),
  ('b3000000-0000-0000-0000-000000000005', CURRENT_DATE -  6, 'Cremalleras y ribetes surtido',        1000000),

  -- C06 Sandra Ramos | $3M | $0.5M | $2.5M
  ('b3000000-0000-0000-0000-000000000006', CURRENT_DATE - 35, 'Viscosa floreada 115 m',               1500000),
  ('b3000000-0000-0000-0000-000000000006', CURRENT_DATE - 10, 'Chalís estampado 130 m',               1500000),

  -- C07 Fabiola Moreno | $8M | $1M | $7M
  ('b3000000-0000-0000-0000-000000000007', CURRENT_DATE - 95, 'Lote telas temporada alta — surtido',  2000000),
  ('b3000000-0000-0000-0000-000000000007', CURRENT_DATE - 48, 'Satín y viscosa 192 m',                2500000),
  ('b3000000-0000-0000-0000-000000000007', CURRENT_DATE - 22, 'Jersey estampado 181 m',               2000000),
  ('b3000000-0000-0000-0000-000000000007', CURRENT_DATE -  5, 'Encajes finos y apliques surtido',     1500000),

  -- C08 Blanca Acosta | $7M | $1M | $6M
  ('b3000000-0000-0000-0000-000000000008', CURRENT_DATE - 60, 'Dril y drill mezclilla 190 m',         2000000),
  ('b3000000-0000-0000-0000-000000000008', CURRENT_DATE - 35, 'Jersey deportivo 238 m',               2500000),
  ('b3000000-0000-0000-0000-000000000008', CURRENT_DATE - 12, 'Lycra y tela de baño 200 m',           2500000),

  -- C09 Nelson Ríos | $11.5M | $1.5M | $10M
  ('b3000000-0000-0000-0000-000000000009', CURRENT_DATE - 92, 'Lote telas finas — primera calidad',   3000000),
  ('b3000000-0000-0000-0000-000000000009', CURRENT_DATE - 55, 'Denim y paño 250 m',                   3000000),
  ('b3000000-0000-0000-0000-000000000009', CURRENT_DATE - 32, 'Algodón y lino 270 m',                 3000000),
  ('b3000000-0000-0000-0000-000000000009', CURRENT_DATE -  8, 'Tela para camisería 277 m',            2500000),

  -- C10 Amparo Jiménez | $7.5M | $1M | $6.5M
  ('b3000000-0000-0000-0000-000000000010', CURRENT_DATE - 95, 'Lote inicial — telas surtidas',        2000000),
  ('b3000000-0000-0000-0000-000000000010', CURRENT_DATE - 40, 'Satín y organza 190 m',                2500000),
  ('b3000000-0000-0000-0000-000000000010', CURRENT_DATE - 18, 'Chalís floreado 177 m',                2000000),
  ('b3000000-0000-0000-0000-000000000010', CURRENT_DATE -  4, 'Adornos, apliques y botones',          1000000),

  -- C11 Jorge Patiño | $8M | $1M | $7M
  ('b3000000-0000-0000-0000-000000000011', CURRENT_DATE - 95, 'Dry fit deportivo 277 m',              2500000),
  ('b3000000-0000-0000-0000-000000000011', CURRENT_DATE - 45, 'Lycra deportiva 238 m',                2500000),
  ('b3000000-0000-0000-0000-000000000011', CURRENT_DATE - 20, 'Polyester sublimación 190 m',          2000000),
  ('b3000000-0000-0000-0000-000000000011', CURRENT_DATE -  5, 'Hilos y cremalleras sport surtido',    1000000),

  -- C12 Rosalba Quintero | $2.5M | $0.5M | $2M
  ('b3000000-0000-0000-0000-000000000012', CURRENT_DATE - 38, 'Tela para blusas y camisas 96 m',      1200000),
  ('b3000000-0000-0000-0000-000000000012', CURRENT_DATE - 15, 'Encaje y organza 108 m',               1300000),

  -- C13 Marta Pedraza | $21M | $3M | $18M
  ('b3000000-0000-0000-0000-000000000013', CURRENT_DATE - 95, 'Denim y jean negro 413 m',             6000000),
  ('b3000000-0000-0000-0000-000000000013', CURRENT_DATE - 65, 'Telas de temporada — surtido',         5500000),
  ('b3000000-0000-0000-0000-000000000013', CURRENT_DATE - 38, 'Telas variadas lote B',                4500000),
  ('b3000000-0000-0000-0000-000000000013', CURRENT_DATE - 15, 'Encajes finos y satín 277 m',          3500000),
  ('b3000000-0000-0000-0000-000000000013', CURRENT_DATE -  3, 'Accesorios y botones surtido',         1500000),

  -- C14 Rodrigo Mora | $9.5M | $1.5M | $8M
  ('b3000000-0000-0000-0000-000000000014', CURRENT_DATE - 95, 'Tela de paño y casimir 136 m',         3000000),
  ('b3000000-0000-0000-0000-000000000014', CURRENT_DATE - 42, 'Tweed y gabardina 190 m',              3000000),
  ('b3000000-0000-0000-0000-000000000014', CURRENT_DATE - 15, 'Paño fino y entretelas 167 m',         2500000),
  ('b3000000-0000-0000-0000-000000000014', CURRENT_DATE -  4, 'Forros y ribetes surtido',             1000000),

  -- C15 Claudia Torres | $4M | $0.5M | $3.5M
  ('b3000000-0000-0000-0000-000000000015', CURRENT_DATE - 42, 'Encaje y tul bordado 120 m',           1800000),
  ('b3000000-0000-0000-0000-000000000015', CURRENT_DATE - 18, 'Satín y organza 183 m',                2200000),

  -- C16 Edwin Fonseca | $7M | $1M | $6M
  ('b3000000-0000-0000-0000-000000000016', CURRENT_DATE - 65, 'Tela polar y fleece 235 m',            2000000),
  ('b3000000-0000-0000-0000-000000000016', CURRENT_DATE - 38, 'Velour estampado 250 m',               2500000),
  ('b3000000-0000-0000-0000-000000000016', CURRENT_DATE - 18, 'Tela de punto 150 m',                  1500000),
  ('b3000000-0000-0000-0000-000000000016', CURRENT_DATE -  6, 'Cierres y botones surtido',            1000000),

  -- C17 Nubia Herrera | $3.3M | $0.5M | $2.8M
  ('b3000000-0000-0000-0000-000000000017', CURRENT_DATE - 35, 'Lino crudo y natural 130 m',           1500000),
  ('b3000000-0000-0000-0000-000000000017', CURRENT_DATE - 12, 'Rafia tejida y yute 180 m',            1800000),

  -- C18 Dolores Pinilla | $2.7M | $0.5M | $2.2M
  ('b3000000-0000-0000-0000-000000000018', CURRENT_DATE - 30, 'Algodón básico 160 m',                 1200000),
  ('b3000000-0000-0000-0000-000000000018', CURRENT_DATE - 10, 'Lycra y tela de baño 120 m',           1500000),

  -- C19 Carlos Rojas | $8M | $1M | $7M
  ('b3000000-0000-0000-0000-000000000019', CURRENT_DATE - 95, 'Telas básicas lote inicial',           2000000),
  ('b3000000-0000-0000-0000-000000000019', CURRENT_DATE - 44, 'Jersey y ribana 238 m',                2500000),
  ('b3000000-0000-0000-0000-000000000019', CURRENT_DATE - 20, 'Dril y poly-algodón 210 m',            2000000),
  ('b3000000-0000-0000-0000-000000000019', CURRENT_DATE -  5, 'Cierres e hilos industriales surtido', 1500000),

  -- C20 Martha Ávila | $9M | $1M | $8M
  ('b3000000-0000-0000-0000-000000000020', CURRENT_DATE - 68, 'Dry fit y tela deportiva 277 m',       2500000),
  ('b3000000-0000-0000-0000-000000000020', CURRENT_DATE - 42, 'Lycra deportiva colores 285 m',        3000000),
  ('b3000000-0000-0000-0000-000000000020', CURRENT_DATE - 18, 'Polyester sublimación 190 m',          2000000),
  ('b3000000-0000-0000-0000-000000000020', CURRENT_DATE -  4, 'Hilos y cremalleras sport',            1500000),

  -- C21 Germán Barrera | $19.5M | $2.5M | $17M
  ('b3000000-0000-0000-0000-000000000021', CURRENT_DATE -100, 'Uniforme médico antifluido — lote I',  6000000),
  ('b3000000-0000-0000-0000-000000000021', CURRENT_DATE - 70, 'Dril institucional 454 m',             5000000),
  ('b3000000-0000-0000-0000-000000000021', CURRENT_DATE - 40, 'Tela para uniformes lote III',         4000000),
  ('b3000000-0000-0000-0000-000000000021', CURRENT_DATE - 15, 'Cierres, botones y velcro institucional', 3000000),
  ('b3000000-0000-0000-0000-000000000021', CURRENT_DATE -  3, 'Parches bordados y estampados',        1500000),

  -- C22 Lilia Bejarano | $6.5M | $1M | $5.5M
  ('b3000000-0000-0000-0000-000000000022', CURRENT_DATE - 95, 'Satín y duchesse 128 m',               2000000),
  ('b3000000-0000-0000-0000-000000000022', CURRENT_DATE - 32, 'Tul y encaje importado 200 m',         2500000),
  ('b3000000-0000-0000-0000-000000000022', CURRENT_DATE - 10, 'Organza y voile 200 m',                2000000),

  -- C23 Esperanza Díaz | $3.5M | $0.5M | $3M
  ('b3000000-0000-0000-0000-000000000023', CURRENT_DATE - 48, 'Telas mixtas lote surtido',            2000000),
  ('b3000000-0000-0000-0000-000000000023', CURRENT_DATE - 16, 'Encaje y aplicaciones 125 m',          1500000),

  -- C24 Hilda Camacho | $2.5M | $0.5M | $2M
  ('b3000000-0000-0000-0000-000000000024', CURRENT_DATE - 38, 'Tela para uniformes 123 m',            1300000),
  ('b3000000-0000-0000-0000-000000000024', CURRENT_DATE - 14, 'Ribana y jersey 120 m',                1200000),

  -- C25 José Garzón | $7M | $1M | $6M
  ('b3000000-0000-0000-0000-000000000025', CURRENT_DATE - 62, 'Telas para jeans 138 m',               2000000),
  ('b3000000-0000-0000-0000-000000000025', CURRENT_DATE - 38, 'Denim y drill 192 m',                  2500000),
  ('b3000000-0000-0000-0000-000000000025', CURRENT_DATE - 14, 'Telas variadas lote B',                2500000),

  -- C26 Consuelo Herrera | $3M | $0.5M | $2.5M
  ('b3000000-0000-0000-0000-000000000026', CURRENT_DATE - 52, 'Algodón y lino 130 m',                 1500000),
  ('b3000000-0000-0000-0000-000000000026', CURRENT_DATE - 20, 'Viscosa y chalís 130 m',               1500000),

  -- C27 Margoth Castellanos | $2.8M | $0.5M | $2.3M
  ('b3000000-0000-0000-0000-000000000027', CURRENT_DATE - 42, 'Tela básica surtida 150 m',            1500000),
  ('b3000000-0000-0000-0000-000000000027', CURRENT_DATE - 18, 'Jersey y ribana 130 m',                1300000),

  -- C28 Leonor Romero | $17.5M | $2.5M | $15M
  ('b3000000-0000-0000-0000-000000000028', CURRENT_DATE - 95, 'Lote tejidos finos importados',        5000000),
  ('b3000000-0000-0000-0000-000000000028', CURRENT_DATE - 62, 'Satín, organza y tul importado 360 m', 4500000),
  ('b3000000-0000-0000-0000-000000000028', CURRENT_DATE - 35, 'Encajes bordados 280 m',               4000000),
  ('b3000000-0000-0000-0000-000000000028', CURRENT_DATE - 12, 'Telas nueva temporada — surtido',      4000000),

  -- C29 Alirio Guerrero | $4M | $0.5M | $3.5M
  ('b3000000-0000-0000-0000-000000000029', CURRENT_DATE - 50, 'Tela deportiva 235 m',                 2000000),
  ('b3000000-0000-0000-0000-000000000029', CURRENT_DATE - 22, 'Dry fit y sublimación 190 m',          2000000),

  -- C30 Patricia Nieto | $2.7M | $0.5M | $2.2M
  ('b3000000-0000-0000-0000-000000000030', CURRENT_DATE - 45, 'Tela para confecciones 150 m',         1500000),
  ('b3000000-0000-0000-0000-000000000030', CURRENT_DATE - 20, 'Entretelas y forros surtido',          1200000);

-- ─── COBROS ───────────────────────────────────────────────────────────────────
-- Total: $32.000.000  →  Cartera neta: $200.000.000

INSERT INTO payments (customer_id, payment_date, amount, payment_method, notes) VALUES

  -- C01 Gloria Niño — $2.000.000
  ('b3000000-0000-0000-0000-000000000001', CURRENT_DATE - 75,  600000, 'Efectivo',     NULL),
  ('b3000000-0000-0000-0000-000000000001', CURRENT_DATE - 45,  700000, 'Nequi',        NULL),
  ('b3000000-0000-0000-0000-000000000001', CURRENT_DATE - 18,  700000, 'Efectivo',     NULL),

  -- C02 Yaneth Bernal — $1.500.000
  ('b3000000-0000-0000-0000-000000000002', CURRENT_DATE - 55,  500000, 'Nequi',        NULL),
  ('b3000000-0000-0000-0000-000000000002', CURRENT_DATE - 25,  600000, 'Efectivo',     NULL),
  ('b3000000-0000-0000-0000-000000000002', CURRENT_DATE -  8,  400000, 'Daviplata',    NULL),

  -- C03 Cecilia Vargas — $500.000
  ('b3000000-0000-0000-0000-000000000003', CURRENT_DATE - 22,  500000, 'Efectivo',     NULL),

  -- C04 Héctor Suárez — $2.000.000
  ('b3000000-0000-0000-0000-000000000004', CURRENT_DATE - 80,  400000, 'Efectivo',     NULL),
  ('b3000000-0000-0000-0000-000000000004', CURRENT_DATE - 55,  600000, 'Transferencia',NULL),
  ('b3000000-0000-0000-0000-000000000004', CURRENT_DATE - 28,  600000, 'Efectivo',     NULL),
  ('b3000000-0000-0000-0000-000000000004', CURRENT_DATE,       400000, 'Nequi',        'Cuota del día'),

  -- C05 Luz Marina — $500.000
  ('b3000000-0000-0000-0000-000000000005', CURRENT_DATE - 30,  500000, 'Efectivo',     NULL),

  -- C06 Sandra Ramos — $500.000
  ('b3000000-0000-0000-0000-000000000006', CURRENT_DATE -  3,  500000, 'Efectivo',     NULL),

  -- C07 Fabiola Moreno — $1.000.000
  ('b3000000-0000-0000-0000-000000000007', CURRENT_DATE - 60,  400000, 'Efectivo',     NULL),
  ('b3000000-0000-0000-0000-000000000007', CURRENT_DATE - 30,  600000, 'Nequi',        NULL),

  -- C08 Blanca Acosta — $1.000.000
  ('b3000000-0000-0000-0000-000000000008', CURRENT_DATE - 45,  500000, 'Daviplata',    NULL),
  ('b3000000-0000-0000-0000-000000000008', CURRENT_DATE - 18,  500000, 'Nequi',        NULL),

  -- C09 Nelson Ríos — $1.500.000
  ('b3000000-0000-0000-0000-000000000009', CURRENT_DATE - 70,  500000, 'Efectivo',     NULL),
  ('b3000000-0000-0000-0000-000000000009', CURRENT_DATE - 40,  500000, 'Transferencia',NULL),
  ('b3000000-0000-0000-0000-000000000009', CURRENT_DATE - 15,  500000, 'Nequi',        NULL),

  -- C10 Amparo Jiménez — $1.000.000
  ('b3000000-0000-0000-0000-000000000010', CURRENT_DATE - 50,  400000, 'Efectivo',     NULL),
  ('b3000000-0000-0000-0000-000000000010', CURRENT_DATE - 25,  600000, 'Nequi',        NULL),

  -- C11 Jorge Patiño — $1.000.000
  ('b3000000-0000-0000-0000-000000000011', CURRENT_DATE - 55,  500000, 'Daviplata',    NULL),
  ('b3000000-0000-0000-0000-000000000011', CURRENT_DATE - 28,  500000, 'Nequi',        NULL),

  -- C12 Rosalba Quintero — $500.000
  ('b3000000-0000-0000-0000-000000000012', CURRENT_DATE - 22,  500000, 'Efectivo',     NULL),

  -- C13 Marta Pedraza — $3.000.000
  ('b3000000-0000-0000-0000-000000000013', CURRENT_DATE - 80,  800000, 'Efectivo',     NULL),
  ('b3000000-0000-0000-0000-000000000013', CURRENT_DATE - 50, 1000000, 'Nequi',        NULL),
  ('b3000000-0000-0000-0000-000000000013', CURRENT_DATE - 25,  800000, 'Efectivo',     NULL),
  ('b3000000-0000-0000-0000-000000000013', CURRENT_DATE,       400000, 'Transferencia','Cuota del día'),

  -- C14 Rodrigo Mora — $1.500.000
  ('b3000000-0000-0000-0000-000000000014', CURRENT_DATE - 55,  600000, 'Daviplata',    NULL),
  ('b3000000-0000-0000-0000-000000000014', CURRENT_DATE - 28,  500000, 'Efectivo',     NULL),
  ('b3000000-0000-0000-0000-000000000014', CURRENT_DATE -  8,  400000, 'Nequi',        NULL),

  -- C15 Claudia Torres — $500.000
  ('b3000000-0000-0000-0000-000000000015', CURRENT_DATE - 25,  500000, 'Nequi',        NULL),

  -- C16 Edwin Fonseca — $1.000.000
  ('b3000000-0000-0000-0000-000000000016', CURRENT_DATE - 48,  500000, 'Efectivo',     NULL),
  ('b3000000-0000-0000-0000-000000000016', CURRENT_DATE - 22,  500000, 'Nequi',        NULL),

  -- C17 Nubia Herrera — $500.000
  ('b3000000-0000-0000-0000-000000000017', CURRENT_DATE -  2,  500000, 'Transferencia',NULL),

  -- C18 Dolores Pinilla — $500.000
  ('b3000000-0000-0000-0000-000000000018', CURRENT_DATE -  1,  500000, 'Efectivo',     NULL),

  -- C19 Carlos Rojas — $1.000.000
  ('b3000000-0000-0000-0000-000000000019', CURRENT_DATE - 55,  400000, 'Efectivo',     NULL),
  ('b3000000-0000-0000-0000-000000000019', CURRENT_DATE - 28,  600000, 'Nequi',        NULL),

  -- C20 Martha Ávila — $1.000.000
  ('b3000000-0000-0000-0000-000000000020', CURRENT_DATE - 52,  500000, 'Daviplata',    NULL),
  ('b3000000-0000-0000-0000-000000000020', CURRENT_DATE - 22,  500000, 'Nequi',        NULL),

  -- C21 Germán Barrera — $2.500.000
  ('b3000000-0000-0000-0000-000000000021', CURRENT_DATE - 85,  600000, 'Efectivo',     NULL),
  ('b3000000-0000-0000-0000-000000000021', CURRENT_DATE - 55,  700000, 'Transferencia',NULL),
  ('b3000000-0000-0000-0000-000000000021', CURRENT_DATE - 25,  800000, 'Efectivo',     NULL),
  ('b3000000-0000-0000-0000-000000000021', CURRENT_DATE,       400000, 'Nequi',        'Cuota del día'),

  -- C22 Lilia Bejarano — $1.000.000
  ('b3000000-0000-0000-0000-000000000022', CURRENT_DATE - 42,  500000, 'Nequi',        NULL),
  ('b3000000-0000-0000-0000-000000000022', CURRENT_DATE - 16,  500000, 'Efectivo',     NULL),

  -- C23 Esperanza Díaz — $500.000
  ('b3000000-0000-0000-0000-000000000023', CURRENT_DATE - 28,  500000, 'Efectivo',     NULL),

  -- C24 Hilda Camacho — $500.000
  ('b3000000-0000-0000-0000-000000000024', CURRENT_DATE - 22,  500000, 'Nequi',        NULL),

  -- C25 José Garzón — $1.000.000
  ('b3000000-0000-0000-0000-000000000025', CURRENT_DATE - 45,  400000, 'Transferencia',NULL),
  ('b3000000-0000-0000-0000-000000000025', CURRENT_DATE - 20,  600000, 'Efectivo',     NULL),

  -- C26 Consuelo Herrera — $500.000
  ('b3000000-0000-0000-0000-000000000026', CURRENT_DATE - 35,  500000, 'Efectivo',     NULL),

  -- C27 Margoth Castellanos — $500.000
  ('b3000000-0000-0000-0000-000000000027', CURRENT_DATE - 28,  500000, 'Daviplata',    NULL),

  -- C28 Leonor Romero — $2.500.000
  ('b3000000-0000-0000-0000-000000000028', CURRENT_DATE - 75,  600000, 'Efectivo',     NULL),
  ('b3000000-0000-0000-0000-000000000028', CURRENT_DATE - 48,  700000, 'Nequi',        NULL),
  ('b3000000-0000-0000-0000-000000000028', CURRENT_DATE - 22,  800000, 'Transferencia',NULL),
  ('b3000000-0000-0000-0000-000000000028', CURRENT_DATE -  5,  400000, 'Efectivo',     NULL),

  -- C29 Alirio Guerrero — $500.000
  ('b3000000-0000-0000-0000-000000000029', CURRENT_DATE - 30,  500000, 'Nequi',        NULL),

  -- C30 Patricia Nieto — $500.000
  ('b3000000-0000-0000-0000-000000000030', CURRENT_DATE - 28,  500000, 'Efectivo',     NULL);

-- ─── VERIFICACIÓN ─────────────────────────────────────────────────────────────
SELECT neighborhood, COUNT(*) clientes, SUM(pending_balance)::BIGINT cartera
FROM customer_balances GROUP BY neighborhood ORDER BY cartera DESC;

SELECT SUM(pending_balance)::BIGINT AS total_cartera FROM customer_balances;

SELECT bucket, amount::BIGINT, customers FROM (
  WITH sr AS (
    SELECT s.customer_id, s.sale_date, s.total_amount,
           SUM(s.total_amount) OVER (PARTITION BY s.customer_id ORDER BY s.sale_date, s.id) AS running
    FROM sales s JOIN customers c ON c.id=s.customer_id WHERE c.active=true
  ),
  cp AS (SELECT customer_id, COALESCE(SUM(amount),0) paid FROM payments WHERE voided=false GROUP BY customer_id),
  b AS (
    SELECT sr.customer_id,
           GREATEST(0,LEAST(sr.total_amount, sr.running-COALESCE(cp.paid,0))) AS unpaid,
           CASE WHEN CURRENT_DATE-sr.sale_date<=30 THEN 1
                WHEN CURRENT_DATE-sr.sale_date<=60 THEN 2
                WHEN CURRENT_DATE-sr.sale_date<=90 THEN 3
                ELSE 4 END AS bi
    FROM sr LEFT JOIN cp ON cp.customer_id=sr.customer_id
  )
  SELECT CASE bi WHEN 1 THEN '0-30' WHEN 2 THEN '31-60' WHEN 3 THEN '61-90' ELSE '90+' END AS bucket,
         SUM(unpaid)::text amount, COUNT(DISTINCT customer_id)::text customers
  FROM b WHERE unpaid>0 GROUP BY bi ORDER BY bi
) aging;
