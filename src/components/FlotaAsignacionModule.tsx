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

    // Camino Alternativo 1 de UC-04: Concurrencia
    if (simularConcurrencia || veh.estadoVehiculo !== 'Disponible') {
      setAlertaConcurrencia(
        `UC-04 Camino Alternativo 1 (Error de concurrencia): El vehículo ${veh.placa} (${veh.tipo}) fue reservado por otro operador de logística hace unos segundos. Por favor seleccione otro vehículo candidato disponible.`
      );
      return;
    }

    onRegistrarAsignacion(pedidoActivo.idPedido, idVehiculo, fechaConsulta);
    setMensajeConfirmacion(
      `Reserva formal registrada: Vehículo ${veh.placa} asignado al pedido ${pedidoActivo.idPedido} por ${usuarioActual.nombre}.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Cabecera de selección de Pedido objetivo y filtros de Flota (UC-03) */}
      <section
        aria-labelledby="heading-uc03"
        className="surface-card p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5 pb-4 border-b border-[var(--hairline)]">
          <div>
            <span className="text-[12px] font-mono-tabular font-medium text-[var(--action)]">
              CASOS DE USO UC-03 Y UC-04 · REQUISITOS RF-03 Y RF-04 · CLASES Vehiculo / Asignacion
            </span>
            <h2
              id="heading-uc03"
              className="text-[20px] sm:text-[22px] font-semibold text-[var(--ink)] m-0 mt-0.5"
            >
              Disponibilidad vehicular, cubicaje y reserva de transporte.
            </h2>
          </div>

          {/* Selector rápido de pedido a evaluar */}
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="select-pedido-flota"
              className="text-[13px] font-medium text-[var(--muted)]"
            >
              Pedido requerido (Precondición UC-02):
            </label>
            <select
              id="select-pedido-flota"
              value={pedidoActivo.idPedido}
              onChange={(e) => {
                onSeleccionarPedido(e.target.value);
                setAlertaConcurrencia(null);
                setMensajeConfirmacion(null);
              }}
              className="h-10 px-3 rounded-[6px] bg-[var(--g-main)] border border-[var(--hairline-strong)] font-mono-tabular text-[14px] font-medium text-[var(--ink)]"
            >
              {pedidos.map((p) => {
                const c = calcularCaracteristicasCarga(p);
                return (
                  <option key={p.idPedido} value={p.idPedido}>
                    {p.idPedido} — {p.nombreCliente} ({c.pesoTotalKg} kg /{' '}
                    {c.volumenTotalM3} m³) [{p.estadoPedido}]
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Barra de parámetros de consulta de flota (Pasos 9 a 12 de UC-03) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 rounded-[10px] bg-[var(--g-main)] border border-[var(--hairline)]">
          <div>
            <label
              htmlFor="fecha-despacho-uc03"
              className="block text-[13px] font-medium text-[var(--ink)] mb-1"
            >
              Fecha solicitada de despacho (Paso 9 UC-03)
            </label>
            <div className="flex items-center gap-2">
              <Calendar
                className="w-4 h-4 text-[var(--muted)] shrink-0"
                aria-hidden="true"
              />
              <input
                id="fecha-despacho-uc03"
                type="date"
                value={fechaConsulta}
                onChange={(e) => setFechaConsulta(e.target.value)}
                className="h-10 px-3 rounded-[6px] bg-[var(--card)] border border-[var(--hairline-strong)] font-mono-tabular text-[14px] text-[var(--ink)] w-full"
              />
              <button
                type="button"
                onClick={() => setFechaConsulta('2026-11-12')}
                title="Probar fecha sin disponibilidad de flota (UC-03 Camino Alternativo 1)"
                className="btn-secondary !min-h-[40px] !px-2.5 !text-[12px] shrink-0"
              >
                Probar fecha llena
              </button>
            </div>
          </div>

          <div>
            <span className="block text-[13px] font-medium text-[var(--ink)] mb-1">
              Filtro físico por peso y volumen (Paso 11 UC-03)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSoloCandidatosIdoneos(true)}
                className={`flex-1 h-10 px-3 rounded-[6px] text-[13px] font-medium cursor-pointer border ${
                  soloCandidatosIdoneos
                    ? 'bg-[var(--ink)] text-white border-[var(--ink)]'
                    : 'bg-[var(--card)] text-[var(--c-text)] border-[var(--hairline-strong)]'
                }`}
              >
                Solo candidatos idóneos ({candidatosCompatibles.length})
              </button>
              <button
                type="button"
                onClick={() => setSoloCandidatosIdoneos(false)}
                className={`flex-1 h-10 px-3 rounded-[6px] text-[13px] font-medium cursor-pointer border ${
                  !soloCandidatosIdoneos
                    ? 'bg-[var(--ink)] text-white border-[var(--ink)]'
                    : 'bg-[var(--card)] text-[var(--c-text)] border-[var(--hairline-strong)]'
                }`}
              >
                Ver flota completa ({vehiculos.length})
              </button>
            </div>
          </div>

          <div>
            <span className="block text-[13px] font-medium text-[var(--ink)] mb-1">
              Control de concurrencia multiusuario (UC-04 Alt. 1)
            </span>
            <label className="flex items-center gap-2.5 h-10 px-3 rounded-[6px] bg-[var(--card)] border border-[var(--hairline-strong)] cursor-pointer text-[13px] text-[var(--c-text)]">
              <input
                type="checkbox"
                checked={simularConcurrencia}
                onChange={(e) => {
                  setSimularConcurrencia(e.target.checked);
                  setAlertaConcurrencia(null);
                }}
                className="w-4 h-4 accent-[var(--action)]"
              />
              <span>Simular reserva simultánea por otro usuario</span>
            </label>
          </div>
        </div>

        {/* Resumen de requisitos físicos de la carga activa */}
        <div className="mb-5 p-3.5 rounded-[8px] bg-[var(--g-alt)] border border-[var(--hairline)] flex flex-wrap items-center justify-between gap-3 text-[14px]">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-[var(--ink)]">
              Requerimiento físico de {pedidoActivo.idPedido}:
            </span>
            <span className="font-mono-tabular">
              Peso: <strong>{carga.pesoTotalKg.toLocaleString('es-CO')}&nbsp;kg</strong>
            </span>
            <span className="font-mono-tabular">
              Volumen: <strong>{carga.volumenTotalM3.toLocaleString('es-CO')}&nbsp;m³</strong>
            </span>
            <span className="font-mono-tabular">
              Dim. máx pieza: <strong>{carga.dimMaxLargo}×{carga.dimMaxAncho}×{carga.dimMaxAlto}&nbsp;m</strong>
            </span>
          </div>
          <span className="text-[12px] font-mono-tabular text-[var(--muted)]">
            Estado pedido: {pedidoActivo.estadoPedido}
          </span>
        </div>

        {/* Notificaciones de excepción o confirmación */}
        {alertaConcurrencia && (
          <div className="mb-5 p-4 rounded-[10px] bg-[var(--state-err-bg)] border border-[var(--state-err-ink)] flex items-start gap-3">
            <ShieldAlert
              className="w-5 h-5 text-[var(--state-err-ink)] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="text-[14px] text-[var(--ink)] font-medium">
              {alertaConcurrencia}
            </div>
          </div>
        )}

        {mensajeConfirmacion && (
          <div className="mb-5 p-4 rounded-[10px] bg-[var(--state-ok-bg)] border border-[var(--state-ok-ink)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-[14px] text-[var(--state-ok-ink)] font-medium">
              <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>{mensajeConfirmacion}</span>
            </div>
          </div>
        )}

        {/* UC-03 Camino Alternativo 1: No hay vehículos disponibles en la fecha */}
        {disponiblesEnFecha.length === 0 && (
          <div className="mb-5 p-6 rounded-[10px] bg-[var(--state-warn-bg)] border border-[var(--state-warn-ink)]">
            <span className="text-[12px] font-mono-tabular font-semibold text-[var(--state-warn-ink)]">
              UC-03 · CAMINO ALTERNATIVO 1 · SIN FLOTA DISPONIBLE EN LA FECHA SOLICITADA
            </span>
            <h3 className="text-[18px] font-semibold text-[var(--ink)] m-0 mt-1">
              No hay vehículos disponibles en la flota para la fecha {fechaConsulta}.
            </h3>
            <p className="text-[15px] text-[var(--c-text)] mt-1 mb-4">
              Toda la flota operativa registra programación o mantenimiento preventivo en esa fecha. El sistema sugiere las siguientes fechas alternativas con disponibilidad inmediata:
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setFechaConsulta('2026-11-10')}
                className="btn-primary"
              >
                Seleccionar fecha sugerida: 2026-11-10 (4 disponibles)
              </button>
              <button
                type="button"
                onClick={() => setFechaConsulta('2026-11-11')}
                className="btn-secondary"
              >
                Seleccionar fecha sugerida: 2026-11-11 (4 disponibles)
              </button>
            </div>
          </div>
        )}

        {/* UC-03 Camino Alternativo 2: Hay vehículos disponibles, pero ninguno cumple capacidad */}
        {disponiblesEnFecha.length > 0 && candidatosCompatibles.length === 0 && (
          <div className="mb-5 p-5 rounded-[10px] bg-[var(--state-err-bg)] border border-[var(--state-err-ink)]">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="w-5 h-5 text-[var(--state-err-ink)] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <span className="text-[12px] font-mono-tabular font-semibold text-[var(--state-err-ink)]">
                  UC-03 · CAMINO ALTERNATIVO 2 · CAPACIDAD INSUFICIENTE EN UNIDAD ÚNICA
                </span>
                <h3 className="text-[17px] font-semibold text-[var(--ink)] m-0 mt-0.5">
                  Existen {disponiblesEnFecha.length} vehículos disponibles, pero ninguno cumple con la capacidad de carga requerida ({carga.pesoTotalKg.toLocaleString('es-CO')}&nbsp;kg).
                </h3>
                <p className="text-[14px] text-[var(--c-text)] m-0 mt-1">
                  El sistema recomienda dividir el pedido en el módulo de Análisis de Carga (UC-02) o asignar múltiples vehículos de transporte.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cuadrícula de Vehículos (Entidad VEHICULO) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                className={`card-interactive p-5 rounded-[14px] border cursor-pointer flex flex-col justify-between ${
                  esSeleccionado
                    ? 'bg-[var(--card)] border-[var(--ink)]'
                    : 'bg-[var(--card)] border-[var(--hairline)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-tabular font-semibold text-[16px] px-2.5 py-1 rounded bg-[var(--ink)] text-white">
                        {veh.placa}
                      </span>
                      <span className="text-[12px] font-mono-tabular text-[var(--muted)]">
                        {veh.idVehiculo}
                      </span>
                    </div>

                    <span
                      className="text-[12px] font-mono-tabular font-medium px-2.5 py-0.5 rounded"
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

                  <h3 className="text-[17px] font-semibold text-[var(--ink)] m-0">
                    {veh.tipo}
                  </h3>
                  <p className="text-[13px] text-[var(--muted)] m-0 mt-0.5 mb-4">
                    Conductor: {veh.conductor} · {veh.ubicacionBase}
                  </p>

                  {/* Barras de ocupación de capacidad (Peso y Volumen) */}
                  <div className="space-y-3 p-3 rounded-[8px] bg-[var(--g-main)] border border-[var(--hairline)] mb-4">
                    <div>
                      <div className="flex justify-between text-[12px] font-mono-tabular mb-1">
                        <span>
                          Capacidad Peso: {veh.capacidadKg.toLocaleString('es-CO')}&nbsp;kg
                        </span>
                        <span
                          className="font-semibold"
                          style={{
                            color:
                              pctPeso > 100
                                ? 'var(--state-err-ink)'
                                : 'var(--ink)',
                          }}
                        >
                          Ocupación: {pctPeso}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--g-alt)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
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
                      <div className="flex justify-between text-[12px] font-mono-tabular mb-1">
                        <span>Capacidad Vol.: {veh.volumenM3}&nbsp;m³</span>
                        <span
                          className="font-semibold"
                          style={{
                            color:
                              pctVol > 100
                                ? 'var(--state-err-ink)'
                                : 'var(--ink)',
                          }}
                        >
                          Cubicaje: {pctVol}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[var(--g-alt)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, pctVol)}%`,
                            backgroundColor:
                              pctVol > 100
                                ? 'var(--state-err-ink)'
                                : '#1b5936',
                          }}
                        />
                      </div>
                    </div>

                    <div className="text-[12px] font-mono-tabular text-[var(--muted)] pt-1 border-t border-[var(--hairline)]">
                      Interior útil: {veh.largoInterior}m (L) × {veh.anchoInterior}m
                      (A) × {veh.altoInterior}m (H)
                    </div>
                  </div>
                </div>

                {/* Acción de Reserva (UC-04: Asignar vehículo al despacho y registrar reserva) */}
                <div className="flex items-center gap-2 pt-2">
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
                    className="btn-primary w-full !min-h-[40px] !text-[14px]"
                  >
                    <Lock className="w-4 h-4" aria-hidden="true" />
                    <span>
                      {disponibleHoy && cumpleCapacidad
                        ? `Asignar y reservar ${veh.placa}`
                        : !disponibleHoy
                        ? 'No disponible'
                        : 'Excede capacidad'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sección 2: UC-04 / RF-04 — Registro de Asignaciones y Reservas Activas (Entidad ASIGNACION) */}
      <section
        aria-labelledby="heading-uc04"
        className="surface-card p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[12px] font-mono-tabular font-medium text-[var(--muted)]">
              ENTIDAD RELACIONAL ASIGNACION · CONTROL DE RESERVAS DE TRANSPORTE (UC-04)
            </span>
            <h2
              id="heading-uc04"
              className="text-[20px] font-semibold text-[var(--ink)] m-0 mt-0.5"
            >
              Asignaciones pedido-vehículo y reservas registradas ({asignaciones.length})
            </h2>
          </div>
        </div>

        <div
          tabIndex={0}
          role="region"
          aria-label="Tabla de asignaciones y reservas de vehículos"
          className="table-wrapper"
        >
          <table
            style={
              {
                '--label-2': '"Pedido Asociado"',
                '--label-3': '"Vehículo Reservado"',
                '--label-4': '"Responsable y Fecha"',
                '--label-5': '"Estado Reserva"',
                '--label-6': '"Operaciones"',
              } as React.CSSProperties
            }
          >
            <thead>
              <tr>
                <th scope="col">ID Asignación (PK)</th>
                <th scope="col">Pedido Asociado (FK)</th>
                <th scope="col">Vehículo Reservado (FK)</th>
                <th scope="col">Usuario Responsable / Fecha</th>
                <th scope="col">Estado Asignación</th>
                <th scope="col">Acciones (UC-04 / UC-05)</th>
              </tr>
            </thead>
            <tbody>
              {asignaciones.map((asg) => {
                const ped = pedidos.find((p) => p.idPedido === asg.idPedido);
                const veh = vehiculos.find(
                  (v) => v.idVehiculo === asg.idVehiculo
                );
                return (
                  <tr key={asg.idAsignacion}>
                    <th scope="row" className="font-mono-tabular">
                      {asg.idAsignacion}
                    </th>
                    <td>
                      <div className="font-mono-tabular font-semibold text-[var(--ink)]">
                        {asg.idPedido}
                      </div>
                      <div className="text-[13px] text-[var(--muted)]">
                        {ped?.nombreCliente || 'Cliente Kiramar'}
                      </div>
                    </td>
                    <td>
                      <div className="font-mono-tabular font-semibold text-[var(--ink)]">
                        {veh?.placa || asg.idVehiculo} — {veh?.tipo}
                      </div>
                      <div className="text-[12px] text-[var(--muted)]">
                        Conductor: {veh?.conductor}
                      </div>
                    </td>
                    <td>
                      <div className="text-[13px] text-[var(--ink)]">
                        ID Usuario: <span className="font-mono-tabular">{asg.idUsuario}</span>
                      </div>
                      <div className="text-[12px] font-mono-tabular text-[var(--muted)]">
                        Fecha: {asg.fechaAsignacion}
                      </div>
                    </td>
                    <td>
                      <span
                        className="inline-flex px-2.5 py-1 rounded text-[12px] font-mono-tabular font-medium"
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
                    </td>
                    <td>
                      <div className="flex flex-wrap items-center gap-2">
                        {asg.estadoAsignacion !== 'Cancelada' && (
                          <>
                            <button
                              type="button"
                              onClick={() => onIrPlanificarRuta(asg.idAsignacion)}
                              className="btn-primary !min-h-[36px] !px-3 !text-[13px]"
                            >
                              <Route className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Planificar ruta (UC-05)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onCancelarAsignacion(asg.idAsignacion)
                              }
                              title="Cancelar reserva y liberar vehículo (UC-04 Camino Alternativo 2)"
                              className="btn-secondary !min-h-[36px] !px-3 !text-[13px]"
                            >
                              <RotateCcw
                                className="w-3.5 h-3.5"
                                aria-hidden="true"
                              />
                              <span>Liberar reserva</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
