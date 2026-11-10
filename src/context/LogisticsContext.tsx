import React, { useState, useEffect } from 'react';
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
import { LogisticsContext } from './logisticsContextDef';
import { 
  USUARIOS_INICIALES, 
  VEHICULOS_INICIALES, 
  PEDIDOS_INICIALES, 
  LINEAS_PEDIDO_INICIALES, 
  ASIGNACIONES_INICIALES, 
  RUTAS_INICIALES, 
  DESPACHOS_INICIALES, 
  TRAZABILIDAD_INICIAL 
} from '../data/mockData';
import { 
  calcularCarga, 
  fraccionarPedido, 
  LIMITES_CORPORATIVOS, 
  estaEnZonaCobertura, 
  calcularMetricasParadas 
} from '../utils/logisticsEngine';

const STORAGE_KEY = 'kira_logistic_crm_data_v2';

function obtenerDatosIniciales() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado) {
      const data = JSON.parse(guardado);
      if (data.pedidos && data.vehiculos && data.asignaciones) {
        return data;
      }
    }
  } catch {
    // Retornar fallback
  }
  return null;
}

const datosIniciales = obtenerDatosIniciales();

export const LogisticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => datosIniciales?.usuarios || USUARIOS_INICIALES);
  const [usuarioActivo, setUsuarioActivo] = useState<Usuario>(() => datosIniciales?.usuarios?.[0] || USUARIOS_INICIALES[0]);
  const [pedidos, setPedidos] = useState<Pedido[]>(() => datosIniciales?.pedidos || PEDIDOS_INICIALES);
  const [lineasPedido, setLineasPedido] = useState<LineaPedido[]>(() => datosIniciales?.lineasPedido || LINEAS_PEDIDO_INICIALES);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(() => datosIniciales?.vehiculos || VEHICULOS_INICIALES);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>(() => datosIniciales?.asignaciones || ASIGNACIONES_INICIALES);
  const [rutas, setRutas] = useState<RutaEntrega[]>(() => datosIniciales?.rutas || RUTAS_INICIALES);
  const [despachos, setDespachos] = useState<Despacho[]>(() => datosIniciales?.despachos || DESPACHOS_INICIALES);
  const [trazabilidad, setTrazabilidad] = useState<Trazabilidad[]>(() => datosIniciales?.trazabilidad || TRAZABILIDAD_INICIAL);

  // Estados de control del CRM
  const [servidorConectado, setServidorConectado] = useState<boolean>(true);
  const [vistaActiva, setVistaActiva] = useState<string>('pipeline');
  const [pedidoSeleccionadoId, setPedidoSeleccionadoId] = useState<string | null>(null);
  const [despachoSeleccionadoId, setDespachoSeleccionadoId] = useState<string | null>(null);
  const [rutaSeleccionadaId, setRutaSeleccionadaId] = useState<string | null>(null);
  const [alertaGlobal, setAlertaGlobal] = useState<{ tipo: 'info' | 'success' | 'warning' | 'error'; mensaje: string } | null>(null);

  // Guardar en LocalStorage cada vez que cambie una entidad
  useEffect(() => {
    try {
      const dataToSave = {
        pedidos,
        lineasPedido,
        vehiculos,
        asignaciones,
        rutas,
        despachos,
        trazabilidad,
        usuarios
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch {
      // Ignorar error de almacenamiento
    }
  }, [pedidos, lineasPedido, vehiculos, asignaciones, rutas, despachos, trazabilidad, usuarios]);

  const setAlerta = (tipo: 'info' | 'success' | 'warning' | 'error', mensaje: string) => {
    setAlertaGlobal({ tipo, mensaje });
  };

  const limpiarAlerta = () => {
    setAlertaGlobal(null);
  };

  const cambiarUsuarioActivo = (idUsuario: string) => {
    const user = usuarios.find(u => u.idUsuario === idUsuario);
    if (user) {
      setUsuarioActivo(user);
      setAlerta('info', `Sesion activa cambiada a: ${user.nombre} (${user.cargo})`);
    }
  };

  const cambiarPerfilRapido = (perfil: PerfilUsuario) => {
    const user = usuarios.find(u => u.perfil === perfil);
    if (user) {
      setUsuarioActivo(user);
      setAlerta('info', `Perfil operativo conmutado a: ${user.perfil}`);
    }
  };

  const toggleServidorConectado = () => {
    setServidorConectado(prev => {
      const nuevo = !prev;
      if (nuevo) {
        setAlerta('success', 'Enlace con Base de Datos y WMS restablecido con exito.');
      } else {
        setAlerta('error', 'Fallo de comunicacion inducido con el servidor central WMS.');
      }
      return nuevo;
    });
  };

  const cambiarVista = (vista: string, params?: { pedidoId?: string; despachoId?: string; rutaId?: string }) => {
    setVistaActiva(vista);
    if (params?.pedidoId) setPedidoSeleccionadoId(params.pedidoId);
    if (params?.despachoId) setDespachoSeleccionadoId(params.despachoId);
    if (params?.rutaId) setRutaSeleccionadaId(params.rutaId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // UC-02 Camino Alternativo 1: Completar Datos Maestros
  const actualizarDatosMaestros = (
    idLinea: string, 
    pesoUnitario: number, 
    alto: number, 
    ancho: number, 
    largo: number
  ) => {
    const lineaActual = lineasPedido.find(l => l.idLinea === idLinea);
    if (!lineaActual) return;

    const nuevasLineas = lineasPedido.map(l => {
      if (l.idLinea === idLinea) {
        return { ...l, pesoUnitario, alto, ancho, largo };
      }
      return l;
    });

    setLineasPedido(nuevasLineas);

    // Recalcular carga del pedido
    const lineasDelPedido = nuevasLineas.filter(l => l.idPedido === lineaActual.idPedido);
    const nuevaCarga = calcularCarga(lineasDelPedido, lineaActual.idPedido);

    setPedidos(prev => prev.map(p => {
      if (p.idPedido === lineaActual.idPedido) {
        const nuevoEstado = nuevaCarga.datosMaestrosCompletos
          ? (nuevaCarga.excedeLimitesEmpresa ? 'Excede Limites' : 'Validado')
          : 'Requiere Datos Maestros';
        return {
          ...p,
          carga: nuevaCarga,
          estadoPedido: nuevoEstado
        };
      }
      return p;
    }));

    setAlerta('success', `Datos maestros actualizados para SKU ${lineaActual.idProducto}. Carga recalculada con exito.`);
  };

  // UC-02 Camino Alternativo 2: Dividir Pedido Excedido
  const dividirPedidoExcedido = (idPedido: string) => {
    const pedido = pedidos.find(p => p.idPedido === idPedido);
    if (!pedido) return;

    const lineas = lineasPedido.filter(l => l.idPedido === idPedido);
    const { subPedidoA, lineasA, subPedidoB, lineasB } = fraccionarPedido(pedido, lineas);

    // Reemplazar pedido padre por los dos hijos
    setPedidos(prev => [
      ...prev.filter(p => p.idPedido !== idPedido),
      subPedidoA,
      subPedidoB
    ]);

    // Reemplazar lineas
    setLineasPedido(prev => [
      ...prev.filter(l => l.idPedido !== idPedido),
      ...lineasA,
      ...lineasB
    ]);

    setAlerta('success', `Pedido ${idPedido} dividido exitosamente en sub-despachos ${subPedidoA.idPedido} y ${subPedidoB.idPedido}.`);
  };

  // UC-04: Formalizar Reserva de Transporte (con simulador de concurrencia)
  const reservarVehiculo = (
    idPedido: string, 
    idVehiculo: string, 
    fechaDespacho: string, 
    simularConflicto = false
  ): boolean => {
    const vehiculo = vehiculos.find(v => v.idVehiculo === idVehiculo);
    const pedido = pedidos.find(p => p.idPedido === idPedido);

    if (!vehiculo || !pedido) {
      setAlerta('error', 'Error al procesar reserva: Vehiculo o pedido no encontrado.');
      return false;
    }

    // UC-04 Camino Alternativo 1: Simular colision de concurrencia
    if (simularConflicto) {
      setVehiculos(prev => prev.map(v => 
        v.idVehiculo === idVehiculo ? { ...v, estadoVehiculo: 'Reservado' } : v
      ));
      setAlerta('error', `Conflicto de concurrencia: La unidad ${vehiculo.placa} acaba de ser reservada por otro despachador. Seleccione otra unidad disponible.`);
      return false;
    }

    const nuevaAsignacion: Asignacion = {
      idAsignacion: `ASG-${Date.now().toString().slice(-4)}`,
      idPedido,
      idVehiculo,
      idUsuario: usuarioActivo.idUsuario,
      fechaAsignacion: new Date().toISOString(),
      fechaDespachoProgramada: fechaDespacho,
      estadoAsignacion: 'Confirmada'
    };

    // Actualizar estado del vehiculo y del pedido
    setVehiculos(prev => prev.map(v => 
      v.idVehiculo === idVehiculo ? { ...v, estadoVehiculo: 'Reservado' } : v
    ));

    setPedidos(prev => prev.map(p => 
      p.idPedido === idPedido ? { ...p, estadoPedido: 'Asignado' } : p
    ));

    setAsignaciones(prev => [...prev, nuevaAsignacion]);

    // Crear la ruta preliminar correspondiente
    const zonaPrincipal = pedido.zonasEntrega[0] || 'Zona Centro: Medellin Candelaria / Guayaquil';
    const esCobertura = estaEnZonaCobertura(zonaPrincipal);

    const nuevaParada: ParadaRuta = {
      idParada: `PRD-${Date.now().toString().slice(-4)}`,
      orden: 1,
      destino: pedido.destino,
      cliente: pedido.cliente,
      zona: zonaPrincipal,
      ventanaHoraria: '08:30 - 10:30',
      distanciaKm: 14.5,
      tiempoMinutos: 35,
      enCobertura: esCobertura
    };

    const nuevaRuta: RutaEntrega = {
      idRuta: `RUT-${nuevaAsignacion.idAsignacion.slice(-3)}`,
      idAsignacion: nuevaAsignacion.idAsignacion,
      idPedido,
      idVehiculo,
      destinos: [pedido.destino],
      zonas: [zonaPrincipal],
      ordenEntrega: [1],
      paradas: [nuevaParada],
      distanciaTotalKm: 14.5,
      tiempoTotalMinutos: 35,
      estadoRuta: esCobertura ? 'Planificada' : 'Advertencia Cobertura',
      modoCalculo: 'automatico'
    };

    setRutas(prev => [...prev, nuevaRuta]);

    setAlerta('success', `Reserva formalizada: Vehiculo ${vehiculo.placa} asignado al pedido ${pedido.idPedido}. Hoja de ruta generada.`);
    setRutaSeleccionadaId(nuevaRuta.idRuta);
    return true;
  };

  // UC-04 Camino Alternativo 2: Cancelacion de Reserva
  const cancelarReserva = (idAsignacion: string) => {
    const asg = asignaciones.find(a => a.idAsignacion === idAsignacion);
    if (!asg) return;

    // Liberar vehiculo
    setVehiculos(prev => prev.map(v => 
      v.idVehiculo === asg.idVehiculo ? { ...v, estadoVehiculo: 'Disponible' } : v
    ));

    // Regresar pedido a Validado
    setPedidos(prev => prev.map(p => 
      p.idPedido === asg.idPedido ? { ...p, estadoPedido: 'Validado' } : p
    ));

    // Eliminar asignacion y rutas asociadas no ejecutadas
    setAsignaciones(prev => prev.filter(a => a.idAsignacion !== idAsignacion));
    setRutas(prev => prev.filter(r => r.idAsignacion !== idAsignacion));

    setAlerta('info', `Reserva ${idAsignacion} cancelada. El vehiculo ha sido devuelto a estado Disponible.`);
  };

  // UC-05: Planificar Ruta
  const planificarRuta = (idAsignacion: string, paradas: ParadaRuta[], modo: 'automatico' | 'manual' = 'automatico') => {
    const asg = asignaciones.find(a => a.idAsignacion === idAsignacion);
    if (!asg) return;

    const metricas = calcularMetricasParadas(paradas);

    const rutaExistente = rutas.find(r => r.idAsignacion === idAsignacion);
    const idRuta = rutaExistente ? rutaExistente.idRuta : `RUT-${Date.now().toString().slice(-4)}`;

    const estadoRuta = metricas.tieneParadasFueraCobertura
      ? 'Advertencia Cobertura'
      : (modo === 'manual' ? 'Ajuste Manual' : 'Planificada');

    const nuevaRuta: RutaEntrega = {
      idRuta,
      idAsignacion,
      idPedido: asg.idPedido,
      idVehiculo: asg.idVehiculo,
      destinos: paradas.map(p => p.destino),
      zonas: paradas.map(p => p.zona),
      ordenEntrega: paradas.map((_, i) => i + 1),
      paradas,
      distanciaTotalKm: metricas.distanciaTotalKm,
      tiempoTotalMinutos: metricas.tiempoTotalMinutos,
      estadoRuta,
      modoCalculo: modo
    };

    setRutas(prev => [...prev.filter(r => r.idRuta !== idRuta), nuevaRuta]);

    // Crear preliminarmente el despacho programado
    const idDespacho = `DSP-${idRuta.slice(-3)}`;
    const nuevoDespacho: Despacho = {
      idDespacho,
      idAsignacion,
      idRuta,
      idPedido: asg.idPedido,
      idVehiculo: asg.idVehiculo,
      fechaDespacho: asg.fechaDespachoProgramada,
      estadoDespacho: 'Programado',
      observaciones: 'Hoja de ruta consolidada lista para ejecucion.',
      porcentajeAvance: 0,
      ubicacionActual: LIMITES_CORPORATIVOS.ORIGEN_CEDI,
      conexionGpsActiva: true,
      ultimaUbicacionConocida: LIMITES_CORPORATIVOS.ORIGEN_CEDI,
      horaUltimoReporteGps: '08:00 AM'
    };

    setDespachos(prev => [...prev.filter(d => d.idRuta !== idRuta), nuevoDespacho]);
    setAlerta('success', `Ruta ${idRuta} consolidada con exito. Despacho ${idDespacho} programado.`);
  };

  // UC-05 Camino Alternativo 2: Reordenar Paradas
  const reordenarParadasRuta = (idRuta: string, nuevasParadas: ParadaRuta[]) => {
    const ruta = rutas.find(r => r.idRuta === idRuta);
    if (!ruta) return;

    const paradasReindexadas = nuevasParadas.map((p, idx) => ({
      ...p,
      orden: idx + 1
    }));

    const metricas = calcularMetricasParadas(paradasReindexadas);

    setRutas(prev => prev.map(r => {
      if (r.idRuta === idRuta) {
        return {
          ...r,
          paradas: paradasReindexadas,
          ordenEntrega: paradasReindexadas.map(p => p.orden),
          destinos: paradasReindexadas.map(p => p.destino),
          distanciaTotalKm: metricas.distanciaTotalKm,
          tiempoTotalMinutos: metricas.tiempoTotalMinutos,
          estadoRuta: metricas.tieneParadasFueraCobertura ? 'Advertencia Cobertura' : 'Ajuste Manual',
          modoCalculo: 'manual'
        };
      }
      return r;
    }));

    setAlerta('info', `Secuencia de paradas actualizada manualmente en ruta ${idRuta}.`);
  };

  // UC-05 Camino Alternativo 1: Corregir Zona de Parada
  const corregirZonaParada = (idRuta: string, idParada: string, nuevaZona: string, nuevaDireccion?: string) => {
    setRutas(prev => prev.map(r => {
      if (r.idRuta === idRuta) {
        const paradasActualizadas = r.paradas.map(p => {
          if (p.idParada === idParada) {
            return {
              ...p,
              zona: nuevaZona,
              destino: nuevaDireccion || p.destino,
              enCobertura: estaEnZonaCobertura(nuevaZona)
            };
          }
          return p;
        });

        const metricas = calcularMetricasParadas(paradasActualizadas);
        return {
          ...r,
          paradas: paradasActualizadas,
          zonas: paradasActualizadas.map(p => p.zona),
          destinos: paradasActualizadas.map(p => p.destino),
          estadoRuta: metricas.tieneParadasFueraCobertura ? 'Advertencia Cobertura' : 'Planificada'
        };
      }
      return r;
    }));

    setAlerta('success', `Zona de cobertura regularizada para la parada en ruta ${idRuta}.`);
  };

  // UC-06: Iniciar Despacho
  const iniciarDespacho = (idDespacho: string) => {
    const desp = despachos.find(d => d.idDespacho === idDespacho);
    if (!desp) return;

    setDespachos(prev => prev.map(d => 
      d.idDespacho === idDespacho 
        ? { ...d, estadoDespacho: 'En Ejecucion', porcentajeAvance: 15, ubicacionActual: 'En transito saliendo de CEDI Guayabal' } 
        : d
    ));

    // Vehiculo a En Ruta
    setVehiculos(prev => prev.map(v => 
      v.idVehiculo === desp.idVehiculo ? { ...v, estadoVehiculo: 'En Ruta' } : v
    ));

    // Pedido a En Ruta
    setPedidos(prev => prev.map(p => 
      p.idPedido === desp.idPedido ? { ...p, estadoPedido: 'En Ruta' } : p
    ));

    // Ruta a En Ejecucion
    setRutas(prev => prev.map(r => 
      r.idRuta === desp.idRuta ? { ...r, estadoRuta: 'En Ejecucion' } : r
    ));

    // Registro de Trazabilidad
    const nuevoEvento: Trazabilidad = {
      idRegistro: `TRZ-${Date.now().toString().slice(-4)}`,
      idDespacho,
      fechaHora: new Date().toISOString(),
      ubicacion: LIMITES_CORPORATIVOS.ORIGEN_CEDI,
      estadoEntrega: 'Inicio de Despacho',
      novedad: 'Vehiculo salio de bodega central e inicio ruta de distribucion.',
      usuarioRegistro: usuarioActivo.nombre
    };

    setTrazabilidad(prev => [...prev, nuevoEvento]);
    setAlerta('success', `Despacho ${idDespacho} iniciado exitosamente. Monitoreo en tiempo real habilitado.`);
  };

  const actualizarProgresoDespacho = (idDespacho: string, avance: number, ubicacion: string) => {
    setDespachos(prev => prev.map(d => 
      d.idDespacho === idDespacho 
        ? { ...d, porcentajeAvance: avance, ubicacionActual: ubicacion, ultimaUbicacionConocida: ubicacion } 
        : d
    ));
  };

  // UC-06 Camino Alternativo 1: Simulacion y control de perdida GPS
  const toggleGpsDespacho = (idDespacho: string) => {
    setDespachos(prev => prev.map(d => {
      if (d.idDespacho === idDespacho) {
        const nuevoGps = !d.conexionGpsActiva;
        if (!nuevoGps) {
          setAlerta('warning', 'Alerta: Senal telemetrica GPS interrumpida. Se visualiza la ultima ubicacion conocida registrada.');
        } else {
          setAlerta('success', 'Enlace GPS con la unidad reestablecido.');
        }
        return { ...d, conexionGpsActiva: nuevoGps };
      }
      return d;
    }));
  };

  const registrarReporteManualGps = (idDespacho: string, ubicacion: string, nota: string) => {
    const desp = despachos.find(d => d.idDespacho === idDespacho);
    if (!desp) return;

    setDespachos(prev => prev.map(d => 
      d.idDespacho === idDespacho 
        ? { ...d, ubicacionActual: ubicacion, ultimaUbicacionConocida: ubicacion, horaUltimoReporteGps: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } 
        : d
    ));

    const nuevoEvento: Trazabilidad = {
      idRegistro: `TRZ-${Date.now().toString().slice(-4)}`,
      idDespacho,
      fechaHora: new Date().toISOString(),
      ubicacion,
      estadoEntrega: 'Reporte Radial de Posicion',
      novedad: `[Canal Telefonico / Radio] ${nota}`,
      usuarioRegistro: usuarioActivo.nombre
    };

    setTrazabilidad(prev => [...prev, nuevoEvento]);
    setAlerta('info', `Reporte manual registrado para despacho ${idDespacho}.`);
  };

  // UC-06 Camino Alternativo 2: Novedad de Entrega (Devolucion / Reprogramacion)
  const reportarNovedadDespacho = (
    idDespacho: string, 
    motivo: string, 
    resolucion: 'Devolucion a CEDI' | 'Reprogramar Despacho', 
    observacion: string
  ) => {
    const desp = despachos.find(d => d.idDespacho === idDespacho);
    if (!desp) return;

    const estadoFinal = resolucion === 'Devolucion a CEDI' ? 'Devolucion' : 'Reprogramado';

    setDespachos(prev => prev.map(d => 
      d.idDespacho === idDespacho 
        ? { ...d, estadoDespacho: estadoFinal, observaciones: `${motivo}. ${observacion}` } 
        : d
    ));

    setPedidos(prev => prev.map(p => 
      p.idPedido === desp.idPedido ? { ...p, estadoPedido: estadoFinal } : p
    ));

    // Si es devolucion a CEDI, el vehiculo retorna y queda disponible
    if (resolucion === 'Devolucion a CEDI') {
      setVehiculos(prev => prev.map(v => 
        v.idVehiculo === desp.idVehiculo ? { ...v, estadoVehiculo: 'Disponible' } : v
      ));
    }

    const nuevoEvento: Trazabilidad = {
      idRegistro: `TRZ-${Date.now().toString().slice(-4)}`,
      idDespacho,
      fechaHora: new Date().toISOString(),
      ubicacion: desp.ubicacionActual,
      estadoEntrega: `Novedad: ${estadoFinal}`,
      novedad: `Motivo: ${motivo}. Resolucion: ${resolucion}. Detalle: ${observacion}`,
      usuarioRegistro: usuarioActivo.nombre
    };

    setTrazabilidad(prev => [...prev, nuevoEvento]);
    setAlerta('warning', `Novedad registrada en despacho ${idDespacho}. Estado actualizado a ${estadoFinal}.`);
  };

  // UC-06 Exito: Confirmar Entrega Completada
  const completarDespacho = (
    idDespacho: string, 
    recibidoPor: string, 
    documento: string, 
    notas: string
  ) => {
    const desp = despachos.find(d => d.idDespacho === idDespacho);
    if (!desp) return;

    setDespachos(prev => prev.map(d => 
      d.idDespacho === idDespacho 
        ? { ...d, estadoDespacho: 'Completado', porcentajeAvance: 100, observaciones: `Completado exitosamente. Recibio: ${recibidoPor} (CC: ${documento}). ${notas}` } 
        : d
    ));

    setPedidos(prev => prev.map(p => 
      p.idPedido === desp.idPedido ? { ...p, estadoPedido: 'Completado' } : p
    ));

    // Liberacion automatica del vehiculo
    setVehiculos(prev => prev.map(v => 
      v.idVehiculo === desp.idVehiculo ? { ...v, estadoVehiculo: 'Disponible' } : v
    ));

    setRutas(prev => prev.map(r => 
      r.idRuta === desp.idRuta ? { ...r, estadoRuta: 'Finalizada' } : r
    ));

    const nuevoEvento: Trazabilidad = {
      idRegistro: `TRZ-${Date.now().toString().slice(-4)}`,
      idDespacho,
      fechaHora: new Date().toISOString(),
      ubicacion: 'Destino Final',
      estadoEntrega: 'Entrega Completada y Certificada',
      novedad: `Descarga finalizada. Constancia a nombre de ${recibidoPor} (CC: ${documento}). Vehiculo liberado a disponible.`,
      usuarioRegistro: usuarioActivo.nombre
    };

    setTrazabilidad(prev => [...prev, nuevoEvento]);
    setAlerta('success', `Despacho ${idDespacho} completado con exito. Vehiculo liberado a Disponible.`);
  };

  // RNF-05: Auditoria y Diagnostico de Consistencia Relacional
  const ejecutarDiagnosticoIntegridad = (): { totalProblemas: number; hallazgos: string[]; reparado: boolean } => {
    const hallazgos: string[] = [];

    // 1. Pedidos asignados sin vehiculo
    for (const p of pedidos) {
      if (p.estadoPedido === 'Asignado') {
        const asg = asignaciones.find(a => a.idPedido === p.idPedido);
        if (!asg) {
          hallazgos.push(`Pedido ${p.idPedido} figura 'Asignado' pero carece de registro en tabla ASIGNACION.`);
        }
      }
    }

    // 2. Lineas de pedido huerfanas
    for (const l of lineasPedido) {
      const existePed = pedidos.some(p => p.idPedido === l.idPedido);
      if (!existePed) {
        hallazgos.push(`Linea de pedido ${l.idLinea} (SKU: ${l.idProducto}) hace referencia a un pedido inexistente (${l.idPedido}).`);
      }
    }

    // 3. Vehiculos en estado Reservado sin asignacion activa
    for (const v of vehiculos) {
      if (v.estadoVehiculo === 'Reservado') {
        const tieneAsg = asignaciones.some(a => a.idVehiculo === v.idVehiculo && (a.estadoAsignacion === 'Reservada' || a.estadoAsignacion === 'Confirmada'));
        if (!tieneAsg) {
          hallazgos.push(`Vehiculo ${v.placa} figura como 'Reservado' pero no tiene asignacion activa registrada.`);
        }
      }
    }

    return {
      totalProblemas: hallazgos.length,
      hallazgos,
      reparado: false
    };
  };

  const repararInconsistencias = () => {
    // Normalizar vehiculos huerfanos
    setVehiculos(prev => prev.map(v => {
      if (v.estadoVehiculo === 'Reservado') {
        const tieneAsg = asignaciones.some(a => a.idVehiculo === v.idVehiculo && (a.estadoAsignacion === 'Reservada' || a.estadoAsignacion === 'Confirmada'));
        if (!tieneAsg) {
          return { ...v, estadoVehiculo: 'Disponible' };
        }
      }
      return v;
    }));

    // Normalizar pedidos con inconsistencias
    setPedidos(prev => prev.map(p => {
      if (p.estadoPedido === 'Asignado') {
        const asg = asignaciones.find(a => a.idPedido === p.idPedido);
        if (!asg) {
          return { ...p, estadoPedido: 'Validado' };
        }
      }
      return p;
    }));

    setAlerta('success', 'Procedimiento de autoreparacion ejecutado. Todas las inconsistencias referenciales han sido subsanadas.');
  };

  // RNF-06: Copias de Respaldo del Sistema
  const generarSnapshot = (descripcion: string): SnapshotSistema => {
    const snapshot: SnapshotSistema = {
      version: '1.0.0-kiramar',
      fechaGeneracion: new Date().toISOString(),
      autor: `${usuarioActivo.nombre} (${usuarioActivo.cargo})`,
      descripcion: descripcion || 'Copia de seguridad rutinaria de operaciones',
      pedidos,
      lineasPedido,
      vehiculos,
      asignaciones,
      rutas,
      despachos,
      trazabilidad,
      usuarios
    };

    setAlerta('success', 'Copia de respaldo generada exitosamente. Lista para descarga JSON.');
    return snapshot;
  };

  const restaurarSnapshot = (snapshot: SnapshotSistema): boolean => {
    if (!snapshot || !snapshot.pedidos || !snapshot.vehiculos) {
      setAlerta('error', 'El archivo no contiene una estructura valida de respaldo de Kira Logistic.');
      return false;
    }

    try {
      setPedidos(snapshot.pedidos);
      setLineasPedido(snapshot.lineasPedido || []);
      setVehiculos(snapshot.vehiculos);
      setAsignaciones(snapshot.asignaciones || []);
      setRutas(snapshot.rutas || []);
      setDespachos(snapshot.despachos || []);
      setTrazabilidad(snapshot.trazabilidad || []);
      if (snapshot.usuarios) setUsuarios(snapshot.usuarios);

      setAlerta('success', `Restauracion completada: Sistema restablecido al punto del ${new Date(snapshot.fechaGeneracion).toLocaleString()}.`);
      return true;
    } catch {
      setAlerta('error', 'Error al procesar y restaurar la copia de seguridad.');
      return false;
    }
  };

  const restablecerDatosDemostracion = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUsuarios(USUARIOS_INICIALES);
    setUsuarioActivo(USUARIOS_INICIALES[0]);
    setPedidos(PEDIDOS_INICIALES);
    setLineasPedido(LINEAS_PEDIDO_INICIALES);
    setVehiculos(VEHICULOS_INICIALES);
    setAsignaciones(ASIGNACIONES_INICIALES);
    setRutas(RUTAS_INICIALES);
    setDespachos(DESPACHOS_INICIALES);
    setTrazabilidad(TRAZABILIDAD_INICIAL);
    setServidorConectado(true);
    setAlerta('info', 'Datos del sistema reiniciados al escenario oficial de demostracion.');
  };

  const generarPedidoPrueba = () => {
    const num = Math.floor(100 + Math.random() * 900);
    const idPedido = `PED-T${num}`;
    const nuevoPedido: Pedido = {
      idPedido,
      fechaPedido: new Date().toISOString().split('T')[0],
      cliente: `Supermercado Kiramar Express #${num}`,
      estadoPedido: 'Pendiente',
      destino: `Carrera ${Math.floor(10 + Math.random() * 70)} # ${Math.floor(20 + Math.random() * 80)}-15, Medellin`,
      zonasEntrega: ['Zona Centro: Medellin Candelaria / Guayaquil']
    };

    const nuevasLineas: LineaPedido[] = [
      {
        idLinea: `LIN-T${num}-1`,
        idPedido,
        idProducto: 'SKU-LACT-GEN',
        nombreProducto: 'Leche Deslactosada 1L x 12 unds',
        cantidad: 50,
        pesoUnitario: 12.0,
        alto: 0.35,
        ancho: 0.25,
        largo: 0.40
      },
      {
        idLinea: `LIN-T${num}-2`,
        idPedido,
        idProducto: 'SKU-QUES-GEN',
        nombreProducto: 'Quesito Tradicional Antioqueno 500g x 20',
        cantidad: 30,
        pesoUnitario: 10.5,
        alto: 0.20,
        ancho: 0.25,
        largo: 0.35
      }
    ];

    nuevoPedido.carga = calcularCarga(nuevasLineas, idPedido);
    nuevoPedido.estadoPedido = 'Validado';

    setLineasPedido(prev => [...prev, ...nuevasLineas]);
    setPedidos(prev => [nuevoPedido, ...prev]);
    setAlerta('success', `Pedido de prueba ${idPedido} generado e insertado.`);
  };

  return (
    <LogisticsContext.Provider
      value={{
        usuarios,
        usuarioActivo,
        pedidos,
        lineasPedido,
        vehiculos,
        asignaciones,
        rutas,
        despachos,
        trazabilidad,
        servidorConectado,
        vistaActiva,
        pedidoSeleccionadoId,
        despachoSeleccionadoId,
        rutaSeleccionadaId,
        alertaGlobal,
        cambiarUsuarioActivo,
        cambiarPerfilRapido,
        toggleServidorConectado,
        cambiarVista,
        limpiarAlerta,
        setAlerta,
        actualizarDatosMaestros,
        dividirPedidoExcedido,
        generarPedidoPrueba,
        reservarVehiculo,
        cancelarReserva,
        planificarRuta,
        reordenarParadasRuta,
        corregirZonaParada,
        iniciarDespacho,
        actualizarProgresoDespacho,
        toggleGpsDespacho,
        registrarReporteManualGps,
        reportarNovedadDespacho,
        completarDespacho,
        ejecutarDiagnosticoIntegridad,
        repararInconsistencias,
        generarSnapshot,
        restaurarSnapshot,
        restablecerDatosDemostracion
      }}
    >
      {children}
    </LogisticsContext.Provider>
  );
};


