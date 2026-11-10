import React from 'react';
import { useLogistics } from '../../context/useLogistics';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  Route, 
  Navigation, 
  ShieldCheck, 
  RotateCcw
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    vistaActiva, 
    cambiarVista, 
    usuarioActivo, 
    cambiarUsuarioActivo, 
    usuarios,
    pedidos,
    vehiculos,
    despachos,
    restablecerDatosDemostracion 
  } = useLogistics();

  const pedidosPendientes = pedidos.filter(p => p.estadoPedido === 'Pendiente' || p.estadoPedido === 'Validado' || p.estadoPedido === 'Requiere Datos Maestros' || p.estadoPedido === 'Excede Limites').length;
  const vehiculosDisponibles = vehiculos.filter(v => v.estadoVehiculo === 'Disponible').length;
  const despachosEnRuta = despachos.filter(d => d.estadoDespacho === 'En Ejecucion').length;

  const esTransporte = usuarioActivo.perfil === 'Personal de Logistica / Transporte';

  const navItems = [
    {
      id: 'pipeline',
      label: 'Tablero General',
      icon: LayoutDashboard,
      badge: null,
      permitido: true
    },
    {
      id: 'pedidos',
      label: 'Pedidos y Carga',
      icon: Package,
      badge: pedidosPendientes > 0 ? pedidosPendientes : null,
      permitido: !esTransporte
    },
    {
      id: 'flota',
      label: 'Flota y Reservas',
      icon: Truck,
      badge: vehiculosDisponibles > 0 ? vehiculosDisponibles : null,
      permitido: !esTransporte
    },
    {
      id: 'rutas',
      label: 'Planificacion Rutas',
      icon: Route,
      badge: null,
      permitido: true
    },
    {
      id: 'despachos',
      label: 'Monitoreo en Ruta',
      icon: Navigation,
      badge: despachosEnRuta > 0 ? `${despachosEnRuta} en transito` : null,
      permitido: true
    },
    {
      id: 'admin',
      label: 'Auditoria y Respaldos',
      icon: ShieldCheck,
      badge: 'Admin',
      permitido: true
    }
  ];

  return (
    <aside className="w-68 bg-[#181417] text-[#f1f5f3] flex flex-col shrink-0 border-r border-[#2e252c] min-h-screen select-none">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-[#2e252c]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c4e7d4] via-[#b9c0da] to-[#63585e] flex items-center justify-center font-bold text-[#181417] text-base shadow-sm">
            K
          </div>
          <div>
            <div className="font-bold tracking-tight text-white text-sm flex items-center gap-1.5">
              <span>KIRA LOGISTIC</span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 bg-[#2e252c] text-[#c4e7d4] rounded">
                CRM
              </span>
            </div>
            <div className="text-[11px] text-[#998da0] truncate max-w-[155px]">
              Distribuidora Kiramar S.A.S.
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#998da0]">
          Modulos Operativos
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const activo = vistaActiva === item.id;
          const deshabilitado = !item.permitido;

          return (
            <button
              key={item.id}
              type="button"
              disabled={deshabilitado}
              onClick={() => cambiarVista(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                deshabilitado
                  ? 'opacity-40 cursor-not-allowed text-[#7d737a]'
                  : activo
                  ? 'bg-[#2e252c] text-white shadow-xs font-semibold'
                  : 'text-[#c4dacf] hover:bg-[#221c21] hover:text-white cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    activo ? 'text-[#c4e7d4]' : 'text-[#998da0]'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    item.id === 'admin'
                      ? 'bg-[#63585e]/40 text-[#c4dacf]'
                      : activo
                      ? 'bg-[#c4e7d4] text-[#181417] font-semibold'
                      : 'bg-[#221c21] text-[#c4e7d4]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Demo reset button */}
        <div className="pt-4 mt-4 border-t border-[#2e252c] px-3">
          <button
            type="button"
            onClick={restablecerDatosDemostracion}
            className="w-full flex items-center gap-2 px-2.5 py-2 text-[11px] text-[#998da0] hover:text-[#c4e7d4] hover:bg-[#221c21] rounded-lg transition-colors cursor-pointer"
            title="Reiniciar todos los datos a la demostracion inicial"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Restablecer Datos Demo</span>
          </button>
        </div>
      </div>

      {/* User Session Footer */}
      <div className="p-3 border-t border-[#2e252c] bg-[#1d181c]">
        <div className="p-3 rounded-xl bg-[#221c21] border border-[#2e252c]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#998da0]">
              Usuario Activo
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2e252c] text-[#c4e7d4] font-mono">
              {usuarioActivo.idUsuario}
            </span>
          </div>

          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#63585e] text-[#c4e7d4] flex items-center justify-center font-bold text-xs shrink-0">
              {usuarioActivo.nombre.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-white truncate">
                {usuarioActivo.nombre}
              </div>
              <div className="text-[11px] text-[#998da0] truncate">
                {usuarioActivo.cargo}
              </div>
            </div>
          </div>

          {/* Quick profile switch selector */}
          <div className="pt-2 border-t border-[#2e252c]/80">
            <label className="text-[10px] text-[#998da0] block mb-1">
              Conmutar perfil para pruebas:
            </label>
            <select
              value={usuarioActivo.idUsuario}
              onChange={(e) => cambiarUsuarioActivo(e.target.value)}
              className="w-full bg-[#181417] text-white border border-[#2e252c] rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-[#c4e7d4] cursor-pointer"
            >
              {usuarios.map(u => (
                <option key={u.idUsuario} value={u.idUsuario}>
                  {u.nombre} - {u.perfil.replace('Personal de Logistica / ', '')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
};
