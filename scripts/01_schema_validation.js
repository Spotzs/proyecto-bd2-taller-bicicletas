/**
 * Universidad Autónoma de Occidente (UAO)
 * Asignatura: Bases de Datos 2
 * Proyecto: Sistema de Gestión de Servicios de Mantenimiento y Reparación de Bicicletas
 * 
 * Script: 01_schema_validation.js
 * Descripción: Creación de colecciones con Schema Validation ($jsonSchema) estricto.
 */

const dbName = "taller_bicicletas_db";
const db = db.getSiblingDB(dbName);

print(`[+] Configurando validación de esquemas en la base de datos: ${dbName}`);

// =============================================================================
// 1. COLECCIÓN: usuarios
// =============================================================================
db.createCollection("usuarios", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre", "documento", "correo", "telefono", "rol", "fechaCreacion", "activo"],
      properties: {
        _id: {
          bsonType: "objectId",
          description: "Identificador único inmutable del usuario"
        },
        nombre: {
          bsonType: "string",
          minLength: 3,
          maxLength: 120,
          description: "Nombre completo del usuario (obligatorio)"
        },
        documento: {
          bsonType: "string",
          pattern: "^[0-9A-Za-z-]{5,20}$",
          description: "Documento de identificación único (cédula, pasaporte, etc.)"
        },
        correo: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Correo electrónico con formato válido (obligatorio y único)"
        },
        telefono: {
          bsonType: "string",
          pattern: "^[0-9+ ]{7,15}$",
          description: "Número telefónico o de celular (obligatorio)"
        },
        rol: {
          enum: ["cliente", "tecnico", "coordinador", "administrador"],
          description: "Rol asignado dentro del sistema del taller"
        },
        direccion: {
          bsonType: "string",
          description: "Dirección de residencia o contacto (obligatoria para clientes)"
        },
        fechaCreacion: {
          bsonType: "date",
          description: "Fecha y hora de registro en la plataforma"
        },
        activo: {
          bsonType: "bool",
          description: "Estado operativo de la cuenta de usuario"
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// =============================================================================
// 2. COLECCIÓN: bicicletas
// =============================================================================
db.createCollection("bicicletas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "propietarioId",
        "marca",
        "modelo",
        "tipo",
        "color",
        "caracteristicasComunes",
        "fechaRegistro",
        "activo"
      ],
      properties: {
        _id: { bsonType: "objectId" },
        propietarioId: {
          bsonType: "objectId",
          description: "Referencia obligatoria a usuarios._id (debe ser rol cliente)"
        },
        marca: {
          bsonType: "string",
          minLength: 2,
          maxLength: 60,
          description: "Marca del fabricante de la bicicleta"
        },
        modelo: {
          bsonType: "string",
          minLength: 1,
          maxLength: 80,
          description: "Modelo comercial de la bicicleta"
        },
        tipo: {
          enum: ["urbana", "ruta", "montaña", "eléctrica"],
          description: "Tipo de bicicleta que define las características técnicas adicionales"
        },
        color: {
          bsonType: "string",
          description: "Color principal de la bicicleta"
        },
        numeroSerie: {
          bsonType: ["string", "null"],
          description: "Número de serie o serial del marco grabado de fábrica (opcional)"
        },
        caracteristicasComunes: {
          bsonType: "object",
          required: [
            "tamanoMarco",
            "material",
            "tamanoRueda",
            "tipoFrenos",
            "transmision"
          ],
          properties: {
            tamanoMarco: {
              bsonType: "string",
              description: "Talla del marco (ej: XS, S, M, L, XL, 52cm, 54cm)"
            },
            material: {
              bsonType: "string",
              description: "Material de fabricación (ej: Aluminio, Carbono, Acero, Titanio)"
            },
            tamanoRueda: {
              bsonType: "string",
              description: "Diámetro de la rueda (ej: 26\", 27.5\", 29\", 700c)"
            },
            tipoFrenos: {
              bsonType: "string",
              description: "Tecnología de frenos (ej: Disco Hidráulico, Disco Mecánico, V-Brake, Herradura)"
            },
            transmision: {
              bsonType: "string",
              description: "Configuración de cambios (ej: Shimano Deore 1x12, 2x11, Monomarcha)"
            }
          }
        },
        especificacionesTipo: {
          bsonType: "object",
          description: "Atributos técnicos polimórficos según el tipo de bicicleta",
          properties: {
            suspension: {
              bsonType: "string",
              description: "Tipo de suspensión para montaña (ej: Delantera Aire, Doble Suspensión)"
            },
            recorrido: {
              bsonType: "string",
              description: "Recorrido de la suspensión en mm (ej: 100mm, 120mm, 150mm)"
            },
            bateria: {
              bsonType: "string",
              description: "Capacidad y voltaje de batería para eléctricas (ej: 36V 14Ah 504Wh)"
            },
            motor: {
              bsonType: "string",
              description: "Potencia y fabricante del motor eléctrico (ej: Bosch Performance CX 250W)"
            }
          }
        },
        fechaRegistro: {
          bsonType: "date",
          description: "Fecha en la que el cliente registró la bicicleta en el taller"
        },
        activo: {
          bsonType: "bool",
          description: "Indica si la bicicleta continúa activa en el perfil del cliente"
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// =============================================================================
// 3. COLECCIÓN: catalogo_servicios
// =============================================================================
db.createCollection("catalogo_servicios", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "nombre",
        "categoria",
        "descripcion",
        "duracionEstimadaMinutos",
        "precioReferencia",
        "tareasHabituales",
        "activo"
      ],
      properties: {
        _id: { bsonType: "objectId" },
        nombre: {
          bsonType: "string",
          minLength: 3,
          maxLength: 100,
          description: "Nombre descriptivo del servicio de taller"
        },
        categoria: {
          enum: [
            "mantenimiento preventivo",
            "frenos",
            "transmisión",
            "ruedas",
            "suspensión",
            "componentes eléctricos"
          ],
          description: "Categoría estandarizada del servicio"
        },
        descripcion: {
          bsonType: "string",
          description: "Detalle técnico del alcance del servicio"
        },
        duracionEstimadaMinutos: {
          bsonType: "int",
          minimum: 15,
          maximum: 1440,
          description: "Tiempo estimado de ejecución en minutos"
        },
        precioReferencia: {
          bsonType: "decimal",
          description: "Precio base sugerido de mano de obra en COP (Decimal128)"
        },
        tareasHabituales: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "string"
          },
          description: "Lista de actividades estándar desarrolladas en el servicio"
        },
        recomendaciones: {
          bsonType: "array",
          items: {
            bsonType: "string"
          },
          description: "Pautas de mantenimiento preventivo y buenas prácticas"
        },
        activo: {
          bsonType: "bool",
          description: "Indica si el servicio está disponible para ofrecerse en taller"
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// =============================================================================
// 4. COLECCIÓN: citas
// =============================================================================
db.createCollection("citas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "clienteId",
        "bicicletaId",
        "fechaHora",
        "motivo",
        "estado",
        "fechaCreacion"
      ],
      properties: {
        _id: { bsonType: "objectId" },
        clienteId: {
          bsonType: "objectId",
          description: "Referencia a usuarios._id que solicita la cita"
        },
        bicicletaId: {
          bsonType: "objectId",
          description: "Referencia a bicicletas._id del cliente"
        },
        fechaHora: {
          bsonType: "date",
          description: "Fecha y hora reservada para recepción en taller"
        },
        motivo: {
          bsonType: "string",
          minLength: 5,
          maxLength: 250,
          description: "Razón principal de la solicitud de la cita"
        },
        problemasReportados: {
          bsonType: "string",
          description: "Fallas o ruidos manifestados por el usuario"
        },
        serviciosInteres: {
          bsonType: "array",
          items: { bsonType: "string" },
          description: "Nombres o categorías de servicios del catálogo de interés"
        },
        estado: {
          enum: ["solicitada", "confirmada", "atendida", "cancelada"],
          description: "Estado del agendamiento"
        },
        observaciones: {
          bsonType: "string",
          description: "Anotaciones del coordinador al confirmar o reprogramar"
        },
        coordinadorId: {
          bsonType: ["objectId", "null"],
          description: "Coordinador que gestionó o confirmó la disponibilidad"
        },
        fechaCreacion: {
          bsonType: "date",
          description: "Marca de tiempo de solicitud inicial"
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// =============================================================================
// 5. COLECCIÓN: ordenes_servicio (Agregado Raíz Transaccional)
// =============================================================================
db.createCollection("ordenes_servicio", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "numeroOrden",
        "cliente",
        "bicicleta",
        "estado",
        "recepcion",
        "historialEstados"
      ],
      properties: {
        _id: { bsonType: "objectId" },
        numeroOrden: {
          bsonType: "string",
          pattern: "^ORD-[0-9]{4}-[0-9]{5}$",
          description: "Código comercial visible de la orden (ej: ORD-2026-00001)"
        },
        citaId: {
          bsonType: ["objectId", "null"],
          description: "Referencia a la cita previa si la orden provino de agenda"
        },
        cliente: {
          bsonType: "object",
          required: ["usuarioId", "nombre", "documento", "telefono", "correo"],
          description: "Snapshot inmutable de la información del cliente",
          properties: {
            usuarioId: { bsonType: "objectId" },
            nombre: { bsonType: "string" },
            documento: { bsonType: "string" },
            telefono: { bsonType: "string" },
            correo: { bsonType: "string" },
            direccion: { bsonType: "string" }
          }
        },
        bicicleta: {
          bsonType: "object",
          required: ["bicicletaId", "marca", "modelo", "tipo", "color"],
          description: "Snapshot inmutable de la bicicleta al ingresar a taller",
          properties: {
            bicicletaId: { bsonType: "objectId" },
            marca: { bsonType: "string" },
            modelo: { bsonType: "string" },
            tipo: { enum: ["urbana", "ruta", "montaña", "eléctrica"] },
            color: { bsonType: "string" },
            numeroSerie: { bsonType: ["string", "null"] }
          }
        },
        coordinadorId: {
          bsonType: ["objectId", "null"],
          description: "Coordinador responsable de supervisar la orden"
        },
        tecnicosAsignados: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["tecnicoId", "nombre"],
            properties: {
              tecnicoId: { bsonType: "objectId" },
              nombre: { bsonType: "string" }
            }
          }
        },
        estado: {
          enum: [
            "recibida",
            "en_diagnostico",
            "pendiente_autorizacion",
            "en_ejecucion",
            "lista_para_entrega",
            "entregada",
            "cancelada"
          ],
          description: "Estado operativo dentro del flujo del taller"
        },
        recepcion: {
          bsonType: "object",
          required: ["fechaRecepcion", "problemaReportado", "condicionesObservadas"],
          properties: {
            fechaRecepcion: { bsonType: "date" },
            fechaEstimadaEntrega: { bsonType: "date" },
            problemaReportado: { bsonType: "string" },
            condicionesObservadas: { bsonType: "string" },
            accesoriosEntregados: {
              bsonType: "array",
              items: { bsonType: "string" },
              description: "Luces, odómetro, alforjas, bolsa de sillín, pedales"
            },
            fotografias: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["nombreArchivo", "ubicacion"],
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
          properties: {
            fechaDiagnostico: { bsonType: "date" },
            tecnicoResponsableId: { bsonType: "objectId" },
            componentesRevisados: {
              bsonType: "array",
              items: { bsonType: "string" }
            },
            hallazgos: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["componente", "descripcion", "prioridad"],
                properties: {
                  componente: { bsonType: "string" },
                  descripcion: { bsonType: "string" },
                  prioridad: { enum: ["baja", "media", "alta", "critica"] },
                  observaciones: { bsonType: "string" },
                  evidencias: {
                    bsonType: "array",
                    items: {
                      bsonType: "object",
                      required: ["nombreArchivo", "ubicacion"],
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
              items: { bsonType: "string" }
            }
          }
        },
        propuesta: {
          bsonType: "object",
          properties: {
            fechaPropuesta: { bsonType: "date" },
            trabajos: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: [
                  "trabajoId",
                  "descripcion",
                  "componente",
                  "costoEstimadoManoObra",
                  "estadoAutorizacion"
                ],
                properties: {
                  trabajoId: { bsonType: "string" },
                  servicioCatalogoId: { bsonType: ["objectId", "null"] },
                  descripcion: { bsonType: "string" },
                  componente: { bsonType: "string" },
                  costoEstimadoManoObra: { bsonType: "decimal" },
                  repuestosPrevistos: {
                    bsonType: "array",
                    items: {
                      bsonType: "object",
                      required: ["nombre", "cantidad", "precioUnitarioEstimado"],
                      properties: {
                        nombre: { bsonType: "string" },
                        especificaciones: { bsonType: "string" },
                        cantidad: { bsonType: "int", minimum: 1 },
                        precioUnitarioEstimado: { bsonType: "decimal" }
                      }
                    }
                  },
                  estadoAutorizacion: {
                    enum: ["pendiente", "autorizado", "rechazado"],
                    description: "Autorización granular realizada por el cliente"
                  },
                  decisionCliente: {
                    bsonType: "object",
                    properties: {
                      fechaDecision: { bsonType: "date" },
                      comentarios: { bsonType: "string" }
                    }
                  },
                  observaciones: { bsonType: "string" }
                }
              }
            },
            valorTotalEstimado: { bsonType: "decimal" }
          }
        },
        ejecucion: {
          bsonType: "object",
          properties: {
            trabajosRealizados: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["trabajoId", "responsableId", "estado"],
                properties: {
                  trabajoId: { bsonType: "string" },
                  responsableId: { bsonType: "objectId" },
                  fechaInicio: { bsonType: "date" },
                  fechaFinalizacion: { bsonType: "date" },
                  estado: { enum: ["en_progreso", "finalizado", "detenido"] },
                  descripcionRealizada: { bsonType: "string" },
                  repuestosUtilizados: {
                    bsonType: "array",
                    items: {
                      bsonType: "object",
                      required: ["nombre", "cantidad", "precioUnitarioAplicado"],
                      properties: {
                        nombre: { bsonType: "string" },
                        cantidad: { bsonType: "int", minimum: 1 },
                        precioUnitarioAplicado: { bsonType: "decimal" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        historialEstados: {
          bsonType: "array",
          minItems: 1,
          items: {
            bsonType: "object",
            required: ["estado", "fecha", "usuarioResponsableId"],
            properties: {
              estado: {
                enum: [
                  "recibida",
                  "en_diagnostico",
                  "pendiente_autorizacion",
                  "en_ejecucion",
                  "lista_para_entrega",
                  "entregada",
                  "cancelada"
                ]
              },
              fecha: { bsonType: "date" },
              usuarioResponsableId: { bsonType: "objectId" },
              observacion: { bsonType: "string" }
            }
          }
        },
        revisionEntrega: {
          bsonType: "object",
          properties: {
            fechaRevision: { bsonType: "date" },
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
            aprobada: { bsonType: "bool" },
            recomendaciones: { bsonType: "string" }
          }
        },
        entregaConfirmada: {
          bsonType: "object",
          properties: {
            fechaEntrega: { bsonType: "date" },
            confirmacionCliente: { bsonType: "bool" }
          }
        },
        garantias: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["trabajoId", "duracionDias", "fechaInicio"],
            properties: {
              trabajoId: { bsonType: "string" },
              duracionDias: { bsonType: "int", minimum: 1 },
              fechaInicio: { bsonType: "date" },
              condiciones: { bsonType: "string" },
              exclusiones: { bsonType: "string" },
              solicitudes: {
                bsonType: "array",
                items: {
                  bsonType: "object",
                  required: ["descripcion", "fecha", "estado"],
                  properties: {
                    descripcion: { bsonType: "string" },
                    fecha: { bsonType: "date" },
                    evidencias: { bsonType: "array", items: { bsonType: "string" } },
                    estado: { enum: ["recibida", "procede", "no_procede", "resuelta"] },
                    resolucionCoordinador: {
                      bsonType: "object",
                      properties: {
                        fecha: { bsonType: "date" },
                        procede: { bsonType: "bool" },
                        solucionAplicada: { bsonType: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        valoracion: {
          bsonType: "object",
          required: ["calificacion"],
          properties: {
            calificacion: { bsonType: "int", minimum: 1, maximum: 5 },
            comentarios: { bsonType: "string" },
            sugerencias: { bsonType: "string" },
            fechaValoracion: { bsonType: "date" }
          }
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

print("[✓] Todas las colecciones y sus esquemas JSONSchema fueron creados exitosamente.");
