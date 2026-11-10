import React from 'react';
import { useLogistics } from '../../context/useLogistics';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { 
  Package, 
  Truck, 
  Route, 
  Navigation, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Plus
} from 'lucide-react';

export const PipelineView: React.FC = () => {
  const { 
    pedidos, 
    vehiculos, 
    rutas, 
    despachos, 
    cambiarVista, 
    generarPedidoPrueba,
    usuarioActivo
  } = useLogistics();

  const esTransporte = usuarioActivo.perfil === 'Personal de Logistica / Transporte';

  // Conteos por estado
  const pedidosPendientes = pedidos.filter(p => p.estadoPedido === 'Pendiente');
  const pedidosConAlerta = pedidos.filter(p => p.estadoPedido === 'Requiere Datos Maestros' || p.estadoPedido === 'Excede Limites');
  const pedidosValidados = pedidos.filter(p => p.estadoPedido === 'Validado');
  const pedidosAsignados = pedidos.filter(p => p.estadoPedido === 'Asignado');

  const vehiculosDisponibles = vehiculos.filter(v => v.estadoVehiculo === 'Disponible');
  const vehiculosReservados = vehiculos.filter(v => v.estadoVehiculo === 'Reservado');
  const vehiculosEnRuta = vehiculos.filter(v => v.estadoVehiculo === 'En Ruta');

  const rutasPendientes = rutas.filter(r => r.estadoRuta === 'Planificada' || r.estadoRuta === 'Advertencia Cobertura');
  const despachosEnEjecucion = despachos.filter(d => d.estadoDespacho === 'En Ejecucion');
  const despachosCompletados = despachos.filter(d => d.estadoDespacho === 'Completado');

  // Pipeline stages
  const etapas = [
    {
      paso: '01',
      nombre: 'Recepcion y Revision',
      conteo: pedidosPendientes.length,
      descripcion: 'Pedidos pendientes por calcular volumetria',
      accion: () => cambiarVista('pedidos'),
      habilitado: !esTransporte
    },
    {
      paso: '02',
      nombre: 'Validacion de Carga',
      conteo: pedidosValidados.length + pedidosConAlerta.length,
      descripcion: `${pedidosConAlerta.length} requieren atencion tecnica`,
      accion: () => cambiarVista('pedidos'),
      alerta: pedidosConAlerta.length > 0,
      habilitado: !esTransporte
    },
    {
      paso: '03',
      nombre: 'Asignacion Vehicular',
      conteo: pedidosAsignados.length,
      descripcion: `${vehiculosDisponibles.length} unidades disponibles en flota`,
      accion: () => cambiarVista('flota'),
      habilitado: !esTransporte
    },
    {
      paso: '04',
      nombre: 'Enrutamiento y Paradas',
      conteo: rutasPendientes.length,
      descripcion: 'Secuencia programada de entregas',
      accion: () => cambiarVista('rutas'),
      habilitado: true
    },
    {
      paso: '05',
      nombre: 'Despacho y Trazabilidad',
      conteo: despachosEnEjecucion.length,
      descripcion: 'Monitoreo en tiempo real con GPS',
      accion: () => cambiarVista('despachos'),
      habilitado: true
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Top Banner and Quick Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-white via-[#f1f5f3] to-white border border-[rgba(99,88,94,0.12)] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-[#c4e7d4] text-[#174630]">
              Centro de Despachos Kiramar
            </span>
            <span className="text-xs text-[#7d737a]">
              Operacion Activa
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#1b171a]">
            Consola General de Control Logistico
          </h2>
          <p className="text-xs text-[#7d737a] mt-0.5 max-w-xl">
            Flujo coordinado entre analisis de carga cubicada, correspondencia fisica de flota, generacion de secuencias de reparto y telemetria de despachos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={generarPedidoPrueba}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white text-[#1b171a] border border-[rgba(99,88,94,0.18)] hover:bg-[#f8faf9] transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#63585e]" />
            <span>Generar Pedido de Prueba</span>
          </button>

          {!esTransporte && (
            <button
              type="button"
              onClick={() => cambiarVista('pedidos')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[#63585e] text-white hover:bg-[#4a4147] transition-all shadow-sm cursor-pointer"
            >
              <span>Gestionar Pedidos</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#c4e7d4]" />
            </button>
          )}
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pedidos Pendientes"
          value={pedidosPendientes.length + pedidosConAlerta.length + pedidosValidados.length}
          subtitle={`${pedidosConAlerta.length} con requerimiento tecnico`}
          icon={<Package className="w-4 h-4" />}
          accent="mint"
          badge={
            pedidosConAlerta.length > 0 ? (
              <Badge variant="warning" size="sm">
                {pedidosConAlerta.length} alerta
              </Badge>
            ) : (
              <Badge variant="mint" size="sm">
                Al dia
              </Badge>
            )
          }
          onClick={() => !esTransporte && cambiarVista('pedidos')}
        />

        <StatCard
          title="Flota Disponible"
          value={`${vehiculosDisponibles.length} / ${vehiculos.length}`}
          subtitle={`${vehiculosReservados.length} reservados, ${vehiculosEnRuta.length} en transito`}
          icon={<Truck className="w-4 h-4" />}
          accent="slate"
          badge={
            <Badge variant="slate" size="sm">
              {Math.round((vehiculosDisponibles.length / vehiculos.length) * 100)}% libre
            </Badge>
          }
          onClick={() => !esTransporte && cambiarVista('flota')}
        />

        <StatCard
          title="Hojas de Ruta"
          value={rutas.length}
          subtitle={`${rutasPendientes.length} programadas para reparto`}
          icon={<Route className="w-4 h-4" />}
          accent="ash"
          badge={
            <Badge variant="ash" size="sm">
              CEDI Central
            </Badge>
          }
          onClick={() => cambiarVista('rutas')}
        />

        <StatCard
          title="Despachos Activos"
          value={despachosEnEjecucion.length}
          subtitle={`${despachosCompletados.length} entregas finalizadas hoy`}
          icon={<Navigation className="w-4 h-4" />}
          accent="mint"
          badge={
            <Badge variant="mint" size="sm">
              En ejecucion
            </Badge>
          }
          onClick={() => cambiarVista('despachos')}
        />
      </div>

      {/* Visual Pipeline Funnel */}
      <div className="bg-white rounded-2xl p-6 border border-[rgba(99,88,94,0.12)] shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-[#1b171a] uppercase tracking-wider">
              Flujo Continuo de Operaciones
            </h3>
            <p className="text-xs text-[#7d737a] mt-0.5">
              Etapas del ciclo de vida logistico segun requisitos PPI-3
            </p>
          </div>
          <span className="text-xs font-mono text-[#7d737a]">
            Distribuidora Kiramar S.A.S.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {etapas.map((e, idx) => (
            <div
              key={e.paso}
              onClick={() => e.habilitado && e.accion()}
              className={`p-4 rounded-xl border transition-all duration-200 relative ${
                e.habilitado 
                  ? 'cursor-pointer hover:border-[#63585e] hover:shadow-sm hover:-translate-y-0.5' 
                  : 'opacity-50 cursor-not-allowed'
              } ${
                e.alerta 
                  ? 'bg-[#fdfaf3] border-[#e8d7a7]' 
                  : 'bg-[#f8faf9] border-[rgba(99,88,94,0.12)]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-[#7d737a]">
                  ETAPA {e.paso}
                </span>
                {e.alerta ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-[#b4781c]" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#63585e]" />
                )}
              </div>

              <div className="text-xs font-bold text-[#1b171a] mb-1">
                {e.nombre}
              </div>

              <div className="text-xl font-bold font-mono text-[#1b171a] mb-1">
                {e.conteo}
              </div>

              <p className="text-[11px] text-[#7d737a] line-clamp-2">
                {e.descripcion}
              </p>

              {idx < etapas.length - 1 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 rounded-full bg-white border border-[rgba(99,88,94,0.2)] text-[10px] flex items-center justify-center text-[#7d737a]">
                  ›
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Operational Highlights Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Attention Orders */}
        <div className="bg-white rounded-2xl p-6 border border-[rgba(99,88,94,0.12)] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-[#1b171a]">
                Pedidos que Requieren Gestion Inmediata
              </h4>
              <p className="text-xs text-[#7d737a] mt-0.5">
                Inconsistencias tecnicas o superacion de volumen empresarial
              </p>
            </div>
            {!esTransporte && (
              <button
                type="button"
                onClick={() => cambiarVista('pedidos')}
                className="text-xs text-[#63585e] hover:underline font-semibold cursor-pointer"
              >
                Ver todos
              </button>
            )}
          </div>

          <div className="space-y-3">
            {pedidosConAlerta.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#7d737a]">
                Todos los pedidos analizados cuentan con datos maestros completos y estan dentro de los limites.
              </div>
            ) : (
              pedidosConAlerta.map(p => (
                <div
                  key={p.idPedido}
                  className="p-3.5 rounded-xl border border-[rgba(99,88,94,0.1)] bg-[#f8faf9] flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-[#1b171a]">
                        {p.idPedido}
                      </span>
                      {p.estadoPedido === 'Requiere Datos Maestros' ? (
                        <Badge variant="warning" size="sm">
                          Faltan Datos Maestros
                        </Badge>
                      ) : (
                        <Badge variant="error" size="sm">
                          Excede Limite Corporativo
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-[#1b171a] font-medium truncate max-w-sm">
                      {p.cliente}
                    </div>
                    <div className="text-[11px] text-[#7d737a] mt-0.5">
                      {p.destino}
                    </div>
                  </div>

                  {!esTransporte && (
                    <button
                      type="button"
                      onClick={() => cambiarVista('pedidos', { pedidoId: p.idPedido })}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-[rgba(99,88,94,0.15)] text-[#1b171a] hover:bg-[#f1f5f3] transition-colors cursor-pointer shrink-0"
                    >
                      Resolver
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Dispatch Tracker Card */}
        <div className="bg-white rounded-2xl p-6 border border-[rgba(99,88,94,0.12)] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-[#1b171a]">
                Despachos en Circulacion Telemetrica
              </h4>
              <p className="text-xs text-[#7d737a] mt-0.5">
                Seguimiento en ruta con transmision satelital activa
              </p>
            </div>
            <button
              type="button"
              onClick={() => cambiarVista('despachos')}
              className="text-xs text-[#63585e] hover:underline font-semibold cursor-pointer"
            >
              Abrir consola
            </button>
          </div>

          <div className="space-y-3">
            {despachosEnEjecucion.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#7d737a]">
                No hay unidades vehiculares en ruta en este momento.
              </div>
            ) : (
              despachosEnEjecucion.map(d => {
                const vehiculo = vehiculos.find(v => v.idVehiculo === d.idVehiculo);
                return (
                  <div
                    key={d.idDespacho}
                    className="p-3.5 rounded-xl border border-[rgba(99,88,94,0.1)] bg-[#f8faf9]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#1b171a]">
                          {d.idDespacho}
                        </span>
                        <span className="text-xs text-[#7d737a]">
                          Placa: {vehiculo?.placa}
                        </span>
                      </div>
                      <Badge variant="mint" size="sm">
                        {d.porcentajeAvance}% completado
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#c4dacf]/40 h-2 rounded-full overflow-hidden mb-2">
                      <div
                        className="bg-[#1e6b45] h-full rounded-full transition-all duration-500"
                        style={{ width: `${d.porcentajeAvance}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#7d737a]">
                      <span>Ultima ubicacion: {d.ubicacionActual}</span>
                      <span className="font-mono">{d.horaUltimoReporteGps}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
