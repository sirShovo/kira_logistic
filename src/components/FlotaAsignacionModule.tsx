import type React from 'react';
import { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Lock,
  RotateCcw,
  Route,
  ShieldAlert,
} from 'lucide-react';
import type {
  Asignacion,
  Pedido,
  Usuario,
  Vehiculo,
} from '../types/domain';
import {
  calcularCaracteristicasCarga,
  consultarVehiculosDisponiblesPorFecha,
  filtrarVehiculosPorCapacidad,
} from '../utils/logisticsEngine';

interface FlotaAsignacionModuleProps {
  pedidos: Pedido[];
  pedidoSeleccionadoId: string;
  onSeleccionarPedido: (id: string) => void;
  vehiculos: Vehiculo[];
  asignaciones: Asignacion[];
  usuarioActual: Usuario;
  onRegistrarAsignacion: (
    idPedido: string,
    idVehiculo: string,
    fecha: string
  ) => void;
  onCancelarAsignacion: (idAsignacion: string) => void;
  onIrPlanificarRuta: (idAsignacion: string) => void;
}

export const FlotaAsignacionModule: React.FC<FlotaAsignacionModuleProps> = ({
  pedidos,
  pedidoSeleccionadoId,
  onSeleccionarPedido,
  vehiculos,
  asignaciones,
  usuarioActual,
  onRegistrarAsignacion,
  onCancelarAsignacion,
  onIrPlanificarRuta,
}) => {
  const [fechaConsulta, setFechaConsulta] = useState<string>('2026-11-10');
  const [soloCandidatosIdoneos, setSoloCandidatosIdoneos] =
    useState<boolean>(true);
  const [vehiculoCandidatoId, setVehiculoCandidatoId] =
    useState<string>('VEH-02');
  const [simularConcurrencia, setSimularConcurrencia] =
    useState<boolean>(false);
  const [alertaConcurrencia, setAlertaConcurrencia] = useState<string | null>(
    null
  );
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState<string | null>(
    null
  );

  const pedidoActivo =
    pedidos.find((p) => p.idPedido === pedidoSeleccionadoId) || pedidos[0];
  const carga = calcularCaracteristicasCarga(pedidoActivo);

  const disponiblesEnFecha = consultarVehiculosDisponiblesPorFecha(
    vehiculos,
    fechaConsulta
  );
  const candidatosCompatibles = filtrarVehiculosPorCapacidad(
    disponiblesEnFecha,
    carga
  );

  const listaMostrada = soloCandidatosIdoneos
    ? candidatosCompatibles
    : vehiculos;

  const handleConfirmarAsignacion = (idVehiculo: string) => {
    setAlertaConcurrencia(null);
    setMensajeConfirmacion(null);

    const veh = vehiculos.find((v) => v.idVehiculo === idVehiculo);
    if (!veh) return;

    if (simularConcurrencia || veh.estadoVehiculo !== 'Disponible') {
      setAlertaConcurrencia(
        `UC-04 Camino Alternativo 1 (Error de concurrencia): El vehículo ${veh.placa} (${veh.tipo}) fue reservado por otro operador de logística hace unos segundos. Seleccione otra unidad disponible.`
      );
      return;
    }

    onRegistrarAsignacion(pedidoActivo.idPedido, idVehiculo, fechaConsulta);
    setMensajeConfirmacion(
      `Reserva formal registrada: Vehículo ${veh.placa} asignado al pedido ${pedidoActivo.idPedido} por ${usuarioActual.nombre}.`
    );
  };

  return (
    <div className="space-y-4">
      {/* Barra de Control y Filtros de Disponibilidad Vehicular (UC-03) */}
      <div className="crm-card p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-4">
          <label
            htmlFor="select-pedido-flota"
            className="block text-[11px] font-mono-tabular uppercase text-[var(--muted)] mb-1"
          >
            Pedido a Asignar (Precondición UC-02)
          </label>
          <select
            id="select-pedido-flota"
            value={pedidoActivo.idPedido}
            onChange={(e) => {
              onSeleccionarPedido(e.target.value);
              setAlertaConcurrencia(null);
              setMensajeConfirmacion(null);
            }}
            className="field-input font-mono-tabular font-medium"
          >
            {pedidos.map((p) => {
              const c = calcularCaracteristicasCarga(p);
              return (
                <option key={p.idPedido} value={p.idPedido}>
                  {p.idPedido} — {c.pesoTotalKg} kg / {c.volumenTotalM3} m³ [
                  {p.estadoPedido}]
                </option>
              );
            })}
          </select>
        </div>

        <div className="md:col-span-3">
          <label
            htmlFor="fecha-despacho-uc03"
            className="block text-[11px] font-mono-tabular uppercase text-[var(--muted)] mb-1"
          >
            Fecha Despacho (Paso 9 UC-03)
          </label>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[var(--muted)] shrink-0" />
            <input
              id="fecha-despacho-uc03"
              type="date"
              value={fechaConsulta}
              onChange={(e) => setFechaConsulta(e.target.value)}
              className="field-input font-mono-tabular"
            />
            <button
              type="button"
              onClick={() => setFechaConsulta('2026-11-12')}
              title="Probar fecha sin disponibilidad (UC-03 Alt. 1)"
              className="btn-secondary !px-2 !text-[11px]"
            >
              Llena
            </button>
          </div>
        </div>

        <div className="md:col-span-3">
          <span className="block text-[11px] font-mono-tabular uppercase text-[var(--muted)] mb-1">
            Filtro Físico (Paso 11 UC-03)
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setSoloCandidatosIdoneos(true)}
              className={`flex-1 h-[38px] px-2.5 rounded-[6px] text-[12px] font-medium cursor-pointer border ${
                soloCandidatosIdoneos
                  ? 'bg-[var(--ink)] text-white border-[var(--ink)]'
                  : 'bg-[var(--g-main)] text-[var(--c-text)] border-[var(--hairline)]'
              }`}
            >
              Idóneos ({candidatosCompatibles.length})
            </button>
            <button
              type="button"
              onClick={() => setSoloCandidatosIdoneos(false)}
              className={`flex-1 h-[38px] px-2.5 rounded-[6px] text-[12px] font-medium cursor-pointer border ${
                !soloCandidatosIdoneos
                  ? 'bg-[var(--ink)] text-white border-[var(--ink)]'
                  : 'bg-[var(--g-main)] text-[var(--c-text)] border-[var(--hairline)]'
              }`}
            >
              Todos ({vehiculos.length})
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <span className="block text-[11px] font-mono-tabular uppercase text-[var(--muted)] mb-1">
            Concurrencia (UC-04)
          </span>
          <label className="flex items-center gap-2 h-[38px] px-2.5 rounded-[6px] bg-[var(--g-main)] border border-[var(--hairline-strong)] cursor-pointer text-[12px]">
            <input
              type="checkbox"
              checked={simularConcurrencia}
              onChange={(e) => {
                setSimularConcurrencia(e.target.checked);
                setAlertaConcurrencia(null);
              }}
              className="w-3.5 h-3.5 accent-[var(--action)]"
            />
            <span className="truncate">Colisión (Alt. 1)</span>
          </label>
        </div>
      </div>

      {/* Mensajes de estado y caminos alternativos */}
      {alertaConcurrencia && (
        <div className="crm-card p-3.5 bg-[var(--state-err-bg)] border border-[var(--state-err-ink)] flex items-center gap-2.5 text-[13px] font-medium text-[var(--ink)]">
          <ShieldAlert className="w-4 h-4 text-[var(--state-err-ink)] shrink-0" />
          <span>{alertaConcurrencia}</span>
        </div>
      )}

      {mensajeConfirmacion && (
        <div className="crm-card p-3.5 bg-[var(--state-ok-bg)] border border-[var(--state-ok-ink)] flex items-center gap-2.5 text-[13px] font-medium text-[var(--state-ok-ink)]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{mensajeConfirmacion}</span>
        </div>
      )}

      {disponiblesEnFecha.length === 0 && (
        <div className="crm-card p-4 bg-[var(--state-warn-bg)] border border-[var(--state-warn-ink)] flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono-tabular font-semibold text-[var(--state-warn-ink)]">
              UC-03 · CAMINO ALTERNATIVO 1 · SIN FLOTA DISPONIBLE EN FECHA {fechaConsulta}
            </span>
            <p className="text-[13px] text-[var(--ink)] m-0 mt-0.5">
              Toda la flota está ocupada en la fecha solicitada. El sistema sugiere fechas alternativas con unidades disponibles:
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFechaConsulta('2026-11-10')}
              className="btn-primary"
            >
              Usar 2026-11-10 (4 libres)
            </button>
            <button
              type="button"
              onClick={() => setFechaConsulta('2026-11-11')}
              className="btn-secondary"
            >
              Usar 2026-11-11 (4 libres)
            </button>
          </div>
        </div>
      )}

      {disponiblesEnFecha.length > 0 && candidatosCompatibles.length === 0 && (
        <div className="crm-card p-4 bg-[var(--state-err-bg)] border border-[var(--state-err-ink)] flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-[var(--state-err-ink)] shrink-0 mt-0.5" />
          <div>
            <span className="text-[11px] font-mono-tabular font-semibold text-[var(--state-err-ink)]">
              UC-03 · CAMINO ALTERNATIVO 2 · NINGÚN VEHÍCULO CUMPLE CAPACIDAD REQUERIDA
            </span>
            <p className="text-[13px] text-[var(--ink)] m-0 mt-0.5">
              El pedido requiere {carga.pesoTotalKg.toLocaleString('es-CO')}&nbsp;kg / {carga.volumenTotalM3}&nbsp;m³. El sistema recomienda dividir el pedido en Cubicaje (UC-02) o emplear múltiples vehículos.
            </p>
          </div>
        </div>
      )}

      {/* Layout Dividido: Izquierda (Tarjetas de Flota Vehicular) + Derecha (Reservas Registradas ASIGNACION) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {listaMostrada.map((veh) => {
            const pctPeso = Math.min(
              150,
              Math.round((carga.pesoTotalKg / veh.capacidadKg) * 100)
            );
            const pctVol = Math.min(
              150,
              Math.round((carga.volumenTotalM3 / veh.volumenM3) * 100)
            );
            const cumpleCapacidad =
              veh.capacidadKg >= carga.pesoTotalKg &&
              veh.volumenM3 >= carga.volumenTotalM3 &&
              veh.largoInterior >= carga.dimMaxLargo &&
              veh.anchoInterior >= carga.dimMaxAncho &&
              veh.altoInterior >= carga.dimMaxAlto;
            const disponibleHoy =
              veh.estadoVehiculo === 'Disponible' &&
              !veh.fechasOcupadas.includes(fechaConsulta);
            const esSeleccionado = vehiculoCandidatoId === veh.idVehiculo;

            return (
              <div
                key={veh.idVehiculo}
                onClick={() => setVehiculoCandidatoId(veh.idVehiculo)}
                className={`crm-card card-interactive p-4 cursor-pointer flex flex-col justify-between ${
                  esSeleccionado ? 'border-[var(--ink)]' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-tabular font-bold text-[13px] px-2 py-0.5 rounded bg-[var(--ink)] text-white">
                        {veh.placa}
                      </span>
                      <span className="text-[11px] font-mono-tabular text-[var(--muted)]">
                        {veh.idVehiculo}
                      </span>
                    </div>
                    <span
                      className="text-[11px] font-mono-tabular font-semibold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: disponibleHoy
                          ? 'var(--state-ok-bg)'
                          : 'var(--state-warn-bg)',
                        color: disponibleHoy
                          ? 'var(--state-ok-ink)'
                          : 'var(--state-warn-ink)',
                      }}
                    >
                      {disponibleHoy ? 'Disponible' : veh.estadoVehiculo}
                    </span>
                  </div>

                  <h3 className="text-[14px] font-semibold text-[var(--ink)] m-0">
                    {veh.tipo}
                  </h3>
                  <div className="text-[12px] text-[var(--muted)] mt-0.5 mb-3">
                    {veh.conductor} · {veh.ubicacionBase}
                  </div>

                  <div className="crm-panel p-2.5 space-y-2 mb-3 text-[11px] font-mono-tabular">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Capacidad: {veh.capacidadKg.toLocaleString('es-CO')} kg</span>
                        <span className="font-semibold">Uso: {pctPeso}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[var(--g-alt)] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, pctPeso)}%`,
                            backgroundColor:
                              pctPeso > 100
                                ? 'var(--state-err-ink)'
                                : 'var(--action)',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Volumen: {veh.volumenM3} m³</span>
                        <span className="font-semibold">Uso: {pctVol}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[var(--g-alt)] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, pctVol)}%`,
                            backgroundColor:
                              pctVol > 100
                                ? 'var(--state-err-ink)'
                                : '#165934',
                          }}
                        />
                      </div>
                    </div>

                    <div className="text-[var(--muted)] pt-1 border-t border-[var(--hairline)]">
                      Útil: {veh.largoInterior}×{veh.anchoInterior}×{veh.altoInterior}m
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={
                    !disponibleHoy ||
                    !cumpleCapacidad ||
                    !carga.datosMaestrosCompletos
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConfirmarAsignacion(veh.idVehiculo);
                  }}
                  className="btn-primary w-full"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {disponibleHoy && cumpleCapacidad
                      ? `Reservar ${veh.placa}`
                      : !disponibleHoy
                      ? 'No disponible'
                      : 'Excede capacidad'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Columna Derecha (5 cols): Reservas de Transporte Registradas (`ASIGNACION`) */}
        <aside className="lg:col-span-5 crm-card overflow-hidden sticky top-[74px]">
          <div className="px-4 py-3 border-b border-[var(--hairline)] bg-[#faf9f6] flex items-center justify-between">
            <span className="font-semibold text-[13px] text-[var(--ink)]">
              Reservas Registradas (`ASIGNACION` — UC-04)
            </span>
            <span className="text-[11px] font-mono-tabular text-[var(--muted)]">
              {asignaciones.length} registro(s)
            </span>
          </div>

          <div className="divide-y divide-[var(--hairline)] max-h-[520px] overflow-y-auto">
            {asignaciones.map((asg) => {
              const ped = pedidos.find((p) => p.idPedido === asg.idPedido);
              const veh = vehiculos.find((v) => v.idVehiculo === asg.idVehiculo);
              return (
                <div key={asg.idAsignacion} className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-tabular font-semibold text-[12px] text-[var(--ink)]">
                      {asg.idAsignacion} · Pedido {asg.idPedido}
                    </span>
                    <span
                      className="text-[11px] font-mono-tabular px-2 py-0.5 rounded font-semibold"
                      style={{
                        backgroundColor:
                          asg.estadoAsignacion === 'Cancelada'
                            ? 'var(--state-err-bg)'
                            : 'var(--state-info-bg)',
                        color:
                          asg.estadoAsignacion === 'Cancelada'
                            ? 'var(--state-err-ink)'
                            : 'var(--state-info-ink)',
                      }}
                    >
                      {asg.estadoAsignacion}
                    </span>
                  </div>

                  <div className="text-[12px] text-[var(--c-text)]">
                    Cliente: <strong>{ped?.nombreCliente}</strong>
                  </div>
                  <div className="text-[12px] font-mono-tabular text-[var(--muted)]">
                    Unidad: <strong className="text-[var(--ink)]">{veh?.placa}</strong> ({veh?.tipo}) · Fecha: {asg.fechaAsignacion}
                  </div>

                  {asg.estadoAsignacion !== 'Cancelada' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onIrPlanificarRuta(asg.idAsignacion)}
                        className="btn-primary flex-1 !min-h-[32px] !text-[12px]"
                      >
                        <Route className="w-3.5 h-3.5" />
                        <span>Planificar Ruta (UC-05)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onCancelarAsignacion(asg.idAsignacion)}
                        className="btn-secondary !min-h-[32px] !text-[12px]"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Liberar</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};
