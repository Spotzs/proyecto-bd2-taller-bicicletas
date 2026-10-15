const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function genGuid() {
  return crypto.randomUUID();
}

// =============================================================================
// 1. ESQUEMAS JSON SCHEMA (100% estrictos al PDF, sin campos adicionales)
// =============================================================================
const schemas = {
  usuarios: {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "usuarios",
    "type": "object",
    "required": ["nombreCompleto", "documentoIdentificacion", "correoElectronico", "numeroTelefono", "rol"],
    "properties": {
      "_id": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$", "description": "Identificador único" },
      "nombreCompleto": { "type": "string", "description": "Nombre completo del usuario" },
      "documentoIdentificacion": { "type": "string", "description": "Documento de identificación" },
      "correoElectronico": { "type": "string", "format": "email", "description": "Correo electrónico" },
      "numeroTelefono": { "type": "string", "description": "Número de teléfono" },
      "rol": {
        "type": "string",
        "enum": ["cliente", "tecnico", "coordinador", "administrador"],
        "description": "Uno de los cuatro roles del sistema"
      },
      "direccion": {
        "type": "string",
        "description": "Dirección registrada por clientes"
      }
    }
  },

  bicicletas: {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "bicicletas",
    "type": "object",
    "required": ["propietarioId", "marca", "modelo", "tipo", "color", "caracteristicasComunes"],
    "properties": {
      "_id": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$", "description": "Identificador único" },
      "propietarioId": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$", "description": "Propietario de la bicicleta" },
      "marca": { "type": "string", "description": "Marca" },
      "modelo": { "type": "string", "description": "Modelo" },
      "tipo": {
        "type": "string",
        "enum": ["urbana", "ruta", "montaña", "eléctrica"],
        "description": "Tipo de bicicleta"
      },
      "color": { "type": "string", "description": "Color" },
      "numeroSerie": {
        "type": ["string", "null"],
        "description": "Número de serie cuando esté disponible"
      },
      "caracteristicasComunes": {
        "type": "object",
        "required": ["tamanoMarco", "material", "tamanoRueda", "tipoFrenos", "transmision"],
        "description": "Características técnicas comunes",
        "properties": {
          "tamanoMarco": { "type": "string", "description": "Tamaño del marco" },
          "material": { "type": "string", "description": "Material" },
          "tamanoRueda": { "type": "string", "description": "Tamaño de rueda" },
          "tipoFrenos": { "type": "string", "description": "Tipo de frenos" },
          "transmision": { "type": "string", "description": "Transmisión" }
        }
      },
      "especificacionesTipo": {
        "type": "object",
        "description": "Características técnicas que varían según el tipo",
        "properties": {
          "suspension": { "type": "string", "description": "Suspensión (montaña)" },
          "recorrido": { "type": "string", "description": "Recorrido (montaña)" },
          "bateria": { "type": "string", "description": "Batería (eléctrica)" },
          "motor": { "type": "string", "description": "Motor (eléctrica)" }
        }
      }
    }
  },

  catalogo_servicios: {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "catalogo_servicios",
    "type": "object",
    "required": ["nombre", "categoria", "descripcion", "duracionEstimada", "precioReferencia"],
    "properties": {
      "_id": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$", "description": "Identificador" },
      "nombre": { "type": "string", "description": "Nombre del servicio" },
      "categoria": {
        "type": "string",
        "enum": [
          "mantenimiento preventivo",
          "frenos",
          "transmisión",
          "ruedas",
          "suspensión",
          "componentes eléctricos"
        ],
        "description": "Categoría del servicio"
      },
      "descripcion": { "type": "string", "description": "Descripción" },
      "duracionEstimada": { "type": "string", "description": "Duración estimada" },
      "precioReferencia": { "type": "number", "description": "Precio de referencia" },
      "tareasHabituales": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Lista de tareas habituales"
      },
      "recomendaciones": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Recomendaciones generales"
      }
    }
  },

  citas: {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "citas",
    "type": "object",
    "required": ["clienteId", "bicicletaId", "fecha", "hora", "motivo", "estado"],
    "properties": {
      "_id": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$", "description": "Identificador" },
      "clienteId": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$", "description": "Cliente" },
      "bicicletaId": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$", "description": "Bicicleta" },
      "fecha": { "type": "string", "description": "Fecha de la cita" },
      "hora": { "type": "string", "description": "Hora de la cita" },
      "motivo": { "type": "string", "description": "Motivo de la visita" },
      "problemasObservados": { "type": "string", "description": "Problemas observados descritos por el cliente" },
      "serviciosInteres": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Servicios de interés indicados por el cliente"
      },
      "estado": {
        "type": "string",
        "enum": ["solicitada", "confirmada", "atendida", "cancelada"],
        "description": "Estado de la cita"
      },
      "observacionCambio": {
        "type": "string",
        "description": "Observación sobre el cambio de horario por el coordinador"
      },
      "coordinadorId": {
        "type": ["string", "null"],
        "description": "Coordinador que confirma o modifica disponibilidad"
      }
    }
  },

  ordenes_servicio: {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "ordenes_servicio",
    "type": "object",
    "required": [
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
    "properties": {
      "_id": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$", "description": "Identificador único" },
      "citaId": { "type": ["string", "null"], "description": "Cita vinculada cuando corresponda" },
      "cliente": {
        "type": "object",
        "required": ["usuarioId", "nombreCompleto", "documentoIdentificacion", "numeroTelefono", "correoElectronico"],
        "description": "Cliente",
        "properties": {
          "usuarioId": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" },
          "nombreCompleto": { "type": "string" },
          "documentoIdentificacion": { "type": "string" },
          "numeroTelefono": { "type": "string" },
          "correoElectronico": { "type": "string" },
          "direccion": { "type": "string" }
        }
      },
      "bicicleta": {
        "type": "object",
        "required": ["bicicletaId", "marca", "modelo", "tipo", "color"],
        "description": "Bicicleta",
        "properties": {
          "bicicletaId": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" },
          "marca": { "type": "string" },
          "modelo": { "type": "string" },
          "tipo": { "type": "string", "enum": ["urbana", "ruta", "montaña", "eléctrica"] },
          "color": { "type": "string" },
          "numeroSerie": { "type": ["string", "null"] }
        }
      },
      "fechaRecepcion": { "type": "string", "format": "date-time", "description": "Fecha de recepción" },
      "fechaEstimadaEntrega": { "type": "string", "format": "date-time", "description": "Fecha estimada de entrega" },
      "coordinadorResponsable": {
        "type": "object",
        "required": ["coordinadorId", "nombreCompleto"],
        "description": "Coordinador responsable",
        "properties": {
          "coordinadorId": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" },
          "nombreCompleto": { "type": "string" }
        }
      },
      "tecnicosAsignados": {
        "type": "array",
        "description": "Técnicos asignados",
        "items": {
          "type": "object",
          "required": ["tecnicoId", "nombreCompleto"],
          "properties": {
            "tecnicoId": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" },
            "nombreCompleto": { "type": "string" }
          }
        }
      },
      "estado": {
        "type": "string",
        "enum": [
          "recibida",
          "en diagnóstico",
          "pendiente de autorización",
          "en ejecución",
          "lista para entrega",
          "entregada",
          "cancelada"
        ],
        "description": "Estado correspondiente"
      },
      "recepcion": {
        "type": "object",
        "required": ["problemaReportado", "condicionesObservadas"],
        "description": "Al recibir la bicicleta",
        "properties": {
          "problemaReportado": { "type": "string", "description": "Problema reportado" },
          "condicionesObservadas": { "type": "string", "description": "Condiciones observadas" },
          "accesoriosEntregados": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Accesorios entregados"
          },
          "fotografias": {
            "type": "array",
            "description": "Fotografías cuando sea necesario",
            "items": {
              "type": "object",
              "required": ["nombreArchivo", "descripcion", "ubicacion"],
              "properties": {
                "nombreArchivo": { "type": "string", "description": "Nombre del archivo" },
                "descripcion": { "type": "string", "description": "Descripción" },
                "ubicacion": { "type": "string", "description": "Ubicación" }
              }
            }
          }
        }
      },
      "diagnostico": {
        "type": "object",
        "description": "Durante el diagnóstico",
        "properties": {
          "componentesRevisados": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Componentes revisados"
          },
          "condicion": { "type": "string", "description": "Su condición" },
          "hallazgos": {
            "type": "array",
            "description": "Hallazgos",
            "items": {
              "type": "object",
              "required": ["componente", "descripcion", "prioridadAtencion", "observaciones"],
              "properties": {
                "componente": { "type": "string", "description": "Componente" },
                "descripcion": { "type": "string", "description": "Descripción" },
                "prioridadAtencion": { "type": "string", "description": "Prioridad de atención" },
                "observaciones": { "type": "string", "description": "Observaciones" },
                "evidencias": {
                  "type": "array",
                  "description": "Fotografías o documentos adjuntos",
                  "items": {
                    "type": "object",
                    "required": ["nombreArchivo", "descripcion", "ubicacion"],
                    "properties": {
                      "nombreArchivo": { "type": "string", "description": "Nombre del archivo" },
                      "descripcion": { "type": "string", "description": "Su descripción" },
                      "ubicacion": { "type": "string", "description": "Su ubicación" }
                    }
                  }
                }
              }
            }
          },
          "accionesRecomendadas": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Acciones recomendadas"
          }
        }
      },
      "propuesta": {
        "type": "object",
        "description": "Propuesta de intervención",
        "properties": {
          "trabajos": {
            "type": "array",
            "description": "Uno o varios trabajos",
            "items": {
              "type": "object",
              "required": [
                "servicioODescripcion",
                "componenteInvolucrado",
                "costoEstimadoManoObra",
                "repuestosPrevistos",
                "observaciones"
              ],
              "properties": {
                "servicioODescripcion": { "type": "string", "description": "Servicio o descripción de la intervención" },
                "componenteInvolucrado": { "type": "string", "description": "Componente involucrado" },
                "costoEstimadoManoObra": { "type": "number", "description": "Costo estimado de mano de obra" },
                "repuestosPrevistos": {
                  "type": "array",
                  "description": "Repuestos previstos",
                  "items": {
                    "type": "object",
                    "required": ["nombre", "especificacionesRelevantes", "cantidad", "precioUnitarioEstimado"],
                    "properties": {
                      "nombre": { "type": "string", "description": "Nombre" },
                      "especificacionesRelevantes": { "type": "string", "description": "Especificaciones relevantes" },
                      "cantidad": { "type": "integer", "description": "Cantidad" },
                      "precioUnitarioEstimado": { "type": "number", "description": "Precio unitario estimado" }
                    }
                  }
                },
                "observaciones": { "type": "string", "description": "Observaciones" },
                "autorizacionCliente": {
                  "type": "object",
                  "description": "Autorización o rechazo individual del cliente",
                  "properties": {
                    "decision": { "type": "string", "enum": ["autorizado", "rechazado"], "description": "Decisión" },
                    "fecha": { "type": "string", "format": "date-time", "description": "Fecha" },
                    "comentarios": { "type": "string", "description": "Comentarios" }
                  }
                }
              }
            }
          },
          "valorEstimadoPropuesta": { "type": "number", "description": "Valor estimado de la propuesta calculado" }
        }
      },
      "ejecucion": {
        "type": "object",
        "description": "Desarrollo de cada trabajo autorizado",
        "properties": {
          "trabajosRealizados": {
            "type": "array",
            "description": "Trabajos autorizados ejecutados",
            "items": {
              "type": "object",
              "required": ["responsable", "fechaInicio", "fechaFinalizacion", "estado", "descripcionRealizada"],
              "properties": {
                "responsable": { "type": "string", "description": "Responsable" },
                "fechaInicio": { "type": "string", "format": "date-time", "description": "Fecha de inicio" },
                "fechaFinalizacion": { "type": "string", "format": "date-time", "description": "Fecha de finalización" },
                "estado": { "type": "string", "description": "Estado" },
                "descripcionRealizada": { "type": "string", "description": "Descripción de lo realizado" },
                "repuestosUtilizados": {
                  "type": "array",
                  "description": "Repuestos efectivamente utilizados",
                  "items": {
                    "type": "object",
                    "required": ["nombre", "cantidad", "precioUnitarioAplicado"],
                    "properties": {
                      "nombre": { "type": "string", "description": "Nombre" },
                      "cantidad": { "type": "integer", "description": "Cantidad" },
                      "precioUnitarioAplicado": { "type": "number", "description": "Precio unitario aplicado" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "historialCambiosEstado": {
        "type": "array",
        "minItems": 1,
        "description": "Historial de cambios de estado",
        "items": {
          "type": "object",
          "required": ["fecha", "usuarioResponsable", "observacion"],
          "properties": {
            "fecha": { "type": "string", "format": "date-time", "description": "Fecha" },
            "usuarioResponsable": { "type": "string", "description": "Usuario responsable" },
            "observacion": { "type": "string", "description": "Observación" },
            "estado": { "type": "string", "description": "Estado asociado" }
          }
        }
      },
      "revisionEntrega": {
        "type": "object",
        "description": "Al finalizar los trabajos se registrará una revisión de entrega",
        "properties": {
          "puntosVerificados": {
            "type": "array",
            "description": "Puntos verificados",
            "items": {
              "type": "object",
              "required": ["punto", "resultado"],
              "properties": {
                "punto": { "type": "string", "description": "Punto verificado" },
                "resultado": { "type": "boolean", "description": "Resultado" }
              }
            }
          },
          "resultado": { "type": "string", "description": "Resultado general" },
          "recomendacionesUsoMantenimiento": { "type": "string", "description": "Recomendaciones de uso o mantenimiento" },
          "aprobada": { "type": "boolean", "description": "Revisión aprobada" }
        }
      },
      "entrega": {
        "type": "object",
        "description": "Al entregar la bicicleta",
        "properties": {
          "fecha": { "type": "string", "format": "date-time", "description": "Fecha" },
          "confirmacionRecepcionCliente": { "type": "boolean", "description": "Confirmación de recepción del cliente" }
        }
      },
      "garantias": {
        "type": "array",
        "description": "Garantía de servicio a los trabajos que corresponda",
        "items": {
          "type": "object",
          "required": ["duracion", "fechaInicio", "condiciones", "exclusiones"],
          "properties": {
            "duracion": { "type": "string", "description": "Duración" },
            "fechaInicio": { "type": "string", "format": "date-time", "description": "Fecha de inicio" },
            "condiciones": { "type": "string", "description": "Condiciones" },
            "exclusiones": { "type": "string", "description": "Exclusiones" },
            "solicitudes": {
              "type": "array",
              "description": "Solicitud vinculada con el trabajo original si hay inconveniente",
              "items": {
                "type": "object",
                "required": ["descripcion", "fecha", "evidencias", "estado"],
                "properties": {
                  "descripcion": { "type": "string", "description": "Descripción" },
                  "fecha": { "type": "string", "format": "date-time", "description": "Fecha" },
                  "evidencias": {
                    "type": "array",
                    "items": { "type": "string" },
                    "description": "Evidencias"
                  },
                  "estado": { "type": "string", "description": "Estado" },
                  "procede": { "type": "boolean", "description": "Si la solicitud procede" },
                  "solucionAplicada": { "type": "string", "description": "Solución aplicada" }
                }
              }
            }
          }
        }
      },
      "valoracion": {
        "type": "object",
        "description": "Valorar los servicios de las órdenes entregadas",
        "properties": {
          "calificacionNumerica": { "type": "integer", "minimum": 1, "maximum": 5, "description": "Calificación numérica" },
          "comentarios": { "type": "string", "description": "Comentarios" },
          "sugerencias": { "type": "string", "description": "Sugerencias" }
        }
      }
    }
  }
};

// =============================================================================
// 2. DOCUMENTOS DE MUESTRA (100% basados en el PDF)
// =============================================================================
const samples = {
  usuarios: [
    {
      "_id": "652f0fa5e4b02b9a87654321",
      "nombreCompleto": "Carlos Andrés Echeverry",
      "documentoIdentificacion": "1144123456",
      "correoElectronico": "carlos.echeverry@uao.edu.co",
      "numeroTelefono": "3154879621",
      "rol": "cliente",
      "direccion": "Carrera 100 # 16-20, Ciudad Jardín, Cali"
    },
    {
      "_id": "652f0fa5e4b02b9a87654322",
      "nombreCompleto": "Jhonatan Riascos Mina",
      "documentoIdentificacion": "16789452",
      "correoElectronico": "jhonatan.tecnico@tallercycle.com",
      "numeroTelefono": "3006549871",
      "rol": "tecnico"
    },
    {
      "_id": "652f0fa5e4b02b9a87654323",
      "nombreCompleto": "Ingrid Marín Perea",
      "documentoIdentificacion": "31987456",
      "correoElectronico": "ingrid.coordinadora@tallercycle.com",
      "numeroTelefono": "3103216549",
      "rol": "coordinador"
    }
  ],

  bicicletas: [
    {
      "_id": "652f10b8e4b02b9a12345678",
      "propietarioId": "652f0fa5e4b02b9a87654321",
      "marca": "Specialized",
      "modelo": "Stumpjumper Comp Alloy",
      "tipo": "montaña",
      "color": "Rojo Carmín / Negro",
      "numeroSerie": "WSBC601248596T",
      "caracteristicasComunes": {
        "tamanoMarco": "M",
        "material": "Aluminio M5",
        "tamanoRueda": "29\"",
        "tipoFrenos": "Disco Hidráulico SRAM G2 R",
        "transmision": "SRAM NX Eagle 1x12"
      },
      "especificacionesTipo": {
        "suspension": "Horquilla FOX FLOAT 34 Rhythm",
        "recorrido": "140mm"
      }
    },
    {
      "_id": "652f10b8e4b02b9a12345679",
      "propietarioId": "652f0fa5e4b02b9a87654321",
      "marca": "Trek",
      "modelo": "Powerfly 4 Gen 4",
      "tipo": "eléctrica",
      "color": "Gris Titanio",
      "numeroSerie": "WTU320C98541L",
      "caracteristicasComunes": {
        "tamanoMarco": "S",
        "material": "Aluminio Alpha Platinum",
        "tamanoRueda": "27.5\"",
        "tipoFrenos": "Disco Hidráulico Tektro",
        "transmision": "Shimano Deore 1x10"
      },
      "especificacionesTipo": {
        "bateria": "Bosch PowerTube 625Wh",
        "motor": "Bosch Performance CX 250W"
      }
    }
  ],

  catalogo_servicios: [
    {
      "_id": "652f11cfe4b02b9a33445566",
      "nombre": "Mantenimiento Preventivo de Frenos",
      "categoria": "frenos",
      "descripcion": "Purga de fluido hidráulico, desgasificado de pastillas y centrado de discos.",
      "duracionEstimada": "60 minutos",
      "precioReferencia": 55000.0,
      "tareasHabituales": [
        "Extracción de fluido degradado",
        "Inyección de fluido DOT o mineral nuevo",
        "Alineación de cáliper"
      ],
      "recomendaciones": [
        "No lavar pastillas ni rotores con solventes derivados de petróleo.",
        "Asentar las pastillas nuevas en los primeros 20 km."
      ]
    }
  ],

  citas: [
    {
      "_id": "652f12e0e4b02b9a77889900",
      "clienteId": "652f0fa5e4b02b9a87654321",
      "bicicletaId": "652f10b8e4b02b9a12345678",
      "fecha": "2026-10-15",
      "hora": "09:00",
      "motivo": "Revisión pre-competencia y purga de frenos",
      "problemasObservados": "Pérdida de potencia en freno trasero",
      "serviciosInteres": ["frenos", "mantenimiento preventivo"],
      "estado": "atendida",
      "observacionCambio": "Se adelantó 15 minutos por disponibilidad de banco de trabajo",
      "coordinadorId": "652f0fa5e4b02b9a87654323"
    }
  ],

  ordenes_servicio: [
    {
      "_id": "652f13f1e4b02b9abbccddee",
      "citaId": "652f12e0e4b02b9a77889900",
      "cliente": {
        "usuarioId": "652f0fa5e4b02b9a87654321",
        "nombreCompleto": "Carlos Andrés Echeverry",
        "documentoIdentificacion": "1144123456",
        "numeroTelefono": "3154879621",
        "correoElectronico": "carlos.echeverry@uao.edu.co",
        "direccion": "Carrera 100 # 16-20, Ciudad Jardín, Cali"
      },
      "bicicleta": {
        "bicicletaId": "652f10b8e4b02b9a12345678",
        "marca": "Specialized",
        "modelo": "Stumpjumper Comp Alloy",
        "tipo": "montaña",
        "color": "Rojo Carmín / Negro",
        "numeroSerie": "WSBC601248596T"
      },
      "fechaRecepcion": "2026-10-15T09:15:00Z",
      "fechaEstimadaEntrega": "2026-10-16T17:00:00Z",
      "coordinadorResponsable": {
        "coordinadorId": "652f0fa5e4b02b9a87654323",
        "nombreCompleto": "Ingrid Marín Perea"
      },
      "tecnicosAsignados": [
        {
          "tecnicoId": "652f0fa5e4b02b9a87654322",
          "nombreCompleto": "Jhonatan Riascos Mina"
        }
      ],
      "estado": "entregada",
      "recepcion": {
        "problemaReportado": "Pérdida de tacto en maneta trasera y ruido metálico",
        "condicionesObservadas": "Bicicleta con barro moderado y cadena seca",
        "accesoriosEntregados": ["Soporte de ciclo-computador Garmin"],
        "fotografias": [
          {
            "nombreArchivo": "recepcion_lateral.jpg",
            "descripcion": "Foto general de ingreso",
            "ubicacion": "https://storage.tallercycle.com/evidencias/recepcion.jpg"
          }
        ]
      },
      "diagnostico": {
        "componentesRevisados": ["Frenos Hidráulicos", "Transmisión"],
        "condicion": "Desgaste severo en pastillas traseras y líquido DOT degradado",
        "hallazgos": [
          {
            "componente": "Freno Trasero",
            "descripcion": "Pastillas cristalizadas con espesor al 10%",
            "prioridadAtencion": "alta",
            "observaciones": "Riesgo de daño al rotor",
            "evidencias": [
              {
                "nombreArchivo": "pastilla_desgastada.jpg",
                "descripcion": "Evidencia de pastilla cristalizada",
                "ubicacion": "https://storage.tallercycle.com/evidencias/pastilla.jpg"
              }
            ]
          }
        ],
        "accionesRecomendadas": ["Purga completa y sustitución de pastillas traseras"]
      },
      "propuesta": {
        "trabajos": [
          {
            "servicioODescripcion": "Purga de freno trasero y cambio de pastillas",
            "componenteInvolucrado": "Frenos Hidráulicos",
            "costoEstimadoManoObra": 45000.0,
            "repuestosPrevistos": [
              {
                "nombre": "Pastillas Metálicas SRAM G2",
                "especificacionesRelevantes": "Sinterizadas originales",
                "cantidad": 1,
                "precioUnitarioEstimado": 95000.0
              }
            ],
            "observaciones": "Requiere purga con líquido DOT 5.1",
            "autorizacionCliente": {
              "decision": "autorizado",
              "fecha": "2026-10-15T12:30:00Z",
              "comentarios": "Aprobado con repuesto original"
            }
          }
        ],
        "valorEstimadoPropuesta": 140000.0
      },
      "ejecucion": {
        "trabajosRealizados": [
          {
            "responsable": "Jhonatan Riascos Mina",
            "fechaInicio": "2026-10-15T14:00:00Z",
            "fechaFinalizacion": "2026-10-15T15:30:00Z",
            "estado": "finalizado",
            "descripcionRealizada": "Se purgaron ductos, instalaron pastillas nuevas y se ajustó cáliper",
            "repuestosUtilizados": [
              {
                "nombre": "Pastillas Metálicas SRAM G2",
                "cantidad": 1,
                "precioUnitarioAplicado": 95000.0
              }
            ]
          }
        ]
      },
      "historialCambiosEstado": [
        {
          "fecha": "2026-10-15T09:15:00Z",
          "usuarioResponsable": "Ingrid Marín Perea",
          "observacion": "Bicicleta recibida en taller",
          "estado": "recibida"
        },
        {
          "fecha": "2026-10-15T10:30:00Z",
          "usuarioResponsable": "Jhonatan Riascos Mina",
          "observacion": "Inicio de diagnóstico técnico",
          "estado": "en diagnóstico"
        },
        {
          "fecha": "2026-10-15T12:00:00Z",
          "usuarioResponsable": "Ingrid Marín Perea",
          "observacion": "Propuesta enviada al cliente",
          "estado": "pendiente de autorización"
        },
        {
          "fecha": "2026-10-15T13:45:00Z",
          "usuarioResponsable": "Ingrid Marín Perea",
          "observacion": "Cliente autorizó propuesta de intervención",
          "estado": "en ejecución"
        },
        {
          "fecha": "2026-10-15T16:00:00Z",
          "usuarioResponsable": "Jhonatan Riascos Mina",
          "observacion": "Trabajo concluido y revisión técnica aprobada",
          "estado": "lista para entrega"
        },
        {
          "fecha": "2026-10-15T17:30:00Z",
          "usuarioResponsable": "Ingrid Marín Perea",
          "observacion": "Bicicleta entregada al cliente",
          "estado": "entregada"
        }
      ],
      "revisionEntrega": {
        "puntosVerificados": [
          { "punto": "Tacto firme de freno", "resultado": true },
          { "punto": "Ausencia de roce disco-pastilla", "resultado": true },
          { "punto": "Entrega de accesorios completos", "resultado": true }
        ],
        "resultado": "Aprobado",
        "recomendacionesUsoMantenimiento": "Asentar pastillas durante los primeros 20 km",
        "aprobada": true
      },
      "entrega": {
        "fecha": "2026-10-15T17:30:00Z",
        "confirmacionRecepcionCliente": true
      },
      "garantias": [
        {
          "duracion": "30 días",
          "fechaInicio": "2026-10-15T17:30:00Z",
          "condiciones": "Cubre fallas de purga o desajuste de cáliper",
          "exclusiones": "No cubre lavado abrasivo ni contaminación con aceites externos",
          "solicitudes": []
        }
      ],
      "valoracion": {
        "calificacionNumerica": 5,
        "comentarios": "Excelente atención y los frenos quedaron con tacto impecable",
        "sugerencias": "Ninguna, excelente servicio"
      }
    }
  ]
};

// =============================================================================
// 3. ESCRIBIR ARCHIVOS EN REPOSITORIO Y EN DESCARGAS
// =============================================================================
const repoSchemasDir = 'C:\\Users\\Usuario\\Documents\\proyecto-bd2-taller-bicicletas\\model\\schemas';
const repoSamplesDir = 'C:\\Users\\Usuario\\Documents\\proyecto-bd2-taller-bicicletas\\model\\samples';
const dlDir = 'C:\\Users\\Usuario\\Downloads\\Hackolade_Colecciones_JSON';

const names = ['usuarios', 'bicicletas', 'catalogo_servicios', 'citas', 'ordenes_servicio'];

names.forEach(name => {
  const schemaContent = JSON.stringify(schemas[name], null, 2);
  fs.writeFileSync(path.join(repoSchemasDir, `${name}.schema.json`), schemaContent, 'utf8');
  fs.writeFileSync(path.join(dlDir, `${name}.schema.json`), schemaContent, 'utf8');

  const sampleContent = JSON.stringify(samples[name], null, 2);
  fs.writeFileSync(path.join(repoSamplesDir, `${name}.sample.json`), sampleContent, 'utf8');
  fs.writeFileSync(path.join(dlDir, `${name}.sample.json`), sampleContent, 'utf8');
});

console.log('[✓] Archivos JSON Schemas y Samples 100% basados en el PDF actualizados exitosamente.');
