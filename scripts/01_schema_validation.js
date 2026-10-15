/**
 * Universidad Autónoma de Occidente (UAO)
 * Asignatura: Bases de Datos 2
 * Proyecto: Sistema de Gestión de Servicios de Mantenimiento y Reparación de Bicicletas
 * 
 * Script: 01_schema_validation.js
 * Descripción: Creación de colecciones con Schema Validation ($jsonSchema)
 *              100% estricto y fiel a las especificaciones textuales del PDF.
 */

const dbName = "taller_bicicletas_db";
const db = db.getSiblingDB(dbName);

print(`[+] Configurando validación de esquemas en: ${dbName}`);

// =============================================================================
// 1. COLECCIÓN: usuarios
// "Cada usuario deberá registrar nombre completo, documento de identificación,
// correo electrónico y número de teléfono. Los clientes también podrán registrar su dirección."
// "Los usuarios podrán tener uno de cuatro roles: cliente, técnico y coordinador."
// =============================================================================
db.createCollection("usuarios", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombreCompleto", "documentoIdentificacion", "correoElectronico", "numeroTelefono", "rol"],
      properties: {
        _id: { bsonType: "objectId" },
        nombreCompleto: { bsonType: "string", description: "Nombre completo" },
        documentoIdentificacion: { bsonType: "string", description: "Documento de identificación" },
        correoElectronico: { bsonType: "string", pattern: "^.+@.+$", description: "Correo electrónico" },
        numeroTelefono: { bsonType: "string", description: "Número de teléfono" },
        rol: {
          enum: ["cliente", "tecnico", "coordinador", "administrador"],
          description: "Uno de cuatro roles"
        },
        direccion: { bsonType: "string", description: "Dirección registrada por clientes" }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// =============================================================================
// 2. COLECCIÓN: bicicletas
// "Cada bicicleta deberá incluir un identificador único, propietario, marca, modelo,
// tipo, color y número de serie cuando esté disponible... características técnicas comunes...
// y variables según el tipo de bicicleta (montaña: suspensión y recorrido; eléctrica: batería y motor)."
// =============================================================================
db.createCollection("bicicletas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["propietarioId", "marca", "modelo", "tipo", "color", "caracteristicasComunes"],
      properties: {
        _id: { bsonType: "objectId" },
        propietarioId: { bsonType: "objectId", description: "Propietario" },
        marca: { bsonType: "string", description: "Marca" },
        modelo: { bsonType: "string", description: "Modelo" },
        tipo: {
          enum: ["urbana", "ruta", "montaña", "eléctrica"],
          description: "Tipo de bicicleta"
        },
        color: { bsonType: "string", description: "Color" },
        numeroSerie: { bsonType: ["string", "null"], description: "Número de serie cuando esté disponible" },
        caracteristicasComunes: {
          bsonType: "object",
          required: ["tamanoMarco", "material", "tamanoRueda", "tipoFrenos", "transmision"],
          properties: {
            tamanoMarco: { bsonType: "string", description: "Tamaño del marco" },
            material: { bsonType: "string", description: "Material" },
            tamanoRueda: { bsonType: "string", description: "Tamaño de rueda" },
            tipoFrenos: { bsonType: "string", description: "Tipo de frenos" },
            transmision: { bsonType: "string", description: "Transmisión" }
          }
        },
        especificacionesTipo: {
          bsonType: "object",
          properties: {
            suspension: { bsonType: "string", description: "Suspensión (montaña)" },
            recorrido: { bsonType: "string", description: "Recorrido (montaña)" },
            bateria: { bsonType: "string", description: "Batería (eléctrica)" },
            motor: { bsonType: "string", description: "Motor (eléctrica)" }
          }
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// =============================================================================
// 3. COLECCIÓN: catalogo_servicios
// "catálogo de servicios que incluirá identificador, nombre, categoría,
// descripción, duración estimada y precio de referencia... tareas habituales y recomendaciones generales."
// =============================================================================
db.createCollection("catalogo_servicios", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre", "categoria", "descripcion", "duracionEstimada", "precioReferencia"],
      properties: {
        _id: { bsonType: "objectId" },
        nombre: { bsonType: "string", description: "Nombre" },
        categoria: {
          enum: [
            "mantenimiento preventivo",
            "frenos",
            "transmisión",
            "ruedas",
            "suspensión",
            "componentes eléctricos"
          ],
          description: "Categoría"
        },
        descripcion: { bsonType: "string", description: "Descripción" },
        duracionEstimada: { bsonType: "string", description: "Duración estimada" },
        precioReferencia: { bsonType: ["decimal", "double", "int"], description: "Precio de referencia" },
        tareasHabituales: {
          bsonType: "array",
          items: { bsonType: "string" },
          description: "Lista de tareas habituales"
        },
        recomendaciones: {
          bsonType: "array",
          items: { bsonType: "string" },
          description: "Recomendaciones generales"
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// =============================================================================
// 4. COLECCIÓN: citas
// "identificador, cliente, bicicleta, fecha, hora, motivo de la visita y estado (solicitada, confirmada, atendida o cancelada)...
// problemas observados e indicar los servicios de su interés... observación sobre el cambio..."
// =============================================================================
db.createCollection("citas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["clienteId", "bicicletaId", "fecha", "hora", "motivo", "estado"],
      properties: {
        _id: { bsonType: "objectId" },
        clienteId: { bsonType: "objectId", description: "Cliente" },
        bicicletaId: { bsonType: "objectId", description: "Bicicleta" },
        fecha: { bsonType: "string", description: "Fecha de la visita" },
        hora: { bsonType: "string", description: "Hora de la visita" },
        motivo: { bsonType: "string", description: "Motivo de la visita" },
        problemasObservados: { bsonType: "string", description: "Problemas observados" },
        serviciosInteres: {
          bsonType: "array",
          items: { bsonType: "string" },
          description: "Servicios de su interés"
        },
        estado: {
          enum: ["solicitada", "confirmada", "atendida", "cancelada"],
          description: "Estado"
        },
        observacionCambio: { bsonType: "string", description: "Observación sobre el cambio" },
        coordinadorId: { bsonType: ["objectId", "null"], description: "Coordinador" }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// =============================================================================
// 5. COLECCIÓN: ordenes_servicio
// Fiel a cada párrafo de las páginas 2 y 3 del PDF del proyecto.
// =============================================================================
db.createCollection("ordenes_servicio", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "cliente",
        "bicicleta",
        "fechaRecepcion",
        "fechaEstimadaEntrega",
        "coordinadorResponsable",
        "tecnicosAsignados",
        "estado",
        "recepcion",
        "historialCambiosEstado"
      ],
      properties: {
        _id: { bsonType: "objectId" },
        citaId: { bsonType: ["objectId", "null"], description: "Cita vinculada cuando corresponda" },
        cliente: {
          bsonType: "object",
          required: ["usuarioId", "nombreCompleto", "documentoIdentificacion", "numeroTelefono", "correoElectronico"],
          description: "Cliente (Snapshot histórico)",
          properties: {
            usuarioId: { bsonType: "objectId" },
            nombreCompleto: { bsonType: "string" },
            documentoIdentificacion: { bsonType: "string" },
            numeroTelefono: { bsonType: "string" },
            correoElectronico: { bsonType: "string" },
            direccion: { bsonType: "string" }
          }
        },
        bicicleta: {
          bsonType: "object",
          required: ["bicicletaId", "marca", "modelo", "tipo", "color"],
          description: "Bicicleta (Snapshot histórico)",
          properties: {
            bicicletaId: { bsonType: "objectId" },
            marca: { bsonType: "string" },
            modelo: { bsonType: "string" },
            tipo: { enum: ["urbana", "ruta", "montaña", "eléctrica"] },
            color: { bsonType: "string" },
            numeroSerie: { bsonType: ["string", "null"] }
          }
        },
        fechaRecepcion: { bsonType: "date", description: "Fecha de recepción" },
        fechaEstimadaEntrega: { bsonType: "date", description: "Fecha estimada de entrega" },
        coordinadorResponsable: {
          bsonType: "object",
          required: ["coordinadorId", "nombreCompleto"],
          properties: {
            coordinadorId: { bsonType: "objectId" },
            nombreCompleto: { bsonType: "string" }
          }
        },
        tecnicosAsignados: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["tecnicoId", "nombreCompleto"],
            properties: {
              tecnicoId: { bsonType: "objectId" },
              nombreCompleto: { bsonType: "string" }
            }
          }
        },
        estado: {
          enum: [
            "recibida",
            "en diagnóstico",
            "pendiente de autorización",
            "en ejecución",
            "lista para entrega",
            "entregada",
            "cancelada"
          ],
          description: "Estado correspondiente"
        },
        recepcion: {
          bsonType: "object",
          required: ["problemaReportado", "condicionesObservadas"],
          description: "Al recibir la bicicleta",
          properties: {
            problemaReportado: { bsonType: "string", description: "Problema reportado" },
            condicionesObservadas: { bsonType: "string", description: "Condiciones observadas" },
            accesoriosEntregados: {
              bsonType: "array",
              items: { bsonType: "string" },
              description: "Accesorios entregados"
            },
            fotografias: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["nombreArchivo", "descripcion", "ubicacion"],
                properties: {
                  nombreArchivo: { bsonType: "string" },
                  descripcion: { bsonType: "string" },
                  ubicacion: { bsonType: "string" }
                }
              }
            }
          }
        },
        diagnostico: {
          bsonType: "object",
          description: "Durante el diagnóstico",
          properties: {
            componentesRevisados: {
              bsonType: "array",
              items: { bsonType: "string" },
              description: "Componentes revisados"
            },
            condicion: { bsonType: "string", description: "Su condición" },
            hallazgos: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["componente", "descripcion", "prioridadAtencion", "observaciones"],
                properties: {
                  componente: { bsonType: "string" },
                  descripcion: { bsonType: "string" },
                  prioridadAtencion: { bsonType: "string" },
                  observaciones: { bsonType: "string" },
                  evidencias: {
                    bsonType: "array",
                    items: {
                      bsonType: "object",
                      required: ["nombreArchivo", "descripcion", "ubicacion"],
                      properties: {
                        nombreArchivo: { bsonType: "string" },
                        descripcion: { bsonType: "string" },
                        ubicacion: { bsonType: "string" }
                      }
                    }
                  }
                }
              }
            },
            accionesRecomendadas: {
              bsonType: "array",
              items: { bsonType: "string" },
              description: "Acciones recomendadas"
            }
          }
        },
        propuesta: {
          bsonType: "object",
          description: "Propuesta de intervención",
          properties: {
            trabajos: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: [
                  "servicioODescripcion",
                  "componenteInvolucrado",
                  "costoEstimadoManoObra",
                  "repuestosPrevistos",
                  "observaciones"
                ],
                properties: {
                  servicioODescripcion: { bsonType: "string" },
                  componenteInvolucrado: { bsonType: "string" },
                  costoEstimadoManoObra: { bsonType: ["decimal", "double", "int"] },
                  repuestosPrevistos: {
                    bsonType: "array",
                    items: {
                      bsonType: "object",
                      required: ["nombre", "especificacionesRelevantes", "cantidad", "precioUnitarioEstimado"],
                      properties: {
                        nombre: { bsonType: "string" },
                        especificacionesRelevantes: { bsonType: "string" },
                        cantidad: { bsonType: "int" },
                        precioUnitarioEstimado: { bsonType: ["decimal", "double", "int"] }
                      }
                    }
                  },
                  observaciones: { bsonType: "string" },
                  autorizacionCliente: {
                    bsonType: "object",
                    properties: {
                      decision: { enum: ["autorizado", "rechazado"] },
                      fecha: { bsonType: "date" },
                      comentarios: { bsonType: "string" }
                    }
                  }
                }
              }
            },
            valorEstimadoPropuesta: { bsonType: ["decimal", "double", "int"] }
          }
        },
        ejecucion: {
          bsonType: "object",
          description: "Desarrollo de cada trabajo autorizado",
          properties: {
            trabajosRealizados: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["responsable", "fechaInicio", "fechaFinalizacion", "estado", "descripcionRealizada"],
                properties: {
                  responsable: { bsonType: "string" },
                  fechaInicio: { bsonType: "date" },
                  fechaFinalizacion: { bsonType: "date" },
                  estado: { bsonType: "string" },
                  descripcionRealizada: { bsonType: "string" },
                  repuestosUtilizados: {
                    bsonType: "array",
                    items: {
                      bsonType: "object",
                      required: ["nombre", "cantidad", "precioUnitarioAplicado"],
                      properties: {
                        nombre: { bsonType: "string" },
                        cantidad: { bsonType: "int" },
                        precioUnitarioAplicado: { bsonType: ["decimal", "double", "int"] }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        historialCambiosEstado: {
          bsonType: "array",
          minItems: 1,
          description: "Historial de cambios de estado",
          items: {
            bsonType: "object",
            required: ["fecha", "usuarioResponsable", "observacion"],
            properties: {
              fecha: { bsonType: "date" },
              usuarioResponsable: { bsonType: "string" },
              observacion: { bsonType: "string" },
              estado: { bsonType: "string" }
            }
          }
        },
        revisionEntrega: {
          bsonType: "object",
          properties: {
            puntosVerificados: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["punto", "resultado"],
                properties: {
                  punto: { bsonType: "string" },
                  resultado: { bsonType: "bool" }
                }
              }
            },
            resultado: { bsonType: "string" },
            recomendacionesUsoMantenimiento: { bsonType: "string" },
            aprobada: { bsonType: "bool" }
          }
        },
        entrega: {
          bsonType: "object",
          description: "Al entregar la bicicleta",
          properties: {
            fecha: { bsonType: "date" },
            confirmacionRecepcionCliente: { bsonType: "bool" }
          }
        },
        garantias: {
          bsonType: "array",
          description: "Garantía de servicio a los trabajos que corresponda",
          items: {
            bsonType: "object",
            required: ["duracion", "fechaInicio", "condiciones", "exclusiones"],
            properties: {
              duracion: { bsonType: "string" },
              fechaInicio: { bsonType: "date" },
              condiciones: { bsonType: "string" },
              exclusiones: { bsonType: "string" },
              solicitudes: {
                bsonType: "array",
                items: {
                  bsonType: "object",
                  required: ["descripcion", "fecha", "evidencias", "estado"],
                  properties: {
                    descripcion: { bsonType: "string" },
                    fecha: { bsonType: "date" },
                    evidencias: { bsonType: "array", items: { bsonType: "string" } },
                    estado: { bsonType: "string" },
                    procede: { bsonType: "bool" },
                    solucionAplicada: { bsonType: "string" }
                  }
                }
              }
            }
          }
        },
        valoracion: {
          bsonType: "object",
          description: "Valorar los servicios de las órdenes entregadas",
          properties: {
            calificacionNumerica: { bsonType: "int", minimum: 1, maximum: 5 },
            comentarios: { bsonType: "string" },
            sugerencias: { bsonType: "string" }
          }
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

print("[✓] Esquemas estrictos de validación creados exitosamente conforme al PDF.");
