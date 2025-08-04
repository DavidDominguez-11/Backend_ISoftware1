# Tests del Proyecto Backend

Este directorio contiene los tests unitarios y de integración para el proyecto backend.

## Estructura de Tests

### 1. `auth.test.js` - Tests de Autenticación
- **Propósito**: Probar las funcionalidades de registro y login de usuarios
- **Cubre**: 
  - Registro exitoso de usuarios
  - Validación de campos requeridos
  - Manejo de emails duplicados
  - Login exitoso
  - Manejo de usuarios inexistentes

### 2. `projects.test.js` - Tests de Proyectos
- **Propósito**: Probar las funcionalidades de gestión de proyectos
- **Cubre**:
  - Obtención de todos los proyectos
  - Manejo cuando no hay proyectos
  - Manejo de errores de base de datos

### 3. `app.test.js` - Tests de Configuración de la Aplicación
- **Propósito**: Probar la configuración general de Express.js
- **Cubre**:
  - Configuración de CORS
  - Procesamiento de JSON
  - Manejo de cookies
  - Configuración de rutas
  - Headers de seguridad

## Comandos para Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (útil durante desarrollo)
npm run test:watch

# Ejecutar tests con cobertura
npm run test:coverage
```

## Configuración

Los tests utilizan:
- **Jest**: Framework de testing
- **Supertest**: Para testing de APIs HTTP
- **Mocks**: Para simular la base de datos y evitar dependencias externas

## Variables de Entorno para Tests

Los tests utilizan variables de entorno específicas definidas en `jest.setup.js`:
- `NODE_ENV=test`
- Configuración de base de datos de prueba

## Cobertura

Los tests están diseñados para cubrir:
- ✅ Funcionalidades principales de autenticación
- ✅ Gestión de proyectos
- ✅ Configuración de la aplicación
- ✅ Manejo de errores
- ✅ Validaciones de entrada

## Notas Importantes

1. Los tests utilizan mocks para la base de datos para evitar dependencias externas
2. Cada test es independiente y limpia sus mocks antes de ejecutarse
3. Los tests están escritos en español para mantener consistencia con el proyecto 