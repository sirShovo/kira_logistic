import React, { useState } from 'react';
import { useLogistics } from '../../context/useLogistics';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import type { SnapshotSistema } from '../../types/domain';
import { 
  Users, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  FileJson
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const { 
    usuarios, 
    usuarioActivo, 
    ejecutarDiagnosticoIntegridad, 
    repararInconsistencias, 
    generarSnapshot, 
    restaurarSnapshot, 
    restablecerDatosDemostracion 
  } = useLogistics();

  const esAdmin = usuarioActivo.perfil === 'Administrador del Sistema';

  // Diagnostico de integridad
  const [diagnosticoEjecutado, setDiagnosticoEjecutado] = useState(false);
  const [hallazgos, setHallazgos] = useState<string[]>([]);

  // Respaldos
  const [motivoRespaldo, setMotivoRespaldo] = useState('Copia de seguridad operacional programada');
  const [ultimoSnapshot, setUltimoSnapshot] = useState<SnapshotSistema | null>(null);
  const [archivoJson, setArchivoJson] = useState<string>('');
  const [modalRestaurarAbierto, setModalRestaurarAbierto] = useState(false);

  const correrDiagnostico = () => {
    const res = ejecutarDiagnosticoIntegridad();
    setHallazgos(res.hallazgos);
    setDiagnosticoEjecutado(true);
  };

  const correrReparacion = () => {
    repararInconsistencias();
    correrDiagnostico();
  };

  const handleCrearRespaldo = () => {
    const snap = generarSnapshot(motivoRespaldo);
    setUltimoSnapshot(snap);
  };

  const handleDescargarJson = () => {
    if (!ultimoSnapshot) return;
    const blob = new Blob([JSON.stringify(ultimoSnapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kiramar-logistic-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setArchivoJson(JSON.stringify(parsed, null, 2));
        setModalRestaurarAbierto(true);
      } catch {
        alert('El archivo no posee un formato JSON valido.');
      }
    };
    reader.readAsText(file);
  };

  const confirmarRestauracion = () => {
    try {
      const snap = JSON.parse(archivoJson);
      restaurarSnapshot(snap);
      setModalRestaurarAbierto(false);
    } catch {
      alert('Error en el contenido del archivo de respaldo.');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Banner de Perfil de Seguridad */}
      <div className="bg-white p-6 rounded-2xl border border-[rgba(99,88,94,0.12)] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#63585e] text-white">
              RNF-01 / RNF-05 / RNF-06
            </span>
            <span className="text-xs text-[#7d737a]">
              Consola de Administracion y Gobierno Tecnologico
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#1b171a]">
            Seguridad, Integridad de Datos y Copias de Seguridad
          </h2>
          <p className="text-xs text-[#7d737a] mt-0.5 max-w-xl">
            Gestion de colaboradores autorizados, auditoria de consistencia referencial en memoria y generacion/restauracion de respaldos JSON.
          </p>
        </div>

        {!esAdmin && (
          <div className="px-4 py-2.5 rounded-xl bg-[#fdfaf3] border border-[#e8d7a7] text-[#6b4716] text-xs">
            <strong>Modo Solo Lectura:</strong> Para ejecutar acciones de gobierno y respaldo, conmute a un perfil con rol de <strong>Administrador del Sistema</strong>.
          </div>
        )}
      </div>

      {/* Seccion 1: Gestion de Usuarios y Matriz de Roles (RNF-01) */}
      <div className="bg-white rounded-2xl p-6 border border-[rgba(99,88,94,0.12)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#f1f5f3] text-[#63585e]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1b171a]">
                Colaboradores del Sistema y Perfiles de Acceso (RNF-01)
              </h3>
              <p className="text-xs text-[#7d737a] mt-0.5">
                Usuarios autenticados para la operacion logistica de Distribuidora Kiramar S.A.S.
              </p>
            </div>
          </div>
          <Badge variant="mint" size="sm">
            {usuarios.length} activos
          </Badge>
        </div>

        {/* Users Table */}
        <div className="border border-[rgba(99,88,94,0.1)] rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f8faf9] border-b border-[rgba(99,88,94,0.1)] text-[10px] font-mono uppercase tracking-wider text-[#7d737a]">
                <th className="py-2.5 px-4">ID Usuario</th>
                <th className="py-2.5 px-4">Nombre Completo</th>
                <th className="py-2.5 px-4">Cargo Operativo</th>
                <th className="py-2.5 px-4">Perfil Funcional</th>
                <th className="py-2.5 px-4">Correo Corporativo</th>
                <th className="py-2.5 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(99,88,94,0.08)]">
              {usuarios.map(u => (
                <tr key={u.idUsuario} className="hover:bg-[#f8faf9]">
                  <td className="py-3 px-4 font-mono font-bold text-[#1b171a]">
                    {u.idUsuario}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#1b171a]">
                    {u.nombre}
                  </td>
                  <td className="py-3 px-4 text-[#7d737a]">
                    {u.cargo}
                  </td>
                  <td className="py-3 px-4 font-medium text-[#4a4147]">
                    {u.perfil}
                  </td>
                  <td className="py-3 px-4 font-mono text-[#7d737a]">
                    {u.correo}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="mint" size="sm">
                      {u.estado}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Privileges Matrix */}
        <div className="p-4 rounded-xl bg-[#f8faf9] border border-[rgba(99,88,94,0.08)]">
          <div className="text-xs font-bold text-[#1b171a] mb-2 uppercase font-mono tracking-wider">
            Matriz de Alcance por Perfil (Segun Seccion 2.1 PPI-3)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-white border border-[rgba(99,88,94,0.1)]">
              <div className="font-semibold text-[#1b171a] mb-1">Logistica / Despachos</div>
              <ul className="text-[11px] text-[#7d737a] space-y-1 list-disc list-inside">
                <li>Gestion de pedidos y cubicaje</li>
                <li>Consulta de flota y compatibilidad</li>
                <li>Formalizacion de reserva vehicular</li>
                <li>Planificacion de secuencias de reparto</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-white border border-[rgba(99,88,94,0.1)]">
              <div className="font-semibold text-[#1b171a] mb-1">Logistica / Transporte</div>
              <ul className="text-[11px] text-[#7d737a] space-y-1 list-disc list-inside">
                <li>Ejecucion de despacho e inicio de ruta</li>
                <li>Registro de eventos de telemetria</li>
                <li>Reporte de novedades y devoluciones</li>
                <li>Certificacion de entrega en destino</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-white border border-[rgba(99,88,94,0.1)]">
              <div className="font-semibold text-[#1b171a] mb-1">Administrador del Sistema</div>
              <ul className="text-[11px] text-[#7d737a] space-y-1 list-disc list-inside">
                <li>Control y supervision integral</li>
                <li>Auditoria de integridad referencial</li>
                <li>Generacion y restauracion de snapshots</li>
                <li>Simulacion de contingencias de enlace</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Seccion 2: Auditoria de Integridad y Consistencia (RNF-05) */}
      <div className="bg-white rounded-2xl p-6 border border-[rgba(99,88,94,0.12)] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#f1f5f3] text-[#63585e]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1b171a]">
                Auditoria de Integridad Referencial y Consistencia (RNF-05)
              </h3>
              <p className="text-xs text-[#7d737a] mt-0.5">
                Comprueba relaciones obligatorias entre Pedidos, Asignaciones, Lineas y Vehiculos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={correrDiagnostico}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#63585e] text-white hover:bg-[#4a4147] transition-colors flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
          >
            <Activity className="w-3.5 h-3.5 text-[#c4e7d4]" />
            <span>Ejecutar Diagnostico de Consistencia</span>
          </button>
        </div>

        {diagnosticoEjecutado && (
          <div className="space-y-3 pt-2">
            {hallazgos.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#c4e7d4]/30 border border-[#c4e7d4] text-[#174630] flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#1e6b45] shrink-0" />
                <div className="text-xs">
                  <div className="font-bold">Consistencia Integral Validada (0 Anomalias)</div>
                  <div className="mt-0.5">
                    Todas las entidades cumplen sus restricciones referenciales: ningun pedido asignado carece de vehiculo, no hay lineas huerfanas ni reservas sin relacion activa.
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#fdfaf3] border border-[#e8d7a7] text-[#6b4716] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-[#b4781c]" />
                    <span>Se detectaron {hallazgos.length} inconsistencias en la estructura relacional:</span>
                  </div>
                  <button
                    type="button"
                    onClick={correrReparacion}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-[#b4781c] text-white hover:bg-[#8f5e14] cursor-pointer"
                  >
                    Reparar Inconsistencias Automaticamente
                  </button>
                </div>

                <ul className="text-xs space-y-1 pl-6 list-disc">
                  {hallazgos.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Seccion 3: Copias de Seguridad y Respaldos JSON (RNF-06) */}
      <div className="bg-white rounded-2xl p-6 border border-[rgba(99,88,94,0.12)] shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#f1f5f3] text-[#63585e]">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1b171a]">
              Centro de Copias de Respaldo y Restauracion (RNF-06)
            </h3>
            <p className="text-xs text-[#7d737a] mt-0.5">
              Serializacion completa de pedidos, vehiculos, rutas, asignaciones y trazabilidad en JSON
            </p>
          </div>
        </div>

        {/* Generacion de Snapshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#f8faf9] border border-[rgba(99,88,94,0.1)] space-y-3">
            <div className="text-xs font-bold text-[#1b171a] uppercase font-mono tracking-wider">
              Generar Copia de Respaldo Inmediata
            </div>
            <div>
              <label className="block text-[11px] text-[#7d737a] mb-1">
                Descripcion o justificacion del respaldo:
              </label>
              <input
                type="text"
                value={motivoRespaldo}
                onChange={(e) => setMotivoRespaldo(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[rgba(99,88,94,0.18)] rounded-lg text-xs focus:outline-none focus:border-[#63585e]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCrearRespaldo}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#63585e] text-white hover:bg-[#4a4147] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <FileJson className="w-3.5 h-3.5 text-[#c4e7d4]" />
                <span>Empaquetar Snapshot JSON</span>
              </button>

              {ultimoSnapshot && (
                <button
                  type="button"
                  onClick={handleDescargarJson}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[rgba(99,88,94,0.18)] text-[#1b171a] hover:bg-[#f8faf9] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#63585e]" />
                  <span>Descargar Archivo</span>
                </button>
              )}
            </div>

            {ultimoSnapshot && (
              <div className="text-[11px] text-[#1e6b45] font-mono mt-1">
                Snapshot generado: {new Date(ultimoSnapshot.fechaGeneracion).toLocaleTimeString()} ({ultimoSnapshot.pedidos.length} pedidos, {ultimoSnapshot.vehiculos.length} vehiculos)
              </div>
            )}
          </div>

          {/* Restauracion de Snapshot */}
          <div className="p-4 rounded-xl bg-[#f8faf9] border border-[rgba(99,88,94,0.1)] space-y-3">
            <div className="text-xs font-bold text-[#1b171a] uppercase font-mono tracking-wider">
              Restaurar o Importar Respaldo Externo
            </div>
            <p className="text-xs text-[#7d737a]">
              Permite cargar un archivo de respaldo generado previamente para restablecer el estado integro del CRM.
            </p>

            <div className="pt-2">
              <label className="px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-[rgba(99,88,94,0.18)] text-[#1b171a] hover:bg-[#f8faf9] transition-colors flex items-center gap-1.5 cursor-pointer inline-flex">
                <Upload className="w-3.5 h-3.5 text-[#63585e]" />
                <span>Seleccionar Archivo JSON de Respaldo</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportarArchivo}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Demostration Factory Reset */}
        <div className="pt-4 border-t border-[rgba(99,88,94,0.1)] flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#1b171a]">
              Restablecimiento del Escenario de Evaluacion
            </div>
            <div className="text-[11px] text-[#7d737a]">
              Devuelve la aplicacion al estado inicial con pedidos pendientes, excesos y pruebas preconfiguradas.
            </div>
          </div>

          <button
            type="button"
            onClick={restablecerDatosDemostracion}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#f8faf9] hover:bg-[#f1f5f3] text-[#781c2d] border border-[rgba(99,88,94,0.15)] flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#b02a37]" />
            <span>Restablecer Datos Iniciales</span>
          </button>
        </div>
      </div>

      {/* Modal de Confirmacion para Restauracion */}
      <Modal
        isOpen={modalRestaurarAbierto}
        onClose={() => setModalRestaurarAbierto(false)}
        title="Confirmar Restauracion Integral del Sistema"
        subtitle="Sustitucion completa del estado actual de pedidos, flota y trazabilidad"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalRestaurarAbierto(false)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[rgba(99,88,94,0.18)] text-[#1b171a] hover:bg-[#f8faf9] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarRestauracion}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#b02a37] text-white hover:bg-[#8f1f2d] transition-colors cursor-pointer"
            >
              Confirmar y Restaurar Estado
            </button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-[#1b171a] font-medium">
            Se procedera a restaurar el siguiente paquete de respaldo. Esta operacion reemplazara la base de datos en memoria activa:
          </p>
          <pre className="p-3 bg-[#f8faf9] border border-[rgba(99,88,94,0.15)] rounded-lg text-[10px] font-mono text-[#4a4147] max-h-48 overflow-y-auto">
            {archivoJson.slice(0, 500)}...
          </pre>
        </div>
      </Modal>
    </div>
  );
};
