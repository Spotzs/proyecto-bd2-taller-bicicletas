/**
 * Universidad Autónoma de Occidente (UAO)
 * Asignatura: Bases de Datos 2
 * Proyecto: Sistema de Gestión de Servicios de Mantenimiento y Reparación de Bicicletas
 * 
 * Script: 03_seed_data.js
 * Descripción: Inserción de datos de prueba representativos ajustados estrictamente al PDF.
 */

const dbName = "taller_bicicletas_db";
const db = db.getSiblingDB(dbName);

print(`[+] Insertando datos de prueba en: ${dbName}`);

db.usuarios.deleteMany({});
db.bicicletas.deleteMany({});
db.catalogo_servicios.deleteMany({});
db.citas.deleteMany({});
db.ordenes_servicio.deleteMany({});

// 1. USUARIOS
const cliente1Id = new ObjectId();
const tecnico1Id = new ObjectId();
const coordinador1Id = new ObjectId();

db.usuarios.insertMany([
  {
    _id: cliente1Id,
    nombreCompleto: "Carlos Andrés Echeverry",
    documentoIdentificacion: "1144123456",
    correoElectronico: "carlos.echeverry@uao.edu.co",
    numeroTelefono: "3154879621",
    rol: "cliente",
    direccion: "Carrera 100 # 16-20, Ciudad Jardín, Cali"
  },
  {
    _id: tecnico1Id,
    nombreCompleto: "Jhonatan Riascos Mina",
    documentoIdentificacion: "16789452",
    correoElectronico: "jhonatan.tecnico@tallercycle.com",
    numeroTelefono: "3006549871",
    rol: "tecnico"
  },
  {
    _id: coordinador1Id,
    nombreCompleto: "Ingrid Marín Perea",
    documentoIdentificacion: "31987456",
    correoElectronico: "ingrid.marin@tallercycle.com",
    numeroTelefono: "3103216549",
    rol: "coordinador"
  }
]);

// 2. BICICLETAS
const biciMontanaId = new ObjectId();
const biciElectricaId = new ObjectId();

db.bicicletas.insertMany([
  {
    _id: biciMontanaId,
    propietarioId: cliente1Id,
    marca: "Specialized",
    modelo: "Stumpjumper Comp Alloy",
    tipo: "montaña",
    color: "Rojo Carmín / Negro",
    numeroSerie: "WSBC601248596T",
    caracteristicasComunes: {
      tamanoMarco: "M",
      material: "Aluminio M5",
      tamanoRueda: "29\"",
      tipoFrenos: "Disco Hidráulico SRAM G2 R",
      transmision: "SRAM NX Eagle 1x12"
    },
    especificacionesTipo: {
      suspension: "Horquilla FOX FLOAT 34 Rhythm",
      recorrido: "140mm"
    }
  },
  {
    _id: biciElectricaId,
    propietarioId: cliente1Id,
    marca: "Trek",
    modelo: "Powerfly 4 Gen 4",
    tipo: "eléctrica",
    color: "Gris Titanio",
    numeroSerie: "WTU320C98541L",
    caracteristicasComunes: {
      tamanoMarco: "S",
      material: "Aluminio Alpha Platinum",
      tamanoRueda: "27.5\"",
      tipoFrenos: "Disco Hidráulico Tektro",
      transmision: "Shimano Deore 1x10"
    },
    especificacionesTipo: {
      bateria: "Bosch PowerTube 625Wh",
      motor: "Bosch Performance CX 250W"
    }
  }
]);

// 3. CATÁLOGO DE SERVICIOS
const servFrenosId = new ObjectId();

db.catalogo_servicios.insertOne({
  _id: servFrenosId,
  nombre: "Mantenimiento Preventivo de Frenos",
  categoria: "frenos",
  descripcion: "Purga de fluido hidráulico, desgasificado de pastillas y alineación de mordazas.",
  duracionEstimada: "60 minutos",
  precioReferencia: NumberDecimal("55000.00"),
  tareasHabituales: [
    "Extracción de fluido degradado",
    "Inyección de fluido nuevo DOT 5.1",
    "Centrado de cáliper contra el rotor"
  ],
  recomendaciones: [
    "No contaminar pastillas con aerosoles de lubricación de cadena.",
    "Asentar las pastillas de freno en los primeros 20 km."
  ]
});

// 4. CITAS
const cita1Id = new ObjectId();

db.citas.insertOne({
  _id: cita1Id,
  clienteId: cliente1Id,
  bicicletaId: biciMontanaId,
  fecha: "2026-10-15",
  hora: "09:00",
  motivo: "Revisión pre-competencia y purga de frenos",
  problemasObservados: "Freno trasero esponjoso y pérdida de potencia",
  serviciosInteres: ["frenos", "mantenimiento preventivo"],
  estado: "atendida",
  observacionCambio: "Se adelantó 15 minutos por disponibilidad",
  coordinadorId: coordinador1Id
});

// 5. ORDEN DE SERVICIO
db.ordenes_servicio.insertOne({
  citaId: cita1Id,
  cliente: {
    usuarioId: cliente1Id,
    nombreCompleto: "Carlos Andrés Echeverry",
    documentoIdentificacion: "1144123456",
    numeroTelefono: "3154879621",
    correoElectronico: "carlos.echeverry@uao.edu.co",
    direccion: "Carrera 100 # 16-20, Ciudad Jardín, Cali"
  },
  bicicleta: {
    bicicletaId: biciMontanaId,
    marca: "Specialized",
    modelo: "Stumpjumper Comp Alloy",
    tipo: "montaña",
    color: "Rojo Carmín / Negro",
    numeroSerie: "WSBC601248596T"
  },
  fechaRecepcion: new Date("2026-10-15T09:15:00Z"),
  fechaEstimadaEntrega: new Date("2026-10-16T17:00:00Z"),
  coordinadorResponsable: {
    coordinadorId: coordinador1Id,
    nombreCompleto: "Ingrid Marín Perea"
  },
  tecnicosAsignados: [
    {
      tecnicoId: tecnico1Id,
      nombreCompleto: "Jhonatan Riascos Mina"
    }
  ],
  estado: "entregada",
  recepcion: {
    problemaReportado: "Pérdida de tacto en maneta trasera y ruido metálico",
    condicionesObservadas: "Bicicleta con barro moderado y cadena seca",
    accesoriosEntregados: ["Soporte de ciclo-computador Garmin"],
    fotografias: [
      {
        nombreArchivo: "recepcion_lateral.jpg",
        descripcion: "Foto general de recepción",
        ubicacion: "https://storage.tallercycle.com/evidencias/recepcion.jpg"
      }
    ]
  },
  diagnostico: {
    componentesRevisados: ["Frenos Hidráulicos", "Transmisión"],
    condicion: "Pastillas cristalizadas al 10% y fluido DOT degradado",
    hallazgos: [
      {
        componente: "Freno Trasero",
        descripcion: "Pastillas cristalizadas con espesor al 10%",
        prioridadAtencion: "alta",
        observaciones: "Riesgo de daño al rotor",
        evidencias: [
          {
            nombreArchivo: "pastilla_cristalizada.jpg",
            descripcion: "Evidencia fotográfica",
            ubicacion: "https://storage.tallercycle.com/evidencias/pastilla.jpg"
          }
        ]
      }
    ],
    accionesRecomendadas: ["Purga completa y sustitución de pastillas traseras"]
  },
  propuesta: {
    trabajos: [
      {
        servicioODescripcion: "Purga de freno trasero y cambio de pastillas",
        componenteInvolucrado: "Frenos Hidráulicos",
        costoEstimadoManoObra: NumberDecimal("45000.00"),
        repuestosPrevistos: [
          {
            nombre: "Pastillas Metálicas SRAM G2",
            especificacionesRelevantes: "Sinterizadas originales",
            cantidad: NumberInt(1),
            precioUnitarioEstimado: NumberDecimal("95000.00")
          }
        ],
        observaciones: "Requiere purga con líquido DOT 5.1",
        autorizacionCliente: {
          decision: "autorizado",
          fecha: new Date("2026-10-15T12:30:00Z"),
          comentarios: "Aprobado con repuesto original"
        }
      }
    ],
    valorEstimadoPropuesta: NumberDecimal("140000.00")
  },
  ejecucion: {
    trabajosRealizados: [
      {
        responsable: "Jhonatan Riascos Mina",
        fechaInicio: new Date("2026-10-15T14:00:00Z"),
        fechaFinalizacion: new Date("2026-10-15T15:30:00Z"),
        estado: "finalizado",
        descripcionRealizada: "Se purgaron ductos, instalaron pastillas nuevas y se ajustó cáliper",
        repuestosUtilizados: [
          {
            nombre: "Pastillas Metálicas SRAM G2",
            cantidad: NumberInt(1),
            precioUnitarioAplicado: NumberDecimal("95000.00")
          }
        ]
      }
    ]
  },
  historialCambiosEstado: [
    {
      fecha: new Date("2026-10-15T09:15:00Z"),
      usuarioResponsable: "Ingrid Marín Perea",
      observacion: "Bicicleta recibida en taller",
      estado: "recibida"
    },
    {
      fecha: new Date("2026-10-15T10:30:00Z"),
      usuarioResponsable: "Jhonatan Riascos Mina",
      observacion: "Inicio de diagnóstico técnico",
      estado: "en diagnóstico"
    },
    {
      fecha: new Date("2026-10-15T12:00:00Z"),
      usuarioResponsable: "Ingrid Marín Perea",
      observacion: "Propuesta enviada al cliente",
      estado: "pendiente de autorización"
    },
    {
      fecha: new Date("2026-10-15T13:45:00Z"),
      usuarioResponsable: "Ingrid Marín Perea",
      observacion: "Cliente autorizó propuesta",
      estado: "en ejecución"
    },
    {
      fecha: new Date("2026-10-15T16:00:00Z"),
      usuarioResponsable: "Jhonatan Riascos Mina",
      observacion: "Trabajo concluido y revisión aprobada",
      estado: "lista para entrega"
    },
    {
      fecha: new Date("2026-10-15T17:30:00Z"),
      usuarioResponsable: "Ingrid Marín Perea",
      observacion: "Bicicleta entregada al cliente",
      estado: "entregada"
    }
  ],
  revisionEntrega: {
    puntosVerificados: [
      { punto: "Tacto firme de freno", resultado: true },
      { punto: "Ausencia de roce disco-pastilla", resultado: true },
      { punto: "Entrega de accesorios completos", resultado: true }
    ],
    resultado: "Aprobado",
    recomendacionesUsoMantenimiento: "Asentar pastillas durante los primeros 20 km",
    aprobada: true
  },
  entrega: {
    fecha: new Date("2026-10-15T17:30:00Z"),
    confirmacionRecepcionCliente: true
  },
  garantias: [
    {
      duracion: "30 días",
      fechaInicio: new Date("2026-10-15T17:30:00Z"),
      condiciones: "Cubre fallas de purga o desajuste de cáliper",
      exclusiones: "No cubre lavado abrasivo ni contaminación externa",
      solicitudes: []
    }
  ],
  valoracion: {
    calificacionNumerica: NumberInt(5),
    comentarios: "Excelente atención y los frenos quedaron con tacto impecable",
    sugerencias: "Ninguna, excelente servicio"
  }
});

print("[✓] Datos de prueba fieles al PDF insertados exitosamente.");
