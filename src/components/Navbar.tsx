import type React from 'react';
import {
  Activity,
  Box,
  ChevronDown,
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
      groupTitle: 'PANEL DE CONTROL',
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
      groupTitle: 'OPERACIÓN LOGÍSTICA',
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
      groupTitle: 'DIRECTORIO Y SISTEMA',
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
    <div className="flex flex-col h-full bg-[#1e191d] text-[#e8e4e6] w-[260px] shrink-0 select-none border-r border-[rgba(185,192,218,0.12)]">
      {/* Brand Header */}
      <div className="h-[62px] px-4 flex items-center justify-between border-b border-[rgba(185,192,218,0.1)] bg-[#181417]">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-[8px] flex items-center justify-center font-mono-tabular font-bold text-[#1e191d] text-[13px] shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #c4e7d4 0%, #b9c0da 100%)',
            }}
          >
            KL
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[14px] text-white tracking-tight">
                Kira Logistic
              </span>
              <span className="text-[10px] font-mono-tabular font-medium px-1.5 py-0.2 rounded bg-[rgba(196,231,212,0.15)] text-[#c4e7d4]">
                CRM
              </span>
            </div>
            <div className="text-[11px] text-[#998da0] truncate max-w-[160px]">
              Distribuidora Kiramar S.A.S.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded text-[#998da0] hover:text-white cursor-pointer"
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
            <div className="px-2.5 mb-2 text-[10px] font-mono-tabular font-semibold tracking-wider text-[#998da0]">
              {group.groupTitle}
            </div>
            <div className="space-y-1">
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-[8px] text-[13px] font-medium transition-all cursor-pointer ${
                      active
                        ? 'bg-[#312a30] text-white shadow-sm border border-[rgba(196,231,212,0.22)]'
                        : 'text-[#c8c2c6] hover:bg-[#282226] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {active && (
                        <span className="w-1 h-3.5 rounded-full bg-[#c4e7d4] shrink-0 -ml-1 mr-0.5" />
                      )}
                      <span
                        className={
                          active ? 'text-[#c4e7d4]' : 'text-[#998da0]'
                        }
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {typeof item.badge === 'number' ? (
                        <span
                          className="px-2 py-0.5 text-[11px] font-mono-tabular font-semibold rounded-full"
                          style={{
                            backgroundColor: item.badgeAlert
                              ? '#998da0'
                              : active
                              ? '#c4e7d4'
                              : 'rgba(185, 192, 218, 0.16)',
                            color: active ? '#1e191d' : item.badgeAlert ? '#ffffff' : '#b9c0da',
                          }}
                        >
                          {item.badge}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono-tabular text-[#998da0]">
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
      <div className="p-3 border-t border-[rgba(185,192,218,0.12)] space-y-2.5 bg-[#171316]">
        <button
          type="button"
          onClick={onToggleWms}
          title="Alternar simulación de enlace WMS / Base de Datos (UC-01 Camino Alternativo 2)"
          className="w-full flex items-center justify-between px-3 py-2 rounded-[7px] bg-[#221c21] border border-[rgba(185,192,218,0.14)] hover:border-[rgba(196,231,212,0.4)] text-[12px] cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: wmsConectado ? '#c4e7d4' : '#b9c0da',
                boxShadow: wmsConectado ? '0 0 8px rgba(196, 231, 212, 0.6)' : 'none',
              }}
            />
            <span className="font-mono-tabular text-[#e2dedf]">
              {wmsConectado ? 'WMS Kiramar: Activo' : 'WMS: Desconectado'}
            </span>
          </div>
          <RefreshCw className="w-3.5 h-3.5 text-[#998da0]" aria-hidden="true" />
        </button>

        <div className="p-2.5 rounded-[8px] bg-[#221c21] border border-[rgba(185,192,218,0.14)]">
          <div className="flex items-center gap-1.5 text-[10px] font-mono-tabular uppercase tracking-wider text-[#b9c0da] mb-1">
            <ShieldCheck
              className="w-3.5 h-3.5 text-[#c4e7d4]"
              aria-hidden="true"
            />
            <span>Operador Activo (RNF-01)</span>
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
            className="w-full bg-[#181417] text-white text-[12px] font-medium px-2 py-1.5 rounded border border-[rgba(185,192,218,0.2)] focus:outline-none cursor-pointer"
          >
            {usuarios.map((u) => (
              <option key={u.idUsuario} value={u.idUsuario}>
                {u.nombre.split(' ').slice(0, 2).join(' ')} ({u.perfil.replace('Personal de ', '')})
              </option>
            ))}
          </select>
          <div className="text-[11px] text-[#998da0] mt-1 truncate">
            {usuarioActual.cargo}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex h-screen sticky top-0 shadow-xl">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
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
      refSpec: 'Proceso FO-TEP Kiramar',
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
    <header className="h-[62px] bg-white/90 backdrop-blur-md border-b border-[var(--hairline)] px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 sticky top-0 z-20 relative">
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#c4e7d4] via-[#b9c0da] to-[#63585e]" />
      
      <a className="skip-link" href="#top">
        Saltar al área de trabajo
      </a>

      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-[7px] border border-[var(--hairline-strong)] text-[var(--ink)] cursor-pointer hover:bg-[rgba(196,218,207,0.2)]"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-mono-tabular text-[var(--muted)]">
            <span>{info.seccion}</span>
            <span className="text-[rgba(99,88,94,0.3)]">/</span>
            <span className="text-[var(--taupe-grey)] font-semibold">
              {info.refSpec}
            </span>
          </div>
          <h1 className="text-[15px] sm:text-[16px] font-semibold text-[var(--ink)] m-0 truncate tracking-tight">
            {info.titulo}
          </h1>
        </div>
      </div>

      {/* Selector global de Pedido Foco */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-2 bg-white border border-[rgba(99,88,94,0.18)] shadow-xs rounded-[8px] pl-3 pr-2.5 py-1.5 hover:border-[var(--taupe-grey)] transition-colors">
          <span className="text-[11px] font-mono-tabular font-semibold text-[var(--muted)]">
            Pedido foco:
          </span>
          <div className="relative flex items-center">
            <select
              id="header-active-order"
              aria-label="Seleccionar pedido activo en el flujo"
              value={pedidoFoco.idPedido}
              onChange={(e) => onSeleccionarPedido(e.target.value)}
              className="bg-transparent font-mono-tabular text-[12px] font-semibold text-[var(--ink)] pr-6 border-0 outline-none focus:outline-none focus:ring-0 cursor-pointer appearance-none"
            >
              {pedidos.map((p) => (
                <option key={p.idPedido} value={p.idPedido}>
                  {p.idPedido} · {p.nombreCliente.slice(0, 22)} [{p.estadoPedido}]
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--muted)] pointer-events-none absolute right-0" />
          </div>
        </div>

        {moduloActivo !== 'pedidos' && (
          <button
            type="button"
            onClick={() => setModuloActivo('pedidos')}
            className="btn-secondary !min-h-[34px] !px-3 !text-[12px]"
          >
            Ver Bandeja
          </button>
        )}
      </div>
    </header>
  );
};
