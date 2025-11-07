-- ============================================
-- CREACIÓN DE BASE DE DATOS Y USUARIO
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'test_db') THEN
        CREATE DATABASE test_db;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'usuario') THEN
        CREATE USER usuario WITH PASSWORD 'secret';
    END IF;
END $$;

GRANT ALL PRIVILEGES ON DATABASE test_db TO usuario;

-- ============================================
-- TIPOS ENUM
-- ============================================
CREATE TYPE tipo_movimiento_enum AS ENUM ('Entrada', 'Salida');
CREATE TYPE estado_proyecto_enum AS ENUM ('Solicitado', 'En Progreso', 'Finalizado', 'Cancelado');
CREATE TYPE tipo_servicio_enum AS ENUM ('Piscina Regular', 'Piscina Irregular', 'Remodelacion', 'Jacuzzi', 'Paneles Solares', 'Fuentes y Cascadas');

-- ============================================
-- TABLAS DE SEGURIDAD (USUARIOS / ROLES / PERMISOS)
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    rol VARCHAR(255) NOT NULL
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

-- ============================================
-- TABLAS PRINCIPALES (CLIENTES / PROYECTOS / MATERIALES)
-- ============================================
CREATE TABLE IF NOT EXISTS materiales (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(255) NOT NULL,
    material VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(255) UNIQUE NOT NULL
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
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    CONSTRAINT chk_fecha_fin_estado CHECK (
        (estado IN ('Finalizado', 'Cancelado') AND fecha_fin IS NOT NULL) OR
        (estado NOT IN ('Finalizado', 'Cancelado') AND fecha_fin IS NULL)
    )
);

-- ============================================
-- TABLAS DE BODEGA Y RELACIONES DE MATERIALES
-- ============================================
CREATE TABLE IF NOT EXISTS bodega_materiales (
    id SERIAL PRIMARY KEY,
    material_id INTEGER NOT NULL,
    tipo tipo_movimiento_enum NOT NULL,
    cantidad INTEGER NOT NULL,
    fecha DATE NOT NULL,
    observaciones TEXT,
    proyecto_id INTEGER,
    FOREIGN KEY (material_id) REFERENCES materiales(id),
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id),
    CONSTRAINT chk_signo_por_tipo CHECK (
        (tipo = 'Entrada' AND cantidad > 0) OR
        (tipo = 'Salida'  AND cantidad < 0)
    ),
    CONSTRAINT chk_bodega_tipo_proyecto CHECK (
        (tipo = 'Entrada' AND proyecto_id IS NULL) OR
        (tipo = 'Salida'  AND proyecto_id IS NOT NULL)
    )
);

CREATE TABLE IF NOT EXISTS proyecto_material (
    id SERIAL PRIMARY KEY,
    id_proyecto INTEGER NOT NULL,
    id_material INTEGER NOT NULL,
    ofertada INTEGER DEFAULT 0 CHECK (ofertada >= 0),
    en_obra INTEGER DEFAULT 0 CHECK (en_obra >= 0),
    reservado INTEGER DEFAULT 0 CHECK (reservado >= 0),
    FOREIGN KEY (id_proyecto) REFERENCES proyectos(id),
    FOREIGN KEY (id_material) REFERENCES materiales(id),
    UNIQUE (id_proyecto, id_material)
);

CREATE TABLE IF NOT EXISTS reportes (
    id SERIAL PRIMARY KEY,
    id_proyecto INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    avance INTEGER CHECK (avance >= 0 AND avance <= 100),
    actividades TEXT NOT NULL,
    problemas_obs TEXT NOT NULL,
    proximos_pasos TEXT NOT NULL,
    responsable_id INTEGER NOT NULL,
    FOREIGN KEY (id_proyecto) REFERENCES proyectos(id),
    FOREIGN KEY (responsable_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS reportes_fotos (
    id SERIAL PRIMARY KEY,
    id_reporte INTEGER NOT NULL,
    ruta_foto VARCHAR(500) NOT NULL,
    FOREIGN KEY (id_reporte) REFERENCES reportes(id)
);


-- ============================================
-- TRIGGER PARA CONTROL AUTOMÁTICO DE FECHA_FIN
-- ============================================

CREATE OR REPLACE FUNCTION actualizar_fecha_fin()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el proyecto pasa a Finalizado o Cancelado
    IF (NEW.estado IN ('Finalizado', 'Cancelado')) THEN
        -- Si el usuario intenta asignar una fecha manual diferente a la actual → error
        IF NEW.fecha_fin IS NOT NULL AND NEW.fecha_fin <> CURRENT_DATE THEN
            RAISE EXCEPTION 'No se puede asignar manualmente una fecha_fin distinta a la fecha actual cuando el proyecto está Finalizado o Cancelado.';
        END IF;

        -- Si no tiene fecha_fin, se asigna automáticamente la actual
        NEW.fecha_fin := CURRENT_DATE;

    -- Si el proyecto NO está Finalizado/Cancelado, aseguramos que no tenga fecha_fin
    ELSE
        IF NEW.fecha_fin IS NOT NULL THEN
            NEW.fecha_fin := NULL;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_fecha_fin
BEFORE INSERT OR UPDATE ON proyectos
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_fin();


CREATE OR REPLACE FUNCTION verificar_estado_proyecto_antes_de_asignar_material()
RETURNS TRIGGER AS $$
DECLARE
    v_estado_proyecto estado_proyecto_enum;
BEGIN
    SELECT estado INTO v_estado_proyecto FROM proyectos WHERE id = NEW.id_proyecto;
    IF v_estado_proyecto IN ('Finalizado', 'Cancelado') THEN
        RAISE EXCEPTION 'No se pueden asignar o modificar materiales para el proyecto ID % porque su estado es "%".', NEW.id_proyecto, v_estado_proyecto;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_estado_proyecto_on_material ON proyecto_material;
CREATE TRIGGER trg_validar_estado_proyecto_on_material
BEFORE INSERT OR UPDATE ON proyecto_material
FOR EACH ROW
EXECUTE FUNCTION verificar_estado_proyecto_antes_de_asignar_material();