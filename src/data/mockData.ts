import type { 
  Usuario, 
  Vehiculo, 
  Pedido, 
  LineaPedido, 
  Asignacion, 
  RutaEntrega, 
  Despacho, 
  Trazabilidad 
} from '../types/domain';
import { calcularCarga } from '../utils/logisticsEngine';

export const USUARIOS_INICIALES: Usuario[] = [
  {
    idUsuario: 'USR-01',
    nombre: 'Carlos Restrepo',
    cargo: 'Jefe de Operaciones de Despacho',
    perfil: 'Personal de Logistica / Despachos',
    correo: 'carlos.restrepo@kiramar.com.co',
    contrasenaHash: 'hash_sha256_mock_01',
    estado: 'Activo'
  },
  {
    idUsuario: 'USR-02',
    nombre: 'Mateo Henao',
    cargo: 'Coordinador de Flota y Transporte',
    perfil: 'Personal de Logistica / Transporte',
    correo: 'mateo.henao@kiramar.com.co',
    contrasenaHash: 'hash_sha256_mock_02',
    estado: 'Activo'
  },
  {
    idUsuario: 'USR-03',
    nombre: 'Sofia Montoya',
    cargo: 'Administradora de Sistemas y Datos',
    perfil: 'Administrador del Sistema',
    correo: 'sofia.montoya@kiramar.com.co',
    contrasenaHash: 'hash_sha256_mock_03',
    estado: 'Activo'
  }
];

export const VEHICULOS_INICIALES: Vehiculo[] = [
  {
    idVehiculo: 'VEH-01',
    placa: 'TKR-482',
    tipo: 'Furgon Seco',
    capacidadKg: 4500,
    volumenM3: 22.5,
    altoInterior: 2.3,
    anchoInterior: 2.2,
    largoInterior: 4.8,
    estadoVehiculo: 'Disponible',
    conductorAsignado: 'Jorge Alvarez',
    telefonoConductor: '+57 312 458 9012'
  },
  {
    idVehiculo: 'VEH-02',
    placa: 'JKL-891',
    tipo: 'Camion Estaca',
    capacidadKg: 3800,
    volumenM3: 18.0,
    altoInterior: 2.1,
    anchoInterior: 2.1,
    largoInterior: 4.2,
    estadoVehiculo: 'Disponible',
    conductorAsignado: 'Alberto Munoz',
    telefonoConductor: '+57 310 987 6543'
  },
  {
    idVehiculo: 'VEH-03',
    placa: 'WDM-204',
    tipo: 'Furgon Seco',
    capacidadKg: 2800,
    volumenM3: 14.0,
    altoInterior: 1.9,
    anchoInterior: 1.9,
    largoInterior: 3.8,
    estadoVehiculo: 'Disponible',
    conductorAsignado: 'Luis Fernando Rios',
    telefonoConductor: '+57 314 231 8765'
  },
  {
    idVehiculo: 'VEH-04',
    placa: 'QET-519',
    tipo: 'Van Urbana',
    capacidadKg: 1200,
    volumenM3: 6.5,
    altoInterior: 1.6,
    anchoInterior: 1.5,
    largoInterior: 2.7,
    estadoVehiculo: 'Disponible',
    conductorAsignado: 'David Mejia',
    telefonoConductor: '+57 320 876 5432'
  },
  {
    idVehiculo: 'VEH-05',
    placa: 'UTR-623',
    tipo: 'Camion Plataforma',
    capacidadKg: 7500,
    volumenM3: 32.0,
    altoInterior: 2.5,
    anchoInterior: 2.4,
    largoInterior: 6.0,
    estadoVehiculo: 'Reservado',
    conductorAsignado: 'Camilo Zapata',
    telefonoConductor: '+57 315 443 2190'
  },
  {
    idVehiculo: 'VEH-06',
    placa: 'STR-904',
    tipo: 'Tractocamion',
    capacidadKg: 8500,
    volumenM3: 38.0,
    altoInterior: 2.6,
    anchoInterior: 2.4,
    largoInterior: 7.2,
    estadoVehiculo: 'En Ruta',
    conductorAsignado: 'Guillermo Osorio',
    telefonoConductor: '+57 318 678 1234'
  },
  {
    idVehiculo: 'VEH-07',
    placa: 'MVZ-112',
    tipo: 'Furgon Seco',
    capacidadKg: 3500,
    volumenM3: 16.0,
    altoInterior: 2.0,
    anchoInterior: 2.0,
    largoInterior: 4.0,
    estadoVehiculo: 'Mantenimiento',
    conductorAsignado: 'Taller Central Kiramar',
    telefonoConductor: 'Revision preventiva bimestral'
  }
];

export const LINEAS_PEDIDO_INICIALES: LineaPedido[] = [
  // PED-201: Pedido pendiente normal para cubicaje
  {
    idLinea: 'LIN-101',
    idPedido: 'PED-201',
    idProducto: 'SKU-LACT-01',
    nombreProducto: 'Leche Entera Larga Vida 1L x 12 unds',
    cantidad: 80,
    pesoUnitario: 12.5,
    alto: 0.35,
    ancho: 0.25,
    largo: 0.40
  },
  {
    idLinea: 'LIN-102',
    idPedido: 'PED-201',
    idProducto: 'SKU-QUES-04',
    nombreProducto: 'Queso Campesino Bloque 2.5 kg',
    cantidad: 40,
    pesoUnitario: 2.6,
    alto: 0.20,
    ancho: 0.20,
    largo: 0.30
  },
  {
    idLinea: 'LIN-103',
    idPedido: 'PED-201',
    idProducto: 'SKU-MANT-02',
    nombreProducto: 'Mantequilla con Sal 250g x 24 unds',
    cantidad: 30,
    pesoUnitario: 6.2,
    alto: 0.25,
    ancho: 0.20,
    largo: 0.35
  },

  // PED-202: Pedido con datos maestros incompletos (pesoUnitario = 0 y dimensiones = 0)
  {
    idLinea: 'LIN-201',
    idPedido: 'PED-202',
    idProducto: 'SKU-YOG-NUEVO',
    nombreProducto: 'Yogurt Griego Frutos Rojos 500g (Lanzamiento)',
    cantidad: 150,
    pesoUnitario: 0.0, // Incompleto
    alto: 0.0, // Incompleto
    ancho: 0.0, // Incompleto
    largo: 0.0 // Incompleto
  },
  {
    idLinea: 'LIN-202',
    idPedido: 'PED-202',
    idProducto: 'SKU-DULC-08',
    nombreProducto: 'Arequipe Tradicional 1 kg x 12 unds',
    cantidad: 25,
    pesoUnitario: 12.8,
    alto: 0.30,
    ancho: 0.25,
    largo: 0.38
  },

  // PED-203: Pedido masivo que excede los limites de Kiramar (> 8,500 kg y > 38 m3)
  {
    idLinea: 'LIN-301',
    idPedido: 'PED-203',
    idProducto: 'SKU-SUER-IND',
    nombreProducto: 'Suero Costeno Granel Tambor Industrial 50 kg',
    cantidad: 180, // 9,000 kg en una sola linea!
    pesoUnitario: 52.0,
    alto: 0.85,
    ancho: 0.60,
    largo: 0.60
  },
  {
    idLinea: 'LIN-302',
    idPedido: 'PED-203',
    idProducto: 'SKU-CREM-IND',
    nombreProducto: 'Crema de Leche Industrial 20L',
    cantidad: 60,
    pesoUnitario: 21.0,
    alto: 0.45,
    ancho: 0.35,
    largo: 0.35
  },

  // PED-204: Pedido validado listo para asignar transporte
  {
    idLinea: 'LIN-401',
    idPedido: 'PED-204',
    idProducto: 'SKU-POST-03',
    nombreProducto: 'Postre Tres Leches Copas 120g x 30 unds',
    cantidad: 50,
    pesoUnitario: 4.2,
    alto: 0.25,
    ancho: 0.30,
    largo: 0.40
  },
  {
    idLinea: 'LIN-402',
    idPedido: 'PED-204',
    idProducto: 'SKU-BEB-CHO',
    nombreProducto: 'Bebida Chocolatada 200ml x 24 unds',
    cantidad: 100,
    pesoUnitario: 5.4,
    alto: 0.20,
    ancho: 0.25,
    largo: 0.35
  },

  // PED-205: Pedido asignado con ruta planificada
  {
    idLinea: 'LIN-501',
    idPedido: 'PED-205',
    idProducto: 'SKU-QUES-MOZ',
    nombreProducto: 'Queso Mozzarella Tajado 500g x 10 unds',
    cantidad: 90,
    pesoUnitario: 5.3,
    alto: 0.22,
    ancho: 0.24,
    largo: 0.32
  },

  // PED-206: Pedido en ejecucion con trazabilidad activa
  {
    idLinea: 'LIN-601',
    idPedido: 'PED-206',
    idProducto: 'SKU-SURT-SUPER',
    nombreProducto: 'Combo Lacteos Surtido Autoservicios',
    cantidad: 75,
    pesoUnitario: 14.5,
    alto: 0.40,
    ancho: 0.35,
    largo: 0.45
  }
];

export const PEDIDOS_INICIALES: Pedido[] = [
  {
    idPedido: 'PED-201',
    fechaPedido: '2026-11-10',
    cliente: 'Supermercados Euro - Sede Poblado',
    estadoPedido: 'Pendiente',
    destino: 'Calle 10 # 43E-12, El Poblado, Medellin',
    zonasEntrega: ['Zona Centro: Medellin Candelaria / Guayaquil']
  },
  {
    idPedido: 'PED-202',
    fechaPedido: '2026-11-10',
    cliente: 'Distribuidora La Vaquita - Sabaneta',
    estadoPedido: 'Requiere Datos Maestros',
    destino: 'Carrera 45 # 75 Sur-30, Sabaneta',
    zonasEntrega: ['Zona Sur: Envigado / Sabaneta / Caldas']
  },
  {
    idPedido: 'PED-203',
    fechaPedido: '2026-11-09',
    cliente: 'Cadena de Panaderias El Maná - Consolidado Metropolitano',
    estadoPedido: 'Excede Limites',
    destino: 'Calle 29 # 55-80, Zona Industrial Guayabal',
    zonasEntrega: ['Zona Industrial: Guayabal / Itagui']
  },
  {
    idPedido: 'PED-204',
    fechaPedido: '2026-11-10',
    cliente: 'Almacenes Exito - Central Mayorista Bloque 14',
    estadoPedido: 'Validado',
    destino: 'Autopista Sur # 85-20, Itagui',
    zonasEntrega: ['Zona Industrial: Guayabal / Itagui']
  },
  {
    idPedido: 'PED-205',
    fechaPedido: '2026-11-08',
    cliente: 'Super Inter - Bello Centro',
    estadoPedido: 'Asignado',
    destino: 'Calle 50 # 49-21, Bello',
    zonasEntrega: ['Zona Norte: Bello / Copacabana / Girardota']
  },
  {
    idPedido: 'PED-206',
    fechaPedido: '2026-11-08',
    cliente: 'Mercados del Oriente - San Antonio de Pereira',
    estadoPedido: 'En Ruta',
    destino: 'Carrera 55 # 28-10, Rionegro',
    zonasEntrega: ['Oriente Cercano: Rionegro / Guarne']
  }
];

// Calcular las cargas iniciales para los pedidos
PEDIDOS_INICIALES.forEach(p => {
  const lineas = LINEAS_PEDIDO_INICIALES.filter(l => l.idPedido === p.idPedido);
  p.carga = calcularCarga(lineas, p.idPedido);
  if (!p.carga.datosMaestrosCompletos) {
    p.estadoPedido = 'Requiere Datos Maestros';
  } else if (p.carga.excedeLimitesEmpresa) {
    p.estadoPedido = 'Excede Limites';
  }
});

export const ASIGNACIONES_INICIALES: Asignacion[] = [
  {
    idAsignacion: 'ASG-105',
    idPedido: 'PED-205',
    idVehiculo: 'VEH-05',
    idUsuario: 'USR-01',
    fechaAsignacion: '2026-11-09T08:30:00Z',
    fechaDespachoProgramada: '2026-11-10',
    estadoAsignacion: 'Confirmada'
  },
  {
    idAsignacion: 'ASG-106',
    idPedido: 'PED-206',
    idVehiculo: 'VEH-06',
    idUsuario: 'USR-01',
    fechaAsignacion: '2026-11-08T14:15:00Z',
    fechaDespachoProgramada: '2026-11-10',
    estadoAsignacion: 'En Despacho'
  }
];

export const RUTAS_INICIALES: RutaEntrega[] = [
  {
    idRuta: 'RUT-105',
    idAsignacion: 'ASG-105',
    idPedido: 'PED-205',
    idVehiculo: 'VEH-05',
    destinos: [
      'Calle 50 # 49-21, Bello Centro',
      'Diagonal 55 # 38-12, Copacabana',
      'Parque Principal, Girardota'
    ],
    zonas: [
      'Zona Norte: Bello / Copacabana / Girardota',
      'Zona Norte: Bello / Copacabana / Girardota',
      'Zona Norte: Bello / Copacabana / Girardota'
    ],
    ordenEntrega: [1, 2, 3],
    paradas: [
      {
        idParada: 'PRD-01',
        orden: 1,
        destino: 'Calle 50 # 49-21, Bello Centro',
        cliente: 'Super Inter - Bello Centro',
        zona: 'Zona Norte: Bello / Copacabana / Girardota',
        ventanaHoraria: '08:00 - 09:30',
        distanciaKm: 18.4,
        tiempoMinutos: 42,
        enCobertura: true
      },
      {
        idParada: 'PRD-02',
        orden: 2,
        destino: 'Diagonal 55 # 38-12, Copacabana',
        cliente: 'Tiendas D1 - Copacabana',
        zona: 'Zona Norte: Bello / Copacabana / Girardota',
        ventanaHoraria: '10:00 - 11:15',
        distanciaKm: 11.2,
        tiempoMinutos: 25,
        enCobertura: true
      },
      {
        idParada: 'PRD-03',
        orden: 3,
        destino: 'Parque Principal, Girardota',
        cliente: 'Supermercado Don Julio - Girardota',
        zona: 'Zona Norte: Bello / Copacabana / Girardota',
        ventanaHoraria: '11:45 - 13:00',
        distanciaKm: 14.8,
        tiempoMinutos: 30,
        enCobertura: true
      }
    ],
    distanciaTotalKm: 44.4,
    tiempoTotalMinutos: 97,
    estadoRuta: 'Planificada',
    modoCalculo: 'automatico'
  },
  {
    idRuta: 'RUT-106',
    idAsignacion: 'ASG-106',
    idPedido: 'PED-206',
    idVehiculo: 'VEH-06',
    destinos: [
      'Autopista Medellin-Bogota Km 24, Guarne',
      'Carrera 55 # 28-10, Rionegro Centro',
      'Plaza de San Antonio de Pereira, Rionegro'
    ],
    zonas: [
      'Oriente Cercano: Rionegro / Guarne',
      'Oriente Cercano: Rionegro / Guarne',
      'Oriente Cercano: Rionegro / Guarne'
    ],
    ordenEntrega: [1, 2, 3],
    paradas: [
      {
        idParada: 'PRD-10',
        orden: 1,
        destino: 'Autopista Medellin-Bogota Km 24, Guarne',
        cliente: 'Parador y Lacteos El Rancherito - Guarne',
        zona: 'Oriente Cercano: Rionegro / Guarne',
        ventanaHoraria: '09:00 - 10:30',
        distanciaKm: 29.5,
        tiempoMinutos: 50,
        enCobertura: true,
        entregado: true
      },
      {
        idParada: 'PRD-11',
        orden: 2,
        destino: 'Carrera 55 # 28-10, Rionegro Centro',
        cliente: 'Mercados del Oriente - Sede Central',
        zona: 'Oriente Cercano: Rionegro / Guarne',
        ventanaHoraria: '11:00 - 12:30',
        distanciaKm: 16.2,
        tiempoMinutos: 35,
        enCobertura: true,
        entregado: false
      },
      {
        idParada: 'PRD-12',
        orden: 3,
        destino: 'Plaza de San Antonio de Pereira, Rionegro',
        cliente: 'Repostería Tradicional San Antonio',
        zona: 'Oriente Cercano: Rionegro / Guarne',
        ventanaHoraria: '13:00 - 14:15',
        distanciaKm: 7.8,
        tiempoMinutos: 18,
        enCobertura: true,
        entregado: false
      }
    ],
    distanciaTotalKm: 53.5,
    tiempoTotalMinutos: 103,
    estadoRuta: 'En Ejecucion',
    modoCalculo: 'automatico'
  }
];

export const DESPACHOS_INICIALES: Despacho[] = [
  {
    idDespacho: 'DSP-501',
    idAsignacion: 'ASG-106',
    idRuta: 'RUT-106',
    idPedido: 'PED-206',
    idVehiculo: 'VEH-06',
    fechaDespacho: '2026-11-10T07:15:00Z',
    estadoDespacho: 'En Ejecucion',
    observaciones: 'Despacho matutino cadena de frio garantizada a 4C.',
    porcentajeAvance: 45,
    ubicacionActual: 'Rionegro - Glorieta del Aeropuerto JMC',
    conexionGpsActiva: true,
    ultimaUbicacionConocida: 'Rionegro - Glorieta del Aeropuerto JMC',
    horaUltimoReporteGps: '11:28 AM'
  }
];

export const TRAZABILIDAD_INICIAL: Trazabilidad[] = [
  {
    idRegistro: 'TRZ-01',
    idDespacho: 'DSP-501',
    fechaHora: '2026-11-10T07:15:00Z',
    ubicacion: 'CEDI Central Kiramar - Guayabal / Itagui',
    estadoEntrega: 'Salida de CEDI',
    novedad: 'Inspeccion de salida vehicular aprobada. Sellos de seguridad intactos.',
    usuarioRegistro: 'Mateo Henao'
  },
  {
    idRegistro: 'TRZ-02',
    idDespacho: 'DSP-501',
    fechaHora: '2026-11-10T08:10:00Z',
    ubicacion: 'Tunel de Oriente - Peaje Variante',
    estadoEntrega: 'Paso por Punto de Control',
    novedad: 'Transito fluido sin contratiempos termicos.',
    usuarioRegistro: 'Sistema Telemetria GPS'
  },
  {
    idRegistro: 'TRZ-03',
    idDespacho: 'DSP-501',
    fechaHora: '2026-11-10T09:40:00Z',
    ubicacion: 'Guarne - Autopista Km 24',
    estadoEntrega: 'Entrega Parcial Completada',
    novedad: 'Descarga exitosa en Parador El Rancherito (Parada 1 de 3). Recibe: Hernan Gomez.',
    usuarioRegistro: 'Guillermo Osorio (Conductor)'
  },
  {
    idRegistro: 'TRZ-04',
    idDespacho: 'DSP-501',
    fechaHora: '2026-11-10T11:28:00Z',
    ubicacion: 'Rionegro - Glorieta Aeropuerto JMC',
    estadoEntrega: 'En Transito hacia Parada 2',
    novedad: 'Vehiculo aproximandose a Mercados del Oriente. Temperatura de furgon: 3.8C.',
    usuarioRegistro: 'Sistema Telemetria GPS'
  }
];
