-- ¿Qué? Datos de prueba para desarrollo local del proyecto Jóvenes al Ruedo.
-- ¿Para qué? Poblar la BD con datos realistas para probar la aplicación.
-- ¿Impacto? Sin seed, la BD estaría vacía y no se podría probar ninguna funcionalidad.
-- ⚠️ SOLO para entornos de DESARROLLO — NUNCA ejecutar en producción.
-- Proyecto: Jóvenes al Ruedo | SENA Ficha: 3171599

-- ────────────────────────────
-- Habilidades artísticas
-- ────────────────────────────
INSERT INTO habilidades (nombre) VALUES
    ('Actuación teatral'),
    ('Canto lírico'),
    ('Canto popular'),
    ('Pintura al óleo'),
    ('Pintura acuarela'),
    ('Danza contemporánea'),
    ('Danza folclórica'),
    ('Guitarra clásica'),
    ('Guitarra eléctrica'),
    ('Fotografía artística'),
    ('Fotografía de moda'),
    ('Escritura creativa'),
    ('Guionismo'),
    ('Edición de video'),
    ('Dirección de cine'),
    ('Diseño gráfico'),
    ('Ilustración digital'),
    ('Percusión'),
    ('Piano'),
    ('Escultura')
ON CONFLICT (nombre) DO NOTHING;

-- ────────────────────────────
-- Usuarios de prueba (contraseña: Test1234 — hasheada con bcrypt)
-- Hash generado con: bcrypt.hashpw(b"Test1234", bcrypt.gensalt())
-- ────────────────────────────
INSERT INTO users (id, email, full_name, birth_date, artistic_area, hashed_password, is_active) VALUES
    ('a1b2c3d4-0001-0001-0001-000000000001', 'sofia.reyes@gmail.com',    'Sofía Reyes Morales',    '2001-03-15', 'Actuación',  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMzemdBhif.aWEDP5Y8eF0y.iO', TRUE),
    ('a1b2c3d4-0002-0002-0002-000000000002', 'miguel.torres@hotmail.com','Miguel Torres Acosta',   '1999-07-22', 'Música',     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMzemdBhif.aWEDP5Y8eF0y.iO', TRUE),
    ('a1b2c3d4-0003-0003-0003-000000000003', 'valentina.cruz@gmail.com', 'Valentina Cruz López',   '2000-11-08', 'Danza',      '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMzemdBhif.aWEDP5Y8eF0y.iO', TRUE),
    ('a1b2c3d4-0004-0004-0004-000000000004', 'andres.gomez@yahoo.com',   'Andrés Gómez Pérez',     '2003-02-14', 'Pintura',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMzemdBhif.aWEDP5Y8eF0y.iO', TRUE),
    ('a1b2c3d4-0005-0005-0005-000000000005', 'isabella.vargas@gmail.com','Isabella Vargas Ríos',   '1998-09-30', 'Fotografía', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMzemdBhif.aWEDP5Y8eF0y.iO', TRUE),
    ('a1b2c3d4-0006-0006-0006-000000000006', 'carlos.medina@gmail.com',  'Carlos Medina Suárez',   '2002-05-19', 'Canto',      '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMzemdBhif.aWEDP5Y8eF0y.iO', TRUE),
    ('a1b2c3d4-0007-0007-0007-000000000007', 'laura.jimenez@outlook.com','Laura Jiménez Castro',   '2000-08-25', 'Escritura',  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMzemdBhif.aWEDP5Y8eF0y.iO', TRUE),
    ('a1b2c3d4-0008-0008-0008-000000000008', 'juan.herrera@gmail.com',   'Juan Herrera Muñoz',     '2001-12-03', 'Cine',       '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMzemdBhif.aWEDP5Y8eF0y.iO', TRUE),
    ('a1b2c3d4-0009-0009-0009-000000000009', 'sara.rojas@gmail.com',     'Sara Rojas Mendoza',     '1999-04-17', 'Diseño',     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMzemdBhif.aWEDP5Y8eF0y.iO', TRUE),
    ('a1b2c3d4-0010-0010-0010-000000000010', 'david.silva@hotmail.com',  'David Silva Ospina',     '2003-06-28', 'Música',     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMzemdBhif.aWEDP5Y8eF0y.iO', TRUE),
    ('a1b2c3d4-0011-0011-0011-000000000011', 'camila.pena@gmail.com',    'Camila Peña Guerrero',   '2000-01-10', 'Actuación',  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMzemdBhif.aWEDP5Y8eF0y.iO', TRUE),
    ('a1b2c3d4-0012-0012-0012-000000000012', 'nicolas.leal@gmail.com',   'Nicolás Leal Barrera',   '2002-10-05', 'Danza',      '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMzemdBhif.aWEDP5Y8eF0y.iO', TRUE),
    ('a1b2c3d4-0013-0013-0013-000000000013', 'daniela.mora@yahoo.com',   'Daniela Mora Castaño',   '1999-07-11', 'Pintura',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMzemdBhif.aWEDP5Y8eF0y.iO', TRUE),
    ('a1b2c3d4-0014-0014-0014-000000000014', 'sebastian.rios@gmail.com', 'Sebastián Ríos Cardona', '2001-03-22', 'Fotografía', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMzemdBhif.aWEDP5Y8eF0y.iO', TRUE),
    ('a1b2c3d4-0015-0015-0015-000000000015', 'paula.leon@gmail.com',     'Paula León Giraldo',     '2003-09-14', 'Canto',      '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMzemdBhif.aWEDP5Y8eF0y.iO', TRUE),
    ('a1b2c3d4-0016-0016-0016-000000000016', 'felipe.castro@outlook.com','Felipe Castro Henao',    '2000-02-28', 'Escritura',  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMzemdBhif.aWEDP5Y8eF0y.iO', TRUE),
    ('a1b2c3d4-0017-0017-0017-000000000017', 'natalia.vega@gmail.com',   'Natalia Vega Salazar',   '1998-11-07', 'Cine',       '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMzemdBhif.aWEDP5Y8eF0y.iO', TRUE),
    ('a1b2c3d4-0018-0018-0018-000000000018', 'jose.ramirez@gmail.com',   'José Ramírez Torres',    '2002-08-19', 'Música',     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMzemdBhif.aWEDP5Y8eF0y.iO', TRUE),
    ('a1b2c3d4-0019-0019-0019-000000000019', 'maria.acosta@yahoo.com',   'María Acosta Patiño',    '2001-05-31', 'Danza',      '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMzemdBhif.aWEDP5Y8eF0y.iO', TRUE),
    ('a1b2c3d4-0020-0020-0020-000000000020', 'alejandro.diaz@gmail.com', 'Alejandro Díaz Bermúdez','1999-12-25', 'Diseño',     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMzemdBhif.aWEDP5Y8eF0y.iO', TRUE)
ON CONFLICT (email) DO NOTHING;

-- ────────────────────────────
-- Portafolios de prueba
-- ────────────────────────────
INSERT INTO portafolio (nombre, id_usr) VALUES
    ('Mi portafolio de actuación 2024', 'a1b2c3d4-0001-0001-0001-000000000001'),
    ('Grabaciones de voz', 'a1b2c3d4-0006-0006-0006-000000000006'),
    ('Colección de pinturas', 'a1b2c3d4-0004-0004-0004-000000000004'),
    ('Videos de danza', 'a1b2c3d4-0003-0003-0003-000000000003'),
    ('Fotografías artísticas', 'a1b2c3d4-0005-0005-0005-000000000005');

-- ────────────────────────────
-- Convocatorias de prueba
-- ────────────────────────────
INSERT INTO conv (nombre, glue, id_usr) VALUES
    ('Búsqueda de actores para obra de teatro', 'Buscamos actores jóvenes para obra clásica del siglo XIX en el Teatro Mayor de Bogotá.', 'a1b2c3d4-0001-0001-0001-000000000001'),
    ('Cantantes para festival de música', 'Festival cultural en Medellín busca solistas y agrupaciones de géneros variados.', 'a1b2c3d4-0006-0006-0006-000000000006'),
    ('Fotógrafos para campaña publicitaria', 'Agencia de publicidad requiere fotógrafo con experiencia en moda y retratos.', 'a1b2c3d4-0005-0005-0005-000000000005');

-- ────────────────────────────
-- Inscripciones de prueba
-- ────────────────────────────
INSERT INTO inscripcion (id_conv, id_usr) VALUES
    (1, 'a1b2c3d4-0011-0011-0011-000000000011'),
    (1, 'a1b2c3d4-0008-0008-0008-000000000008'),
    (2, 'a1b2c3d4-0015-0015-0015-000000000015'),
    (2, 'a1b2c3d4-0002-0002-0002-000000000002'),
    (3, 'a1b2c3d4-0014-0014-0014-000000000014')
ON CONFLICT ON CONSTRAINT uq_inscripcion DO NOTHING;
