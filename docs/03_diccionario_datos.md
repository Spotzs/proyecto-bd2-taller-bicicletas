# Diccionario de Datos del Sistema de Taller de Bicicletas
**Asignatura:** Bases de Datos 2 — Universidad Autónoma de Occidente (UAO)  
**Conformidad:** 100% estricto con los requerimientos textuales del documento oficial del proyecto.

---

## 1. Colección: `usuarios`
> *"Cada usuario deberá registrar nombre completo, documento de identificación, correo electrónico y número de teléfono. Los clientes también podrán registrar su dirección."*  
> *"Los usuarios podrán tener uno de cuatro roles: cliente, técnico y coordinador."*

| Campo | Tipo BSON | Requerido | Descripción según el PDF |
|---|---|---|---|
| `_id` | ObjectId | Sí | Identificador único del usuario. |
| `nombreCompleto` | string | Sí | Nombre completo del usuario. |
| `documentoIdentificacion` | string | Sí | Documento de identificación único. |
| `correoElectronico` | string | Sí | Correo electrónico de contacto y notificación. |
| `numeroTelefono` | string | Sí | Número de teléfono de contacto. |
| `rol` | string | Sí | Uno de los cuatro roles (`cliente`, `tecnico`, `coordinador`, `administrador`). |
| `direccion` | string | Condicional | Dirección registrada por los clientes. |

---

## 2. Colección: `bicicletas`
> *"Cada bicicleta deberá incluir un identificador único, propietario, marca, modelo, tipo, color y número de serie cuando esté disponible. También deberá registrar sus características técnicas, las cuales podrán variar según el tipo de bicicleta. Por ejemplo, una bicicleta de montaña podrá incluir información sobre suspensión y recorrido, mientras que una eléctrica podrá incorporar datos de batería y motor. Entre las características comunes podrán encontrarse tamaño del marco, material, tamaño de rueda, tipo de frenos y transmisión."*

| Campo | Tipo BSON | Requerido | Descripción según el PDF |
|---|---|---|---|
| `_id` | ObjectId | Sí | Identificador único de la bicicleta. |
| `propietarioId` | ObjectId | Sí | Propietario (referencia al cliente). |
| `marca` | string | Sí | Marca del fabricante. |
| `modelo` | string | Sí | Modelo comercial de la bicicleta. |
| `tipo` | string | Sí | Tipo de bicicleta (`urbana`, `ruta`, `montaña`, `eléctrica`). |
| `color` | string | Sí | Color de la bicicleta. |
| `numeroSerie` | string / null | No | Número de serie cuando esté disponible (opcional). |
| `caracteristicasComunes` | object | Sí | Subdocumento de características mecánicas comunes. |
| `caracteristicasComunes.tamanoMarco` | string | Sí | Tamaño del marco. |
| `caracteristicasComunes.material` | string | Sí | Material de construcción del marco. |
| `caracteristicasComunes.tamanoRueda` | string | Sí | Tamaño de rueda. |
| `caracteristicasComunes.tipoFrenos` | string | Sí | Tipo de frenos instalados. |
| `caracteristicasComunes.transmision` | string | Sí | Transmisión y cambios. |
| `especificacionesTipo` | object | No | Características técnicas que varían según el tipo. |
| `especificacionesTipo.suspension` | string | Condicional (montaña) | Suspensión (delantera o doble). |
| `especificacionesTipo.recorrido` | string | Condicional (montaña) | Recorrido de la suspensión. |
| `especificacionesTipo.bateria` | string | Condicional (eléctrica) | Datos de batería. |
| `especificacionesTipo.motor` | string | Condicional (eléctrica) | Datos del motor eléctrico. |

---

## 3. Colección: `catalogo_servicios`
> *"El taller contará con un catálogo de servicios que incluirá identificador, nombre, categoría, descripción, duración estimada y precio de referencia. Las categorías podrán corresponder a mantenimiento preventivo, frenos, transmisión, ruedas, suspensión o componentes eléctricos. Cada servicio podrá incluir una lista de tareas habituales y recomendaciones generales."*

| Campo | Tipo BSON | Requerido | Descripción según el PDF |
|---|---|---|---|
| `_id` | ObjectId | Sí | Identificador del servicio. |
| `nombre` | string | Sí | Nombre del servicio de taller. |
| `categoria` | string | Sí | Categoría (`mantenimiento preventivo`, `frenos`, `transmisión`, `ruedas`, `suspensión`, `componentes eléctricos`). |
| `descripcion` | string | Sí | Descripción técnica del servicio. |
| `duracionEstimada` | string | Sí | Duración estimada del servicio. |
| `precioReferencia` | decimal | Sí | Precio de referencia. |
| `tareasHabituales` | array[string] | No | Lista de tareas habituales incluidas. |
| `recomendaciones` | array[string] | No | Recomendaciones generales para el cliente. |

---

## 4. Colección: `citas`
> *"Las citas deberán registrar identificador, cliente, bicicleta, fecha, hora, motivo de la visita y estado (solicitada, confirmada, atendida o cancelada). El cliente podrá describir los problemas observados e indicar los servicios de su interés. El coordinador confirmará la disponibilidad y podrá modificar el horario, dejando una observación sobre el cambio. El sistema deberá impedir citas activas duplicadas para una misma bicicleta en el mismo horario."*

| Campo | Tipo BSON | Requerido | Descripción según el PDF |
|---|---|---|---|
| `_id` | ObjectId | Sí | Identificador de la cita. |
| `clienteId` | ObjectId | Sí | Cliente que solicita la cita. |
| `bicicletaId` | ObjectId | Sí | Bicicleta objeto de la cita. |
| `fecha` | string | Sí | Fecha de la cita. |
| `hora` | string | Sí | Hora de la cita. |
| `motivo` | string | Sí | Motivo de la visita al taller. |
| `problemasObservados` | string | No | Problemas observados descritos por el cliente. |
| `serviciosInteres` | array[string] | No | Servicios del catálogo de interés del cliente. |
| `estado` | string | Sí | Estado (`solicitada`, `confirmada`, `atendida`, `cancelada`). |
| `observacionCambio` | string | No | Observación del coordinador al modificar el horario. |
| `coordinadorId` | ObjectId / null | No | Coordinador que confirma la disponibilidad o modifica horario. |

---

## 5. Colección: `ordenes_servicio`
> *"Cada orden de servicio deberá incluir un identificador único, cliente, bicicleta, fecha de recepción, fecha estimada de entrega, coordinador responsable, técnicos asignados y estado (recibida, en diagnóstico, pendiente de autorización, en ejecución, lista para entrega, entregada o cancelada)... problemas reportados, condiciones observadas, accesorios entregados, fotografías... diagnóstico... propuesta de intervención... ejecución... historial de cambios de estado... revisión de entrega... garantías... valoraciones."*

| Campo / Subdocumento | Tipo BSON | Requerido | Descripción según el PDF |
|---|---|---|---|
| `_id` | ObjectId | Sí | Identificador único de la orden. |
| `citaId` | ObjectId / null | No | Cita previa vinculada cuando corresponda (puede recibirse sin cita). |
| `cliente` | object | Sí | Snapshot inmutable del cliente al recibir la bicicleta. |
| `bicicleta` | object | Sí | Snapshot inmutable de la bicicleta al recibirla. |
| `fechaRecepcion` | date | Sí | Fecha de recepción en taller. |
| `fechaEstimadaEntrega` | date | Sí | Fecha estimada de entrega acordada. |
| `coordinadorResponsable` | object | Sí | Coordinador responsable de supervisar la orden. |
| `tecnicosAsignados` | array[object] | Sí | Técnicos asignados a la orden. |
| `estado` | string | Sí | Estado (`recibida`, `en diagnóstico`, `pendiente de autorización`, `en ejecución`, `lista para entrega`, `entregada`, `cancelada`). |
| `recepcion` | object | Sí | Registro de recepción de la bicicleta. |
| `recepcion.problemaReportado` | string | Sí | Problema reportado por el cliente. |
| `recepcion.condicionesObservadas`| string | Sí | Condiciones observadas en la bicicleta. |
| `recepcion.accesoriosEntregados` | array[string] | No | Accesorios entregados por el cliente. |
| `recepcion.fotografias` | array[object] | No | Fotografías de ingreso (`nombreArchivo`, `descripcion`, `ubicacion`). |
| `diagnostico` | object | No | Evaluación técnica realizada por los técnicos. |
| `diagnostico.componentesRevisados`| array[string] | No | Componentes revisados. |
| `diagnostico.condicion` | string | No | Su condición general. |
| `diagnostico.hallazgos` | array[object] | No | Hallazgos con `componente`, `descripcion`, `prioridadAtencion`, `observaciones` y `evidencias` (`nombreArchivo`, `descripcion`, `ubicacion`). |
| `diagnostico.accionesRecomendadas`| array[string] | No | Acciones recomendadas por los técnicos. |
| `propuesta` | object | No | Propuesta de intervención elaborada a partir del diagnóstico. |
| `propuesta.trabajos` | array[object] | No | Trabajos propuestos con `servicioODescripcion`, `componenteInvolucrado`, `costoEstimadoManoObra`, `repuestosPrevistos` (`nombre`, `especificacionesRelevantes`, `cantidad`, `precioUnitarioEstimado`), `observaciones` y `autorizacionCliente` (`decision`, `fecha`, `comentarios`). |
| `propuesta.valorEstimadoPropuesta`| decimal | No | Valor estimado de la propuesta calculado. |
| `ejecucion` | object | No | Desarrollo de cada trabajo autorizado. |
| `ejecucion.trabajosRealizados` | array[object] | No | Trabajos con `responsable`, `fechaInicio`, `fechaFinalizacion`, `estado`, `descripcionRealizada` y `repuestosUtilizados` (`nombre`, `cantidad`, `precioUnitarioAplicado`). |
| `historialCambiosEstado` | array[object] | Sí | Historial de cambios de estado con `fecha`, `usuarioResponsable` y `observacion`. |
| `revisionEntrega` | object | No | Revisión de entrega con `puntosVerificados`, `resultado`, `recomendacionesUsoMantenimiento` y `aprobada`. |
| `entrega` | object | No | Al entregar la bicicleta: `fecha` y `confirmacionRecepcionCliente`. |
| `garantias` | array[object] | No | Garantía de servicio: `duracion`, `fechaInicio`, `condiciones`, `exclusiones` y `solicitudes` (`descripcion`, `fecha`, `evidencias`, `estado`, `procede`, `solucionAplicada`). |
| `valoracion` | object | No | Valoración de la orden entregada: `calificacionNumerica`, `comentarios` y `sugerencias`. |
