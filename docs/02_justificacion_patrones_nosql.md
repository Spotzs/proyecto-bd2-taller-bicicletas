# Justificación Arquitectónica: Embeber vs. Referenciar y Patrones NoSQL
**Asignatura:** Bases de Datos 2 — Universidad Autónoma de Occidente (UAO)  
**Proyecto:** Sistema de Gestión de Servicios de Mantenimiento y Reparación de Bicicletas

---

## 1. Fundamentos Teóricos de Modelado en MongoDB

En el diseño de bases de datos documentales, la decisión entre **Embeber (Denormalización)** y **Referenciar (Normalización)** debe guiarse estrictamente por los **patrones de acceso (lectura/escritura)**, la **frecuencia de consulta** y la **cardinalidad de las relaciones**, en lugar de aplicar normalización relacional tradicional a ciegas.

---

## 2. Decisiones de Referenciación (Colecciones Normalizadas)

### 2.1. `usuarios` y `bicicletas`
- **Cardinalidad 1:N no acotada (Unbounded):** Un cliente regular del taller puede registrar múltiples bicicletas a lo largo de los años y conservar un historial de visitas extendido. Si embebiéramos las bicicletas o sus servicios dentro del documento del usuario, el tamaño del documento crecería sin límite conocido, con el riesgo latente de superar el límite de **16 MB por documento BSON** de MongoDB y provocando fragmentación de memoria en el motor WiredTiger.
- **Ciclo de vida independiente:** Un cliente existe antes de adquirir una bicicleta o llevarla al taller. Las bicicletas pueden transferirse o permanecer registradas independientemente de que se encuentren activamente en mantenimiento.
- **Acceso segregado:** La autenticación y gestión de roles (coordinadores, técnicos, clientes) se consultan de manera aislada al flujo del taller.

### 2.2. `catalogo_servicios`
- **Patrón de Datos Maestros (Read-Heavy):** El catálogo se consulta constantemente para mostrar listas desplegables al cliente o al coordinador al momento de agendar citas. Sus escrituras son casi nulas (solo cuando el taller añade un nuevo servicio o actualiza su tarifa de referencia).
- **Independencia tarifaria:** Permite modificar descripciones y sugerencias generales sin alterar directamente las órdenes que ya fueron pactadas con un precio específico.

### 2.3. `citas`
- **Ciclo de vida previo:** Muchas citas se solicitan, se reprograman o se cancelan sin llegar a convertirse en una orden de servicio física. Referenciar la cita respecto al cliente y a la bicicleta mantiene limpia la colección de órdenes y optimiza la consulta de la agenda diaria del coordinador.

---

## 3. Decisiones de Embeber (Subdocumentos y Arreglos)

### 3.1. Patrón Snapshot (Inmutabilidad Histórica en `ordenes_servicio`)
El requerimiento del proyecto establece expresamente:
> *"La información histórica deberá conservar las descripciones, características y precios aplicados en cada orden, aunque posteriormente cambie el catálogo."*

Para dar cumplimiento exacto a esta regla de negocio, la colección `ordenes_servicio` aplica el **Snapshot Pattern** embebiendo:
1. **Datos del Cliente:** `nombre`, `documento`, `telefono`, `correo` y `direccion` al momento de la orden. Si el cliente cambia de número telefónico meses después, la orden conserva el número con el que se le notificó en ese servicio.
2. **Datos de la Bicicleta:** `marca`, `modelo`, `tipo`, `color`, `numeroSerie`.
3. **Servicios y Repuestos en la Propuesta y Ejecución:** Se congelan las descripciones, cantidades y precios unitarios exactos acordados. Si la mano de obra del catálogo sube de \$55.000 a \$70.000 el mes entrante, el documento histórico no se recalcula ni se desvirtúa contablemente.

### 3.2. Localidad de Datos y Operaciones Atómicas (Single-Document Transactions)
En un taller de bicicletas, el flujo de trabajo de una orden requiere consultar y modificar concurrentemente:
- Las condiciones de recepción y fotos de ingreso.
- El diagnóstico y los hallazgos técnicos.
- La lista de trabajos propuestos y la aprobación/rechazo individual del cliente.
- El avance de la ejecución física y los repuestos gastados.
- El historial de cambios de estado cronológicos.
- La revisión técnica de control de calidad.

Al mantener todos estos elementos embebidos dentro del documento de la orden:
1. **Se eliminan los `$lookup` masivos (JOINs en red):** La vista detallada de la orden en el frontend o aplicación móvil se recupera en **una sola lectura de disco secuencial**, reduciendo la latencia de respuesta a menos de 5 ms.
2. **Garantía ACID nativa:** MongoDB asegura atomicidad a nivel de documento único. Cuando un cliente autoriza un trabajo o el técnico registra un cambio de estado con una observación, la actualización de múltiples subdocumentos ocurre de manera transaccional e indivisible sin requerir transacciones distribuidas de múltiples colecciones (multi-document transactions).
3. **Cardinalidad 1:N acotada (Bounded Arrays):** Una orden típica registra entre 1 y 10 hallazgos, 1 a 6 trabajos autorizados y 4 a 8 transiciones de estado. El tamaño final de una orden de servicio oscila entre 15 KB y 45 KB, representando menos del **0.3% del límite de 16 MB** de MongoDB.

### 3.3. Patrón Polimórfico en `bicicletas`
En el taller coexisten bicicletas convencionales de montaña y bicicletas eléctricas de pedaleo asistido:
- Las bicicletas de montaña demandan atributos de suspensión (recorrido, tipo de shock).
- Las bicicletas eléctricas requieren datos de motor (potencia, torque) y batería (capacidad, voltaje).

En lugar de crear tablas separadas o campos nulos generalizados como en SQL, se utiliza el **Polymorphic Pattern** embebiendo el subdocumento `especificacionesTipo`. La validación de esquemas de MongoDB permite validar la estructura común obligatoria y a la vez alojar atributos específicos según el valor del discriminador `tipo`.

---

## 4. Síntesis de Patrones NoSQL Empleados

```
+------------------------------------+---------------------------------------------------------------+
| Patrón NoSQL                       | Aplicación en el Proyecto                                     |
+------------------------------------+---------------------------------------------------------------+
| 1. Snapshot Pattern                | Embeber cliente, bicicleta y precios en ordenes_servicio     |
| 2. Polymorphic Pattern             | Subdocumento especificacionesTipo en bicicletas               |
| 3. Extended Reference Pattern      | cliente { usuarioId, nombre, ... } dentro de la orden         |
| 4. Bounded Embedded Array Pattern  | hallazgos, trabajos, historialEstados, garantias en la orden  |
| 5. Partial Filter Indexing Pattern | Garantizar regla de 1 orden activa y no solapamiento de citas |
+------------------------------------+---------------------------------------------------------------+
```
