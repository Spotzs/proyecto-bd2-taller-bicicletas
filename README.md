# Sistema de Gestión de Servicios de Mantenimiento y Reparación de Bicicletas

![MongoDB](https://img.shields.io/badge/MongoDB-v7.0+-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Hackolade](https://img.shields.io/badge/Hackolade-v8.3+-007ACC?style=for-the-badge&logo=hackolade&logoColor=white)
![UAO](https://img.shields.io/badge/UAO-Bases_de_Datos_2-C8102E?style=for-the-badge)
![Status](https://img.shields.io/badge/Entrega_1-100%25_Fiel_al_PDF-brightgreen?style=for-the-badge)

**Universidad Autónoma de Occidente (UAO)**  
**Facultad de Ingeniería y Ciencias Básicas**  
**Programa:** Ingeniería Informática  
**Asignatura:** Bases de Datos 2  
**Hito:** Entrega 1 — Modelado de documentos de la BD del proyecto y su esquema de documentos  
**Fecha:** 15 de Octubre de 2026  

---

## 📋 Tabla de Contenidos
1. [Descripción General del Proyecto](#-descripción-general-del-proyecto)
2. [Arquitectura y Modelo Conceptual de Documentos](#-arquitectura-y-modelo-conceptual-de-documentos)
3. [Auditoría de Campos: 100% Fiel al PDF](#-auditoría-de-campos-100-fiel-al-pdf)
4. [Justificación Técnica: Embeber vs. Referenciar](#-justificación-técnica-embeber-vs-referenciar)
5. [Patrones de Diseño NoSQL Implementados](#-patrones-de-diseño-nosql-implementados)
6. [Estructura y Colecciones de la Base de Datos](#-estructura-y-colecciones-de-la-base-de-datos)
7. [Validación de Esquemas ($jsonSchema)](#-validación-de-esquemas-jsonschema)
8. [Reglas de Negocio e Integridad en MongoDB](#-reglas-de-negocio-e-integridad-en-mongodb)
9. [Estructura del Repositorio](#-estructura-del-repositorio)
10. [Instrucciones de Despliegue e Importación en Hackolade](#-instrucciones-de-despliegue-e-importación-en-hackolade)

---

## 🚲 Descripción General del Proyecto

En una zona urbana del municipio de Cali opera un taller especializado en servicios de mantenimiento y reparación para bicicletas urbanas, de ruta, de montaña y eléctricas. Actualmente, el taller coordina sus operaciones mediante hojas de cálculo y registros en papel, lo que genera dispersión de diagnósticos, demoras en el agendamiento y descontrol en la trazabilidad de los trabajos ejecutados.

Este proyecto digitaliza y centraliza la operación del taller mediante una base de datos documental en **MongoDB**, aplicando un **esquema moderado** que garantiza rigurosidad técnica, integridad de datos, inmutabilidad de precios históricos y flexibilidad para incorporar futuros requerimientos.

---

## 🔍 Auditoría de Campos: 100% Fiel al PDF

El modelo fue auditado minuciosamente párrafo por párrafo contra el documento oficial del proyecto para garantizar que **no contenga ningún campo ajeno o inventado**, preservando exactamente la semántica y los requerimientos del docente:

| Colección | Campos Permitidos por el PDF | Justificación Textual en el PDF |
|---|---|---|
| `usuarios` | `nombreCompleto`, `documentoIdentificacion`, `correoElectronico`, `numeroTelefono`, `rol`, `direccion` (clientes). | *"Cada usuario deberá registrar nombre completo, documento de identificación, correo electrónico y número de teléfono. Los clientes también podrán registrar su dirección."* |
| `bicicletas` | `propietarioId`, `marca`, `modelo`, `tipo`, `color`, `numeroSerie`, `caracteristicasComunes` (`tamanoMarco`, `material`, `tamanoRueda`, `tipoFrenos`, `transmision`), `especificacionesTipo` (`suspension`, `recorrido` para montaña; `bateria`, `motor` para eléctrica). | *"Cada bicicleta deberá incluir un identificador único, propietario, marca, modelo, tipo, color y número de serie cuando esté disponible... características comunes... y variables según el tipo."* |
| `catalogo_servicios` | `nombre`, `categoria`, `descripcion`, `duracionEstimada`, `precioReferencia`, `tareasHabituales`, `recomendaciones`. | *"El taller contará con un catálogo de servicios que incluirá identificador, nombre, categoría, descripción, duración estimada y precio de referencia... tareas habituales y recomendaciones generales."* |
| `citas` | `clienteId`, `bicicletaId`, `fecha`, `hora`, `motivo`, `problemasObservados`, `serviciosInteres`, `estado`, `observacionCambio`, `coordinadorId`. | *"Las citas deberán registrar identificador, cliente, bicicleta, fecha, hora, motivo de la visita y estado... problemas observados e indicar los servicios de su interés... observación sobre el cambio."* |
| `ordenes_servicio` | `citaId`, `cliente`, `bicicleta`, `fechaRecepcion`, `fechaEstimadaEntrega`, `coordinadorResponsable`, `tecnicosAsignados`, `estado`, `recepcion`, `diagnostico`, `propuesta`, `ejecucion`, `historialCambiosEstado`, `revisionEntrega`, `entrega`, `garantias`, `valoracion`. | *"Cada orden de servicio deberá incluir un identificador único, cliente, bicicleta, fecha de recepción, fecha estimada de entrega, coordinador responsable, técnicos asignados y estado... problema reportado, condiciones observadas, accesorios entregados y fotografías..."* |

---

## 🏛 Arquitectura y Modelo Conceptual de Documentos

```mermaid
erDiagram
    USUARIOS ||--o{ BICICLETAS : "registra y posee (1:N)"
    USUARIOS ||--o{ CITAS : "agenda (1:N)"
    BICICLETAS ||--o{ CITAS : "objeto_de (1:N)"
    CITAS o|--o| ORDENES_SERVICIO : "origina (0..1:1)"
    USUARIOS ||--o{ ORDENES_SERVICIO : "supervisa/ejecuta (1:N)"
    CATALOGO_SERVICIOS ||--o{ ORDENES_SERVICIO : "referencia_tarifa (1:N)"

    USUARIOS {
        ObjectId _id PK
        string nombreCompleto
        string documentoIdentificacion UK
        string correoElectronico UK
        string numeroTelefono
        string rol
        string direccion "Solo clientes"
    }

    BICICLETAS {
        ObjectId _id PK
        ObjectId propietarioId FK
        string marca
        string modelo
        string tipo
        string color
        string numeroSerie UK_sparse
        object caracteristicasComunes
        object especificacionesTipo
    }

    CATALOGO_SERVICIOS {
        ObjectId _id PK
        string nombre
        string categoria
        string descripcion
        string duracionEstimada
        decimal precioReferencia
        array tareasHabituales
        array recomendaciones
    }

    CITAS {
        ObjectId _id PK
        ObjectId clienteId FK
        ObjectId bicicletaId FK
        string fecha
        string hora
        string motivo
        string problemasObservados
        array serviciosInteres
        string estado
        string observacionCambio
        ObjectId coordinadorId FK
    }

    ORDENES_SERVICIO {
        ObjectId _id PK
        ObjectId citaId FK
        object cliente "Snapshot inmutable"
        object bicicleta "Snapshot inmutable"
        date fechaRecepcion
        date fechaEstimadaEntrega
        object coordinadorResponsable
        array tecnicosAsignados
        string estado
        object recepcion "Problema, condiciones, accesorios, fotos"
        object diagnostico "Componentes, condición, hallazgos, recomendaciones"
        object propuesta "Trabajos, repuestos, autorizacionCliente"
        object ejecucion "Trabajos realizados y repuestos utilizados"
        array historialCambiosEstado "Fecha, usuarioResponsable, observación"
        object revisionEntrega "Puntos, resultado, recomendaciones, aprobada"
        object entrega "Fecha y confirmacionRecepcionCliente"
        array garantias "Duración, condiciones, exclusiones y solicitudes"
        object valoracion "Calificación numérica, comentarios, sugerencias"
    }
```

---

## ⚖ Justificación Técnica: Embeber vs. Referenciar

| Relación | Decisión | Fundamento Arquitectónico |
|---|---|---|
| `Usuario` ➔ `Bicicletas` | **Referenciar** | Relación 1:N no acotada (un cliente regular puede poseer varias bicicletas a través de los años). |
| `Bicicleta` ➔ `Citas` | **Referenciar** | Cardinalidad abierta. Las citas tienen un ciclo de vida previo a la orden y muchas no se concretan en servicios físicos. |
| `Orden` ➔ `Cliente` | **Embeber (Snapshot)** | Conservar la foto exacta del cliente (nombre, teléfono, correo) al momento de recibir la bicicleta. Si el cliente actualiza su teléfono más tarde, la orden histórica conserva el canal real de contacto usado en esa atención. |
| `Orden` ➔ `Bicicleta` | **Embeber (Snapshot)** | Congela las especificaciones y características físicas de la bicicleta al entrar al taller. |
| `Orden` ➔ `Diagnóstico / Hallazgos` | **Embeber** | Cardinalidad 1:N acotada (1 a 10 hallazgos por bicicleta). Permite recuperar la hoja de diagnóstico en una única lectura de disco I/O. |
| `Orden` ➔ `Propuesta de Trabajos` | **Embeber** | Permite registrar la aprobación/rechazo individualizada por ítem de forma transaccional a nivel de documento único (Single Document Transaction). |
| `Orden` ➔ `Ejecución y Repuestos` | **Embeber** | **Inmutabilidad de precios históricos:** Se registran las cantidades y precios unitarios exactos cobrados en esa fecha, aislando la orden de variaciones futuras en el catálogo. |
| `Orden` ➔ `Historial de Cambios de Estado` | **Embeber** | Trazabilidad inalterable de cambios de estado en un arreglo acotado (máximo 8 transiciones). |

---

## 🛡 Validación de Esquemas ($jsonSchema)

Todos los esquemas de validación se encuentran implementados con nivel `strict` y acción `error` en el script:
[`scripts/01_schema_validation.js`](scripts/01_schema_validation.js)

---

## 🔒 Reglas de Negocio e Integridad en MongoDB

### Regla 1: Máximo una orden activa por bicicleta simultáneamente
```javascript
db.ordenes_servicio.createIndex(
  { "bicicleta.bicicletaId": 1 },
  {
    unique: true,
    partialFilterExpression: {
      estado: {
        $in: [
          "recibida",
          "en diagnóstico",
          "pendiente de autorización",
          "en ejecución",
          "lista para entrega"
        ]
      }
    },
    name: "idx_bicicleta_orden_activa_unica"
  }
);
```

### Regla 2: Impedir citas activas duplicadas en el mismo horario
```javascript
db.citas.createIndex(
  { bicicletaId: 1, fecha: 1, hora: 1 },
  {
    unique: true,
    partialFilterExpression: {
      estado: { $in: ["solicitada", "confirmada"] }
    },
    name: "idx_citas_bicicleta_horario_activo_unico"
  }
);
```

---

## 📁 Estructura del Repositorio

```
proyecto-bd2-taller-bicicletas/
├── README.md                              # Documentación general y técnica de la Entrega 1
├── model/
│   ├── ProyectoBD.hck.json                # Proyecto nativo para Hackolade (File > Open)
│   ├── schemas/                           # Esquemas individuales para Reverse Engineer > JSON Schema
│   │   ├── usuarios.schema.json
│   │   ├── bicicletas.schema.json
│   │   ├── catalogo_servicios.schema.json
│   │   ├── citas.schema.json
│   │   └── ordenes_servicio.schema.json
│   └── samples/                           # Documentos individuales para Reverse Engineer > JSON files
│       ├── usuarios.sample.json
│       ├── bicicletas.sample.json
│       ├── catalogo_servicios.sample.json
│       ├── citas.sample.json
│       └── ordenes_servicio.sample.json
├── docs/
│   ├── 01_modelo_conceptual.md            # Diagramas Mermaid y definición conceptual
│   ├── 02_justificacion_patrones_nosql.md # Sustento de Embeber vs. Referenciar y patrones NoSQL
│   └── 03_diccionario_datos.md            # Diccionario completo de campos según el PDF
└── scripts/
    ├── 01_schema_validation.js            # Creación de colecciones con $jsonSchema estricto
    ├── 02_indexes.js                      # Creación de índices y reglas de negocio parciales
    └── 03_seed_data.js                    # Datos de prueba realistas fieles al PDF
```

---

## 🚀 Instrucciones de Despliegue e Importación en Hackolade

### Opción A: Abrir el Modelo Completo en Hackolade
1. Abrir **Hackolade**.
2. Ir a `File` ➔ `Open`.
3. Seleccionar el archivo [`model/ProyectoBD.hck.json`](model/ProyectoBD.hck.json).
4. El diagrama ERD cargará automáticamente con las 5 colecciones completas y sus relaciones.

### Opción B: Importar Colección por Colección con Reverse Engineer
1. Ir a `Tools` ➔ `Reverse Engineer`.
2. Seleccionar **from JSON Schema** (o **from JSON files**).
3. Seleccionar los archivos de la carpeta [`model/schemas/`](model/schemas/) (o [`model/samples/`](model/samples/)) uno por uno para crear cada colección individualmente.
