import type React from 'react';
import { useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Box,
  CheckCircle,
  Database,
  FileText,
  MapPin,
  Plus,
  Scale,
  Scissors,
  Search,
  Truck,
  UserCheck,
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
  vistaSubmodulo: 'pedidos' | 'cubicaje';
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
  onIrCubicaje: (idPedido: string) => void;
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
  vistaSubmodulo,
  pedidos,
  clientes,
  pedidoSeleccionadoId,
  onSeleccionarPedido,
  onCompletarDatosMaestros,
  onDividirPedidoExcedido,
  onIrCubicaje,
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
      return [
        'Pendiente',
        'Validado',
        'Requiere Datos Maestros',
        'Excede Límites',
      ].includes(p.estadoPedido);
    }
    if (filtroEstado === 'ALERTAS') {
      return ['Requiere Datos Maestros', 'Excede Límites'].includes(
        p.estadoPedido
      );
    }
    if (filtroEstado === 'ASIGNADOS') {
      return ['Asignado', 'En Ruta', 'Completado'].includes(p.estadoPedido);
    }
    if (filtroEstado === 'VACIO_DEMO') {
      return false;
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
        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono-tabular font-semibold"
        style={{ backgroundColor: actual.bg, color: actual.ink }}
      >
        {estado}
      </span>
    );
  };

  if (!wmsConectado) {
    return (
      <section className="crm-card p-6 border-2 border-[var(--state-err-ink)]">
        <div className="flex items-start gap-4">
          <Database
            className="w-7 h-7 text-[var(--state-err-ink)] shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <span className="text-[11px] font-mono-tabular font-semibold text-[var(--state-err-ink)]">
              UC-01 · CAMINO ALTERNATIVO 2 · EXCEPCIÓN DE CONEXIÓN WMS/BD
            </span>
            <h2 className="text-[18px] font-semibold text-[var(--ink)] mt-1 mb-1.5">
              Falla en la conexión con la base de datos de pedidos.
            </h2>
            <p className="text-[13px] text-[var(--c-text)] max-w-[65ch] mb-4">
              El sistema no pudo establecer comunicación con el repositorio de datos WMS de Distribuidora Kiramar S.A.S. Verifique el enlace de red o restablezca la sesión de consulta para continuar.
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

  /* ========================================================================
   * VISTA A: BANDEJA DE PEDIDOS COMERCIALES (Master-Detail CRM Layout - RF-01)
   * ======================================================================== */
  if (vistaSubmodulo === 'pedidos') {
    return (
      <div className="space-y-4">
        {/* Barra de Herramientas y Filtros del CRM */}
        <div className="crm-card p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'TODOS', label: `Todos (${pedidos.length})` },
              { id: 'PENDIENTES', label: 'Por Despachar' },
              { id: 'ALERTAS', label: 'Con Excepción (UC-02)' },
              { id: 'ASIGNADOS', label: 'Asignados / En Ruta' },
              { id: 'VACIO_DEMO', label: 'Vista Vacía (UC-01 Alt. 1)' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltroEstado(f.id)}
                className={`px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium cursor-pointer transition-colors ${
                  filtroEstado === f.id
                    ? 'bg-[var(--ink)] text-white'
                    : 'bg-[var(--g-main)] text-[var(--c-text)] hover:bg-[var(--g-alt)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <label htmlFor="buscar-pedido" className="sr-only">
                Buscar pedido por código, cliente o destino
              </label>
              <input
                id="buscar-pedido"
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Filtrar pedido, NIT, cliente..."
                className="w-full h-9 pl-8 pr-3 rounded-[6px] text-[13px] bg-[var(--g-main)] border border-[var(--hairline-strong)] text-[var(--ink)]"
              />
            </div>

            <button
              type="button"
              onClick={() => dialogNuevoPedidoRef.current?.showModal()}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Nuevo Pedido</span>
            </button>
          </div>
        </div>

        {/* Layout Maestro-Detalle (7 columnas Tabla + 5 columnas Inspector CRM) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Columna Izquierda: Tabla de Pedidos */}
          <div className="lg:col-span-7 crm-card overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--hairline)] flex items-center justify-between bg-[#faf9f6]">
              <span className="font-semibold text-[13px] text-[var(--ink)]">
                Listado Maestro de Pedidos (`PEDIDO`)
              </span>
              <span className="text-[11px] font-mono-tabular text-[var(--muted)]">
                {pedidosFiltrados.length} registro(s)
              </span>
            </div>

            {pedidosFiltrados.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[11px] font-mono-tabular text-[var(--action)] mb-1">
                  UC-01 · CAMINO ALTERNATIVO 1
                </p>
                <h3 className="text-[15px] font-semibold text-[var(--ink)] m-0 mb-1">
                  El sistema no encuentra pedidos pendientes en el estado actual.
                </h3>
                <p className="text-[13px] text-[var(--muted)] m-0 mb-4">
                  No existen registros para despachar con los criterios seleccionados.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFiltroEstado('TODOS');
                    setBusqueda('');
                  }}
                  className="btn-secondary"
                >
                  Restablecer vista completa
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
                      '--label-2': '"Cliente"',
                      '--label-3': '"Peso y Vol."',
                      '--label-4': '"Estado"',
                    } as React.CSSProperties
                  }
                >
                  <caption id="caption-pedidos" className="sr-only">
                    Bandeja maestra de pedidos comerciales
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Código / WMS</th>
                      <th scope="col">Cuenta Cliente</th>
                      <th scope="col">Carga Total</th>
                      <th scope="col">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidosFiltrados.map((pedido) => {
                      const carga = calcularCaracteristicasCarga(pedido);
                      const seleccionado =
                        pedido.idPedido === pedidoActivo.idPedido;
                      return (
                        <tr
                          key={pedido.idPedido}
                          onClick={() => onSeleccionarPedido(pedido.idPedido)}
                          className={`cursor-pointer ${
                            seleccionado ? 'row-selected' : ''
                          }`}
                        >
                          <th scope="row">
                            <div className="font-mono-tabular font-semibold text-[var(--ink)]">
                              {pedido.idPedido}
                            </div>
                            <div className="text-[11px] font-mono-tabular text-[var(--muted)] font-normal">
                              {pedido.codigoWms} · {pedido.fechaEntregaSolicitada}
                            </div>
                          </th>
                          <td>
                            <div className="font-medium text-[var(--ink)]">
                              {pedido.nombreCliente}
                            </div>
                            <div className="text-[11px] text-[var(--muted)] truncate max-w-[210px]">
                              {pedido.zonasEntrega[0]}
                            </div>
                          </td>
                          <td>
                            <div className="font-mono-tabular font-semibold text-[var(--ink)]">
                              {carga.pesoTotalKg.toLocaleString('es-CO')}&nbsp;kg
                            </div>
                            <div className="text-[11px] font-mono-tabular text-[var(--muted)]">
                              {carga.volumenTotalM3}&nbsp;m³ · {pedido.lineas.length} ítem(s)
                            </div>
                          </td>
                          <td>{renderBadgeEstado(pedido.estadoPedido)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Columna Derecha: Panel Inspector del Pedido Seleccionado (Ficha CRM) */}
          <aside
            aria-label="Ficha de inspección del pedido seleccionado"
            className="lg:col-span-5 crm-card p-4 sm:p-5 space-y-4 sticky top-[74px]"
          >
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-[var(--hairline)]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono-tabular font-bold text-[16px] text-[var(--ink)]">
                    {pedidoActivo.idPedido}
                  </span>
                  {renderBadgeEstado(pedidoActivo.estadoPedido)}
                </div>
                <div className="text-[12px] font-mono-tabular text-[var(--muted)] mt-0.5">
                  Ref. WMS: {pedidoActivo.codigoWms} · Prioridad: {pedidoActivo.prioridad}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onIrCubicaje(pedidoActivo.idPedido)}
                className="btn-primary !min-h-[34px] !text-[12px]"
              >
                <Box className="w-3.5 h-3.5" />
                <span>Abrir en Cubicaje (UC-02)</span>
              </button>
            </div>

            {/* Datos del Cliente y Destino */}
            <div className="crm-panel p-3.5 space-y-2.5 text-[13px]">
              <div className="flex items-start gap-2.5">
                <UserCheck className="w-4 h-4 text-[var(--muted)] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] font-mono-tabular uppercase text-[var(--muted)]">
                    Cliente y Contacto de Recibo
                  </div>
                  <div className="font-semibold text-[var(--ink)]">
                    {pedidoActivo.nombreCliente} (NIT {pedidoActivo.nitCliente})
                  </div>
                  <div className="text-[12px] text-[var(--c-text)]">
                    Recibe en obra/bodega: {pedidoActivo.contactoEntrega}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-[var(--hairline)]">
                <MapPin className="w-4 h-4 text-[var(--action)] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] font-mono-tabular uppercase text-[var(--muted)]">
                    Puntos de Entrega y Zonas
                  </div>
                  <div className="font-medium text-[var(--ink)]">
                    {pedidoActivo.destino}
                  </div>
                  <div className="text-[11px] font-mono-tabular text-[var(--muted)] mt-0.5">
                    {pedidoActivo.zonasEntrega.join(' | ')}
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen Rápido de Carga */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="crm-panel p-2.5">
                <div className="text-[11px] text-[var(--muted)]">Peso Total</div>
                <div className="font-mono-tabular font-semibold text-[15px] text-[var(--ink)]">
                  {cargaCalculada.pesoTotalKg.toLocaleString('es-CO')}&nbsp;kg
                </div>
              </div>
              <div className="crm-panel p-2.5">
                <div className="text-[11px] text-[var(--muted)]">Volumen</div>
                <div className="font-mono-tabular font-semibold text-[15px] text-[var(--ink)]">
                  {cargaCalculada.volumenTotalM3}&nbsp;m³
                </div>
              </div>
              <div className="crm-panel p-2.5">
                <div className="text-[11px] text-[var(--muted)]">Dim. Máxima</div>
                <div className="font-mono-tabular font-semibold text-[13px] text-[var(--ink)]">
                  {cargaCalculada.dimMaxLargo}×{cargaCalculada.dimMaxAncho}×
                  {cargaCalculada.dimMaxAlto}m
                </div>
              </div>
            </div>

            {/* Líneas de Producto del Pedido */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-semibold text-[var(--ink)] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[var(--muted)]" />
                  Ítems del Pedido (`LINEA_PEDIDO` — {pedidoActivo.lineas.length})
                </span>
              </div>

              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {pedidoActivo.lineas.map((l) => {
                  const ok = validarDatosMaestrosLinea(l);
                  return (
                    <div
                      key={l.idLinea}
                      className="p-2.5 rounded-[7px] bg-[var(--g-main)] border border-[var(--hairline)] text-[12px]"
                    >
                      <div className="flex items-center justify-between font-mono-tabular text-[11px] text-[var(--muted)]">
                        <span>
                          {l.idLinea} · {l.idProducto}
                        </span>
                        <span className="font-semibold text-[var(--ink)]">
                          {l.cantidad} und
                        </span>
                      </div>
                      <div className="font-medium text-[var(--ink)] mt-0.5">
                        {l.nombreProducto}
                      </div>
                      <div className="flex items-center justify-between mt-1 pt-1 border-t border-[var(--hairline)] font-mono-tabular text-[11px]">
                        <span>
                          {calcularPesoTotalLinea(l).toLocaleString('es-CO')}&nbsp;kg ·{' '}
                          {calcularVolumenTotalLinea(l)}&nbsp;m³
                        </span>
                        {!ok ? (
                          <span className="text-[var(--state-warn-ink)] font-semibold">
                            Falta maestro SKU
                          </span>
                        ) : (
                          <span className="text-[var(--state-ok-ink)]">
                            Dimensionado OK
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Botones de Acción Directa del Inspector */}
            <div className="pt-2 border-t border-[var(--hairline)] flex items-center gap-2">
              <button
                type="button"
                onClick={() => onIrCubicaje(pedidoActivo.idPedido)}
                className="btn-secondary flex-1"
              >
                Analizar carga (UC-02)
              </button>
              <button
                type="button"
                disabled={
                  !cargaCalculada.datosMaestrosCompletos ||
                  cargaCalculada.excedeLimitesEmpresa
                }
                onClick={() => onValidarPedidoParaFlota(pedidoActivo.idPedido)}
                className="btn-primary flex-1"
              >
                <span>Asignar vehículo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </aside>
        </div>

        {/* Modal Nativo <dialog> para Registrar Pedido */}
        <dialog
          ref={dialogNuevoPedidoRef}
          aria-labelledby="dialog-nuevo-pedido-title"
        >
          <div className="p-5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--hairline)]">
              <div>
                <span className="text-[11px] font-mono-tabular text-[var(--action)] font-semibold">
                  SINCRONIZACIÓN WMS KIRAMAR · RF-01
                </span>
                <h2
                  id="dialog-nuevo-pedido-title"
                  className="text-[17px] font-semibold text-[var(--ink)] m-0"
                >
                  Registrar nuevo pedido comercial
                </h2>
              </div>
              <button
                type="button"
                onClick={() => dialogNuevoPedidoRef.current?.close()}
                className="btn-secondary !min-h-[32px] !px-2.5"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSubmitNuevoPedido} noValidate className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="np-cliente"
                    className="block text-[12px] font-medium text-[var(--ink)] mb-1"
                  >
                    Cuenta Cliente (CRM Kiramar)
                  </label>
                  <select
                    id="np-cliente"
                    value={nuevoClienteId}
                    onChange={(e) => {
                      setNuevoClienteId(e.target.value);
                      const found = clientes.find(
                        (c) => c.idCliente === e.target.value
                      );
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
                    className="block text-[12px] font-medium text-[var(--ink)] mb-1"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="np-destino"
                    className="block text-[12px] font-medium text-[var(--ink)] mb-1"
                  >
                    Dirección de entrega
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
                    className="block text-[12px] font-medium text-[var(--ink)] mb-1"
                  >
                    Zona logística asociada
                  </label>
                  <select
                    id="np-zona"
                    value={nuevaZona}
                    onChange={(e) =>
                      setNuevaZona(e.target.value as ZonaCobertura)
                    }
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

              <div className="p-3.5 rounded-[8px] bg-[var(--g-main)] border border-[var(--hairline)] space-y-3">
                <div className="text-[11px] font-mono-tabular font-semibold text-[var(--ink)]">
                  LÍNEA DE PRODUCTO INICIAL (LINEA_PEDIDO)
                </div>

                <div>
                  <label
                    htmlFor="np-prod"
                    className="block text-[12px] font-medium text-[var(--ink)] mb-1"
                  >
                    Referencia industrial
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

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div>
                    <label
                      htmlFor="np-cant"
                      className="block text-[11px] font-medium text-[var(--ink)] mb-1"
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
                      className="block text-[11px] font-medium text-[var(--ink)] mb-1"
                    >
                      Peso unit. (kg)
                    </label>
                    <input
                      id="np-peso"
                      type="number"
                      step="0.5"
                      min={0}
                      value={nuevoPesoUnitario}
                      onChange={(e) =>
                        setNuevoPesoUnitario(Number(e.target.value))
                      }
                      className="field-input font-mono-tabular"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="np-largo"
                      className="block text-[11px] font-medium text-[var(--ink)] mb-1"
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
                      className="block text-[11px] font-medium text-[var(--ink)] mb-1"
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
                      className="block text-[11px] font-medium text-[var(--ink)] mb-1"
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

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--hairline)]">
                <button
                  type="button"
                  onClick={() => dialogNuevoPedidoRef.current?.close()}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar pedido
                </button>
              </div>
            </form>
          </div>
        </dialog>
      </div>
    );
  }

  /* ========================================================================
   * VISTA B: CONSOLA DE CUBICAJE Y ANÁLISIS DE CARGA (RF-02 / UC-02)
   * ======================================================================== */
  const pctLimitePeso = Math.min(
    100,
    Math.round(
      (cargaCalculada.pesoTotalKg /
        POLITICA_CARGA_KIRAMAR.maxPesoUnicoDespachoKg) *
        100
    )
  );
  const pctLimiteVol = Math.min(
    100,
    Math.round(
      (cargaCalculada.volumenTotalM3 /
        POLITICA_CARGA_KIRAMAR.maxVolumenUnicoDespachoM3) *
        100
    )
  );

  return (
    <div className="space-y-4">
      {/* Selector superior de pedido en consola de cubicaje */}
      <div className="crm-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[12px] font-semibold text-[var(--ink)]">
            Seleccionar pedido para cubicaje (`CargaPedido`):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {pedidos.map((p) => {
              const active = p.idPedido === pedidoActivo.idPedido;
              const hasAlert = [
                'Requiere Datos Maestros',
                'Excede Límites',
              ].includes(p.estadoPedido);
              return (
                <button
                  key={p.idPedido}
                  type="button"
                  onClick={() => onSeleccionarPedido(p.idPedido)}
                  className={`px-2.5 py-1.5 rounded-[6px] font-mono-tabular text-[12px] font-medium cursor-pointer border transition-colors ${
                    active
                      ? 'bg-[var(--ink)] text-white border-[var(--ink)]'
                      : hasAlert
                      ? 'bg-[var(--state-warn-bg)] text-[var(--state-warn-ink)] border-[var(--state-warn-ink)]'
                      : 'bg-[var(--g-main)] text-[var(--ink)] border-[var(--hairline)]'
                  }`}
                >
                  {p.idPedido}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          disabled={
            !cargaCalculada.datosMaestrosCompletos ||
            cargaCalculada.excedeLimitesEmpresa
          }
          onClick={() => onValidarPedidoParaFlota(pedidoActivo.idPedido)}
          className="btn-primary"
        >
          <Truck className="w-4 h-4" />
          <span>Enviar carga validada a Selección de Flota (UC-03)</span>
        </button>
      </div>

      {/* Alertas Interactivas de Caminos Alternativos UC-02 */}
      {!cargaCalculada.datosMaestrosCompletos && (
        <div className="crm-card p-4 bg-[var(--state-warn-bg)] border border-[var(--state-warn-ink)]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[var(--state-warn-ink)] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="text-[11px] font-mono-tabular font-semibold text-[var(--state-warn-ink)]">
                UC-02 · CAMINO ALTERNATIVO 1 · DATOS MAESTROS FALTANTES EN PRODUCTO
              </span>
              <h3 className="text-[15px] font-semibold text-[var(--ink)] m-0 mt-0.5">
                A uno o más productos del pedido les falta información maestra (peso individual o dimensiones).
              </h3>
              <p className="text-[13px] text-[var(--c-text)] m-0 mt-0.5">
                Ingrese las especificaciones físicas faltantes del SKU para desbloquear el consolidado volumétrico.
              </p>

              {pedidoActivo.lineas
                .filter((l) => !validarDatosMaestrosLinea(l))
                .map((lineaIncompleta) => (
                  <div
                    key={lineaIncompleta.idLinea}
                    className="mt-3 pt-3 border-t border-[var(--hairline-strong)] grid grid-cols-2 sm:grid-cols-5 gap-2.5 items-end"
                  >
                    <div>
                      <label
                        htmlFor={`peso-${lineaIncompleta.idLinea}`}
                        className="block text-[11px] font-medium text-[var(--ink)] mb-1"
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
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`largo-${lineaIncompleta.idLinea}`}
                        className="block text-[11px] font-medium text-[var(--ink)] mb-1"
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
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`ancho-${lineaIncompleta.idLinea}`}
                        className="block text-[11px] font-medium text-[var(--ink)] mb-1"
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
                        className="field-input"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`alto-${lineaIncompleta.idLinea}`}
                        className="block text-[11px] font-medium text-[var(--ink)] mb-1"
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
                        className="field-input"
                      />
                    </div>
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
                      className="btn-primary w-full"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Completar SKU</span>
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {cargaCalculada.excedeLimitesEmpresa && (
        <div className="crm-card p-4 bg-[var(--state-err-bg)] border border-[var(--state-err-ink)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Scale className="w-5 h-5 text-[var(--state-err-ink)] shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-mono-tabular font-semibold text-[var(--state-err-ink)]">
                UC-02 · CAMINO ALTERNATIVO 2 · EXCESO DE LÍMITE CORPORATIVO POR DESPACHO
              </span>
              <h3 className="text-[15px] font-semibold text-[var(--ink)] m-0 mt-0.5">
                El peso ({cargaCalculada.pesoTotalKg.toLocaleString('es-CO')}&nbsp;kg) supera el tope de {POLITICA_CARGA_KIRAMAR.maxPesoUnicoDespachoKg.toLocaleString('es-CO')}&nbsp;kg para un único despacho.
              </h3>
              <p className="text-[13px] text-[var(--c-text)] m-0 mt-0.5">
                Divida automáticamente el pedido en dos sub-órdenes balanceadas para continuar con la asignación vehicular.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onDividirPedidoExcedido(pedidoActivo.idPedido)}
            className="btn-primary"
          >
            <Scissors className="w-4 h-4" />
            <span>Dividir pedido en 2 despachos</span>
          </button>
        </div>
      )}

      {/* Tarjetas de Cubicaje y Límites Corporativos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="crm-card p-4">
          <div className="text-[11px] font-mono-tabular uppercase text-[var(--muted)]">
            Registro Consolidado (`CARGA_PEDIDO`)
          </div>
          <div className="text-[20px] font-mono-tabular font-semibold text-[var(--ink)] mt-1">
            {cargaCalculada.idCarga}
          </div>
          <div className="text-[12px] text-[var(--muted)] mt-1">
            Cliente: {pedidoActivo.nombreCliente}
          </div>
        </div>

        <div className="crm-card p-4">
          <div className="flex justify-between text-[11px] font-mono-tabular uppercase text-[var(--muted)]">
            <span>Peso Consolidado</span>
            <span>{pctLimitePeso}% del límite</span>
          </div>
          <div className="text-[20px] font-mono-tabular font-semibold text-[var(--ink)] mt-1">
            {cargaCalculada.pesoTotalKg.toLocaleString('es-CO')}&nbsp;kg
          </div>
          <div className="w-full h-1.5 rounded-full bg-[var(--g-alt)] mt-2 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pctLimitePeso}%`,
                backgroundColor: cargaCalculada.excedeLimitesEmpresa
                  ? 'var(--state-err-ink)'
                  : 'var(--action)',
              }}
            />
          </div>
        </div>

        <div className="crm-card p-4">
          <div className="flex justify-between text-[11px] font-mono-tabular uppercase text-[var(--muted)]">
            <span>Volumen Cubicado</span>
            <span>{pctLimiteVol}% del límite</span>
          </div>
          <div className="text-[20px] font-mono-tabular font-semibold text-[var(--ink)] mt-1">
            {cargaCalculada.volumenTotalM3.toLocaleString('es-CO')}&nbsp;m³
          </div>
          <div className="w-full h-1.5 rounded-full bg-[var(--g-alt)] mt-2 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pctLimiteVol}%`,
                backgroundColor: '#165934',
              }}
            />
          </div>
        </div>

        <div className="crm-card p-4">
          <div className="text-[11px] font-mono-tabular uppercase text-[var(--muted)]">
            Cota Máxima de Estiba (L × A × H)
          </div>
          <div className="text-[20px] font-mono-tabular font-semibold text-[var(--ink)] mt-1">
            {cargaCalculada.dimMaxLargo} × {cargaCalculada.dimMaxAncho} ×{' '}
            {cargaCalculada.dimMaxAlto}&nbsp;m
          </div>
          <div className="text-[12px] font-mono-tabular text-[var(--state-ok-ink)] mt-1">
            {cargaCalculada.datosMaestrosCompletos
              ? 'Maestro SKU Verificado'
              : 'Pendiente completar SKU'}
          </div>
        </div>
      </div>

      {/* Tabla detallada de líneas para cubicaje */}
      <div className="crm-card overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--hairline)] bg-[#faf9f6] flex items-center justify-between">
          <span className="font-semibold text-[13px] text-[var(--ink)]">
            Desglose Físico por Línea de Producto (`LINEA_PEDIDO` — Operaciones `calcularPesoTotal()` y `calcularVolumenTotal()`)
          </span>
        </div>

        <div
          tabIndex={0}
          role="region"
          aria-label="Tabla de cubicaje por línea de pedido"
          className="table-wrapper"
        >
          <table
            style={
              {
                '--label-2': '"Descripción SKU"',
                '--label-3': '"Unidades"',
                '--label-4': '"Peso Unit. / Total"',
                '--label-5': '"Largo × Ancho × Alto"',
                '--label-6': '"Volumen Cubicado"',
              } as React.CSSProperties
            }
          >
            <thead>
              <tr>
                <th scope="col">ID Línea / SKU</th>
                <th scope="col">Producto</th>
                <th scope="col">Cantidad</th>
                <th scope="col">Peso Unitario / Total</th>
                <th scope="col">Dimensiones Físicas</th>
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
                      <div className="text-[11px] text-[var(--muted)] font-normal">
                        {linea.idProducto}
                      </div>
                    </th>
                    <td>
                      <div className="font-medium text-[var(--ink)]">
                        {linea.nombreProducto}
                      </div>
                      {!valido && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono-tabular text-[var(--state-warn-ink)] mt-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          Falta peso o dimensión en maestro WMS
                        </span>
                      )}
                    </td>
                    <td className="font-mono-tabular font-semibold">
                      {linea.cantidad}&nbsp;und
                    </td>
                    <td className="font-mono-tabular">
                      <div>{linea.pesoUnitario}&nbsp;kg / und</div>
                      <div className="font-semibold text-[var(--ink)]">
                        {pesoLinea.toLocaleString('es-CO')}&nbsp;kg
                      </div>
                    </td>
                    <td className="font-mono-tabular">
                      {linea.largo}&nbsp;m × {linea.ancho}&nbsp;m × {linea.alto}&nbsp;m
                    </td>
                    <td className="font-mono-tabular font-semibold text-[var(--ink)]">
                      <div className="flex items-center gap-1.5">
                        <span>{volLinea.toLocaleString('es-CO')}&nbsp;m³</span>
                        {valido && (
                          <CheckCircle className="w-3.5 h-3.5 text-[var(--state-ok-ink)]" />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
