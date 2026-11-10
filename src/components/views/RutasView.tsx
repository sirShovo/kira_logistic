import React, { useState } from 'react';
import { useLogistics } from '../../context/useLogistics';
import type { ParadaRuta } from '../../types/domain';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { LIMITES_CORPORATIVOS } from '../../utils/logisticsEngine';
import { 
  Route, 
  MapPin, 
  Clock, 
  ArrowUp, 
  ArrowDown, 
  AlertTriangle, 
  Truck, 
  Send,
  Edit2
} from 'lucide-react';

export const RutasView: React.FC = () => {
  const { 
    rutas, 
    vehiculos, 
    pedidos, 
    rutaSeleccionadaId, 
    cambiarVista, 
    reordenarParadasRuta, 
    corregirZonaParada, 
    planificarRuta 
  } = useLogistics();

  const [idRutaActiva, setIdRutaActiva] = useState<string>(() => {
    if (rutaSeleccionadaId && rutas.some(r => r.idRuta === rutaSeleccionadaId)) {
      return rutaSeleccionadaId;
    }
    return rutas[0]?.idRuta || '';
  });

  const rutaActiva = rutas.find(r => r.idRuta === idRutaActiva) || rutas[0] || null;
  const vehiculoActivo = rutaActiva ? vehiculos.find(v => v.idVehiculo === rutaActiva.idVehiculo) : null;
  const pedidoActivo = rutaActiva ? pedidos.find(p => p.idPedido === rutaActiva.idPedido) : null;

  // Modal para regularizar parada fuera de cobertura (UC-05 Alt 1)
  const [paradaAEditar, setParadaAEditar] = useState<ParadaRuta | null>(null);
  const [nuevaZona, setNuevaZona] = useState<string>(LIMITES_CORPORATIVOS.ZONAS_OFICIALES[0]);
  const [nuevaDireccion, setNuevaDireccion] = useState<string>('');

  // Reordenar paradas arriba/abajo (UC-05 Alt 2)
  const moverParada = (index: number, direccion: 'arriba' | 'abajo') => {
    if (!rutaActiva) return;
    const nuevas = [...rutaActiva.paradas];
    const targetIndex = direccion === 'arriba' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= nuevas.length) return;

    const temp = nuevas[index];
    nuevas[index] = nuevas[targetIndex];
    nuevas[targetIndex] = temp;

    reordenarParadasRuta(rutaActiva.idRuta, nuevas);
  };

  const abrirModalCorregir = (parada: ParadaRuta) => {
    setParadaAEditar(parada);
    setNuevaZona(parada.zona || LIMITES_CORPORATIVOS.ZONAS_OFICIALES[0]);
    setNuevaDireccion(parada.destino);
  };

  const guardarCorreccionZona = () => {
    if (!paradaAEditar || !rutaActiva) return;
    corregirZonaParada(rutaActiva.idRuta, paradaAEditar.idParada, nuevaZona, nuevaDireccion);
    setParadaAEditar(null);
  };

  const consolidarRuta = () => {
    if (!rutaActiva) return;
    planificarRuta(rutaActiva.idAsignacion, rutaActiva.paradas, rutaActiva.modoCalculo);
    cambiarVista('despachos');
  };

  if (!rutaActiva) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-[rgba(99,88,94,0.12)] shadow-xs animate-in fade-in-50 duration-200">
        <Route className="w-12 h-12 text-[#998da0] mx-auto mb-3" />
        <h3 className="text-base font-bold text-[#1b171a]">
          No hay hojas de ruta generadas
        </h3>
        <p className="text-xs text-[#7d737a] mt-1 max-w-sm mx-auto">
          Para planificar una ruta de entrega, primero debe formalizar la asignacion de un vehiculo a un pedido validado.
        </p>
        <button
          type="button"
          onClick={() => cambiarVista('pedidos')}
          className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-[#63585e] text-white hover:bg-[#4a4147] cursor-pointer"
        >
          Ir a Gestion de Pedidos
        </button>
      </div>
    );
  }

  const tieneFueraCobertura = rutaActiva.paradas.some(p => !p.enCobertura);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Route Switcher & Main Header */}
      <div className="bg-white p-5 rounded-2xl border border-[rgba(99,88,94,0.12)] shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7d737a]">
                Hoja de Ruta Consolidada
              </span>
              <span className="text-xs font-mono font-bold text-[#1b171a]">
                {rutaActiva.idRuta}
              </span>
              <Badge 
                variant={tieneFueraCobertura ? 'warning' : rutaActiva.modoCalculo === 'manual' ? 'slate' : 'mint'} 
                size="sm"
              >
                {rutaActiva.estadoRuta}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#1b171a]">
                {pedidoActivo?.cliente || 'Ruta de Distribucion Metropolitana'}
              </h3>
              <span className="text-xs text-[#7d737a]">
                (Asignacion: {rutaActiva.idAsignacion})
              </span>
            </div>

            <p className="text-xs text-[#7d737a] mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#63585e]" />
              <span>Origen Obligatorio: <strong>{LIMITES_CORPORATIVOS.ORIGEN_CEDI}</strong></span>
            </p>
          </div>

          {/* Quick Route Selector and Stats */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {rutas.length > 1 && (
              <div className="text-xs">
                <label className="block text-[#7d737a] text-[10px] uppercase font-mono mb-1">
                  Cambiar ruta:
                </label>
                <select
                  value={rutaActiva.idRuta}
                  onChange={(e) => setIdRutaActiva(e.target.value)}
                  className="px-3 py-1.5 bg-[#f8faf9] text-[#1b171a] font-medium border border-[rgba(99,88,94,0.18)] rounded-xl text-xs focus:outline-none focus:border-[#63585e] cursor-pointer"
                >
                  {rutas.map(r => (
                    <option key={r.idRuta} value={r.idRuta}>
                      {r.idRuta} - {r.destinos[0]?.slice(0, 20)}...
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Vehicle info card */}
            <div className="px-3.5 py-2 rounded-xl bg-[#f8faf9] border border-[rgba(99,88,94,0.1)] flex items-center gap-2.5 text-xs">
              <Truck className="w-4 h-4 text-[#63585e]" />
              <div>
                <div className="font-mono font-bold text-[#1b171a]">{vehiculoActivo?.placa || 'Placa asignada'}</div>
                <div className="text-[10px] text-[#7d737a]">{vehiculoActivo?.tipo} • {vehiculoActivo?.conductorAsignado}</div>
              </div>
            </div>

            {/* Metric pill */}
            <div className="flex items-center gap-3 px-4 py-2 bg-[#f8faf9] rounded-xl border border-[rgba(99,88,94,0.12)]">
              <div>
                <div className="text-[10px] font-mono text-[#7d737a] uppercase">Paradas</div>
                <div className="text-sm font-bold font-mono text-[#1b171a]">
                  {rutaActiva.paradas.length}
                </div>
              </div>
              <div className="w-px h-7 bg-[rgba(99,88,94,0.15)]" />
              <div>
                <div className="text-[10px] font-mono text-[#7d737a] uppercase">Recorrido</div>
                <div className="text-sm font-bold font-mono text-[#1b171a]">
                  {rutaActiva.distanciaTotalKm} km
                </div>
              </div>
              <div className="w-px h-7 bg-[rgba(99,88,94,0.15)]" />
              <div>
                <div className="text-[10px] font-mono text-[#7d737a] uppercase">Tiempo Est.</div>
                <div className="text-sm font-bold font-mono text-[#1b171a]">
                  {rutaActiva.tiempoTotalMinutos} min
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* UC-05 Camino Alternativo 1: Alerta de Destino Fuera de Cobertura */}
      {tieneFueraCobertura && (
        <div className="p-4 rounded-2xl bg-[#fdfaf3] border border-[#e8d7a7] text-[#6b4716] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[#b4781c] shrink-0" />
            <div>
              <div className="text-sm font-bold">
                Advertencia de Cobertura: Destino no coincide con zonas autorizadas
              </div>
              <div className="text-xs text-[#6b4716]/90 mt-0.5">
                Una o mas paradas estan ubicadas fuera del corredor logistico oficial de Kiramar. Regularice la zona o autorice un ajuste manual para formalizar la ruta.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode Switcher and Instructions */}
      <div className="flex items-center justify-between text-xs text-[#7d737a]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#1b171a]">Modo de Secuenciacion:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#f1f5f3] font-mono text-[11px] text-[#63585e] border border-[rgba(99,88,94,0.1)]">
            {rutaActiva.modoCalculo === 'manual' ? 'Ajuste Manual Operativo (Reordenamiento activo)' : 'Calculo Automatico WMS / GIS'}
          </span>
        </div>
        <div className="text-[11px]">
          Utilice los controles de orden para optimizar la ventana de entrega de cada cliente.
        </div>
      </div>

      {/* Stops Sequence Table (Paradas) */}
      <div className="bg-white rounded-2xl border border-[rgba(99,88,94,0.12)] shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#f8faf9] border-b border-[rgba(99,88,94,0.1)] text-[10px] font-mono uppercase tracking-wider text-[#7d737a]">
              <th className="py-3 px-4 text-center w-12">Sec.</th>
              <th className="py-3 px-4">Destino / Cliente</th>
              <th className="py-3 px-4">Zona Logistica</th>
              <th className="py-3 px-4">Ventana Horaria</th>
              <th className="py-3 px-4 text-right">Distancia</th>
              <th className="py-3 px-4 text-right">Tiempo</th>
              <th className="py-3 px-4 text-center">Cobertura</th>
              <th className="py-3 px-4 text-center">Reordenar Secuencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(99,88,94,0.08)]">
            {rutaActiva.paradas.map((parada, idx) => {
              const esPrimero = idx === 0;
              const esUltimo = idx === rutaActiva.paradas.length - 1;

              return (
                <tr 
                  key={parada.idParada}
                  className={`hover:bg-[#f8faf9] transition-colors ${
                    !parada.enCobertura ? 'bg-[#fdfaf3]' : ''
                  }`}
                >
                  {/* Sequence Order */}
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-[#1b171a]">
                    <div className="w-6 h-6 rounded-full bg-[#f1f5f3] border border-[rgba(99,88,94,0.15)] flex items-center justify-center mx-auto">
                      {parada.orden}
                    </div>
                  </td>

                  {/* Destino y Cliente */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#1b171a]">
                      {parada.cliente}
                    </div>
                    <div className="text-[11px] text-[#7d737a] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#998da0] shrink-0" />
                      <span>{parada.destino}</span>
                    </div>
                  </td>

                  {/* Zona Logistica */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#4a4147]">
                    {parada.zona}
                  </td>

                  {/* Ventana Horaria */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#1b171a]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#998da0]" />
                      {parada.ventanaHoraria}
                    </span>
                  </td>

                  {/* Distancia */}
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#1b171a]">
                    {parada.distanciaKm} km
                  </td>

                  {/* Tiempo */}
                  <td className="py-3.5 px-4 text-right font-mono text-[#7d737a]">
                    {parada.tiempoMinutos} min
                  </td>

                  {/* Cobertura Status */}
                  <td className="py-3.5 px-4 text-center">
                    {parada.enCobertura ? (
                      <Badge variant="mint" size="sm">
                        En Cobertura
                      </Badge>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <Badge variant="warning" size="sm">
                          Fuera de Zona
                        </Badge>
                        <button
                          type="button"
                          onClick={() => abrirModalCorregir(parada)}
                          className="p-1 rounded bg-white hover:bg-[#e8d7a7] text-[#6b4716] border border-[#e8d7a7] cursor-pointer"
                          title="Ajustar o regularizar zona de cobertura"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Reordering Controls (UC-05 Alt 2) */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        disabled={esPrimero}
                        onClick={() => moverParada(idx, 'arriba')}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          esPrimero
                            ? 'text-gray-300 border-gray-100 cursor-not-allowed'
                            : 'text-[#1b171a] hover:bg-[#f1f5f3] border-[rgba(99,88,94,0.15)] cursor-pointer'
                        }`}
                        title="Subir parada en la secuencia"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={esUltimo}
                        onClick={() => moverParada(idx, 'abajo')}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          esUltimo
                            ? 'text-gray-300 border-gray-100 cursor-not-allowed'
                            : 'text-[#1b171a] hover:bg-[#f1f5f3] border-[rgba(99,88,94,0.15)] cursor-pointer'
                        }`}
                        title="Bajar parada en la secuencia"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer Actions */}
        <div className="p-4 bg-[#f8faf9] border-t border-[rgba(99,88,94,0.1)] flex items-center justify-between">
          <div className="text-xs text-[#7d737a]">
            Total estimado: <strong>{rutaActiva.distanciaTotalKm} kilometros</strong> acumulados • <strong>{rutaActiva.tiempoTotalMinutos} minutos</strong> de rodamiento.
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={consolidarRuta}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#63585e] text-white hover:bg-[#4a4147] transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#c4e7d4]" />
              <span>Generar y Consolidar Hoja de Ruta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal para Regularizar Parada de Cobertura (UC-05 Alt 1) */}
      <Modal
        isOpen={!!paradaAEditar}
        onClose={() => setParadaAEditar(null)}
        title="Regularizar Zona Logistica de Parada"
        subtitle={`Destino: ${paradaAEditar?.cliente} • ${paradaAEditar?.destino}`}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setParadaAEditar(null)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[rgba(99,88,94,0.18)] text-[#1b171a] hover:bg-[#f8faf9] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={guardarCorreccionZona}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#63585e] text-white hover:bg-[#4a4147] cursor-pointer"
            >
              Guardar y Regularizar Parada
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <p className="text-[#7d737a]">
            Seleccione una de las zonas oficiales de operacion de Distribuidora Kiramar S.A.S. o actualice la direccion de entrega para normalizar la cobertura:
          </p>

          <div>
            <label className="block text-[#1b171a] font-semibold mb-1">
              Zona Oficial Kiramar:
            </label>
            <select
              value={nuevaZona}
              onChange={(e) => setNuevaZona(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8faf9] border border-[rgba(99,88,94,0.2)] rounded-lg text-xs focus:outline-none focus:border-[#63585e] cursor-pointer font-medium"
            >
              {LIMITES_CORPORATIVOS.ZONAS_OFICIALES.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#1b171a] font-semibold mb-1">
              Direccion de Parada (opcional para ajuste fino):
            </label>
            <input
              type="text"
              value={nuevaDireccion}
              onChange={(e) => setNuevaDireccion(e.target.value)}
              className="w-full px-3 py-2 bg-[#f8faf9] border border-[rgba(99,88,94,0.2)] rounded-lg text-xs focus:outline-none focus:border-[#63585e]"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
