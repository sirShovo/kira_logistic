import type { 
  LineaPedido, 
  CargaPedido, 
  Pedido, 
  Vehiculo, 
  Asignacion, 
  ParadaRuta 
} from '../types/domain';

/**
 * Constantes y Politicas Corporativas de Distribuidora Kiramar S.A.S.
 */
export const LIMITES_CORPORATIVOS = {
  PESO_MAX_KG: 8500, // 8,500 kg maximo por despacho individual
  VOLUMEN_MAX_M3: 38.0, // 38.0 m3 maximo por despacho individual
  ORIGEN_CEDI: 'CEDI Central Kiramar - Sector Industrial Guayabal / Itagui',
  ZONAS_OFICIALES: [
    'Zona Norte: Bello / Copacabana / Girardota',
    'Zona Centro: Medellin Candelaria / Guayaquil',
    'Zona Industrial: Guayabal / Itagui',
    'Zona Sur: Envigado / Sabaneta / Caldas',
    'Oriente Cercano: Rionegro / Guarne'
  ]
};

/**
 * Verifica si una zona coincide con las zonas logisticas autorizadas de Kiramar
 */
export function estaEnZonaCobertura(zona: string): boolean {
  if (!zona) return false;
  const normalizada = zona.toLowerCase().trim();
  return LIMITES_CORPORATIVOS.ZONAS_OFICIALES.some(z => {
    const zNorm = z.toLowerCase();
    return zNorm.includes(normalizada) || normalizada.includes(zNorm.split(':')[0].toLowerCase());
  });
}

/**
 * Algoritmo de Consolidacion de Carga (UC-02)
 * Calcula peso total, volumen total y dimensiones maximas a partir de las lineas de pedido.
 * Evalua completitud de datos maestros y limites de la empresa.
 */
export function calcularCarga(lineas: LineaPedido[], idPedido: string): CargaPedido {
  let pesoTotalKg = 0;
  let volumenTotalM3 = 0;
  let dimMaxAlto = 0;
  let dimMaxAncho = 0;
  let dimMaxLargo = 0;
  let datosMaestrosCompletos = true;

  if (!lineas || lineas.length === 0) {
    return {
      idCarga: `CRG-${idPedido}`,
      idPedido,
      pesoTotalKg: 0,
      volumenTotalM3: 0,
      dimMaxAlto: 0,
      dimMaxAncho: 0,
      dimMaxLargo: 0,
      datosMaestrosCompletos: false,
      excedeLimitesEmpresa: false
    };
  }

  for (const item of lineas) {
    // Validacion de datos maestros (peso o dimensiones <= 0)
    if (
      item.pesoUnitario <= 0 || 
      item.alto <= 0 || 
      item.ancho <= 0 || 
      item.largo <= 0 ||
      isNaN(item.pesoUnitario) ||
      isNaN(item.alto) ||
      isNaN(item.ancho) ||
      isNaN(item.largo)
    ) {
      datosMaestrosCompletos = false;
    }

    const pesoLinea = item.cantidad * (item.pesoUnitario || 0);
    const volumenLinea = item.cantidad * (item.alto || 0) * (item.ancho || 0) * (item.largo || 0);

    pesoTotalKg += pesoLinea;
    volumenTotalM3 += volumenLinea;

    if (item.alto > dimMaxAlto) dimMaxAlto = item.alto;
    if (item.ancho > dimMaxAncho) dimMaxAncho = item.ancho;
    if (item.largo > dimMaxLargo) dimMaxLargo = item.largo;
  }

  // Redondeo de precision ingenieril
  pesoTotalKg = Math.round(pesoTotalKg * 100) / 100;
  volumenTotalM3 = Math.round(volumenTotalM3 * 1000) / 1000;
  dimMaxAlto = Math.round(dimMaxAlto * 100) / 100;
  dimMaxAncho = Math.round(dimMaxAncho * 100) / 100;
  dimMaxLargo = Math.round(dimMaxLargo * 100) / 100;

  const excedeLimitesEmpresa = 
    pesoTotalKg > LIMITES_CORPORATIVOS.PESO_MAX_KG || 
    volumenTotalM3 > LIMITES_CORPORATIVOS.VOLUMEN_MAX_M3;

  return {
    idCarga: `CRG-${idPedido}`,
    idPedido,
    pesoTotalKg,
    volumenTotalM3,
    dimMaxAlto,
    dimMaxAncho,
    dimMaxLargo,
    datosMaestrosCompletos,
    excedeLimitesEmpresa
  };
}

/**
 * Algoritmo de Fraccionamiento de Pedidos Excedidos (UC-02 Camino Alternativo 2)
 * Divide un pedido excedido en dos sub-pedidos balanceados: PED-XXX-A y PED-XXX-B
 */
export function fraccionarPedido(
  pedido: Pedido, 
  lineas: LineaPedido[]
): { 
  subPedidoA: Pedido; 
  lineasA: LineaPedido[]; 
  subPedidoB: Pedido; 
  lineasB: LineaPedido[]; 
} {
  const lineasA: LineaPedido[] = [];
  const lineasB: LineaPedido[] = [];

  for (const l of lineas) {
    const cantA = Math.ceil(l.cantidad / 2);
    const cantB = Math.floor(l.cantidad / 2);

    if (cantA > 0) {
      lineasA.push({
        ...l,
        idLinea: `${l.idLinea}-A`,
        idPedido: `${pedido.idPedido}-A`,
        cantidad: cantA
      });
    }

    if (cantB > 0) {
      lineasB.push({
        ...l,
        idLinea: `${l.idLinea}-B`,
        idPedido: `${pedido.idPedido}-B`,
        cantidad: cantB
      });
    }
  }

  const subPedidoA: Pedido = {
    ...pedido,
    idPedido: `${pedido.idPedido}-A`,
    cliente: `${pedido.cliente} (Lote 1/2)`,
    estadoPedido: 'Validado'
  };

  const subPedidoB: Pedido = {
    ...pedido,
    idPedido: `${pedido.idPedido}-B`,
    cliente: `${pedido.cliente} (Lote 2/2)`,
    estadoPedido: 'Validado'
  };

  subPedidoA.carga = calcularCarga(lineasA, subPedidoA.idPedido);
  subPedidoB.carga = calcularCarga(lineasB, subPedidoB.idPedido);

  return { subPedidoA, lineasA, subPedidoB, lineasB };
}

/**
 * Evaluacion multidimensional de compatibilidad de un vehiculo con una carga
 */
export function evaluarVehiculoConCarga(v: Vehiculo, c: CargaPedido): {
  cumplePeso: boolean;
  cumpleVolumen: boolean;
  cumpleAlto: boolean;
  cumpleAncho: boolean;
  cumpleLargo: boolean;
  porcentajePeso: number;
  porcentajeVolumen: number;
  esCompatible: boolean;
  motivoIncompatibilidad?: string;
} {
  const cumplePeso = v.capacidadKg >= c.pesoTotalKg;
  const cumpleVolumen = v.volumenM3 >= c.volumenTotalM3;
  const cumpleAlto = v.altoInterior >= c.dimMaxAlto;
  const cumpleAncho = v.anchoInterior >= c.dimMaxAncho;
  const cumpleLargo = v.largoInterior >= c.dimMaxLargo;

  const porcentajePeso = v.capacidadKg > 0 ? Math.round((c.pesoTotalKg / v.capacidadKg) * 100) : 0;
  const porcentajeVolumen = v.volumenM3 > 0 ? Math.round((c.volumenTotalM3 / v.volumenM3) * 100) : 0;

  const esCompatible = cumplePeso && cumpleVolumen && cumpleAlto && cumpleAncho && cumpleLargo;

  let motivo: string | undefined;
  if (!cumplePeso) motivo = `Peso de carga (${c.pesoTotalKg} kg) excede capacidad (${v.capacidadKg} kg)`;
  else if (!cumpleVolumen) motivo = `Volumen (${c.volumenTotalM3} m3) supera cubicaje (${v.volumenM3} m3)`;
  else if (!cumpleAlto) motivo = `Altura de bulto (${c.dimMaxAlto} m) excede altura util (${v.altoInterior} m)`;
  else if (!cumpleAncho) motivo = `Ancho de bulto (${c.dimMaxAncho} m) excede ancho util (${v.anchoInterior} m)`;
  else if (!cumpleLargo) motivo = `Largo de bulto (${c.dimMaxLargo} m) excede longitud util (${v.largoInterior} m)`;

  return {
    cumplePeso,
    cumpleVolumen,
    cumpleAlto,
    cumpleAncho,
    cumpleLargo,
    porcentajePeso,
    porcentajeVolumen,
    esCompatible,
    motivoIncompatibilidad: motivo
  };
}

/**
 * Algoritmo de Compatibilidad de Flota Vehicular (UC-03)
 * Filtra los vehiculos aptos evaluando disponibilidad por fecha y capacidad fisica completa.
 */
export function filtrarFlota(
  vehiculos: Vehiculo[],
  carga: CargaPedido | undefined,
  fechaDespacho: string,
  asignaciones: Asignacion[]
): {
  candidatosAptos: Vehiculo[];
  ocupadosEnFecha: Vehiculo[];
  capacidadInsuficiente: Vehiculo[];
  enMantenimiento: Vehiculo[];
} {
  const candidatosAptos: Vehiculo[] = [];
  const ocupadosEnFecha: Vehiculo[] = [];
  const capacidadInsuficiente: Vehiculo[] = [];
  const enMantenimiento: Vehiculo[] = [];

  // Mapeo de vehiculos reservados para la fecha solicitada
  const vehiculosOcupadosIds = new Set(
    asignaciones
      .filter(a => a.fechaDespachoProgramada === fechaDespacho && (a.estadoAsignacion === 'Reservada' || a.estadoAsignacion === 'Confirmada' || a.estadoAsignacion === 'En Despacho'))
      .map(a => a.idVehiculo)
  );

  for (const v of vehiculos) {
    if (v.estadoVehiculo === 'Mantenimiento') {
      enMantenimiento.push(v);
      continue;
    }

    if (vehiculosOcupadosIds.has(v.idVehiculo) || v.estadoVehiculo === 'En Ruta') {
      ocupadosEnFecha.push(v);
      continue;
    }

    if (!carga) {
      if (v.estadoVehiculo === 'Disponible') {
        candidatosAptos.push(v);
      }
      continue;
    }

    const evaluacion = evaluarVehiculoConCarga(v, carga);
    if (evaluacion.esCompatible) {
      candidatosAptos.push(v);
    } else {
      capacidadInsuficiente.push(v);
    }
  }

  return {
    candidatosAptos,
    ocupadosEnFecha,
    capacidadInsuficiente,
    enMantenimiento
  };
}

/**
 * Genera fechas alternativas sugeridas cuando no hay disponibilidad vehicular (UC-03 Alt 1)
 */
export function sugerirFechasAlternativas(
  fechaBaseIso: string,
  vehiculos: Vehiculo[],
  asignaciones: Asignacion[],
  carga?: CargaPedido
): Array<{ fecha: string; unidadesDisponibles: number; label: string }> {
  const sugerencias: Array<{ fecha: string; unidadesDisponibles: number; label: string }> = [];
  const base = new Date(fechaBaseIso);

  for (let offset = 1; offset <= 4; offset++) {
    const siguiente = new Date(base);
    siguiente.setDate(base.getDate() + offset);
    // Saltar domingos
    if (siguiente.getDay() === 0) continue;

    const fechaIso = siguiente.toISOString().split('T')[0];
    const { candidatosAptos } = filtrarFlota(vehiculos, carga, fechaIso, asignaciones);

    if (candidatosAptos.length > 0) {
      const opciones = ['Manana', 'En 2 dias', 'En 3 dias', 'En 4 dias'];
      sugerencias.push({
        fecha: fechaIso,
        unidadesDisponibles: candidatosAptos.length,
        label: `${opciones[offset - 1] || `+${offset} dias`} (${fechaIso})`
      });
    }

    if (sugerencias.length >= 3) break;
  }

  return sugerencias;
}

/**
 * Recalcula metricas consolidadas de una lista de paradas
 */
export function calcularMetricasParadas(paradas: ParadaRuta[]): {
  distanciaTotalKm: number;
  tiempoTotalMinutos: number;
  tieneParadasFueraCobertura: boolean;
} {
  let distancia = 0;
  let tiempo = 0;
  let fuera = false;

  for (const p of paradas) {
    distancia += p.distanciaKm || 0;
    tiempo += p.tiempoMinutos || 0;
    if (!p.enCobertura) fuera = true;
  }

  return {
    distanciaTotalKm: Math.round(distancia * 10) / 10,
    tiempoTotalMinutos: Math.round(tiempo),
    tieneParadasFueraCobertura: fuera
  };
}
