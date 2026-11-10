import type React from 'react';
import { useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Compass,
  MapPin,
  Navigation,
  Play,
  Radio,
  RotateCcw,
  WifiOff,
} from 'lucide-react';
import type {
  Asignacion,
  Despacho,
  Pedido,
  RutaEntrega,
  Trazabilidad,
  Usuario,
  Vehiculo,
} from '../types/domain';

interface RutasDespachosModuleProps {
  asignaciones: Asignacion[];
  pedidos: Pedido[];
  vehiculos: Vehiculo[];
  rutas: RutaEntrega[];
  despachos: Despacho[];
  trazabilidad: Trazabilidad[];
  usuarioActual: Usuario;
  asignacionSeleccionadaId: string;
  onSeleccionarAsignacion: (id: string) => void;
  onGenerarRuta: (
    idAsignacion: string,
    modoCalculo: 'Automático WMS/GIS' | 'Manual Operativo'
  ) => void;
  onReordenarParada: (
    idRuta: string,
    indexActual: number,
    direccion: 'SUBIR' | 'BAJAR'
  ) => void;
  onAutorizarZonaEspecial: (idRuta: string) => void;
  onIniciarDespacho: (idAsignacion: string, idRuta: string) => void;
  onToggleGpsDespacho: (idDespacho: string) => void;
  onRegistrarEventoTrazabilidad: (
    idDespacho: string,
    ubicacion: string,
    estadoEntrega: string,
    novedad: string,
    nuevoProgreso?: number
  ) => void;
  onFinalizarOExcepcionDespacho: (
    idDespacho: string,
    resultado: 'Completado' | 'Devolución' | 'Reprogramado',
    motivo: string
  ) => void;
}

export const RutasDespachosModule: React.FC<RutasDespachosModuleProps> = ({
  asignaciones,
  pedidos,
  vehiculos,
  rutas,
  despachos,
  trazabilidad,
  asignacionSeleccionadaId,
  onSeleccionarAsignacion,
  onGenerarRuta,
  onReordenarParada,
  onAutorizarZonaEspecial,
  onIniciarDespacho,
  onToggleGpsDespacho,
  onRegistrarEventoTrazabilidad,
  onFinalizarOExcepcionDespacho,
}) => {
  const [modoMotorFallido, setModoMotorFallido] = useState<boolean>(false);
  const [despachoActivoId, setDespachoActivoId] = useState<string>(
    despachos[0]?.idDespacho || 'DSP-2026-501'
  );

  // Formulario de registro de evento de trazabilidad (UC-06)
  const [nuevaUbicacion, setNuevaUbicacion] = useState<string>(
    'Av. Las Vegas con Calle 50 Sur — Punto de Entrega Sabaneta'
  );
  const [nuevoEstadoEvento, setNuevoEstadoEvento] = useState<string>(
    'En Descargue y Validación de Remisión'
  );
  const [nuevaNovedadTexto, setNuevaNovedadTexto] = useState<string>(
    'Mercancía verificada por jefe de bodega sin averías.'
  );
  const [motivoExcepcion, setMotivoExcepcion] = useState<string>(
    'Cliente cerrado por inventario físico no notificado; se reprograma ventana matutina.'
  );

  const asignacionActiva =
    asignaciones.find((a) => a.idAsignacion === asignacionSeleccionadaId) ||
    asignaciones[0];

  const pedidoAsociado = pedidos.find(
    (p) => p.idPedido === asignacionActiva?.idPedido
  );
  const vehiculoAsociado = vehiculos.find(
    (v) => v.idVehiculo === asignacionActiva?.idVehiculo
  );
  const rutaAsociada = rutas.find(
    (r) => r.idAsignacion === asignacionActiva?.idAsignacion
  );

  const despachoSeleccionado =
    despachos.find((d) => d.idDespacho === despachoActivoId) || despachos[0];

  const historialDespacho = trazabilidad.filter(
    (t) => t.idDespacho === despachoSeleccionado?.idDespacho
  );

  return (
    <div className="space-y-6">
      {/* Sección 1: UC-05 / RF-05 — Planificación de Ruta de Entrega (Clase RutaEntrega) */}
      <section
        aria-labelledby="heading-uc05"
        className="surface-card p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5 pb-4 border-b border-[var(--hairline)]">
          <div>
            <span className="text-[12px] font-mono-tabular font-medium text-[var(--action)]">
              CASO DE USO UC-05 · REQUISITO FUNCIONAL RF-05 (RU-05) · CLASE RutaEntrega
            </span>
            <h2
              id="heading-uc05"
              className="text-[20px] sm:text-[22px] font-semibold text-[var(--ink)] m-0 mt-0.5"
            >
              Planificación de rutas de entrega por zonas y secuencia de paradas.
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="select-asg-ruta"
              className="text-[13px] font-medium text-[var(--muted)]"
            >
              Asignación reservada (Precondición UC-04):
            </label>
            <select
              id="select-asg-ruta"
              value={asignacionActiva?.idAsignacion || ''}
              onChange={(e) => onSeleccionarAsignacion(e.target.value)}
              className="h-10 px-3 rounded-[6px] bg-[var(--g-main)] border border-[var(--hairline-strong)] font-mono-tabular text-[14px] font-medium text-[var(--ink)]"
            >
              {asignaciones.map((asg) => (
                <option key={asg.idAsignacion} value={asg.idAsignacion}>
                  {asg.idAsignacion} — Pedido {asg.idPedido} ({asg.idVehiculo}) [
                  {asg.estadoAsignacion}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Barra de control de motor de rutas y simulación de Camino Alternativo 2 */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[10px] bg-[var(--g-main)] border border-[var(--hairline)] mb-5">
          <div className="space-y-1">
            <div className="text-[14px] font-medium text-[var(--ink)]">
              Pedido: <span className="font-mono-tabular">{pedidoAsociado?.idPedido}</span> ({pedidoAsociado?.nombreCliente}) · Vehículo:{' '}
              <span className="font-mono-tabular font-semibold">
                {vehiculoAsociado?.placa}
              </span>{' '}
              ({vehiculoAsociado?.tipo})
            </div>
            <div className="text-[13px] text-[var(--muted)]">
              Destino registrado: {pedidoAsociado?.destino}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-[13px] text-[var(--c-text)] bg-[var(--card)] px-3 py-2 rounded-[6px] border border-[var(--hairline-strong)] cursor-pointer">
              <input
                type="checkbox"
                checked={modoMotorFallido}
                onChange={(e) => setModoMotorFallido(e.target.checked)}
                className="w-4 h-4 accent-[var(--action)]"
              />
              <span>Simular falla en motor de distancias (UC-05 Alt. 2)</span>
            </label>

            <button
              type="button"
              onClick={() =>
                asignacionActiva &&
                onGenerarRuta(
                  asignacionActiva.idAsignacion,
                  modoMotorFallido ? 'Manual Operativo' : 'Automático WMS/GIS'
                )
              }
              className="btn-primary"
            >
              <Compass className="w-4 h-4" aria-hidden="true" />
              <span>
                {rutaAsociada
                  ? 'Recalcular ruta de entrega'
                  : 'Generar ruta consolidada (Paso 18 UC-05)'}
              </span>
            </button>
          </div>
        </div>

        {/* Camino Alternativo 2 de UC-05: Falla en motor de cálculo de distancias */}
        {modoMotorFallido && (
          <div className="mb-5 p-4 rounded-[10px] bg-[var(--state-warn-bg)] border border-[var(--state-warn-ink)] flex items-start gap-3">
            <AlertTriangle
              className="w-5 h-5 text-[var(--state-warn-ink)] shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div>
              <span className="text-[12px] font-mono-tabular font-semibold text-[var(--state-warn-ink)]">
                UC-05 · CAMINO ALTERNATIVO 2 · MODO MANUAL DE ORDENAMIENTO DE RUTA
              </span>
              <p className="text-[14px] text-[var(--ink)] m-0 mt-0.5">
                Se detectó una interrupción en el motor automático de cálculo de distancias. El sistema habilita el modo de secuencias manuales para que el despachador organice el orden de las paradas directamente mediante los controles de prioridad.
              </p>
            </div>
          </div>
        )}

        {!rutaAsociada ? (
          <div className="p-8 rounded-[10px] bg-[var(--g-main)] border border-[var(--hairline)] text-center">
            <p className="text-[15px] text-[var(--muted)] m-0 mb-3">
              Esta asignación aún no cuenta con una hoja de ruta generada. Pulse «Generar ruta consolidada» para extraer destinos y zonas de entrega.
            </p>
          </div>
        ) : (
          <div>
            {/* Camino Alternativo 1 de UC-05: Destino fuera de zona de cobertura */}
            {rutaAsociada.estadoRuta === 'Advertencia Cobertura' && (
              <div className="mb-5 p-4 rounded-[10px] bg-[var(--state-err-bg)] border border-[var(--state-err-ink)] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className="w-5 h-5 text-[var(--state-err-ink)] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <span className="text-[12px] font-mono-tabular font-semibold text-[var(--state-err-ink)]">
                      UC-05 · CAMINO ALTERNATIVO 1 · DESTINO FUERA DE ZONA DE COBERTURA LOGÍSTICA
                    </span>
                    <h3 className="text-[16px] font-semibold text-[var(--ink)] m-0 mt-0.5">
                      Uno o más destinos del pedido no coinciden con las zonas estándar de cobertura del Valle de Aburrá.
                    </h3>
                    <p className="text-[14px] text-[var(--c-text)] m-0 mt-1">
                      El sistema emite esta advertencia y solicita el ajuste manual o autorización operativa del despachador antes de iniciar el despacho.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onAutorizarZonaEspecial(rutaAsociada.idRuta)}
                  className="btn-primary"
                >
                  Autorizar ajuste manual de cobertura
                </button>
              </div>
            )}

            {/* Resumen de la Ruta Consolidada */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-5">
              <div className="surface-panel p-4">
                <div className="text-[12px] text-[var(--muted)]">
                  ID Ruta (PK id_ruta)
                </div>
                <div className="text-[18px] font-mono-tabular font-semibold text-[var(--ink)] mt-0.5">
                  {rutaAsociada.idRuta}
                </div>
                <div className="text-[12px] font-mono-tabular text-[var(--muted)]">
                  Modo: {rutaAsociada.modoCalculo}
                </div>
              </div>

              <div className="surface-panel p-4">
                <div className="text-[12px] text-[var(--muted)]">
                  Total Paradas Programadas
                </div>
                <div className="text-[18px] font-mono-tabular font-semibold text-[var(--ink)] mt-0.5">
                  {rutaAsociada.paradas.length} puntos
                </div>
                <div className="text-[12px] font-mono-tabular text-[var(--muted)]">
                  Orden: [{rutaAsociada.ordenEntrega.join(' → ')}]
                </div>
              </div>

              <div className="surface-panel p-4">
                <div className="text-[12px] text-[var(--muted)]">
                  Distancia y Tiempo Estimado
                </div>
                <div className="text-[18px] font-mono-tabular font-semibold text-[var(--ink)] mt-0.5">
                  {rutaAsociada.distanciaTotalKm}&nbsp;km ·{' '}
                  {rutaAsociada.tiempoEstimadoTotalMin}&nbsp;min
                </div>
                <div className="text-[12px] font-mono-tabular text-[var(--muted)]">
                  Corredor Regional Aburrá
                </div>
              </div>

              <div className="surface-panel p-4 flex flex-col justify-between">
                <div className="text-[12px] text-[var(--muted)]">
                  Estado de Ruta (`estadoRuta`)
                </div>
                <div className="text-[16px] font-mono-tabular font-semibold text-[var(--ink)] my-1">
                  {rutaAsociada.estadoRuta}
                </div>
                <button
                  type="button"
                  disabled={rutaAsociada.estadoRuta === 'Advertencia Cobertura'}
                  onClick={() =>
                    onIniciarDespacho(
                      rutaAsociada.idAsignacion,
                      rutaAsociada.idRuta
                    )
                  }
                  className="btn-primary !min-h-[38px] !text-[13px] w-full"
                >
                  <Play className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Confirmar e iniciar despacho (UC-06)</span>
                </button>
              </div>
            </div>

            {/* Lista de Paradas con reordenamiento manual (ajustarOrdenManual()) */}
            <div className="space-y-2.5">
              {rutaAsociada.paradas.map((parada, idx) => (
                <div
                  key={`${parada.orden}-${parada.direccion}`}
                  className="p-4 rounded-[10px] bg-[var(--card)] border border-[var(--hairline-strong)] flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="w-8 h-8 rounded-[6px] bg-[var(--ink)] text-white font-mono-tabular font-semibold text-[14px] flex items-center justify-center shrink-0">
                      #{parada.orden}
                    </span>
                    <div>
                      <div className="font-medium text-[15px] text-[var(--ink)]">
                        {parada.direccion}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[13px] text-[var(--muted)] font-mono-tabular mt-0.5">
                        <span>Zona: {parada.zona}</span>
                        <span>·</span>
                        <span>Ventana: {parada.ventanaHoraria}</span>
                        <span>·</span>
                        <span>
                          Tramo: {parada.distanciaKm}&nbsp;km ({parada.tiempoEstimadoMin}&nbsp;min)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="text-[12px] font-mono-tabular px-2.5 py-1 rounded"
                      style={{
                        backgroundColor: parada.enCobertura
                          ? 'var(--state-ok-bg)'
                          : 'var(--state-err-bg)',
                        color: parada.enCobertura
                          ? 'var(--state-ok-ink)'
                          : 'var(--state-err-ink)',
                      }}
                    >
                      {parada.enCobertura
                        ? 'En cobertura oficial'
                        : 'Fuera de cobertura'}
                    </span>

                    {idx > 0 && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx <= 1}
                          onClick={() =>
                            onReordenarParada(rutaAsociada.idRuta, idx, 'SUBIR')
                          }
                          aria-label={`Subir prioridad de parada ${parada.orden}`}
                          className="btn-secondary !min-h-[34px] !px-2"
                        >
                          <ArrowUp className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === rutaAsociada.paradas.length - 1}
                          onClick={() =>
                            onReordenarParada(rutaAsociada.idRuta, idx, 'BAJAR')
                          }
                          aria-label={`Bajar prioridad de parada ${parada.orden}`}
                          className="btn-secondary !min-h-[34px] !px-2"
                        >
                          <ArrowDown className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Sección 2: UC-06 / RF-06 — Seguimiento y Trazabilidad de Despachos (Clases Despacho y Trazabilidad) */}
      <section
        aria-labelledby="heading-uc06"
        className="surface-card p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5 pb-4 border-b border-[var(--hairline)]">
          <div>
            <span className="text-[12px] font-mono-tabular font-medium text-[var(--action)]">
              CASO DE USO UC-06 · REQUISITO FUNCIONAL RF-06 (RU-06) · CLASES Despacho / Trazabilidad
            </span>
            <h2
              id="heading-uc06"
              className="text-[20px] sm:text-[22px] font-semibold text-[var(--ink)] m-0 mt-0.5"
            >
              Monitoreo en tiempo real, telemetría de corredor y trazabilidad de entregas.
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="select-despacho-activo"
              className="text-[13px] font-medium text-[var(--muted)]"
            >
              Despacho en monitoreo:
            </label>
            <select
              id="select-despacho-activo"
              value={despachoSeleccionado?.idDespacho || ''}
              onChange={(e) => setDespachoActivoId(e.target.value)}
              className="h-10 px-3 rounded-[6px] bg-[var(--g-main)] border border-[var(--hairline-strong)] font-mono-tabular text-[14px] font-medium text-[var(--ink)]"
            >
              {despachos.map((d) => (
                <option key={d.idDespacho} value={d.idDespacho}>
                  {d.idDespacho} — Asig. {d.idAsignacion} [{d.estadoDespacho}]
                </option>
              ))}
            </select>

            {despachoSeleccionado && (
              <button
                type="button"
                onClick={() =>
                  onToggleGpsDespacho(despachoSeleccionado.idDespacho)
                }
                className="btn-secondary !min-h-[40px] !text-[13px]"
              >
                {despachoSeleccionado.conexionGpsActiva ? (
                  <>
                    <WifiOff className="w-4 h-4" aria-hidden="true" />
                    <span>Simular pérdida señal GPS (UC-06 Alt. 1)</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4" aria-hidden="true" />
                    <span>Restablecer telemetría GPS</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {despachoSeleccionado && (
          <>
            {/* UC-06 Camino Alternativo 1: Pérdida de conexión de ubicación */}
            {!despachoSeleccionado.conexionGpsActiva && (
              <div className="mb-5 p-4 rounded-[10px] bg-[var(--state-warn-bg)] border border-[var(--state-warn-ink)] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <WifiOff
                    className="w-5 h-5 text-[var(--state-warn-ink)] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <span className="text-[12px] font-mono-tabular font-semibold text-[var(--state-warn-ink)]">
                      UC-06 · CAMINO ALTERNATIVO 1 · ALERTA DE DESCONEXIÓN TEMPORAL DE TELEMETRÍA
                    </span>
                    <h3 className="text-[16px] font-semibold text-[var(--ink)] m-0 mt-0.5">
                      Falla en la actualización en vivo de ubicación del vehículo por pérdida de conexión celular/GPS.
                    </h3>
                    <p className="text-[14px] text-[var(--c-text)] m-0 mt-1">
                      Última ubicación conocida registrada en servidor:{' '}
                      <strong className="font-mono-tabular">
                        {despachoSeleccionado.ultimaUbicacionConocida}
                      </strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onToggleGpsDespacho(despachoSeleccionado.idDespacho)
                  }
                  className="btn-primary !min-h-[38px]"
                >
                  Reconectar unidad GPS
                </button>
              </div>
            )}

            {/* Panel visual de telemetría del corredor logístico Valle de Aburrá */}
            <div
              className="rounded-[12px] p-5 mb-6 text-white"
              style={{ backgroundColor: 'var(--g-dark)' }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: despachoSeleccionado.conexionGpsActiva
                          ? '#34d399'
                          : '#f59e0b',
                      }}
                    />
                    <span className="text-[12px] font-mono-tabular uppercase tracking-wider text-[#a8a49e]">
                      {despachoSeleccionado.conexionGpsActiva
                        ? 'TELEMETRÍA ACTIVA · CORREDOR VALLE DE ABURRÁ'
                        : 'SEÑAL INTERMITENTE · MOSTRANDO ÚLTIMA POSICIÓN CONOCIDA'}
                    </span>
                  </div>
                  <h3 className="text-[18px] font-semibold m-0 mt-1">
                    {despachoSeleccionado.idDespacho} · Estado:{' '}
                    <span className="text-[#e69f88]">
                      {despachoSeleccionado.estadoDespacho}
                    </span>
                  </h3>
                </div>

                <div className="text-right font-mono-tabular">
                  <div className="text-[12px] text-[#a8a49e]">
                    Avance físico del recorrido
                  </div>
                  <div className="text-[22px] font-semibold">
                    {despachoSeleccionado.progresoPorcentaje}%
                  </div>
                </div>
              </div>

              {/* Esquema gráfico SVG del corredor logístico */}
              <div className="py-4 px-2">
                <div className="w-full h-3 rounded-full bg-[#2b2a28] overflow-hidden mb-3">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${despachoSeleccionado.progresoPorcentaje}%`,
                      backgroundColor: 'var(--action)',
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px] font-mono-tabular text-[#c9c5be]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#e69f88]" aria-hidden="true" />
                    <span>1. CEDI Guayabal (0%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#e69f88]" aria-hidden="true" />
                    <span>2. Autopista Sur / Regional (40%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#e69f88]" aria-hidden="true" />
                    <span>3. Descargue Muelle Cliente (75%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34d399]" aria-hidden="true" />
                    <span>4. Entrega Cumplida WMS (100%)</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#2b2a28] flex flex-wrap items-center justify-between gap-2 text-[13px] font-mono-tabular text-[#d6d3cd]">
                <span>
                  Posición reportada: {despachoSeleccionado.ultimaUbicacionConocida}
                </span>
                <span>Fecha despacho: {despachoSeleccionado.fechaDespacho}</span>
              </div>
            </div>

            {/* Controles de Registro de Novedad / Cumplido / Excepción (Pasos 23 y 24 + Camino Alternativo 2 de UC-06) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
              {/* Formulario Paso 23: Registrar novedad o avance */}
              <div className="p-4 rounded-[10px] bg-[var(--g-main)] border border-[var(--hairline)] space-y-3">
                <div className="text-[12px] font-mono-tabular font-semibold text-[var(--ink)]">
                  PASO 23 UC-06 · REGISTRAR AVANCE DE RUTA O NOVEDAD OPERATIVA
                </div>

                <div>
                  <label
                    htmlFor="trz-ubicacion"
                    className="block text-[13px] font-medium text-[var(--ink)] mb-1"
                  >
                    Ubicación actual / Punto de control
                  </label>
                  <input
                    id="trz-ubicacion"
                    type="text"
                    value={nuevaUbicacion}
                    onChange={(e) => setNuevaUbicacion(e.target.value)}
                    className="field-input !min-h-[40px] !text-[14px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="trz-estado"
                      className="block text-[13px] font-medium text-[var(--ink)] mb-1"
                    >
                      Estado del evento (`estadoEntrega`)
                    </label>
                    <input
                      id="trz-estado"
                      type="text"
                      value={nuevoEstadoEvento}
                      onChange={(e) => setNuevoEstadoEvento(e.target.value)}
                      className="field-input !min-h-[40px] !text-[14px]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="trz-novedad"
                      className="block text-[13px] font-medium text-[var(--ink)] mb-1"
                    >
                      Observación / Novedad (`novedad`)
                    </label>
                    <input
                      id="trz-novedad"
                      type="text"
                      value={nuevaNovedadTexto}
                      onChange={(e) => setNuevaNovedadTexto(e.target.value)}
                      className="field-input !min-h-[40px] !text-[14px]"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      onRegistrarEventoTrazabilidad(
                        despachoSeleccionado.idDespacho,
                        nuevaUbicacion,
                        nuevoEstadoEvento,
                        nuevaNovedadTexto,
                        Math.min(100, despachoSeleccionado.progresoPorcentaje + 20)
                      )
                    }
                    className="btn-secondary !min-h-[40px] !text-[13px]"
                  >
                    Registrar evento en historial
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onFinalizarOExcepcionDespacho(
                        despachoSeleccionado.idDespacho,
                        'Completado',
                        'Entrega completada a satisfacción con firma de remisión digital.'
                      )
                    }
                    className="btn-primary !min-h-[40px] !text-[13px]"
                  >
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    <span>Marcar entrega como Completada (100%)</span>
                  </button>
                </div>
              </div>

              {/* Formulario Camino Alternativo 2 de UC-06: Devolución o Reprogramación */}
              <div className="p-4 rounded-[10px] bg-[var(--g-main)] border border-[var(--hairline)] space-y-3 flex flex-col justify-between">
                <div>
                  <div className="text-[12px] font-mono-tabular font-semibold text-[var(--state-warn-ink)]">
                    UC-06 · CAMINO ALTERNATIVO 2 · ENTREGA NO COMPLETADA (DEVOLUCIÓN / REPROGRAMACIÓN)
                  </div>
                  <p className="text-[13px] text-[var(--muted)] m-0 mt-1 mb-3">
                    Si la entrega no puede completarse en destino (cliente ausente, rechazo parcial o cierre de muelle), registre el motivo formal para actualizar la trazabilidad y el estado del pedido.
                  </p>

                  <label
                    htmlFor="trz-motivo-excepcion"
                    className="block text-[13px] font-medium text-[var(--ink)] mb-1"
                  >
                    Motivo de no entrega (`marcarDevolucion(motivo)`)
                  </label>
                  <textarea
                    id="trz-motivo-excepcion"
                    rows={2}
                    value={motivoExcepcion}
                    onChange={(e) => setMotivoExcepcion(e.target.value)}
                    className="w-full p-2.5 rounded-[6px] bg-[var(--card)] border border-[var(--hairline-strong)] text-[14px] text-[var(--ink)]"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      onFinalizarOExcepcionDespacho(
                        despachoSeleccionado.idDespacho,
                        'Reprogramado',
                        motivoExcepcion
                      )
                    }
                    className="btn-secondary !min-h-[40px] !text-[13px]"
                  >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    <span>Cambiar estado a Reprogramado</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onFinalizarOExcepcionDespacho(
                        despachoSeleccionado.idDespacho,
                        'Devolución',
                        motivoExcepcion
                      )
                    }
                    className="btn-secondary !min-h-[40px] !text-[13px] !border-[var(--state-err-ink)] !text-[var(--state-err-ink)]"
                  >
                    Registrar Devolución a CEDI
                  </button>
                </div>
              </div>
            </div>

            {/* Bitácora Histórica de Trazabilidad (Entidad TRAZABILIDAD) */}
            <h3 className="text-[16px] font-semibold text-[var(--ink)] mb-3">
              Bitácora de eventos de trazabilidad (<code className="font-mono-tabular">TRAZABILIDAD</code> — {historialDespacho.length} registros)
            </h3>

            <div
              tabIndex={0}
              role="region"
              aria-label="Historial de eventos de trazabilidad del despacho"
              className="table-wrapper"
            >
              <table
                style={
                  {
                    '--label-2': '"Fecha y Hora"',
                    '--label-3': '"Ubicación Reportada"',
                    '--label-4': '"Estado Entrega"',
                    '--label-5': '"Novedad / Detalle"',
                    '--label-6': '"Operador"',
                  } as React.CSSProperties
                }
              >
                <thead>
                  <tr>
                    <th scope="col">ID Registro (PK)</th>
                    <th scope="col">Fecha y Hora</th>
                    <th scope="col">Ubicación de Control</th>
                    <th scope="col">Estado de Entrega</th>
                    <th scope="col">Novedad / Observación</th>
                    <th scope="col">Registrado por</th>
                  </tr>
                </thead>
                <tbody>
                  {historialDespacho.map((ev) => (
                    <tr key={ev.idRegistro}>
                      <th scope="row" className="font-mono-tabular">
                        {ev.idRegistro}
                      </th>
                      <td className="font-mono-tabular text-[13px]">
                        {ev.fechaHora}
                      </td>
                      <td className="font-medium text-[var(--ink)]">
                        {ev.ubicacion}
                      </td>
                      <td>
                        <span className="inline-flex px-2.5 py-0.5 rounded text-[12px] font-mono-tabular bg-[var(--g-alt)] text-[var(--ink)]">
                          {ev.estadoEntrega}
                        </span>
                      </td>
                      <td className="text-[14px] text-[var(--c-text)]">
                        {ev.novedad}
                      </td>
                      <td className="text-[13px] text-[var(--muted)]">
                        {ev.autorRegistro}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
};
