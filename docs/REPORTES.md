# 📊 Sistema de Reportes - Backend ISoftware1

## 🎯 Descripción General

El sistema de reportes proporciona endpoints CRUD para generar reportes avanzados de materiales y proyectos con filtros dinámicos, paginación, validaciones y exportación a CSV.

## 🚀 Endpoints Disponibles

### Base URL: `/services/reportes`

---

## 📋 1. Reporte de Materiales

### `GET /materiales`

Obtiene reporte detallado de movimientos de materiales con filtros avanzados.

#### Query Parameters:

| Parámetro | Tipo | Descripción | Valores Válidos | Default |
|-----------|------|-------------|-----------------|---------|
| `fecha_inicio` | string | Fecha de inicio | YYYY-MM-DD | Todos |
| `fecha_fin` | string | Fecha de fin | YYYY-MM-DD | Todos |
| `material_ids` | string/array | ID(s) de materiales | Números enteros positivos | Todos |
| `tipo_movimiento` | string | Tipo de movimiento | entrada, salida, todos | todos |
| `proyecto_id` | string | ID del proyecto | Número entero positivo | Todos |
| `limit` | number | Registros por página | 1-1000 | 50 |
| `offset` | number | Desplazamiento | >= 0 | 0 |

#### Respuesta Exitosa (200):

```json
{
  "filtros_aplicados": {
    "fecha_inicio": "2024-01-01",
    "fecha_fin": "2024-01-31",
    "material_ids": "Todos",
    "tipo_movimiento": "entrada",
    "proyecto_id": "Todos"
  },
  "paginacion": {
    "total_registros": 150,
    "registros_mostrados": 50,
    "pagina_actual": 1,
    "total_paginas": 3,
    "limite_por_pagina": 50,
    "offset": 0
  },
  "estadisticas": {
    "entradas": 30,
    "salidas": 20,
    "materiales_unicos": 15,
    "proyectos_unicos": 8
  },
  "datos": [
    {
      "fecha": "2024-01-15T00:00:00.000Z",
      "codigo": "MAT001",
      "material": "Cemento Portland",
      "tipo_movimiento": "entrada",
      "cantidad": 50,
      "proyecto": "N/A",
      "nivel_stock": "Alto",
      "stock_actual": 200
    }
  ]
}
```

#### Errores de Validación (400):

```json
{
  "message": "Parámetros de consulta inválidos",
  "errors": [
    "fecha_inicio debe tener formato YYYY-MM-DD",
    "material_ids debe contener solo números enteros positivos"
  ]
}
```

---

## 🏗️ 2. Reporte de Proyectos

### `GET /proyectos`

Obtiene reporte detallado de proyectos con información de clientes y estadísticas.

#### Query Parameters:

| Parámetro | Tipo | Descripción | Valores Válidos | Default |
|-----------|------|-------------|-----------------|---------|
| `fecha_inicio` | string | Fecha de inicio del proyecto | YYYY-MM-DD | Todos |
| `fecha_fin` | string | Fecha de fin del proyecto | YYYY-MM-DD | Todos |
| `nombre_proyecto` | string | Búsqueda parcial en nombre | Texto | Todos |
| `cliente_id` | string | ID del cliente | Número entero positivo | Todos |
| `estado` | string | Estado del proyecto | solicitado, en_progreso, finalizado, cancelado, todos | todos |
| `tipo_servicio` | string | Tipo de servicio | regulares, irregulares, remodelaciones, jacuzzis, paneles solares, fuentes y cascadas, todos | todos |
| `limit` | number | Registros por página | 1-1000 | 50 |
| `offset` | number | Desplazamiento | >= 0 | 0 |

#### Respuesta Exitosa (200):

```json
{
  "filtros_aplicados": {
    "fecha_inicio": "Todos",
    "fecha_fin": "Todos",
    "nombre_proyecto": "Todos",
    "cliente_id": "Todos",
    "estado": "en_progreso",
    "tipo_servicio": "Todos"
  },
  "paginacion": {
    "total_registros": 25,
    "registros_mostrados": 25,
    "pagina_actual": 1,
    "total_paginas": 1,
    "limite_por_pagina": 50,
    "offset": 0
  },
  "estadisticas": {
    "por_estado": {
      "solicitado": 5,
      "en_progreso": 15,
      "finalizado": 3,
      "cancelado": 2
    },
    "presupuesto_total": 2500000,
    "clientes_unicos": 18,
    "tipos_servicio_unicos": 4
  },
  "datos": [
    {
      "id": 1,
      "nombre": "Construcción Piscina Residencial",
      "cliente": "Juan Pérez",
      "cliente_email": "juan@email.com",
      "cliente_telefono": "123456789",
      "estado": "en_progreso",
      "tipo_servicio": "regulares",
      "fecha_inicio": "2024-01-15T00:00:00.000Z",
      "fecha_fin": "2024-06-15T00:00:00.000Z",
      "presupuesto": 150000,
      "ubicacion": "Zona Norte",
      "materiales_count": 12
    }
  ]
}
```

---

## 📊 3. Reporte Resumen de Stock

### `GET /stock`

Obtiene resumen consolidado de niveles de stock de todos los materiales.

#### Query Parameters:

| Parámetro | Tipo | Descripción | Valores Válidos | Default |
|-----------|------|-------------|-----------------|---------|
| `nivel_stock` | string | Filtro por nivel | Alto, Medio, Bajo, Sin stock, todos | todos |

#### Respuesta Exitosa (200):

```json
{
  "filtros_aplicados": {
    "nivel_stock": "Bajo"
  },
  "estadisticas": {
    "total_materiales": 50,
    "sin_stock": 5,
    "stock_bajo": 8,
    "stock_medio": 15,
    "stock_alto": 22
  },
  "total_registros": 8,
  "datos": [
    {
      "id": 1,
      "codigo": "MAT001",
      "material": "Cemento Portland",
      "stock_bodega": 10,
      "reservado": 2,
      "disponible": 8,
      "ofertada_proyectos": 8,
      "nivel_stock": "Bajo"
    }
  ]
}
```

---

## 🎛️ 4. Filtros Disponibles

### `GET /filtros`

Obtiene todas las opciones disponibles para los filtros de reportes.

#### Respuesta Exitosa (200):

```json
{
  "materiales": [
    {
      "id": 1,
      "codigo": "MAT001", 
      "material": "Cemento Portland"
    }
  ],
  "clientes": [
    {
      "id": 1,
      "nombre": "Juan Pérez"
    }
  ],
  "proyectos": [
    {
      "id": 1,
      "nombre": "Construcción Piscina",
      "estado": "en_progreso"
    }
  ],
  "estados_proyecto": [
    "solicitado",
    "en_progreso", 
    "finalizado",
    "cancelado"
  ],
  "tipos_servicio": [
    "regulares",
    "irregulares",
    "remodelaciones",
    "jacuzzis",
    "paneles solares",
    "fuentes y cascadas"
  ],
  "tipos_movimiento": [
    "entrada",
    "salida"
  ]
}
```

---

## 📥 5. Exportar Reporte de Materiales (CSV)

### `GET /materiales/export/csv`

Exporta el reporte de materiales en formato CSV para descarga.

#### Query Parameters:
Mismos parámetros que `/materiales` (excepto limit/offset - exporta todo)

#### Respuesta Exitosa (200):
- **Content-Type**: `text/csv; charset=utf-8`
- **Content-Disposition**: `attachment; filename="reporte_materiales_2024-01-15T10-30-00.csv"`
- **Archivo CSV** con columnas: Fecha, Codigo, Material, Tipo Movimiento, Cantidad, Proyecto, Nivel Stock, Stock Actual

---

## 📈 6. Estadísticas Generales (Dashboard)

### `GET /estadisticas`

Obtiene métricas principales para dashboard ejecutivo.

#### Respuesta Exitosa (200):

```json
{
  "resumen": {
    "total_materiales": 156,
    "total_proyectos": 89,
    "total_clientes": 34,
    "proyectos_activos": 12,
    "materiales_stock_bajo": 8,
    "movimientos_ultimo_mes": 145,
    "presupuesto_proyectos_activos": 3250000
  },
  "movimientos_por_tipo": [
    {
      "tipo": "entrada",
      "cantidad_movimientos": 89,
      "total_cantidad": 2340
    },
    {
      "tipo": "salida", 
      "cantidad_movimientos": 56,
      "total_cantidad": 987
    }
  ],
  "proyectos_por_estado": [
    {
      "estado": "en_progreso",
      "cantidad": 12
    },
    {
      "estado": "solicitado",
      "cantidad": 8
    }
  ],
  "fecha_generacion": "2024-01-15T15:30:00.000Z"
}
```

---

## ⚠️ Códigos de Error

| Código | Descripción | Solución |
|--------|-------------|----------|
| `400` | Parámetros inválidos | Verificar formato de parámetros |
| `404` | Sin resultados | Cambiar filtros o verificar datos |
| `500` | Error del servidor | Verificar logs y conectividad BD |

---

## 🔧 Validaciones Implementadas

### Fechas
- Formato requerido: `YYYY-MM-DD`
- `fecha_inicio` no puede ser mayor que `fecha_fin`
- Fechas inválidas retornan error 400

### Paginación
- `limit`: entre 1 y 1000 (default: 50)
- `offset`: >= 0 (default: 0)
- Metadatos de paginación incluidos en respuesta

### IDs
- Deben ser números enteros positivos
- Se valida existencia en base de datos para relaciones

### Enums
- Estados de proyecto validados contra valores permitidos
- Tipos de servicio validados contra catálogo
- Tipos de movimiento: solo 'entrada' y 'salida'

---

## 📊 Funcionalidades Destacadas

### ✅ **Filtrado Dinámico**
- Combinación flexible de múltiples filtros
- Búsqueda de texto insensible a mayúsculas
- Filtros por rangos de fecha con timestamps precisos

### ✅ **Paginación Inteligente**
- Metadatos completos de navegación
- Límites configurables con validación
- Conteo total eficiente

### ✅ **Cálculo de Stock en Tiempo Real**
- Agregaciones optimizadas con Prisma
- Niveles de stock dinámicos (Alto/Medio/Bajo/Sin stock)
- Consideración de stock reservado vs disponible

### ✅ **Estadísticas Avanzadas**
- Métricas por tipo, estado, cliente
- Agregaciones de presupuestos
- Contadores de entidades únicas

### ✅ **Exportación de Datos**
- Formato CSV estándar con BOM UTF-8
- Nombres de archivo con timestamp
- Escape de caracteres especiales

### ✅ **Performance Optimizado**
- Queries paralelos con Promise.all
- Includes selectivos para reducir transferencia
- Agregaciones a nivel de base de datos

---

## 🧪 Testing

El sistema incluye tests completos que cubren:
- ✅ Funcionalidad de todos los endpoints
- ✅ Validación de parámetros
- ✅ Manejo de errores
- ✅ Paginación y filtros
- ✅ Mocks de Prisma para tests aislados

Para ejecutar tests:
```bash
npm test reportes.test.js
```

---

## 🚀 Próximas Mejoras

- [ ] Cache de reportes frecuentes
- [ ] Exportación a PDF y Excel
- [ ] Reportes programados
- [ ] Gráficos y visualizaciones
- [ ] API rate limiting
- [ ] Filtros guardados por usuario

---

**Versión**: 1.0.0  
**Fecha**: Enero 2024  
**Autor**: Equipo Backend ISoftware1