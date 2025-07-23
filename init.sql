-- Crear la base de datos solo si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'test_db') THEN
        CREATE DATABASE test_db;
    END IF;
END $$;

-- Crear el usuario 'usuario' solo si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'usuario') THEN
        CREATE USER usuario WITH PASSWORD 'secret';
    END IF;
END $$;

-- Otorgar privilegios al usuario sobre la base de datos
GRANT ALL PRIVILEGES ON DATABASE test_db TO usuario;

-- Definicion de Enums 
CREATE TYPE tipo_movimiento_enum AS ENUM ('entrada', 'salida');

CREATE TYPE estado_proyecto_enum AS ENUM ('solicitado', 'en progreso', 'finalizado', 'cancelado');

-- Enum logico que se me ocurrio para esto 
CREATE TYPE tipo_servicio_enum AS ENUM ('construccion', 'remodelacion', 'mantenimiento'); 


-- Crear las tablas dentro de test_db
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    rol VARCHAR(255) NOT NULL,
);

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS telefonos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    telefono VARCHAR(255),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS permisos (
    id SERIAL PRIMARY KEY,
    permiso VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS roles_permisos (
    id SERIAL PRIMARY KEY,
    rol_id INTEGER NOT NULL,
    permiso_id INTEGER NOT NULL,
    FOREIGN KEY (rol_id) REFERENCES roles(id),
    FOREIGN KEY (permiso_id) REFERENCES permisos(id)
);

CREATE TABLE IF NOT EXISTS usuarios_roles (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    rol_id INTEGER NOT NULL,
    FOREIGN KEY (rol_id) REFERENCES roles(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS materiales (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(255) NOT NULL,
    material VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS bodega_materiales (
    id SERIAL PRIMARY KEY,
    material_id INTEGER NOT NULL,
    tipo tipo_movimiento_enum NOT NULL,
    cantidad INTEGER NOT NULL,
    fecha DATE NOT NULL,
    observaciones TEXT,
    FOREIGN KEY (material_id) REFERENCES materiales(id)
);

CREATE TABLE IF NOT EXISTS proyectos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    estado estado_proyecto_enum NOT NULL,
    presupuesto DECIMAL(10,2) NOT NULL CHECK (presupuesto >= 0),
    cliente_id INTEGER NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    ubicacion VARCHAR(255),
    tipo_servicio tipo_servicio_enum NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS proyecto_material(
    id SERIAL PRIMARY KEY,
    id_proyecto
    id_material
    ofertada
    en_obra
    reservado
);