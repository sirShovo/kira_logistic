import type React from 'react';
import {
  Activity,
  Box,
  Database,
  LayoutGrid,
  Menu,
  Package,
  RefreshCw,
  Route,
  ShieldCheck,
  Truck,
  Users,
  X,
} from 'lucide-react';
import type { Pedido, Usuario } from '../types/domain';

export type ModuloActivo =
  | 'resumen'
  | 'pedidos'
  | 'cubicaje'
  | 'flota'
  | 'rutas'
  | 'trazabilidad'
  | 'clientes'
  | 'seguridad';

interface SidebarGroup {
  groupTitle: string;
  items: {
    id: ModuloActivo;
    label: string;
    code: string;
    badge?: number;
    badgeAlert?: boolean;
    icon: React.ReactNode;
  }[];
}

interface CrmSidebarProps {
  moduloActivo: ModuloActivo;
  setModuloActivo: (m: ModuloActivo) => void;
  usuarioActual: Usuario;
  usuarios: Usuario[];
  onCambiarUsuario: (u: Usuario) => void;
  wmsConectado: boolean;
  onToggleWms: () => void;
  counts: {
    pedidosPendientes: number;
    alertasCarga: number;
    vehiculosLibres: number;
    rutasActivas: number;
    despachosEnCurso: number;
    clientesTotal: number;
  };
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const CrmSidebar: React.FC<CrmSidebarProps> = ({
  moduloActivo,
  setModuloActivo,
  usuarioActual,
  usuarios,
  onCambiarUsuario,
  wmsConectado,
  onToggleWms,
  counts,
  mobileOpen,
  setMobileOpen,
}) => {
  const groups: SidebarGroup[] = [
    {
      groupTitle: 'Panel de Control',
      items: [
        {
          id: 'resumen',
          label: 'Pipeline y KPIs',
          code: 'CRM',
          icon: <LayoutGrid className="w-4 h-4" aria-hidden="true" />,
        },
      ],
    },
    {
      groupTitle: 'Operación Logística',
      items: [
        {
          id: 'pedidos',
          label: 'Bandeja de Pedidos',
          code: 'RF-01',
          badge: counts.pedidosPendientes,
          icon: <Package className="w-4 h-4" aria-hidden="true" />,
        },
        {
          id: 'cubicaje',
          label: 'Cubicaje y Carga',
          code: 'RF-02',
          badge: counts.alertasCarga,
          badgeAlert: counts.alertasCarga > 0,
          icon: <Box className="w-4 h-4" aria-hidden="true" />,
        },
        {
          id: 'flota',
          label: 'Flota y Reservas',
          code: 'RF-03/04',
          badge: counts.vehiculosLibres,
          icon: <Truck className="w-4 h-4" aria-hidden="true" />,
        },
        {
          id: 'rutas',
          label: 'Planificador de Rutas',
          code: 'RF-05',
          badge: counts.rutasActivas,
          icon: <Route className="w-4 h-4" aria-hidden="true" />,
        },
        {
          id: 'trazabilidad',
          label: 'Trazabilidad en Vivo',
          code: 'RF-06',
          badge: counts.despachosEnCurso,
          icon: <Activity className="w-4 h-4" aria-hidden="true" />,
        },
      ],
    },
    {
      groupTitle: 'Directorio y Sistema',
      items: [
        {
          id: 'clientes',
          label: 'Cuentas y Clientes',
          code: 'CRM',
          badge: counts.clientesTotal,
          icon: <Users className="w-4 h-4" aria-hidden="true" />,
        },
        {
          id: 'seguridad',
          label: 'Seguridad y Base Datos',
          code: 'RNF',
          icon: <Database className="w-4 h-4" aria-hidden="true" />,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#141413] text-[#e7e5e0] w-[256px] shrink-0 select-none border-r border-[#262523]">
      {/* Brand Header */}
      <div className="h-[58px] px-4 flex items-center justify-between border-b border-[#262523]">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-[6px] flex items-center justify-center font-mono-tabular font-bold text-white text-[13px]"
            style={{ backgroundColor: 'var(--action)' }}
          >
            KL
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[14px] text-white tracking-tight">
                Kira Logistic
              </span>
              <span className="text-[10px] font-mono-tabular px-1.5 py-0.2 rounded bg-[#262523] text-[#a6a29a]">
                CRM
              </span>
            </div>
            <div className="text-[11px] text-[#8c8881] truncate max-w-[160px]">
              Distribuidora Kiramar S.A.S.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded text-[#a6a29a] hover:text-white cursor-pointer"
          aria-label="Cerrar menú lateral"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Sections */}
      <nav
        aria-label="Navegación principal del CRM Kira Logistic"
        className="flex-1 overflow-y-auto py-4 px-3 space-y-5"
      >
        {groups.map((group) => (
          <div key={group.groupTitle}>
            <div className="px-2.5 mb-1.5 text-[10px] font-mono-tabular font-semibold uppercase tracking-wider text-[#78746d]">
              {group.groupTitle}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = moduloActivo === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setModuloActivo(item.id);
                      setMobileOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-[7px] text-[13px] font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#262523] text-white'
                        : 'text-[#b0aca5] hover:bg-[#1d1c1b] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={
                          active ? 'text-[#e06d48]' : 'text-[#7e7a72]'
                        }
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {typeof item.badge === 'number' ? (
                        <span
                          className="px-1.5 py-0.5 text-[11px] font-mono-tabular font-semibold rounded"
                          style={{
                            backgroundColor: item.badgeAlert
                              ? 'var(--action)'
                              : active
                              ? '#383633'
                              : '#21201e',
                            color: item.badgeAlert
                              ? '#ffffff'
                              : active
                              ? '#ffffff'
                              : '#9e9a93',
                          }}
                        >
                          {item.badge}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono-tabular text-[#68645e]">
                          {item.code}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer de barra lateral: Conexión WMS + Selector RBAC (RNF-01) */}
      <div className="p-3 border-t border-[#262523] space-y-2.5 bg-[#10100f]">
        <button
          type="button"
          onClick={onToggleWms}
          title="Alternar simulación de enlace WMS / Base de Datos (UC-01 Camino Alternativo 2)"
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-[6px] bg-[#1b1a19] border border-[#2c2b29] hover:border-[#45433f] text-[12px] cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: wmsConectado ? '#34d399' : '#f87171',
              }}
            />
            <span className="font-mono-tabular text-[#d4d0c8]">
              {wmsConectado ? 'WMS Kiramar: Activo' : 'WMS: Desconectado'}
            </span>
          </div>
          <RefreshCw className="w-3.5 h-3.5 text-[#8c8881]" aria-hidden="true" />
        </button>

        <div className="p-2.5 rounded-[7px] bg-[#1b1a19] border border-[#2c2b29]">
          <div className="flex items-center gap-1.5 text-[10px] font-mono-tabular uppercase tracking-wider text-[#8c8881] mb-1">
            <ShieldCheck
              className="w-3.5 h-3.5 text-[#e06d48]"
              aria-hidden="true"
            />
            <span>Sesión RBAC (RNF-01)</span>
          </div>
          <label htmlFor="sidebar-user-select" className="sr-only">
            Cambiar usuario o rol activo
          </label>
          <select
            id="sidebar-user-select"
            value={usuarioActual.idUsuario}
            onChange={(e) => {
              const found = usuarios.find(
                (u) => u.idUsuario === e.target.value
              );
              if (found) onCambiarUsuario(found);
            }}
            className="w-full bg-[#121211] text-white text-[12px] font-medium px-2 py-1.5 rounded border border-[#33312e] focus:outline-none cursor-pointer"
          >
            {usuarios.map((u) => (
              <option key={u.idUsuario} value={u.idUsuario}>
                {u.nombre.split(' ').slice(0, 2).join(' ')} ({u.perfil.replace('Personal de ', '')})
              </option>
            ))}
          </select>
          <div className="text-[11px] text-[#8c8881] mt-1 truncate">
            {usuarioActual.cargo}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 flex h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};

interface TopCommandBarProps {
  moduloActivo: ModuloActivo;
  setModuloActivo: (m: ModuloActivo) => void;
  pedidos: Pedido[];
  pedidoSeleccionadoId: string;
  onSeleccionarPedido: (id: string) => void;
  onOpenMobileMenu: () => void;
}

export const TopCommandBar: React.FC<TopCommandBarProps> = ({
  moduloActivo,
  setModuloActivo,
  pedidos,
  pedidoSeleccionadoId,
  onSeleccionarPedido,
  onOpenMobileMenu,
}) => {
  const titulosModulo: Record<
    ModuloActivo,
    { seccion: string; titulo: string; refSpec: string }
  > = {
    resumen: {
      seccion: 'Panel de Control',
      titulo: 'Pipeline de Despachos y KPIs Operativos',
      refSpec: 'Proceso FO-TEP',
    },
    pedidos: {
      seccion: 'Operación Logística',
      titulo: 'Bandeja de Pedidos Comerciales',
      refSpec: 'UC-01 · RF-01 · Clase Pedido',
    },
    cubicaje: {
      seccion: 'Operación Logística',
      titulo: 'Consola de Cubicaje y Análisis Físico de Carga',
      refSpec: 'UC-02 · RF-02 · Clases LineaPedido / CargaPedido',
    },
    flota: {
      seccion: 'Operación Logística',
      titulo: 'Disponibilidad de Flota y Reserva de Transporte',
      refSpec: 'UC-03 / UC-04 · RF-03 / RF-04 · Clases Vehiculo / Asignacion',
    },
    rutas: {
      seccion: 'Operación Logística',
      titulo: 'Planificador de Rutas y Cobertura por Zonas',
      refSpec: 'UC-05 · RF-05 · Clase RutaEntrega',
    },
    trazabilidad: {
      seccion: 'Operación Logística',
      titulo: 'Centro de Monitoreo GPS y Trazabilidad de Entregas',
      refSpec: 'UC-06 · RF-06 · Clases Despacho / Trazabilidad',
    },
    clientes: {
      seccion: 'Directorio Comercial',
      titulo: 'Cuentas Corporativas y Condiciones de Recibo (CRM)',
      refSpec: 'Distribuidora Kiramar S.A.S.',
    },
    seguridad: {
      seccion: 'Administración y Arquitectura',
      titulo: 'Control de Acceso RBAC, Respaldos y Modelo Entidad-Relación',
      refSpec: 'RNF-01..06 · FO-DCL / FO-DER',
    },
  };

  const info = titulosModulo[moduloActivo];
  const pedidoFoco =
    pedidos.find((p) => p.idPedido === pedidoSeleccionadoId) || pedidos[0];

  return (
    <header className="h-[58px] bg-[var(--card)] border-b border-[var(--hairline)] px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 sticky top-0 z-20">
      <a className="skip-link" href="#top">
        Saltar al área de trabajo
      </a>

      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-[6px] border border-[var(--hairline)] text-[var(--ink)] cursor-pointer"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-mono-tabular text-[var(--muted)]">
            <span>{info.seccion}</span>
            <span>/</span>
            <span className="text-[var(--action)] font-medium">
              {info.refSpec}
            </span>
          </div>
          <h1 className="text-[15px] sm:text-[16px] font-semibold text-[var(--ink)] m-0 truncate">
            {info.titulo}
          </h1>
        </div>
      </div>

      {/* Selector global de Pedido Foco (Contexto transversal del CRM) */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="hidden md:flex items-center gap-2 bg-[var(--g-main)] border border-[var(--hairline-strong)] rounded-[7px] px-2.5 py-1">
          <span className="text-[11px] font-mono-tabular text-[var(--muted)]">
            Pedido activo:
          </span>
          <label htmlFor="header-active-order" className="sr-only">
            Seleccionar pedido activo en el flujo
          </label>
          <select
            id="header-active-order"
            value={pedidoFoco.idPedido}
            onChange={(e) => onSeleccionarPedido(e.target.value)}
            className="bg-transparent font-mono-tabular text-[12px] font-semibold text-[var(--ink)] focus:outline-none cursor-pointer"
          >
            {pedidos.map((p) => (
              <option key={p.idPedido} value={p.idPedido}>
                {p.idPedido} · {p.nombreCliente.slice(0, 24)} [{p.estadoPedido}]
              </option>
            ))}
          </select>
        </div>

        {moduloActivo !== 'pedidos' && (
          <button
            type="button"
            onClick={() => setModuloActivo('pedidos')}
            className="btn-secondary !min-h-[32px] !px-2.5 !text-[12px]"
          >
            Ver Bandeja
          </button>
        )}
      </div>
    </header>
  );
};
