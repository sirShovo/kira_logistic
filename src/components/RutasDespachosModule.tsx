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
  vistaSubmodulo: 'rutas' | 'trazabilidad';
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
  vistaSubmodulo,
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

  /* ========================================================================
   * VISTA A: PLANIFICADOR DE RUTAS DE ENTREGA (RF-05 / UC-05)
   * ======================================================================== */
  if (vistaSubmodulo === 'rutas') {
    return (
      <div className="space-y-4">
        {/* Barra de control superior de planificación de ruta */}
        <div className="crm-card p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="select-asg-ruta"
              className="text-[12px] font-semibold text-[var(--ink)]"
            >
              Asignación reservada (`ASIGNACION`):
            </label>
            <select
              id="select-asg-ruta"
              value={asignacionActiva?.idAsignacion || ''}
              onChange={(e) => onSeleccionarAsignacion(e.target.value)}
              className="h-9 px-3 rounded-[6px] bg-[var(--g-main)] border border-[var(--hairline-strong)] font-mono-tabular text-[12px] font-semibold text-[var(--ink)]"
            >
              {asignaciones.map((asg) => (
                <option key={asg.idAsignacion} value={asg.idAsignacion}>
                  {asg.idAsignacion} — Pedido {asg.idPedido} ({asg.idVehiculo}) [
                  {asg.estadoAsignacion}]
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-[12px] text-[var(--c-text)] bg-[var(--g-main)] px-3 py-1.5 rounded-[6px] border border-[var(--hairline)] cursor-pointer">
              <input
                type="checkbox"
                checked={modoMotorFallido}
                onChange={(e) => setModoMotorFallido(e.target.checked)}
                className="w-3.5 h-3.5 accent-[var(--action)]"
              />
              <span>Simular falla motor distancias (UC-05 Alt. 2)</span>
            </label>
          </div>

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
            <Compass className="w-4 h-4" />
            <span>
              {rutaAsociada
                ? 'Recalcular hoja de ruta'
                : 'Generar ruta consolidada (Paso 18 UC-05)'}
            </span>
          </button>
        </div>

        {/* Alertas de Caminos Alternativos UC-05 */}
        {modoMotorFallido && (
          <div className="crm-card p-3.5 bg-[var(--state-warn-bg)] border border-[var(--state-warn-ink)] flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[var(--state-warn-ink)] shrink-0 mt-0.5" />
            <div className="text-[12px] text-[var(--ink)]">
              <strong className="font-mono-tabular">UC-05 CAMINO ALTERNATIVO 2:</strong>{' '}
              Motor automático de distancias en contingencia. Utilice los botones de prioridad en cada parada para organizar el orden de entrega de manera manual (`ajustarOrdenManual()`).
            </div>
          </div>
        )}

        {rutaAsociada?.estadoRuta === 'Advertencia Cobertura' && (
          <div className="crm-card p-4 bg-[var(--state-err-bg)] border border-[var(--state-err-ink)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-[var(--state-err-ink)] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-mono-tabular font-semibold text-[var(--state-err-ink)]">
                  UC-05 · CAMINO ALTERNATIVO 1 · DESTINO FUERA DE COBERTURA LOGÍSTICA
                </span>
                <p className="text-[13px] font-medium text-[var(--ink)] m-0 mt-0.5">
                  El destino del pedido no coincide con las zonas estándar del Valle de Aburrá. Autorice el ajuste manual de ruta para permitir el despacho.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onAutorizarZonaEspecial(rutaAsociada.idRuta)}
              className="btn-primary"
            >
              Autorizar ajuste manual de ruta
            </button>
          </div>
        )}

        {/* Layout Dividido: Izquierda (Secuencia de Paradas) + Derecha (Mapa de Zonas y Resumen) */}
        {!rutaAsociada ? (
          <div className="crm-card p-10 text-center">
            <p className="text-[14px] text-[var(--muted)] m-0 mb-3">
              La asignación <strong className="text-[var(--ink)]">{asignacionActiva?.idAsignacion}</strong> aún no tiene una hoja de ruta generada.
            </p>
            <button
              type="button"
              onClick={() =>
                asignacionActiva &&
                onGenerarRuta(asignacionActiva.idAsignacion, 'Automático WMS/GIS')
              }
              className="btn-primary"
            >
              Generar hoja de ruta ahora
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Columna Izquierda (7 cols): Secuenciador de Paradas */}
            <div className="lg:col-span-7 crm-card p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--hairline)]">
                <div>
                  <span className="text-[11px] font-mono-tabular text-[var(--muted)]">
                    HOJA DE RUTA {rutaAsociada.idRuta} · MODO: {rutaAsociada.modoCalculo}
                  </span>
                  <h3 className="text-[15px] font-semibold text-[var(--ink)] m-0">
                    Secuencia de Paradas y Ventanas Horarias (`ordenEntrega`)
                  </h3>
                </div>
                <span className="font-mono-tabular text-[12px] px-2 py-0.5 rounded bg-[rgba(185,192,218,0.25)] text-[var(--ink)] font-semibold">
                  {rutaAsociada.paradas.length} paradas
                </span>
              </div>

              <div className="space-y-2.5">
                {rutaAsociada.paradas.map((parada, idx) => (
                  <div
                    key={`${parada.orden}-${parada.direccion}`}
                    className="p-3.5 rounded-[8px] bg-[var(--g-main)] border border-[var(--hairline-strong)] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-[6px] bg-[var(--ink)] text-white font-mono-tabular font-semibold text-[12px] flex items-center justify-center shrink-0 mt-0.5">
                        {parada.orden}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-[13px] text-[var(--ink)]">
                          {parada.direccion}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono-tabular text-[var(--muted)] mt-1">
                          <span>{parada.zona}</span>
                          <span>·</span>
                          <span>Ventana: {parada.ventanaHoraria}</span>
                          <span>·</span>
                          <span>
                            {parada.distanciaKm}&nbsp;km ({parada.tiempoEstimadoMin}&nbsp;min)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className="text-[11px] font-mono-tabular px-2 py-0.5 rounded font-medium"
                        style={{
                          backgroundColor: parada.enCobertura
                            ? 'var(--state-ok-bg)'
                            : 'var(--state-err-bg)',
                          color: parada.enCobertura
                            ? 'var(--state-ok-ink)'
                            : 'var(--state-err-ink)',
                        }}
                      >
                        {parada.enCobertura ? 'Cobertura OK' : 'Fuera de zona'}
                      </span>

                      {idx > 0 && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx <= 1}
                            onClick={() =>
                              onReordenarParada(rutaAsociada.idRuta, idx, 'SUBIR')
                            }
                            className="btn-secondary !min-h-[30px] !px-1.5"
                            aria-label={`Subir parada ${parada.orden}`}
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === rutaAsociada.paradas.length - 1}
                            onClick={() =>
                              onReordenarParada(rutaAsociada.idRuta, idx, 'BAJAR')
                            }
                            className="btn-secondary !min-h-[30px] !px-1.5"
                            aria-label={`Bajar parada ${parada.orden}`}
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna Derecha (5 cols): Ficha de Consolidación de Ruta y Mapa Esquemático de Zonas */}
            <aside className="lg:col-span-5 crm-card p-4 sm:p-5 space-y-4">
              <div className="pb-3 border-b border-[var(--hairline)]">
                <span className="text-[11px] font-mono-tabular text-[var(--action)] font-semibold">
                  RESUMEN OPERATIVO DE RUTA · RUTA_ENTREGA
                </span>
                <h3 className="text-[15px] font-semibold text-[var(--ink)] m-0 mt-0.5">
                  Corredor Logístico Valle de Aburrá
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2.5 font-mono-tabular">
                <div className="crm-panel p-3">
                  <div className="text-[11px] text-[var(--muted)]">Distancia Total</div>
                  <div className="text-[18px] font-semibold text-[var(--ink)]">
                    {rutaAsociada.distanciaTotalKm}&nbsp;km
                  </div>
                </div>
                <div className="crm-panel p-3">
                  <div className="text-[11px] text-[var(--muted)]">Tiempo Estimado</div>
                  <div className="text-[18px] font-semibold text-[var(--ink)]">
                    {rutaAsociada.tiempoEstimadoTotalMin}&nbsp;min
                  </div>
                </div>
              </div>

              {/* Esquema Visual de Zonas de Cobertura */}
              <div className="p-4 rounded-[10px] bg-[#141413] text-white space-y-2.5">
                <div className="text-[11px] font-mono-tabular uppercase tracking-wider text-[#9e9a93]">
                  Zonas de Cobertura Involucradas
                </div>
                {rutaAsociada.paradas.map((p) => (
                  <div
                    key={`map-${p.orden}`}
                    className="flex items-center justify-between text-[12px] py-1.5 border-b border-[#292826] last:border-none"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded-full bg-[#b84a27] text-white font-mono-tabular text-[11px] flex items-center justify-center shrink-0">
                        {p.orden}
                      </span>
                      <span className="truncate">{p.zona}</span>
                    </div>
                    <span className="font-mono-tabular text-[11px] text-[#a8a49e] shrink-0 ml-2">
                      {p.ventanaHoraria}
                    </span>
                  </div>
                ))}
              </div>

              <div className="crm-panel p-3 text-[12px] space-y-1">
                <div>
                  Pedido vinculado:{' '}
                  <strong className="font-mono-tabular">
                    {pedidoAsociado?.idPedido}
                  </strong>{' '}
                  ({pedidoAsociado?.nombreCliente})
                </div>
                <div>
                  Unidad asignada:{' '}
                  <strong className="font-mono-tabular">
                    {vehiculoAsociado?.placa}
                  </strong>{' '}
                  — Conductor: {vehiculoAsociado?.conductor}
                </div>
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
                className="btn-primary w-full !min-h-[40px]"
              >
                <Play className="w-4 h-4" />
                <span>Confirmar ruta e iniciar despacho en vivo (UC-06)</span>
              </button>
            </aside>
          </div>
        )}
      </div>
    );
  }

  /* ========================================================================
   * VISTA B: CENTRO DE MONITOREO GPS Y TRAZABILIDAD EN VIVO (RF-06 / UC-06)
   * ======================================================================== */
  return (
    <div className="space-y-4">
      {/* Selector superior de Despacho Activo + Simulador GPS */}
      <div className="crm-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor="select-despacho-activo"
            className="text-[12px] font-semibold text-[var(--ink)]"
          >
            Despacho en seguimiento (`DESPACHO`):
          </label>
          <select
            id="select-despacho-activo"
            value={despachoSeleccionado?.idDespacho || ''}
            onChange={(e) => setDespachoActivoId(e.target.value)}
            className="h-9 px-3 rounded-[6px] bg-[var(--g-main)] border border-[var(--hairline-strong)] font-mono-tabular text-[12px] font-semibold text-[var(--ink)]"
          >
            {despachos.map((d) => (
              <option key={d.idDespacho} value={d.idDespacho}>
                {d.idDespacho} — Asig. {d.idAsignacion} [{d.estadoDespacho}]
              </option>
            ))}
          </select>
        </div>

        {despachoSeleccionado && (
          <button
            type="button"
            onClick={() =>
              onToggleGpsDespacho(despachoSeleccionado.idDespacho)
            }
            className="btn-secondary"
          >
            {despachoSeleccionado.conexionGpsActiva ? (
              <>
                <WifiOff className="w-4 h-4" />
                <span>Simular caída de señal GPS (UC-06 Alt. 1)</span>
              </>
            ) : (
              <>
                <Radio className="w-4 h-4" />
                <span>Restablecer conexión GPS</span>
              </>
            )}
          </button>
        )}
      </div>

      {despachoSeleccionado && (
        <>
          {/* Camino Alternativo 1 de UC-06: Pérdida de señal GPS */}
          {!despachoSeleccionado.conexionGpsActiva && (
            <div className="crm-card p-4 bg-[var(--state-warn-bg)] border border-[var(--state-warn-ink)] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <WifiOff className="w-5 h-5 text-[var(--state-warn-ink)] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] font-mono-tabular font-semibold text-[var(--state-warn-ink)]">
                    UC-06 · CAMINO ALTERNATIVO 1 · DESCONEXIÓN TEMPORAL DE TELEMETRÍA VEHICULAR
                  </span>
                  <h3 className="text-[14px] font-semibold text-[var(--ink)] m-0 mt-0.5">
                    Pérdida temporal de enlace con unidad móvil. Se conserva en pantalla la última ubicación conocida:
                  </h3>
                  <p className="text-[12px] font-mono-tabular text-[var(--c-text)] m-0 mt-0.5">
                    {despachoSeleccionado.ultimaUbicacionConocida}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onToggleGpsDespacho(despachoSeleccionado.idDespacho)
                }
                className="btn-primary"
              >
                Reconectar GPS
              </button>
            </div>
          )}

          {/* Consola Oscura de Telemetría en Tiempo Real */}
          <div className="rounded-[12px] p-5 bg-[#141413] text-white">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: despachoSeleccionado.conexionGpsActiva
                        ? '#34d399'
                        : '#f59e0b',
                    }}
                  />
                  <span className="text-[11px] font-mono-tabular uppercase tracking-wider text-[#9e9a93]">
                    {despachoSeleccionado.conexionGpsActiva
                      ? 'TELEMETRÍA SATELITAL EN LÍNEA · CORREDOR VALLE DE ABURRÁ'
                      : 'SEÑAL EN CONTINGENCIA · ÚLTIMA POSICIÓN EN CACHÉ'}
                  </span>
                </div>
                <h2 className="text-[18px] font-semibold m-0 mt-1">
                  Despacho {despachoSeleccionado.idDespacho} · Estado:{' '}
                  <span className="text-[#e69f88]">
                    {despachoSeleccionado.estadoDespacho}
                  </span>
                </h2>
              </div>

              <div className="text-right font-mono-tabular">
                <div className="text-[11px] text-[#9e9a93]">Avance de Ruta</div>
                <div className="text-[22px] font-bold">
                  {despachoSeleccionado.progresoPorcentaje}%
                </div>
              </div>
            </div>

            <div className="w-full h-2.5 rounded-full bg-[#2a2927] overflow-hidden mb-3">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${despachoSeleccionado.progresoPorcentaje}%`,
                  backgroundColor: 'var(--action)',
                }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono-tabular text-[#c9c5be] pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#e69f88]" />
                <span>1. CEDI Guayabal (0%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#e69f88]" />
                <span>2. Autopista Sur / Regional (40%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#e69f88]" />
                <span>3. Muelle Cliente (75%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#34d399]" />
                <span>4. Entrega Cumplida (100%)</span>
              </div>
            </div>
          </div>

          {/* Layout Dividido: Izquierda (Controles de Eventos y Excepciones) + Derecha (Bitácora Histórica TRAZABILIDAD) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-5 space-y-4">
              {/* Panel 1: Registrar punto de control o entrega cumplida */}
              <div className="crm-card p-4 space-y-3">
                <div className="text-[11px] font-mono-tabular font-semibold text-[var(--action)]">
                  PASO 23 UC-06 · REGISTRAR PUNTO DE CONTROL O ENTREGA
                </div>

                <div>
                  <label
                    htmlFor="trz-ubicacion"
                    className="block text-[12px] font-medium text-[var(--ink)] mb-1"
                  >
                    Ubicación reportada (`ubicacion`)
                  </label>
                  <input
                    id="trz-ubicacion"
                    type="text"
                    value={nuevaUbicacion}
                    onChange={(e) => setNuevaUbicacion(e.target.value)}
                    className="field-input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="trz-estado"
                    className="block text-[12px] font-medium text-[var(--ink)] mb-1"
                  >
                    Estado de entrega (`estadoEntrega`)
                  </label>
                  <input
                    id="trz-estado"
                    type="text"
                    value={nuevoEstadoEvento}
                    onChange={(e) => setNuevoEstadoEvento(e.target.value)}
                    className="field-input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="trz-novedad"
                    className="block text-[12px] font-medium text-[var(--ink)] mb-1"
                  >
                    Novedad u observación (`novedad`)
                  </label>
                  <input
                    id="trz-novedad"
                    type="text"
                    value={nuevaNovedadTexto}
                    onChange={(e) => setNuevaNovedadTexto(e.target.value)}
                    className="field-input"
                  />
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
                        Math.min(
                          100,
                          despachoSeleccionado.progresoPorcentaje + 20
                        )
                      )
                    }
                    className="btn-secondary flex-1"
                  >
                    Añadir a bitácora
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onFinalizarOExcepcionDespacho(
                        despachoSeleccionado.idDespacho,
                        'Completado',
                        'Entrega completada a satisfacción con remisión firmada.'
                      )
                    }
                    className="btn-primary flex-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completar Entrega</span>
                  </button>
                </div>
              </div>

              {/* Panel 2: Camino Alternativo 2 UC-06 (Devolución o Reprogramación) */}
              <div className="crm-card p-4 space-y-3">
                <div className="text-[11px] font-mono-tabular font-semibold text-[var(--state-warn-ink)]">
                  UC-06 · CAMINO ALTERNATIVO 2 · DEVOLUCIÓN O REPROGRAMACIÓN
                </div>
                <div>
                  <label
                    htmlFor="trz-motivo-excepcion"
                    className="block text-[12px] font-medium text-[var(--ink)] mb-1"
                  >
                    Motivo formal de no entrega (`marcarDevolucion(motivo)`)
                  </label>
                  <textarea
                    id="trz-motivo-excepcion"
                    rows={2}
                    value={motivoExcepcion}
                    onChange={(e) => setMotivoExcepcion(e.target.value)}
                    className="w-full p-2.5 rounded-[6px] bg-[var(--card)] border border-[var(--hairline-strong)] text-[13px] text-[var(--ink)]"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onFinalizarOExcepcionDespacho(
                        despachoSeleccionado.idDespacho,
                        'Reprogramado',
                        motivoExcepcion
                      )
                    }
                    className="btn-secondary flex-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reprogramar</span>
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
                    className="btn-secondary flex-1 !border-[var(--state-err-ink)] !text-[var(--state-err-ink)]"
                  >
                    Registrar Devolución
                  </button>
                </div>
              </div>
            </div>

            {/* Columna Derecha (7 cols): Tabla Cronológica de Trazabilidad */}
            <div className="lg:col-span-7 crm-card overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--hairline)] bg-[rgba(196,218,207,0.18)] flex items-center justify-between">
                <span className="font-semibold text-[13px] text-[var(--ink)]">
                  Bitácora Histórica de Eventos (`TRAZABILIDAD` — {historialDespacho.length} registros)
                </span>
                <span className="text-[11px] font-mono-tabular text-[var(--muted)]">
                  FK: {despachoSeleccionado.idDespacho}
                </span>
              </div>

              <div
                tabIndex={0}
                role="region"
                aria-label="Historial de eventos de trazabilidad"
                className="table-wrapper"
              >
                <table
                  style={
                    {
                      '--label-2': '"Fecha / Hora"',
                      '--label-3': '"Punto de Control"',
                      '--label-4': '"Estado"',
                      '--label-5': '"Detalle / Novedad"',
                    } as React.CSSProperties
                  }
                >
                  <thead>
                    <tr>
                      <th scope="col">ID Evento</th>
                      <th scope="col">Timestamp</th>
                      <th scope="col">Ubicación</th>
                      <th scope="col">Estado</th>
                      <th scope="col">Novedad y Autor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialDespacho.map((ev) => (
                      <tr key={ev.idRegistro}>
                        <th scope="row" className="font-mono-tabular">
                          {ev.idRegistro}
                        </th>
                        <td className="font-mono-tabular text-[12px]">
                          {ev.fechaHora}
                        </td>
                        <td className="font-medium text-[var(--ink)]">
                          {ev.ubicacion}
                        </td>
                        <td>
                          <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-mono-tabular bg-[rgba(196,231,212,0.35)] text-[#1b4731] border border-[#c4e7d4] font-semibold">
                            {ev.estadoEntrega}
                          </span>
                        </td>
                        <td>
                          <div className="text-[12px] text-[var(--c-text)]">
                            {ev.novedad}
                          </div>
                          <div className="text-[11px] text-[var(--muted)]">
                            Por: {ev.autorRegistro}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
