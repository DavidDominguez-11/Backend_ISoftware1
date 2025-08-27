-- ROL
INSERT INTO roles (rol) VALUES
('Administrador'),
('Operaciones'),
('Logistica'),
('Cliente');

-- USUARIOS
INSERT INTO usuarios (nombre, email, contraseña) VALUES
('admin', 'admin@ejemplo.com', '$2b$10$TVp9OMgQT64f1r7A8DYyJeYwoGNZqhK8YV3JFqKR14zBEBxLpylom'),
('gerente', 'gerente@ejemplo.com', '$2b$10$EsuwFtqivL7i8dJhYkr1WevNA0fJLLOHgFbV2NFG2DNWus.oBep9e'),
('secretaria', 'secretaria@ejemplo.com', '$2b$10$/OplDk.tAT2.8CfoGptg8.DglB27k3pDnEqHklPZJmG1YRc6q6qkW'),
('ingeniero', 'ingeniero@ejemplo.com', '$2b$10$zL3yqwRkBQisRrO6cUAkZe81pg5uByJazhhROt4GJzxGC1qQNC1ym'),
('Usuario de Prueba', 'auth_test@validation.com', '$2b$10$J/XhHQx33GT/ViSjI7nzJ.NjaTBayy.g2lv7JwhGBSN1/RCw2nSUK');

-- TELÉFONOS
INSERT INTO telefonos (usuario_id, telefono) VALUES
(1, '50212345678'),
(2, '50298765432'),
(3, '50211223344'),
(4, '50299223355');

-- PERMISOS
INSERT INTO permisos (permiso) VALUES
('ver_dashboard'),
('ver_inventario'),
('ver_proyectos'),
('ver_reportes'),
('crear_material'),
('editar_inventario'),
('eliminar_material'),
('crear_proyecto'),
('editar_proyecto'),
('eliminar_proyecto'),
('crear_reporte'),
('eliminar_reporte'),
('ver_alertas'),
('crear_usuario'),
('editar_usuario'),
('eliminar_usuario');

-- ROLES_PERMISOS
--Gerente todos los permisos
INSERT INTO roles_permisos (rol_id, permiso_id) SELECT 1, id FROM permisos;
--Operaciones
INSERT INTO roles_permisos (rol_id, permiso_id) VALUES
(2, 2),   -- ver_inventario
(2, 3),   -- ver_proyectos
(2, 4),   -- ver_reportes
(2, 11),  -- crear_reporte
(2, 12),  -- eliminar_reporte
(2, 13),  -- ver_alertas
(2, 6);   -- editar_inventario
--Logistica
INSERT INTO roles_permisos (rol_id, permiso_id) VALUES
(3, 13);  -- ver_alertas

-- USUARIOS_ROLES
INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES
(1, 1), -- > Admin
(2, 1), -- > Gerente
(3, 2), -- > Secretaria
(4, 3); -- > Ingeniero

-- MATERIALES
INSERT INTO materiales (codigo, material) VALUES
('Tubo-001', 'Codo 1/2'),
('Tubo-002', 'Macho 2 1/2'),
('Bomba-001', 'Superflo 5.0'),
('Bomba-002', 'Superflo 2.5'),
('Luz-001', 'Globerite Color'),
('Luz-002', 'Globerite Blanco');

-- BODEGA_MOVIMIENTOS
INSERT INTO bodega_materiales (material_id, tipo, cantidad, fecha, observaciones) VALUES
(1, 'entrada', 100, '2025-06-01', 'Compra inicial de codo 1/2'),
(2, 'entrada', 150, '2025-06-02', 'Compra inicial de macho 2 1/2'),
(3, 'entrada', 2, '2025-06-03', 'Compra inicial de Superflo 5.0'),
(4, 'salida', 3, '2025-06-03', 'Compra inicial de Superflo 2.5'),
(5, 'entrada', 15, '2025-06-03', 'Compra inicial de Globerite Color'),
(6, 'salida', 15, '2025-06-03', 'Compra inicial de Globerite Blanco');

-- PROYECTOS
INSERT INTO proyectos (nombre, estado, presupuesto, cliente_id, fecha_inicio, fecha_fin, ubicacion, tipo_servicio) VALUES
('La Estacion', 'solicitado', 125000.00, 1, '2025-05-15', '2025-06-20', 'Zona 10, Ciudad de Guatemala', 'regulares'),
('Metroplaza', 'en progreso', 125000.00, 2, '2025-05-15', '2025-06-20', 'Zona 10, Ciudad de Guatemala', 'irregulares'),
('Megacentro', 'cancelado', 125000.00, 3, '2025-05-15', NULL, 'Zona 10, Ciudad de Guatemala', 'remodelaciones'),
('Interplaza', 'finalizado', 32000.00, 2, '2025-06-01', '2025-06-20', 'Zona 10, Ciudad de Guatemala', 'jacuzzis');

-- PROYECTO_MATERIAL
INSERT INTO proyecto_material (id_proyecto, id_material, ofertada, en_obra, reservado) VALUES
-- Proyecto 'La Estacion' (solicitado): Solo puede tener cantidad ofertada y reservada, no en obra.
(1, 1, 50, 0, 10), -- Se ofertan 50 Codos 1/2, se reservan 10.
(1, 2, 100, 0, 30),-- Se ofertan 100 Macho 2 1/2, se reservan 30.
(1, 3, 2, 0, 2),   -- Se ofertan 2 Superflo 5.0 (segun existencia en bodega) y se reservan ambas.

-- Proyecto 'Metroplaza' (en progreso): Debe tener materiales en obra y/o reservados.
(2, 1, 20, 15, 5), -- Se ofertaron 20 Codos 1/2, 15 ya estan en obra y 5 reservados en bodega.
(2, 2, 40, 20, 10),-- Se ofertaron 40 Macho 2 1/2, 20 en obra y 10 reservados.
(2, 5, 10, 8, 2),  -- Se ofertaron 10 Globerite Color, 8 en obra y 2 reservados.

-- Proyecto 'Interplaza' (finalizado): Refleja el material total que se utilizó (salidas de bodega).
(4, 4, 3, 3, 0),   -- Se usaron 3 Superflo 2.5. La cantidad en obra es la final.
(4, 6, 15, 15, 0); -- Se usaron 15 Globerite Blanco. La cantidad en obra es la final.
