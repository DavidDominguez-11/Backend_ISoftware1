INSERT INTO roles (rol, descripcion) VALUES
('admin', 'Control total del sistema. Tiene todos los permisos'),
('operaciones', 'Encargado de inventario y asignaciones.'),
('tecnico', 'Enfocado en proyectos y subir reportes'),
('logistica', 'Consulta inventario y alertas para contactar proveedores.');

INSERT INTO permisos (permiso) VALUES
('ver_dashboard'),
('ver_inventario'),
('editar_inventario'),
('asignar_material'),
('ver_proyectos'),
('crear_proyecto'),
('editar_proyecto'),
('eliminar_proyecto'),
('ver_reportes'),
('crear_reportes'),
('editar_reportes'),
('eliminar_reportes'),
('ver_alertas'),
('crear_usuario'),
('editar_usuario'),
('eliminar_usuario'),
('crear_rol'),
('editar_rol'),
('eliminar_rol');


-- admin: todos los permisos (1 al 19)
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 1, id FROM permisos;

-- operaciones: 1, 2, 3, 4, 13, 5
INSERT INTO roles_permisos (rol_id, permiso_id) VALUES
(2, 1),
(2, 2),
(2, 3),
(2, 4),
(2, 13),
(2, 5);

-- tecnico: 1, 5, 6, 7, 8, 9, 10, 11, 12, 2
INSERT INTO roles_permisos (rol_id, permiso_id) VALUES
(3, 1),
(3, 5),
(3, 6),
(3, 7),
(3, 8),
(3, 9),
(3, 10),
(3, 11),
(3, 12),
(3, 2);

-- logistica: 1, 2, 13
INSERT INTO roles_permisos (rol_id, permiso_id) VALUES
(4, 1),
(4, 2),
(4, 13);