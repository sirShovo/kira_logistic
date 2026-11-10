import React from 'react';
import { useLogistics } from '../../context/useLogistics';
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  X,
  Package,
  Truck,
  Send
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const { 
    vistaActiva, 
    servidorConectado, 
    toggleServidorConectado,
    usuarioActivo,
    pedidos,
    vehiculos,
    despachos,
    alertaGlobal,
    limpiarAlerta
  } = useLogistics();

  const titulosVista: Record<string, { titulo: string; descripcion: string }> = {
    pipeline: {
      titulo: 'Tablero de Operaciones',
      descripcion: 'Monitoreo de flujo continuo de recepcion, cubicaje, reserva y transito'
    },
    pedidos: {
      titulo: 'Gestion de Pedidos y Analisis de Carga',
      descripcion: 'Consolidacion de volumetria, resolucion de datos maestros y particion'
    },
    flota: {
      titulo: 'Parque Automotor y Reserva Inteligente',
      descripcion: 'Evaluacion de compatibilidad fisica, volumen util y formalizacion'
    },
    rutas: {
      titulo: 'Planificacion y Secuenciacion de Rutas',
      descripcion: 'Hojas de ruta, paradas por ventana horaria y control de cobertura'
    },
    despachos: {
      titulo: 'Consola de Monitoreo y Trazabilidad',
      descripcion: 'Control telematico satelital, registro de novedades y certificacion'
    },
    admin: {
      titulo: 'Auditoria de Integridad y Copias de Seguridad',
      descripcion: 'Gobierno de datos, diagnostico de relaciones y gestion de respaldos JSON'
    }
  };

  const actual = titulosVista[vistaActiva] || titulosVista.pipeline;

  // Calculos para el resumen estadistico
  const cantPendientes = pedidos.filter(p => p.estadoPedido === 'Pendiente' || p.estadoPedido === 'Validado' || p.estadoPedido === 'Requiere Datos Maestros' || p.estadoPedido === 'Excede Limites').length;
  const cantFlotaActiva = vehiculos.filter(v => v.estadoVehiculo === 'Reservado' || v.estadoVehiculo === 'En Ruta').length;
  const cantDespachosEnRuta = despachos.filter(d => d.estadoDespacho === 'En Ejecucion').length;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[rgba(99,88,94,0.12)]">
      {/* Alert banner if active */}
      {alertaGlobal && (
        <div 
          className={`px-6 py-2.5 flex items-center justify-between text-xs font-medium transition-colors ${
            alertaGlobal.tipo === 'success' ? 'bg-[#c4e7d4]/40 text-[#174630] border-b border-[#c4e7d4]' :
            alertaGlobal.tipo === 'error' ? 'bg-[#f8d7da] text-[#781c2d] border-b border-[#f1b0b7]' :
            alertaGlobal.tipo === 'warning' ? 'bg-[#f4ebd0] text-[#6b4716] border-b border-[#e8d7a7]' :
            'bg-[#b9c0da]/30 text-[#242e4c] border-b border-[#b9c0da]'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertaGlobal.tipo === 'success' && <CheckCircle2 className="w-4 h-4 text-[#1e6b45] shrink-0" />}
            {alertaGlobal.tipo === 'error' && <AlertTriangle className="w-4 h-4 text-[#b02a37] shrink-0" />}
            {alertaGlobal.tipo === 'warning' && <AlertTriangle className="w-4 h-4 text-[#b4781c] shrink-0" />}
            {alertaGlobal.tipo === 'info' && <Info className="w-4 h-4 text-[#3b4c7e] shrink-0" />}
            <span>{alertaGlobal.mensaje}</span>
          </div>
          <button 
            type="button"
            onClick={limpiarAlerta}
            className="p-1 hover:bg-black/5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Top Bar */}
      <div className="px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: View Title and Subtitle */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#7d737a] uppercase tracking-wider">
              CRM Kiramar
            </span>
            <span className="text-[#998da0]">•</span>
            <span className="text-xs font-semibold text-[#63585e]">
              {actual.titulo}
            </span>
          </div>
          <p className="text-xs text-[#7d737a] mt-0.5">
            {actual.descripcion}
          </p>
        </div>

        {/* Right Controls: WMS Switcher, KPI Chips & Active Profile */}
        <div className="flex items-center gap-4">
          {/* Quick Metrics Bar */}
          <div className="hidden lg:flex items-center gap-3 pr-4 border-r border-[rgba(99,88,94,0.15)]">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f1f5f3] border border-[rgba(99,88,94,0.08)]">
              <Package className="w-3.5 h-3.5 text-[#63585e]" />
              <span className="text-xs font-mono font-semibold text-[#1b171a]">{cantPendientes}</span>
              <span className="text-[11px] text-[#7d737a]">Pendientes</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f1f5f3] border border-[rgba(99,88,94,0.08)]">
              <Truck className="w-3.5 h-3.5 text-[#63585e]" />
              <span className="text-xs font-mono font-semibold text-[#1b171a]">{cantFlotaActiva}</span>
              <span className="text-[11px] text-[#7d737a]">Flota Activa</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f1f5f3] border border-[rgba(99,88,94,0.08)]">
              <Send className="w-3.5 h-3.5 text-[#63585e]" />
              <span className="text-xs font-mono font-semibold text-[#1b171a]">{cantDespachosEnRuta}</span>
              <span className="text-[11px] text-[#7d737a]">En Transito</span>
            </div>
          </div>

          {/* WMS Connectivity Toggle Button (RNF-03) */}
          <button
            type="button"
            onClick={toggleServidorConectado}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              servidorConectado
                ? 'bg-[#c4e7d4]/30 text-[#174630] border-[#c4e7d4] hover:bg-[#c4e7d4]/50'
                : 'bg-[#f8d7da] text-[#781c2d] border-[#f1b0b7] hover:bg-[#f8d7da]/80'
            }`}
            title="Haga clic para simular desconexion o reconexion con la Base de Datos central del WMS"
          >
            {servidorConectado ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-[#1e6b45]" />
                <span>WMS: Enlace Conectado</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-[#b02a37]" />
                <span>WMS: Desconectado</span>
              </>
            )}
          </button>

          {/* Active Role Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f8faf9] border border-[rgba(99,88,94,0.12)]">
            <span className="w-2 h-2 rounded-full bg-[#c4e7d4] shrink-0" />
            <div className="text-left">
              <div className="text-xs font-medium text-[#1b171a] leading-none">
                {usuarioActivo.nombre}
              </div>
              <div className="text-[10px] text-[#7d737a] leading-tight mt-0.5">
                {usuarioActivo.perfil.replace('Personal de Logistica / ', '')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
