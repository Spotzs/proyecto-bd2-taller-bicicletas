# Modelo Conceptual de la Base de Datos NoSQL
**Asignatura:** Bases de Datos 2 — Universidad Autónoma de Occidente (UAO)  
**Proyecto:** Sistema de Gestión de Servicios de Mantenimiento y Reparación de Bicicletas (Cali)  
**Conformidad:** 100% estricto con los requerimientos textuales del documento oficial del proyecto.

---

## 1. Alcance y Contexto del Dominio

El sistema centraliza y optimiza los procesos operativos de un taller especializado en Cali, transitando desde hojas de cálculo y registros en papel hacia una arquitectura orientada a documentos en **MongoDB**.

El modelo de datos cubre los siguientes ejes funcionales:
- **Gestión de Usuarios y Roles:** Clientes, técnicos, coordinadores y administradores.
- **Registro Polimórfico de Bicicletas:** Soporte para bicicletas urbanas, de ruta, de montaña y eléctricas con especificaciones técnicas especializadas.
- **Catálogo de Servicios:** Mantenimiento preventivo, frenos, transmisión, ruedas, suspensión y componentes eléctricos con precios y duraciones de referencia.
- **Agendamiento de Citas:** Gestión de disponibilidad con prevención de solapamientos horarios.
- **Órdenes de Servicio (Agregado Raíz):** Ciclo de vida completo desde la recepción física, diagnóstico técnico, propuesta con autorización granular por trabajo, ejecución, control de calidad en entrega, garantías y valoraciones del cliente.

---

## 2. Diagrama Entidad-Relación Conceptual NoSQL (Mermaid)

```mermaid
erDiagram
    USUARIOS ||--o{ BICICLETAS : "posee (1:N)"
    USUARIOS ||--o{ CITAS : "solicita (1:N)"
    BICICLETAS ||--o{ CITAS : "objeto_de (1:N)"
    CITAS o|--o| ORDENES_SERVICIO : "origina (0..1:1)"
    USUARIOS ||--o{ ORDENES_SERVICIO : "supervisa/ejecuta (1:N)"
    CATALOGO_SERVICIOS ||--o{ ORDENES_SERVICIO : "referencia_precio (1:N)"

    USUARIOS {
        ObjectId _id PK
        string nombreCompleto
        string documentoIdentificacion UK
        string correoElectronico UK
        string numeroTelefono
        string rol
        string direccion "Opcional / Clientes"
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
        object recepcion "Embebido"
        object diagnostico "Embebido con hallazgos y evidencias"
        object propuesta "Embebido con trabajos y aprobacion"
        object ejecucion "Embebido con repuestos utilizados"
        array historialCambiosEstado "Embebido cronológico"
        object revisionEntrega "Embebido checklist"
        object entrega "Embebido fecha y confirmación"
        array garantias "Embebido con solicitudes"
        object valoracion "Embebido feedback"
    }
```
