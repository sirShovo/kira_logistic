import type React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Route,
  Truck,
} from 'lucide-react';
import type {
  Asignacion,
  Despacho,
  Pedido,
  Trazabilidad,
  Vehiculo,
} from '../types/domain';
import { calcularCaracteristicasCarga } from '../utils/logisticsEngine';
import type { ModuloActivo } from './Navbar';

interface CrmPipelineDashboardProps {
  pedidos: Pedido[];
  vehiculos: Vehiculo[];
  asignaciones: Asignacion[];
  despachos: Despacho[];
  trazabilidad: Trazabilidad[];
  onAbrirPedidoEnModulo: (idPedido: string, modulo: ModuloActivo) => void;
  onIrModulo: (modulo: ModuloActivo) => void;
}

export const WorkflowBanner: React.FC<CrmPipelineDashboardProps> = ({
  pedidos,
  vehiculos,
  asignaciones,
  despachos,
  trazabilidad,
  onAbrirPedidoEnModulo,
  onIrModulo,
}) => {
  const pesoTotalKg = Math.round(
    pedidos.reduce(
      (acc, p) => acc + calcularCaracteristicasCarga(p).pesoTotalKg,
      0
    )
  );
  const volTotalM3 = Number(
    pedidos
      .reduce(
        (acc, p) => acc + calcularCaracteristicasCarga(p).volumenTotalM3,
        0
      )
      .toFixed(1)
  );
  const vehiculosDisponibles = vehiculos.filter(
    (v) => v.estadoVehiculo === 'Disponible'
  ).length;
  const alertasCount = pedidos.filter((p) =>
    ['Requiere Datos Maestros', 'Excede Límites'].includes(p.estadoPedido)
  ).length;

  const columnasKanban: {
    id: string;
    numPaso: string;
    titulo: string;
    subtitulo: string;
    dotColor: string;
    filtro: (p: Pedido) => boolean;
    badgeStyle: { bg: string; text: string; border: string };
    accionLabel: string;
    moduloDestino: ModuloActivo;
  }[] = [
    {
      id: 'col-recepcion',
      numPaso: '01',
      titulo: 'Recepción WMS',
      subtitulo: 'UC-01 · Pendientes',
      dotColor: '#998da0',
      badgeStyle: {
        bg: 'rgba(153, 141, 160, 0.16)',
        text: '#453849',
        border: 'rgba(153, 141, 160, 0.4)',
      },
      filtro: (p) => p.estadoPedido === 'Pendiente',
      accionLabel: 'Revisar pedido',
      moduloDestino: 'pedidos',
    },
    {
      id: 'col-alertas',
      numPaso: '02',
      titulo: 'Excepción Carga',
      subtitulo: 'UC-02 · Alertas SKU',
      dotColor: '#63585e',
      badgeStyle: {
        bg: 'rgba(99, 88, 94, 0.14)',
        text: '#3a3136',
        border: 'rgba(99, 88, 94, 0.35)',
      },
      filtro: (p) =>
        ['Requiere Datos Maestros', 'Excede Límites'].includes(p.estadoPedido),
      accionLabel: 'Resolver cubicaje',
      moduloDestino: 'cubicaje',
    },
    {
      id: 'col-validados',
      numPaso: '03',
      titulo: 'Carga Validada',
      subtitulo: 'UC-03 · Listos para Flota',
      dotColor: '#24573e',
      badgeStyle: {
        bg: 'rgba(196, 231, 212, 0.42)',
        text: '#17422c',
        border: 'rgba(196, 231, 212, 0.9)',
      },
      filtro: (p) => p.estadoPedido === 'Validado',
      accionLabel: 'Reservar vehículo',
      moduloDestino: 'flota',
    },
    {
      id: 'col-asignados',
      numPaso: '04',
      titulo: 'Flota Reservada',
      subtitulo: 'UC-04/05 · Por Enrutar',
      dotColor: '#3c4773',
      badgeStyle: {
        bg: 'rgba(185, 192, 218, 0.36)',
        text: '#273152',
        border: 'rgba(185, 192, 218, 0.85)',
      },
      filtro: (p) => p.estadoPedido === 'Asignado',
      accionLabel: 'Planificar ruta',
      moduloDestino: 'rutas',
    },
    {
      id: 'col-despacho',
      numPaso: '05',
      titulo: 'En Tránsito / Cierre',
      subtitulo: 'UC-06 · Trazabilidad',
      dotColor: '#1e191d',
      badgeStyle: {
        bg: 'rgba(196, 218, 207, 0.45)',
        text: '#1e191d',
        border: 'rgba(196, 218, 207, 0.9)',
      },
      filtro: (p) =>
        ['En Ruta', 'Completado', 'Devolución', 'Reprogramado'].includes(
          p.estadoPedido
        ),
      accionLabel: 'Monitorear GPS',
      moduloDestino: 'trazabilidad',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ======================================================================
          SECCIÓN 1: ENCABEZADO EJECUTIVO DEL CRM
          ====================================================================== */}
      <section className="crm-card p-5 sm:p-6 relative overflow-hidden bg-white">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#c4e7d4] via-[#b9c0da] to-[#63585e]" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono-tabular font-bold bg-[#1e191d] text-white tracking-wider uppercase">
                FO-TEP · PIPELINE LOGÍSTICO
              </span>
              <span className="text-[12px] font-mono-tabular text-[var(--muted)]">
                CEDI Guayabal · Valle de Aburrá
              </span>
            </div>
            <h2 className="text-[20px] sm:text-[22px] font-bold text-[var(--ink)] tracking-tight m-0">
              Centro de Planificación y Control de Despachos
            </h2>
            <p className="text-[13px] text-[var(--ink-secondary)] max-w-[75ch] m-0">
              Consolidación en tiempo real del flujo operativo de pedidos: desde la recepción WMS, análisis volumétrico y asignación vehicular hasta la entrega física monitoreada vía telemetría satelital.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[rgba(196,231,212,0.35)] border border-[#c4e7d4] text-[12px] font-mono-tabular font-semibold text-[#17422c]">
              <span className="w-2 h-2 rounded-full bg-[#24573e] animate-pulse" />
              <span>WMS Kiramar Sincronizado</span>
            </div>
            <button
              type="button"
              onClick={() => onIrModulo('pedidos')}
              className="btn-primary !min-h-[34px] !text-[12px]"
            >
              Abrir bandeja completa
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================================
          SECCIÓN 2: 4 KPIS EJECUTIVOS (tasteskill cards con degradados de la paleta)
          ====================================================================== */}
      <section
        aria-label="Indicadores clave de rendimiento logístico"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* KPI 1: Pedidos en Pipeline */}
        <div
          onClick={() => onIrModulo('pedidos')}
          className="crm-card card-interactive p-4 relative overflow-hidden group bg-white"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#c4e7d4] to-[#c4dacf]" />
          
          <div className="flex items-center justify-between text-[11px] font-mono-tabular uppercase tracking-wider text-[var(--muted)] mb-2">
            <span>PEDIDOS EN PIPELINE (RF-01)</span>
            <div className="w-8 h-8 rounded-[8px] bg-[rgba(196,231,212,0.35)] flex items-center justify-center text-[#24573e]">
              <Package className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[32px] font-mono-tabular font-bold text-[var(--ink)] tracking-tight">
              {pedidos.length}
            </span>
            <span className="text-[11px] font-mono-tabular font-semibold px-2 py-0.5 rounded-full bg-[rgba(196,231,212,0.4)] text-[#1b4731] border border-[#c4e7d4]">
              {pedidos.filter((p) => p.estadoPedido === 'Validado').length} listos
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[var(--hairline)] flex items-center justify-between text-[12px] font-mono-tabular text-[var(--muted)]">
            <span>{pesoTotalKg.toLocaleString('es-CO')}&nbsp;kg carga</span>
            <span>{volTotalM3}&nbsp;m³</span>
          </div>
        </div>

        {/* KPI 2: Alertas de Cubicaje */}
        <div
          onClick={() => onIrModulo('cubicaje')}
          className="crm-card card-interactive p-4 relative overflow-hidden group bg-white"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#998da0] to-[#63585e]" />
          
          <div className="flex items-center justify-between text-[11px] font-mono-tabular uppercase tracking-wider text-[var(--muted)] mb-2">
            <span>ALERTAS FÍSICAS (RF-02)</span>
            <div className="w-8 h-8 rounded-[8px] bg-[rgba(153,141,160,0.22)] flex items-center justify-center text-[#4a404f]">
              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[32px] font-mono-tabular font-bold text-[var(--ink)] tracking-tight">
              {alertasCount}
            </span>
            <span
              className="text-[11px] font-mono-tabular font-semibold px-2 py-0.5 rounded-full border"
              style={{
                backgroundColor:
                  alertasCount > 0
                    ? 'rgba(153, 141, 160, 0.22)'
                    : 'rgba(196, 231, 212, 0.4)',
                color: alertasCount > 0 ? '#3d3439' : '#1b4731',
                borderColor: alertasCount > 0 ? '#998da0' : '#c4e7d4',
              }}
            >
              {alertasCount > 0 ? 'Excepción activa' : 'Sin alertas'}
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[var(--hairline)] text-[12px] text-[var(--muted)] truncate">
            Validación de SKU y límites corporativos
          </div>
        </div>

        {/* KPI 3: Disponibilidad Vehicular */}
        <div
          onClick={() => onIrModulo('flota')}
          className="crm-card card-interactive p-4 relative overflow-hidden group bg-white"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#b9c0da] to-[#998da0]" />
          
          <div className="flex items-center justify-between text-[11px] font-mono-tabular uppercase tracking-wider text-[var(--muted)] mb-2">
            <span>FLOTA EN CEDI (RF-03/04)</span>
            <div className="w-8 h-8 rounded-[8px] bg-[rgba(185,192,218,0.3)] flex items-center justify-center text-[#2d3757]">
              <Truck className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[32px] font-mono-tabular font-bold text-[var(--ink)] tracking-tight">
              {vehiculosDisponibles}{' '}
              <span className="text-[16px] font-normal text-[var(--muted)]">
                / {vehiculos.length}
              </span>
            </span>
            <span className="text-[11px] font-mono-tabular font-semibold px-2 py-0.5 rounded-full bg-[rgba(185,192,218,0.3)] text-[#2d3757] border border-[#b9c0da]">
              {asignaciones.filter((a) => a.estadoAsignacion !== 'Cancelada').length} reservas
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[var(--hairline)] text-[12px] text-[var(--muted)] truncate">
            Disponibles para cargue en CEDI Guayabal
          </div>
        </div>

        {/* KPI 4: Despachos en Ejecución */}
        <div
          onClick={() => onIrModulo('trazabilidad')}
          className="crm-card card-interactive p-4 relative overflow-hidden group bg-white"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#c4e7d4] via-[#b9c0da] to-[#63585e]" />
          
          <div className="flex items-center justify-between text-[11px] font-mono-tabular uppercase tracking-wider text-[var(--muted)] mb-2">
            <span>DESPACHOS ACTIVOS (RF-06)</span>
            <div className="w-8 h-8 rounded-[8px] bg-[rgba(196,218,207,0.35)] flex items-center justify-center text-[#1e191d]">
              <Activity className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <span className="text-[32px] font-mono-tabular font-bold text-[var(--ink)] tracking-tight">
              {despachos.length}
            </span>
            <span className="text-[11px] font-mono-tabular font-semibold px-2 py-0.5 rounded-full bg-[rgba(196,231,212,0.4)] text-[#1b4731] border border-[#c4e7d4]">
              GPS en línea
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[var(--hairline)] text-[12px] font-mono-tabular text-[var(--muted)] truncate">
            {trazabilidad.length} eventos registrados en bitácora
          </div>
        </div>
      </section>

      {/* ======================================================================
          SECCIÓN 3: TABLERO KANBAN CRM (5 BANDEJAS CLARAMENTE DIFERENCIADAS)
          ====================================================================== */}
      <section
        aria-label="Embudo Kanban de pedidos logísticos"
        className="space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <div className="text-[11px] font-mono-tabular font-semibold uppercase tracking-wider text-[var(--taupe-grey)]">
              FLUJO INTEGRADO FO-TEP · ETAPAS OPERATIVAS
            </div>
            <h3 className="text-[18px] font-bold text-[var(--ink)] m-0 tracking-tight">
              Pipeline de Despacho y Distribución por Fases
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-mono-tabular text-[var(--muted)] hidden sm:inline">
              Haga clic en cualquier tarjeta para abrir su consola especializada
            </span>
          </div>
        </div>

        {/* 5 Columnas Kanban con Bandejas Diferenciadas (crm-lane-tray) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {columnasKanban.map((col) => {
            const itemsCol = pedidos.filter(col.filtro);
            return (
              <div
                key={col.id}
                className="crm-lane-tray p-3 flex flex-col min-h-[440px]"
              >
                {/* Cabecera de la Bandeja */}
                <div className="flex items-start justify-between mb-3 pb-2.5 border-b border-[rgba(99,88,94,0.12)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shadow-xs"
                        style={{ backgroundColor: col.dotColor }}
                      />
                      <span className="font-bold text-[13px] text-[var(--ink)] tracking-tight">
                        {col.titulo}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono-tabular text-[var(--muted)] pl-4">
                      {col.subtitulo}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[11px] font-mono-tabular font-bold rounded-full bg-white text-[var(--ink)] shadow-xs border border-[rgba(99,88,94,0.15)]">
                    {itemsCol.length}
                  </span>
                </div>

                {/* Tarjetas de Pedido en la Columna */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {itemsCol.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-center text-[12px] text-[var(--muted)] border border-dashed border-[rgba(99,88,94,0.22)] rounded-[10px] p-4 bg-white/40">
                      <span>Sin pedidos en esta fase</span>
                    </div>
                  ) : (
                    itemsCol.map((ped) => {
                      const carga = calcularCaracteristicasCarga(ped);
                      const requiereAtencion = [
                        'Requiere Datos Maestros',
                        'Excede Límites',
                      ].includes(ped.estadoPedido);

                      return (
                        <div
                          key={ped.idPedido}
                          onClick={() =>
                            onAbrirPedidoEnModulo(ped.idPedido, col.moduloDestino)
                          }
                          className="crm-card card-interactive p-3.5 bg-white border border-[rgba(99,88,94,0.14)] hover:border-[var(--taupe-grey)] flex flex-col justify-between gap-3"
                        >
                          <div>
                            {/* Fila superior: ID y Estado */}
                            <div className="flex items-center justify-between gap-1 mb-2">
                              <span className="font-mono-tabular font-bold text-[12px] text-[var(--ink)] bg-[rgba(99,88,94,0.06)] px-1.5 py-0.5 rounded">
                                {ped.idPedido}
                              </span>
                              <span
                                className="text-[10px] font-mono-tabular font-semibold px-2 py-0.5 rounded-full border"
                                style={{
                                  backgroundColor: col.badgeStyle.bg,
                                  color: col.badgeStyle.text,
                                  borderColor: col.badgeStyle.border,
                                }}
                              >
                                {ped.estadoPedido}
                              </span>
                            </div>

                            {/* Nombre del Cliente */}
                            <div className="font-semibold text-[13px] text-[var(--ink)] leading-snug line-clamp-2">
                              {ped.nombreCliente}
                            </div>

                            {/* Ubicación / Zona */}
                            <div className="flex items-center gap-1 text-[11px] text-[var(--muted)] mt-1.5 truncate">
                              <MapPin className="w-3 h-3 shrink-0 text-[var(--muted)]" />
                              <span className="truncate">{ped.zonasEntrega[0]}</span>
                            </div>

                            {requiereAtencion && (
                              <div className="mt-2 p-1.5 rounded bg-[rgba(153,141,160,0.15)] border border-[rgba(153,141,160,0.4)] text-[11px] font-mono-tabular text-[#453849]">
                                {ped.estadoPedido === 'Requiere Datos Maestros'
                                  ? 'Completar dimensiones/peso SKU'
                                  : 'Excede 8.500 kg / 38 m³'}
                              </div>
                            )}
                          </div>

                          {/* Pie de la tarjeta: Peso, Volumen y Acción */}
                          <div className="pt-2.5 border-t border-[rgba(99,88,94,0.1)] flex items-center justify-between text-[11px] font-mono-tabular">
                            <span className="font-bold text-[var(--ink)]">
                              {carga.pesoTotalKg.toLocaleString('es-CO')}&nbsp;kg · {carga.volumenTotalM3}&nbsp;m³
                            </span>
                            <span className="text-[var(--taupe-grey)] font-semibold inline-flex items-center gap-0.5 group-hover:text-[var(--action-hover)]">
                              {col.accionLabel}
                              <ArrowUpRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================================
          SECCIÓN 4: VISTAS OPERATIVAS DIVIDIDAS (DESPACHOS EN RUTA Y EVENTOS GPS)
          ====================================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Panel 1: Despachos en Curso y Monitoreo (7 columnas) */}
        <div className="lg:col-span-7 crm-card p-5 bg-white">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-[var(--taupe-grey)]" />
              <h4 className="text-[14px] font-bold text-[var(--ink)] m-0">
                Despachos en Tránsito y Rutas Activas
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onIrModulo('trazabilidad')}
              className="text-[12px] font-semibold text-[var(--taupe-grey)] hover:underline cursor-pointer bg-transparent border-none"
            >
              Ver consola GPS completa →
            </button>
          </div>

          <div className="space-y-3">
            {despachos.map((dsp) => (
              <div
                key={dsp.idDespacho}
                onClick={() => onIrModulo('trazabilidad')}
                className="p-3.5 rounded-[10px] bg-[rgba(196,218,207,0.14)] border border-[rgba(99,88,94,0.12)] cursor-pointer hover:border-[var(--taupe-grey)] transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tabular font-bold text-[12px] px-2 py-0.5 rounded bg-[var(--taupe-grey)] text-white shadow-xs">
                      {dsp.idDespacho}
                    </span>
                    <span className="text-[12px] font-mono-tabular text-[var(--muted)]">
                      Ruta {dsp.idRuta} · Asig. {dsp.idAsignacion}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono-tabular font-bold text-[#17422c] bg-[rgba(196,231,212,0.5)] border border-[#c4e7d4] px-2 py-0.5 rounded-full">
                    {dsp.estadoDespacho} ({dsp.progresoPorcentaje}%)
                  </span>
                </div>

                {/* Barra de Progreso con Gradiente de la Paleta */}
                <div className="w-full h-2 rounded-full bg-[rgba(185,192,218,0.3)] overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${dsp.progresoPorcentaje}%`,
                      background: 'linear-gradient(90deg, #c4e7d4 0%, #b9c0da 50%, #998da0 100%)',
                    }}
                  />
                </div>

                <div className="text-[12px] text-[var(--ink)] flex items-center justify-between">
                  <span className="truncate">
                    Última posición: <strong>{dsp.ultimaUbicacionConocida}</strong>
                  </span>
                  <span className="font-mono-tabular text-[11px] text-[var(--muted)] shrink-0 ml-2">
                    {dsp.fechaDespacho}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Feed de Trazabilidad y Bitácora (5 columnas) */}
        <div className="lg:col-span-5 crm-card p-5 bg-white">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--taupe-grey)]" />
              <h4 className="text-[14px] font-bold text-[var(--ink)] m-0">
                Bitácora de Trazabilidad en Tiempo Real
              </h4>
            </div>
            <span className="text-[11px] font-mono-tabular text-[var(--muted)]">
              Auditoría en vivo
            </span>
          </div>

          <div className="space-y-3">
            {trazabilidad.slice(0, 4).map((ev) => (
              <div
                key={ev.idRegistro}
                className="flex items-start gap-3 pb-3 border-b border-[rgba(99,88,94,0.08)] last:border-none last:pb-0"
              >
                <div className="w-6 h-6 rounded-full bg-[rgba(196,231,212,0.45)] flex items-center justify-center shrink-0 mt-0.5 text-[#17422c]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-tabular font-bold text-[12px] text-[var(--ink)]">
                      {ev.estadoEntrega}
                    </span>
                    <span className="font-mono-tabular text-[11px] text-[var(--muted)]">
                      {ev.fechaHora.split(' ')[1]}
                    </span>
                  </div>
                  <div className="text-[12px] text-[var(--ink)] font-medium truncate mt-0.5">
                    {ev.ubicacion}
                  </div>
                  <div className="text-[11px] text-[var(--muted)] mt-0.5 line-clamp-1">
                    {ev.novedad}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
