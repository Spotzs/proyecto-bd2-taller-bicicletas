# Modelo Conceptual de la Base de Datos NoSQL
**Asignatura:** Bases de Datos 2 — Universidad Autónoma de Occidente (UAO)  
**Proyecto:** Sistema de Gestión de Servicios de Mantenimiento y Reparación de Bicicletas (Cali)

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
        object diagnostico "Embebido con hallazgos y evidencias"
        object propuesta "Embebido con trabajos y aprobacion"
        object ejecucion "Embebido con repuestos utilizados"
        array historialEstados "Embebido de trazabilidad"
        object revisionEntrega "Embebido de checklist"
        object entregaConfirmada "Embebido"
        array garantias "Embebido con solicitudes"
        object valoracion "Embebido de feedback"
    }
```

---

## 3. Identificación de Entidades y Estrategia de Modelado

| Colección | Estrategia | Patrón de Diseño NoSQL | Justificación |
|---|---|---|---|
| `usuarios` | Colección Independiente (Referenciada) | Identity Pattern | Ciclo de vida propio; autenticación y perfiles compartidos a través de múltiples entidades. |
| `bicicletas` | Colección Independiente (Referenciada) | Polymorphic Pattern + Attribute Pattern | Una bicicleta trasciende cualquier orden de servicio particular. Polimorfismo según el tipo (montaña, eléctrica). |
| `catalogo_servicios` | Colección Independiente (Referenciada) | Reference Data Pattern | Datos maestros de consulta frecuente (Read-heavy) y actualización esporádica. |
| `citas` | Colección Independiente (Referenciada) | Event Sourcing / Scheduling | Puede existir sin orden asociada (ej. citas canceladas o reprogramadas). |
| `ordenes_servicio` | Agregado Raíz (Colección Principal) | Snapshot Pattern + Bounded Embedded Arrays | **Corazón del taller:** Agrupa recepción, diagnóstico, propuesta, ejecución, historial y garantías. Requiere transacciones de documento único (Single Document Transaction) e inmutabilidad de precios históricos. |

---

## 4. Matriz de Estados de la Orden de Servicio

```
 [recibida] ---> [en_diagnostico] ---> [pendiente_autorizacion]
                                                |
                        +-----------------------+-----------------------+
                        | (Cliente autoriza al menos un trabajo)        | (Cliente rechaza todo)
                        v                                               v
                 [en_ejecucion]                                   [cancelada]
                        |
                        v (Todos los trabajos autorizados finalizados + checklist aprobado)
              [lista_para_entrega]
                        |
                        v (Firma / confirmación de entrega)
                   [entregada] (Habilita valoración y garantías)
```
