const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function genGuid() {
  return crypto.randomUUID();
}

const originalPath = 'C:\\Users\\Usuario\\Downloads\\ProyectoBD.hck.json';
const targetDir = 'C:\\Users\\Usuario\\Documents\\proyecto-bd2-taller-bicicletas\\model';
const targetPath = path.join(targetDir, 'ProyectoBD.hck.json');
const downloadPath = 'C:\\Users\\Usuario\\Downloads\\ProyectoBD_v2_completo.hck.json';

const rawData = fs.readFileSync(originalPath, 'utf8');
const model = JSON.parse(rawData);

// Reset idToNameHashTable
model.idToNameHashTable = {};

// 1. USUARIOS (100% PDF)
const usuariosProps = [
  { name: '_id', type: 'objectId', primaryKey: true, isActivated: true, GUID: genGuid() },
  { name: 'nombreCompleto', type: 'string', required: true, isActivated: true, GUID: genGuid() },
  { name: 'documentoIdentificacion', type: 'string', required: true, isActivated: true, GUID: genGuid() },
  { name: 'correoElectronico', type: 'string', required: true, isActivated: true, GUID: genGuid() },
  { name: 'numeroTelefono', type: 'string', required: true, isActivated: true, GUID: genGuid() },
  { name: 'rol', type: 'string', required: true, enum: ['cliente', 'tecnico', 'coordinador', 'administrador'], isActivated: true, GUID: genGuid() },
  { name: 'direccion', type: 'string', required: false, isActivated: true, GUID: genGuid() }
];

// 2. BICICLETAS (100% PDF)
const bicisProps = [
  { name: '_id', type: 'objectId', primaryKey: true, isActivated: true, GUID: genGuid() },
  { name: 'propietarioId', type: 'objectId', required: true, isActivated: true, GUID: genGuid() },
  { name: 'marca', type: 'string', required: true, isActivated: true, GUID: genGuid() },
  { name: 'modelo', type: 'string', required: true, isActivated: true, GUID: genGuid() },
  { name: 'tipo', type: 'string', required: true, enum: ['urbana', 'ruta', 'montaña', 'eléctrica'], isActivated: true, GUID: genGuid() },
  { name: 'color', type: 'string', required: true, isActivated: true, GUID: genGuid() },
  { name: 'numeroSerie', type: 'string', required: false, isActivated: true, GUID: genGuid() },
  {
    name: 'caracteristicasComunes',
    type: 'document',
    required: true,
    isActivated: true,
    GUID: genGuid(),
    properties: [
      { name: 'tamanoMarco', type: 'string', required: true, isActivated: true, GUID: genGuid() },
      { name: 'material', type: 'string', required: true, isActivated: true, GUID: genGuid() },
      { name: 'tamanoRueda', type: 'string', required: true, isActivated: true, GUID: genGuid() },
      { name: 'tipoFrenos', type: 'string', required: true, isActivated: true, GUID: genGuid() },
      { name: 'transmision', type: 'string', required: true, isActivated: true, GUID: genGuid() }
    ]
  },
  {
    name: 'especificacionesTipo',
    type: 'document',
    required: false,
    isActivated: true,
    GUID: genGuid(),
    properties: [
      { name: 'suspension', type: 'string', isActivated: true, GUID: genGuid() },
      { name: 'recorrido', type: 'string', isActivated: true, GUID: genGuid() },
      { name: 'bateria', type: 'string', isActivated: true, GUID: genGuid() },
      { name: 'motor', type: 'string', isActivated: true, GUID: genGuid() }
    ]
  }
];

// 3. CATALOGO_SERVICIOS (100% PDF)
const catalogoProps = [
  { name: '_id', type: 'objectId', primaryKey: true, isActivated: true, GUID: genGuid() },
  { name: 'nombre', type: 'string', required: true, isActivated: true, GUID: genGuid() },
  {
    name: 'categoria',
    type: 'string',
    required: true,
    enum: ['mantenimiento preventivo', 'frenos', 'transmisión', 'ruedas', 'suspensión', 'componentes eléctricos'],
    isActivated: true,
    GUID: genGuid()
  },
  { name: 'descripcion', type: 'string', required: true, isActivated: true, GUID: genGuid() },
  { name: 'duracionEstimada', type: 'string', required: true, isActivated: true, GUID: genGuid() },
  { name: 'precioReferencia', type: 'numeric', mode: 'decimal128', required: true, isActivated: true, GUID: genGuid() },
  {
    name: 'tareasHabituales',
    type: 'array',
    isActivated: true,
    GUID: genGuid(),
    properties: [{ type: 'string', arrayItem: true, isActivated: true, GUID: genGuid() }]
  },
  {
    name: 'recomendaciones',
    type: 'array',
    isActivated: true,
    GUID: genGuid(),
    properties: [{ type: 'string', arrayItem: true, isActivated: true, GUID: genGuid() }]
  }
];

// 4. CITAS (100% PDF)
const citasProps = [
  { name: '_id', type: 'objectId', primaryKey: true, isActivated: true, GUID: genGuid() },
  { name: 'clienteId', type: 'objectId', required: true, isActivated: true, GUID: genGuid() },
  { name: 'bicicletaId', type: 'objectId', required: true, isActivated: true, GUID: genGuid() },
  { name: 'fecha', type: 'string', required: true, isActivated: true, GUID: genGuid() },
  { name: 'hora', type: 'string', required: true, isActivated: true, GUID: genGuid() },
  { name: 'motivo', type: 'string', required: true, isActivated: true, GUID: genGuid() },
  { name: 'problemasObservados', type: 'string', isActivated: true, GUID: genGuid() },
  {
    name: 'serviciosInteres',
    type: 'array',
    isActivated: true,
    GUID: genGuid(),
    properties: [{ type: 'string', arrayItem: true, isActivated: true, GUID: genGuid() }]
  },
  {
    name: 'estado',
    type: 'string',
    required: true,
    enum: ['solicitada', 'confirmada', 'atendida', 'cancelada'],
    isActivated: true,
    GUID: genGuid()
  },
  { name: 'observacionCambio', type: 'string', isActivated: true, GUID: genGuid() },
  { name: 'coordinadorId', type: 'objectId', isActivated: true, GUID: genGuid() }
];

// 5. ORDENES_SERVICIO (100% PDF)
const ordenesProps = [
  { name: '_id', type: 'objectId', primaryKey: true, isActivated: true, GUID: genGuid() },
  { name: 'citaId', type: 'objectId', isActivated: true, GUID: genGuid() },
  {
    name: 'cliente',
    type: 'document',
    required: true,
    isActivated: true,
    GUID: genGuid(),
    properties: [
      { name: 'usuarioId', type: 'objectId', required: true, isActivated: true, GUID: genGuid() },
      { name: 'nombreCompleto', type: 'string', required: true, isActivated: true, GUID: genGuid() },
      { name: 'documentoIdentificacion', type: 'string', required: true, isActivated: true, GUID: genGuid() },
      { name: 'numeroTelefono', type: 'string', required: true, isActivated: true, GUID: genGuid() },
      { name: 'correoElectronico', type: 'string', required: true, isActivated: true, GUID: genGuid() },
      { name: 'direccion', type: 'string', isActivated: true, GUID: genGuid() }
    ]
  },
  {
    name: 'bicicleta',
    type: 'document',
    required: true,
    isActivated: true,
    GUID: genGuid(),
    properties: [
      { name: 'bicicletaId', type: 'objectId', required: true, isActivated: true, GUID: genGuid() },
      { name: 'marca', type: 'string', required: true, isActivated: true, GUID: genGuid() },
      { name: 'modelo', type: 'string', required: true, isActivated: true, GUID: genGuid() },
      { name: 'tipo', type: 'string', required: true, enum: ['urbana', 'ruta', 'montaña', 'eléctrica'], isActivated: true, GUID: genGuid() },
      { name: 'color', type: 'string', required: true, isActivated: true, GUID: genGuid() },
      { name: 'numeroSerie', type: 'string', isActivated: true, GUID: genGuid() }
    ]
  },
  { name: 'fechaRecepcion', type: 'date', required: true, isActivated: true, GUID: genGuid() },
  { name: 'fechaEstimadaEntrega', type: 'date', required: true, isActivated: true, GUID: genGuid() },
  {
    name: 'coordinadorResponsable',
    type: 'document',
    required: true,
    isActivated: true,
    GUID: genGuid(),
    properties: [
      { name: 'coordinadorId', type: 'objectId', required: true, isActivated: true, GUID: genGuid() },
      { name: 'nombreCompleto', type: 'string', required: true, isActivated: true, GUID: genGuid() }
    ]
  },
  {
    name: 'tecnicosAsignados',
    type: 'array',
    required: true,
    isActivated: true,
    GUID: genGuid(),
    properties: [
      {
        type: 'document',
        arrayItem: true,
        isActivated: true,
        GUID: genGuid(),
        properties: [
          { name: 'tecnicoId', type: 'objectId', required: true, isActivated: true, GUID: genGuid() },
          { name: 'nombreCompleto', type: 'string', required: true, isActivated: true, GUID: genGuid() }
        ]
      }
    ]
  },
  {
    name: 'estado',
    type: 'string',
    required: true,
    enum: [
      'recibida',
      'en diagnóstico',
      'pendiente de autorización',
      'en ejecución',
      'lista para entrega',
      'entregada',
      'cancelada'
    ],
    isActivated: true,
    GUID: genGuid()
  },
  {
    name: 'recepcion',
    type: 'document',
    required: true,
    isActivated: true,
    GUID: genGuid(),
    properties: [
      { name: 'problemaReportado', type: 'string', required: true, isActivated: true, GUID: genGuid() },
      { name: 'condicionesObservadas', type: 'string', required: true, isActivated: true, GUID: genGuid() },
      {
        name: 'accesoriosEntregados',
        type: 'array',
        isActivated: true,
        GUID: genGuid(),
        properties: [{ type: 'string', arrayItem: true, isActivated: true, GUID: genGuid() }]
      },
      {
        name: 'fotografias',
        type: 'array',
        isActivated: true,
        GUID: genGuid(),
        properties: [
          {
            type: 'document',
            arrayItem: true,
            isActivated: true,
            GUID: genGuid(),
            properties: [
              { name: 'nombreArchivo', type: 'string', required: true, isActivated: true, GUID: genGuid() },
              { name: 'descripcion', type: 'string', required: true, isActivated: true, GUID: genGuid() },
              { name: 'ubicacion', type: 'string', required: true, isActivated: true, GUID: genGuid() }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'diagnostico',
    type: 'document',
    isActivated: true,
    GUID: genGuid(),
    properties: [
      {
        name: 'componentesRevisados',
        type: 'array',
        isActivated: true,
        GUID: genGuid(),
        properties: [{ type: 'string', arrayItem: true, isActivated: true, GUID: genGuid() }]
      },
      { name: 'condicion', type: 'string', isActivated: true, GUID: genGuid() },
      {
        name: 'hallazgos',
        type: 'array',
        isActivated: true,
        GUID: genGuid(),
        properties: [
          {
            type: 'document',
            arrayItem: true,
            isActivated: true,
            GUID: genGuid(),
            properties: [
              { name: 'componente', type: 'string', required: true, isActivated: true, GUID: genGuid() },
              { name: 'descripcion', type: 'string', required: true, isActivated: true, GUID: genGuid() },
              { name: 'prioridadAtencion', type: 'string', required: true, isActivated: true, GUID: genGuid() },
              { name: 'observaciones', type: 'string', required: true, isActivated: true, GUID: genGuid() },
              {
                name: 'evidencias',
                type: 'array',
                isActivated: true,
                GUID: genGuid(),
                properties: [
                  {
                    type: 'document',
                    arrayItem: true,
                    isActivated: true,
                    GUID: genGuid(),
                    properties: [
                      { name: 'nombreArchivo', type: 'string', required: true, isActivated: true, GUID: genGuid() },
                      { name: 'descripcion', type: 'string', required: true, isActivated: true, GUID: genGuid() },
                      { name: 'ubicacion', type: 'string', required: true, isActivated: true, GUID: genGuid() }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        name: 'accionesRecomendadas',
        type: 'array',
        isActivated: true,
        GUID: genGuid(),
        properties: [{ type: 'string', arrayItem: true, isActivated: true, GUID: genGuid() }]
      }
    ]
  },
  {
    name: 'propuesta',
    type: 'document',
    isActivated: true,
    GUID: genGuid(),
    properties: [
      {
        name: 'trabajos',
        type: 'array',
        isActivated: true,
        GUID: genGuid(),
        properties: [
          {
            type: 'document',
            arrayItem: true,
            isActivated: true,
            GUID: genGuid(),
            properties: [
              { name: 'servicioODescripcion', type: 'string', required: true, isActivated: true, GUID: genGuid() },
              { name: 'componenteInvolucrado', type: 'string', required: true, isActivated: true, GUID: genGuid() },
              { name: 'costoEstimadoManoObra', type: 'numeric', mode: 'decimal128', required: true, isActivated: true, GUID: genGuid() },
              {
                name: 'repuestosPrevistos',
                type: 'array',
                isActivated: true,
                GUID: genGuid(),
                properties: [
                  {
                    type: 'document',
                    arrayItem: true,
                    isActivated: true,
                    GUID: genGuid(),
                    properties: [
                      { name: 'nombre', type: 'string', required: true, isActivated: true, GUID: genGuid() },
                      { name: 'especificacionesRelevantes', type: 'string', required: true, isActivated: true, GUID: genGuid() },
                      { name: 'cantidad', type: 'numeric', mode: 'int', required: true, isActivated: true, GUID: genGuid() },
                      { name: 'precioUnitarioEstimado', type: 'numeric', mode: 'decimal128', required: true, isActivated: true, GUID: genGuid() }
                    ]
                  }
                ]
              },
              { name: 'observaciones', type: 'string', required: true, isActivated: true, GUID: genGuid() },
              {
                name: 'autorizacionCliente',
                type: 'document',
                isActivated: true,
                GUID: genGuid(),
                properties: [
                  { name: 'decision', type: 'string', enum: ['autorizado', 'rechazado'], isActivated: true, GUID: genGuid() },
                  { name: 'fecha', type: 'date', isActivated: true, GUID: genGuid() },
                  { name: 'comentarios', type: 'string', isActivated: true, GUID: genGuid() }
                ]
              }
            ]
          }
        ]
      },
      { name: 'valorEstimadoPropuesta', type: 'numeric', mode: 'decimal128', isActivated: true, GUID: genGuid() }
    ]
  },
  {
    name: 'ejecucion',
    type: 'document',
    isActivated: true,
    GUID: genGuid(),
    properties: [
      {
        name: 'trabajosRealizados',
        type: 'array',
        isActivated: true,
        GUID: genGuid(),
        properties: [
          {
            type: 'document',
            arrayItem: true,
            isActivated: true,
            GUID: genGuid(),
            properties: [
              { name: 'responsable', type: 'string', required: true, isActivated: true, GUID: genGuid() },
              { name: 'fechaInicio', type: 'date', isActivated: true, GUID: genGuid() },
              { name: 'fechaFinalizacion', type: 'date', isActivated: true, GUID: genGuid() },
              { name: 'estado', type: 'string', required: true, isActivated: true, GUID: genGuid() },
              { name: 'descripcionRealizada', type: 'string', isActivated: true, GUID: genGuid() },
              {
                name: 'repuestosUtilizados',
                type: 'array',
                isActivated: true,
                GUID: genGuid(),
                properties: [
                  {
                    type: 'document',
                    arrayItem: true,
                    isActivated: true,
                    GUID: genGuid(),
                    properties: [
                      { name: 'nombre', type: 'string', required: true, isActivated: true, GUID: genGuid() },
                      { name: 'cantidad', type: 'numeric', mode: 'int', required: true, isActivated: true, GUID: genGuid() },
                      { name: 'precioUnitarioAplicado', type: 'numeric', mode: 'decimal128', required: true, isActivated: true, GUID: genGuid() }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'historialCambiosEstado',
    type: 'array',
    required: true,
    isActivated: true,
    GUID: genGuid(),
    properties: [
      {
        type: 'document',
        arrayItem: true,
        isActivated: true,
        GUID: genGuid(),
        properties: [
          { name: 'fecha', type: 'date', required: true, isActivated: true, GUID: genGuid() },
          { name: 'usuarioResponsable', type: 'string', required: true, isActivated: true, GUID: genGuid() },
          { name: 'observacion', type: 'string', required: true, isActivated: true, GUID: genGuid() },
          { name: 'estado', type: 'string', isActivated: true, GUID: genGuid() }
        ]
      }
    ]
  },
  {
    name: 'revisionEntrega',
    type: 'document',
    isActivated: true,
    GUID: genGuid(),
    properties: [
      {
        name: 'puntosVerificados',
        type: 'array',
        isActivated: true,
        GUID: genGuid(),
        properties: [
          {
            type: 'document',
            arrayItem: true,
            isActivated: true,
            GUID: genGuid(),
            properties: [
              { name: 'punto', type: 'string', required: true, isActivated: true, GUID: genGuid() },
              { name: 'resultado', type: 'bool', required: true, isActivated: true, GUID: genGuid() }
            ]
          }
        ]
      },
      { name: 'resultado', type: 'string', isActivated: true, GUID: genGuid() },
      { name: 'recomendacionesUsoMantenimiento', type: 'string', isActivated: true, GUID: genGuid() },
      { name: 'aprobada', type: 'bool', isActivated: true, GUID: genGuid() }
    ]
  },
  {
    name: 'entrega',
    type: 'document',
    isActivated: true,
    GUID: genGuid(),
    properties: [
      { name: 'fecha', type: 'date', isActivated: true, GUID: genGuid() },
      { name: 'confirmacionRecepcionCliente', type: 'bool', isActivated: true, GUID: genGuid() }
    ]
  },
  {
    name: 'garantias',
    type: 'array',
    isActivated: true,
    GUID: genGuid(),
    properties: [
      {
        type: 'document',
        arrayItem: true,
        isActivated: true,
        GUID: genGuid(),
        properties: [
          { name: 'duracion', type: 'string', required: true, isActivated: true, GUID: genGuid() },
          { name: 'fechaInicio', type: 'date', required: true, isActivated: true, GUID: genGuid() },
          { name: 'condiciones', type: 'string', required: true, isActivated: true, GUID: genGuid() },
          { name: 'exclusiones', type: 'string', required: true, isActivated: true, GUID: genGuid() }
        ]
      }
    ]
  },
  {
    name: 'valoracion',
    type: 'document',
    isActivated: true,
    GUID: genGuid(),
    properties: [
      { name: 'calificacionNumerica', type: 'numeric', mode: 'int', required: true, isActivated: true, GUID: genGuid() },
      { name: 'comentarios', type: 'string', isActivated: true, GUID: genGuid() },
      { name: 'sugerencias', type: 'string', isActivated: true, GUID: genGuid() }
    ]
  }
];

const uGuid = genGuid();
const bGuid = genGuid();
const cGuid = genGuid();
const ciGuid = genGuid();
const oGuid = genGuid();
const bucketGuid = model.buckets[0].GUID;

model.collections = [
  {
    collectionName: 'usuarios',
    type: 'object',
    properties: usuariosProps,
    definitions: { type: 'definitions', properties: [], GUID: genGuid() },
    isActivated: true,
    additionalProperties: false,
    validationLevel: 'Strict',
    validationAction: 'Error',
    storageEngineName: 'WiredTiger',
    indexes: [],
    collation: {},
    sharding: { unique: true, collation: 'null' },
    GUID: uGuid,
    bucketId: bucketGuid,
    hackoladeMeta: { validationErrors: {} }
  },
  {
    collectionName: 'bicicletas',
    type: 'object',
    properties: bicisProps,
    definitions: { type: 'definitions', properties: [], GUID: genGuid() },
    isActivated: true,
    additionalProperties: false,
    validationLevel: 'Strict',
    validationAction: 'Error',
    storageEngineName: 'WiredTiger',
    indexes: [],
    collation: {},
    sharding: { unique: true, collation: 'null' },
    GUID: bGuid,
    bucketId: bucketGuid,
    hackoladeMeta: { validationErrors: {} }
  },
  {
    collectionName: 'catalogo_servicios',
    type: 'object',
    properties: catalogoProps,
    definitions: { type: 'definitions', properties: [], GUID: genGuid() },
    isActivated: true,
    additionalProperties: false,
    validationLevel: 'Strict',
    validationAction: 'Error',
    storageEngineName: 'WiredTiger',
    indexes: [],
    collation: {},
    sharding: { unique: true, collation: 'null' },
    GUID: cGuid,
    bucketId: bucketGuid,
    hackoladeMeta: { validationErrors: {} }
  },
  {
    collectionName: 'citas',
    type: 'object',
    properties: citasProps,
    definitions: { type: 'definitions', properties: [], GUID: genGuid() },
    isActivated: true,
    additionalProperties: false,
    validationLevel: 'Strict',
    validationAction: 'Error',
    storageEngineName: 'WiredTiger',
    indexes: [],
    collation: {},
    sharding: { unique: true, collation: 'null' },
    GUID: ciGuid,
    bucketId: bucketGuid,
    hackoladeMeta: { validationErrors: {} }
  },
  {
    collectionName: 'ordenes_servicio',
    type: 'object',
    properties: ordenesProps,
    definitions: { type: 'definitions', properties: [], GUID: genGuid() },
    isActivated: true,
    additionalProperties: false,
    validationLevel: 'Strict',
    validationAction: 'Error',
    storageEngineName: 'WiredTiger',
    indexes: [],
    collation: {},
    sharding: { unique: true, collation: 'null' },
    GUID: oGuid,
    bucketId: bucketGuid,
    hackoladeMeta: { validationErrors: {} }
  }
];

// Actualizar tabla hash
function registerNames(props) {
  props.forEach(p => {
    if (p.GUID && p.name) {
      model.idToNameHashTable[p.GUID] = p.name;
    }
    if (p.properties && Array.isArray(p.properties)) {
      registerNames(p.properties);
    }
  });
}
[usuariosProps, bicisProps, catalogoProps, citasProps, ordenesProps].forEach(registerNames);
model.idToNameHashTable[uGuid] = 'usuarios';
model.idToNameHashTable[bGuid] = 'bicicletas';
model.idToNameHashTable[cGuid] = 'catalogo_servicios';
model.idToNameHashTable[ciGuid] = 'citas';
model.idToNameHashTable[oGuid] = 'ordenes_servicio';
model.idToNameHashTable[bucketGuid] = 'New_Database';

model.buckets[0].collectionIds = [uGuid, bGuid, cGuid, ciGuid, oGuid];

// Actualizar layout ERD
model.settings.centralPane.dbLevel.erd = [
  { GUID: uGuid, x: 1060, y: 1060, width: 250, height: 220, color: {} },
  { GUID: bGuid, x: 1450, y: 1060, width: 280, height: 320, color: {} },
  { GUID: cGuid, x: 1850, y: 1060, width: 260, height: 260, color: {} },
  { GUID: ciGuid, x: 1060, y: 1420, width: 250, height: 280, color: {} },
  { GUID: oGuid, x: 1450, y: 1420, width: 340, height: 500, color: {} }
];

fs.writeFileSync(targetPath, JSON.stringify(model, null, 2), 'utf8');
fs.writeFileSync(downloadPath, JSON.stringify(model, null, 2), 'utf8');
console.log('[✓] Modelo Hackolade 100% estricto generado en target y Downloads.');
