import { POLITICA_CARGA_KIRAMAR } from '../types/domain';
import type {
  CargaPedido,
  LineaPedido,
  ParadaRuta,
  Pedido,
  RutaEntrega,
  Vehiculo,
} from '../types/domain';

const ZONAS_COBERTURA_OFICIALES = [
  'Zona Norte - Bello / Copacabana / Girardota',
  'Zona Centro - Medellín Candelaria / Guayaquil',
  'Zona Industrial - Guayabal / Itagüí',
  'Zona Sur - Envigado / Sabaneta / Caldas',
  'Oriente Cercano - Rionegro / Guarne',
];

// Operaciones de LineaPedido (FO-DCL)
export function calcularPesoTotalLinea(linea: LineaPedido): number {
  return Number((linea.cantidad * linea.pesoUnitario).toFixed(2));
}

export function calcularVolumenTotalLinea(linea: LineaPedido): number {
  const volumenUnitario = linea.alto * linea.ancho * linea.largo;
  return Number((linea.cantidad * volumenUnitario).toFixed(3));
}

export function validarDatosMaestrosLinea(linea: LineaPedido): boolean {
  return (
    linea.pesoUnitario > 0 &&
    linea.alto > 0 &&
    linea.ancho > 0 &&
    linea.largo > 0 &&
    linea.cantidad > 0
  );
}

// Operaciones de CargaPedido (FO-DCL y UC-02)
export function calcularCaracteristicasCarga(pedido: Pedido): CargaPedido {
  let pesoTotalKg = 0;
  let volumenTotalM3 = 0;
  let dimMaxAlto = 0;
  let dimMaxAncho = 0;
  let dimMaxLargo = 0;
  let datosMaestrosCompletos = pedido.lineas.length > 0;

  for (const linea of pedido.lineas) {
    if (!validarDatosMaestrosLinea(linea)) {
      datosMaestrosCompletos = false;
    }
    pesoTotalKg += calcularPesoTotalLinea(linea);
    volumenTotalM3 += calcularVolumenTotalLinea(linea);
    if (linea.alto > dimMaxAlto) dimMaxAlto = linea.alto;
    if (linea.ancho > dimMaxAncho) dimMaxAncho = linea.ancho;
    if (linea.largo > dimMaxLargo) dimMaxLargo = linea.largo;
  }

  pesoTotalKg = Number(pesoTotalKg.toFixed(2));
  volumenTotalM3 = Number(volumenTotalM3.toFixed(3));
  dimMaxAlto = Number(dimMaxAlto.toFixed(2));
  dimMaxAncho = Number(dimMaxAncho.toFixed(2));
  dimMaxLargo = Number(dimMaxLargo.toFixed(2));

  const excedeLimitesEmpresa =
    pesoTotalKg > POLITICA_CARGA_KIRAMAR.maxPesoUnicoDespachoKg ||
    volumenTotalM3 > POLITICA_CARGA_KIRAMAR.maxVolumenUnicoDespachoM3;

  const resumenConsolidado = `${pedido.lineas.length} referencias | ${pesoTotalKg}\u00A0kg | ${volumenTotalM3}\u00A0m³ | Máx. ${dimMaxLargo}×${dimMaxAncho}×${dimMaxAlto}\u00A0m`;

  return {
    idCarga: `CRG-${pedido.idPedido.replace('PED-', '')}`,
    idPedido: pedido.idPedido,
    pesoTotalKg,
    volumenTotalM3,
    dimMaxAlto,
    dimMaxAncho,
    dimMaxLargo,
    datosMaestrosCompletos,
    excedeLimitesEmpresa,
    resumenConsolidado,
  };
}

export function validarLimitesEmpresa(carga: CargaPedido): boolean {
  return !carga.excedeLimitesEmpresa;
}

// Operaciones de Vehiculo (FO-DCL y UC-03)
export function consultarVehiculosDisponiblesPorFecha(
  flota: Vehiculo[],
  fecha: string
): Vehiculo[] {
  return flota.filter(
    (v) =>
      v.estadoVehiculo === 'Disponible' && !v.fechasOcupadas.includes(fecha)
  );
}

export function filtrarVehiculosPorCapacidad(
  vehiculosDisponibles: Vehiculo[],
  carga: CargaPedido
): Vehiculo[] {
  return vehiculosDisponibles.filter(
    (v) =>
      v.capacidadKg >= carga.pesoTotalKg &&
      v.volumenM3 >= carga.volumenTotalM3 &&
      v.altoInterior >= carga.dimMaxAlto &&
      v.anchoInterior >= carga.dimMaxAncho &&
      v.largoInterior >= carga.dimMaxLargo
  );
}

export function verificarCoberturaZona(zona: string): boolean {
  return ZONAS_COBERTURA_OFICIALES.includes(zona);
}

// Operaciones de RutaEntrega (FO-DCL y UC-05)
export function generarRutaEntrega(
  idAsignacion: string,
  pedido: Pedido,
  modoCalculo: 'Automático WMS/GIS' | 'Manual Operativo' = 'Automático WMS/GIS'
): RutaEntrega {
  const paradasBase: ParadaRuta[] = [
    {
      orden: 1,
      direccion: 'CEDI Central Distribuidora Kiramar S.A.S. — Calle 14 Sur # 52-40, Guayabal',
      zona: 'Zona Industrial - Guayabal / Itagüí',
      enCobertura: true,
      ventanaHoraria: '06:30 - 07:15',
      tiempoEstimadoMin: 20,
      distanciaKm: 0,
    },
  ];

  const destinosExtraidos = pedido.destino.split(';').map((d) => d.trim());
  let distanciaAcumulada = 0;
  let tiempoAcumulado = 20;
  let alertaCobertura = false;

  destinosExtraidos.forEach((dir, idx) => {
    const zonaAsignada =
      pedido.zonasEntrega[idx] ||
      pedido.zonasEntrega[0] ||
      'Zona Industrial - Guayabal / Itagüí';
    const enCobertura = verificarCoberturaZona(zonaAsignada);
    if (!enCobertura) alertaCobertura = true;

    const distTramo = Number((8.5 + idx * 6.4).toFixed(1));
    const tiempoTramo = 28 + idx * 18;
    distanciaAcumulada = Number((distanciaAcumulada + distTramo).toFixed(1));
    tiempoAcumulado += tiempoTramo;

    paradasBase.push({
      orden: idx + 2,
      direccion: dir,
      zona: zonaAsignada,
      enCobertura,
      ventanaHoraria: idx === 0 ? '08:00 - 10:30' : '10:45 - 13:00',
      tiempoEstimadoMin: tiempoTramo,
      distanciaKm: distTramo,
    });
  });

  return {
    idRuta: `RUT-${idAsignacion.replace('ASG-', '')}`,
    idAsignacion,
    destinos: paradasBase.map((p) => p.direccion),
    zonas: paradasBase.map((p) => p.zona),
    ordenEntrega: paradasBase.map((p) => p.orden),
    paradas: paradasBase,
    estadoRuta: alertaCobertura
      ? 'Advertencia Cobertura'
      : modoCalculo === 'Manual Operativo'
      ? 'Ajuste Manual'
      : 'Planificada',
    modoCalculo,
    distanciaTotalKm: distanciaAcumulada,
    tiempoEstimadoTotalMin: tiempoAcumulado,
  };
}
