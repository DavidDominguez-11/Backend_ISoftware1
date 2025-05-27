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


-- Crear las tablas dentro de test_db
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    rol VARCHAR(255) NOT NULL,
    descripcion text
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
    nombre VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS movimiento_materiales (
    id SERIAL PRIMARY KEY,
    material_id INTEGER NOT NULL,
    tipo VARCHAR(255) NOT NULL,
    cantidad INTEGER NOT NULL,
    proveedor VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    FOREIGN KEY (material_id) REFERENCES materiales(id)
);

CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS proyectos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    presupuesto DECIMAL(10,2) NOT NULL CHECK (presupuesto >= 0),
    cliente_id INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    FOREIGN KEY (cliente_id) REFERENCES Clientes(id)
);

CREATE TABLE IF NOT EXISTS material_proyecto (
    id SERIAL PRIMARY KEY,
    material_id INT NOT NULL,
    proyecto_id INT NOT NULL,
    ofrecido INT NOT NULL CHECK (ofrecido > 0),
    comprado INT NOT NULL CHECK (comprado > 0),
    obra INT NOT NULL CHECK (obra > 0),
    bodega INT NOT NULL CHECK (bodega > 0),
    FOREIGN KEY (material_id) REFERENCES materiales(id),
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id)
);

CREATE TABLE IF NOT EXISTS bodega_proyecto (
    id SERIAL PRIMARY KEY,
    material_id INTEGER NOT NULL,
    tipo VARCHAR(255) NOT NULL,
    cantidad INTEGER NOT NULL,
    proyecto_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    FOREIGN KEY (material_id) REFERENCES materiales(id),
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id)
);

CREATE TABLE IF NOT EXISTS reportes (
    id SERIAL PRIMARY KEY,
    proyecto_id INT NOT NULL,
    fecha DATE NOT NULL,
    contenido TEXT,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id)
);

