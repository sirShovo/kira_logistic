import type React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
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
    titulo: string;
    subtitulo: string;
    colorDot: string;
    filtro: (p: Pedido) => boolean;
    accionLabel: string;
    moduloDestino: ModuloActivo;
  }[] = [
    {
      id: 'col-recepcion',
      titulo: '1. Recepción WMS',
      subtitulo: 'UC-01 · Pendientes',
      colorDot: '#68635c',
      filtro: (p) => p.estadoPedido === 'Pendiente',
      accionLabel: 'Revisar pedido',
      moduloDestino: 'pedidos',
    },
    {
      id: 'col-alertas',
      titulo: '2. Excepción Carga',
      subtitulo: 'UC-02 · Alertas Físicas',
      colorDot: '#b84a27',
      filtro: (p) =>
        ['Requiere Datos Maestros', 'Excede Límites'].includes(p.estadoPedido),
      accionLabel: 'Resolver en Cubicaje',
      moduloDestino: 'cubicaje',
    },
    {
      id: 'col-validados',
      titulo: '3. Carga Validada',
      subtitulo: 'UC-03 · Listos para Flota',
      colorDot: '#165934',
      filtro: (p) => p.estadoPedido === 'Validado',
      accionLabel: 'Reservar vehículo',
      moduloDestino: 'flota',
    },
    {
      id: 'col-asignados',
      titulo: '4. Transporte Reservado',
      subtitulo: 'UC-04/05 · Por Enrutar',
      colorDot: '#1a4b6e',
      filtro: (p) => p.estadoPedido === 'Asignado',
      accionLabel: 'Planificar ruta',
      moduloDestino: 'rutas',
    },
    {
      id: 'col-despacho',
      titulo: '5. En Tránsito / Cierre',
      subtitulo: 'UC-06 · Trazabilidad',
      colorDot: '#181715',
      filtro: (p) =>
        ['En Ruta', 'Completado', 'Devolución', 'Reprogramado'].includes(
          p.estadoPedido
        ),
      accionLabel: 'Monitorear GPS',
      moduloDestino: 'trazabilidad',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Fila 1: 4 Tarjetas KPI Ejecutivas del CRM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onIrModulo('pedidos')}
          className="crm-card card-interactive p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between text-[12px] text-[var(--muted)] font-medium mb-2">
            <span>PEDIDOS EN PIPELINE (RF-01)</span>
            <Package className="w-4 h-4 text-[var(--ink)]" aria-hidden="true" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[26px] font-mono-tabular font-semibold text-[var(--ink)]">
              {pedidos.length}
            </span>
            <span className="text-[12px] font-mono-tabular text-[var(--state-ok-ink)] bg-[var(--state-ok-bg)] px-2 py-0.5 rounded">
              WMS Sincronizado
            </span>
          </div>
          <div className="text-[12px] text-[var(--muted)] mt-2 pt-2 border-t border-[var(--hairline)] font-mono-tabular">
            Carga acumulada: {pesoTotalKg.toLocaleString('es-CO')}&nbsp;kg ·{' '}
            {volTotalM3}&nbsp;m³
          </div>
        </div>

        <div
          onClick={() => onIrModulo('cubicaje')}
          className="crm-card card-interactive p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between text-[12px] text-[var(--muted)] font-medium mb-2">
            <span>ALERTAS VOLUMÉTRICAS (RF-02)</span>
            <AlertTriangle
              className="w-4 h-4 text-[var(--action)]"
              aria-hidden="true"
            />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[26px] font-mono-tabular font-semibold text-[var(--ink)]">
              {alertasCount}
            </span>
            <span
              className="text-[12px] font-mono-tabular px-2 py-0.5 rounded"
              style={{
                backgroundColor:
                  alertasCount > 0
                    ? 'var(--state-warn-bg)'
                    : 'var(--state-ok-bg)',
                color:
                  alertasCount > 0
                    ? 'var(--state-warn-ink)'
                    : 'var(--state-ok-ink)',
              }}
            >
              {alertasCount > 0 ? 'Requiere acción' : 'Sin bloqueos'}
            </span>
          </div>
          <div className="text-[12px] text-[var(--muted)] mt-2 pt-2 border-t border-[var(--hairline)]">
            Validación de datos maestros y límites Kiramar
          </div>
        </div>

        <div
          onClick={() => onIrModulo('flota')}
          className="crm-card card-interactive p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between text-[12px] text-[var(--muted)] font-medium mb-2">
            <span>DISPONIBILIDAD DE FLOTA (RF-03)</span>
            <Truck className="w-4 h-4 text-[var(--ink)]" aria-hidden="true" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[26px] font-mono-tabular font-semibold text-[var(--ink)]">
              {vehiculosDisponibles}{' '}
              <span className="text-[15px] text-[var(--muted)] font-normal">
                / {vehiculos.length}
              </span>
            </span>
            <span className="text-[12px] font-mono-tabular text-[var(--state-info-ink)] bg-[var(--state-info-bg)] px-2 py-0.5 rounded">
              {asignaciones.filter((a) => a.estadoAsignacion !== 'Cancelada').length}{' '}
              reservas
            </span>
          </div>
          <div className="text-[12px] text-[var(--muted)] mt-2 pt-2 border-t border-[var(--hairline)]">
            Unidades en CEDI Guayabal listas para cargue
          </div>
        </div>

        <div
          onClick={() => onIrModulo('trazabilidad')}
          className="crm-card card-interactive p-4 cursor-pointer"
        >
          <div className="flex items-center justify-between text-[12px] text-[var(--muted)] font-medium mb-2">
            <span>DESPACHOS EN TRÁNSITO (RF-06)</span>
            <Activity
              className="w-4 h-4 text-[var(--state-ok-ink)]"
              aria-hidden="true"
            />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[26px] font-mono-tabular font-semibold text-[var(--ink)]">
              {despachos.length}
            </span>
            <span className="text-[12px] font-mono-tabular text-[var(--state-ok-ink)] bg-[var(--state-ok-bg)] px-2 py-0.5 rounded">
              GPS En Línea
            </span>
          </div>
          <div className="text-[12px] text-[var(--muted)] mt-2 pt-2 border-t border-[var(--hairline)] font-mono-tabular">
            {trazabilidad.length} eventos registrados en bitácora
          </div>
        </div>
      </div>

      {/* Fila 2: Tablero Kanban del Embudo Logístico (Pipeline de 5 Etapas) */}
      <section aria-label="Embudo Kanban de pedidos logísticos" className="crm-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-[var(--hairline)]">
          <div>
            <h2 className="text-[15px] font-semibold text-[var(--ink)] m-0">
              Pipeline Operativo de Pedidos y Despachos (Vista Kanban CRM)
            </h2>
            <p className="text-[12px] text-[var(--muted)] m-0 mt-0.5">
              Haga clic en cualquier tarjeta para abrir su consola operativa correspondiente (Cubicaje, Flota, Rutas o Trazabilidad).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onIrModulo('pedidos')}
              className="btn-secondary !min-h-[32px] !text-[12px]"
            >
              Abrir vista tabular
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {columnasKanban.map((col) => {
            const itemsCol = pedidos.filter(col.filtro);
            return (
              <div
                key={col.id}
                className="crm-panel p-3 flex flex-col min-h-[340px]"
              >
                {/* Cabecera de Columna Kanban */}
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[var(--hairline)]">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: col.colorDot }}
                      />
                      <span className="font-semibold text-[12px] text-[var(--ink)]">
                        {col.titulo}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono-tabular text-[var(--muted)] pl-3.5">
                      {col.subtitulo}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[11px] font-mono-tabular font-semibold rounded bg-[var(--card)] border border-[var(--hairline)] text-[var(--ink)]">
                    {itemsCol.length}
                  </span>
                </div>

                {/* Tarjetas de la columna */}
                <div className="space-y-2.5 flex-1">
                  {itemsCol.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-center text-[12px] text-[var(--muted)] border border-dashed border-[var(--hairline-strong)] rounded-[8px] p-3">
                      Sin pedidos en esta etapa
                    </div>
                  ) : (
                    itemsCol.map((ped) => {
                      const carga = calcularCaracteristicasCarga(ped);
                      return (
                        <div
                          key={ped.idPedido}
                          onClick={() =>
                            onAbrirPedidoEnModulo(ped.idPedido, col.moduloDestino)
                          }
                          className="crm-card card-interactive p-3 cursor-pointer flex flex-col justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-mono-tabular font-semibold text-[12px] text-[var(--ink)]">
                                {ped.idPedido}
                              </span>
                              <span
                                className="text-[10px] font-mono-tabular px-1.5 py-0.5 rounded font-medium"
                                style={{
                                  backgroundColor:
                                    ped.estadoPedido === 'Requiere Datos Maestros'
                                      ? 'var(--state-warn-bg)'
                                      : ped.estadoPedido === 'Excede Límites'
                                      ? 'var(--state-err-bg)'
                                      : 'var(--g-alt)',
                                  color:
                                    ped.estadoPedido === 'Requiere Datos Maestros'
                                      ? 'var(--state-warn-ink)'
                                      : ped.estadoPedido === 'Excede Límites'
                                      ? 'var(--state-err-ink)'
                                      : 'var(--c-text)',
                                }}
                              >
                                {ped.estadoPedido}
                              </span>
                            </div>

                            <div className="font-medium text-[13px] text-[var(--ink)] leading-snug line-clamp-2">
                              {ped.nombreCliente}
                            </div>

                            <div className="text-[11px] text-[var(--muted)] mt-1 truncate">
                              {ped.zonasEntrega[0]}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[var(--hairline)] flex items-center justify-between text-[11px] font-mono-tabular">
                            <span className="font-semibold text-[var(--ink)]">
                              {carga.pesoTotalKg.toLocaleString('es-CO')}&nbsp;kg ·{' '}
                              {carga.volumenTotalM3}&nbsp;m³
                            </span>
                            <span className="text-[var(--action)] font-medium inline-flex items-center gap-0.5">
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

      {/* Fila 3: Vista dividida — Despachos en Tránsito vs Bitácora Reciente de Eventos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Panel Izquierdo (7 cols): Monitoreo rápido de unidades en ruta */}
        <div className="lg:col-span-7 crm-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-[var(--action)]" />
              <h3 className="text-[14px] font-semibold text-[var(--ink)] m-0">
                Despachos en Ejecución y Unidades Asignadas
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onIrModulo('trazabilidad')}
              className="text-[12px] font-medium text-[var(--action)] hover:underline cursor-pointer bg-transparent border-none"
            >
              Ir a consola GPS →
            </button>
          </div>

          <div className="space-y-3">
            {despachos.map((dsp) => (
              <div
                key={dsp.idDespacho}
                onClick={() => onIrModulo('trazabilidad')}
                className="crm-panel p-3.5 cursor-pointer hover:border-[var(--ink)] transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tabular font-semibold text-[13px] px-2 py-0.5 rounded bg-[var(--ink)] text-white">
                      {dsp.idDespacho}
                    </span>
                    <span className="text-[12px] font-mono-tabular text-[var(--muted)]">
                      Ruta {dsp.idRuta} · Asig. {dsp.idAsignacion}
                    </span>
                  </div>
                  <span className="text-[12px] font-mono-tabular font-semibold text-[var(--state-ok-ink)] bg-[var(--state-ok-bg)] px-2 py-0.5 rounded">
                    {dsp.estadoDespacho} ({dsp.progresoPorcentaje}%)
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-[var(--g-alt)] overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${dsp.progresoPorcentaje}%`,
                      backgroundColor: 'var(--action)',
                    }}
                  />
                </div>

                <div className="text-[12px] text-[var(--c-text)] flex items-center justify-between">
                  <span className="truncate">
                    Posición actual: <strong>{dsp.ultimaUbicacionConocida}</strong>
                  </span>
                  <span className="font-mono-tabular text-[11px] text-[var(--muted)] shrink-0 ml-2">
                    {dsp.fechaDespacho}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel Derecho (5 cols): Feed cronológico de trazabilidad */}
        <div className="lg:col-span-5 crm-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[var(--hairline)]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--ink)]" />
              <h3 className="text-[14px] font-semibold text-[var(--ink)] m-0">
                Últimos Eventos Registrados (Trazabilidad)
              </h3>
            </div>
            <span className="text-[11px] font-mono-tabular text-[var(--muted)]">
              Tiempo real
            </span>
          </div>

          <div className="space-y-3">
            {trazabilidad.slice(0, 4).map((ev) => (
              <div
                key={ev.idRegistro}
                className="flex items-start gap-2.5 pb-2.5 border-b border-[var(--hairline)] last:border-none last:pb-0"
              >
                <CheckCircle2 className="w-4 h-4 text-[var(--state-ok-ink)] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-tabular font-semibold text-[12px] text-[var(--ink)]">
                      {ev.estadoEntrega}
                    </span>
                    <span className="font-mono-tabular text-[11px] text-[var(--muted)]">
                      {ev.fechaHora.split(' ')[1]}
                    </span>
                  </div>
                  <div className="text-[12px] text-[var(--c-text)] truncate">
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
      </div>
    </div>
  );
};
