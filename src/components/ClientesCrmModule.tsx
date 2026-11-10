import type React from 'react';
import { useState } from 'react';
import { Building2, Clock, ExternalLink, ShieldCheck, Truck } from 'lucide-react';
import type { ClienteCRM, Pedido } from '../types/domain';
import { calcularCaracteristicasCarga } from '../utils/logisticsEngine';

interface ClientesCrmModuleProps {
  clientes: ClienteCRM[];
  pedidos: Pedido[];
  onInspeccionarPedidoCliente: (idPedido: string) => void;
}

export const ClientesCrmModule: React.FC<ClientesCrmModuleProps> = ({
  clientes,
  pedidos,
  onInspeccionarPedidoCliente,
}) => {
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState<string>(
    clientes[0]?.idCliente || 'CLI-101'
  );

  const clienteActivo =
    clientes.find((c) => c.idCliente === clienteSeleccionadoId) || clientes[0];

  const pedidosDelCliente = pedidos.filter(
    (p) => p.idCliente === clienteActivo.idCliente
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      {/* Columna Izquierda (7 cols): Tabla Directorio de Cuentas Corporativas */}
      <div className="lg:col-span-7 crm-card overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--hairline)] bg-[#faf9f6] flex items-center justify-between">
          <span className="font-semibold text-[13px] text-[var(--ink)]">
            Directorio de Cuentas Corporativas — Distribuidora Kiramar S.A.S.
          </span>
          <span className="text-[11px] font-mono-tabular text-[var(--muted)]">
            {clientes.length} cuentas activas
          </span>
        </div>

        <div
          tabIndex={0}
          role="region"
          aria-label="Directorio de cuentas corporativas CRM"
          className="table-wrapper"
        >
          <table
            style={
              {
                '--label-2': '"Razón Social y NIT"',
                '--label-3': '"Municipio / Zona"',
                '--label-4': '"Ventana Recibo"',
                '--label-5': '"SLA"',
              } as React.CSSProperties
            }
          >
            <thead>
              <tr>
                <th scope="col">ID Cuenta</th>
                <th scope="col">Razón Social / NIT</th>
                <th scope="col">Municipio y Zona</th>
                <th scope="col">Ventana Horaria</th>
                <th scope="col">SLA</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cli) => {
                const activo = cli.idCliente === clienteActivo.idCliente;
                return (
                  <tr
                    key={cli.idCliente}
                    onClick={() => setClienteSeleccionadoId(cli.idCliente)}
                    className={`cursor-pointer ${activo ? 'row-selected' : ''}`}
                  >
                    <th scope="row" className="font-mono-tabular">
                      {cli.idCliente}
                    </th>
                    <td>
                      <div className="font-semibold text-[var(--ink)]">
                        {cli.razonSocial}
                      </div>
                      <div className="text-[11px] font-mono-tabular text-[var(--muted)]">
                        NIT {cli.nit} · {cli.segmento}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium text-[var(--ink)]">
                        {cli.municipio}
                      </div>
                      <div className="text-[11px] text-[var(--muted)] truncate max-w-[180px]">
                        {cli.zonaLogistica}
                      </div>
                    </td>
                    <td className="font-mono-tabular text-[12px]">
                      {cli.ventanaRecepcion}
                    </td>
                    <td>
                      <span className="font-mono-tabular text-[11px] font-semibold px-2 py-0.5 rounded bg-[var(--state-ok-bg)] text-[var(--state-ok-ink)]">
                        {cli.cumplimientoSlaPorcentaje}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Columna Derecha (5 cols): Ficha 360° de Cuenta y Pedidos Vinculados */}
      <aside className="lg:col-span-5 crm-card p-4 sm:p-5 space-y-4 sticky top-[74px]">
        <div className="pb-3 border-b border-[var(--hairline)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-tabular font-semibold text-[var(--action)]">
              FICHA 360° DE CUENTA · {clienteActivo.idCliente}
            </span>
            <span className="text-[11px] font-mono-tabular px-2 py-0.5 rounded bg-[var(--state-ok-bg)] text-[var(--state-ok-ink)] font-semibold">
              SLA {clienteActivo.cumplimientoSlaPorcentaje}%
            </span>
          </div>
          <h3 className="text-[16px] font-semibold text-[var(--ink)] m-0 mt-1">
            {clienteActivo.razonSocial}
          </h3>
          <div className="text-[12px] text-[var(--muted)] mt-0.5">
            NIT {clienteActivo.nit} · Cupo autorizado: $
            {(clienteActivo.cupoCreditoCop / 1000000).toFixed(0)}M COP
          </div>
        </div>

        <div className="crm-panel p-3.5 space-y-2 text-[12px]">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
            <span>
              Ventana de recibo en muelle:{' '}
              <strong className="font-mono-tabular">
                {clienteActivo.ventanaRecepcion}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
            <span>Restricción física: {clienteActivo.restriccionVehicular}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
            <span>{clienteActivo.direccionPrincipal}</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-[var(--hairline)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--state-ok-ink)] shrink-0" />
            <span>
              Contacto: <strong>{clienteActivo.contactoPrincipal}</strong> (
              {clienteActivo.correo})
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-[13px] font-semibold text-[var(--ink)] mb-2">
            Pedidos Vinculados ({pedidosDelCliente.length})
          </h4>
          <div className="space-y-2">
            {pedidosDelCliente.map((ped) => {
              const carga = calcularCaracteristicasCarga(ped);
              return (
                <div
                  key={ped.idPedido}
                  className="p-3 rounded-[8px] bg-[var(--g-main)] border border-[var(--hairline)] flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-mono-tabular font-semibold text-[12px] text-[var(--ink)]">
                      {ped.idPedido} · {ped.estadoPedido}
                    </div>
                    <div className="text-[11px] font-mono-tabular text-[var(--muted)]">
                      {carga.pesoTotalKg.toLocaleString('es-CO')}&nbsp;kg ·{' '}
                      {carga.volumenTotalM3}&nbsp;m³ · Entrega:{' '}
                      {ped.fechaEntregaSolicitada}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onInspeccionarPedidoCliente(ped.idPedido)}
                    className="btn-secondary !min-h-[30px] !px-2.5 !text-[11px]"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Abrir</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
};
