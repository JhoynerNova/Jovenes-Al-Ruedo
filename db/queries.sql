-- ¿Qué? Consultas SQL útiles para el proyecto Jóvenes al Ruedo.
-- ¿Para qué? Referencia rápida para desarrolladores y análisis de datos.
-- ¿Impacto? Permite consultar, depurar y analizar la BD sin escribir SQL desde cero.
-- Proyecto: Jóvenes al Ruedo | SENA Ficha: 3171599

-- ════════════════════════════════════════
-- SELECT básicos
-- ════════════════════════════════════════

-- ¿Qué? Listar todos los usuarios activos.
-- ¿Para qué? Ver el padrón de artistas registrados.
SELECT id, email, full_name, artistic_area, birth_date, created_at
FROM users
WHERE is_active = TRUE
ORDER BY created_at DESC;

-- ¿Qué? Contar usuarios por área artística.
-- ¿Para qué? Analizar qué disciplinas tienen más artistas registrados.
SELECT artistic_area, COUNT(*) AS total
FROM users
WHERE is_active = TRUE
GROUP BY artistic_area
ORDER BY total DESC;

-- ¿Qué? Usuarios entre 18 y 28 años.
-- ¿Para qué? Verificar que el rango de edad de la plataforma se cumpla.
SELECT full_name, email, birth_date,
       DATE_PART('year', AGE(birth_date)) AS edad
FROM users
WHERE DATE_PART('year', AGE(birth_date)) BETWEEN 18 AND 28
ORDER BY birth_date;

-- ════════════════════════════════════════
-- JOINs
-- ════════════════════════════════════════

-- ¿Qué? Artistas con sus habilidades.
-- ¿Para qué? Ver el perfil completo de habilidades por artista.
SELECT u.full_name, u.artistic_area, h.nombre AS habilidad
FROM users u
JOIN rel_usr_hab ruh ON u.id = ruh.id_usr
JOIN habilidades h   ON ruh.id_hab = h.id_hab
ORDER BY u.full_name, h.nombre;

-- ¿Qué? Convocatorias con número de inscritos.
-- ¿Para qué? Ver qué convocatorias tienen más postulaciones.
SELECT c.nombre AS convocatoria, u.full_name AS empresa,
       COUNT(i.id_i) AS total_inscritos, c.created_at
FROM conv c
JOIN users u         ON c.id_usr  = u.id
LEFT JOIN inscripcion i ON c.id_conv = i.id_conv
GROUP BY c.id_conv, c.nombre, u.full_name, c.created_at
ORDER BY total_inscritos DESC;

-- ¿Qué? Portafolios con sus archivos publicados.
-- ¿Para qué? Ver qué artistas tienen portafolios completos y visibles.
SELECT u.full_name, p.nombre AS portafolio,
       COUNT(dp.id_det_p) AS archivos_publicados
FROM users u
JOIN portafolio p     ON u.id      = p.id_usr
JOIN det_portafolio dp ON p.id_port = dp.id_port
WHERE dp.estado = 'P'
GROUP BY u.full_name, p.nombre
ORDER BY archivos_publicados DESC;

-- ¿Qué? Artistas que se postularon a una convocatoria específica.
-- ¿Para qué? Ver los candidatos de una convocatoria (reemplazar id_conv=1).
SELECT u.full_name, u.email, u.artistic_area, i.created_at AS fecha_postulacion
FROM inscripcion i
JOIN users u ON i.id_usr = u.id
WHERE i.id_conv = 1
ORDER BY i.created_at;

-- ════════════════════════════════════════
-- GROUP BY y agregaciones
-- ════════════════════════════════════════

-- ¿Qué? Habilidades más populares entre artistas.
-- ¿Para qué? Identificar qué habilidades tiene más demanda en la plataforma.
SELECT h.nombre AS habilidad, COUNT(ruh.id_rel) AS artistas_con_habilidad
FROM habilidades h
LEFT JOIN rel_usr_hab ruh ON h.id_hab = ruh.id_hab
GROUP BY h.id_hab, h.nombre
ORDER BY artistas_con_habilidad DESC;

-- ¿Qué? Resumen mensual de registros de usuarios.
-- ¿Para qué? Analizar el crecimiento de la plataforma mes a mes.
SELECT DATE_TRUNC('month', created_at) AS mes,
       COUNT(*) AS nuevos_usuarios
FROM users
GROUP BY mes
ORDER BY mes DESC;
