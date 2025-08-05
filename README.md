# Backend ISoftware1

Este es el servicio backend para el proyecto ISoftware1. Provee una API RESTful para gestionar usuarios, proyectos y roles.

## Características

- Autenticación de usuarios (Registro, Login, Logout, Verificación de Token)
- Gestión de proyectos
- Control de acceso basado en roles (RBAC)

## Tech Stack

- **Node.js**: Entorno de ejecución de JavaScript
- **Express.js**: Framework web para Node.js
- **PostgreSQL**: Base de datos relacional
- **Jest**: Framework de testing
- **Supertest**: Librería de aserciones HTTP

## Cómo Empezar

### Prerrequisitos

- Node.js (v18 o superior recomendado)
- PostgreSQL

### Instalación

1.  Clona el repositorio:
    ```bash
    git clone https://github.com/DavidDominguez-11/Backend_ISoftware1.git
    cd Backend_ISoftware1
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Configura tus variables de entorno. Crea un archivo `.env` en la raíz del proyecto y añade las cadenas de conexión a la base de datos y los secretos necesarios.

### Ejecutar la Aplicación

```bash
npm start # O `npm run dev` si usas nodemon
```

### Ejecutar Pruebas

El proyecto incluye una suite de pruebas completa. Para más detalles, mira el [README de las pruebas](__tests__/README.md).

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo "watch"
npm run test:watch

# Generar un reporte de cobertura
npm run test:coverage
```