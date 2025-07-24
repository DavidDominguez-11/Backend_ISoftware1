-- ROL
INSERT INTO roles (rol) VALUES
('Administrador'),
('Supervisor'),
('Obrero');

-- USUARIOS
INSERT INTO usuarios (nombre, email, contraseña) VALUES
('Ana López', 'ana.lopez@mail.com', '1234'),
('Carlos Pérez', 'carlos.perez@mail.com', 'abcd'),
('Luis Ramírez', 'luis.ramirez@mail.com', 'xyz987');

-- TELÉFONOS
INSERT INTO telefonos (usuario_id, telefono) VALUES
(1, '50212345678'),
(2, '50298765432'),
(3, '50211223344');

-- PERMISOS
INSERT INTO permisos (permiso) VALUES
('ver_proyectos'),
('crear_proyectos'),
('editar_proyectos'),
('eliminar_proyectos');

-- ROLES_PERMISOS
INSERT INTO roles_permisos (rol_id, permiso_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4),  -- Admin
(2, 1), (2, 2), (2, 3),          -- Supervisor
(3, 1);                          -- Obrero

-- USUARIOS_ROLES
INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES
(1, 1), -- Ana -> Admin
(2, 2), -- Carlos -> Supervisor
(3, 3); -- Luis -> Obrero

-- MATERIALES
INSERT INTO materiales (codigo, material) VALUES
('MAT-001', 'Cemento tipo I'),
('MAT-002', 'Arena fina'),
('MAT-003', 'Hierro de 3/8');

-- BODEGA_MOVIMIENTOS
INSERT INTO bodega_materiales (material_id, tipo, cantidad, fecha, observaciones) VALUES
(1, 'entrada', 100, '2025-06-01', 'Compra inicial de cemento'),
(2, 'entrada', 200, '2025-06-02', 'Arena para fundición'),
(3, 'entrada', 150, '2025-06-03', 'Hierro para columnas'),
(1, 'salida', 20, '2025-06-10', 'Material enviado a Proyecto 1'),
(2, 'salida', 50, '2025-06-11', 'Arena enviada a Proyecto 1');

-- PROYECTOS
INSERT INTO proyectos (nombre, estado, presupuesto, cliente_id, fecha_inicio, fecha_fin, ubicacion, tipo_servicio) VALUES
('Residencial Las Flores', 'en progreso', 125000.00, 1, '2025-05-15', '2025-12-20', 'Zona 10, Ciudad de Guatemala', 'construccion'),
('Reparación Escuela San Juan', 'solicitado', 32000.00, 2, '2025-06-01', NULL, 'San Juan Sacatepéquez', 'remodelacion');

-- PROYECTO_MATERIAL
INSERT INTO proyecto_material (id_proyecto, id_material, ofertada, en_obra, reservado) VALUES
(1, 1, 50, 20, 10),
(1, 2, 100, 50, 30),
(1, 3, 80, 0, 0),
(2, 1, 20, 0, 0),
(2, 2, 40, 0, 0);
