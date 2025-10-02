-- ROL
INSERT INTO roles (rol) VALUES
('Administrador'),
('Operaciones'),
('Asistente');

-- USUARIOS
INSERT INTO usuarios (nombre, email, contraseña) VALUES
('admin', 'admin@ejemplo.com', '$2b$10$TVp9OMgQT64f1r7A8DYyJeYwoGNZqhK8YV3JFqKR14zBEBxLpylom'),
('ingeniero', 'ingeniero@ejemplo.com', '$2b$10$zL3yqwRkBQisRrO6cUAkZe81pg5uByJazhhROt4GJzxGC1qQNC1ym'),
('secretaria', 'secretaria@ejemplo.com', '$2b$10$/OplDk.tAT2.8CfoGptg8.DglB27k3pDnEqHklPZJmG1YRc6q6qkW');

-- TELÉFONOS
INSERT INTO telefonos (usuario_id, telefono) VALUES
(1, '50212345678'),
(2, '50298765432'),
(3, '50211223344');

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
--Asistente
INSERT INTO roles_permisos (rol_id, permiso_id) VALUES
(3, 13);  -- ver_alertas

-- USUARIOS_ROLES
INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES
(1, 1), -- > Admin
(2, 2), -- > Ingeniero
(3, 3); -- > Secretaria

-- MATERIALES
INSERT INTO materiales (codigo, material) VALUES
('CEM01', 'Cemento hidráulico'),
('ARE22', 'Arena fina'),
('GRA15', 'Grava'),
('VAR33', 'Varilla de acero'),
('BLO08', 'Bloque de concreto'),
('MAL44', 'Malla electrosoldada'),
('MOR19', 'Mortero impermeable'),
('AZU27', 'Azulejo para piscina'),
('BOM55', 'Bomba de agua'),
('PVC90', 'Tubería PVC presión');

-- CLIENTES
INSERT INTO clientes (nombre, telefono) VALUES
('Hotel Costa Azul', '5515-1001'),
('Residencial Las Palmas', '3555-1002'),
('Ana Pérez', '5545-1003'),
('Carlos Ramírez', '4555-1004'),
('Club Náutico del Lago', '5557-1005'),
('Lucía Gómez', '5655-1006'),
('Hotel Mar y Sol', '8555-1007'),
('Jorge Martínez', '5955-1008'),
('Complejo Recreativo Oasis', '1005-1009'),
('Valeria Sánchez', '5345-1010');


-- PROYECTOS 
INSERT INTO proyectos (nombre, estado, presupuesto, cliente_id, fecha_inicio, fecha_fin, ubicacion, tipo_servicio) VALUES
-- 1 solicitado
('Piscina Residencial Ana Pérez', 'Solicitado', 12000.00, 3, '2025-10-01', NULL, 'Zona 10, Ciudad', 'Piscina Irregular'),
-- 3 en progreso
('Piscina Hotel Costa Azul', 'En Progreso', 55000.00, 1, '2025-08-15', NULL, 'Playa Azul', 'Piscina Regular'),
('Jacuzzi Club Náutico del Lago', 'En Progreso', 15000.00, 5, '2025-09-01', NULL, 'Lago Central', 'Jacuzzi'),
('Paneles Solares Residencial Las Palmas', 'En Progreso', 20000.00, 2, '2025-09-10', NULL, 'Zona 14, Ciudad', 'Paneles Solares'),
-- 5 finalizados
('Piscina Hotel Mar y Sol', 'Finalizado', 60000.00, 7, '2025-01-05', '2025-03-10', 'Playa Dorada', 'Piscina Regular'),
('Jacuzzi Jorge Martínez', 'Finalizado', 12000.00, 8, '2025-02-01', '2025-02-20', 'Zona 11, Ciudad', 'Jacuzzi'),
('Piscina Complejo Recreativo Oasis', 'Finalizado', 45000.00, 9, '2025-03-15', '2025-06-01', 'Suburbio', 'Piscina Irregular'),
('Piscina Lucía Gómez', 'Finalizado', 18000.00, 6, '2025-04-01', '2025-05-15', 'Zona 12, Ciudad', 'Piscina Irregular'),
('Paneles Solares Valeria Sánchez', 'Finalizado', 22000.00, 10, '2025-05-01', '2025-07-10', 'Zona 13, Ciudad', 'Paneles Solares'),
-- 1 cancelado
('Piscina Carlos Ramírez', 'Cancelado', 15000.00, 4, '2025-09-01', '2025-09-10', 'Zona 9, Ciudad', 'Piscina Regular');

-- BODEGA_MOVIMIENTOS
-- Entradas a bodega
INSERT INTO bodega_materiales (material_id, tipo, cantidad, fecha, observaciones) VALUES
(1, 'Entrada', 500, '2025-09-01', 'Compra inicial de cemento'),
(2, 'Entrada', 1000, '2025-09-01', 'Compra de arena fina'),
(3, 'Entrada', 800, '2025-09-01', 'Compra de grava'),
(4, 'Entrada', 300, '2025-09-01', 'Compra de varilla de acero'),
(5, 'Entrada', 600, '2025-09-01', 'Compra de bloques de concreto'),
(6, 'Entrada', 200, '2025-09-01', 'Compra de malla electrosoldada'),
(7, 'Entrada', 400, '2025-09-01', 'Compra de mortero impermeable'),
(8, 'Entrada', 150, '2025-09-01', 'Compra de azulejos'),
(9, 'Entrada', 20, '2025-09-01', 'Compra de bombas de agua'),
(10, 'Entrada', 100, '2025-09-01', 'Compra de tubería PVC');

-- Salidas hacia proyectos (ejemplos)
INSERT INTO bodega_materiales (material_id, tipo, cantidad, fecha, proyecto_id, observaciones) VALUES
(1, 'Salida', -50, '2025-08-20', 2, 'Cemento usado en Piscina Hotel Costa Azul'),
(2, 'Salida', -80, '2025-08-20', 2, 'Arena usada en Piscina Hotel Costa Azul'),
(3, 'Salida', -60, '2025-08-20', 2, 'Grava usada en Piscina Hotel Costa Azul'),
(4, 'Salida', -30, '2025-09-02', 3, 'Varilla para Jacuzzi Club Náutico del Lago'),
(7, 'Salida', -20, '2025-09-05', 4, 'Mortero usado en Paneles Solares Residencial Las Palmas'),
(8, 'Salida', -15, '2025-03-06', 5, 'Azulejos Piscina Hotel Mar y Sol');

-- PROYECTO_MATERIAL
INSERT INTO proyecto_material (id_proyecto, id_material, ofertada, en_obra, reservado) VALUES
-- Proyecto 2: Piscina Hotel Costa Azul
(2, 1, 60, 50, 0),  -- Cemento
(2, 2, 85, 80, 0),  -- Arena
(2, 3, 90, 60, 0),  -- Grava

-- Proyecto 3: Jacuzzi Club Náutico del Lago
(3, 4, 30, 30, 0),  -- Varilla
(3, 7, 20, 0, 0),  -- Mortero

-- Proyecto 4: Paneles Solares Residencial Las Palmas
(4, 7, 50, 20, 0),  -- Mortero
(4, 10, 10, 0, 0), -- Tubería PVC

-- Proyecto 5: Piscina Hotel Mar y Sol (finalizado)
(5, 8, 15, 15, 0); -- Azulejo