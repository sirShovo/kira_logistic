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
    <div className="space-y-6">
      <section
        aria-labelledby="heading-crm"
        className="surface-card p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5 pb-4 border-b border-[var(--hairline)]">
          <div>
            <span className="text-[12px] font-mono-tabular font-medium text-[var(--action)]">
              MÓDULO COMPLEMENTARIO CRM · DISTRIBUIDORA KIRAMAR S.A.S.
            </span>
            <h2
              id="heading-crm"
              className="text-[20px] sm:text-[22px] font-semibold text-[var(--ink)] m-0 mt-0.5"
            >
              Directorio de cuentas corporativas, acuerdos de nivel de servicio (SLA) y restricciones de recibo.
            </h2>
          </div>
        </div>

        {/* Tarjetas de Cuentas CRM */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {clientes.map((cli) => {
            const activo = cli.idCliente === clienteActivo.idCliente;
            const cantPedidos = pedidos.filter(
              (p) => p.idCliente === cli.idCliente
            ).length;
            return (
              <div
                key={cli.idCliente}
                onClick={() => setClienteSeleccionadoId(cli.idCliente)}
                className={`card-interactive p-5 rounded-[14px] border cursor-pointer flex flex-col justify-between ${
                  activo
                    ? 'bg-[var(--card)] border-[var(--ink)]'
                    : 'bg-[var(--card)] border-[var(--hairline)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[12px] font-mono-tabular font-semibold px-2 py-0.5 rounded bg-[var(--g-alt)] text-[var(--ink)]">
                      {cli.idCliente}
                    </span>
                    <span className="text-[12px] font-mono-tabular font-medium text-[var(--state-ok-ink)] bg-[var(--state-ok-bg)] px-2 py-0.5 rounded">
                      SLA Entregas: {cli.cumplimientoSlaPorcentaje}%
                    </span>
                  </div>

                  <h3 className="text-[17px] font-semibold text-[var(--ink)] m-0 leading-snug">
                    {cli.razonSocial}
                  </h3>
                  <p className="text-[13px] text-[var(--muted)] m-0 mt-1 mb-3">
                    {cli.segmento} · {cli.municipio}
                  </p>

                  <div className="space-y-1.5 text-[13px] text-[var(--c-text)] p-3 rounded-[8px] bg-[var(--g-main)] border border-[var(--hairline)]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" aria-hidden="true" />
                      <span>Ventana recibo: <strong>{cli.ventanaRecepcion}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" aria-hidden="true" />
                      <span className="truncate">{cli.restriccionVehicular}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" aria-hidden="true" />
                      <span className="truncate">{cli.zonaLogistica}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--hairline)] flex items-center justify-between text-[13px]">
                  <span className="text-[var(--muted)]">
                    Contacto: <strong className="text-[var(--ink)]">{cli.contactoPrincipal}</strong>
                  </span>
                  <span className="font-mono-tabular font-semibold text-[var(--action)]">
                    {cantPedidos} pedido(s)
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ficha técnica del cliente seleccionado y sus pedidos asociados */}
        <div className="surface-panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4 pb-4 border-b border-[var(--hairline)]">
            <div>
              <span className="text-[12px] font-mono-tabular text-[var(--muted)]">
                FICHA LOGÍSTICA DE CLIENTE · {clienteActivo.idCliente}
              </span>
              <h3 className="text-[19px] font-semibold text-[var(--ink)] m-0 mt-0.5">
                {clienteActivo.razonSocial}
              </h3>
              <p className="text-[14px] text-[var(--c-text)] m-0 mt-1">
                Responsable de recepción: <strong>{clienteActivo.contactoPrincipal}</strong> ({clienteActivo.cargoContacto}) · Correo:{' '}
                <span className="font-mono-tabular">{clienteActivo.correo}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-[13px] font-mono-tabular bg-[var(--card)] px-3 py-2 rounded-[8px] border border-[var(--hairline)]">
              <ShieldCheck className="w-4 h-4 text-[var(--state-ok-ink)]" aria-hidden="true" />
              <span>Condición logística: {clienteActivo.restriccionVehicular}</span>
            </div>
          </div>

          <h4 className="text-[15px] font-semibold text-[var(--ink)] mb-3">
            Historial de pedidos y despachos vinculados ({pedidosDelCliente.length})
          </h4>

          <div
            tabIndex={0}
            role="region"
            aria-label="Pedidos vinculados al cliente seleccionado"
            className="table-wrapper"
          >
            <table
              style={
                {
                  '--label-2': '"Fecha Entrega"',
                  '--label-3': '"Zona / Destino"',
                  '--label-4': '"Carga Física"',
                  '--label-5': '"Estado"',
                  '--label-6': '"Acción"',
                } as React.CSSProperties
              }
            >
              <thead>
                <tr>
                  <th scope="col">ID Pedido / WMS</th>
                  <th scope="col">Fecha Entrega</th>
                  <th scope="col">Zona Logística</th>
                  <th scope="col">Peso y Volumen</th>
                  <th scope="col">Estado Actual</th>
                  <th scope="col">Abrir en Gestión</th>
                </tr>
              </thead>
              <tbody>
                {pedidosDelCliente.map((ped) => {
                  const carga = calcularCaracteristicasCarga(ped);
                  return (
                    <tr key={ped.idPedido}>
                      <th scope="row" className="font-mono-tabular">
                        {ped.idPedido}
                      </th>
                      <td className="font-mono-tabular">
                        {ped.fechaEntregaSolicitada}
                      </td>
                      <td>{ped.zonasEntrega.join(', ')}</td>
                      <td className="font-mono-tabular">
                        {carga.pesoTotalKg.toLocaleString('es-CO')}&nbsp;kg ·{' '}
                        {carga.volumenTotalM3.toLocaleString('es-CO')}&nbsp;m³
                      </td>
                      <td>
                        <span className="font-mono-tabular text-[12px] px-2.5 py-0.5 rounded bg-[var(--g-alt)] text-[var(--ink)]">
                          {ped.estadoPedido}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => onInspeccionarPedidoCliente(ped.idPedido)}
                          className="btn-secondary !min-h-[34px] !px-3 !text-[13px]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Gestionar pedido</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
