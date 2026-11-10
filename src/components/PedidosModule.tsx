import type React from 'react';
import { useRef, useState } from 'react';
import {
  AlertTriangle,
  Box,
  CheckCircle,
  Database,
  Plus,
  Scale,
  Scissors,
  SlidersHorizontal,
  Truck,
  Wrench,
} from 'lucide-react';
import { POLITICA_CARGA_KIRAMAR } from '../types/domain';
import type {
  ClienteCRM,
  Pedido,
  ZonaCobertura,
} from '../types/domain';
import {
  calcularCaracteristicasCarga,
  calcularPesoTotalLinea,
  calcularVolumenTotalLinea,
  validarDatosMaestrosLinea,
} from '../utils/logisticsEngine';

interface PedidosModuleProps {
  pedidos: Pedido[];
  clientes: ClienteCRM[];
  pedidoSeleccionadoId: string;
  onSeleccionarPedido: (id: string) => void;
  onCompletarDatosMaestros: (
    idPedido: string,
    idLinea: string,
    pesoUnitario: number,
    alto: number,
    ancho: number,
    largo: number
  ) => void;
  onDividirPedidoExcedido: (idPedido: string) => void;
  onValidarPedidoParaFlota: (idPedido: string) => void;
  onCrearNuevoPedido: (nuevo: Pedido) => void;
  wmsConectado: boolean;
  onReintentarConexion: () => void;
}

const ZONAS_DISPONIBLES: ZonaCobertura[] = [
  'Zona Industrial - Guayabal / Itagüí',
  'Zona Centro - Medellín Candelaria / Guayaquil',
  'Zona Norte - Bello / Copacabana / Girardota',
  'Zona Sur - Envigado / Sabaneta / Caldas',
  'Oriente Cercano - Rionegro / Guarne',
  'Fuera de Cobertura Estándar',
];

export const PedidosModule: React.FC<PedidosModuleProps> = ({
  pedidos,
  clientes,
  pedidoSeleccionadoId,
  onSeleccionarPedido,
  onCompletarDatosMaestros,
  onDividirPedidoExcedido,
  onValidarPedidoParaFlota,
  onCrearNuevoPedido,
  wmsConectado,
  onReintentarConexion,
}) => {
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [busqueda, setBusqueda] = useState<string>('');
  const dialogNuevoPedidoRef = useRef<HTMLDialogElement>(null);

  // Estado para completar datos maestros inline (UC-02 Camino Alternativo 1)
  const [editPeso, setEditPeso] = useState<number>(165);
  const [editAlto, setEditAlto] = useState<number>(0.85);
  const [editAncho, setEditAncho] = useState<number>(0.65);
  const [editLargo, setEditLargo] = useState<number>(0.75);

  // Estado formulario Nuevo Pedido
  const [nuevoClienteId, setNuevoClienteId] = useState<string>(
    clientes[0]?.idCliente || 'CLI-101'
  );
  const [nuevoDestino, setNuevoDestino] = useState<string>(
    'Calle 30 # 65-18, Sector Industrial Belén, Medellín'
  );
  const [nuevaZona, setNuevaZona] = useState<ZonaCobertura>(
    'Zona Industrial - Guayabal / Itagüí'
  );
  const [nuevaFechaEntrega, setNuevaFechaEntrega] =
    useState<string>('2026-11-10');
  const [nuevoProductoNombre, setNuevoProductoNombre] = useState<string>(
    'Estiba Tubería Sanitaria PVC 4 pulgadas (Paquete x 20)'
  );
  const [nuevaCantidad, setNuevaCantidad] = useState<number>(16);
  const [nuevoPesoUnitario, setNuevoPesoUnitario] = useState<number>(48.5);
  const [nuevoAlto, setNuevoAlto] = useState<number>(0.55);
  const [nuevoAncho, setNuevoAncho] = useState<number>(0.60);
  const [nuevoLargo, setNuevoLargo] = useState<number>(1.80);

  const pedidosFiltrados = pedidos.filter((p) => {
    const coincideTexto =
      p.idPedido.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.nombreCliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.destino.toLowerCase().includes(busqueda.toLowerCase());

    if (!coincideTexto) return false;
    if (filtroEstado === 'TODOS') return true;
    if (filtroEstado === 'PENDIENTES') {
      return ['Pendiente', 'Validado', 'Requiere Datos Maestros', 'Excede Límites'].includes(
        p.estadoPedido
      );
    }
    if (filtroEstado === 'ALERTAS') {
      return ['Requiere Datos Maestros', 'Excede Límites'].includes(p.estadoPedido);
    }
    if (filtroEstado === 'ASIGNADOS') {
      return ['Asignado', 'En Ruta', 'Completado'].includes(p.estadoPedido);
    }
    if (filtroEstado === 'VACIO_DEMO') {
      return false; // Para demostrar UC-01 Camino Alternativo 1
    }
    return true;
  });

  const pedidoActivo =
    pedidos.find((p) => p.idPedido === pedidoSeleccionadoId) || pedidos[0];
  const cargaCalculada = calcularCaracteristicasCarga(pedidoActivo);

  const renderBadgeEstado = (estado: Pedido['estadoPedido']) => {
    const estilos: Record<
      Pedido['estadoPedido'],
      { bg: string; ink: string }
    > = {
      Pendiente: { bg: 'var(--g-alt)', ink: 'var(--c-text)' },
      Validado: { bg: 'var(--state-ok-bg)', ink: 'var(--state-ok-ink)' },
      'Requiere Datos Maestros': {
        bg: 'var(--state-warn-bg)',
        ink: 'var(--state-warn-ink)',
      },
      'Excede Límites': {
        bg: 'var(--state-err-bg)',
        ink: 'var(--state-err-ink)',
      },
      Asignado: { bg: 'var(--state-info-bg)', ink: 'var(--state-info-ink)' },
      'En Ruta': { bg: 'var(--state-info-bg)', ink: 'var(--state-info-ink)' },
      Completado: { bg: 'var(--state-ok-bg)', ink: 'var(--state-ok-ink)' },
      Devolución: { bg: 'var(--state-err-bg)', ink: 'var(--state-err-ink)' },
      Reprogramado: {
        bg: 'var(--state-warn-bg)',
        ink: 'var(--state-warn-ink)',
      },
    };

    const actual = estilos[estado] || estilos.Pendiente;
    return (
      <span
        className="inline-flex items-center px-2.5 py-1 rounded text-[12px] font-mono-tabular font-medium"
        style={{ backgroundColor: actual.bg, color: actual.ink }}
      >
        {estado}
      </span>
    );
  };

  // Camino Alternativo 2 de UC-01: Falla en la conexión con la base de datos
  if (!wmsConectado) {
    return (
      <section className="surface-card p-8 border-2 border-[var(--state-err-ink)]">
        <div className="flex items-start gap-4">
          <Database
            className="w-8 h-8 text-[var(--state-err-ink)] shrink-0 mt-1"
            aria-hidden="true"
          />
          <div>
            <span className="text-[12px] font-mono-tabular font-semibold text-[var(--state-err-ink)]">
              UC-01 · CAMINO ALTERNATIVO 2 · EXCEPCIÓN DE CONEXIÓN WMS/BD
            </span>
            <h2 className="text-[22px] font-semibold text-[var(--ink)] mt-1 mb-2">
              Falla en la conexión con la base de datos de pedidos.
            </h2>
            <p className="text-[16px] text-[var(--c-text)] max-w-[62ch] mb-5">
              El sistema no pudo establecer comunicación con el repositorio de datos WMS de Distribuidora Kiramar S.A.S. Verifique el enlace de red o restablezca la sesión de consulta para continuar con la planificación de despachos.
            </p>
            <button
              type="button"
              onClick={onReintentarConexion}
              className="btn-primary"
            >
              Reintentar operación de consulta
            </button>
          </div>
        </div>
      </section>
    );
  }

  const handleSubmitNuevoPedido = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      const firstInvalid = form.querySelector<HTMLElement>(':invalid');
      firstInvalid?.focus();
      return;
    }

    const clienteObj =
      clientes.find((c) => c.idCliente === nuevoClienteId) || clientes[0];
    const consecutivo = 845 + pedidos.length;
    const idNuevo = `PED-2026-0${consecutivo}`;

    const nuevoPedido: Pedido = {
      idPedido: idNuevo,
      fechaPedido: '2026-11-10',
      fechaEntregaSolicitada: nuevaFechaEntrega,
      estadoPedido:
        nuevoPesoUnitario > 0 && nuevoAlto > 0
          ? 'Validado'
          : 'Requiere Datos Maestros',
      idCliente: clienteObj.idCliente,
      nombreCliente: clienteObj.razonSocial,
      nitCliente: clienteObj.nit,
      contactoEntrega: clienteObj.contactoPrincipal,
      destino: nuevoDestino,
      zonasEntrega: [nuevaZona],
      prioridad: 'Alta',
      codigoWms: `WMS-KRM-${99230 + pedidos.length}`,
      lineas: [
        {
          idLinea: `LIN-${consecutivo}-1`,
          idPedido: idNuevo,
          idProducto: `SKU-${4100 + pedidos.length}`,
          nombreProducto: nuevoProductoNombre,
          cantidad: nuevaCantidad,
          pesoUnitario: nuevoPesoUnitario,
          alto: nuevoAlto,
          ancho: nuevoAncho,
          largo: nuevoLargo,
        },
      ],
    };

    onCrearNuevoPedido(nuevoPedido);
    dialogNuevoPedidoRef.current?.close();
  };

  return (
    <div className="space-y-6">
      {/* Sección 1: UC-01 / RF-01 — Gestión de pedidos pendientes */}
      <section
        aria-labelledby="heading-uc01"
        className="surface-card p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <span className="text-[12px] font-mono-tabular font-medium text-[var(--muted)]">
              CASO DE USO UC-01 · REQUISITO FUNCIONAL RF-01 (RU-01)
            </span>
            <h2
              id="heading-uc01"
              className="text-[20px] sm:text-[22px] font-semibold text-[var(--ink)] m-0 mt-0.5"
            >
              Consultar y gestionar pedidos pendientes de despacho.
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => dialogNuevoPedidoRef.current?.showModal()}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Registrar pedido WMS</span>
            </button>
          </div>
        </div>

        {/* Controles de filtrado y búsqueda */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-3 rounded-[10px] bg-[var(--g-main)] border border-[var(--hairline)]">
          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal
              className="w-4 h-4 text-[var(--muted)] mr-1"
              aria-hidden="true"
            />
            {[
              { id: 'TODOS', label: 'Todos los pedidos' },
              { id: 'PENDIENTES', label: 'Pendientes de despacho' },
              { id: 'ALERTAS', label: 'Con alertas de carga (UC-02)' },
              { id: 'ASIGNADOS', label: 'Asignados / En Ruta' },
              { id: 'VACIO_DEMO', label: 'Filtro sin registros (Camino Alt. 1)' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltroEstado(f.id)}
                className={`px-3 py-1.5 rounded-[6px] text-[13px] font-medium cursor-pointer transition-colors ${
                  filtroEstado === f.id
                    ? 'bg-[var(--ink)] text-white'
                    : 'bg-[var(--card)] text-[var(--c-text)] border border-[var(--hairline)] hover:border-[var(--ink)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64">
            <label htmlFor="buscar-pedido" className="sr-only">
              Buscar pedido por código, cliente o destino
            </label>
            <input
              id="buscar-pedido"
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar código, cliente o zona..."
              className="w-full h-9 px-3 rounded-[6px] text-[14px] bg-[var(--card)] border border-[var(--hairline-strong)] text-[var(--ink)]"
            />
          </div>
        </div>

        {/* Tabla adaptativa (modern-web-guidance: responsive-table) */}
        {pedidosFiltrados.length === 0 ? (
          <div className="p-8 rounded-[10px] bg-[var(--g-main)] border border-[var(--hairline)] text-center">
            <p className="text-[13px] font-mono-tabular text-[var(--action)] mb-1">
              UC-01 · CAMINO ALTERNATIVO 1
            </p>
            <h3 className="text-[18px] font-semibold text-[var(--ink)] m-0 mb-2">
              El sistema no encuentra pedidos pendientes en el estado actual.
            </h3>
            <p className="text-[15px] text-[var(--muted)] m-0 mb-4">
              No existen registros para despachar con los criterios seleccionados. Restablezca el filtro para visualizar la bandeja operativa.
            </p>
            <button
              type="button"
              onClick={() => {
                setFiltroEstado('TODOS');
                setBusqueda('');
              }}
              className="btn-secondary"
            >
              Mostrar todos los pedidos
            </button>
          </div>
        ) : (
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="caption-pedidos"
            className="table-wrapper"
          >
            <table
              style={
                {
                  '--label-2': '"Cliente y NIT"',
                  '--label-3': '"Destino y Zona"',
                  '--label-4': '"Carga Consolidada"',
                  '--label-5': '"Estado"',
                  '--label-6': '"Acción"',
                } as React.CSSProperties
              }
            >
              <caption id="caption-pedidos" className="sr-only">
                Bandeja de pedidos de Distribuidora Kiramar S.A.S. pendientes de planificación y despacho
              </caption>
              <thead>
                <tr>
                  <th scope="col">ID Pedido / WMS</th>
                  <th scope="col">Cliente / Destinatario</th>
                  <th scope="col">Destino y Zona de Entrega</th>
                  <th scope="col">Peso / Volumen Consolidado</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Inspección</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.map((pedido) => {
                  const carga = calcularCaracteristicasCarga(pedido);
                  const seleccionado = pedido.idPedido === pedidoActivo.idPedido;
                  return (
                    <tr
                      key={pedido.idPedido}
                      onClick={() => onSeleccionarPedido(pedido.idPedido)}
                      className={`cursor-pointer ${
                        seleccionado ? 'bg-[#f8f5f1]' : ''
                      }`}
                    >
                      <th scope="row">
                        <div className="font-mono-tabular font-semibold text-[var(--ink)]">
                          {pedido.idPedido}
                        </div>
                        <div className="text-[12px] font-mono-tabular text-[var(--muted)] font-normal">
                          {pedido.codigoWms} · {pedido.fechaEntregaSolicitada}
                        </div>
                      </th>
                      <td>
                        <div className="font-medium text-[var(--ink)]">
                          {pedido.nombreCliente}
                        </div>
                        <div className="text-[13px] text-[var(--muted)]">
                          NIT {pedido.nitCliente} · Recibe: {pedido.contactoEntrega}
                        </div>
                      </td>
                      <td>
                        <div className="text-[14px] text-[var(--ink)] max-w-[300px] truncate">
                          {pedido.destino}
                        </div>
                        <div className="text-[12px] font-mono-tabular text-[var(--muted)]">
                          {pedido.zonasEntrega.join(' + ')}
                        </div>
                      </td>
                      <td>
                        <div className="font-mono-tabular font-medium text-[var(--ink)]">
                          {carga.pesoTotalKg.toLocaleString('es-CO')}&nbsp;kg ·{' '}
                          {carga.volumenTotalM3.toLocaleString('es-CO')}&nbsp;m³
                        </div>
                        <div className="text-[12px] font-mono-tabular text-[var(--muted)]">
                          {pedido.lineas.length} líneas · Máx {carga.dimMaxLargo}×
                          {carga.dimMaxAncho}×{carga.dimMaxAlto}&nbsp;m
                        </div>
                      </td>
                      <td>{renderBadgeEstado(pedido.estadoPedido)}</td>
                      <td>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSeleccionarPedido(pedido.idPedido);
                          }}
                          className={
                            seleccionado ? 'btn-primary !min-h-[36px] !px-3 !text-[13px]' : 'btn-secondary !min-h-[36px] !px-3 !text-[13px]'
                          }
                        >
                          {seleccionado ? 'Seleccionado' : 'Analizar carga'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Sección 2: UC-02 / RF-02 — Cálculo y consulta de características de carga */}
      <section
        aria-labelledby="heading-uc02"
        className="surface-card p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5 pb-4 border-b border-[var(--hairline)]">
          <div>
            <span className="text-[12px] font-mono-tabular font-medium text-[var(--action)]">
              CASO DE USO UC-02 · REQUISITO FUNCIONAL RF-02 (RU-02) · CLASE CargaPedido
            </span>
            <h2
              id="heading-uc02"
              className="text-[20px] sm:text-[22px] font-semibold text-[var(--ink)] m-0 mt-0.5"
            >
              Cálculo volumétrico y características físicas de carga:{' '}
              <span className="font-mono-tabular">{pedidoActivo.idPedido}</span>
            </h2>
            <p className="text-[15px] text-[var(--muted)] m-0 mt-1">
              Cliente: <strong className="text-[var(--ink)]">{pedidoActivo.nombreCliente}</strong> · Destino:{' '}
              {pedidoActivo.destino}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={
                !cargaCalculada.datosMaestrosCompletos ||
                cargaCalculada.excedeLimitesEmpresa
              }
              onClick={() => onValidarPedidoParaFlota(pedidoActivo.idPedido)}
              className="btn-primary"
            >
              <Truck className="w-4 h-4" aria-hidden="true" />
              <span>Seleccionar vehículo para este pedido (Ir a UC-03)</span>
            </button>
          </div>
        </div>

        {/* Alertas de Caminos Alternativos de UC-02 */}
        {!cargaCalculada.datosMaestrosCompletos && (
          <div className="mb-5 p-4 rounded-[10px] bg-[var(--state-warn-bg)] border border-[var(--state-warn-ink)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className="w-5 h-5 text-[var(--state-warn-ink)] shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <span className="text-[12px] font-mono-tabular font-semibold text-[var(--state-warn-ink)]">
                    UC-02 · CAMINO ALTERNATIVO 1 · DATOS MAESTROS FALTANTES EN PRODUCTO
                  </span>
                  <h3 className="text-[16px] font-semibold text-[var(--ink)] m-0 mt-0.5">
                    A uno o más productos del pedido les falta información maestra (peso individual o dimensiones).
                  </h3>
                  <p className="text-[14px] text-[var(--c-text)] m-0 mt-1">
                    Complete las especificaciones físicas del producto faltante para consolidar el cálculo de <code className="font-mono-tabular">CargaPedido</code> y habilitar la selección vehicular.
                  </p>
                </div>
              </div>
            </div>

            {pedidoActivo.lineas
              .filter((l) => !validarDatosMaestrosLinea(l))
              .map((lineaIncompleta) => (
                <div
                  key={lineaIncompleta.idLinea}
                  className="mt-4 pt-4 border-t border-[var(--hairline-strong)] grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
                >
                  <div>
                    <label
                      htmlFor={`peso-${lineaIncompleta.idLinea}`}
                      className="block text-[13px] font-medium text-[var(--ink)] mb-1"
                    >
                      Peso unitario (kg)
                    </label>
                    <input
                      id={`peso-${lineaIncompleta.idLinea}`}
                      type="number"
                      step="0.5"
                      min="1"
                      value={editPeso}
                      onChange={(e) => setEditPeso(Number(e.target.value))}
                      className="field-input !min-h-[40px]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`largo-${lineaIncompleta.idLinea}`}
                      className="block text-[13px] font-medium text-[var(--ink)] mb-1"
                    >
                      Largo (m)
                    </label>
                    <input
                      id={`largo-${lineaIncompleta.idLinea}`}
                      type="number"
                      step="0.05"
                      min="0.1"
                      value={editLargo}
                      onChange={(e) => setEditLargo(Number(e.target.value))}
                      className="field-input !min-h-[40px]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`ancho-${lineaIncompleta.idLinea}`}
                      className="block text-[13px] font-medium text-[var(--ink)] mb-1"
                    >
                      Ancho (m)
                    </label>
                    <input
                      id={`ancho-${lineaIncompleta.idLinea}`}
                      type="number"
                      step="0.05"
                      min="0.1"
                      value={editAncho}
                      onChange={(e) => setEditAncho(Number(e.target.value))}
                      className="field-input !min-h-[40px]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`alto-${lineaIncompleta.idLinea}`}
                      className="block text-[13px] font-medium text-[var(--ink)] mb-1"
                    >
                      Alto (m)
                    </label>
                    <input
                      id={`alto-${lineaIncompleta.idLinea}`}
                      type="number"
                      step="0.05"
                      min="0.1"
                      value={editAlto}
                      onChange={(e) => setEditAlto(Number(e.target.value))}
                      className="field-input !min-h-[40px]"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() =>
                        onCompletarDatosMaestros(
                          pedidoActivo.idPedido,
                          lineaIncompleta.idLinea,
                          editPeso,
                          editAlto,
                          editAncho,
                          editLargo
                        )
                      }
                      className="btn-primary w-full !min-h-[40px]"
                    >
                      <Wrench className="w-4 h-4" aria-hidden="true" />
                      <span>Guardar maestro SKU</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {cargaCalculada.excedeLimitesEmpresa && (
          <div className="mb-5 p-4 rounded-[10px] bg-[var(--state-err-bg)] border border-[var(--state-err-ink)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Scale
                className="w-5 h-5 text-[var(--state-err-ink)] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <span className="text-[12px] font-mono-tabular font-semibold text-[var(--state-err-ink)]">
                  UC-02 · CAMINO ALTERNATIVO 2 · EXCESO DE LÍMITE CORPORATIVO POR DESPACHO
                </span>
                <h3 className="text-[16px] font-semibold text-[var(--ink)] m-0 mt-0.5">
                  La carga calculada ({cargaCalculada.pesoTotalKg.toLocaleString('es-CO')}&nbsp;kg /{' '}
                  {cargaCalculada.volumenTotalM3.toLocaleString('es-CO')}&nbsp;m³) excede el máximo permitido para un solo despacho ({POLITICA_CARGA_KIRAMAR.maxPesoUnicoDespachoKg.toLocaleString('es-CO')}&nbsp;kg /{' '}
                  {POLITICA_CARGA_KIRAMAR.maxVolumenUnicoDespachoM3}&nbsp;m³).
                </h3>
                <p className="text-[14px] text-[var(--c-text)] m-0 mt-1">
                  El sistema sugiere dividir el pedido en dos sub-pedidos balanceados para asignar transporte de manera segura.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onDividirPedidoExcedido(pedidoActivo.idPedido)}
              className="btn-primary"
            >
              <Scissors className="w-4 h-4" aria-hidden="true" />
              <span>Dividir pedido automáticamente</span>
            </button>
          </div>
        )}

        {/* Tarjetas de consolidado de CargaPedido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="surface-panel p-4">
            <div className="text-[13px] text-[var(--muted)] font-medium">
              ID Consolidado (PK id_carga)
            </div>
            <div className="text-[22px] font-mono-tabular font-semibold text-[var(--ink)] mt-1">
              {cargaCalculada.idCarga}
            </div>
            <div className="text-[12px] font-mono-tabular text-[var(--muted)] mt-1">
              FK id_pedido: {cargaCalculada.idPedido}
            </div>
          </div>

          <div className="surface-panel p-4">
            <div className="text-[13px] text-[var(--muted)] font-medium">
              Peso Total Consolidado (pesoTotalKg)
            </div>
            <div className="text-[22px] font-mono-tabular font-semibold text-[var(--ink)] mt-1">
              {cargaCalculada.pesoTotalKg.toLocaleString('es-CO')}&nbsp;kg
            </div>
            <div className="text-[12px] font-mono-tabular text-[var(--muted)] mt-1">
              Límite despacho único:{' '}
              {POLITICA_CARGA_KIRAMAR.maxPesoUnicoDespachoKg.toLocaleString('es-CO')}&nbsp;kg
            </div>
          </div>

          <div className="surface-panel p-4">
            <div className="text-[13px] text-[var(--muted)] font-medium">
              Volumen Total Cubicado (volumenTotalM3)
            </div>
            <div className="text-[22px] font-mono-tabular font-semibold text-[var(--ink)] mt-1">
              {cargaCalculada.volumenTotalM3.toLocaleString('es-CO')}&nbsp;m³
            </div>
            <div className="text-[12px] font-mono-tabular text-[var(--muted)] mt-1">
              Límite volumétrico: {POLITICA_CARGA_KIRAMAR.maxVolumenUnicoDespachoM3}&nbsp;m³
            </div>
          </div>

          <div className="surface-panel p-4">
            <div className="text-[13px] text-[var(--muted)] font-medium">
              Dimensiones Máximas Unitarias (L × A × H)
            </div>
            <div className="text-[22px] font-mono-tabular font-semibold text-[var(--ink)] mt-1">
              {cargaCalculada.dimMaxLargo} × {cargaCalculada.dimMaxAncho} ×{' '}
              {cargaCalculada.dimMaxAlto}&nbsp;m
            </div>
            <div className="text-[12px] font-mono-tabular text-[var(--muted)] mt-1">
              {cargaCalculada.datosMaestrosCompletos
                ? 'Validación maestra: Completa'
                : 'Validación maestra: Incompleta'}
            </div>
          </div>
        </div>

        {/* Tabla de Líneas de Pedido (Entidad LINEA_PEDIDO) */}
        <h3 className="text-[16px] font-semibold text-[var(--ink)] mb-3 flex items-center gap-2">
          <Box className="w-4 h-4 text-[var(--action)]" aria-hidden="true" />
          <span>
            Desglose de líneas de pedido (<code className="font-mono-tabular">LINEA_PEDIDO</code>)
          </span>
        </h3>

        <div
          tabIndex={0}
          role="region"
          aria-label="Líneas de producto del pedido seleccionado"
          className="table-wrapper"
        >
          <table
            style={
              {
                '--label-2': '"Producto"',
                '--label-3': '"Cantidad"',
                '--label-4': '"Peso Unitario / Total"',
                '--label-5': '"Dimensiones (L×A×H)"',
                '--label-6': '"Volumen Total"',
              } as React.CSSProperties
            }
          >
            <thead>
              <tr>
                <th scope="col">ID Línea / SKU</th>
                <th scope="col">Descripción de Producto</th>
                <th scope="col">Cantidad</th>
                <th scope="col">Peso Unit. / Peso Total</th>
                <th scope="col">Dimensiones (L × A × H)</th>
                <th scope="col">Volumen Total</th>
              </tr>
            </thead>
            <tbody>
              {pedidoActivo.lineas.map((linea) => {
                const valido = validarDatosMaestrosLinea(linea);
                const pesoLinea = calcularPesoTotalLinea(linea);
                const volLinea = calcularVolumenTotalLinea(linea);
                return (
                  <tr key={linea.idLinea}>
                    <th scope="row" className="font-mono-tabular">
                      <div>{linea.idLinea}</div>
                      <div className="text-[12px] text-[var(--muted)] font-normal">
                        {linea.idProducto}
                      </div>
                    </th>
                    <td>
                      <div className="font-medium text-[var(--ink)]">
                        {linea.nombreProducto}
                      </div>
                      {!valido && (
                        <span className="inline-flex items-center gap-1 text-[12px] font-mono-tabular text-[var(--state-warn-ink)] mt-1">
                          <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                          Falta peso o dimensión en maestro WMS
                        </span>
                      )}
                    </td>
                    <td className="font-mono-tabular font-medium">
                      {linea.cantidad}&nbsp;und
                    </td>
                    <td className="font-mono-tabular">
                      <div>{linea.pesoUnitario}&nbsp;kg / und</div>
                      <div className="font-semibold text-[var(--ink)]">
                        Total: {pesoLinea.toLocaleString('es-CO')}&nbsp;kg
                      </div>
                    </td>
                    <td className="font-mono-tabular">
                      {linea.largo}&nbsp;m × {linea.ancho}&nbsp;m × {linea.alto}&nbsp;m
                    </td>
                    <td className="font-mono-tabular font-semibold text-[var(--ink)]">
                      <div className="flex items-center gap-2">
                        <span>{volLinea.toLocaleString('es-CO')}&nbsp;m³</span>
                        {valido && (
                          <CheckCircle
                            className="w-4 h-4 text-[var(--state-ok-ink)]"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Nativo <dialog> para Registrar Pedido (modern-web-guidance: dialog & validate-input-after-interaction) */}
      <dialog
        ref={dialogNuevoPedidoRef}
        aria-labelledby="dialog-nuevo-pedido-title"
      >
        <div className="p-6">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[var(--hairline)]">
            <div>
              <span className="text-[12px] font-mono-tabular text-[var(--action)] font-medium">
                SINCRONIZACIÓN WMS KIRAMAR · RF-01
              </span>
              <h2
                id="dialog-nuevo-pedido-title"
                className="text-[20px] font-semibold text-[var(--ink)] m-0"
              >
                Registrar nuevo pedido para planificación de despacho
              </h2>
            </div>
            <button
              type="button"
              onClick={() => dialogNuevoPedidoRef.current?.close()}
              className="btn-secondary !min-h-[38px] !px-3"
              aria-label="Cerrar ventana de nuevo pedido"
            >
              Cerrar
            </button>
          </div>

          <form onSubmit={handleSubmitNuevoPedido} noValidate className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="np-cliente"
                  className="block text-[14px] font-medium text-[var(--ink)] mb-1"
                >
                  Cliente registrado (CRM Kiramar)
                </label>
                <select
                  id="np-cliente"
                  value={nuevoClienteId}
                  onChange={(e) => {
                    setNuevoClienteId(e.target.value);
                    const found = clientes.find((c) => c.idCliente === e.target.value);
                    if (found) {
                      setNuevoDestino(found.direccionPrincipal);
                      setNuevaZona(found.zonaLogistica as ZonaCobertura);
                    }
                  }}
                  className="field-input"
                  required
                >
                  {clientes.map((c) => (
                    <option key={c.idCliente} value={c.idCliente}>
                      {c.razonSocial} ({c.municipio})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="np-fecha"
                  className="block text-[14px] font-medium text-[var(--ink)] mb-1"
                >
                  Fecha programada de despacho
                </label>
                <input
                  id="np-fecha"
                  type="date"
                  value={nuevaFechaEntrega}
                  onChange={(e) => setNuevaFechaEntrega(e.target.value)}
                  className="field-input font-mono-tabular"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="np-destino"
                  className="block text-[14px] font-medium text-[var(--ink)] mb-1"
                >
                  Dirección de entrega (separe múltiples paradas con ;)
                </label>
                <input
                  id="np-destino"
                  type="text"
                  value={nuevoDestino}
                  onChange={(e) => setNuevoDestino(e.target.value)}
                  className="field-input"
                  required
                  minLength={8}
                />
                <div className="error-msg">
                  Ingrese una dirección de destino válida (mínimo 8 caracteres).
                </div>
              </div>

              <div>
                <label
                  htmlFor="np-zona"
                  className="block text-[14px] font-medium text-[var(--ink)] mb-1"
                >
                  Zona logística asociada
                </label>
                <select
                  id="np-zona"
                  value={nuevaZona}
                  onChange={(e) => setNuevaZona(e.target.value as ZonaCobertura)}
                  className="field-input"
                >
                  {ZONAS_DISPONIBLES.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 rounded-[10px] bg-[var(--g-main)] border border-[var(--hairline)] space-y-3">
              <div className="text-[13px] font-mono-tabular font-semibold text-[var(--ink)]">
                LÍNEA DE PRODUCTO INICIAL (LINEA_PEDIDO)
              </div>

              <div>
                <label
                  htmlFor="np-prod"
                  className="block text-[14px] font-medium text-[var(--ink)] mb-1"
                >
                  Nombre del producto / Referencia industrial
                </label>
                <input
                  id="np-prod"
                  type="text"
                  value={nuevoProductoNombre}
                  onChange={(e) => setNuevoProductoNombre(e.target.value)}
                  className="field-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label
                    htmlFor="np-cant"
                    className="block text-[13px] font-medium text-[var(--ink)] mb-1"
                  >
                    Cantidad
                  </label>
                  <input
                    id="np-cant"
                    type="number"
                    min={1}
                    value={nuevaCantidad}
                    onChange={(e) => setNuevaCantidad(Number(e.target.value))}
                    className="field-input font-mono-tabular"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="np-peso"
                    className="block text-[13px] font-medium text-[var(--ink)] mb-1"
                  >
                    Peso unit. (kg)
                  </label>
                  <input
                    id="np-peso"
                    type="number"
                    step="0.5"
                    min={0}
                    value={nuevoPesoUnitario}
                    onChange={(e) => setNuevoPesoUnitario(Number(e.target.value))}
                    className="field-input font-mono-tabular"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="np-largo"
                    className="block text-[13px] font-medium text-[var(--ink)] mb-1"
                  >
                    Largo (m)
                  </label>
                  <input
                    id="np-largo"
                    type="number"
                    step="0.05"
                    min={0.1}
                    value={nuevoLargo}
                    onChange={(e) => setNuevoLargo(Number(e.target.value))}
                    className="field-input font-mono-tabular"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="np-ancho"
                    className="block text-[13px] font-medium text-[var(--ink)] mb-1"
                  >
                    Ancho (m)
                  </label>
                  <input
                    id="np-ancho"
                    type="number"
                    step="0.05"
                    min={0.1}
                    value={nuevoAncho}
                    onChange={(e) => setNuevoAncho(Number(e.target.value))}
                    className="field-input font-mono-tabular"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="np-alto"
                    className="block text-[13px] font-medium text-[var(--ink)] mb-1"
                  >
                    Alto (m)
                  </label>
                  <input
                    id="np-alto"
                    type="number"
                    step="0.05"
                    min={0.1}
                    value={nuevoAlto}
                    onChange={(e) => setNuevoAlto(Number(e.target.value))}
                    className="field-input font-mono-tabular"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--hairline)]">
              <button
                type="button"
                onClick={() => dialogNuevoPedidoRef.current?.close()}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                Guardar pedido y calcular carga
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};
