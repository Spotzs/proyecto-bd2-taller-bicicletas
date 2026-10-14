/**
 * Universidad Autónoma de Occidente (UAO)
 * Asignatura: Bases de Datos 2
 * Proyecto: Sistema de Gestión de Servicios de Mantenimiento y Reparación de Bicicletas
 * 
 * Script: 02_indexes.js
 * Descripción: Creación de índices de rendimiento y de integridad de reglas de negocio.
 */

const dbName = "taller_bicicletas_db";
const db = db.getSiblingDB(dbName);

print(`[+] Configurando índices en la base de datos: ${dbName}`);

// =============================================================================
// 1. ÍNDICES: usuarios
// =============================================================================
db.usuarios.createIndex({ documento: 1 }, { unique: true, name: "idx_usuarios_documento_unico" });
db.usuarios.createIndex({ correo: 1 }, { unique: true, name: "idx_usuarios_correo_unico" });
db.usuarios.createIndex({ rol: 1 }, { name: "idx_usuarios_rol" });

// =============================================================================
// 2. ÍNDICES: bicicletas
// =============================================================================
db.bicicletas.createIndex({ propietarioId: 1 }, { name: "idx_bicicletas_propietario" });
db.bicicletas.createIndex({ tipo: 1 }, { name: "idx_bicicletas_tipo" });
db.bicicletas.createIndex(
  { numeroSerie: 1 },
  { unique: true, sparse: true, name: "idx_bicicletas_serial_unico" }
);

// =============================================================================
// 3. ÍNDICES: catalogo_servicios
// =============================================================================
db.catalogo_servicios.createIndex({ categoria: 1 }, { name: "idx_catalogo_categoria" });
db.catalogo_servicios.createIndex({ nombre: 1 }, { name: "idx_catalogo_nombre" });

// =============================================================================
// 4. ÍNDICES: citas
// =============================================================================
db.citas.createIndex({ clienteId: 1, fechaHora: -1 }, { name: "idx_citas_cliente_fecha" });
db.citas.createIndex({ estado: 1 }, { name: "idx_citas_estado" });

// REGLA DE NEGOCIO: Impedir citas activas duplicadas para una misma bicicleta en el mismo horario
db.citas.createIndex(
  { bicicletaId: 1, fechaHora: 1 },
  {
    unique: true,
    partialFilterExpression: {
      estado: { $in: ["solicitada", "confirmada"] }
    },
    name: "idx_citas_bicicleta_horario_activo_unico"
  }
);

// =============================================================================
// 5. ÍNDICES: ordenes_servicio
// =============================================================================
db.ordenes_servicio.createIndex({ numeroOrden: 1 }, { unique: true, name: "idx_ordenes_numero_unico" });
db.ordenes_servicio.createIndex({ "cliente.usuarioId": 1, "recepcion.fechaRecepcion": -1 }, { name: "idx_ordenes_cliente_fecha" });
db.ordenes_servicio.createIndex({ estado: 1 }, { name: "idx_ordenes_estado" });
db.ordenes_servicio.createIndex({ "tecnicosAsignados.tecnicoId": 1 }, { name: "idx_ordenes_tecnico" });

// REGLA DE NEGOCIO: Una bicicleta no puede tener más de una orden activa de manera simultánea
db.ordenes_servicio.createIndex(
  { "bicicleta.bicicletaId": 1 },
  {
    unique: true,
    partialFilterExpression: {
      estado: {
        $in: [
          "recibida",
          "en_diagnostico",
          "pendiente_autorizacion",
          "en_ejecucion",
          "lista_para_entrega"
        ]
      }
    },
    name: "idx_bicicleta_orden_activa_unica"
  }
);

print("[✓] Todos los índices e integridad de negocio fueron creados exitosamente.");
