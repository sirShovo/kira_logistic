import React, { useState } from 'react';
import { useLogistics } from '../../context/useLogistics';
import type { Vehiculo } from '../../types/domain';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { 
  evaluarVehiculoConCarga, 
  filtrarFlota, 
  sugerirFechasAlternativas 
} from '../../utils/logisticsEngine';
import { 
  Truck, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  Split
} from 'lucide-react';

export const FlotaView: React.FC = () => {
  const { 
    vehiculos, 
    pedidos, 
    asignaciones, 
    pedidoSeleccionadoId, 
    cambiarVista, 
    reservarVehiculo,
    dividirPedidoExcedido,
    usuarioActivo
  } = useLogistics();

  const esTransporte = usuarioActivo.perfil === 'Personal de Logistica / Transporte';

  const [fechaDespacho, setFechaDespacho] = useState<string>(() => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  });

  const [soloCompatibles, setSoloCompatibles] = useState<boolean>(true);
  const [pedidoActivoId, setPedidoActivoId] = useState<string>(pedidoSeleccionadoId || '');

  // Pedido actualmente evaluado
  const pedidosValidados = pedidos.filter(p => p.estadoPedido === 'Validado');
  const pedidoActivo = pedidos.find(p => p.idPedido === pedidoActivoId) || pedidosValidados[0] || null;
  const cargaActiva = pedidoActivo?.carga;

  // Filtrado de flota inteligente
  const { 
    candidatosAptos, 
    ocupadosEnFecha, 
    capacidadInsuficiente 
  } = filtrarFlota(vehiculos, cargaActiva, fechaDespacho, asignaciones);

  // Sugerencias de fechas alternativas (UC-03 Alt 1)
  const fechasSugeridas = sugerirFechasAlternativas(fechaDespacho, vehiculos, asignaciones, cargaActiva);

  // Modal de reserva y confirmacion (UC-04)
  const [vehiculoParaReservar, setVehiculoParaReservar] = useState<Vehiculo | null>(null);
  const [simularConflicto, setSimularConflicto] = useState<boolean>(false);

  const abrirModalReserva = (v: Vehiculo) => {
    setVehiculoParaReservar(v);
    setSimularConflicto(false);
  };

  const ejecutarReserva = () => {
    if (!vehiculoParaReservar || !pedidoActivo) return;

    const exito = reservarVehiculo(
      pedidoActivo.idPedido,
      vehiculoParaReservar.idVehiculo,
      fechaDespacho,
      simularConflicto
    );

    if (exito) {
      setVehiculoParaReservar(null);
      // Navegar a rutas
      cambiarVista('rutas');
    }
  };

  const vehiculosParaMostrar = soloCompatibles && cargaActiva
    ? candidatosAptos
    : vehiculos;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Active Load Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-[rgba(99,88,94,0.12)] shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7d737a]">
                Carga Activa para Emparejamiento
              </span>
              {pedidoActivo && (
                <Badge variant="mint" size="sm">
                  {pedidoActivo.idPedido}
                </Badge>
              )}
            </div>

            {pedidoActivo ? (
              <div>
                <h3 className="text-base font-bold text-[#1b171a]">
                  {pedidoActivo.cliente}
                </h3>
                <p className="text-xs text-[#7d737a] mt-0.5">
                  Destino: {pedidoActivo.destino} • {pedidoActivo.zonasEntrega.join(', ')}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-base font-bold text-[#1b171a]">
                  Parque Automotor General
                </h3>
                <p className="text-xs text-[#7d737a] mt-0.5">
                  No hay pedidos en estado 'Validado'. Seleccione un pedido para realizar correspondence de carga.
                </p>
              </div>
            )}
          </div>

          {/* Selector de pedido y metricas de carga */}
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            {pedidosValidados.length > 0 && (
              <div className="text-xs">
                <label className="block text-[#7d737a] text-[10px] uppercase font-mono mb-1">
                  Cambiar pedido:
                </label>
                <select
                  value={pedidoActivo?.idPedido || ''}
                  onChange={(e) => setPedidoActivoId(e.target.value)}
                  className="px-3 py-1.5 bg-[#f8faf9] text-[#1b171a] font-medium border border-[rgba(99,88,94,0.18)] rounded-xl text-xs focus:outline-none focus:border-[#63585e] cursor-pointer"
                >
                  {pedidosValidados.map(p => (
                    <option key={p.idPedido} value={p.idPedido}>
                      {p.idPedido} - {p.cliente.slice(0, 22)}...
                    </option>
                  ))}
                </select>
              </div>
            )}

            {cargaActiva && (
              <div className="flex items-center gap-3 px-4 py-2 bg-[#f8faf9] rounded-xl border border-[rgba(99,88,94,0.12)]">
                <div>
                  <div className="text-[10px] font-mono text-[#7d737a] uppercase">Peso</div>
                  <div className="text-sm font-bold font-mono text-[#1b171a]">
                    {cargaActiva.pesoTotalKg.toLocaleString()} kg
                  </div>
                </div>
                <div className="w-px h-7 bg-[rgba(99,88,94,0.15)]" />
                <div>
                  <div className="text-[10px] font-mono text-[#7d737a] uppercase">Volumen</div>
                  <div className="text-sm font-bold font-mono text-[#1b171a]">
                    {cargaActiva.volumenTotalM3} m³
                  </div>
                </div>
                <div className="w-px h-7 bg-[rgba(99,88,94,0.15)]" />
                <div>
                  <div className="text-[10px] font-mono text-[#7d737a] uppercase">Gálibo Máx</div>
                  <div className="text-xs font-mono font-semibold text-[#1b171a]">
                    {cargaActiva.dimMaxAlto}m Al x {cargaActiva.dimMaxAncho}m An
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fleet Search & Filtering Toolbar (UC-03) */}
      <div className="bg-white p-4 rounded-2xl border border-[rgba(99,88,94,0.12)] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Date Selector */}
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-[#63585e]" />
          <div>
            <label className="block text-[10px] font-mono uppercase text-[#7d737a]">
              Fecha Solicitada de Despacho
            </label>
            <input
              type="date"
              value={fechaDespacho}
              onChange={(e) => setFechaDespacho(e.target.value)}
              className="px-3 py-1 bg-[#f8faf9] text-[#1b171a] font-mono text-xs rounded-lg border border-[rgba(99,88,94,0.15)] focus:outline-none focus:border-[#63585e] cursor-pointer"
            />
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoloCompatibles(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              soloCompatibles
                ? 'bg-[#63585e] text-white shadow-xs font-semibold'
                : 'bg-[#f1f5f3] text-[#4a4147] hover:bg-[#e4ece7]'
            }`}
          >
            Solo Vehiculos Compatibles ({candidatosAptos.length})
          </button>

          <button
            type="button"
            onClick={() => setSoloCompatibles(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              !soloCompatibles
                ? 'bg-[#63585e] text-white shadow-xs font-semibold'
                : 'bg-[#f1f5f3] text-[#4a4147] hover:bg-[#e4ece7]'
            }`}
          >
            Parque Automotor Completo ({vehiculos.length})
          </button>
        </div>
      </div>

      {/* UC-03 Camino Alternativo 1: Sin vehiculos disponibles en la fecha solicitada */}
      {candidatosAptos.length === 0 && soloCompatibles && cargaActiva && (
        <div className="p-6 rounded-2xl bg-[#fdfaf3] border border-[#e8d7a7] text-[#6b4716] space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#b4781c] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold">
                No se encontraron unidades vehiculares disponibles para la fecha indicada ({fechaDespacho})
              </div>
              <div className="text-xs text-[#6b4716]/90 mt-0.5">
                Las unidades que cubren la capacidad de carga ({cargaActiva.pesoTotalKg} kg / {cargaActiva.volumenTotalM3} m³) ya se encuentran reservadas o en ruta para esa jornada.
              </div>
            </div>
          </div>

          {/* Suggested Alternative Dates */}
          {fechasSugeridas.length > 0 && (
            <div className="pt-2 border-t border-[#e8d7a7]/80">
              <div className="text-xs font-semibold text-[#6b4716] mb-2">
                Fechas Alternativas Sugeridas con Disponibilidad Confirmada:
              </div>
              <div className="flex flex-wrap gap-2">
                {fechasSugeridas.map(sug => (
                  <button
                    key={sug.fecha}
                    type="button"
                    onClick={() => setFechaDespacho(sug.fecha)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-[#e8d7a7] text-xs font-semibold text-[#6b4716] hover:bg-[#f5ecce] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#b4781c]" />
                    <span>{sug.label}</span>
                    <Badge variant="mint" size="sm">
                      {sug.unidadesDisponibles} disp.
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* UC-03 Camino Alternativo 2: Capacidad vehicular insuficiente en toda la flota */}
      {cargaActiva && capacidadInsuficiente.length === vehiculos.filter(v => v.estadoVehiculo === 'Disponible').length && candidatosAptos.length === 0 && (
        <div className="p-5 rounded-2xl bg-[#f8d7da] border border-[#f1b0b7] text-[#781c2d] flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#b02a37] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold">
                Capacidad vehicular insuficiente: Ninguna unidad individual puede transportar la totalidad de la carga
              </div>
              <div className="text-xs text-[#781c2d]/90 mt-0.5">
                La carga actual supera los limites individuales de cubicaje o peso de cada vehiculo de la flota. Se sugiere utilizar multiples vehiculos mediante fraccionamiento de carga.
              </div>
            </div>
          </div>

          {pedidoActivo && (
            <button
              type="button"
              onClick={() => {
                dividirPedidoExcedido(pedidoActivo.idPedido);
                cambiarVista('pedidos');
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#642232] text-white hover:bg-[#4d1926] transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Split className="w-3.5 h-3.5" />
              <span>Fraccionar Pedido</span>
            </button>
          )}
        </div>
      )}

      {/* Vehicles Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehiculosParaMostrar.map(vehiculo => {
          const evalCarga = cargaActiva 
            ? evaluarVehiculoConCarga(vehiculo, cargaActiva)
            : null;

          const estaOcupadoEnFecha = ocupadosEnFecha.some(v => v.idVehiculo === vehiculo.idVehiculo);
          const enMtto = vehiculo.estadoVehiculo === 'Mantenimiento';
          const esApto = evalCarga ? (evalCarga.esCompatible && !estaOcupadoEnFecha && !enMtto) : vehiculo.estadoVehiculo === 'Disponible';

          return (
            <div
              key={vehiculo.idVehiculo}
              className={`bg-white rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                esApto
                  ? 'border-[rgba(99,88,94,0.18)] hover:border-[#63585e] hover:shadow-md'
                  : 'border-[rgba(99,88,94,0.1)] opacity-75 bg-[#f8faf9]/50'
              }`}
            >
              <div>
                {/* Header: Placa & Carroceria */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold font-mono text-[#1b171a] tracking-tight">
                        {vehiculo.placa}
                      </span>
                      <span className="text-xs font-medium text-[#7d737a]">
                        ({vehiculo.tipo})
                      </span>
                    </div>
                    <div className="text-[11px] text-[#7d737a] flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3 text-[#998da0]" />
                      <span>{vehiculo.conductorAsignado || 'Sin conductor fijo'}</span>
                    </div>
                  </div>

                  {/* Estado Badge */}
                  <div>
                    {enMtto ? (
                      <Badge variant="error" size="sm">Mantenimiento</Badge>
                    ) : estaOcupadoEnFecha ? (
                      <Badge variant="warning" size="sm">Ocupado en Fecha</Badge>
                    ) : vehiculo.estadoVehiculo === 'Disponible' ? (
                      <Badge variant="mint" size="sm">Disponible</Badge>
                    ) : (
                      <Badge variant="ash" size="sm">{vehiculo.estadoVehiculo}</Badge>
                    )}
                  </div>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#f8faf9] border border-[rgba(99,88,94,0.08)] mb-4 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-[#7d737a] block uppercase">Capacidad</span>
                    <span className="font-bold text-[#1b171a]">{vehiculo.capacidadKg.toLocaleString()} kg</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#7d737a] block uppercase">Volumen</span>
                    <span className="font-bold text-[#1b171a]">{vehiculo.volumenM3} m³</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-[rgba(99,88,94,0.06)] text-[11px] text-[#7d737a]">
                    Dims utiles: {vehiculo.altoInterior}m (Al) x {vehiculo.anchoInterior}m (An) x {vehiculo.largoInterior}m (L)
                  </div>
                </div>

                {/* Occupancy Indicators if active load exists */}
                {evalCarga && (
                  <div className="space-y-2 mb-4 text-xs">
                    {/* Weight Bar */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1 font-mono">
                        <span className="text-[#7d737a]">Llenado en Peso:</span>
                        <span className={`font-semibold ${evalCarga.cumplePeso ? 'text-[#174630]' : 'text-[#781c2d]'}`}>
                          {evalCarga.porcentajePeso}% ({cargaActiva?.pesoTotalKg} kg)
                        </span>
                      </div>
                      <div className="w-full bg-[#f1f5f3] h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            evalCarga.cumplePeso ? 'bg-[#2e7d58]' : 'bg-[#b02a37]'
                          }`}
                          style={{ width: `${Math.min(evalCarga.porcentajePeso, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Volume Bar */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1 font-mono">
                        <span className="text-[#7d737a]">Llenado en Cubicaje:</span>
                        <span className={`font-semibold ${evalCarga.cumpleVolumen ? 'text-[#174630]' : 'text-[#781c2d]'}`}>
                          {evalCarga.porcentajeVolumen}% ({cargaActiva?.volumenTotalM3} m³)
                        </span>
                      </div>
                      <div className="w-full bg-[#f1f5f3] h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            evalCarga.cumpleVolumen ? 'bg-[#47558a]' : 'bg-[#b02a37]'
                          }`}
                          style={{ width: `${Math.min(evalCarga.porcentajeVolumen, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Dimensional Fit Tag */}
                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="text-[#7d737a]">Gálibo dimensional:</span>
                      {evalCarga.cumpleAlto && evalCarga.cumpleAncho && evalCarga.cumpleLargo ? (
                        <span className="text-[#1e6b45] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Compatible
                        </span>
                      ) : (
                        <span className="text-[#b02a37] font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Insuficiente
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button: Asignar y Reservar Transporte (UC-04) */}
              <div className="pt-3 border-t border-[rgba(99,88,94,0.1)]">
                <button
                  type="button"
                  disabled={!esApto || !pedidoActivo || esTransporte}
                  onClick={() => abrirModalReserva(vehiculo)}
                  className={`w-full py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    esApto && pedidoActivo && !esTransporte
                      ? 'bg-[#63585e] hover:bg-[#4a4147] text-white shadow-xs cursor-pointer'
                      : 'bg-[#f1f5f3] text-[#a89fa5] cursor-not-allowed'
                  }`}
                  title={
                    !pedidoActivo
                      ? 'Seleccione un pedido validado'
                      : !esApto
                      ? evalCarga?.motivoIncompatibilidad || 'Vehiculo no disponible o no apto'
                      : 'Formalizar reserva de transporte'
                  }
                >
                  <Truck className="w-3.5 h-3.5 text-[#c4e7d4]" />
                  <span>Asignar y Reservar Transporte</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation & Concurrency Simulation Modal (UC-04) */}
      <Modal
        isOpen={!!vehiculoParaReservar}
        onClose={() => setVehiculoParaReservar(null)}
        title="Formalizar Reserva de Transporte"
        subtitle="Confirmacion de correspondencia tecnica y bloqueo de disponibilidad vehicular"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => setVehiculoParaReservar(null)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[rgba(99,88,94,0.18)] text-[#1b171a] hover:bg-[#f8faf9] cursor-pointer"
            >
              Cancelar (Descartar)
            </button>

            <button
              type="button"
              onClick={ejecutarReserva}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#63585e] text-white hover:bg-[#4a4147] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#c4e7d4]" />
              <span>Confirmar Asignacion y Reserva</span>
            </button>
          </div>
        }
      >
        {vehiculoParaReservar && pedidoActivo && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[#f8faf9] border border-[rgba(99,88,94,0.12)] space-y-2">
              <div className="flex justify-between">
                <span className="text-[#7d737a]">Pedido a Asignar:</span>
                <span className="font-mono font-bold text-[#1b171a]">{pedidoActivo.idPedido}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7d737a]">Cliente:</span>
                <span className="font-semibold text-[#1b171a] text-right">{pedidoActivo.cliente}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7d737a]">Carga Total:</span>
                <span className="font-mono font-semibold text-[#1b171a]">
                  {cargaActiva?.pesoTotalKg.toLocaleString()} kg / {cargaActiva?.volumenTotalM3} m³
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7d737a]">Vehiculo Seleccionado:</span>
                <span className="font-mono font-bold text-[#1b171a]">
                  {vehiculoParaReservar.placa} ({vehiculoParaReservar.tipo})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7d737a]">Fecha de Despacho:</span>
                <span className="font-mono font-semibold text-[#1b171a]">{fechaDespacho}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7d737a]">Despachador Responsable:</span>
                <span className="font-semibold text-[#1b171a]">{usuarioActivo.nombre}</span>
              </div>
            </div>

            {/* UC-04 Camino Alternativo 1 Simulator Switch */}
            <div className="p-3 rounded-xl bg-[#fdfaf3] border border-[#e8d7a7] flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-[#6b4716]">Simulador de Concurrencia (Prueba de Fallo)</div>
                <div className="text-[11px] text-[#6b4716]/90 mt-0.5">
                  Simula que otro despachador acaba de tomar la unidad segundos antes.
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={simularConflicto}
                  onChange={(e) => setSimularConflicto(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#b4781c]"></div>
              </label>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
