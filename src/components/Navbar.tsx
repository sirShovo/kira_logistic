import type React from 'react';
import { ShieldCheck, Truck, Package, Route, Users, Database, RefreshCw } from 'lucide-react';
import type { Usuario } from '../types/domain';

export type ModuloActivo =
  | 'pedidos'
  | 'flota'
  | 'rutas'
  | 'clientes'
  | 'seguridad';

interface NavbarProps {
  moduloActivo: ModuloActivo;
  setModuloActivo: (m: ModuloActivo) => void;
  usuarioActual: Usuario;
  usuarios: Usuario[];
  onCambiarUsuario: (u: Usuario) => void;
  wmsConectado: boolean;
  onToggleWms: () => void;
  pendientesCount: number;
  enRutaCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  moduloActivo,
  setModuloActivo,
  usuarioActual,
  usuarios,
  onCambiarUsuario,
  wmsConectado,
  onToggleWms,
  pendientesCount,
  enRutaCount,
}) => {
  const navItems: {
    id: ModuloActivo;
    label: string;
    refCode: string;
    badge?: number;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'pedidos',
      label: 'Pedidos y Carga',
      refCode: 'RF-01 / RF-02',
      badge: pendientesCount,
      icon: <Package className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'flota',
      label: 'Flota y Reserva',
      refCode: 'RF-03 / RF-04',
      icon: <Truck className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'rutas',
      label: 'Rutas y Trazabilidad',
      refCode: 'RF-05 / RF-06',
      badge: enRutaCount,
      icon: <Route className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'clientes',
      label: 'Directorio CRM',
      refCode: 'Kiramar S.A.S.',
      icon: <Users className="w-4 h-4" aria-hidden="true" />,
    },
    {
      id: 'seguridad',
      label: 'Seguridad y Arquitectura',
      refCode: 'RNF-01..06',
      icon: <Database className="w-4 h-4" aria-hidden="true" />,
    },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 bg-[var(--card)] border-b border-[var(--hairline)]"
      style={{ minHeight: 'var(--nav-h)' }}
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8">
        <a className="skip-link" href="#top">
          Saltar al contenido principal
        </a>

        {/* Fila superior de cabecera */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-3">
          {/* Marca e Identidad */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-[8px] flex items-center justify-center font-mono-tabular font-semibold text-white text-base select-none"
              style={{ backgroundColor: 'var(--ink)' }}
              aria-hidden="true"
            >
              KL
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-semibold text-[18px] tracking-tight text-[var(--ink)]">
                  Kira Logistic
                </span>
                <span className="text-[12px] font-mono-tabular px-2 py-0.5 rounded bg-[var(--g-alt)] text-[var(--c-text)] border border-[var(--hairline)]">
                  v1.3 PPI-3
                </span>
              </div>
              <p className="text-[13px] text-[var(--muted)] m-0 leading-tight">
                Distribuidora Kiramar S.A.S. — Planificación y Gestión de Despachos
              </p>
            </div>
          </div>

          {/* Estado WMS + Selector de Rol RBAC (RNF-01) */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onToggleWms}
              title="Alternar estado de enlace con base de datos WMS (Prueba Camino Alternativo 2 de UC-01)"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-[13px] font-medium border border-[var(--hairline)] bg-[var(--g-main)] text-[var(--c-text)] cursor-pointer hover:border-[var(--ink)] transition-colors"
              style={{ minHeight: '38px' }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: wmsConectado ? '#1b5936' : '#962627',
                }}
              />
              <span className="font-mono-tabular">
                {wmsConectado ? 'WMS Kiramar: En línea' : 'WMS Kiramar: Sin conexión'}
              </span>
              <RefreshCw className="w-3.5 h-3.5 text-[var(--muted)]" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-2 bg-[var(--g-main)] border border-[var(--hairline)] rounded-[8px] px-3 py-1">
              <ShieldCheck
                className="w-4 h-4 text-[var(--action)] shrink-0"
                aria-hidden="true"
              />
              <label
                htmlFor="rbac-user-select"
                className="text-[12px] font-medium text-[var(--muted)] sr-only sm:not-sr-only"
              >
                Sesión activa (RNF-01):
              </label>
              <select
                id="rbac-user-select"
                value={usuarioActual.idUsuario}
                onChange={(e) => {
                  const found = usuarios.find((u) => u.idUsuario === e.target.value);
                  if (found) onCambiarUsuario(found);
                }}
                className="bg-transparent text-[13px] font-medium text-[var(--ink)] border-none focus:outline-none cursor-pointer py-1"
              >
                {usuarios.map((u) => (
                  <option key={u.idUsuario} value={u.idUsuario}>
                    {u.nombre.split(' ').slice(0, 2).join(' ')} — {u.perfil}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Barra de pestañas de módulos (modern-web-guidance: tabs) */}
        <div
          className="tablist-scroller"
          role="tablist"
          aria-label="Módulos del sistema logístico Kira Logistic"
        >
          {navItems.map((item) => {
            const selected = moduloActivo === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`tab-${item.id}`}
                aria-selected={selected}
                onClick={(e) => {
                  setModuloActivo(item.id);
                  e.currentTarget.scrollIntoView({
                    block: 'nearest',
                    inline: 'nearest',
                  });
                }}
              >
                {item.icon}
                <span>{item.label}</span>
                <span className="text-[12px] font-mono-tabular text-[var(--muted)] hidden md:inline">
                  [{item.refCode}]
                </span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span
                    className="ml-1 px-1.5 py-0.5 text-[11px] font-mono-tabular font-semibold rounded"
                    style={{
                      backgroundColor: selected ? 'var(--action)' : 'var(--g-alt)',
                      color: selected ? '#ffffff' : 'var(--ink)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
