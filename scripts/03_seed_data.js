/**
 * Universidad Autónoma de Occidente (UAO)
 * Asignatura: Bases de Datos 2
 * Proyecto: Sistema de Gestión de Servicios de Mantenimiento y Reparación de Bicicletas
 * 
 * Script: 03_seed_data.js
 * Descripción: Datos de prueba representativos para validar esquemas y reglas de negocio.
 */

const dbName = "taller_bicicletas_db";
const db = db.getSiblingDB(dbName);

print(`[+] Insertando datos de prueba en la base de datos: ${dbName}`);

// Limpiar colecciones previas
db.usuarios.deleteMany({});
db.bicicletas.deleteMany({});
db.catalogo_servicios.deleteMany({});
db.citas.deleteMany({});
db.ordenes_servicio.deleteMany({});

// 1. USUARIOS
const cliente1Id = new ObjectId();
const cliente2Id = new ObjectId();
const tecnico1Id = new ObjectId();
const coordinador1Id = new ObjectId();

db.usuarios.insertMany([
  {
    _id: cliente1Id,
    nombre: "Carlos Andrés Echeverry",
    documento: "1144123456",
    correo: "carlos.echeverry@uao.edu.co",
    telefono: "3154879621",
    rol: "cliente",
    direccion: "Carrera 100 # 16-20, Ciudad Jardín, Cali",
    fechaCreacion: new Date("2026-01-15T09:30:00Z"),
    activo: true
  },
  {
    _id: cliente2Id,
    nombre: "Valentina Gómez Prado",
    documento: "1118945612",
    correo: "valentina.gomez@gmail.com",
    telefono: "3187412589",
    rol: "cliente",
    direccion: "Calle 5 # 66-50, Camino Real, Cali",
    fechaCreacion: new Date("2026-02-10T14:15:00Z"),
    activo: true
  },
  {
    _id: tecnico1Id,
    nombre: "Jhonatan Riascos Mina",
    documento: "16789452",
    correo: "jhonatan.tecnico@tallercycle.com",
    telefono: "3006549871",
    rol: "tecnico",
    direccion: "Barrio San Antonio, Cali",
    fechaCreacion: new Date("2025-11-01T08:00:00Z"),
    activo: true
  },
  {
    _id: coordinador1Id,
    nombre: "Ingrid Marín Perea",
    documento: "31987456",
    correo: "ingrid.marin@tallercycle.com",
    telefono: "3103216549",
    rol: "coordinador",
    direccion: "Pance, Cali",
    fechaCreacion: new Date("2025-10-15T08:00:00Z"),
    activo: true
  }
]);

// 2. BICICLETAS (Polimórficas: Montaña y Eléctrica)
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
      tipoFrenos: "Disco Hidráulico SRAM G2 R 4 Pistones",
      transmision: "SRAM NX Eagle 1x12"
    },
    especificacionesTipo: {
      suspension: "Horquilla FOX FLOAT 34 Rhythm y Shock FOX FLOAT DPS Performance",
      recorrido: "140mm delantero / 130mm trasero"
    },
    fechaRegistro: new Date("2026-01-20T10:00:00Z"),
    activo: true
  },
  {
    _id: biciElectricaId,
    propietarioId: cliente2Id,
    marca: "Trek",
    modelo: "Powerfly 4 Gen 4",
    tipo: "eléctrica",
    color: "Gris Titanio / Amarillo Flúor",
    numeroSerie: "WTU320C98541L",
    caracteristicasComunes: {
      tamanoMarco: "S",
      material: "Aluminio Alpha Platinum",
      tamanoRueda: "27.5\"",
      tipoFrenos: "Disco Hidráulico Tektro HD-M275",
      transmision: "Shimano Deore M4100 1x10"
    },
    especificacionesTipo: {
      bateria: "Bosch PowerTube 625Wh con cargador rápido 4A",
      motor: "Bosch Performance CX, 85 Nm, 250W asistencia hasta 25 km/h"
    },
    fechaRegistro: new Date("2026-02-12T16:00:00Z"),
    activo: true
  }
]);

// 3. CATÁLOGO DE SERVICIOS
const servPreventivoId = new ObjectId();
const servFrenosId = new ObjectId();
const servSuspensionId = new ObjectId();

db.catalogo_servicios.insertMany([
  {
    _id: servPreventivoId,
    nombre: "Mantenimiento General Preventivo",
    categoria: "mantenimiento preventivo",
    descripcion: "Desarme general, limpieza por ultrasonido de transmisión, engrase de rodamientos de dirección y caja central, centrado de ruedas y ajuste de torque.",
    duracionEstimadaMinutos: NumberInt(180),
    precioReferencia: NumberDecimal("120000.00"),
    tareasHabituales: [
      "Lavado y desengrase de cadena, cassette y coronas",
      "Engrase de rodamientos sellados",
      "Ajuste y alineación de cambios delantero y trasero",
      "Inspección de desgaste de componentes"
    ],
    recomendaciones: [
      "Realizar cada 600 km o cada 3 meses según condiciones de rodado en trocha.",
      "Lubricar cadena con cera especial para clima seco/húmedo."
    ],
    activo: true
  },
  {
    _id: servFrenosId,
    nombre: "Purga y Mantenimiento de Frenos Hidráulicos",
    categoria: "frenos",
    descripcion: "Sustitución de líquido de frenos mineral/DOT, purga de burbujas de aire, limpieza de pistones y desgasificado de pastillas.",
    duracionEstimadaMinutos: NumberInt(60),
    precioReferencia: NumberDecimal("55000.00"),
    tareasHabituales: [
      "Extracción de fluido degradado",
      "Presurización con kit de jeringas",
      "Alineación de mordazas contra el rotor"
    ],
    recomendaciones: [
      "No contaminar rotores ni pastillas con aceites de aerosol.",
      "Inspeccionar grosor del rotor cada 1000 km (reemplazar si es menor a 1.5mm)."
    ],
    activo: true
  },
  {
    _id: servSuspensionId,
    nombre: "Servicio 50 Horas Suspensión Delantera",
    categoria: "suspensión",
    descripcion: "Desarme de botellas, cambio de retenedores, esponjillas de lubricación y reposición de aceite de suspensión.",
    duracionEstimadaMinutos: NumberInt(90),
    precioReferencia: NumberDecimal("95000.00"),
    tareasHabituales: [
      "Desmontaje de botellas",
      "Limpieza de barras y casquillos",
      "Sustitución de retenes de baja fricción",
      "Inyección de aceite sintético según tabla del fabricante"
    ],
    recomendaciones: [
      "Limpiar las barras después de cada salida con paño de microfibra seco.",
      "No usar agua a alta presión directamente sobre los retenes."
    ],
    activo: true
  }
]);

// 4. CITAS
const cita1Id = new ObjectId();

db.citas.insertOne({
  _id: cita1Id,
  clienteId: cliente1Id,
  bicicletaId: biciMontanaId,
  fechaHora: new Date("2026-10-15T09:00:00Z"),
  motivo: "Revisión pre-competencia y purga de frenos",
  problemasReportados: "Freno trasero esponjoso y pérdida de potencia al frenar en bajadas pronunciadas.",
  serviciosInteres: ["Purga y Mantenimiento de Frenos Hidráulicos", "Mantenimiento General Preventivo"],
  estado: "atendida",
  observaciones: "Cita cumplida a las 09:00 am. Se recibe bicicleta y se genera la orden ORD-2026-00001.",
  coordinadorId: coordinador1Id,
  fechaCreacion: new Date("2026-10-13T11:00:00Z")
});

// 5. ORDEN DE SERVICIO (Documento Completo y Realista)
db.ordenes_servicio.insertOne({
  numeroOrden: "ORD-2026-00001",
  citaId: cita1Id,
  cliente: {
    usuarioId: cliente1Id,
    nombre: "Carlos Andrés Echeverry",
    documento: "1144123456",
    telefono: "3154879621",
    correo: "carlos.echeverry@uao.edu.co",
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
  coordinadorId: coordinador1Id,
  tecnicosAsignados: [
    {
      tecnicoId: tecnico1Id,
      nombre: "Jhonatan Riascos Mina"
    }
  ],
  estado: "entregada",
  recepcion: {
    fechaRecepcion: new Date("2026-10-15T09:15:00Z"),
    fechaEstimadaEntrega: new Date("2026-10-16T17:00:00Z"),
    problemaReportado: "Pérdida de tacto en maneta de freno trasero, ruido metálico en la transmisión.",
    condicionesObservadas: "Bicicleta con barro moderado, cadena reseca, rayón superficial en vaina derecha.",
    accesoriosEntregados: ["Soporte de ciclo-computador Garmin", "Porta-caramañola de carbono"],
    fotografias: [
      {
        nombreArchivo: "recepcion_bici_lateral.jpg",
        descripcion: "Foto lateral general de la bicicleta en recepción",
        ubicacion: "https://storage.tallercycle.com/evidencias/ord-00001/recepcion_lateral.jpg"
      }
    ]
  },
  diagnostico: {
    fechaDiagnostico: new Date("2026-10-15T11:00:00Z"),
    tecnicoResponsableId: tecnico1Id,
    componentesRevisados: ["Frenos Hidráulicos", "Transmisión", "Suspensión Fox", "Rodamientos"],
    hallazgos: [
      {
        componente: "Freno Trasero",
        descripcion: "Líquido de freno DOT degradado y pastillas traseras cristalizadas con espesor al 10%.",
        prioridad: "alta",
        observaciones: "Riesgo de daño en el rotor de freno si no se cambian las pastillas inmediatamente.",
        evidencias: [
          {
            nombreArchivo: "pastilla_cristalizada.jpg",
            descripcion: "Desgaste severo y cristalización en pastillas traseras",
            ubicacion: "https://storage.tallercycle.com/evidencias/ord-00001/pastilla_cristalizada.jpg"
          }
        ]
      },
      {
        componente: "Cadena de Transmisión",
        descripcion: "Elongación de la cadena al 0.75% con calibrador Park Tool CC-4.",
        prioridad: "media",
        observaciones: "Se aconseja cambio de cadena para evitar desgaste prematuro del cassette NX Eagle.",
        evidencias: []
      }
    ],
    accionesRecomendadas: [
      "Purga completa de sistema de freno trasero y reemplazo de pastillas.",
      "Reemplazo preventivo de cadena de 12 velocidades."
    ]
  },
  propuesta: {
    fechaPropuesta: new Date("2026-10-15T12:00:00Z"),
    trabajos: [
      {
        trabajoId: "TRAB-001",
        servicioCatalogoId: servFrenosId,
        descripcion: "Purga de freno trasero y cambio de pastillas",
        componente: "Frenos Hidráulicos",
        costoEstimadoManoObra: NumberDecimal("45000.00"),
        repuestosPrevistos: [
          {
            nombre: "Pastillas de Freno Metálicas SRAM G2",
            especificaciones: "Compuesto sinterizado con placa de respaldo de acero",
            cantidad: NumberInt(1),
            precioUnitarioEstimado: NumberDecimal("95000.00")
          },
          {
            nombre: "Líquido de Freno DOT 5.1 Motorex 100ml",
            especificaciones: "Alto punto de ebullición húmedo",
            cantidad: NumberInt(1),
            precioUnitarioEstimado: NumberDecimal("25000.00")
          }
        ],
        estadoAutorizacion: "autorizado",
        decisionCliente: {
          fechaDecision: new Date("2026-10-15T12:30:00Z"),
          comentarios: "Aprobado, por favor usar repuestos originales SRAM."
        },
        observaciones: "Autorizado por el cliente vía mensaje de confirmación."
      },
      {
        trabajoId: "TRAB-002",
        servicioCatalogoId: null,
        descripcion: "Reemplazo e instalación de cadena 12 velocidades",
        componente: "Transmisión",
        costoEstimadoManoObra: NumberDecimal("20000.00"),
        repuestosPrevistos: [
          {
            nombre: "Cadena SRAM GX Eagle 12 Velocidades 126 Eslabones",
            especificaciones: "Con conector PowerLock",
            cantidad: NumberInt(1),
            precioUnitarioEstimado: NumberDecimal("180000.00")
          }
        ],
        estadoAutorizacion: "rechazado",
        decisionCliente: {
          fechaDecision: new Date("2026-10-15T12:30:00Z"),
          comentarios: "Por ahora no cambiaré la cadena, la cambiaré el próximo mes."
        },
        observaciones: "El cliente opta por posponer el cambio de cadena. Permanece en el historial."
      }
    ],
    valorTotalEstimado: NumberDecimal("165000.00") // Solo contabiliza mano de obra y repuestos autorizados
  },
  ejecucion: {
    trabajosRealizados: [
      {
        trabajoId: "TRAB-001",
        responsableId: tecnico1Id,
        fechaInicio: new Date("2026-10-15T14:00:00Z"),
        fechaFinalizacion: new Date("2026-10-15T15:30:00Z"),
        estado: "finalizado",
        descripcionRealizada: "Se extrajo líquido degradado, se purgó con líquido DOT 5.1 nuevo, se instalaron pastillas SRAM sinterizadas y se centró el cáliper con torquímetro a 6 Nm.",
        repuestosUtilizados: [
          {
            nombre: "Pastillas de Freno Metálicas SRAM G2",
            cantidad: NumberInt(1),
            precioUnitarioAplicado: NumberDecimal("95000.00")
          },
          {
            nombre: "Líquido de Freno DOT 5.1 Motorex 100ml",
            cantidad: NumberInt(1),
            precioUnitarioAplicado: NumberDecimal("25000.00")
          }
        ]
      }
    ]
  },
  historialEstados: [
    {
      estado: "recibida",
      fecha: new Date("2026-10-15T09:15:00Z"),
      usuarioResponsableId: coordinador1Id,
      observacion: "Bicicleta ingresada con cita programada."
    },
    {
      estado: "en_diagnostico",
      fecha: new Date("2026-10-15T10:30:00Z"),
      usuarioResponsableId: tecnico1Id,
      observacion: "Técnico inicia revisión en el banco de trabajo."
    },
    {
      estado: "pendiente_autorizacion",
      fecha: new Date("2026-10-15T12:00:00Z"),
      usuarioResponsableId: coordinador1Id,
      observacion: "Propuesta de trabajos y repuestos enviada para revisión del cliente."
    },
    {
      estado: "en_ejecucion",
      fecha: new Date("2026-10-15T13:45:00Z"),
      usuarioResponsableId: coordinador1Id,
      observacion: "Cliente autorizó TRAB-001 y rechazó TRAB-002. Se inicia intervención autorizada."
    },
    {
      estado: "lista_para_entrega",
      fecha: new Date("2026-10-15T16:00:00Z"),
      usuarioResponsableId: tecnico1Id,
      observacion: "Trabajos finalizados y control de calidad aprobado."
    },
    {
      estado: "entregada",
      fecha: new Date("2026-10-15T17:30:00Z"),
      usuarioResponsableId: coordinador1Id,
      observacion: "Bicicleta retirada a satisfacción por el propietario."
    }
  ],
  revisionEntrega: {
    fechaRevision: new Date("2026-10-15T15:50:00Z"),
    puntosVerificados: [
      { punto: "Tacto y potencia de frenado", resultado: true },
      { punto: "Ausencia de roces disco-pastilla", resultado: true },
      { punto: "Presión adecuada de neumáticos", resultado: true },
      { punto: "Limpieza general y entrega de accesorios", resultado: true }
    ],
    aprobada: true,
    recomendaciones: "Asentar las pastillas de freno en los primeros 20 km evitando frenadas bruscas continuas."
  },
  entregaConfirmada: {
    fechaEntrega: new Date("2026-10-15T17:30:00Z"),
    confirmacionCliente: true
  },
  garantias: [
    {
      trabajoId: "TRAB-001",
      duracionDias: NumberInt(30),
      fechaInicio: new Date("2026-10-15T17:30:00Z"),
      condiciones: "Cubre cualquier fuga de líquido en cáliper o maneta y reajuste sin costo.",
      exclusiones: "No cubre contaminación por lavado con desengrasante o abuso en competencia de descenso extremo.",
      solicitudes: []
    }
  ],
  valoracion: {
    calificacion: NumberInt(5),
    comentarios: "Excelente atención y los frenos quedaron con el tacto firme como de fábrica. Muy cumplidos con la hora de entrega.",
    sugerencias: "Sería ideal que enviaran videos breves de la purga mientras uno espera.",
    fechaValoracion: new Date("2026-10-15T19:00:00Z")
  }
});

print("[✓] Datos de prueba insertados exitosamente.");
