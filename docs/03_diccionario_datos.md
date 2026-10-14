# Diccionario de Datos del Sistema de Taller de Bicicletas
**Asignatura:** Bases de Datos 2 — Universidad Autónoma de Occidente (UAO)  
**Motor:** MongoDB v7.x / WiredTiger

---

## 1. Colección: `usuarios`
Almacena la información de los diferentes actores del sistema (clientes, técnicos, coordinadores y administradores).

| Campo | Tipo BSON | Requerido | Restricciones / Formato | Descripción |
|---|---|---|---|---|
| `_id` | ObjectId | Sí | Clave primaria autogenerada | Identificador único del usuario. |
| `nombre` | string | Sí | min: 3, max: 120 caracteres | Nombre completo del usuario. |
| `documento` | string | Sí | Regex: `^[0-9A-Za-z-]{5,20}$`, Único | Documento de identidad (cédula, pasaporte). |
| `correo` | string | Sí | Formato email estándar, Único | Dirección de correo electrónico de acceso y notificación. |
| `telefono` | string | Sí | Regex: `^[0-9+ ]{7,15}$` | Número telefónico de contacto. |
| `rol` | string | Sí | Enum: `["cliente", "tecnico", "coordinador", "administrador"]` | Rol operativo en la plataforma. |
| `direccion` | string | No (Obligatorio en negocio para clientes) | Texto libre | Dirección de residencia del cliente. |
| `fechaCreacion` | date | Sí | Fecha ISO | Fecha de registro en el sistema. |
| `activo` | bool | Sí | `true` o `false` | Indica si el usuario puede operar en el sistema. |

---

## 2. Colección: `bicicletas`
Contiene las bicicletas registradas por los clientes, con características técnicas comunes y polimórficas.

| Campo | Tipo BSON | Requerido | Restricciones / Formato | Descripción |
|---|---|---|---|---|
| `_id` | ObjectId | Sí | Clave primaria autogenerada | Identificador único de la bicicleta. |
| `propietarioId` | ObjectId | Sí | Referencia a `usuarios._id` | Identificador del cliente dueño de la bicicleta. |
| `marca` | string | Sí | min: 2, max: 60 caracteres | Marca del fabricante (ej. Trek, Specialized). |
| `modelo` | string | Sí | min: 1, max: 80 caracteres | Nombre del modelo comercial. |
| `tipo` | string | Sí | Enum: `["urbana", "ruta", "montaña", "eléctrica"]` | Tipo que gobierna las especificaciones polimórficas. |
| `color` | string | Sí | Texto libre | Color principal del marco. |
| `numeroSerie` | string / null | No | Sparse unique index | Serial grabado en el marco (opcional). |
| `caracteristicasComunes` | object | Sí | Subdocumento | Atributos mecánicos estándar de toda bicicleta. |
| `caracteristicasComunes.tamanoMarco` | string | Sí | ej: "S", "M", "L", "54cm" | Talla del cuadro. |
| `caracteristicasComunes.material` | string | Sí | ej: "Aluminio", "Carbono" | Material de aleación del marco. |
| `caracteristicasComunes.tamanoRueda` | string | Sí | ej: "29\"", "700c", "27.5\"" | Diámetro de rodado. |
| `caracteristicasComunes.tipoFrenos` | string | Sí | ej: "Disco Hidráulico", "V-Brake" | Sistema de frenado instalado. |
| `caracteristicasComunes.transmision` | string | Sí | ej: "Shimano Deore 1x12" | Grupo de cambios y velocidades. |
| `especificacionesTipo` | object | No | Subdocumento polimórfico | Atributos propios de montaña o eléctricas. |
| `especificacionesTipo.suspension` | string | Condicional (montaña) | Texto descriptivo | Modelo de suspensión o shock. |
| `especificacionesTipo.recorrido` | string | Condicional (montaña) | ej: "140mm" | Recorrido de suspensión delantera/trasera. |
| `especificacionesTipo.bateria` | string | Condicional (eléctrica) | ej: "Bosch 625Wh 36V" | Capacidad y especificaciones de batería. |
| `especificacionesTipo.motor` | string | Condicional (eléctrica) | ej: "Bosch Performance CX 250W" | Potencia y fabricante del motor. |
| `fechaRegistro` | date | Sí | Fecha ISO | Fecha en que se registró la bicicleta. |
| `activo` | bool | Sí | `true` o `false` | Indica si continúa en uso por el cliente. |

---

## 3. Colección: `catalogo_servicios`
Catálogo de referencia de servicios ofrecidos por el taller con costos y tiempos estimados.

| Campo | Tipo BSON | Requerido | Restricciones / Formato | Descripción |
|---|---|---|---|---|
| `_id` | ObjectId | Sí | Clave primaria | Identificador del servicio base. |
| `nombre` | string | Sí | min: 3, max: 100 caracteres | Título del servicio de taller. |
| `categoria` | string | Sí | Enum: `["mantenimiento preventivo", "frenos", "transmisión", "ruedas", "suspensión", "componentes eléctricos"]` | Categoría técnica. |
| `descripcion` | string | Sí | Texto detallado | Alcance e intervenciones contempladas. |
| `duracionEstimadaMinutos` | int | Sí | min: 15, max: 1440 | Tiempo estimado de taller en minutos. |
| `precioReferencia` | decimal | Sí | Decimal128 en COP | Tarifa base de mano de obra sugerida. |
| `tareasHabituales` | array[string] | Sí | minItems: 1 | Procedimientos específicos desarrollados. |
| `recomendaciones` | array[string] | No | Arreglo de strings | Consejos para el usuario y periodicidad sugerida. |
| `activo` | bool | Sí | `true` o `false` | Disponibilidad en el taller. |

---

## 4. Colección: `citas`
Registro de agendamiento y reserva de cupo para atención en taller.

| Campo | Tipo BSON | Requerido | Restricciones / Formato | Descripción |
|---|---|---|---|---|
| `_id` | ObjectId | Sí | Clave primaria | Identificador de la cita. |
| `clienteId` | ObjectId | Sí | Referencia a `usuarios._id` | Cliente que solicita la cita. |
| `bicicletaId` | ObjectId | Sí | Referencia a `bicicletas._id` | Bicicleta que ingresará. |
| `fechaHora` | date | Sí | Índice único parcial con `bicicletaId` | Fecha y hora reservada. |
| `motivo` | string | Sí | min: 5, max: 250 | Propósito de la visita al taller. |
| `problemasReportados` | string | No | Texto libre | Síntomas descritos por el ciclista. |
| `serviciosInteres` | array[string] | No | Arreglo de strings | Servicios del catálogo solicitados tentativamente. |
| `estado` | string | Sí | Enum: `["solicitada", "confirmada", "atendida", "cancelada"]` | Estado de la reserva. |
| `observaciones` | string | No | Texto libre | Observaciones del coordinador al agendar. |
| `coordinadorId` | ObjectId / null | No | Referencia a `usuarios._id` | Coordinador que procesó la cita. |
| `fechaCreacion` | date | Sí | Fecha ISO | Momento exacto de radicación de la cita. |

---

## 5. Colección: `ordenes_servicio`
Agregado raíz transaccional del sistema de taller. Almacena el ciclo de vida íntegro de la orden.

| Campo / Subcampo | Tipo BSON | Requerido | Restricciones | Descripción |
|---|---|---|---|---|
| `_id` | ObjectId | Sí | Clave primaria | Identificador interno de la orden. |
| `numeroOrden` | string | Sí | Regex: `^ORD-[0-9]{4}-[0-9]{5}$`, Único | Código visible de orden (ej: ORD-2026-00001). |
| `citaId` | ObjectId / null | No | Referencia opcional | Cita previa que originó la orden. |
| `cliente` | object | Sí | Snapshot Pattern | Copia inmutable de los datos del cliente al ingreso. |
| `cliente.usuarioId` | ObjectId | Sí | Referencia a `usuarios._id` | ID del cliente. |
| `cliente.nombre` | string | Sí | Texto | Nombre congelado. |
| `cliente.documento` | string | Sí | Texto | Cédula congelada. |
| `cliente.telefono` | string | Sí | Texto | Teléfono de contacto congelado. |
| `cliente.correo` | string | Sí | Email | Correo congelado. |
| `bicicleta` | object | Sí | Snapshot Pattern | Copia inmutable de la bicicleta al ingreso. |
| `bicicleta.bicicletaId` | ObjectId | Sí | Índice único parcial (1 orden activa) | ID de la bicicleta. |
| `bicicleta.marca` | string | Sí | Texto | Marca de la bicicleta. |
| `bicicleta.modelo` | string | Sí | Texto | Modelo de la bicicleta. |
| `bicicleta.tipo` | string | Sí | Enum | Tipo de bicicleta. |
| `coordinadorId` | ObjectId / null | No | Referencia a `usuarios._id` | Coordinador asignado a supervisión. |
| `tecnicosAsignados` | array[object] | No | Arreglo de técnicos | Técnicos asignados a diagnóstico y reparación. |
| `estado` | string | Sí | Enum: `["recibida", "en_diagnostico", "pendiente_autorizacion", "en_ejecucion", "lista_para_entrega", "entregada", "cancelada"]` | Estado operativo de la orden. |
| `recepcion` | object | Sí | Subdocumento | Información de ingreso físico al taller. |
| `recepcion.fechaRecepcion` | date | Sí | Fecha ISO | Momento de ingreso al taller. |
| `recepcion.fechaEstimadaEntrega` | date | No | Fecha ISO | Compromiso de entrega pactado con el cliente. |
| `recepcion.problemaReportado` | string | Sí | Texto | Falla descrita por el cliente. |
| `recepcion.condicionesObservadas` | string | Sí | Texto | Estado visual, suciedad, rayones preexistentes. |
| `recepcion.accesoriosEntregados` | array[string] | No | Arreglo de textos | Accesorios dejados (odómetro, luces, caramañola). |
| `recepcion.fotografias` | array[object] | No | Arreglo | Fotos de ingreso con nombre, descripción y URL. |
| `diagnostico` | object | No | Subdocumento | Informe técnico de evaluación. |
| `diagnostico.fechaDiagnostico` | date | No | Fecha ISO | Fecha en que el técnico evaluó la bicicleta. |
| `diagnostico.tecnicoResponsableId`| ObjectId | No | Referencia técnico | Identificador del evaluador. |
| `diagnostico.componentesRevisados`| array[string] | No | Arreglo | Lista de componentes auditados. |
| `diagnostico.hallazgos` | array[object] | No | Arreglo de hallazgos | Fallas detectadas con componente, descripción, prioridad y fotos. |
| `propuesta` | object | No | Subdocumento | Propuesta de intervención valorizada. |
| `propuesta.fechaPropuesta` | date | No | Fecha ISO | Fecha de generación de la cotización. |
| `propuesta.trabajos` | array[object] | No | Trabajos propuestos | Lista de intervenciones con costo de mano de obra y repuestos. |
| `propuesta.trabajos.estadoAutorizacion` | string | Sí (si hay trabajos) | Enum: `["pendiente", "autorizado", "rechazado"]` | Decisión individual del cliente por trabajo. |
| `propuesta.trabajos.decisionCliente` | object | No | Subdocumento | Fecha de decisión y comentarios del cliente. |
| `propuesta.valorTotalEstimado` | decimal | No | Decimal128 | Suma de trabajos autorizados estimados. |
| `ejecucion` | object | No | Subdocumento | Registro de trabajos efectivamente ejecutados. |
| `ejecucion.trabajosRealizados` | array[object] | No | Trabajos | Intervención física con fecha inicio, fin, responsable y repuestos reales. |
| `historialEstados` | array[object] | Sí (minItems: 1) | Arreglo de trazabilidad | Registro cronológico inalterable de cada transición de estado con usuario y observación. |
| `revisionEntrega` | object | No | Checklist de calidad | Puntos verificados, resultado booleano y aprobación previa a entrega. |
| `entregaConfirmada` | object | No | Subdocumento | Fecha y confirmación de recepción del cliente. |
| `garantias` | array[object] | No | Arreglo de garantías | Garantías vigentes por trabajo con registro de solicitudes de reclamo. |
| `valoracion` | object | No | Subdocumento | Calificación numérica (1 a 5), comentarios y sugerencias del cliente post-entrega. |
