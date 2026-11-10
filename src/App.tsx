import { useState } from 'react';
import {
  ASIGNACIONES_INICIALES,
  BACKUPS_INICIALES,
  CLIENTES_CRM_INICIALES,
  DESPACHOS_INICIALES,
  PEDIDOS_INICIALES,
  RUTAS_INICIALES,
  TRAZABILIDAD_INICIAL,
  USUARIOS_INICIALES,
  VEHICULOS_INICIALES,
} from './data/mockData';
import type {
  Asignacion,
  BackupSnapshot,
  Despacho,
  Pedido,
  RutaEntrega,
  Trazabilidad,
  Usuario,
  Vehiculo,
} from './types/domain';
import { generarRutaEntrega } from './utils/logisticsEngine';
import { CrmSidebar, TopCommandBar } from './components/Navbar';
import type { ModuloActivo } from './components/Navbar';
import { WorkflowBanner } from './components/WorkflowBanner';
import { PedidosModule } from './components/PedidosModule';
import { FlotaAsignacionModule } from './components/FlotaAsignacionModule';
import { RutasDespachosModule } from './components/RutasDespachosModule';
import { ClientesCrmModule } from './components/ClientesCrmModule';
import { AdminSeguridadModule } from './components/AdminSeguridadModule';

export function App() {
  const [moduloActivo, setModuloActivo] = useState<ModuloActivo>('resumen');
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [usuarios] = useState<Usuario[]>(USUARIOS_INICIALES);
  const [usuarioActual, setUsuarioActual] = useState<Usuario>(
    USUARIOS_INICIALES[0]
  );
  const [wmsConectado, setWmsConectado] = useState<boolean>(true);

  const [pedidos, setPedidos] = useState<Pedido[]>(PEDIDOS_INICIALES);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(VEHICULOS_INICIALES);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>(
    ASIGNACIONES_INICIALES
  );
  const [rutas, setRutas] = useState<RutaEntrega[]>(RUTAS_INICIALES);
  const [despachos, setDespachos] = useState<Despacho[]>(DESPACHOS_INICIALES);
  const [trazabilidad, setTrazabilidad] = useState<Trazabilidad[]>(
    TRAZABILIDAD_INICIAL
  );
  const [backups, setBackups] = useState<BackupSnapshot[]>(BACKUPS_INICIALES);

  const [pedidoSeleccionadoId, setPedidoSeleccionadoId] = useState<string>(
    PEDIDOS_INICIALES[0].idPedido
  );
  const [asignacionSeleccionadaId, setAsignacionSeleccionadaId] =
    useState<string>(ASIGNACIONES_INICIALES[0].idAsignacion);

  // UC-02 Camino Alternativo 1: Completar datos maestros faltantes en SKU
  const handleCompletarDatosMaestros = (
    idPedido: string,
    idLinea: string,
    pesoUnitario: number,
    alto: number,
    ancho: number,
    largo: number
  ) => {
    setPedidos((prev) =>
      prev.map((ped) => {
        if (ped.idPedido !== idPedido) return ped;
        const nuevasLineas = ped.lineas.map((l) =>
          l.idLinea === idLinea
            ? { ...l, pesoUnitario, alto, ancho, largo }
            : l
        );
        return {
          ...ped,
          lineas: nuevasLineas,
          estadoPedido: 'Validado',
        };
      })
    );
  };

  // UC-02 Camino Alternativo 2: Dividir pedido cuando excede límites corporativos
  const handleDividirPedidoExcedido = (idPedido: string) => {
    const original = pedidos.find((p) => p.idPedido === idPedido);
    if (!original) return;

    const subPedidoA: Pedido = {
      ...original,
      idPedido: `${original.idPedido}-A`,
      estadoPedido: 'Validado',
      codigoWms: `${original.codigoWms}-A`,
      lineas: original.lineas.map((l, idx) => ({
        ...l,
        idLinea: `${l.idLinea}-A${idx}`,
        idPedido: `${original.idPedido}-A`,
        cantidad: Math.ceil(l.cantidad / 2),
      })),
    };

    const subPedidoB: Pedido = {
      ...original,
      idPedido: `${original.idPedido}-B`,
      estadoPedido: 'Validado',
      codigoWms: `${original.codigoWms}-B`,
      lineas: original.lineas.map((l, idx) => ({
        ...l,
        idLinea: `${l.idLinea}-B${idx}`,
        idPedido: `${original.idPedido}-B`,
        cantidad: Math.max(1, Math.floor(l.cantidad / 2)),
      })),
    };

    setPedidos((prev) => [
      subPedidoA,
      subPedidoB,
      ...prev.filter((p) => p.idPedido !== idPedido),
    ]);
    setPedidoSeleccionadoId(subPedidoA.idPedido);
  };

  // UC-04: Registrar Asignación y Reserva de Vehículo
  const handleRegistrarAsignacion = (
    idPedido: string,
    idVehiculo: string,
    fecha: string
  ) => {
    const nuevoIdAsg = `ASG-2026-${103 + asignaciones.length}`;
    const nuevaAsg: Asignacion = {
      idAsignacion: nuevoIdAsg,
      idPedido,
      idVehiculo,
      idUsuario: usuarioActual.idUsuario,
      fechaAsignacion: fecha,
      estadoAsignacion: 'Reservada',
    };

    setAsignaciones((prev) => [nuevaAsg, ...prev]);
    setVehiculos((prev) =>
      prev.map((v) =>
        v.idVehiculo === idVehiculo
          ? {
              ...v,
              estadoVehiculo: 'Reservado',
              fechasOcupadas: [...v.fechasOcupadas, fecha],
            }
          : v
      )
    );
    setPedidos((prev) =>
      prev.map((p) =>
        p.idPedido === idPedido ? { ...p, estadoPedido: 'Asignado' } : p
      )
    );
    setAsignacionSeleccionadaId(nuevoIdAsg);
  };

  // UC-04 Camino Alternativo 2: Cancelar asignación y liberar reserva
  const handleCancelarAsignacion = (idAsignacion: string) => {
    const target = asignaciones.find((a) => a.idAsignacion === idAsignacion);
    if (!target) return;

    setAsignaciones((prev) =>
      prev.map((a) =>
        a.idAsignacion === idAsignacion
          ? { ...a, estadoAsignacion: 'Cancelada' }
          : a
      )
    );
    setVehiculos((prev) =>
      prev.map((v) =>
        v.idVehiculo === target.idVehiculo
          ? { ...v, estadoVehiculo: 'Disponible' }
          : v
      )
    );
    setPedidos((prev) =>
      prev.map((p) =>
        p.idPedido === target.idPedido ? { ...p, estadoPedido: 'Validado' } : p
      )
    );
  };

  // UC-05: Generar ruta de entrega
  const handleGenerarRuta = (
    idAsignacion: string,
    modoCalculo: 'Automático WMS/GIS' | 'Manual Operativo'
  ) => {
    const asg = asignaciones.find((a) => a.idAsignacion === idAsignacion);
    if (!asg) return;
    const ped = pedidos.find((p) => p.idPedido === asg.idPedido);
    if (!ped) return;

    const nuevaRuta = generarRutaEntrega(idAsignacion, ped, modoCalculo);
    setRutas((prev) => [
      nuevaRuta,
      ...prev.filter((r) => r.idAsignacion !== idAsignacion),
    ]);
  };

  // UC-05: Ajustar orden de paradas manualmente
  const handleReordenarParada = (
    idRuta: string,
    indexActual: number,
    direccion: 'SUBIR' | 'BAJAR'
  ) => {
    setRutas((prev) =>
      prev.map((r) => {
        if (r.idRuta !== idRuta) return r;
        const nuevasParadas = [...r.paradas];
        const targetIndex =
          direccion === 'SUBIR' ? indexActual - 1 : indexActual + 1;
        if (targetIndex < 1 || targetIndex >= nuevasParadas.length) return r;

        const temp = nuevasParadas[indexActual];
        nuevasParadas[indexActual] = nuevasParadas[targetIndex];
        nuevasParadas[targetIndex] = temp;

        const renumeradas = nuevasParadas.map((p, idx) => ({
          ...p,
          orden: idx + 1,
        }));

        return {
          ...r,
          paradas: renumeradas,
          destinos: renumeradas.map((p) => p.direccion),
          zonas: renumeradas.map((p) => p.zona),
          ordenEntrega: renumeradas.map((p) => p.orden),
          estadoRuta: 'Ajuste Manual',
          modoCalculo: 'Manual Operativo',
        };
      })
    );
  };

  // UC-05 Camino Alternativo 1: Autorizar ajuste manual de zona fuera de cobertura
  const handleAutorizarZonaEspecial = (idRuta: string) => {
    setRutas((prev) =>
      prev.map((r) =>
        r.idRuta === idRuta
          ? {
              ...r,
              estadoRuta: 'Ajuste Manual',
              paradas: r.paradas.map((p) => ({ ...p, enCobertura: true })),
            }
          : r
      )
    );
  };

  // UC-06: Iniciar despacho y abrir vista de trazabilidad en vivo
  const handleIniciarDespacho = (idAsignacion: string, idRuta: string) => {
    const asg = asignaciones.find((a) => a.idAsignacion === idAsignacion);
    if (!asg) return;

    const idDespachoNuevo = `DSP-2026-${502 + despachos.length}`;
    const nuevoDespacho: Despacho = {
      idDespacho: idDespachoNuevo,
      idAsignacion,
      idRuta,
      fechaDespacho: '2026-11-10',
      estadoDespacho: 'En Ejecución',
      observaciones:
        'Despacho iniciado desde planificación de rutas con verificación de carga completa.',
      conexionGpsActiva: true,
      ultimaUbicacionConocida:
        'Salida CEDI Guayabal — Incorporación Corredor Regional del Río',
      progresoPorcentaje: 25,
    };

    const nuevoEvento: Trazabilidad = {
      idRegistro: `TRZ-${9004 + trazabilidad.length}`,
      idDespacho: idDespachoNuevo,
      fechaHora: '2026-11-10 09:05:00',
      ubicacion: 'CEDI Central Distribuidora Kiramar S.A.S. — Guayabal',
      estadoEntrega: 'En Tránsito Inicial',
      novedad: `Inicio formal de despacho ${idDespachoNuevo} bajo ruta ${idRuta}.`,
      autorRegistro: usuarioActual.nombre,
    };

    setDespachos((prev) => [nuevoDespacho, ...prev]);
    setTrazabilidad((prev) => [nuevoEvento, ...prev]);
    setAsignaciones((prev) =>
      prev.map((a) =>
        a.idAsignacion === idAsignacion
          ? { ...a, estadoAsignacion: 'En Despacho' }
          : a
      )
    );
    setPedidos((prev) =>
      prev.map((p) =>
        p.idPedido === asg.idPedido ? { ...p, estadoPedido: 'En Ruta' } : p
      )
    );
    setVehiculos((prev) =>
      prev.map((v) =>
        v.idVehiculo === asg.idVehiculo
          ? { ...v, estadoVehiculo: 'En Ruta' }
          : v
      )
    );
    setModuloActivo('trazabilidad');
  };

  // UC-06 Camino Alternativo 1: Alternar estado de telemetría GPS
  const handleToggleGpsDespacho = (idDespacho: string) => {
    setDespachos((prev) =>
      prev.map((d) =>
        d.idDespacho === idDespacho
          ? { ...d, conexionGpsActiva: !d.conexionGpsActiva }
          : d
      )
    );
  };

  // UC-06 Paso 23 y 24: Registrar evento en historial de trazabilidad
  const handleRegistrarEventoTrazabilidad = (
    idDespacho: string,
    ubicacion: string,
    estadoEntrega: string,
    novedad: string,
    nuevoProgreso?: number
  ) => {
    const ahora = new Date();
    const horaStr = ahora.toTimeString().split(' ')[0];
    const nuevoReg: Trazabilidad = {
      idRegistro: `TRZ-${9004 + trazabilidad.length}`,
      idDespacho,
      fechaHora: `2026-11-10 ${horaStr}`,
      ubicacion,
      estadoEntrega,
      novedad,
      autorRegistro: usuarioActual.nombre,
    };

    setTrazabilidad((prev) => [nuevoReg, ...prev]);
    setDespachos((prev) =>
      prev.map((d) =>
        d.idDespacho === idDespacho
          ? {
              ...d,
              ultimaUbicacionConocida: ubicacion,
              progresoPorcentaje:
                typeof nuevoProgreso === 'number'
                  ? nuevoProgreso
                  : d.progresoPorcentaje,
            }
          : d
      )
    );
  };

  // UC-06 Camino Alternativo 2 / Poscondición: Completar, Reprogramar o Devolver
  const handleFinalizarOExcepcionDespacho = (
    idDespacho: string,
    resultado: 'Completado' | 'Devolución' | 'Reprogramado',
    motivo: string
  ) => {
    const dsp = despachos.find((d) => d.idDespacho === idDespacho);
    if (!dsp) return;
    const asg = asignaciones.find((a) => a.idAsignacion === dsp.idAsignacion);

    const ahora = new Date();
    const horaStr = ahora.toTimeString().split(' ')[0];

    const eventoCierre: Trazabilidad = {
      idRegistro: `TRZ-${9004 + trazabilidad.length}`,
      idDespacho,
      fechaHora: `2026-11-10 ${horaStr}`,
      ubicacion: dsp.ultimaUbicacionConocida,
      estadoEntrega: resultado,
      novedad: motivo,
      autorRegistro: usuarioActual.nombre,
    };

    setTrazabilidad((prev) => [eventoCierre, ...prev]);
    setDespachos((prev) =>
      prev.map((d) =>
        d.idDespacho === idDespacho
          ? {
              ...d,
              estadoDespacho: resultado,
              progresoPorcentaje:
                resultado === 'Completado' ? 100 : d.progresoPorcentaje,
              observaciones: motivo,
            }
          : d
      )
    );

    if (asg) {
      setPedidos((prev) =>
        prev.map((p) =>
          p.idPedido === asg.idPedido ? { ...p, estadoPedido: resultado } : p
        )
      );
      setVehiculos((prev) =>
        prev.map((v) =>
          v.idVehiculo === asg.idVehiculo
            ? { ...v, estadoVehiculo: 'Disponible' }
            : v
        )
      );
    }
  };

  // RNF-06: Crear copia de respaldo
  const handleCrearBackup = (descripcion: string) => {
    const ahora = new Date();
    const horaStr = ahora.toTimeString().split(' ')[0];
    const nuevoBackup: BackupSnapshot = {
      idSnapshot: `BKP-20261110-${backups.length + 1}`,
      fechaHora: `2026-11-10 ${horaStr}`,
      autor: usuarioActual.nombre,
      descripcion,
      totalPedidos: pedidos.length,
      totalDespachos: despachos.length,
      totalEventosTrazabilidad: trazabilidad.length,
      payloadJson: JSON.stringify({
        pedidos: pedidos.length,
        despachos: despachos.length,
      }),
    };
    setBackups((prev) => [nuevoBackup, ...prev]);
  };

  // RNF-06: Restaurar datos semilla
  const handleRestaurarDatosSemilla = () => {
    setPedidos(PEDIDOS_INICIALES);
    setVehiculos(VEHICULOS_INICIALES);
    setAsignaciones(ASIGNACIONES_INICIALES);
    setRutas(RUTAS_INICIALES);
    setDespachos(DESPACHOS_INICIALES);
    setTrazabilidad(TRAZABILIDAD_INICIAL);
    setPedidoSeleccionadoId(PEDIDOS_INICIALES[0].idPedido);
    setAsignacionSeleccionadaId(ASIGNACIONES_INICIALES[0].idAsignacion);
    setWmsConectado(true);
  };

  const sidebarCounts = {
    pedidosPendientes: pedidos.filter((p) =>
      ['Pendiente', 'Validado'].includes(p.estadoPedido)
    ).length,
    alertasCarga: pedidos.filter((p) =>
      ['Requiere Datos Maestros', 'Excede Límites'].includes(p.estadoPedido)
    ).length,
    vehiculosLibres: vehiculos.filter((v) => v.estadoVehiculo === 'Disponible')
      .length,
    rutasActivas: rutas.length,
    despachosEnCurso: despachos.filter(
      (d) => d.estadoDespacho === 'En Ejecución'
    ).length,
    clientesTotal: CLIENTES_CRM_INICIALES.length,
  };

  return (
    <div className="min-h-screen flex crm-ambient-bg text-[var(--ink)]">
      {/* Barra Lateral Izquierda Fija (CRM Sidebar) */}
      <CrmSidebar
        moduloActivo={moduloActivo}
        setModuloActivo={setModuloActivo}
        usuarioActual={usuarioActual}
        usuarios={usuarios}
        onCambiarUsuario={setUsuarioActual}
        wmsConectado={wmsConectado}
        onToggleWms={() => setWmsConectado((prev) => !prev)}
        counts={sidebarCounts}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Área Principal del CRM */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopCommandBar
          moduloActivo={moduloActivo}
          setModuloActivo={setModuloActivo}
          pedidos={pedidos}
          pedidoSeleccionadoId={pedidoSeleccionadoId}
          onSeleccionarPedido={setPedidoSeleccionadoId}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        <main
          id="top"
          className="flex-1 p-4 sm:p-6 max-w-[1440px] w-full mx-auto"
        >
          {moduloActivo === 'resumen' && (
            <WorkflowBanner
              pedidos={pedidos}
              vehiculos={vehiculos}
              asignaciones={asignaciones}
              despachos={despachos}
              trazabilidad={trazabilidad}
              onAbrirPedidoEnModulo={(idPed, mod) => {
                setPedidoSeleccionadoId(idPed);
                setModuloActivo(mod);
              }}
              onIrModulo={setModuloActivo}
            />
          )}

          {(moduloActivo === 'pedidos' || moduloActivo === 'cubicaje') && (
            <PedidosModule
              vistaSubmodulo={moduloActivo}
              pedidos={pedidos}
              clientes={CLIENTES_CRM_INICIALES}
              pedidoSeleccionadoId={pedidoSeleccionadoId}
              onSeleccionarPedido={setPedidoSeleccionadoId}
              onCompletarDatosMaestros={handleCompletarDatosMaestros}
              onDividirPedidoExcedido={handleDividirPedidoExcedido}
              onIrCubicaje={(idPed) => {
                setPedidoSeleccionadoId(idPed);
                setModuloActivo('cubicaje');
              }}
              onValidarPedidoParaFlota={(idPed) => {
                setPedidoSeleccionadoId(idPed);
                setModuloActivo('flota');
              }}
              onCrearNuevoPedido={(nuevo) => {
                setPedidos((prev) => [nuevo, ...prev]);
                setPedidoSeleccionadoId(nuevo.idPedido);
              }}
              wmsConectado={wmsConectado}
              onReintentarConexion={() => setWmsConectado(true)}
            />
          )}

          {moduloActivo === 'flota' && (
            <FlotaAsignacionModule
              pedidos={pedidos}
              pedidoSeleccionadoId={pedidoSeleccionadoId}
              onSeleccionarPedido={setPedidoSeleccionadoId}
              vehiculos={vehiculos}
              asignaciones={asignaciones}
              usuarioActual={usuarioActual}
              onRegistrarAsignacion={handleRegistrarAsignacion}
              onCancelarAsignacion={handleCancelarAsignacion}
              onIrPlanificarRuta={(idAsg) => {
                setAsignacionSeleccionadaId(idAsg);
                setModuloActivo('rutas');
              }}
            />
          )}

          {(moduloActivo === 'rutas' || moduloActivo === 'trazabilidad') && (
            <RutasDespachosModule
              vistaSubmodulo={moduloActivo}
              asignaciones={asignaciones}
              pedidos={pedidos}
              vehiculos={vehiculos}
              rutas={rutas}
              despachos={despachos}
              trazabilidad={trazabilidad}
              usuarioActual={usuarioActual}
              asignacionSeleccionadaId={asignacionSeleccionadaId}
              onSeleccionarAsignacion={setAsignacionSeleccionadaId}
              onGenerarRuta={handleGenerarRuta}
              onReordenarParada={handleReordenarParada}
              onAutorizarZonaEspecial={handleAutorizarZonaEspecial}
              onIniciarDespacho={handleIniciarDespacho}
              onToggleGpsDespacho={handleToggleGpsDespacho}
              onRegistrarEventoTrazabilidad={handleRegistrarEventoTrazabilidad}
              onFinalizarOExcepcionDespacho={handleFinalizarOExcepcionDespacho}
            />
          )}

          {moduloActivo === 'clientes' && (
            <ClientesCrmModule
              clientes={CLIENTES_CRM_INICIALES}
              pedidos={pedidos}
              onInspeccionarPedidoCliente={(idPed) => {
                setPedidoSeleccionadoId(idPed);
                setModuloActivo('pedidos');
              }}
            />
          )}

          {moduloActivo === 'seguridad' && (
            <AdminSeguridadModule
              usuarios={usuarios}
              usuarioActual={usuarioActual}
              pedidos={pedidos}
              vehiculos={vehiculos}
              asignaciones={asignaciones}
              rutas={rutas}
              despachos={despachos}
              trazabilidad={trazabilidad}
              backups={backups}
              onCrearBackup={handleCrearBackup}
              onRestaurarDatosSemilla={handleRestaurarDatosSemilla}
            />
          )}
        </main>

        {/* Pie de página compacto del CRM */}
        <footer className="closing px-6 py-3 bg-[var(--card)] border-t border-[var(--hairline)] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--muted)]">
          <span>
            <strong className="text-[var(--ink)]">Kira Logistic CRM v1.3</strong> — Distribuidora Kiramar S.A.S. (CEDI Guayabal, Medellín)
          </span>
          <span className="font-mono-tabular">
            PPI Tercer Semestre · Tecnológico de Antioquia · Camacho, Agudelo, Muriel
          </span>
        </footer>
      </div>
    </div>
  );
}

export default App;
