/**
 * Tipos de dominio para el CRM Kira Logistic
 * Basado estrictamente en las clases del FO-DCL y entidades del FO-DER (PPI-3)
 */

export type PerfilUsuario = 
  | 'Personal de Logistica / Despachos'
  | 'Personal de Logistica / Transporte'
  | 'Administrador del Sistema';

export type EstadoPedido =
  | 'Pendiente'
  | 'Validado'
  | 'Requiere Datos Maestros'
  | 'Excede Limites'
  | 'Asignado'
  | 'En Ruta'
  | 'Completado'
  | 'Devolucion'
  | 'Reprogramado';

export type TipoVehiculo =
  | 'Van Urbana'
  | 'Camion Estaca'
  | 'Furgon Seco'
  | 'Camion Plataforma'
  | 'Tractocamion';

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
  | 'En Ejecucion'
  | 'Finalizada';

export type EstadoDespacho =
  | 'Programado'
  | 'En Ejecucion'
  | 'Con Novedad'
  | 'Completado'
  | 'Devolucion'
  | 'Reprogramado';

export interface Usuario {
  idUsuario: string;
  nombre: string;
  cargo: string;
  perfil: PerfilUsuario;
  correo: string;
  contrasenaHash: string;
  estado: 'Activo' | 'Inactivo';
}

export interface LineaPedido {
  idLinea: string;
  idPedido: string;
  idProducto: string;
  nombreProducto: string;
  cantidad: number;
  pesoUnitario: number; // kg
  alto: number; // metros
  ancho: number; // metros
  largo: number; // metros
}

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
}

export interface Pedido {
  idPedido: string;
  fechaPedido: string; // ISO YYYY-MM-DD
  cliente: string;
  estadoPedido: EstadoPedido;
  destino: string;
  zonasEntrega: string[];
  carga?: CargaPedido;
}

export interface Vehiculo {
  idVehiculo: string;
  placa: string;
  tipo: TipoVehiculo;
  capacidadKg: number;
  volumenM3: number;
  altoInterior: number;
  anchoInterior: number;
  largoInterior: number;
  estadoVehiculo: EstadoVehiculo;
  conductorAsignado?: string;
  telefonoConductor?: string;
}

export interface Asignacion {
  idAsignacion: string;
  idPedido: string;
  idVehiculo: string;
  idUsuario: string;
  fechaAsignacion: string; // ISO
  fechaDespachoProgramada: string; // ISO YYYY-MM-DD
  estadoAsignacion: EstadoAsignacion;
}

export interface ParadaRuta {
  idParada: string;
  orden: number;
  destino: string;
  cliente: string;
  zona: string;
  ventanaHoraria: string;
  distanciaKm: number;
  tiempoMinutos: number;
  enCobertura: boolean;
  entregado?: boolean;
}

export interface RutaEntrega {
  idRuta: string;
  idAsignacion: string;
  idPedido: string;
  idVehiculo: string;
  destinos: string[];
  zonas: string[];
  ordenEntrega: number[];
  paradas: ParadaRuta[];
  distanciaTotalKm: number;
  tiempoTotalMinutos: number;
  estadoRuta: EstadoRuta;
  modoCalculo: 'automatico' | 'manual';
}

export interface Despacho {
  idDespacho: string;
  idAsignacion: string;
  idRuta: string;
  idPedido: string;
  idVehiculo: string;
  fechaDespacho: string; // ISO
  estadoDespacho: EstadoDespacho;
  observaciones: string;
  porcentajeAvance: number; // 0 a 100
  ubicacionActual: string;
  conexionGpsActiva: boolean;
  ultimaUbicacionConocida: string;
  horaUltimoReporteGps: string;
}

export interface Trazabilidad {
  idRegistro: string;
  idDespacho: string;
  fechaHora: string; // ISO timestamp
  ubicacion: string;
  estadoEntrega: string;
  novedad: string;
  usuarioRegistro: string;
}

export interface SnapshotSistema {
  version: string;
  fechaGeneracion: string;
  autor: string;
  descripcion: string;
  pedidos: Pedido[];
  lineasPedido: LineaPedido[];
  vehiculos: Vehiculo[];
  asignaciones: Asignacion[];
  rutas: RutaEntrega[];
  despachos: Despacho[];
  trazabilidad: Trazabilidad[];
  usuarios: Usuario[];
}
