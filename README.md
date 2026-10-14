# Sistema de Gestión de Servicios de Mantenimiento y Reparación de Bicicletas

![MongoDB](https://img.shields.io/badge/MongoDB-v7.0+-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Hackolade](https://img.shields.io/badge/Hackolade-v8.3+-007ACC?style=for-the-badge&logo=hackolade&logoColor=white)
![UAO](https://img.shields.io/badge/UAO-Bases_de_Datos_2-C8102E?style=for-the-badge)
![Status](https://img.shields.io/badge/Entrega_1-Completa-brightgreen?style=for-the-badge)

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
3. [Justificación Técnica: Embeber vs. Referenciar](#-justificación-técnica-embeber-vs-referenciar)
4. [Patrones de Diseño NoSQL Implementados](#-patrones-de-diseño-nosql-implementados)
5. [Estructura y Colecciones de la Base de Datos](#-estructura-y-colecciones-de-la-base-de-datos)
6. [Validación de Esquemas ($jsonSchema)](#-validación-de-esquemas-jsonschema)
7. [Reglas de Negocio e Integridad en MongoDB](#-reglas-de-negocio-e-integridad-en-mongodb)
8. [Estructura del Repositorio](#-estructura-del-repositorio)
9. [Instrucciones de Despliegue y Ejecución](#-instrucciones-de-despliegue-y-ejecución)

---

## 🚲 Descripción General del Proyecto

En una zona urbana del municipio de Cali opera un taller especializado en servicios de mantenimiento y reparación para bicicletas urbanas, de ruta, de montaña y eléctricas. Actualmente, el taller coordina sus operaciones mediante hojas de cálculo y registros en papel, lo que genera dispersión de diagnósticos, demoras en el agendamiento y descontrol en la trazabilidad de los trabajos ejecutados.

Este proyecto digitaliza y centraliza la operación del taller mediante una base de datos documental en **MongoDB**, aplicando un **esquema moderado** que garantiza rigurosidad técnica, integridad de datos, inmutabilidad de precios históricos y flexibilidad para incorporar futuros requerimientos.

---

## 🏛 Arquitectura y Modelo Conceptual de Documentos

El diseño adopta un enfoque orientado al agregado donde la orden de servicio actúa como núcleo transaccional, respaldado por colecciones de soporte para clientes, inventario de bicicletas y catálogo de servicios maestros.

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
        string nombre
        string documento UK
        string correo UK
        string telefono
        string rol
        string direccion
        date fechaCreacion
        bool activo
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
        date fechaRegistro
        bool activo
    }

    CATALOGO_SERVICIOS {
        ObjectId _id PK
        string nombre
        string categoria
        string descripcion
        int duracionEstimadaMinutos
        decimal precioReferencia
        array tareasHabituales
        array recomendaciones
        bool activo
    }

    CITAS {
        ObjectId _id PK
        ObjectId clienteId FK
        ObjectId bicicletaId FK
        date fechaHora
        string motivo
        string problemasReportados
        array serviciosInteres
        string estado
        string observaciones
        ObjectId coordinadorId FK
        date fechaCreacion
    }

    ORDENES_SERVICIO {
        ObjectId _id PK
        string numeroOrden UK
        ObjectId citaId FK
        object cliente "Snapshot inmutable"
        object bicicleta "Snapshot inmutable"
        ObjectId coordinadorId FK
        array tecnicosAsignados
        string estado
        object recepcion "Embebido"
        object diagnostico "Embebido con hallazgos"
        object propuesta "Embebido con trabajos y aprobaciones"
        object ejecucion "Embebido con repuestos utilizados"
        array historialEstados "Embebido cronológico"
        object revisionEntrega "Embebido checklist"
        object entregaConfirmada "Embebido"
        array garantias "Embebido con solicitudes"
        object valoracion "Embebido feedback"
    }
```

---

## ⚖ Justificación Técnica: Embeber vs. Referenciar

La decisión entre normalización y desnormalización se fundamenta en los patrones de lectura y escritura del taller:

| Relación | Decisión | Fundamento Arquitectónico |
|---|---|---|
| `Usuario` ➔ `Bicicletas` | **Referenciar** | Relación 1:N no acotada (un cliente regular puede poseer varias bicicletas a través de los años). Embeber causaría crecimiento descontrolado del documento del usuario. |
| `Bicicleta` ➔ `Citas` | **Referenciar** | Cardinalidad abierta. Las citas tienen un ciclo de vida previo a la orden y muchas no se concretan en servicios físicos. |
| `Orden` ➔ `Cliente` | **Embeber (Snapshot)** | Conservar la foto exacta del cliente (nombre, teléfono, correo) al momento de recibir la bicicleta. Si el cliente actualiza su teléfono más tarde, la orden histórica conserva el canal real de contacto usado en esa atención. |
| `Orden` ➔ `Bicicleta` | **Embeber (Snapshot)** | Congela las especificaciones y características físicas de la bicicleta al entrar al taller. |
| `Orden` ➔ `Diagnóstico / Hallazgos` | **Embeber** | Cardinalidad 1:N acotada (1 a 10 hallazgos por bicicleta). Permite recuperar la hoja de diagnóstico en una única lectura de disco I/O. |
| `Orden` ➔ `Propuesta de Trabajos` | **Embeber** | Permite registrar la aprobación/rechazo individualizada por ítem de forma transaccional a nivel de documento único (Single Document Transaction). |
| `Orden` ➔ `Ejecución y Repuestos` | **Embeber** | **Inmutabilidad de precios históricos:** Se registran las cantidades y precios unitarios exactos cobrados en esa fecha, aislando la orden de variaciones futuras en el catálogo. |
| `Orden` ➔ `Historial de Estados` | **Embeber** | Trazabilidad inalterable de cambios de estado (recibida, diagnóstico, ejecución, entrega) en un arreglo acotado (máximo 8 transiciones). |

---

## 🧩 Patrones de Diseño NoSQL Implementados

1. **Snapshot Pattern:** Empleado en `ordenes_servicio` para congelar información de clientes, bicicletas y precios unitarios de repuestos y mano de obra.
2. **Polymorphic Pattern:** Implementado en `bicicletas` en el subdocumento `especificacionesTipo` para almacenar suspensión y recorrido en bicicletas de montaña, o motor y batería en bicicletas eléctricas, compartiendo un esquema común obligatorio.
3. **Extended Reference Pattern:** Almacena el `usuarioId` y copia de los campos más consultados (`nombre`, `documento`, `telefono`) evitando operaciones `$lookup` recurrentes.
4. **Bounded Embedded Array Pattern:** Utilizado en `hallazgos`, `trabajos`, `historialEstados`, `revisionEntrega.puntosVerificados` y `garantias`.
5. **Partial Filter Unique Indexing Pattern:** Asegura las reglas críticas de negocio en la capa de datos: máximo una orden activa por bicicleta y prevención de citas duplicadas en el mismo horario.

---

## 🗄 Estructura y Colecciones de la Base de Datos

El sistema está conformado por **5 colecciones principales**:

1. **`usuarios`**: Gestión de accesos con 4 roles (`cliente`, `tecnico`, `coordinador`, `administrador`).
2. **`bicicletas`**: Registro de equipos con atributos comunes y polimorfismo según modalidad.
3. **`catalogo_servicios`**: Servicios estandarizados de taller con duraciones estimadas y tarifas sugeridas.
4. **`citas`**: Agenda de recepción con control anti-solapamiento.
5. **`ordenes_servicio`**: Documento transaccional de ciclo de vida completo (recepción, diagnóstico, cotización, ejecución, control de calidad, entrega, garantías y valoración).

---

## 🛡 Validación de Esquemas ($jsonSchema)

Todos los esquemas de validación se encuentran implementados con nivel `strict` y acción `error` en el script:
[`scripts/01_schema_validation.js`](scripts/01_schema_validation.js)

### Ejemplo: Validación Polimórfica en `bicicletas`
```javascript
db.createCollection("bicicletas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["propietarioId", "marca", "modelo", "tipo", "color", "caracteristicasComunes", "fechaRegistro"],
      properties: {
        tipo: { enum: ["urbana", "ruta", "montaña", "eléctrica"] },
        caracteristicasComunes: {
          bsonType: "object",
          required: ["tamanoMarco", "material", "tamanoRueda", "tipoFrenos", "transmision"]
        },
        especificacionesTipo: {
          bsonType: "object",
          properties: {
            suspension: { bsonType: "string" },
            recorrido: { bsonType: "string" },
            bateria: { bsonType: "string" },
            motor: { bsonType: "string" }
          }
        }
      }
    }
  }
});
```

---

## 🔒 Reglas de Negocio e Integridad en MongoDB

Las dos reglas más críticas del taller se resuelven a nivel de motor de base de datos mediante índices únicos parciales:

### Regla 1: Máximo una orden activa por bicicleta simultáneamente
Una bicicleta puede tener múltiples órdenes a lo largo de los meses, pero ninguna puede tener dos órdenes simultáneas en proceso:
```javascript
db.ordenes_servicio.createIndex(
  { "bicicleta.bicicletaId": 1 },
  {
    unique: true,
    partialFilterExpression: {
      estado: {
        $in: ["recibida", "en_diagnostico", "pendiente_autorizacion", "en_ejecucion", "lista_para_entrega"]
      }
    },
    name: "idx_bicicleta_orden_activa_unica"
  }
);
```

### Regla 2: Impedir citas activas duplicadas en el mismo horario
Evita colisiones de agendamiento para una misma bicicleta:
```javascript
db.citas.createIndex(
  { bicicletaId: 1, fechaHora: 1 },
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
│   └── ProyectoBD.hck.json                # Modelo ERD y esquemas completos para Hackolade v8.3+
├── docs/
│   ├── 01_modelo_conceptual.md            # Diagramas Mermaid y definición conceptual
│   ├── 02_justificacion_patrones_nosql.md # Sustento de Embeber vs. Referenciar y patrones NoSQL
│   └── 03_diccionario_datos.md            # Diccionario completo de campos, tipos BSON y restricciones
└── scripts/
    ├── 01_schema_validation.js            # Creación de colecciones con $jsonSchema estricto
    ├── 02_indexes.js                      # Creación de índices y reglas de negocio parciales
    ├── 03_seed_data.js                    # Datos de prueba realistas para verificación inmediata
    └── update_hackolade_model.js          # Utilidad Node.js para sincronización con Hackolade
```

---

## 🚀 Instrucciones de Despliegue y Ejecución

### 1. Visualización del Modelo en Hackolade
1. Abrir **Hackolade**.
2. Seleccionar `File` ➔ `Open` y cargar el archivo [`model/ProyectoBD.hck.json`](model/ProyectoBD.hck.json).
3. Podrá visualizar el diagrama de entidades, las 5 colecciones completas y sus propiedades anidadas.

### 2. Ejecución en MongoDB (mongosh o MongoDB Compass)
Conectarse a una instancia local o cluster de MongoDB Atlas:

```bash
# 1. Crear las colecciones con Schema Validation
mongosh "mongodb://localhost:27017" scripts/01_schema_validation.js

# 2. Aplicar los índices y restricciones de negocio
mongosh "mongodb://localhost:27017" scripts/02_indexes.js

# 3. Poblar la base de datos con datos de prueba
mongosh "mongodb://localhost:27017" scripts/03_seed_data.js
```
