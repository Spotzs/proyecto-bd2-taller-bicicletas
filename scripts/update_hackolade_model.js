const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function genGuid() {
  return crypto.randomUUID();
}

const originalPath = 'C:\\Users\\Usuario\\Downloads\\ProyectoBD.hck.json';
const targetDir = 'C:\\Users\\Usuario\\Documents\\proyecto-bd2-taller-bicicletas\\model';
const targetPath = path.join(targetDir, 'ProyectoBD.hck.json');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const rawData = fs.readFileSync(originalPath, 'utf8');
const model = JSON.parse(rawData);

// 1. CORREGIR USUARIOS
const usuariosColl = model.collections.find(c => c.collectionName === 'Usuarios');
if (usuariosColl) {
  usuariosColl.properties.forEach(p => {
    if (p.name === 'telefono') {
      delete p.enum;
      delete p.error;
    }
    if (p.name === 'rol') {
      p.enum = ['cliente', 'tecnico', 'coordinador', 'administrador'];
    }
    if (p.name === 'direccion') {
      // Cliente tiene direccion
    }
  });
}

// 2. CORREGIR BICICLETAS
const bicisColl = model.collections.find(c => c.collectionName === 'Bicicletas');
if (bicisColl) {
  bicisColl.properties.forEach(p => {
    if (p.name === 'propetario_id') {
      p.name = 'propietarioId';
      p.type = 'objectId';
      model.idToNameHashTable[p.GUID] = 'propietarioId';
    }
  });
}

// 3. CORREGIR CITAS
const citasColl = model.collections.find(c => c.collectionName === 'citas');
if (citasColl) {
  citasColl.properties.forEach(p => {
    if (p.name === 'bicicletaId') {
      p.type = 'objectId';
    }
    if (p.name === 'estado') {
      p.enum = ['solicitada', 'confirmada', 'atendida', 'cancelada'];
    }
  });
}

// 4. TRANSFORMAR "New Collection" EN "ordenes_servicio" COMPLETO
const newCollIndex = model.collections.findIndex(c => c.collectionName === 'New Collection');
const ordenesGuid = newCollIndex !== -1 ? model.collections[newCollIndex].GUID : genGuid();

const ordenesProperties = [
  {
    name: '_id',
    type: 'objectId',
    primaryKey: true,
    isActivated: true,
    GUID: genGuid()
  },
  {
    name: 'numeroOrden',
    type: 'string',
    required: true,
    isActivated: true,
    GUID: genGuid()
  },
  {
    name: 'citaId',
    type: 'objectId',
    required: false,
    isActivated: true,
    GUID: genGuid()
  },
  {
    name: 'cliente',
    type: 'document',
    required: true,
    isActivated: true,
    GUID: genGuid(),
    properties: [
      { name: 'usuarioId', type: 'objectId', required: true, isActivated: true, GUID: genGuid() },
      { name: 'nombre', type: 'string', required: true, isActivated: true, GUID: genGuid() },
      { name: 'documento', type: 'string', required: true, isActivated: true, GUID: genGuid() },
      { name: 'telefono', type: 'string', required: true, isActivated: true, GUID: genGuid() },
      { name: 'correo', type: 'string', required: true, isActivated: true, GUID: genGuid() },
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
  {
    name: 'coordinadorId',
    type: 'objectId',
    required: false,
    isActivated: true,
    GUID: genGuid()
  },
  {
    name: 'tecnicosAsignados',
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
          { name: 'tecnicoId', type: 'objectId', required: true, isActivated: true, GUID: genGuid() },
          { name: 'nombre', type: 'string', required: true, isActivated: true, GUID: genGuid() }
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
      'en_diagnostico',
      'pendiente_autorizacion',
      'en_ejecucion',
      'lista_para_entrega',
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
      { name: 'fechaRecepcion', type: 'date', required: true, isActivated: true, GUID: genGuid() },
      { name: 'fechaEstimadaEntrega', type: 'date', isActivated: true, GUID: genGuid() },
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
              { name: 'descripcion', type: 'string', isActivated: true, GUID: genGuid() },
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
      { name: 'fechaDiagnostico', type: 'date', isActivated: true, GUID: genGuid() },
      { name: 'tecnicoResponsableId', type: 'objectId', isActivated: true, GUID: genGuid() },
      {
        name: 'componentesRevisados',
        type: 'array',
        isActivated: true,
        GUID: genGuid(),
        properties: [{ type: 'string', arrayItem: true, isActivated: true, GUID: genGuid() }]
      },
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
              { name: 'prioridad', type: 'string', required: true, enum: ['baja', 'media', 'alta', 'critica'], isActivated: true, GUID: genGuid() },
              { name: 'observaciones', type: 'string', isActivated: true, GUID: genGuid() },
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
      { name: 'fechaPropuesta', type: 'date', isActivated: true, GUID: genGuid() },
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
              { name: 'trabajoId', type: 'string', required: true, isActivated: true, GUID: genGuid() },
              { name: 'servicioCatalogoId', type: 'objectId', isActivated: true, GUID: genGuid() },
              { name: 'descripcion', type: 'string', required: true, isActivated: true, GUID: genGuid() },
              { name: 'componente', type: 'string', required: true, isActivated: true, GUID: genGuid() },
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
                      { name: 'especificaciones', type: 'string', isActivated: true, GUID: genGuid() },
                      { name: 'cantidad', type: 'numeric', mode: 'int', required: true, isActivated: true, GUID: genGuid() },
                      { name: 'precioUnitarioEstimado', type: 'numeric', mode: 'decimal128', required: true, isActivated: true, GUID: genGuid() }
                    ]
                  }
                ]
              },
              { name: 'estadoAutorizacion', type: 'string', required: true, enum: ['pendiente', 'autorizado', 'rechazado'], isActivated: true, GUID: genGuid() },
              {
                name: 'decisionCliente',
                type: 'document',
                isActivated: true,
                GUID: genGuid(),
                properties: [
                  { name: 'fechaDecision', type: 'date', isActivated: true, GUID: genGuid() },
                  { name: 'comentarios', type: 'string', isActivated: true, GUID: genGuid() }
                ]
              },
              { name: 'observaciones', type: 'string', isActivated: true, GUID: genGuid() }
            ]
          }
        ]
      },
      { name: 'valorTotalEstimado', type: 'numeric', mode: 'decimal128', isActivated: true, GUID: genGuid() }
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
              { name: 'trabajoId', type: 'string', required: true, isActivated: true, GUID: genGuid() },
              { name: 'responsableId', type: 'objectId', required: true, isActivated: true, GUID: genGuid() },
              { name: 'fechaInicio', type: 'date', isActivated: true, GUID: genGuid() },
              { name: 'fechaFinalizacion', type: 'date', isActivated: true, GUID: genGuid() },
              { name: 'estado', type: 'string', required: true, enum: ['en_progreso', 'finalizado', 'detenido'], isActivated: true, GUID: genGuid() },
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
    name: 'historialEstados',
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
          { name: 'estado', type: 'string', required: true, enum: ['recibida', 'en_diagnostico', 'pendiente_autorizacion', 'en_ejecucion', 'lista_para_entrega', 'entregada', 'cancelada'], isActivated: true, GUID: genGuid() },
          { name: 'fecha', type: 'date', required: true, isActivated: true, GUID: genGuid() },
          { name: 'usuarioResponsableId', type: 'objectId', required: true, isActivated: true, GUID: genGuid() },
          { name: 'observacion', type: 'string', isActivated: true, GUID: genGuid() }
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
      { name: 'fechaRevision', type: 'date', isActivated: true, GUID: genGuid() },
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
      { name: 'aprobada', type: 'bool', isActivated: true, GUID: genGuid() },
      { name: 'recomendaciones', type: 'string', isActivated: true, GUID: genGuid() }
    ]
  },
  {
    name: 'entregaConfirmada',
    type: 'document',
    isActivated: true,
    GUID: genGuid(),
    properties: [
      { name: 'fechaEntrega', type: 'date', isActivated: true, GUID: genGuid() },
      { name: 'confirmacionCliente', type: 'bool', isActivated: true, GUID: genGuid() }
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
          { name: 'trabajoId', type: 'string', required: true, isActivated: true, GUID: genGuid() },
          { name: 'duracionDias', type: 'numeric', mode: 'int', required: true, isActivated: true, GUID: genGuid() },
          { name: 'fechaInicio', type: 'date', required: true, isActivated: true, GUID: genGuid() },
          { name: 'condiciones', type: 'string', isActivated: true, GUID: genGuid() },
          { name: 'exclusiones', type: 'string', isActivated: true, GUID: genGuid() }
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
      { name: 'calificacion', type: 'numeric', mode: 'int', required: true, isActivated: true, GUID: genGuid() },
      { name: 'comentarios', type: 'string', isActivated: true, GUID: genGuid() },
      { name: 'sugerencias', type: 'string', isActivated: true, GUID: genGuid() },
      { name: 'fechaValoracion', type: 'date', isActivated: true, GUID: genGuid() }
    ]
  }
];

const ordenesCollection = {
  collectionName: 'ordenes_servicio',
  type: 'object',
  properties: ordenesProperties,
  definitions: { type: 'definitions', properties: [], GUID: genGuid() },
  isActivated: true,
  additionalProperties: false,
  validationLevel: 'Strict',
  validationAction: 'Error',
  storageEngineName: 'WiredTiger',
  collectionUsers: [],
  indexes: [],
  collation: {},
  sharding: { unique: true, collation: 'null' },
  GUID: ordenesGuid,
  bucketId: model.buckets[0].GUID,
  hackoladeMeta: { validationErrors: {} }
};

if (newCollIndex !== -1) {
  model.collections[newCollIndex] = ordenesCollection;
} else {
  model.collections.push(ordenesCollection);
}

// Actualizar tabla idToNameHashTable
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
registerNames(ordenesProperties);
model.idToNameHashTable[ordenesGuid] = 'ordenes_servicio';

// Actualizar layout ERD
const erdItem = model.settings.centralPane.dbLevel.erd.find(e => e.GUID === ordenesGuid);
if (erdItem) {
  erdItem.width = 300;
  erdItem.height = 450;
} else {
  model.settings.centralPane.dbLevel.erd.push({
    GUID: ordenesGuid,
    x: 1120,
    y: 1580,
    width: 300,
    height: 450,
    color: {}
  });
}

fs.writeFileSync(targetPath, JSON.stringify(model, null, 2), 'utf8');
console.log('[✓] Modelo Hackolade actualizado exitosamente en:', targetPath);
