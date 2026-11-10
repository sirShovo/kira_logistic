import React, { useState } from 'react';
import { useLogistics } from '../../context/useLogistics';
import type { Pedido, LineaPedido } from '../../types/domain';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { LIMITES_CORPORATIVOS } from '../../utils/logisticsEngine';
import { 
  Search, 
  RotateCcw, 
  Plus, 
  Scale, 
  Truck, 
  AlertTriangle, 
  WifiOff, 
  Layers, 
  SlidersHorizontal,
  Split,
  Edit3
} from 'lucide-react';

export const PedidosView: React.FC = () => {
  const { 
    pedidos, 
    lineasPedido, 
    servidorConectado, 
    toggleServidorConectado, 
    pedidoSeleccionadoId, 
    cambiarVista, 
    actualizarDatosMaestros, 
    dividirPedidoExcedido, 
    generarPedidoPrueba,
    usuarioActivo
  } = useLogistics();

  const esTransporte = usuarioActivo.perfil === 'Personal de Logistica / Transporte';

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('Todos');
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(() => {
    if (pedidoSeleccionadoId) {
      return pedidos.find(p => p.idPedido === pedidoSeleccionadoId) || null;
    }
    return null;
  });

  // Modal para completar datos maestros
  const [lineaAEditar, setLineaAEditar] = useState<LineaPedido | null>(null);
  const [editPeso, setEditPeso] = useState<number>(0);
  const [editAlto, setEditAlto] = useState<number>(0);
  const [editAncho, setEditAncho] = useState<number>(0);
  const [editLargo, setEditLargo] = useState<number>(0);

  // Filtrado reactivo de pedidos
  const pedidosFiltrados = pedidos.filter(p => {
    const coincideBusqueda = 
      p.idPedido.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.destino.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.zonasEntrega.some(z => z.toLowerCase().includes(busqueda.toLowerCase()));

    const coincideEstado = filtroEstado === 'Todos' || p.estadoPedido === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  const abrirDetalle = (pedido: Pedido) => {
    setPedidoDetalle(pedido);
  };

  const cerrarDetalle = () => {
    setPedidoDetalle(null);
  };

  const abrirModalEditarDatos = (linea: LineaPedido) => {
    setLineaAEditar(linea);
    setEditPeso(linea.pesoUnitario || 1.5);
    setEditAlto(linea.alto || 0.25);
    setEditAncho(linea.ancho || 0.25);
    setEditLargo(linea.largo || 0.35);
  };

  const guardarDatosMaestros = () => {
    if (!lineaAEditar) return;
    actualizarDatosMaestros(lineaAEditar.idLinea, editPeso, editAlto, editAncho, editLargo);
    setLineaAEditar(null);
    // Actualizar pedido en detalle
    const pActualizado = pedidos.find(p => p.idPedido === lineaAEditar.idPedido);
    if (pActualizado) setPedidoDetalle(pActualizado);
  };

  const ejecutarDivision = (idPedido: string) => {
    dividirPedidoExcedido(idPedido);
    setPedidoDetalle(null);
  };

  const lineasDelPedido = pedidoDetalle 
    ? lineasPedido.filter(l => l.idPedido === pedidoDetalle.idPedido)
    : [];

  const getBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'Validado': return 'success';
      case 'Pendiente': return 'slate';
      case 'Requiere Datos Maestros': return 'warning';
      case 'Excede Limites': return 'error';
      case 'Asignado': return 'mint';
      case 'En Ruta': return 'info';
      case 'Completado': return 'ash';
      case 'Devolucion': return 'error';
      case 'Reprogramado': return 'warning';
      default: return 'ash';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* UC-01 Camino Alternativo 2: Alerta de Fallo de Conexion WMS */}
      {!servidorConectado && (
        <div className="p-4 rounded-2xl bg-[#f8d7da] border border-[#f1b0b7] text-[#781c2d] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#781c2d] text-white">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight">
                Error de enlace con la base de datos central del WMS
              </div>
              <div className="text-xs text-[#781c2d]/80 mt-0.5">
                No es posible consultar ni actualizar la informacion de pedidos en este momento debido a la desconexion de red.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleServidorConectado}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#781c2d] text-white hover:bg-[#5e1523] transition-colors shrink-0 cursor-pointer"
          >
            Reintentar Conexion
          </button>
        </div>
      )}

      {/* Control Header & Filters */}
      <div className="bg-white p-5 rounded-2xl border border-[rgba(99,88,94,0.12)] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-[#7d737a] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              disabled={!servidorConectado}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por ID, cliente, destino o zona..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#f8faf9] text-[#1b171a] rounded-xl border border-[rgba(99,88,94,0.15)] focus:outline-none focus:border-[#63585e] transition-colors disabled:opacity-50"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              disabled={!servidorConectado}
              onClick={() => { setBusqueda(''); setFiltroEstado('Todos'); }}
              className="px-3 py-2 text-xs font-medium text-[#7d737a] hover:text-[#1b171a] bg-[#f8faf9] hover:bg-[#f1f5f3] rounded-xl border border-[rgba(99,88,94,0.12)] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Restablecer filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>

            <button
              type="button"
              disabled={!servidorConectado}
              onClick={generarPedidoPrueba}
              className="px-3.5 py-2 text-xs font-semibold text-[#1b171a] bg-white hover:bg-[#f8faf9] rounded-xl border border-[rgba(99,88,94,0.18)] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5 text-[#63585e]" />
              <span>Generar Pedido Prueba</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-[rgba(99,88,94,0.08)]">
          <span className="text-[11px] font-mono text-[#7d737a] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            Estado:
          </span>
          {[
            'Todos', 
            'Pendiente', 
            'Validado', 
            'Requiere Datos Maestros', 
            'Excede Limites', 
            'Asignado'
          ].map(estado => {
            const activo = filtroEstado === estado;
            return (
              <button
                key={estado}
                type="button"
                disabled={!servidorConectado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 ${
                  activo
                    ? 'bg-[#63585e] text-white shadow-xs font-semibold'
                    : 'bg-[#f1f5f3] text-[#4a4147] hover:bg-[#e4ece7]'
                }`}
              >
                {estado}
              </button>
            );
          })}
        </div>
      </div>

      {/* UC-01 Camino Alternativo 1: Sin pedidos pendientes de despacho */}
      {pedidosFiltrados.length === 0 && servidorConectado && (
        <div className="bg-white rounded-2xl p-12 text-center border border-[rgba(99,88,94,0.12)] shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#f1f5f3] text-[#63585e] flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#1b171a]">
            Sin pedidos pendientes de despacho
          </h3>
          <p className="text-xs text-[#7d737a] mt-1 max-w-sm mx-auto">
            No se registran solicitudes de entrega que coincidan con el estado seleccionado o termino de busqueda.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => { setBusqueda(''); setFiltroEstado('Todos'); }}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#63585e] text-white hover:bg-[#4a4147] transition-colors cursor-pointer"
            >
              Restablecer Filtros de Busqueda
            </button>
            <button
              type="button"
              onClick={generarPedidoPrueba}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-[rgba(99,88,94,0.18)] text-[#1b171a] hover:bg-[#f8faf9] transition-colors cursor-pointer"
            >
              Crear Nuevo Pedido de Prueba
            </button>
          </div>
        </div>
      )}

      {/* Orders Table (RF-01) */}
      {pedidosFiltrados.length > 0 && (
        <div className={`bg-white rounded-2xl border border-[rgba(99,88,94,0.12)] shadow-xs overflow-hidden ${
          !servidorConectado ? 'opacity-40 pointer-events-none' : ''
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8faf9] border-b border-[rgba(99,88,94,0.12)] text-[11px] font-mono uppercase tracking-wider text-[#7d737a]">
                  <th className="py-3 px-4">Pedido ID</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Cliente / Razon Social</th>
                  <th className="py-3 px-4">Destino y Zona Logistica</th>
                  <th className="py-3 px-4">Carga Consolidada</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones Operativas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(99,88,94,0.08)] text-xs">
                {pedidosFiltrados.map(pedido => {
                  const tieneCarga = !!pedido.carga;
                  const pesoKg = pedido.carga?.pesoTotalKg ?? 0;
                  const volumenM3 = pedido.carga?.volumenTotalM3 ?? 0;
                  const estaValidado = pedido.estadoPedido === 'Validado';

                  return (
                    <tr 
                      key={pedido.idPedido}
                      className="hover:bg-[#f8faf9]/80 transition-colors"
                    >
                      {/* ID Pedido */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1b171a]">
                        {pedido.idPedido}
                      </td>

                      {/* Fecha */}
                      <td className="py-3.5 px-4 text-[#7d737a] font-mono">
                        {pedido.fechaPedido}
                      </td>

                      {/* Cliente */}
                      <td className="py-3.5 px-4 font-medium text-[#1b171a] max-w-[200px] truncate">
                        {pedido.cliente}
                      </td>

                      {/* Destino y Zonas */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="font-medium text-[#1b171a] truncate">
                          {pedido.destino}
                        </div>
                        <div className="text-[11px] text-[#7d737a] truncate mt-0.5">
                          {pedido.zonasEntrega.join(', ')}
                        </div>
                      </td>

                      {/* Carga */}
                      <td className="py-3.5 px-4 font-mono">
                        {tieneCarga ? (
                          <div>
                            <span className="font-semibold text-[#1b171a]">{pesoKg.toLocaleString()} kg</span>
                            <span className="text-[#998da0] mx-1">|</span>
                            <span className="text-[#7d737a]">{volumenM3} m³</span>
                          </div>
                        ) : (
                          <span className="text-[#998da0] italic">Sin calcular</span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4">
                        <Badge variant={getBadgeVariant(pedido.estadoPedido)} size="sm">
                          {pedido.estadoPedido}
                        </Badge>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => abrirDetalle(pedido)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#f1f5f3] hover:bg-[#e4ece7] text-[#1b171a] border border-[rgba(99,88,94,0.12)] transition-colors flex items-center gap-1 cursor-pointer"
                            title="Analizar volumetria y lineas de pedido (UC-02)"
                          >
                            <Scale className="w-3.5 h-3.5 text-[#63585e]" />
                            <span>Analizar Carga</span>
                          </button>

                          {!esTransporte && (
                            <button
                              type="button"
                              disabled={!estaValidado}
                              onClick={() => cambiarVista('flota', { pedidoId: pedido.idPedido })}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                                estaValidado
                                  ? 'bg-[#63585e] hover:bg-[#4a4147] text-white shadow-xs cursor-pointer'
                                  : 'bg-[#f1f5f3] text-[#a89fa5] cursor-not-allowed border border-transparent'
                              }`}
                              title={estaValidado ? 'Asignar a un vehiculo de la flota (UC-03)' : 'Requiere estado Validado para asignar'}
                            >
                              <Truck className="w-3.5 h-3.5 text-[#c4e7d4]" />
                              <span>Asignar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal / Slide-over: Detalle de Carga y Lineas de Pedido (UC-02) */}
      <Modal
        isOpen={!!pedidoDetalle}
        onClose={cerrarDetalle}
        title={`Analisis de Carga: ${pedidoDetalle?.idPedido || ''}`}
        subtitle={`Cliente: ${pedidoDetalle?.cliente || ''} • ${pedidoDetalle?.destino || ''}`}
        maxWidth="2xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-[#7d737a]">
              Limite Corporativo Kiramar: <strong>{LIMITES_CORPORATIVOS.PESO_MAX_KG} kg</strong> / <strong>{LIMITES_CORPORATIVOS.VOLUMEN_MAX_M3} m³</strong>
            </div>

            <div className="flex items-center gap-2">
              {pedidoDetalle?.estadoPedido === 'Excede Limites' && (
                <button
                  type="button"
                  onClick={() => ejecutarDivision(pedidoDetalle.idPedido)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#642232] text-white hover:bg-[#4d1926] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Split className="w-3.5 h-3.5" />
                  <span>Dividir Pedido en Sub-Despachos</span>
                </button>
              )}

              {pedidoDetalle?.estadoPedido === 'Validado' && !esTransporte && (
                <button
                  type="button"
                  onClick={() => {
                    const pid = pedidoDetalle.idPedido;
                    cerrarDetalle();
                    cambiarVista('flota', { pedidoId: pid });
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#63585e] text-white hover:bg-[#4a4147] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Truck className="w-3.5 h-3.5 text-[#c4e7d4]" />
                  <span>Proceder a Asignar Vehiculo</span>
                </button>
              )}

              <button
                type="button"
                onClick={cerrarDetalle}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[rgba(99,88,94,0.18)] text-[#1b171a] hover:bg-[#f8faf9] cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        }
      >
        {pedidoDetalle && (
          <div className="space-y-6">
            {/* UC-02 Camino Alternativo 1 Banner */}
            {pedidoDetalle.estadoPedido === 'Requiere Datos Maestros' && (
              <div className="p-4 rounded-xl bg-[#fdfaf3] border border-[#e8d7a7] text-[#6b4716] flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#b4781c] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold">Advertencia de Datos Maestros Incompletos</div>
                  <div className="mt-0.5 text-[#6b4716]/90">
                    El pedido contiene articulos con peso unitario o dimensiones registradas en cero. Para completar la consolidacion de carga, ingrese los valores tecnicos en las lineas marcadas.
                  </div>
                </div>
              </div>
            )}

            {/* UC-02 Camino Alternativo 2 Banner */}
            {pedidoDetalle.estadoPedido === 'Excede Limites' && (
              <div className="p-4 rounded-xl bg-[#f8d7da] border border-[#f1b0b7] text-[#781c2d] flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#b02a37] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold">Alerta de Politica de Despacho (Exceso de Limites)</div>
                  <div className="mt-0.5 text-[#781c2d]/90">
                    La carga consolidada supera los limites maximos admisibles para un unico transporte por politica de Distribuidora Kiramar S.A.S. (8,500 kg o 38.0 m³). Se requiere particionar el pedido en sub-despachos balanceados.
                  </div>
                </div>
              </div>
            )}

            {/* Consolidated Load Summary Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#f8faf9] border border-[rgba(99,88,94,0.12)]">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#7d737a]">
                  Peso Total Acumulado
                </div>
                <div className="text-lg font-bold font-mono text-[#1b171a] mt-0.5">
                  {pedidoDetalle.carga?.pesoTotalKg.toLocaleString() || 0} kg
                </div>
                <div className="text-[10px] text-[#7d737a]">
                  Max: 8,500 kg
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#7d737a]">
                  Volumen Total Cubico
                </div>
                <div className="text-lg font-bold font-mono text-[#1b171a] mt-0.5">
                  {pedidoDetalle.carga?.volumenTotalM3 || 0} m³
                </div>
                <div className="text-[10px] text-[#7d737a]">
                  Max: 38.0 m³
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#7d737a]">
                  Dimension Maxima
                </div>
                <div className="text-xs font-mono font-semibold text-[#1b171a] mt-1.5">
                  {pedidoDetalle.carga?.dimMaxAlto || 0}m (Al) x {pedidoDetalle.carga?.dimMaxAncho || 0}m (An) x {pedidoDetalle.carga?.dimMaxLargo || 0}m (L)
                </div>
                <div className="text-[10px] text-[#7d737a]">
                  Gálibo de bulto individual
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#7d737a]">
                  Evaluacion Tecnica
                </div>
                <div className="mt-1">
                  <Badge variant={getBadgeVariant(pedidoDetalle.estadoPedido)} size="sm">
                    {pedidoDetalle.estadoPedido}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-[#1b171a] uppercase tracking-wider">
                  Desglose de Lineas de Pedido ({lineasDelPedido.length} referencias)
                </h4>
                <span className="text-[11px] text-[#7d737a]">
                  Unidades, peso y cubicaje unitario
                </span>
              </div>

              <div className="border border-[rgba(99,88,94,0.12)] rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f8faf9] border-b border-[rgba(99,88,94,0.1)] text-[10px] font-mono uppercase tracking-wider text-[#7d737a]">
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Descripcion</th>
                      <th className="py-2.5 px-3 text-right">Cant.</th>
                      <th className="py-2.5 px-3 text-right">Peso Un.</th>
                      <th className="py-2.5 px-3 text-right">Dimensiones (Al x An x L)</th>
                      <th className="py-2.5 px-3 text-right">Peso Total</th>
                      <th className="py-2.5 px-3 text-right">Volumen</th>
                      <th className="py-2.5 px-3 text-center">Accion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(99,88,94,0.08)]">
                    {lineasDelPedido.map(linea => {
                      const datosIncompletos = linea.pesoUnitario <= 0 || linea.alto <= 0 || linea.ancho <= 0 || linea.largo <= 0;
                      const pesoLinea = linea.cantidad * (linea.pesoUnitario || 0);
                      const volLinea = linea.cantidad * (linea.alto || 0) * (linea.ancho || 0) * (linea.largo || 0);

                      return (
                        <tr 
                          key={linea.idLinea}
                          className={datosIncompletos ? 'bg-[#fdfaf3]' : 'hover:bg-[#f8faf9]'}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-[#1b171a]">
                            {linea.idProducto}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-[#1b171a]">
                            {linea.nombreProducto}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold">
                            {linea.cantidad}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            {linea.pesoUnitario > 0 ? (
                              `${linea.pesoUnitario} kg`
                            ) : (
                              <span className="text-[#b4781c] font-bold">Falta peso</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-[11px]">
                            {!datosIncompletos ? (
                              `${linea.alto}m x ${linea.ancho}m x ${linea.largo}m`
                            ) : (
                              <span className="text-[#b4781c] font-bold">Faltan dims</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-[#1b171a]">
                            {pesoLinea > 0 ? `${pesoLinea.toLocaleString()} kg` : '0 kg'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-[#7d737a]">
                            {volLinea > 0 ? `${volLinea.toFixed(3)} m³` : '0 m³'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => abrirModalEditarDatos(linea)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                datosIncompletos 
                                  ? 'bg-[#b4781c] text-white hover:bg-[#8f5e14] border-[#8f5e14]' 
                                  : 'bg-white text-[#7d737a] hover:text-[#1b171a] border-[rgba(99,88,94,0.15)]'
                              }`}
                              title="Completar o editar datos maestros del SKU"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal para Editar Datos Maestros de Producto (UC-02 Alt 1) */}
      <Modal
        isOpen={!!lineaAEditar}
        onClose={() => setLineaAEditar(null)}
        title="Completar Datos Maestros de Producto"
        subtitle={`SKU: ${lineaAEditar?.idProducto} • ${lineaAEditar?.nombreProducto}`}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setLineaAEditar(null)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[rgba(99,88,94,0.18)] text-[#1b171a] hover:bg-[#f8faf9] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={guardarDatosMaestros}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#63585e] text-white hover:bg-[#4a4147] transition-colors cursor-pointer"
            >
              Guardar y Recalcular Carga
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-[#7d737a]">
            Ingrese las especificaciones metricas del articulo en unidades individuales para permitir el analisis cubico:
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[#1b171a] font-semibold mb-1">
                Peso Unitario (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={editPeso}
                onChange={(e) => setEditPeso(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#f8faf9] border border-[rgba(99,88,94,0.2)] rounded-lg text-xs font-mono focus:outline-none focus:border-[#63585e]"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[#1b171a] font-semibold mb-1">
                  Alto (metros)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  value={editAlto}
                  onChange={(e) => setEditAlto(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#f8faf9] border border-[rgba(99,88,94,0.2)] rounded-lg text-xs font-mono focus:outline-none focus:border-[#63585e]"
                />
              </div>

              <div>
                <label className="block text-[#1b171a] font-semibold mb-1">
                  Ancho (metros)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  value={editAncho}
                  onChange={(e) => setEditAncho(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#f8faf9] border border-[rgba(99,88,94,0.2)] rounded-lg text-xs font-mono focus:outline-none focus:border-[#63585e]"
                />
              </div>

              <div>
                <label className="block text-[#1b171a] font-semibold mb-1">
                  Largo (metros)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  value={editLargo}
                  onChange={(e) => setEditLargo(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#f8faf9] border border-[rgba(99,88,94,0.2)] rounded-lg text-xs font-mono focus:outline-none focus:border-[#63585e]"
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
