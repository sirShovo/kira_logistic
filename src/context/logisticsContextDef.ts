import { createContext } from 'react';
import type { 
  Usuario, 
  Vehiculo, 
  Pedido, 
  LineaPedido, 
  Asignacion, 
  RutaEntrega, 
  Despacho, 
  Trazabilidad, 
  ParadaRuta, 
  SnapshotSistema,
  PerfilUsuario 
} from '../types/domain';

export interface LogisticsContextType {
  // Estado
  usuarios: Usuario[];
  usuarioActivo: Usuario;
  pedidos: Pedido[];
  lineasPedido: LineaPedido[];
  vehiculos: Vehiculo[];
  asignaciones: Asignacion[];
  rutas: RutaEntrega[];
  despachos: Despacho[];
  trazabilidad: Trazabilidad[];
  servidorConectado: boolean;
  vistaActiva: string;
  pedidoSeleccionadoId: string | null;
  despachoSeleccionadoId: string | null;
  rutaSeleccionadaId: string | null;
  alertaGlobal: { tipo: 'info' | 'success' | 'warning' | 'error'; mensaje: string } | null;

  // Acciones de Navegacion y Control de Acceso
  cambiarUsuarioActivo: (idUsuario: string) => void;
  cambiarPerfilRapido: (perfil: PerfilUsuario) => void;
  toggleServidorConectado: () => void;
  cambiarVista: (vista: string, params?: { pedidoId?: string; despachoId?: string; rutaId?: string }) => void;
  limpiarAlerta: () => void;
  setAlerta: (tipo: 'info' | 'success' | 'warning' | 'error', mensaje: string) => void;

  // Acciones de Pedidos y Carga (UC-01, UC-02)
  actualizarDatosMaestros: (idLinea: string, pesoUnitario: number, alto: number, ancho: number, largo: number) => void;
  dividirPedidoExcedido: (idPedido: string) => void;
  generarPedidoPrueba: () => void;

  // Acciones de Flota y Asignacion (UC-03, UC-04)
  reservarVehiculo: (idPedido: string, idVehiculo: string, fechaDespacho: string, simularConflicto?: boolean) => boolean;
  cancelarReserva: (idAsignacion: string) => void;

  // Acciones de Rutas (UC-05)
  planificarRuta: (idAsignacion: string, paradas: ParadaRuta[], modo?: 'automatico' | 'manual') => void;
  reordenarParadasRuta: (idRuta: string, paradas: ParadaRuta[]) => void;
  corregirZonaParada: (idRuta: string, idParada: string, nuevaZona: string, nuevaDireccion?: string) => void;

  // Acciones de Despacho y Trazabilidad (UC-06)
  iniciarDespacho: (idDespacho: string) => void;
  actualizarProgresoDespacho: (idDespacho: string, avance: number, ubicacion: string) => void;
  toggleGpsDespacho: (idDespacho: string) => void;
  registrarReporteManualGps: (idDespacho: string, ubicacion: string, nota: string) => void;
  reportarNovedadDespacho: (idDespacho: string, motivo: string, resolucion: 'Devolucion a CEDI' | 'Reprogramar Despacho', observacion: string) => void;
  completarDespacho: (idDespacho: string, recibidoPor: string, documento: string, notas: string) => void;

  // Administracion y Respaldos (RNF-01, RNF-05, RNF-06)
  ejecutarDiagnosticoIntegridad: () => { totalProblemas: number; hallazgos: string[]; reparado: boolean };
  repararInconsistencias: () => void;
  generarSnapshot: (descripcion: string) => SnapshotSistema;
  restaurarSnapshot: (snapshot: SnapshotSistema) => boolean;
  restablecerDatosDemostracion: () => void;
}

export const LogisticsContext = createContext<LogisticsContextType | undefined>(undefined);
