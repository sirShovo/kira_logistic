import React, { useState } from 'react';
import { useLogistics } from '../../context/useLogistics';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { 
  Navigation, 
  Search, 
  MapPin, 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Phone, 
  Play, 
  Wifi,
  WifiOff
} from 'lucide-react';

export const DespachosView: React.FC = () => {
  const { 
    despachos, 
    vehiculos, 
    pedidos, 
    trazabilidad, 
    despachoSeleccionadoId, 
    iniciarDespacho, 
    actualizarProgresoDespacho, 
    toggleGpsDespacho, 
    registrarReporteManualGps, 
    reportarNovedadDespacho, 
    completarDespacho
  } = useLogistics();

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [idDespachoActivo, setIdDespachoActivo] = useState<string>(() => {
    if (despachoSeleccionadoId && despachos.some(d => d.idDespacho === despachoSeleccionadoId)) {
      return despachoSeleccionadoId;
    }
    const enEjec = despachos.find(d => d.estadoDespacho === 'En Ejecucion');
    return enEjec ? enEjec.idDespacho : (despachos[0]?.idDespacho || '');
  });

  // Modales
  const [modalNovedadAbierto, setModalNovedadAbierto] = useState(false);
  const [motivoNovedad, setMotivoNovedad] = useState('Cliente ausente');
  const [resolucionNovedad, setResolucionNovedad] = useState<'Devolucion a CEDI' | 'Reprogramar Despacho'>('Devolucion a CEDI');
  const [obsNovedad, setObsNovedad] = useState('');

  const [modalCompletarAbierto, setModalCompletarAbierto] = useState(false);
  const [recibeNombre, setRecibeNombre] = useState('');
  const [recibeDocumento, setRecibeDocumento] = useState('');
  const [notasFinales, setNotasFinales] = useState('Mercancia recibida a entera satisfaccion en temperatura optima.');

  const [modalReporteManual, setModalReporteManual] = useState(false);
  const [ubicacionManual, setUbicacionManual] = useState('');
  const [notaManual, setNotaManual] = useState('');

  const despachoActivo = despachos.find(d => d.idDespacho === idDespachoActivo) || despachos[0] || null;
  const vehiculoActivo = despachoActivo ? vehiculos.find(v => v.idVehiculo === despachoActivo.idVehiculo) : null;
  const pedidoActivo = despachoActivo ? pedidos.find(p => p.idPedido === despachoActivo.idPedido) : null;
  const eventosTrazabilidad = despachoActivo 
    ? trazabilidad.filter(t => t.idDespacho === despachoActivo.idDespacho)
    : [];

  // Filtrado de despachos
  const despachosFiltrados = despachos.filter(d => {
    const v = vehiculos.find(veh => veh.idVehiculo === d.idVehiculo);
    const coincideTexto = 
      d.idDespacho.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.idPedido.toLowerCase().includes(busqueda.toLowerCase()) ||
      (v && v.placa.toLowerCase().includes(busqueda.toLowerCase()));

    const coincideEstado = filtroEstado === 'Todos' || d.estadoDespacho === filtroEstado;
    return coincideTexto && coincideEstado;
  });

  const getBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'En Ejecucion': return 'mint';
      case 'Programado': return 'slate';
      case 'Completado': return 'success';
      case 'Devolucion': return 'error';
      case 'Reprogramado': return 'warning';
      case 'Con Novedad': return 'warning';
      default: return 'ash';
    }
  };

  const handleConfirmarNovedad = () => {
    if (!despachoActivo) return;
    reportarNovedadDespacho(despachoActivo.idDespacho, motivoNovedad, resolucionNovedad, obsNovedad);
    setModalNovedadAbierto(false);
    setObsNovedad('');
  };

  const handleConfirmarCompletado = () => {
    if (!despachoActivo) return;
    completarDespacho(despachoActivo.idDespacho, recibeNombre, recibeDocumento, notasFinales);
    setModalCompletarAbierto(false);
  };

  const handleGuardarReporteManual = () => {
    if (!despachoActivo || !ubicacionManual) return;
    registrarReporteManualGps(despachoActivo.idDespacho, ubicacionManual, notaManual);
    setModalReporteManual(false);
    setUbicacionManual('');
    setNotaManual('');
  };

  if (!despachoActivo) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-[rgba(99,88,94,0.12)] shadow-xs animate-in fade-in-50 duration-200">
        <Navigation className="w-12 h-12 text-[#998da0] mx-auto mb-3" />
        <h3 className="text-base font-bold text-[#1b171a]">
          No hay despachos registrados para monitoreo
        </h3>
        <p className="text-xs text-[#7d737a] mt-1 max-w-sm mx-auto">
          Consolide una hoja de ruta para activar la consola de seguimiento satelital.
        </p>
      </div>
    );
  }

  const enEjecucion = despachoActivo.estadoDespacho === 'En Ejecucion';
  const esProgramado = despachoActivo.estadoDespacho === 'Programado';
  const esFinalizado = despachoActivo.estadoDespacho === 'Completado' || despachoActivo.estadoDespacho === 'Devolucion';

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Top Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[rgba(99,88,94,0.12)] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#7d737a] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por ID, pedido o placa..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#f8faf9] text-[#1b171a] rounded-xl border border-[rgba(99,88,94,0.15)] focus:outline-none focus:border-[#63585e]"
          />
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['Todos', 'En Ejecucion', 'Programado', 'Completado', 'Devolucion', 'Reprogramado'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setFiltroEstado(st)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition-all ${
                filtroEstado === st
                  ? 'bg-[#63585e] text-white shadow-xs font-semibold'
                  : 'bg-[#f1f5f3] text-[#4a4147] hover:bg-[#e4ece7]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Console: Active Dispatch (Left) + Timeline (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dispatch Controls and Status (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dispatch Selector Cards */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {despachosFiltrados.map(d => {
              const v = vehiculos.find(veh => veh.idVehiculo === d.idVehiculo);
              const activo = d.idDespacho === despachoActivo.idDespacho;
              return (
                <button
                  key={d.idDespacho}
                  type="button"
                  onClick={() => setIdDespachoActivo(d.idDespacho)}
                  className={`p-3 rounded-xl border text-left shrink-0 w-48 transition-all cursor-pointer ${
                    activo
                      ? 'bg-white border-[#63585e] shadow-sm ring-1 ring-[#63585e]'
                      : 'bg-[#f8faf9] border-[rgba(99,88,94,0.12)] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs text-[#1b171a]">{d.idDespacho}</span>
                    <Badge variant={getBadgeVariant(d.estadoDespacho)} size="sm">
                      {d.estadoDespacho}
                    </Badge>
                  </div>
                  <div className="text-[11px] font-semibold text-[#1b171a] truncate">
                    Placa: {v?.placa || 'N/A'}
                  </div>
                  <div className="text-[10px] text-[#7d737a] truncate mt-0.5">
                    {d.ubicacionActual}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Dispatch Card */}
          <div className="bg-white p-6 rounded-2xl border border-[rgba(99,88,94,0.12)] shadow-xs space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-[#1b171a]">
                    {despachoActivo.idDespacho}
                  </span>
                  <Badge variant={getBadgeVariant(despachoActivo.estadoDespacho)} size="sm">
                    {despachoActivo.estadoDespacho}
                  </Badge>
                  <span className="text-xs text-[#7d737a]">
                    Ruta: {despachoActivo.idRuta}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#1b171a]">
                  {pedidoActivo?.cliente || 'Entrega Logistica Kiramar'}
                </h3>
                <p className="text-xs text-[#7d737a] mt-0.5">
                  Pedido: {despachoActivo.idPedido} • Destino: {pedidoActivo?.destino}
                </p>
              </div>

              {/* GPS Telemetry Switch (UC-06 Alt 1) */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => toggleGpsDespacho(despachoActivo.idDespacho)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                    despachoActivo.conexionGpsActiva
                      ? 'bg-[#c4e7d4]/30 text-[#174630] border-[#c4e7d4] hover:bg-[#c4e7d4]/50'
                      : 'bg-[#f8d7da] text-[#781c2d] border-[#f1b0b7] hover:bg-[#f8d7da]/80'
                  }`}
                  title="Haga clic para simular interrupcion o reanudacion de senal GPS"
                >
                  {despachoActivo.conexionGpsActiva ? (
                    <>
                      <Wifi className="w-3.5 h-3.5 text-[#1e6b45]" />
                      <span>GPS: Activo</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3.5 h-3.5 text-[#b02a37]" />
                      <span>GPS: Interrumpido</span>
                    </>
                  )}
                </button>
                <div className="text-[10px] font-mono text-[#7d737a] mt-1">
                  Ultimo reporte: {despachoActivo.horaUltimoReporteGps}
                </div>
              </div>
            </div>

            {/* UC-06 Camino Alternativo 1 Banner: Perdida de GPS */}
            {!despachoActivo.conexionGpsActiva && (
              <div className="p-4 rounded-xl bg-[#fdfaf3] border border-[#e8d7a7] text-[#6b4716] flex items-start justify-between gap-4">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-[#b4781c] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-bold">
                      Alerta de perdida de conexion telematica con el vehiculo
                    </div>
                    <div className="mt-0.5 text-[#6b4716]/90">
                      Mostrando ultima ubicacion conocida registrada: <strong>{despachoActivo.ultimaUbicacionConocida}</strong> a las <strong>{despachoActivo.horaUltimoReporteGps}</strong>.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModalReporteManual(true)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#e8d7a7] text-[#6b4716] hover:bg-[#f5ecce] transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5 text-[#b4781c]" />
                  <span>Reporte Telefonico / Radio</span>
                </button>
              </div>
            )}

            {/* Progress Bar & Telemetry Status */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-[#1b171a]">
                  Progreso del Recorrido de Entrega:
                </span>
                <span className="font-mono font-bold text-sm text-[#1b171a]">
                  {despachoActivo.porcentajeAvance}%
                </span>
              </div>
              <div className="w-full bg-[#f1f5f3] h-2.5 rounded-full overflow-hidden border border-[rgba(99,88,94,0.1)]">
                <div
                  className="bg-[#2e7d58] h-full rounded-full transition-all duration-500"
                  style={{ width: `${despachoActivo.porcentajeAvance}%` }}
                />
              </div>

              {enEjecucion && (
                <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-[rgba(99,88,94,0.08)]">
                  <span className="text-[11px] text-[#7d737a]">Avanzar simulacion:</span>
                  <div className="flex items-center gap-1.5">
                    {[25, 50, 75, 90].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => actualizarProgresoDespacho(despachoActivo.idDespacho, pct, `Punto de Control ${pct}% de ruta`)}
                        className="px-2 py-0.5 text-[11px] font-mono rounded bg-[#f1f5f3] hover:bg-[#e4ece7] text-[#1b171a] cursor-pointer"
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Vehicle & Driver Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#f8faf9] border border-[rgba(99,88,94,0.1)] text-xs">
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#7d737a]">
                  Unidad de Transporte
                </div>
                <div className="font-mono font-bold text-sm text-[#1b171a]">
                  {vehiculoActivo?.placa} ({vehiculoActivo?.tipo})
                </div>
                <div className="text-[11px] text-[#7d737a]">
                  Capacidad: {vehiculoActivo?.capacidadKg.toLocaleString()} kg • {vehiculoActivo?.volumenM3} m³
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#7d737a]">
                  Conductor Asignado
                </div>
                <div className="font-semibold text-sm text-[#1b171a] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#998da0]" />
                  <span>{vehiculoActivo?.conductorAsignado || 'Conductor de turno'}</span>
                </div>
                <div className="text-[11px] text-[#7d737a] flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#998da0]" />
                  <span>{vehiculoActivo?.telefonoConductor || 'Canal radio CEDI Central'}</span>
                </div>
              </div>
            </div>

            {/* Action Bar (Botonera Operativa) */}
            <div className="pt-2 border-t border-[rgba(99,88,94,0.1)] flex flex-wrap items-center gap-3">
              {esProgramado && (
                <button
                  type="button"
                  onClick={() => iniciarDespacho(despachoActivo.idDespacho)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#63585e] text-white hover:bg-[#4a4147] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-[#c4e7d4]" />
                  <span>Iniciar Recorrido de Despacho</span>
                </button>
              )}

              {enEjecucion && (
                <>
                  <button
                    type="button"
                    onClick={() => setModalNovedadAbierto(true)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#fdfaf3] text-[#6b4716] border border-[#e8d7a7] hover:bg-[#f5ecce] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-[#b4781c]" />
                    <span>Reportar Novedad de Entrega</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRecibeNombre(pedidoActivo?.cliente || '');
                      setRecibeDocumento('CC 71.394.821');
                      setModalCompletarAbierto(true);
                    }}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-[#2e7d58] text-white hover:bg-[#236345] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer ml-auto"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>Confirmar Entrega Completada</span>
                  </button>
                </>
              )}

              {esFinalizado && (
                <div className="text-xs font-semibold text-[#1e6b45] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Despacho cerrado y registrado en la bitacora de auditoria.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Chronological Audit Trail Timeline (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[rgba(99,88,94,0.12)] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-[#1b171a]">
                  Bitacora de Trazabilidad en Ruta
                </h4>
                <p className="text-xs text-[#7d737a] mt-0.5">
                  Registro cronologico inmutable de eventos y novedades
                </p>
              </div>
              <Badge variant="ash" size="sm">
                {eventosTrazabilidad.length} hitos
              </Badge>
            </div>

            {/* Timeline Stream */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {eventosTrazabilidad.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#7d737a]">
                  Aun no se registran hitos para este despacho.
                </div>
              ) : (
                eventosTrazabilidad.map((evento, idx) => (
                  <div key={evento.idRegistro} className="flex gap-3 relative text-xs">
                    {/* Line connector */}
                    {idx < eventosTrazabilidad.length - 1 && (
                      <div className="absolute left-2.5 top-5 bottom-0 w-0.5 bg-[rgba(99,88,94,0.15)]" />
                    )}

                    {/* Dot */}
                    <div className="w-5 h-5 rounded-full bg-[#f1f5f3] border border-[#63585e] flex items-center justify-center shrink-0 mt-0.5 z-10">
                      <div className="w-2 h-2 rounded-full bg-[#63585e]" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-semibold text-[#1b171a]">
                          {evento.estadoEntrega}
                        </span>
                        <span className="text-[10px] font-mono text-[#7d737a]">
                          {new Date(evento.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#7d737a] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#998da0] shrink-0" />
                        <span>{evento.ubicacion}</span>
                      </div>

                      <div className="text-xs text-[#4a4147] mt-1 p-2 rounded-lg bg-[#f8faf9] border border-[rgba(99,88,94,0.08)]">
                        {evento.novedad}
                      </div>

                      <div className="text-[10px] text-[#998da0] mt-1 font-mono">
                        Registrado por: {evento.usuarioRegistro}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Reportar Novedad de Entrega (UC-06 Alt 2) */}
      <Modal
        isOpen={modalNovedadAbierto}
        onClose={() => setModalNovedadAbierto(false)}
        title="Reportar Novedad de Entrega en Destino"
        subtitle={`Despacho: ${despachoActivo.idDespacho} • Pedido: ${despachoActivo.idPedido}`}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalNovedadAbierto(false)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[rgba(99,88,94,0.18)] text-[#1b171a] hover:bg-[#f8faf9] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmarNovedad}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#b02a37] text-white hover:bg-[#8f1f2d] transition-colors cursor-pointer"
            >
              Registrar Novedad y Actualizar Estado
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-[#1b171a] font-semibold mb-1">
              Motivo de Anomalidad u Obstruccion:
            </label>
            <select
              value={motivoNovedad}
              onChange={(e) => setMotivoNovedad(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8faf9] border border-[rgba(99,88,94,0.2)] rounded-lg text-xs font-medium focus:outline-none focus:border-[#63585e] cursor-pointer"
            >
              <option value="Cliente ausente">Cliente ausente / Establecimiento cerrado</option>
              <option value="Direccion errada">Direccion errada o no localizada en zona</option>
              <option value="Rechazo por fuera de horario">Rechazo por recepcion fuera de horario</option>
              <option value="Mercancia con averia">Mercancia con novedad o averia detectada</option>
              <option value="Fallo mecanico vehicular">Fallo mecanico o impedimento vial</option>
            </select>
          </div>

          <div>
            <label className="block text-[#1b171a] font-semibold mb-1">
              Resolucion Operativa Inmediata:
            </label>
            <select
              value={resolucionNovedad}
              onChange={(e) => setResolucionNovedad(e.target.value as any)}
              className="w-full px-3 py-2 bg-[#f8faf9] border border-[rgba(99,88,94,0.2)] rounded-lg text-xs font-medium focus:outline-none focus:border-[#63585e] cursor-pointer"
            >
              <option value="Devolucion a CEDI">Devolucion a CEDI (Retorno de carga y liberacion de vehiculo)</option>
              <option value="Reprogramar Despacho">Reprogramar Despacho (Segunda ventana en ruta)</option>
            </select>
          </div>

          <div>
            <label className="block text-[#1b171a] font-semibold mb-1">
              Detalle y Observaciones de los Hechos:
            </label>
            <textarea
              rows={3}
              value={obsNovedad}
              onChange={(e) => setObsNovedad(e.target.value)}
              placeholder="Describa puntualmente lo sucedido para la bitacora oficial..."
              className="w-full px-3 py-2 bg-[#f8faf9] border border-[rgba(99,88,94,0.2)] rounded-lg text-xs focus:outline-none focus:border-[#63585e]"
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Confirmar Entrega Completada (UC-06 Exito) */}
      <Modal
        isOpen={modalCompletarAbierto}
        onClose={() => setModalCompletarAbierto(false)}
        title="Certificar y Finalizar Despacho Exitoso"
        subtitle={`Despacho: ${despachoActivo.idDespacho} • Pedido: ${despachoActivo.idPedido}`}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalCompletarAbierto(false)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[rgba(99,88,94,0.18)] text-[#1b171a] hover:bg-[#f8faf9] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmarCompletado}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#2e7d58] text-white hover:bg-[#236345] transition-colors cursor-pointer"
            >
              Certificar Entrega y Liberar Flota
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#7d737a]">
            Al confirmar la entrega satisfactoria, el pedido y el despacho pasaran a estado <strong>Completado</strong> y el vehiculo <strong>{vehiculoActivo?.placa}</strong> sera liberado automaticamente a estado <strong>Disponible</strong>.
          </p>

          <div>
            <label className="block text-[#1b171a] font-semibold mb-1">
              Nombre de Quien Recibe en Destino:
            </label>
            <input
              type="text"
              value={recibeNombre}
              onChange={(e) => setRecibeNombre(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8faf9] border border-[rgba(99,88,94,0.2)] rounded-lg text-xs font-medium focus:outline-none focus:border-[#63585e]"
            />
          </div>

          <div>
            <label className="block text-[#1b171a] font-semibold mb-1">
              Documento de Identidad / CC:
            </label>
            <input
              type="text"
              value={recibeDocumento}
              onChange={(e) => setRecibeDocumento(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8faf9] border border-[rgba(99,88,94,0.2)] rounded-lg text-xs font-mono focus:outline-none focus:border-[#63585e]"
            />
          </div>

          <div>
            <label className="block text-[#1b171a] font-semibold mb-1">
              Notas y Constancia de Recibo:
            </label>
            <textarea
              rows={2}
              value={notasFinales}
              onChange={(e) => setNotasFinales(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8faf9] border border-[rgba(99,88,94,0.2)] rounded-lg text-xs focus:outline-none focus:border-[#63585e]"
            />
          </div>
        </div>
      </Modal>

      {/* Modal: Reporte Telefonico / Radial Manual (UC-06 Alt 1) */}
      <Modal
        isOpen={modalReporteManual}
        onClose={() => setModalReporteManual(false)}
        title="Registro Manual de Ubicacion por Radio / Telefono"
        subtitle="Ingreso de coordenadas o referencia geografica ante perdida de enlace satelital"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalReporteManual(false)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[rgba(99,88,94,0.18)] text-[#1b171a] hover:bg-[#f8faf9] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleGuardarReporteManual}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#63585e] text-white hover:bg-[#4a4147] cursor-pointer"
            >
              Registrar Posicion en Bitacora
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-[#1b171a] font-semibold mb-1">
              Ubicacion Reportada por el Conductor:
            </label>
            <input
              type="text"
              placeholder="Ej. Peaje Variante Las Palmas, estacion de servicio Texaco..."
              value={ubicacionManual}
              onChange={(e) => setUbicacionManual(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8faf9] border border-[rgba(99,88,94,0.2)] rounded-lg text-xs focus:outline-none focus:border-[#63585e]"
            />
          </div>

          <div>
            <label className="block text-[#1b171a] font-semibold mb-1">
              Novedad u Observacion Radial:
            </label>
            <input
              type="text"
              placeholder="Ej. Congestion moderada en tunel, cadena de frio estable..."
              value={notaManual}
              onChange={(e) => setNotaManual(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8faf9] border border-[rgba(99,88,94,0.2)] rounded-lg text-xs focus:outline-none focus:border-[#63585e]"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
