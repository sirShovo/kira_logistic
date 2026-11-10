// Modelo de Dominio y Entidades Relacionales — Sistema Kira Logistic
// Basado en las secciones 4.1 (Diagrama de Clases FO-DCL) y 4.2 (Diagrama Entidad-Relación FO-DER)
// de Distribuidora Kiramar S.A.S.

export type EstadoPedido =
  | 'Pendiente'
  | 'Validado'
  | 'Requiere Datos Maestros'
  | 'Excede Límites'
  | 'Asignado'
  | 'En Ruta'
  | 'Completado'
  | 'Devolución'
  | 'Reprogramado';

export type ZonaCobertura =
  | 'Zona Norte - Bello / Copacabana / Girardota'
  | 'Zona Centro - Medellín Candelaria / Guayaquil'
  | 'Zona Industrial - Guayabal / Itagüí'
  | 'Zona Sur - Envigado / Sabaneta / Caldas'
  | 'Oriente Cercano - Rionegro / Guarne'
  | 'Fuera de Cobertura Estándar';

export type TipoVehiculo =
  | 'Carry / Van Urbana'
  | 'Camión NHR Estaca'
  | 'Furgón NPR Seco'
  | 'Camión FTR Plataforma'
  | 'Minimula / Tractocamión';

export type EstadoVehiculo =
  | 'Disponible'
  | 'Reservado'
  | 'En Ruta'
  | 'Mantenimiento';

export type EstadoAsignacion =
  | 'Reservada'
  | 'Confirmada'
  | 'En Despacho'
  | 'Completada'
  | 'Cancelada';

export type EstadoRuta =
  | 'Planificada'
  | 'Advertencia Cobertura'
  | 'Ajuste Manual'
  | 'En Ejecución'
  | 'Finalizada';

export type EstadoDespacho =
  | 'Programado'
  | 'En Ejecución'
  | 'Con Novedad'
  | 'Completado'
  | 'Devolución'
  | 'Reprogramado';

export type PerfilUsuario =
  | 'Personal de logística / despachos'
  | 'Personal de logística / transporte'
  | 'Administrador del sistema';

// Entidad 2: LINEA_PEDIDO (Clase LineaPedido)
export interface LineaPedido {
  idLinea: string;
  idPedido: string;
  idProducto: string;
  nombreProducto: string;
  cantidad: number;
  pesoUnitario: number; // kg (0 indica dato maestro faltante para UC-02 Camino Alternativo 1)
  alto: number; // metros (ej. 0.45)
  ancho: number; // metros (ej. 0.40)
  largo: number; // metros (ej. 0.60)
}

// Entidad 1: PEDIDO (Clase Pedido)
export interface Pedido {
  idPedido: string;
  fechaPedido: string; // YYYY-MM-DD
  fechaEntregaSolicitada: string; // YYYY-MM-DD
  estadoPedido: EstadoPedido;
  idCliente: string;
  nombreCliente: string;
  nitCliente: string;
  contactoEntrega: string;
  destino: string;
  zonasEntrega: string[];
  prioridad: 'Alta' | 'Media' | 'Baja';
  codigoWms: string;
  lineas: LineaPedido[];
}

// Entidad 3: CARGA_PEDIDO (Clase CargaPedido)
export interface CargaPedido {
  idCarga: string;
  idPedido: string;
  pesoTotalKg: number;
  volumenTotalM3: number;
  dimMaxAlto: number;
  dimMaxAncho: number;
  dimMaxLargo: number;
  datosMaestrosCompletos: boolean;
  excedeLimitesEmpresa: boolean;
  resumenConsolidado: string;
}

// Entidad 4: VEHICULO (Clase Vehiculo)
export interface Vehiculo {
  idVehiculo: string;
  placa: string;
  tipo: TipoVehiculo;
  capacidadKg: number;
  volumenM3: number;
  altoInterior: number; // metros
  anchoInterior: number; // metros
  largoInterior: number; // metros
  estadoVehiculo: EstadoVehiculo;
  conductor: string;
  ubicacionBase: string;
  fechasOcupadas: string[]; // YYYY-MM-DD
  bloqueadoConcurrencia?: boolean; // Para demostrar UC-04 Camino Alternativo 1
}

// Entidad 5: ASIGNACION (Clase Asignacion)
export interface Asignacion {
  idAsignacion: string;
  idPedido: string;
  idVehiculo: string;
  idUsuario: string;
  fechaAsignacion: string;
  estadoAsignacion: EstadoAsignacion;
}

// Parada individual dentro de RutaEntrega
export interface ParadaRuta {
  orden: number;
  direccion: string;
  zona: string;
  enCobertura: boolean;
  ventanaHoraria: string;
  tiempoEstimadoMin: number;
  distanciaKm: number;
}

// Entidad 6: RUTA_ENTREGA (Clase RutaEntrega)
export interface RutaEntrega {
  idRuta: string;
  idAsignacion: string;
  destinos: string[];
  zonas: string[];
  ordenEntrega: number[];
  paradas: ParadaRuta[];
  estadoRuta: EstadoRuta;
  modoCalculo: 'Automático WMS/GIS' | 'Manual Operativo';
  distanciaTotalKm: number;
  tiempoEstimadoTotalMin: number;
}

// Entidad 7: DESPACHO (Clase Despacho)
export interface Despacho {
  idDespacho: string;
  idAsignacion: string;
  idRuta: string;
  fechaDespacho: string;
  estadoDespacho: EstadoDespacho;
  observaciones: string;
  conexionGpsActiva: boolean; // Para demostrar UC-06 Camino Alternativo 1
  ultimaUbicacionConocida: string;
  progresoPorcentaje: number;
}

// Entidad 8: TRAZABILIDAD (Clase Trazabilidad)
export interface Trazabilidad {
  idRegistro: string;
  idDespacho: string;
  fechaHora: string;
  ubicacion: string;
  estadoEntrega: string;
  novedad: string;
  autorRegistro: string;
}

// Entidad 9: USUARIO (Clase Usuario)
export interface Usuario {
  idUsuario: string;
  nombre: string;
  cargo: string;
  perfil: PerfilUsuario;
  contrasenaHash: string;
  estado: 'Activo' | 'Inactivo';
  emailCorporativo: string;
}

// Entidad CRM adicional para gestión comercial y logística de Distribuidora Kiramar S.A.S.
export interface ClienteCRM {
  idCliente: string;
  razonSocial: string;
  nit: string;
  segmento: 'Mayorista Ferretero' | 'Construcción e Infraestructura' | ' Grandes Superficies' | 'Distribuidor Regional';
  contactoPrincipal: string;
  cargoContacto: string;
  correo: string;
  direccionPrincipal: string;
  municipio: string;
  zonaLogistica: string;
  ventanaRecepcion: string;
  cumplimientoSlaPorcentaje: number;
  restriccionVehicular: string;
  cupoCreditoCop: number;
}

// Respaldo del sistema (RNF-06)
export interface BackupSnapshot {
  idSnapshot: string;
  fechaHora: string;
  autor: string;
  descripcion: string;
  totalPedidos: number;
  totalDespachos: number;
  totalEventosTrazabilidad: number;
  payloadJson: string;
}

// Límites corporativos de Distribuidora Kiramar S.A.S. para un único despacho estándar (UC-02 Camino Alternativo 2)
export const POLITICA_CARGA_KIRAMAR = {
  maxPesoUnicoDespachoKg: 8500,
  maxVolumenUnicoDespachoM3: 38.0,
  maxLargoUnitarioM: 7.2,
  maxAltoUnitarioM: 2.6,
  maxAnchoUnitarioM: 2.45,
};
