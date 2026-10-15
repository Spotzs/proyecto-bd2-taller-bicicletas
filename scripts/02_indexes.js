/**
 * Universidad Autónoma de Occidente (UAO)
 * Asignatura: Bases de Datos 2
 * Proyecto: Sistema de Gestión de Servicios de Mantenimiento y Reparación de Bicicletas
 * 
 * Script: 02_indexes.js
 * Descripción: Creación de índices conforme a las reglas del PDF:
 *   - "El sistema deberá impedir citas activas duplicadas para una misma bicicleta en el mismo horario"
 *   - "Una bicicleta no deberá tener más de una orden activa simultáneamente"
 */

const dbName = "taller_bicicletas_db";
const db = db.getSiblingDB(dbName);

print(`[+] Configurando índices en: ${dbName}`);

// =============================================================================
// 1. ÍNDICES: usuarios
// =============================================================================
db.usuarios.createIndex({ documentoIdentificacion: 1 }, { unique: true, name: "idx_usuarios_documento_unico" });
db.usuarios.createIndex({ correoElectronico: 1 }, { unique: true, name: "idx_usuarios_correo_unico" });
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
// REGLA DEL PDF: "El sistema deberá impedir citas activas duplicadas para una misma bicicleta en el mismo horario."
// =============================================================================
db.citas.createIndex({ clienteId: 1 }, { name: "idx_citas_cliente" });
db.citas.createIndex({ estado: 1 }, { name: "idx_citas_estado" });

db.citas.createIndex(
  { bicicletaId: 1, fecha: 1, hora: 1 },
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
// REGLA DEL PDF: "Una bicicleta podrá tener varias órdenes a lo largo del tiempo,
// pero no deberá tener más de una orden activa simultáneamente."
// =============================================================================
db.ordenes_servicio.createIndex({ "cliente.usuarioId": 1 }, { name: "idx_ordenes_cliente" });
db.ordenes_servicio.createIndex({ estado: 1 }, { name: "idx_ordenes_estado" });
db.ordenes_servicio.createIndex({ "tecnicosAsignados.tecnicoId": 1 }, { name: "idx_ordenes_tecnico" });

db.ordenes_servicio.createIndex(
  { "bicicleta.bicicletaId": 1 },
  {
    unique: true,
    partialFilterExpression: {
      estado: {
        $in: [
          "recibida",
          "en diagnóstico",
          "pendiente de autorización",
          "en ejecución",
          "lista para entrega"
        ]
      }
    },
    name: "idx_bicicleta_orden_activa_unica"
  }
);

print("[✓] Índices y restricciones de negocio creados exitosamente.");
