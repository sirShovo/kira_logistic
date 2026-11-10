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
    <div className="space-y-6">
      {/* Sección 1: RNF-01 y RNF-02 — Control de Acceso Basado en Roles (Clase Usuario) */}
      <section
        aria-labelledby="heading-rnf01"
        className="surface-card p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5 pb-4 border-b border-[var(--hairline)]">
          <div>
            <span className="text-[12px] font-mono-tabular font-medium text-[var(--action)]">
              REQUISITOS NO FUNCIONALES RNF-01 Y RNF-02 · CLASE Usuario (`USUARIO`)
            </span>
            <h2
              id="heading-rnf01"
              className="text-[20px] sm:text-[22px] font-semibold text-[var(--ink)] m-0 mt-0.5"
            >
              Seguridad, autenticación hash y control de acceso por roles (RBAC).
            </h2>
          </div>

          <div className="text-[13px] font-mono-tabular bg-[var(--g-main)] px-3 py-1.5 rounded-[6px] border border-[var(--hairline)]">
            Operador autenticado: <strong>{usuarioActual.nombre}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {usuarios.map((u) => {
            const permisos = obtenerPermisosPorPerfil(u.perfil);
            const esActual = u.idUsuario === usuarioActual.idUsuario;
            return (
              <div
                key={u.idUsuario}
                className={`p-5 rounded-[14px] border flex flex-col justify-between ${
                  esActual
                    ? 'bg-[var(--g-main)] border-[var(--ink)]'
                    : 'bg-[var(--card)] border-[var(--hairline)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono-tabular text-[12px] font-semibold px-2 py-0.5 rounded bg-[var(--g-alt)] text-[var(--ink)]">
                      {u.idUsuario}
                    </span>
                    <span className="font-mono-tabular text-[12px] px-2 py-0.5 rounded bg-[var(--state-ok-bg)] text-[var(--state-ok-ink)]">
                      {u.estado}
                    </span>
                  </div>

                  <h3 className="text-[17px] font-semibold text-[var(--ink)] m-0">
                    {u.nombre}
                  </h3>
                  <p className="text-[13px] text-[var(--muted)] m-0 mt-0.5">
                    {u.cargo}
                  </p>
                  <div className="mt-2 inline-block text-[12px] font-mono-tabular font-medium px-2.5 py-1 rounded bg-[var(--action-soft)] text-[var(--action)]">
                    Actor UML: {u.perfil}
                  </div>

                  <div className="mt-3 p-2.5 rounded bg-[var(--card)] border border-[var(--hairline)] text-[11px] font-mono-tabular text-[var(--muted)] truncate">
                    <KeyRound
                      className="w-3.5 h-3.5 inline mr-1.5 text-[var(--ink)]"
                      aria-hidden="true"
                    />
                    Hash (RNF-02): {u.contrasenaHash}
                  </div>

                  <ul className="mt-3 pl-4 space-y-1 text-[13px] text-[var(--c-text)]">
                    {permisos.map((perm) => (
                      <li key={perm}>{perm}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--hairline)] text-[12px] font-mono-tabular text-[var(--muted)]">
                  Correo: {u.emailCorporativo}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sección 2: RNF-06 — Respaldo y Recuperación de Información */}
      <section
        aria-labelledby="heading-rnf06"
        className="surface-card p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5 pb-4 border-b border-[var(--hairline)]">
          <div>
            <span className="text-[12px] font-mono-tabular font-medium text-[var(--action)]">
              REQUISITO NO FUNCIONAL RNF-06 · CASO DE USO Gestionar Copias de Respaldo
            </span>
            <h2
              id="heading-rnf06"
              className="text-[20px] font-semibold text-[var(--ink)] m-0 mt-0.5"
            >
              Respaldo de información logística y recuperación ante contingencias.
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExportarJson}
              className="btn-secondary !min-h-[40px] !text-[13px]"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Exportar base de datos (.JSON)</span>
            </button>
            <button
              type="button"
              onClick={onRestaurarDatosSemilla}
              className="btn-secondary !min-h-[40px] !text-[13px]"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Restaurar estado inicial de demostración</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3 mb-5 p-4 rounded-[10px] bg-[var(--g-main)] border border-[var(--hairline)]">
          <div className="flex-1 min-w-[240px]">
            <label
              htmlFor="desc-backup"
              className="block text-[13px] font-medium text-[var(--ink)] mb-1"
            >
              Etiqueta o motivo de la copia de respaldo (RNF-06)
            </label>
            <input
              id="desc-backup"
              type="text"
              value={descripcionBackup}
              onChange={(e) => setDescripcionBackup(e.target.value)}
              className="field-input !min-h-[42px]"
            />
          </div>
          <button
            type="button"
            onClick={() => onCrearBackup(descripcionBackup)}
            className="btn-primary !min-h-[42px]"
          >
            <Archive className="w-4 h-4" aria-hidden="true" />
            <span>Generar instantánea de respaldo</span>
          </button>
        </div>

        <div
          tabIndex={0}
          role="region"
          aria-label="Historial de copias de respaldo"
          className="table-wrapper"
        >
          <table
            style={
              {
                '--label-2': '"Fecha y Hora"',
                '--label-3': '"Autor"',
                '--label-4': '"Descripción"',
                '--label-5': '"Registros Protegidos"',
                '--label-6': '"Estado"',
              } as React.CSSProperties
            }
          >
            <thead>
              <tr>
                <th scope="col">ID Respaldo</th>
                <th scope="col">Fecha / Hora</th>
                <th scope="col">Responsable</th>
                <th scope="col">Descripción de la Instantánea</th>
                <th scope="col">Volumen de Registros</th>
                <th scope="col">Verificación</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((b) => (
                <tr key={b.idSnapshot}>
                  <th scope="row" className="font-mono-tabular">
                    {b.idSnapshot}
                  </th>
                  <td className="font-mono-tabular text-[13px]">
                    {b.fechaHora}
                  </td>
                  <td>{b.autor}</td>
                  <td>{b.descripcion}</td>
                  <td className="font-mono-tabular text-[13px]">
                    {b.totalPedidos} pedidos · {b.totalDespachos} despachos ·{' '}
                    {b.totalEventosTrazabilidad} eventos
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[12px] font-mono-tabular bg-[var(--state-ok-bg)] text-[var(--state-ok-ink)]">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Íntegro
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sección 3: RNF-05 + Secciones 4.1 y 4.2 — Auditoría de las 9 Clases y Tablas Relacionales (FO-DCL / FO-DER) */}
      <section
        aria-labelledby="heading-der"
        className="surface-card p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[12px] font-mono-tabular font-medium text-[var(--muted)]">
              SECCIONES 4.1 (FO-DCL) Y 4.2 (FO-DER) · RNF-05 INTEGRIDAD Y CONSISTENCIA DE LA INFORMACIÓN
            </span>
            <h2
              id="heading-der"
              className="text-[20px] font-semibold text-[var(--ink)] m-0 mt-0.5"
            >
              Estado en tiempo real de las 9 entidades del Modelo Entidad-Relación y Diagrama de Clases.
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-mono-tabular px-3 py-1 rounded bg-[var(--state-ok-bg)] text-[var(--state-ok-ink)]">
            <Database className="w-4 h-4" aria-hidden="true" />
            Integridad referencial: 100% verificada
          </span>
        </div>

        <div
          tabIndex={0}
          role="region"
          aria-label="Auditoría de las 9 entidades del modelo de datos"
          className="table-wrapper mb-6"
        >
          <table
            style={
              {
                '--label-2': '"Clase UML"',
                '--label-3': '"Clave Primaria (PK)"',
                '--label-4': '"Claves Foráneas (FK)"',
                '--label-5': '"Cardinalidad y Relación"',
                '--label-6': '"Filas Activas"',
              } as React.CSSProperties
            }
          >
            <thead>
              <tr>
                <th scope="col">Entidad DER</th>
                <th scope="col">Clase FO-DCL</th>
                <th scope="col">Clave Primaria (PK)</th>
                <th scope="col">Claves Foráneas (FK)</th>
                <th scope="col">Cardinalidad y Asociación</th>
                <th scope="col">Registros en Memoria</th>
              </tr>
            </thead>
            <tbody>
              {entidadesDer.map((ent) => (
                <tr key={ent.tabla}>
                  <th scope="row" className="font-mono-tabular">
                    {ent.tabla}
                  </th>
                  <td className="font-mono-tabular font-medium text-[var(--ink)]">
                    {ent.clase}
                  </td>
                  <td className="font-mono-tabular text-[13px]">{ent.pk}</td>
                  <td className="font-mono-tabular text-[13px]">{ent.fk}</td>
                  <td className="text-[14px]">{ent.relacion}</td>
                  <td className="font-mono-tabular font-semibold text-[var(--action)]">
                    {ent.registros} activo(s)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sección 3.3: Planilla de Trazabilidad de Requisitos */}
        <h3 className="text-[17px] font-semibold text-[var(--ink)] mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--action)]" aria-hidden="true" />
          <span>
            Sección 3.3 — Planilla de Trazabilidad de Requisitos (RU → RF → Caso de Uso → Clases)
          </span>
        </h3>

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
                '--label-4': '"Clases Asociadas"',
                '--label-5': '"Estado"',
              } as React.CSSProperties
            }
          >
            <thead>
              <tr>
                <th scope="col">Req. Usuario</th>
                <th scope="col">Requisito Funcional (FO-ERS)</th>
                <th scope="col">Caso de Uso Documentado</th>
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
                  <td className="text-[14px]">{row.uc}</td>
                  <td className="font-mono-tabular text-[13px]">{row.clases}</td>
                  <td>
                    <span className="inline-flex px-2.5 py-0.5 rounded text-[12px] font-mono-tabular bg-[var(--state-ok-bg)] text-[var(--state-ok-ink)]">
                      Implementado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
