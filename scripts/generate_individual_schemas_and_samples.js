const fs = require('fs');
const path = require('path');

// 1. ESQUEMAS JSON SCHEMA (Compatibles con Reverse Engineer > JSON Schema en Hackolade)
const schemas = {
  usuarios: {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "usuarios",
    "type": "object",
    "required": ["nombre", "documento", "correo", "telefono", "rol", "fechaCreacion", "activo"],
    "properties": {
      "_id": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$", "description": "ObjectId de MongoDB" },
      "nombre": { "type": "string", "minLength": 3, "maxLength": 120 },
      "documento": { "type": "string", "pattern": "^[0-9A-Za-z-]{5,20}$" },
      "correo": { "type": "string", "format": "email" },
      "telefono": { "type": "string" },
      "rol": { "type": "string", "enum": ["cliente", "tecnico", "coordinador", "administrador"] },
      "direccion": { "type": "string" },
      "fechaCreacion": { "type": "string", "format": "date-time" },
      "activo": { "type": "boolean" }
    }
  },

  bicicletas: {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "bicicletas",
    "type": "object",
    "required": ["propietarioId", "marca", "modelo", "tipo", "color", "caracteristicasComunes", "fechaRegistro", "activo"],
    "properties": {
      "_id": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" },
      "propietarioId": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$", "description": "Referencia a usuarios._id" },
      "marca": { "type": "string" },
      "modelo": { "type": "string" },
      "tipo": { "type": "string", "enum": ["urbana", "ruta", "montaña", "eléctrica"] },
      "color": { "type": "string" },
      "numeroSerie": { "type": ["string", "null"] },
      "caracteristicasComunes": {
        "type": "object",
        "required": ["tamanoMarco", "material", "tamanoRueda", "tipoFrenos", "transmision"],
        "properties": {
          "tamanoMarco": { "type": "string" },
          "material": { "type": "string" },
          "tamanoRueda": { "type": "string" },
          "tipoFrenos": { "type": "string" },
          "transmision": { "type": "string" }
        }
      },
      "especificacionesTipo": {
        "type": "object",
        "properties": {
          "suspension": { "type": "string" },
          "recorrido": { "type": "string" },
          "bateria": { "type": "string" },
          "motor": { "type": "string" }
        }
      },
      "fechaRegistro": { "type": "string", "format": "date-time" },
      "activo": { "type": "boolean" }
    }
  },

  catalogo_servicios: {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "catalogo_servicios",
    "type": "object",
    "required": ["nombre", "categoria", "descripcion", "duracionEstimadaMinutos", "precioReferencia", "tareasHabituales", "activo"],
    "properties": {
      "_id": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" },
      "nombre": { "type": "string" },
      "categoria": {
        "type": "string",
        "enum": [
          "mantenimiento preventivo",
          "frenos",
          "transmisión",
          "ruedas",
          "suspensión",
          "componentes eléctricos"
        ]
      },
      "descripcion": { "type": "string" },
      "duracionEstimadaMinutos": { "type": "integer", "minimum": 15 },
      "precioReferencia": { "type": "number" },
      "tareasHabituales": {
        "type": "array",
        "items": { "type": "string" }
      },
      "recomendaciones": {
        "type": "array",
        "items": { "type": "string" }
      },
      "activo": { "type": "boolean" }
    }
  },

  citas: {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "citas",
    "type": "object",
    "required": ["clienteId", "bicicletaId", "fechaHora", "motivo", "estado", "fechaCreacion"],
    "properties": {
      "_id": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" },
      "clienteId": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" },
      "bicicletaId": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" },
      "fechaHora": { "type": "string", "format": "date-time" },
      "motivo": { "type": "string" },
      "problemasReportados": { "type": "string" },
      "serviciosInteres": {
        "type": "array",
        "items": { "type": "string" }
      },
      "estado": { "type": "string", "enum": ["solicitada", "confirmada", "atendida", "cancelada"] },
      "observaciones": { "type": "string" },
      "coordinadorId": { "type": ["string", "null"] },
      "fechaCreacion": { "type": "string", "format": "date-time" }
    }
  },

  ordenes_servicio: {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "ordenes_servicio",
    "type": "object",
    "required": ["numeroOrden", "cliente", "bicicleta", "estado", "recepcion", "historialEstados"],
    "properties": {
      "_id": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" },
      "numeroOrden": { "type": "string", "pattern": "^ORD-[0-9]{4}-[0-9]{5}$" },
      "citaId": { "type": ["string", "null"] },
      "cliente": {
        "type": "object",
        "required": ["usuarioId", "nombre", "documento", "telefono", "correo"],
        "properties": {
          "usuarioId": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" },
          "nombre": { "type": "string" },
          "documento": { "type": "string" },
          "telefono": { "type": "string" },
          "correo": { "type": "string" },
          "direccion": { "type": "string" }
        }
      },
      "bicicleta": {
        "type": "object",
        "required": ["bicicletaId", "marca", "modelo", "tipo", "color"],
        "properties": {
          "bicicletaId": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" },
          "marca": { "type": "string" },
          "modelo": { "type": "string" },
          "tipo": { "type": "string", "enum": ["urbana", "ruta", "montaña", "eléctrica"] },
          "color": { "type": "string" },
          "numeroSerie": { "type": ["string", "null"] }
        }
      },
      "coordinadorId": { "type": ["string", "null"] },
      "tecnicosAsignados": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["tecnicoId", "nombre"],
          "properties": {
            "tecnicoId": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" },
            "nombre": { "type": "string" }
          }
        }
      },
      "estado": {
        "type": "string",
        "enum": ["recibida", "en_diagnostico", "pendiente_autorizacion", "en_ejecucion", "lista_para_entrega", "entregada", "cancelada"]
      },
      "recepcion": {
        "type": "object",
        "required": ["fechaRecepcion", "problemaReportado", "condicionesObservadas"],
        "properties": {
          "fechaRecepcion": { "type": "string", "format": "date-time" },
          "fechaEstimadaEntrega": { "type": "string", "format": "date-time" },
          "problemaReportado": { "type": "string" },
          "condicionesObservadas": { "type": "string" },
          "accesoriosEntregados": {
            "type": "array",
            "items": { "type": "string" }
          },
          "fotografias": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["nombreArchivo", "ubicacion"],
              "properties": {
                "nombreArchivo": { "type": "string" },
                "descripcion": { "type": "string" },
                "ubicacion": { "type": "string" }
              }
            }
          }
        }
      },
      "diagnostico": {
        "type": "object",
        "properties": {
          "fechaDiagnostico": { "type": "string", "format": "date-time" },
          "tecnicoResponsableId": { "type": "string" },
          "componentesRevisados": {
            "type": "array",
            "items": { "type": "string" }
          },
          "hallazgos": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["componente", "descripcion", "prioridad"],
              "properties": {
                "componente": { "type": "string" },
                "descripcion": { "type": "string" },
                "prioridad": { "type": "string", "enum": ["baja", "media", "alta", "critica"] },
                "observaciones": { "type": "string" },
                "evidencias": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": ["nombreArchivo", "ubicacion"],
                    "properties": {
                      "nombreArchivo": { "type": "string" },
                      "descripcion": { "type": "string" },
                      "ubicacion": { "type": "string" }
                    }
                  }
                }
              }
            }
          },
          "accionesRecomendadas": {
            "type": "array",
            "items": { "type": "string" }
          }
        }
      },
      "propuesta": {
        "type": "object",
        "properties": {
          "fechaPropuesta": { "type": "string", "format": "date-time" },
          "trabajos": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["trabajoId", "descripcion", "componente", "costoEstimadoManoObra", "estadoAutorizacion"],
              "properties": {
                "trabajoId": { "type": "string" },
                "servicioCatalogoId": { "type": ["string", "null"] },
                "descripcion": { "type": "string" },
                "componente": { "type": "string" },
                "costoEstimadoManoObra": { "type": "number" },
                "repuestosPrevistos": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": ["nombre", "cantidad", "precioUnitarioEstimado"],
                    "properties": {
                      "nombre": { "type": "string" },
                      "especificaciones": { "type": "string" },
                      "cantidad": { "type": "integer" },
                      "precioUnitarioEstimado": { "type": "number" }
                    }
                  }
                },
                "estadoAutorizacion": { "type": "string", "enum": ["pendiente", "autorizado", "rechazado"] },
                "decisionCliente": {
                  "type": "object",
                  "properties": {
                    "fechaDecision": { "type": "string", "format": "date-time" },
                    "comentarios": { "type": "string" }
                  }
                },
                "observaciones": { "type": "string" }
              }
            }
          },
          "valorTotalEstimado": { "type": "number" }
        }
      },
      "ejecucion": {
        "type": "object",
        "properties": {
          "trabajosRealizados": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["trabajoId", "responsableId", "estado"],
              "properties": {
                "trabajoId": { "type": "string" },
                "responsableId": { "type": "string" },
                "fechaInicio": { "type": "string", "format": "date-time" },
                "fechaFinalizacion": { "type": "string", "format": "date-time" },
                "estado": { "type": "string", "enum": ["en_progreso", "finalizado", "detenido"] },
                "descripcionRealizada": { "type": "string" },
                "repuestosUtilizados": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "required": ["nombre", "cantidad", "precioUnitarioAplicado"],
                    "properties": {
                      "nombre": { "type": "string" },
                      "cantidad": { "type": "integer" },
                      "precioUnitarioAplicado": { "type": "number" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "historialEstados": {
        "type": "array",
        "minItems": 1,
        "items": {
          "type": "object",
          "required": ["estado", "fecha", "usuarioResponsableId"],
          "properties": {
            "estado": { "type": "string", "enum": ["recibida", "en_diagnostico", "pendiente_autorizacion", "en_ejecucion", "lista_para_entrega", "entregada", "cancelada"] },
            "fecha": { "type": "string", "format": "date-time" },
            "usuarioResponsableId": { "type": "string" },
            "observacion": { "type": "string" }
          }
        }
      },
      "revisionEntrega": {
        "type": "object",
        "properties": {
          "fechaRevision": { "type": "string", "format": "date-time" },
          "puntosVerificados": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["punto", "resultado"],
              "properties": {
                "punto": { "type": "string" },
                "resultado": { "type": "boolean" }
              }
            }
          },
          "aprobada": { "type": "boolean" },
          "recomendaciones": { "type": "string" }
        }
      },
      "entregaConfirmada": {
        "type": "object",
        "properties": {
          "fechaEntrega": { "type": "string", "format": "date-time" },
          "confirmacionCliente": { "type": "boolean" }
        }
      },
      "garantias": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["trabajoId", "duracionDias", "fechaInicio"],
          "properties": {
            "trabajoId": { "type": "string" },
            "duracionDias": { "type": "integer" },
            "fechaInicio": { "type": "string", "format": "date-time" },
            "condiciones": { "type": "string" },
            "exclusiones": { "type": "string" }
          }
        }
      },
      "valoracion": {
        "type": "object",
        "properties": {
          "calificacion": { "type": "integer", "minimum": 1, "maximum": 5 },
          "comentarios": { "type": "string" },
          "sugerencias": { "type": "string" },
          "fechaValoracion": { "type": "string", "format": "date-time" }
        }
      }
    }
  }
};

// 2. DOCUMENTOS JSON DE MUESTRA (Para Reverse Engineer > from JSON documents)
const samples = {
  usuarios: [
    {
      "_id": "652f0fa5e4b02b9a87654321",
      "nombre": "Carlos Andrés Echeverry",
      "documento": "1144123456",
      "correo": "carlos.echeverry@uao.edu.co",
      "telefono": "3154879621",
      "rol": "cliente",
      "direccion": "Carrera 100 # 16-20, Ciudad Jardín, Cali",
      "fechaCreacion": "2026-01-15T09:30:00Z",
      "activo": true
    },
    {
      "_id": "652f0fa5e4b02b9a87654322",
      "nombre": "Jhonatan Riascos Mina",
      "documento": "16789452",
      "correo": "jhonatan.tecnico@tallercycle.com",
      "telefono": "3006549871",
      "rol": "tecnico",
      "direccion": "Barrio San Antonio, Cali",
      "fechaCreacion": "2025-11-01T08:00:00Z",
      "activo": true
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
        "tipoFrenos": "Disco Hidráulico SRAM G2 R 4 Pistones",
        "transmision": "SRAM NX Eagle 1x12"
      },
      "especificacionesTipo": {
        "suspension": "Horquilla FOX FLOAT 34 Rhythm y Shock FOX FLOAT DPS Performance",
        "recorrido": "140mm delantero / 130mm trasero"
      },
      "fechaRegistro": "2026-01-20T10:00:00Z",
      "activo": true
    },
    {
      "_id": "652f10b8e4b02b9a12345679",
      "propietarioId": "652f0fa5e4b02b9a87654321",
      "marca": "Trek",
      "modelo": "Powerfly 4 Gen 4",
      "tipo": "eléctrica",
      "color": "Gris Titanio / Amarillo Flúor",
      "numeroSerie": "WTU320C98541L",
      "caracteristicasComunes": {
        "tamanoMarco": "S",
        "material": "Aluminio Alpha Platinum",
        "tamanoRueda": "27.5\"",
        "tipoFrenos": "Disco Hidráulico Tektro HD-M275",
        "transmision": "Shimano Deore M4100 1x10"
      },
      "especificacionesTipo": {
        "bateria": "Bosch PowerTube 625Wh",
        "motor": "Bosch Performance CX 250W"
      },
      "fechaRegistro": "2026-02-12T16:00:00Z",
      "activo": true
    }
  ],

  catalogo_servicios: [
    {
      "_id": "652f11cfe4b02b9a33445566",
      "nombre": "Mantenimiento General Preventivo",
      "categoria": "mantenimiento preventivo",
      "descripcion": "Desarme general, limpieza de transmisión por ultrasonido, engrase de rodamientos y ajuste general.",
      "duracionEstimadaMinutos": 180,
      "precioReferencia": 120000.0,
      "tareasHabituales": [
        "Lavado y desengrase de transmisión",
        "Engrase de rodamientos sellados",
        "Calibración de cambios y frenos"
      ],
      "recomendaciones": [
        "Realizar cada 600 km o 3 meses",
        "Lubricar cadena con cera especial"
      ],
      "activo": true
    }
  ],

  citas: [
    {
      "_id": "652f12e0e4b02b9a77889900",
      "clienteId": "652f0fa5e4b02b9a87654321",
      "bicicletaId": "652f10b8e4b02b9a12345678",
      "fechaHora": "2026-10-15T09:00:00Z",
      "motivo": "Revisión pre-competencia y purga de frenos",
      "problemasReportados": "Freno trasero esponjoso y pérdida de tacto",
      "serviciosInteres": ["Purga de Frenos Hidráulicos", "Mantenimiento General Preventivo"],
      "estado": "atendida",
      "observaciones": "Cita cumplida, bicicleta recibida y orden generada",
      "coordinadorId": "652f0fa5e4b02b9a87654323",
      "fechaCreacion": "2026-10-13T11:00:00Z"
    }
  ],

  ordenes_servicio: [
    {
      "_id": "652f13f1e4b02b9abbccddee",
      "numeroOrden": "ORD-2026-00001",
      "citaId": "652f12e0e4b02b9a77889900",
      "cliente": {
        "usuarioId": "652f0fa5e4b02b9a87654321",
        "nombre": "Carlos Andrés Echeverry",
        "documento": "1144123456",
        "telefono": "3154879621",
        "correo": "carlos.echeverry@uao.edu.co",
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
      "coordinadorId": "652f0fa5e4b02b9a87654323",
      "tecnicosAsignados": [
        {
          "tecnicoId": "652f0fa5e4b02b9a87654322",
          "nombre": "Jhonatan Riascos Mina"
        }
      ],
      "estado": "entregada",
      "recepcion": {
        "fechaRecepcion": "2026-10-15T09:15:00Z",
        "fechaEstimadaEntrega": "2026-10-16T17:00:00Z",
        "problemaReportado": "Pérdida de tacto en maneta de freno trasero, ruido en transmisión",
        "condicionesObservadas": "Bicicleta con barro moderado, cadena reseca",
        "accesoriosEntregados": ["Soporte de ciclo-computador Garmin", "Porta-caramañola"],
        "fotografias": [
          {
            "nombreArchivo": "recepcion_lateral.jpg",
            "descripcion": "Foto lateral de ingreso",
            "ubicacion": "https://storage.tallercycle.com/evidencias/recepcion_lateral.jpg"
          }
        ]
      },
      "diagnostico": {
        "fechaDiagnostico": "2026-10-15T11:00:00Z",
        "tecnicoResponsableId": "652f0fa5e4b02b9a87654322",
        "componentesRevisados": ["Frenos Hidráulicos", "Transmisión", "Suspensión"],
        "hallazgos": [
          {
            "componente": "Freno Trasero",
            "descripcion": "Pastillas cristalizadas al 10% y líquido degradado",
            "prioridad": "alta",
            "observaciones": "Riesgo de daño en rotor",
            "evidencias": [
              {
                "nombreArchivo": "pastilla_desgastada.jpg",
                "descripcion": "Pastilla al límite",
                "ubicacion": "https://storage.tallercycle.com/evidencias/pastilla.jpg"
              }
            ]
          }
        ],
        "accionesRecomendadas": ["Purga y cambio de pastillas traseras"]
      },
      "propuesta": {
        "fechaPropuesta": "2026-10-15T12:00:00Z",
        "trabajos": [
          {
            "trabajoId": "TRAB-001",
            "servicioCatalogoId": "652f11cfe4b02b9a33445566",
            "descripcion": "Purga de freno trasero y cambio de pastillas",
            "componente": "Frenos",
            "costoEstimadoManoObra": 45000.0,
            "repuestosPrevistos": [
              {
                "nombre": "Pastillas Metálicas SRAM G2",
                "especificaciones": "Sinterizadas",
                "cantidad": 1,
                "precioUnitarioEstimado": 95000.0
              }
            ],
            "estadoAutorizacion": "autorizado",
            "decisionCliente": {
              "fechaDecision": "2026-10-15T12:30:00Z",
              "comentarios": "Aprobado repuesto original"
            },
            "observaciones": "Confirmado por el cliente"
          }
        ],
        "valorTotalEstimado": 140000.0
      },
      "ejecucion": {
        "trabajosRealizados": [
          {
            "trabajoId": "TRAB-001",
            "responsableId": "652f0fa5e4b02b9a87654322",
            "fechaInicio": "2026-10-15T14:00:00Z",
            "fechaFinalizacion": "2026-10-15T15:30:00Z",
            "estado": "finalizado",
            "descripcionRealizada": "Purga completa con líquido nuevo y calibración",
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
      "historialEstados": [
        {
          "estado": "recibida",
          "fecha": "2026-10-15T09:15:00Z",
          "usuarioResponsableId": "652f0fa5e4b02b9a87654323",
          "observacion": "Bicicleta ingresada con cita"
        },
        {
          "estado": "en_diagnostico",
          "fecha": "2026-10-15T10:30:00Z",
          "usuarioResponsableId": "652f0fa5e4b02b9a87654322",
          "observacion": "Inicio de revisión"
        },
        {
          "estado": "pendiente_autorizacion",
          "fecha": "2026-10-15T12:00:00Z",
          "usuarioResponsableId": "652f0fa5e4b02b9a87654323",
          "observacion": "Cotización enviada"
        },
        {
          "estado": "en_ejecucion",
          "fecha": "2026-10-15T13:45:00Z",
          "usuarioResponsableId": "652f0fa5e4b02b9a87654323",
          "observacion": "Cliente autorizó TRAB-001"
        },
        {
          "estado": "lista_para_entrega",
          "fecha": "2026-10-15T16:00:00Z",
          "usuarioResponsableId": "652f0fa5e4b02b9a87654322",
          "observacion": "Control de calidad aprobado"
        },
        {
          "estado": "entregada",
          "fecha": "2026-10-15T17:30:00Z",
          "usuarioResponsableId": "652f0fa5e4b02b9a87654323",
          "observacion": "Retirada a satisfacción"
        }
      ],
      "revisionEntrega": {
        "fechaRevision": "2026-10-15T15:50:00Z",
        "puntosVerificados": [
          { "punto": "Tacto de freno", "resultado": true },
          { "punto": "Ausencia de roces", "resultado": true }
        ],
        "aprobada": true,
        "recomendaciones": "Asentar pastillas los primeros 20 km"
      },
      "entregaConfirmada": {
        "fechaEntrega": "2026-10-15T17:30:00Z",
        "confirmacionCliente": true
      },
      "garantias": [
        {
          "trabajoId": "TRAB-001",
          "duracionDias": 30,
          "fechaInicio": "2026-10-15T17:30:00Z",
          "condiciones": "Cubre fallas de purga y reajuste",
          "exclusiones": "No cubre lavado abrasivo"
        }
      ],
      "valoracion": {
        "calificacion": 5,
        "comentarios": "Excelente servicio, la frenada quedó impecable",
        "sugerencias": "Ninguna, muy amables",
        "fechaValoracion": "2026-10-15T19:00:00Z"
      }
    }
  ]
};

// Rutas de salida
const repoSchemasDir = 'C:\\Users\\Usuario\\Documents\\proyecto-bd2-taller-bicicletas\\model\\schemas';
const repoSamplesDir = 'C:\\Users\\Usuario\\Documents\\proyecto-bd2-taller-bicicletas\\model\\samples';
const dlDir = 'C:\\Users\\Usuario\\Downloads\\Hackolade_Colecciones_JSON';

const names = ['usuarios', 'bicicletas', 'catalogo_servicios', 'citas', 'ordenes_servicio'];

names.forEach(name => {
  // 1. Guardar Schemas (.schema.json)
  const schemaContent = JSON.stringify(schemas[name], null, 2);
  fs.writeFileSync(path.join(repoSchemasDir, `${name}.schema.json`), schemaContent, 'utf8');
  fs.writeFileSync(path.join(dlDir, `${name}.schema.json`), schemaContent, 'utf8');

  // 2. Guardar Samples (.json)
  const sampleContent = JSON.stringify(samples[name], null, 2);
  fs.writeFileSync(path.join(repoSamplesDir, `${name}.sample.json`), sampleContent, 'utf8');
  fs.writeFileSync(path.join(dlDir, `${name}.sample.json`), sampleContent, 'utf8');
});

console.log('[✓] Archivos individuales generados en repo y en Downloads/Hackolade_Colecciones_JSON');
