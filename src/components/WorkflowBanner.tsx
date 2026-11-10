import type React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { ModuloActivo } from './Navbar';

interface WorkflowBannerProps {
  metricas: {
    pedidosPendientes: number;
    pesoConsolidadoTotalKg: number;
    vehiculosDisponibles: number;
    asignacionesActivas: number;
    rutasPlanificadas: number;
    despachosEnEjecucion: number;
  };
  pedidoSeleccionadoId: string;
  moduloActivo: ModuloActivo;
  onIrModulo: (m: ModuloActivo) => void;
}

export const WorkflowBanner: React.FC<WorkflowBannerProps> = ({
  metricas,
  pedidoSeleccionadoId,
  moduloActivo,
  onIrModulo,
}) => {
  const etapas = [
    {
      nro: '01',
      uc: 'UC-01 / RF-01',
      titulo: 'Recepción de pedidos',
      metrica: `${metricas.pedidosPendientes} por gestionar`,
      modulo: 'pedidos' as ModuloActivo,
    },
    {
      nro: '02',
      uc: 'UC-02 / RF-02',
      titulo: 'Análisis de carga',
      metrica: `${metricas.pesoConsolidadoTotalKg.toLocaleString('es-CO')}\u00A0kg consolidados`,
      modulo: 'pedidos' as ModuloActivo,
    },
    {
      nro: '03',
      uc: 'UC-03 / RF-03',
      titulo: 'Capacidad vehicular',
      metrica: `${metricas.vehiculosDisponibles} unidades libres`,
      modulo: 'flota' as ModuloActivo,
    },
    {
      nro: '04',
      uc: 'UC-04 / RF-04',
      titulo: 'Asignación y reserva',
      metrica: `${metricas.asignacionesActivas} reservas activas`,
      modulo: 'flota' as ModuloActivo,
    },
    {
      nro: '05',
      uc: 'UC-05 / RF-05',
      titulo: 'Planificación de ruta',
      metrica: `${metricas.rutasPlanificadas} rutas generadas`,
      modulo: 'rutas' as ModuloActivo,
    },
    {
      nro: '06',
      uc: 'UC-06 / RF-06',
      titulo: 'Control y trazabilidad',
      metrica: `${metricas.despachosEnEjecucion} en tránsito`,
      modulo: 'rutas' as ModuloActivo,
    },
  ];

  return (
    <section
      aria-label="Flujo operativo del proceso de planificación y gestión de despachos"
      className="surface-card p-5 sm:p-6 mb-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4 pb-4 border-b border-[var(--hairline)]">
        <div>
          <span className="text-[12px] font-mono-tabular font-medium text-[var(--action)]">
            FO-TEP · PROCESO ORGANIZACIONAL INTEGRADO
          </span>
          <h1 className="text-[22px] sm:text-[26px] font-semibold tracking-tight text-[var(--ink)] m-0 mt-0.5">
            Centro de comando logístico y trazabilidad de despachos.{' '}
            <span className="text-[var(--muted)] font-normal">
              CEDI Guayabal — Valle de Aburrá.
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2 text-[13px] font-mono-tabular bg-[var(--g-main)] px-3 py-1.5 rounded-[6px] border border-[var(--hairline)]">
          <CheckCircle2 className="w-4 h-4 text-[var(--action)]" aria-hidden="true" />
          <span>Pedido foco activo:</span>
          <strong className="text-[var(--ink)]">{pedidoSeleccionadoId}</strong>
        </div>
      </div>

      {/* Cadena de 6 actividades del proceso (Sección 1.1 y 1.2 del documento PPI-3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {etapas.map((etapa, index) => {
          const esActivo = moduloActivo === etapa.modulo;
          return (
            <button
              key={etapa.nro}
              type="button"
              onClick={() => onIrModulo(etapa.modulo)}
              className={`card-interactive text-left p-3.5 rounded-[10px] border transition-all cursor-pointer flex flex-col justify-between ${
                esActivo
                  ? 'bg-[var(--g-main)] border-[var(--ink)]'
                  : 'bg-[var(--card)] border-[var(--hairline)]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[12px] font-mono-tabular font-semibold px-2 py-0.5 rounded bg-[var(--g-alt)] text-[var(--ink)]">
                  Paso {etapa.nro}
                </span>
                <span className="text-[11px] font-mono-tabular text-[var(--muted)]">
                  {etapa.uc}
                </span>
              </div>
              <div>
                <div className="font-medium text-[15px] text-[var(--ink)] leading-snug">
                  {etapa.titulo}
                </div>
                <div className="text-[13px] font-mono-tabular text-[var(--muted)] mt-1 flex items-center justify-between">
                  <span>{etapa.metrica}</span>
                  {index < etapas.length - 1 && (
                    <ArrowRight
                      className="w-3.5 h-3.5 text-[var(--muted)] shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
