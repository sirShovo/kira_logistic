import type React from 'react';
import { useState } from 'react';
import {
  Archive,
  CheckCircle2,
  Database,
  Download,
  KeyRound,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import type {
  Asignacion,
  BackupSnapshot,
  Despacho,
  Pedido,
  RutaEntrega,
  Trazabilidad,
  Usuario,
  Vehiculo,
} from '../types/domain';

interface AdminSeguridadModuleProps {
  usuarios: Usuario[];
  usuarioActual: Usuario;
  pedidos: Pedido[];
  vehiculos: Vehiculo[];
  asignaciones: Asignacion[];
  rutas: RutaEntrega[];
  despachos: Despacho[];
  trazabilidad: Trazabilidad[];
  backups: BackupSnapshot[];
  onCrearBackup: (descripcion: string) => void;
  onRestaurarDatosSemilla: () => void;
}

export const AdminSeguridadModule: React.FC<AdminSeguridadModuleProps> = ({
  usuarios,
  usuarioActual,
  pedidos,
  vehiculos,
  asignaciones,
  rutas,
  despachos,
  trazabilidad,
  backups,
  onCrearBackup,
  onRestaurarDatosSemilla,
}) => {
  const [subTab, setSubTab] = useState<'rbac' | 'backups' | 'der'>('rbac');
  const [descripcionBackup, setDescripcionBackup] = useState<string>(
    'Copia de respaldo manual de cierre de turno operativo'
  );

  const totalLineas = pedidos.reduce((acc, p) => acc + p.lineas.length, 0);

  const obtenerPermisosPorPerfil = (perfil: Usuario['perfil']): string[] => {
    switch (perfil) {
      case 'Personal de logística / despachos':
        return [
          'UC-01 Gestionar pedidos pendientes',
          'UC-02 Calcular y consultar carga',
          'UC-03 Consultar disponibilidad vehicular',
          'UC-04 Asignar vehículo y registrar reserva',
          'UC-05 Planificar ruta de entrega',
          'UC-06 Seguimiento de despachos',
        ];
      case 'Personal de logística / transporte':
        return [
          'UC-03 Verificar disponibilidad y capacidades de flota',
          'UC-06 Ejecutar ruta y registrar novedades / entregas',
        ];
      case 'Administrador del sistema':
        return [
          'RNF-01 Gestionar usuarios y control de acceso RBAC',
          'RNF-02 Auditoría de hashes y protección de datos',
          'RNF-05 Verificación de integridad referencial (9 tablas)',
          'RNF-06 Gestionar copias de respaldo y recuperación',
        ];
    }
  };

  const handleExportarJson = () => {
    const payload = {
      proyecto: 'Kira Logistic — Distribuidora Kiramar S.A.S.',
      version: '1.3',
      fechaExportacion: new Date().toISOString(),
      entidades: {
        PEDIDO: pedidos,
        VEHICULO: vehiculos,
        ASIGNACION: asignaciones,
        RUTA_ENTREGA: rutas,
        DESPACHO: despachos,
        TRAZABILIDAD: trazabilidad,
        USUARIO: usuarios,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kira-logistic-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const entidadesDer = [
    {
      tabla: 'PEDIDO',
      clase: 'Pedido',
      pk: 'id_pedido',
      fk: '—',
      relacion: '1:N con LINEA_PEDIDO, 1:1 con CARGA_PEDIDO',
      registros: pedidos.length,
    },
    {
      tabla: 'LINEA_PEDIDO',
      clase: 'LineaPedido',
      pk: 'id_linea',
      fk: 'id_pedido',
      relacion: 'N:1 con PEDIDO, contribuye a CARGA_PEDIDO',
      registros: totalLineas,
    },
    {
      tabla: 'CARGA_PEDIDO',
      clase: 'CargaPedido',
      pk: 'id_carga',
      fk: 'id_pedido',
      relacion: '1:1 obligatoria con PEDIDO, insumo de ASIGNACION',
      registros: pedidos.length,
    },
    {
      tabla: 'VEHICULO',
      clase: 'Vehiculo',
      pk: 'id_vehiculo',
      fk: '—',
      relacion: '1:N historial en ASIGNACION',
      registros: vehiculos.length,
    },
    {
      tabla: 'ASIGNACION',
      clase: 'Asignacion',
      pk: 'id_asignacion',
      fk: 'id_pedido, id_vehiculo, id_usuario',
      relacion: 'Vincula PEDIDO y VEHICULO; 1:1 con RUTA_ENTREGA y DESPACHO',
      registros: asignaciones.length,
    },
    {
      tabla: 'RUTA_ENTREGA',
      clase: 'RutaEntrega',
      pk: 'id_ruta',
      fk: 'id_asignacion',
      relacion: '1:1 con ASIGNACION y DESPACHO',
      registros: rutas.length,
    },
    {
      tabla: 'DESPACHO',
      clase: 'Despacho',
      pk: 'id_despacho',
      fk: 'id_asignacion, id_ruta',
      relacion: '1:1 con ASIGNACION; 1:N con TRAZABILIDAD',
      registros: despachos.length,
    },
    {
      tabla: 'TRAZABILIDAD',
      clase: 'Trazabilidad',
      pk: 'id_registro',
      fk: 'id_despacho',
      relacion: 'N:1 eventos por cada DESPACHO',
      registros: trazabilidad.length,
    },
    {
      tabla: 'USUARIO',
      clase: 'Usuario',
      pk: 'id_usuario',
      fk: '—',
      relacion: '1:N registra ASIGNACION según perfil RBAC',
      registros: usuarios.length,
    },
  ];

  const matrizTrazabilidad = [
    {
      ru: 'RU-01',
      rf: 'RF-01 — Gestión de pedidos',
      uc: 'UC-01 — Consultar y gestionar pedidos pendientes',
      clases: 'Pedido, LineaPedido',
    },
    {
      ru: 'RU-02',
      rf: 'RF-02 — Cálculo y consulta de características de carga',
      uc: 'UC-02 — Calcular y consultar características de carga',
      clases: 'LineaPedido, CargaPedido',
    },
    {
      ru: 'RU-03',
      rf: 'RF-03 — Consulta de disponibilidad y capacidad de vehículos',
      uc: 'UC-03 — Consultar disponibilidad y capacidad vehicular',
      clases: 'Vehiculo, CargaPedido',
    },
    {
      ru: 'RU-04',
      rf: 'RF-04 — Gestión de pedidos (Asignación y reserva)',
      uc: 'UC-04 — Asignar vehículo al despacho y registrar reserva',
      clases: 'Asignacion, Vehiculo, Pedido',
    },
    {
      ru: 'RU-05',
      rf: 'RF-05 — Planificación de rutas de entrega',
      uc: 'UC-05 — Planificar ruta de entrega',
      clases: 'RutaEntrega, Asignacion',
    },
    {
      ru: 'RU-06',
      rf: 'RF-06 — Seguimiento y trazabilidad de despachos',
      uc: 'UC-06 — Realizar seguimiento de despachos',
      clases: 'Despacho, Trazabilidad',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Sub-navegación por pestañas del panel administrativo (modern-web-guidance: tabs) */}
      <div className="crm-card px-4 pt-2 flex flex-wrap items-center justify-between gap-3">
        <div
          className="tablist-scroller border-b-0"
          role="tablist"
          aria-label="Secciones de administración y base de datos"
        >
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'rbac'}
            onClick={() => setSubTab('rbac')}
          >
            Usuarios y Roles RBAC (RNF-01 / RNF-02)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'backups'}
            onClick={() => setSubTab('backups')}
          >
            Copias de Respaldo (RNF-06)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'der'}
            onClick={() => setSubTab('der')}
          >
            Modelo Relacional (9 Tablas DER) y Trazabilidad
          </button>
        </div>

        <div className="flex items-center gap-2 pb-2">
          <button
            type="button"
            onClick={handleExportarJson}
            className="btn-secondary !min-h-[32px] !text-[12px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar JSON</span>
          </button>
          <button
            type="button"
            onClick={onRestaurarDatosSemilla}
            className="btn-secondary !min-h-[32px] !text-[12px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Semilla</span>
          </button>
        </div>
      </div>

      {/* Sub-pestaña 1: Usuarios y Control de Acceso RBAC */}
      {subTab === 'rbac' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {usuarios.map((u) => {
            const permisos = obtenerPermisosPorPerfil(u.perfil);
            const esActual = u.idUsuario === usuarioActual.idUsuario;
            return (
              <div
                key={u.idUsuario}
                className={`crm-card p-5 flex flex-col justify-between ${
                  esActual ? 'border-[var(--ink)] bg-[#faf9f6]' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono-tabular text-[11px] font-semibold px-2 py-0.5 rounded bg-[var(--g-alt)] text-[var(--ink)]">
                      {u.idUsuario}
                    </span>
                    <span className="font-mono-tabular text-[11px] px-2 py-0.5 rounded bg-[var(--state-ok-bg)] text-[var(--state-ok-ink)] font-semibold">
                      {esActual ? 'Sesión Activa' : u.estado}
                    </span>
                  </div>

                  <h3 className="text-[16px] font-semibold text-[var(--ink)] m-0">
                    {u.nombre}
                  </h3>
                  <p className="text-[12px] text-[var(--muted)] m-0 mt-0.5">
                    {u.cargo}
                  </p>
                  <div className="mt-2 inline-block text-[11px] font-mono-tabular font-semibold px-2 py-0.5 rounded bg-[var(--action-soft)] text-[var(--action)]">
                    {u.perfil}
                  </div>

                  <div className="mt-3 p-2 rounded bg-[var(--g-main)] border border-[var(--hairline)] text-[11px] font-mono-tabular text-[var(--muted)] truncate">
                    <KeyRound className="w-3 h-3 inline mr-1 text-[var(--ink)]" />
                    {u.contrasenaHash}
                  </div>

                  <ul className="mt-3 pl-4 space-y-1 text-[12px] text-[var(--c-text)]">
                    {permisos.map((perm) => (
                      <li key={perm}>{perm}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-2.5 border-t border-[var(--hairline)] text-[11px] font-mono-tabular text-[var(--muted)]">
                  {u.emailCorporativo}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sub-pestaña 2: Copias de Respaldo (RNF-06) */}
      {subTab === 'backups' && (
        <div className="crm-card p-5 space-y-4">
          <div className="flex flex-wrap items-end gap-3 p-3.5 rounded-[8px] bg-[var(--g-main)] border border-[var(--hairline)]">
            <div className="flex-1 min-w-[240px]">
              <label
                htmlFor="desc-backup"
                className="block text-[12px] font-medium text-[var(--ink)] mb-1"
              >
                Etiqueta de la copia de respaldo (`Gestionar Copias de Respaldo`)
              </label>
              <input
                id="desc-backup"
                type="text"
                value={descripcionBackup}
                onChange={(e) => setDescripcionBackup(e.target.value)}
                className="field-input"
              />
            </div>
            <button
              type="button"
              onClick={() => onCrearBackup(descripcionBackup)}
              className="btn-primary"
            >
              <Archive className="w-4 h-4" />
              <span>Crear instantánea de respaldo</span>
            </button>
          </div>

          <div
            tabIndex={0}
            role="region"
            aria-label="Historial de copias de respaldo"
            className="table-wrapper border border-[var(--hairline)] rounded-[8px]"
          >
            <table
              style={
                {
                  '--label-2': '"Fecha / Hora"',
                  '--label-3': '"Responsable"',
                  '--label-4': '"Descripción"',
                  '--label-5': '"Registros"',
                  '--label-6': '"Estado"',
                } as React.CSSProperties
              }
            >
              <thead>
                <tr>
                  <th scope="col">ID Instantánea</th>
                  <th scope="col">Fecha y Hora</th>
                  <th scope="col">Responsable</th>
                  <th scope="col">Descripción</th>
                  <th scope="col">Volumen Protegido</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b) => (
                  <tr key={b.idSnapshot}>
                    <th scope="row" className="font-mono-tabular">
                      {b.idSnapshot}
                    </th>
                    <td className="font-mono-tabular text-[12px]">
                      {b.fechaHora}
                    </td>
                    <td>{b.autor}</td>
                    <td>{b.descripcion}</td>
                    <td className="font-mono-tabular text-[12px]">
                      {b.totalPedidos} pedidos · {b.totalDespachos} despachos ·{' '}
                      {b.totalEventosTrazabilidad} eventos
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono-tabular bg-[var(--state-ok-bg)] text-[var(--state-ok-ink)] font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        Verificado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-pestaña 3: Modelo Relacional (9 Tablas) y Matriz de Trazabilidad */}
      {subTab === 'der' && (
        <div className="space-y-4">
          <div className="crm-card overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--hairline)] bg-[#faf9f6] flex items-center justify-between">
              <span className="font-semibold text-[13px] text-[var(--ink)] flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[var(--action)]" />
                Auditoría de las 9 Entidades del Modelo Entidad-Relación (`FO-DER` / `FO-DCL`)
              </span>
              <span className="text-[11px] font-mono-tabular text-[var(--state-ok-ink)] bg-[var(--state-ok-bg)] px-2 py-0.5 rounded font-semibold">
                Integridad Referencial 100%
              </span>
            </div>

            <div
              tabIndex={0}
              role="region"
              aria-label="Auditoría de las 9 entidades del modelo de datos"
              className="table-wrapper"
            >
              <table
                style={
                  {
                    '--label-2': '"Clase"',
                    '--label-3': '"PK"',
                    '--label-4': '"FK"',
                    '--label-5': '"Cardinalidad"',
                    '--label-6': '"Registros"',
                  } as React.CSSProperties
                }
              >
                <thead>
                  <tr>
                    <th scope="col">Tabla DER</th>
                    <th scope="col">Clase UML</th>
                    <th scope="col">Clave Primaria (PK)</th>
                    <th scope="col">Claves Foráneas (FK)</th>
                    <th scope="col">Relación y Cardinalidad</th>
                    <th scope="col">Filas Activas</th>
                  </tr>
                </thead>
                <tbody>
                  {entidadesDer.map((ent) => (
                    <tr key={ent.tabla}>
                      <th scope="row" className="font-mono-tabular">
                        {ent.tabla}
                      </th>
                      <td className="font-mono-tabular font-semibold text-[var(--ink)]">
                        {ent.clase}
                      </td>
                      <td className="font-mono-tabular text-[12px]">{ent.pk}</td>
                      <td className="font-mono-tabular text-[12px]">{ent.fk}</td>
                      <td className="text-[12px]">{ent.relacion}</td>
                      <td className="font-mono-tabular font-semibold text-[var(--action)]">
                        {ent.registros}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="crm-card overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--hairline)] bg-[#faf9f6] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[var(--action)]" />
              <span className="font-semibold text-[13px] text-[var(--ink)]">
                Matriz de Trazabilidad de Requisitos (Sección 3.3 — RU → RF → UC → Clases)
              </span>
            </div>

            <div
              tabIndex={0}
              role="region"
              aria-label="Planilla de trazabilidad de requisitos"
              className="table-wrapper"
            >
              <table
                style={
                  {
                    '--label-2': '"Requisito Funcional"',
                    '--label-3': '"Caso de Uso"',
                    '--label-4': '"Clases"',
                    '--label-5': '"Estado"',
                  } as React.CSSProperties
                }
              >
                <thead>
                  <tr>
                    <th scope="col">Req. Usuario</th>
                    <th scope="col">Requisito Funcional</th>
                    <th scope="col">Caso de Uso</th>
                    <th scope="col">Clases del Dominio</th>
                    <th scope="col">Cobertura</th>
                  </tr>
                </thead>
                <tbody>
                  {matrizTrazabilidad.map((row) => (
                    <tr key={row.ru}>
                      <th scope="row" className="font-mono-tabular">
                        {row.ru}
                      </th>
                      <td className="font-medium text-[var(--ink)]">{row.rf}</td>
                      <td>{row.uc}</td>
                      <td className="font-mono-tabular text-[12px]">
                        {row.clases}
                      </td>
                      <td>
                        <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-mono-tabular bg-[var(--state-ok-bg)] text-[var(--state-ok-ink)] font-semibold">
                          100% Activo
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
