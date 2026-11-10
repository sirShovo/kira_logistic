# PLAN DE IMPLEMENTACION Y ESPECIFICACION FUNCIONAL DEL FRONTEND: CRM KIRA LOGISTIC

## INFORMACION GENERAL Y CONTEXTO DEL PROYECTO

### Organizacion Objeto de Estudio
Distribuidora Kiramar S.A.S.

### Nombre del Sistema
Kira Logistic (Sistema CRM y Gestion Logistica de Despachos de Mercancia)

### Documento Fuente Unico de Requisitos
Informe del Proyecto Pedagogico Integrador - Tercer Semestre: Kira Logistic (PPI-3).

### Premisa Fundamental de Desarrollo
Este documento es un prompt maestro y plan de especificacion funcional para desarrollar la aplicacion Frontend del CRM desde cero. Se asume que no existe codigo previo y que la totalidad de los requerimientos, pantallas, flujos, reglas de negocio y entidades se desprenden exclusivamente de las 26 paginas del documento PPI-3.

### Restricciones Estrictas de Diseno y Alcance
- **Alcance Exclusivo Frontend:** Se deben disenar y programar todas las vistas, componentes de interfaz de usuario, navegacion, gestion de estado reactivo en memoria/almacenamiento local del navegador y simulacion de integraciones con WMS y bases de datos.
- **Prohibicion Total de Discutir o Definir Colores:** No se debe hacer referencia a colores, tonalidades, paletas cromaticas ni codigos hexadecimales. La especificacion se enfoca de forma estricta en la disposicion estructural (layout), jerarquia visual, campos de entrada, botones de accion, controles de navegacion, estados logicos (habilitado, inhabilitado, cargando, vacio, error, advertencia) y validaciones de negocio.

---

## 1. DESCRIPCION DEL PROBLEMA OPERACIONAL Y OBJETIVOS DEL SISTEMA

### 1.1. Situacion Actual de Distribuidora Kiramar S.A.S.
El proceso actual de planificacion y gestion de despachos de mercancia en Distribuidora Kiramar S.A.S. presenta una alta dependencia de procedimientos manuales y criterios operativos no estandarizados para:
1. La recepcion y revision de pedidos pendientes por despachar.
2. El calculo de peso, dimensiones y volumen cubico de los productos.
3. La determinacion de la disponibilidad y capacidad de la flota de transporte.
4. La reserva y asignacion de vehiculos a los pedidos.
5. La organizacion y secuenciacion de rutas de entrega en zonas de cobertura.
6. El seguimiento y control en tiempo real de los despachos y la trazabilidad de la entrega.

A pesar de contar con un sistema WMS corporativo con informacion almacenada, la organizacion carece de una plataforma de interfaz centralizada e integrada que automatice los calculos, gestione reservas sin colisiones y provea seguimiento continuo.

### 1.2. Objetivo General del CRM Frontend
Construir una interfaz de usuario interactiva y centralizada que elimine las operaciones manuales, automatice la correspondencia tecnica entre carga y vehiculo, valide las politicas empresariales, permita organizar rutas de entrega y proporcione una consola de trazabilidad de los despachos en ejecucion.

---

## 2. ACTORES, PERFILES Y CONTROL DE ACCESO (RNF-01, CLASE USUARIO)

El sistema debe proveer autenticacion de usuarios y control de acceso basado en perfiles segun lo estipulado en las secciones 2.3 (RNF-01), 3.1 (Casos de Uso) y 4.1 (Clase Usuario) del PPI-3:

### 2.1. Perfiles de Usuario
1. **Personal de logistica / despachos:**
   - Rol operativo encargado de la planificacion en piso y despacho.
   - Acceso:
     - Consultar y gestionar pedidos pendientes (UC-01).
     - Calcular y consolidar caracteristicas de carga (UC-02).
     - Consultar disponibilidad vehicular y filtrar flota (UC-03).
     - Asignar vehiculo y formalizar reserva de transporte (UC-04).
     - Planificar y ajustar rutas de entrega (UC-05).
     - Consultar trazabilidad de despachos (UC-06).
   - Restricciones: No tiene permisos de administracion de usuarios ni gestion de copias de respaldo.

2. **Personal de logistica / transporte:**
   - Rol operativo enfocado en la flota y la distribucion fisica.
   - Acceso:
     - Consultar vehiculos y su estado operativo.
     - Consultar rutas asignadas para ejecucion.
     - Gestionar el seguimiento y trazabilidad de los despachos (UC-06).
     - Registrar novedades de entrega (devoluciones, reprogramaciones, eventos en ruta).
     - Marcar despachos como completados.
   - Restricciones: No puede crear pedidos, calcular volumetria de carga ni modificar la configuracion del sistema.

3. **Administrador del sistema:**
   - Rol de soporte y gobierno tecnologico (Area de Sistemas / Logistica).
   - Acceso:
     - Control global de todos los modulos.
     - Administracion de usuarios, cargos, perfiles y estados de cuenta (RNF-01, Clase Usuario).
     - Supervision de la integridad y consistencia de datos (RNF-05).
     - Generacion, descarga y restauracion de copias de respaldo (RNF-06).
     - Simulador de disponibilidad y fallos de conexion (RNF-03).

### 2.2. Requerimientos de Interfaz para la Gestion de Acceso
- Selector o conmutador de sesion de usuario activo visible en el encabezado general, que permita cambiar de perfil con fines de evaluacion y demostracion de flujos.
- Adaptacion dinamica de la navegacion: Ocultar o inhabilitar enlaces y botones segun el perfil autenticado.
- Mensajes claros de acceso denegado cuando un usuario intente invocar una operacion fuera de sus privilegios.

---

## 3. MODELO DE DATOS Y CONTRATOS DE INFORMACION DEL FRONTEND

El frontend debe basarse estrictamente en las 9 clases del Diagrama de Clases (FO-DCL, paginas 21-22) y las 9 entidades del Diagrama Entidad-Relacion (FO-DER, paginas 23-25).

```
+-----------------------------------------------------------------------------------+
|                        RELACIONES PRINCIPALES DEL SISTEMA                         |
|                                                                                   |
|  [USUARIO] (1:N) -----> [ASIGNACION] <----- (1:N) [VEHICULO]                     |
|                               ^                                                   |
|                               | (1:1)                                             |
|  [PEDIDO] (1:1) ------> [CARGA_PEDIDO]                                            |
|    |                                                                              |
|    +---- (1:N) -------> [LINEA_PEDIDO]                                            |
|                                                                                   |
|  [ASIGNACION] (1:1) --> [RUTA_ENTREGA]                                            |
|       |                                                                           |
|       +-------- (1:1) -> [DESPACHO] (1:N) ----> [TRAZABILIDAD]                    |
+-----------------------------------------------------------------------------------+
```

### 3.1. Entidad Pedido (Clase `Pedido` / Tabla `PEDIDO`)
- **Atributos:**
  - `idPedido` (String, Identificador unico / Clave primaria).
  - `fechaPedido` (Date / String en formato ISO YYYY-MM-DD).
  - `estadoPedido` (String): Valores admitidos: `"Pendiente"`, `"Validado"`, `"Requiere Datos Maestros"`, `"Excede Limites"`, `"Asignado"`, `"En Ruta"`, `"Completado"`, `"Devolucion"`, `"Reprogramado"`.
  - `destino` (String, Direccion o lista de direcciones de entrega).
  - `zonasEntrega` (List<String>, Nombres de zonas logisticas asociadas a las entregas).
- **Metodos que debe soportar la logica frontend:**
  - `consultarPedidosPendientes(): List<Pedido>`
  - `obtenerDetalle(): Pedido`
  - `actualizarEstado(estado: String): void`
- **Relaciones:** Contiene 1 a N instancias de `LineaPedido`. Se asocia a 1 instancia de `Asignacion`.

### 3.2. Entidad LineaPedido (Clase `LineaPedido` / Tabla `LINEA_PEDIDO`)
- **Atributos:**
  - `idLinea` (String, Identificador unico / Clave primaria).
  - `idPedido` (String, Clave foranea hacia `Pedido`).
  - `idProducto` (String, Codigo SKU del producto).
  - `nombreProducto` (String, Descripcion del producto).
  - `cantidad` (Integer, Unidades del producto).
  - `pesoUnitario` (Double, Peso unitario en kilogramos).
  - `alto` (Double, Altura en metros).
  - `ancho` (Double, Ancho en metros).
  - `largo` (Double, Largo en metros).
- **Metodos que debe soportar la logica frontend:**
  - `calcularPesoTotal(): Double` $\rightarrow$ `cantidad * pesoUnitario`.
  - `calcularVolumenTotal(): Double` $\rightarrow$ `cantidad * alto * ancho * largo`.
  - `validarDatosMaestros(): Boolean` $\rightarrow$ Retorna `true` si `pesoUnitario > 0` y dimensiones mayores a 0.

### 3.3. Entidad CargaPedido (Clase `CargaPedido` / Tabla `CARGA_PEDIDO`)
- **Atributos:**
  - `idCarga` (String, Clave primaria).
  - `idPedido` (String, Clave foranea hacia `Pedido`).
  - `pesoTotalKg` (Double, Peso acumulado de todas las lineas).
  - `volumenTotalM3` (Double, Volumen cubico acumulado en metros cubicos).
  - `dimMaxAlto` (Double, Altura maxima registrada entre los productos).
  - `dimMaxAncho` (Double, Ancho maximo registrado entre los productos).
  - `dimMaxLargo` (Double, Longitud maxima registrada entre los productos).
- **Metodos que debe soportar la logica frontend:**
  - `calcularCaracteristicas(): CargaPedido`
  - `validarLimitesEmpresa(): Boolean`
  - `obtenerResumen(): String`
- **Relaciones:** Generada en relacion 1:1 desde `Pedido`. Es insumo directo para la seleccion de `Vehiculo` y la generacion de `Asignacion`.

### 3.4. Entidad Vehiculo (Clase `Vehiculo` / Tabla `VEHICULO`)
- **Atributos:**
  - `idVehiculo` (String, Clave primaria).
  - `placa` (String, Matricula vehicular oficial).
  - `tipo` (String, Tipo de carroceria: Van Urbana, Camion Estaca, Furgon Seco, Camion Plataforma, Tractocamion).
  - `capacidadKg` (Double, Capacidad de carga util en kilogramos).
  - `volumenM3` (Double, Volumen volumetrico util de la carroceria en metros cubicos).
  - `altoInterior` (Double, Altura util interior en metros).
  - `anchoInterior` (Double, Ancho util interior en metros).
  - `largoInterior` (Double, Longitud util interior en metros).
  - `estadoVehiculo` (String): Valores admitidos: `"Disponible"`, `"Reservado"`, `"En Ruta"`, `"Mantenimiento"`.
- **Metodos que debe soportar la logica frontend:**
  - `consultarDisponibles(fecha: Date): List<Vehiculo>`
  - `filtrarPorCapacidad(carga: CargaPedido): List<Vehiculo>`
  - `reservar(): void`
  - `liberarReserva(): void`
- **Relaciones:** Participa en 1 a N `Asignacion` a lo largo del tiempo. Posee historial de `Despacho`.

### 3.5. Entidad Asignacion (Clase `Asignacion` / Tabla `ASIGNACION`)
- **Atributos:**
  - `idAsignacion` (String, Clave primaria).
  - `idPedido` (String, Clave foranea hacia `Pedido`).
  - `idVehiculo` (String, Clave foranea hacia `Vehiculo`).
  - `idUsuario` (String, Clave foranea hacia `Usuario` que formalizo la reserva).
  - `fechaAsignacion` (Date / String ISO).
  - `estadoAsignacion` (String): `"Reservada"`, `"Confirmada"`, `"En Despacho"`, `"Completada"`, `"Cancelada"`.
- **Metodos que debe soportar la logica frontend:**
  - `registrarAsignacion(): void`
  - `cancelarAsignacion(): void`
  - `validarDisponibilidad(): Boolean`
  - `obtenerDetalle(): Asignacion`
- **Relaciones:** Vincula 1 `Pedido` con 1 `Vehiculo`. Precede la creacion de 1 `RutaEntrega` y 1 `Despacho`.

### 3.6. Entidad RutaEntrega (Clase `RutaEntrega` / Tabla `RUTA_ENTREGA`)
- **Atributos:**
  - `idRuta` (String, Clave primaria).
  - `idAsignacion` (String, Clave foranea hacia `Asignacion`).
  - `destinos` (List<String>, Direcciones de las paradas).
  - `zonas` (List<String>, Zonas logisticas correspondientes a cada parada).
  - `ordenEntrega` (List<Integer>, Secuencia numerica de atencion: 1, 2, 3...).
  - `estadoRuta` (String): `"Planificada"`, `"Advertencia Cobertura"`, `"Ajuste Manual"`, `"En Ejecucion"`, `"Finalizada"`.
- **Metodos que debe soportar la logica frontend:**
  - `planificarRuta(): RutaEntrega`
  - `ajustarOrdenManual(): void`
  - `obtenerRutaConsolidada(): RutaEntrega`
  - `actualizarEstado(): void`
- **Relaciones:** Se genera en relacion 1:1 a partir de una `Asignacion`. Queda vinculada a un `Despacho`.

### 3.7. Entidad Despacho (Clase `Despacho` / Tabla `DESPACHO`)
- **Atributos:**
  - `idDespacho` (String, Clave primaria).
  - `idAsignacion` (String, Clave foranea hacia `Asignacion`).
  - `idRuta` (String, Clave foranea hacia `RutaEntrega`).
  - `fechaDespacho` (Date / String ISO).
  - `estadoDespacho` (String): `"Programado"`, `"En Ejecucion"`, `"Con Novedad"`, `"Completado"`, `"Devolucion"`, `"Reprogramado"`.
  - `observaciones` (String, Notas operativas y novedades).
- **Metodos que debe soportar la logica frontend:**
  - `iniciarDespacho(): void`
  - `actualizarEstado(estado: String): void`
  - `registrarNovedad(novedad: String): void`
  - `finalizarDespacho(): void`
- **Relaciones:** Consolida una `Asignacion` y su `RutaEntrega`. Origina 1 a N registros en `Trazabilidad`.

### 3.8. Entidad Trazabilidad (Clase `Trazabilidad` / Tabla `TRAZABILIDAD`)
- **Atributos:**
  - `idRegistro` (String, Clave primaria).
  - `idDespacho` (String, Clave foranea hacia `Despacho`).
  - `fechaHora` (DateTime / String ISO timestamp).
  - `ubicacion` (String, Descripcion textual del punto de control o direccion).
  - `estadoEntrega` (String, Estado puntual del evento).
  - `novedad` (String, Detalle de anomalidades o confirmacion de recibo).
- **Metodos que debe soportar la logica frontend:**
  - `registrarEvento(): void`
  - `consultarHistorial(idDespacho: String): List<Trazabilidad>`
  - `marcarEntregaCompletada(): void`
  - `marcarDevolucion(motivo: String): void`
- **Relaciones:** Registra cronologicamente los sucesos de un `Despacho` hasta su conclusion.

### 3.9. Entidad Usuario (Clase `Usuario` / Tabla `USUARIO`)
- **Atributos:**
  - `idUsuario` (String, Clave primaria).
  - `nombre` (String, Nombre completo del colaborador).
  - `cargo` (String, Cargo administrativo u operativo).
  - `perfil` (String, Perfil funcional asignado).
  - `contrasenaHash` (String, Clave de autenticacion).
  - `estado` (String, `"Activo"` o `"Inactivo"`).
- **Metodos que debe soportar la logica frontend:**
  - `autenticar(usuario: String, pass: String): Boolean`
  - `obtenerPermisos(): List<String>`
  - `actualizarDatos(): void`

---

## 4. MOTOR LOGICO Y REGLAS DE NEGOCIO EN EL CLIENTE

El frontend debe integrar una capa de calculos y reglas de validacion sin depender de servicios externos iniciales:

### 4.1. Algoritmo de Consolidacion de Carga
Dado un `Pedido` con su coleccion de `LineaPedido`:
1. Para cada linea, calcular:
   $$\text{pesoLinea} = \text{cantidad} \times \text{pesoUnitario}$$
   $$\text{volumenLinea} = \text{cantidad} \times (\text{alto} \times \text{ancho} \times \text{largo})$$
2. Acumular los totales:
   $$\text{pesoTotalKg} = \sum \text{pesoLinea}$$
   $$\text{volumenTotalM3} = \sum \text{volumenLinea}$$
3. Determinar dimensiones maximas de bulto individual:
   $$\text{dimMaxAlto} = \max(\text{alto}_i)$$
   $$\text{dimMaxAncho} = \max(\text{ancho}_i)$$
   $$\text{dimMaxLargo} = \max(\text{largo}_i)$$
4. **Validacion de Datos Maestros (UC-02 Camino Alternativo 1):**
   - Si para cualquier linea `pesoUnitario <= 0` o cualquiera de sus dimensiones es menor o igual a cero, se marca `datosMaestrosCompletos = false`.
   - El estado del pedido se fija en `"Requiere Datos Maestros"`.
5. **Validacion de Limites Corporativos (UC-02 Camino Alternativo 2):**
   - Politica de Distribuidora Kiramar S.A.S.:
     - Peso maximo por despacho individual: 8,500 kg.
     - Volumen maximo por despacho individual: 38.0 m³.
   - Si `pesoTotalKg > 8500` o `volumenTotalM3 > 38.0`, se marca `excedeLimitesEmpresa = true`.
   - El estado del pedido se fija en `"Excede Limites"`.

### 4.2. Algoritmo de Fraccionamiento de Pedidos Excedidos
Cuando un pedido excede limites y el usuario ejecuta la division:
- El pedido original se particiona en dos sub-pedidos: `idPedido + "-A"` y `idPedido + "-B"`.
- Las cantidades de cada linea se reparten de forma balanceada ($\lceil \text{cantidad} / 2 \rceil$ y $\lfloor \text{cantidad} / 2 \rfloor$).
- Se recalculan de forma autonoma las cargas de ambos sub-pedidos, quedando ambos con estado `"Validado"`.

### 4.3. Algoritmo de Compatibilidad de Flota Vehicular
Un vehiculo $V$ es considerado candidato idoneo para una carga $C$ en una fecha determinada si y solo si:
1. $V.\text{estadoVehiculo} = \text{"Disponible"}$.
2. La fecha de despacho solicitada no coincide con ninguna fecha en la que el vehiculo ya tenga una reserva activa.
3. $V.\text{capacidadKg} \ge C.\text{pesoTotalKg}$.
4. $V.\text{volumenM3} \ge C.\text{volumenTotalM3}$.
5. $V.\text{altoInterior} \ge C.\text{dimMaxAlto}$.
6. $V.\text{anchoInterior} \ge C.\text{dimMaxAncho}$.
7. $V.\text{largoInterior} \ge C.\text{dimMaxLargo}$.

### 4.4. Validacion de Zonas de Cobertura
- Zonas oficiales de Distribuidora Kiramar S.A.S.:
  - Zona Norte: Bello / Copacabana / Girardota.
  - Zona Centro: Medellin Candelaria / Guayaquil.
  - Zona Industrial: Guayabal / Itagüi.
  - Zona Sur: Envigado / Sabaneta / Caldas.
  - Oriente Cercano: Rionegro / Guarne.
- Si un destino no se encuentra clasificado dentro de estas zonas oficiales, la ruta se marca automaticamente con `"Advertencia Cobertura"`.

---

## 5. ESPECIFICACION FUNCIONAL DE PANTALLAS Y CASOS DE USO

```
                                  MAPA DE VISTAS DEL CRM
  +---------------------------------------------------------------------------------------+
  | [ENCABEZADO GLOBAL]: Selector de Perfil | Estado Conexion WMS | Indicadores Generales |
  +---------------------------------------------------------------------------------------+
  | [BARRA LATERAL]:                                                                      |
  |  - Vista General del Flujo (Pipeline Secuencial)                                      |
  |  - Pantalla 1: Gestion de Pedidos y Caracteristicas de Carga (UC-01, UC-02)           |
  |  - Pantalla 2: Flota Vehicular, Compatibilidad y Reserva (UC-03, UC-04)               |
  |  - Pantalla 3: Planificacion y Reordenamiento de Rutas (UC-05)                       |
  |  - Pantalla 4: Consola de Seguimiento y Trazabilidad en Transito (UC-06)              |
  |  - Pantalla 5: Administracion, Integridad y Respaldos (RNF-01 a RNF-06)               |
  +---------------------------------------------------------------------------------------+
```

---

### 5.1. Encabezado Global de Comandos y Navegacion Superior
Debe estar siempre presente en la parte superior de la aplicacion:
- **Identificacion del Sistema:** Rotulo institucional "Kira Logistic - Distribuidora Kiramar S.A.S.".
- **Selector de Perfil Activo (UC_Login Simulado):**
  - Desplegable interactivo para alternar entre:
    - Personal de logistica / despachos.
    - Personal de logistica / transporte.
    - Administrador del sistema.
  - Muestra el nombre del usuario logueado y su cargo.
- **Conmutador de Disponibilidad de Servidor / WMS (RNF-03):**
  - Interruptor interactivo con etiqueta de estado textual: "Enlace WMS / Base de Datos: Conectado" vs "Desconectado".
  - Permite inducir en cualquier momento el fallo de conexion para verificar el Camino Alternativo 2 de UC-01.
- **Resumen Estadistico Superior:**
  - Contador de Pedidos Pendientes.
  - Contador de Vehiculos en Operacion.
  - Contador de Despachos en Transito.

---

### 5.2. Pantalla 1: Gestion de Pedidos Pendientes y Analisis de Carga (RF-01, RF-02, UC-01, UC-02)

#### Componentes de la Vista:
1. **Barra de Filtros y Herramientas:**
   - Campo de busqueda por texto: Busca por codigo de pedido (`idPedido`), destino o zona.
   - Selector de filtro por estado: Permite seleccionar `"Pendiente"`, `"Validado"`, `"Requiere Datos Maestros"`, `"Excede Limites"`, `"Asignado"`, `"Todos"`.
   - Boton de accion: "Recargar lista de pedidos".
   - Boton de accion: "Generar pedido de prueba".

2. **Tabla de Pedidos (RF-01):**
   - Columnas obligatorias:
     1. Codigo de Pedido (`idPedido`).
     2. Fecha de Registro (`fechaPedido`).
     3. Destino principal.
     4. Zonas logisticas de entrega (`zonasEntrega`).
     5. Cantidad total de referencias.
     6. Estado del Pedido (`estadoPedido`).
     7. Acciones por fila:
        - Boton "Analizar Carga": Abre el panel de calculo de volumetria (UC-02).
        - Boton "Asignar Transporte": Transiciona a la pantalla de seleccion vehicular (UC-03). Habilitado unicamente si el estado es `"Validado"`.

3. **Manejo de Caminos Alternativos de UC-01:**
   - **Camino Alternativo 1 (No hay registros pendientes):**
     - Si la lista de pedidos esta vacia o ningun registro coincide con el filtro, la tabla se oculta y se presenta un contenedor de estado vacio:
       - Titulo: "Sin pedidos pendientes de despacho".
       - Descripcion: "No se registran solicitudes pendientes en el estado seleccionado".
       - Boton: "Restablecer filtros de busqueda".
   - **Camino Alternativo 2 (Fallo de conexion con Base de Datos / WMS):**
     - Si el conmutador de conexion WMS esta en modo Desconectado, la tabla se bloquea y se despliega un panel de alerta superior:
       - Titulo de alerta: "Error de enlace con la base de datos central".
       - Descripcion: "No es posible consultar ni actualizar la informacion de pedidos en este momento".
       - Boton: "Reintentar conexion".

4. **Panel Lateral de Detalle de Carga y Lineas de Pedido (UC-02):**
   Al seleccionar un pedido, se abre un panel lateral con:
   - Tabla con el desglose de cada producto (`LineaPedido`):
     - Codigo SKU (`idProducto`).
     - Nombre del producto (`nombreProducto`).
     - Cantidad solicitada (`cantidad`).
     - Peso unitario (kg).
     - Dimensiones individuales: Alto (m), Ancho (m), Largo (m).
     - Peso total de la linea ($\text{cantidad} \times \text{pesoUnitario}$).
     - Volumen total de la linea ($\text{cantidad} \times \text{alto} \times \text{ancho} \times \text{largo}$).
   - Tarjeta de Resumen Consolidado de Carga (`CargaPedido`):
     - Indicador numerico de Peso Total en Kilogramos.
     - Indicador numerico de Volumen Total en Metros Cubicos ($m^3$).
     - Dimension maxima de altura, ancho y longitud.
     - Resumen sintetizado en texto: Cantidad de referencias, peso consolidado y dimensiones limites.

5. **Manejo de Caminos Alternativos de UC-02:**
   - **Camino Alternativo 1 (Faltan datos maestros de peso o dimensiones en productos):**
     - Si en el pedido existe al menos una linea con peso unitario en 0 o dimensiones en 0:
       - El pedido muestra la etiqueta de estado `"Requiere Datos Maestros"`.
       - Se visualiza una alerta en el panel: "Advertencia: El pedido contiene productos con datos maestros de peso o dimensiones incompletos. Se requiere correccion para permitir el analisis de carga".
       - En la tabla de lineas de pedido, los campos incompletos se muestran con un indicador de requerimiento pendiente.
       - Se habilita el boton de accion: "Completar Datos Maestros de Producto".
       - Al presionar el boton, se abre un dialogo modal que permite ingresar interactivamente los valores de peso unitario (kg), alto (m), ancho (m) y largo (m) para cada SKU incompleto.
       - Al guardar los datos en el modal, se actualiza la entidad `LineaPedido`, se recalcula la carga consolidada y el estado del pedido pasa a `"Validado"`.
   - **Camino Alternativo 2 (Carga excede limite maximo corporativo):**
     - Si la carga supera 8,500 kg o 38.0 m³:
       - El pedido muestra la etiqueta de estado `"Excede Limites"`.
       - Se despliega una notificacion de advertencia: "Alerta de Politica de Despacho: El pedido supera la capacidad maxima admisible para un unico transporte por politica interna de Distribuidora Kiramar S.A.S.".
       - Se inhabilita la asignacion directa a un solo vehiculo.
       - Se habilita el boton de accion resolutiva: "Dividir Pedido en Sub-Despachos Sugeridos".
       - Al presionar el boton, el sistema ejecuta el fraccionamiento automatico creando dos pedidos hijos (`PED-XXX-A` y `PED-XXX-B`), recalculando sus respectivas cargas y dejandolos en estado `"Validado"`.

---

### 5.3. Pantalla 2: Flota Vehicular, Compatibilidad y Reserva de Transporte (RF-03, RF-04, UC-03, UC-04)

#### Componentes de la Vista:
1. **Tarjeta de Carga Activa Seleccionada:**
   - Muestra el identificador del pedido bajo evaluacion, su peso total en kg, volumen en $m^3$ y dimensiones maximas a ubicar.
2. **Barra de Parametros de Busqueda Vehicular (UC-03):**
   - Campo selector de fecha requerida de despacho (selector de fecha).
   - Interruptor de criterio de filtro:
     - Opcion activa: "Mostrar unicamente vehiculos que cumplan capacidad fisica y dimensional".
     - Opcion inactiva: "Mostrar parque automotor completo".
3. **Rejilla o Lista de Vehiculos de la Flota:**
   - Cada tarjeta de vehiculo debe exponer:
     1. Placa oficial y tipo de carroceria (ej. Furgon NPR, Camion Estaca, etc.).
     2. Capacidad util en kilogramos y volumen util en metros cubicos.
     3. Dimensiones interiores utiles de carroceria (Alto x Ancho x Largo en metros).
     4. Estado operativo actual: `"Disponible"`, `"Reservado"`, `"En Ruta"`, `"Mantenimiento"`.
     5. Indicador de Ocupacion Proyectada:
        - Porcentaje de llenado en peso: $(\text{pesoCarga} / \text{capacidadKg}) \times 100$.
        - Porcentaje de llenado en volumen: $(\text{volumenCarga} / \text{volumenM3}) \times 100$.
        - Evaluacion fisica: Etiqueta de "Dimensiones Compatibles" o "Dimension Insuficiente".
     6. Boton de accion: "Asignar y Reservar Transporte".
        - Habilitado solo si el vehiculo esta Disponible, libre en la fecha y cubre los requerimientos fisicos.

4. **Manejo de Caminos Alternativos de UC-03:**
   - **Camino Alternativo 1 (No hay vehiculos disponibles en la fecha solicitada):**
     - Si ningun vehiculo de la flota se encuentra en estado `"Disponible"` para el dia seleccionado:
       - Se muestra el mensaje: "No se encontraron unidades vehiculares disponibles para la fecha indicada".
       - El sistema calcula y despliega una lista interactiva de **Fechas Alternativas Sugeridas** con disponibilidad confirmada en la flota (ej. fecha solicitada + 1 dia habil, + 2 dias habiles).
       - Al hacer clic sobre una fecha sugerida, el selector se actualiza y la lista de vehiculos se refresca de inmediato.
   - **Camino Alternativo 2 (Ningun vehiculo cubre la capacidad de la carga):**
     - Si existen vehiculos disponibles pero ninguno posee la capacidad de carga o cubicaje suficiente para el pedido:
       - Se muestra la advertencia: "Capacidad vehicular insuficiente: Ninguna unidad individual puede transportar la totalidad de la carga".
       - La interfaz propone la recomendacion tecnica: "Se sugiere utilizar multiples vehiculos mediante fraccionamiento de carga".

5. **Flujo de Confirmacion y Reserva (UC-04):**
   - Al pulsar "Asignar y Reservar Transporte", se abre una ventana modal de formalizacion:
     - Detalle de la operacion: Pedido, Carga total, Placa vehicular seleccionada y Usuario responsable.
     - Boton: "Confirmar Asignacion y Reserva".
     - Boton: "Cancelar".
   - **Manejo de Caminos Alternativos de UC-04:**
     - **Camino Alternativo 1 (Conflicto de concurrencia en reserva):**
       - Si la propiedad de concurrencia del vehiculo indica que fue tomado por otro usuario unos instantes antes:
         - Se cancela la confirmacion y se muestra una ventana de error de concurrencia: "Conflicto de concurrencia: El vehiculo seleccionado acaba de ser reservado por otro usuario de logistica. Seleccione otra unidad disponible".
         - La lista de vehiculos actualiza el estado de dicha unidad a `"Reservado"`.
     - **Camino Alternativo 2 (Cancelacion previa a la confirmacion):**
       - Si el despachador presiona "Cancelar", la ventana modal se cierra sin realizar modificaciones.
       - El vehiculo permanece en estado `"Disponible"` y el pedido continua en estado `"Validado"`.
   - **Poscondicion de Exito de UC-04:**
     - Se registra la nueva entidad `Asignacion` (`idAsignacion`, `idPedido`, `idVehiculo`, `idUsuario`, `fechaAsignacion`, `estadoAsignacion: "Reservada"`).
     - El vehiculo seleccionado pasa a estado `"Reservado"`.
     - El pedido asignado pasa a estado `"Asignado"`.
     - Se notifica la confirmacion de la reserva y se habilita el acceso a la planificacion de la ruta de entrega.

---

### 5.4. Pantalla 3: Planificacion de Rutas de Entrega y Secuencia de Paradas (RF-05, UC-05)

#### Componentes de la Vista:
1. **Encabezado de la Ruta:**
   - Codigo de Asignacion vinculada.
   - Datos del vehiculo reservado (Placa, tipo).
   - Punto de partida obligatorio: CEDI Central Distribuidora Kiramar S.A.S. (Guayabal / Itagüi).
   - Metricas calculadas de la ruta: Total de paradas, distancia acumulada en kilometros y tiempo total estimado en minutos.
2. **Tabla o Lista Secuencial de Paradas (`ParadaRuta`):**
   - Para cada parada:
     1. Numero de orden en la secuencia de entrega (1, 2, 3...).
     2. Direccion fisica de destino.
     3. Zona logistica asignada.
     4. Ventana horaria programada para descarga.
     5. Distancia estimada del tramo (km).
     6. Tiempo estimado del tramo (minutos).
     7. Indicador de cobertura: "En Cobertura" o "Fuera de Cobertura".
     8. Controles de ordenamiento: Boton "Mover Arriba" y Boton "Mover Abajo".
3. **Conmutador de Modo de Calculo de Ruta:**
   - Opcion 1: "Calculo Automatico WMS/GIS".
   - Opcion 2: "Ajuste Manual Operativo".
4. **Boton Principal de Consolidacion:**
   - Boton "Generar y Consolidar Hoja de Ruta".

#### Manejo de Caminos Alternativos de UC-05:
- **Camino Alternativo 1 (Destino fuera de cobertura logistica autorizada):**
  - Si una direccion pertenece a una zona no registrada en el catalogo oficial:
    - La parada correspondiente muestra una etiqueta de advertencia: "Destino no coincide con zonas de cobertura logisticas autorizadas".
    - El estado de la ruta se clasifica como `"Advertencia Cobertura"`.
    - Se habilita un panel de intervencion manual que permite al despachador reasignar la zona o modificar la direccion para regularizar la parada.
- **Camino Alternativo 2 (Fallo de motor de calculo automatico de distancias / Modo manual):**
  - Si el calculo automatico falla o el usuario selecciona "Ajuste Manual Operativo":
    - Se desbloquean los controles de ordenamiento (flechas arriba/abajo) para que el despachador ajuste manualmente la secuencia de atencion de los destinos.
    - Se habilitan campos de entrada numerica para editar manualmente los kilometros y minutos estimados de cada parada.
    - El estado de la ruta se clasifica como `"Ajuste Manual"`.

#### Poscondicion de Exito de UC-05:
- Se genera formalmente la entidad `RutaEntrega` (`idRuta`, `idAsignacion`, `destinos`, `zonas`, `ordenEntrega`, `estadoRuta`).
- Se genera preliminarmente la entidad `Despacho` con `estadoDespacho: "Programado"`.
- Se disponibiliza la ruta para el inicio de ejecucion por parte del area de transporte.

---

### 5.5. Pantalla 4: Ejecucion, Trazabilidad y Monitoreo de Despachos en Transito (RF-06, UC-06)

#### Componentes de la Vista:
1. **Buscador y Selector de Despachos:**
   - Busqueda por codigo de despacho (`idDespacho`), placa o cliente.
   - Filtros por estado: `"Programado"`, `"En Ejecucion"`, `"Con Novedad"`, `"Completado"`, `"Devolucion"`, `"Reprogramado"`.
2. **Consola de Control del Despacho Seleccionado:**
   - Datos generales: Codigo de Despacho, Ruta, Vehiculo y Conductor.
   - Barra de avance del recorrido: Porcentaje numerico de progreso (0% a 100%).
   - Indicador de estado telematico:
     - Etiqueta textual: "Enlace GPS Activo" vs "Desconexion Temporal GPS".
     - Interruptor para simular perdida de conexion GPS (util para Camino Alternativo 1).
   - Ultima ubicacion conocida registrada (texto de direccion o referencia).
3. **Botonera de Control Operativo:**
   - Boton "Iniciar Recorrido de Despacho" (cambia estado a `"En Ejecucion"`).
   - Boton "Registrar Evento de Trazabilidad en Ruta".
   - Boton "Reportar Novedad de Entrega" (abre modal para registrar inconvenientes).
   - Boton "Confirmar Entrega Completada" (finaliza el despacho con exito).

#### Manejo de Caminos Alternativos de UC-06:
- **Camino Alternativo 1 (Falla de actualizacion por perdida de conexion GPS):**
  - Si el enlace se interrumpe (`conexionGpsActiva = false`):
    - La consola despliega un panel de alerta: "Alerta de perdida de conexion telematicas con el vehiculo. Mostrando ultima ubicacion conocida registrada".
    - Se expone la hora y el punto geografico del ultimo reporte exitoso.
    - Se habilita un formulario para registrar manualmente un reporte por canal telefonico radial.
- **Camino Alternativo 2 (La entrega no puede ser completada - Novedad en destino):**
  - Si el transportista no puede concretar la entrega (ejemplo: cliente no se encuentra en el domicilio, rechazo de mercancia, averia):
    - Al presionar "Reportar Novedad de Entrega", se despliega una ventana modal con:
      - Selector de Motivo de Falla: `"Cliente ausente"`, `"Direccion errada"`, `"Rechazo por fuera de horario"`, `"Mercancia con averia"`, `"Fallo mecanico vehicular"`.
      - Campo de texto libre para observaciones y descripcion de los hechos.
      - Selector de Resolucion Operativa: `"Devolucion a CEDI"` o `"Reprogramar Despacho"`.
    - Al confirmar el reporte:
      - El estado del `Despacho` cambia a `"Devolucion"` o `"Reprogramado"`.
      - El estado del `Pedido` vinculado se actualiza a `"Devolucion"` o `"Reprogramado"`.
      - Se inyecta un nuevo registro en la bitacora de `Trazabilidad`.
- **Flujo de Exito (Finalizacion del Despacho):**
  - Al completar todas las paradas y presionar "Confirmar Entrega Completada":
    - Se solicita ingresar: Nombre de quien recibe, documento de identidad y notas finales.
    - El `Despacho` pasa a estado `"Completado"`.
    - El `Pedido` pasa a estado `"Completado"`.
    - El `Vehiculo` pasa a estado `"Disponible"` (se libera la reserva y queda listo para nuevas asignaciones).
    - Se registra el cierre en la bitacora de trazabilidad.

4. **Bitacora de Historial de Trazabilidad (`Trazabilidad`):**
   - Lista cronologica con todos los eventos registrados para el despacho:
     - Marca de tiempo (Fecha y hora exacta).
     - Ubicacion o punto de control reportado.
     - Estado de entrega asociado.
     - Descripcion de la novedad o suceso.
     - Actor o usuario que realizo el registro.

---

### 5.6. Pantalla 5: Administracion, Seguridad y Respaldos (RNF-01, RNF-03, RNF-05, RNF-06)

Esta pantalla cubre integralmente los requisitos no funcionales del PPI-3:

1. **Gestion de Usuarios y Control de Acceso (RNF-01, Clase Usuario):**
   - Tabla de usuarios con: Identificador (`idUsuario`), Nombre, Cargo, Perfil asignado, Correo corporativo y Estado (`"Activo"` / `"Inactivo"`).
   - Formulario modal para registrar o modificar usuarios y asignar sus roles.
   - Visualizador de la matriz de privilegios segun el perfil seleccionado.
2. **Auditoria de Integridad y Consistencia de Informacion (RNF-05):**
   - Boton de accion: "Ejecutar Diagnostico de Consistencia de Datos".
   - Valida en memoria del cliente:
     - Que ningun pedido en estado "Asignado" carezca de vehiculo reservado.
     - Que no existan lineas de pedido sin su identificador de pedido correspondiente.
     - Que ningun vehiculo figure en estado "Reservado" sin una asignacion valida.
   - Muestra informe de hallazgos con alertas y opcion de resolucion automatica.
3. **Modulo de Copias de Respaldo de Informacion (RNF-06):**
   - **Generacion de Respaldo Inmediato:**
     - Boton "Crear Respaldo del Sistema".
     - Campo para ingresar descripcion o motivo de la copia de seguridad.
     - Al accionar, empaqueta el estado completo del sistema (pedidos, vehiculos, asignaciones, rutas, despachos, trazabilidad, usuarios) en una estructura serializada JSON.
   - **Historial de Respaldos:**
     - Tabla que lista las copias generadas con fecha/hora, autor, descripcion y resumen de registros contenidos.
     - Boton "Descargar Snapshot JSON" (guarda el archivo en el almacenamiento del usuario).
     - Boton "Restaurar Respaldo" (reemplaza el estado actual de la aplicacion por el del respaldo con ventana de confirmacion previa).
     - Boton "Importar Archivo de Respaldo" (permite seleccionar un archivo JSON externo y restaurarlo en el sistema).

---

## 6. PLAN DE FASES DE DESARROLLO SECUENCIAL (ROADMAP PARA EL AGENTE)

El agente encargado de implementar el frontend debe seguir estrictamente este orden metodologico para asegurar que ninguna funcionalidad se omita:

```
[FASE 1] Arquitectura base, Tipos de Dominio y Estado Local
   |
   v
[FASE 2] Motor de Logica y Calculos Logisticos (Logistics Engine)
   |
   v
[FASE 3] Encabezado Global, Navegacion y Control de Acceso (RNF-01)
   |
   v
[FASE 4] Modulo de Pedidos, Lineas y Caracteristicas de Carga (UC-01, UC-02)
   |
   v
[FASE 5] Modulo de Flota, Compatibilidad y Reserva de Transporte (UC-03, UC-04)
   |
   v
[FASE 6] Modulo de Planificacion y Reordenamiento de Rutas (UC-05)
   |
   v
[FASE 7] Modulo de Ejecucion, Seguimiento y Trazabilidad (UC-06)
   |
   v
[FASE 8] Modulo de Seguridad, Integridad y Respaldos (RNF-03, RNF-05, RNF-06)
   |
   v
[FASE 9] Auditoria Final contra Casos de Uso y Caminos Alternativos
```

### Fase 1: Arquitectura Base y Tipos de Datos de Dominio
- Crear el archivo de definicion de tipos (`types/domain.ts`) transcribiendo rigurosamente los atributos y firmas tipificadas de las clases FO-DCL y FO-DER.
- Configurar el almacenamiento reactivo global (contexto o estado central) con datos maestros iniciales de prueba (pedidos con lineas validas e invalidas, flota de vehiculos, usuarios por rol).

### Fase 2: Motor de Logica y Calculos Logisticos
- Crear modulo de utilidad con las funciones matematicas:
  - Calculo de peso volumetrico y cubicaje acumulado.
  - Verificacion de datos maestros faltantes.
  - Evaluacion de limites de politica empresarial (8,500 kg y 38 m³).
  - Algoritmo de particion automatica de pedidos excedidos.
  - Filtro multidimensional de compatibilidad vehicular (peso, volumen, alto, ancho y largo).
  - Verificador de zonas de cobertura autorizadas.

### Fase 3: Encabezado Global y Control de Acceso por Roles
- Construir la barra superior con el selector de perfiles (Despachos, Transporte, Administrador), el conmutador de estado WMS/BD y los contadores estadisticos.
- Aplicar restricciones de visibilidad y bloqueo de botones segun el rol autenticado.

### Fase 4: Modulo de Pedidos y Lineas de Carga (UC-01, UC-02)
- Implementar la tabla de pedidos con buscador y filtros por estado.
- Programar el estado vacio para busquedas sin resultados (UC-01 Alt 1).
- Programar el estado de bloqueo por falla de base de datos WMS (UC-01 Alt 2).
- Construir el panel lateral de detalle de lineas de pedido con calculos de carga.
- Desarrollar el modal para completar datos maestros cuando falte peso o dimensiones (UC-02 Alt 1).
- Implementar la accion de division automatica de pedidos cuando se excedan los limites maximos (UC-02 Alt 2).

### Fase 5: Modulo de Flota y Asignaciones (UC-03, UC-04)
- Construir el panel de seleccion vehicular con filtro inteligente de capacidad.
- Desarrollar la sugerencia automatica de fechas alternativas ante falta de flota (UC-03 Alt 1).
- Desarrollar el mensaje de advertencia y recomendacion cuando la carga supere toda la flota (UC-03 Alt 2).
- Crear el modal de confirmacion de reserva.
- Programar la simulacion de error de concurrencia vehicular (UC-04 Alt 1).
- Programar la cancelacion de reserva con retorno a disponibilidad (UC-04 Alt 2).

### Fase 6: Modulo de Planificacion de Rutas (UC-05)
- Construir la tabla secuencial de paradas con identificacion de zonas de entrega.
- Implementar la advertencia y ajuste manual para destinos fuera de cobertura (UC-05 Alt 1).
- Implementar el modo de ajuste manual que habilite botones para subir/bajar paradas y editar distancias/tiempos (UC-05 Alt 2).
- Programar la consolidacion de la hoja de ruta y transicion a despacho.

### Fase 7: Modulo de Ejecucion y Trazabilidad (UC-06)
- Construir la consola de despacho con barra de porcentaje de avance.
- Programar el conmutador de perdida de enlace GPS con despliegue de ultima ubicacion conocida (UC-06 Alt 1).
- Desarrollar el modal de reporte de novedades con opciones de devolucion o reprogramacion (UC-06 Alt 2).
- Desarrollar el formulario de confirmacion de entrega completada y liberacion automatica del vehiculo.
- Renderizar la linea de tiempo cronologica con el historial de eventos de trazabilidad.

### Fase 8: Administracion, Integridad y Respaldos
- Construir la vista de gestion de usuarios y asignacion de perfiles.
- Desarrollar el panel de diagnostico de integridad relacional de datos (RNF-05).
- Desarrollar el centro de copias de seguridad: creacion de snapshots, descarga de JSON, carga de archivos y restauracion (RNF-06).

### Fase 9: Auditoria y Cierre
- Ejecutar el checklist completo de verificacion funcional validando cada caso de uso basico y alternativo del PPI-3.

---

## 7. CRITERIOS DE ACEPTACION Y MATRIZ DE VERIFICACION FUNCIONAL

El frontend sera considerado completo y satisfactorio unicamente si cumple la totalidad de los siguientes criterios:

| Codigo | Requisito / Caso de Uso | Criterio de Aceptacion Funcional |
| :--- | :--- | :--- |
| **CA-01** | **RF-01 / UC-01** | La tabla lista los pedidos pendientes, permite filtrar por estado y abrir el desglose de productos. |
| **CA-02** | **UC-01 Alt 1** | Se muestra una vista de estado vacio clara cuando no hay registros pendientes para despachar. |
| **CA-03** | **UC-01 Alt 2** | Al activar el conmutador de desconexion WMS, el sistema notifica el error de base de datos y ofrece un boton de reintento. |
| **CA-04** | **RF-02 / UC-02** | El sistema calcula de forma automatica y precisa el peso total en kg, volumen en $m^3$ y dimensiones maximas a partir de las lineas de producto. |
| **CA-05** | **UC-02 Alt 1** | Si a un producto le falta peso o dimension, se marca como "Requiere Datos Maestros", se emite advertencia y se habilita un modal para ingresar los datos faltantes en linea. |
| **CA-06** | **UC-02 Alt 2** | Si la carga supera 8,500 kg o 38 m³, el sistema alerta sobre el exceso y habilita un boton para dividir el pedido de forma automatica en dos sub-despachos. |
| **CA-07** | **RF-03 / UC-03** | La vista de vehiculos filtra los candidatos aptos evaluando peso, volumen, alto, ancho y largo interior de la carroceria. |
| **CA-08** | **UC-03 Alt 1** | Si no hay vehiculos disponibles para la fecha, el sistema propone fechas alternativas de despacho seleccionables. |
| **CA-09** | **UC-03 Alt 2** | Si ningun vehiculo cubre la capacidad de la carga, la interfaz advierte y sugiere fraccionar o usar multiples unidades. |
| **CA-10** | **RF-04 / UC-04** | La confirmacion de asignacion actualiza el vehiculo a "Reservado" y el pedido a "Asignado", creando la entidad Asignacion. |
| **CA-11** | **UC-04 Alt 1** | Si se simula concurrencia, el sistema notifica que el vehiculo fue tomado por otro usuario y refresca la disponibilidad. |
| **CA-12** | **UC-04 Alt 2** | Si se cancela la reserva en la ventana de confirmacion, los cambios se descartan y el vehiculo permanece disponible. |
| **CA-13** | **RF-05 / UC-05** | Se genera la hoja de ruta consolidada con paradas, ventanas horarias, kilometraje y tiempo estimado de viaje. |
| **CA-14** | **UC-05 Alt 1** | Si un destino no pertenece a las zonas autorizadas, se emite una advertencia de cobertura y se permite el ajuste manual. |
| **CA-15** | **UC-05 Alt 2** | Ante falla de calculo o activacion del modo manual, el usuario puede reordenar las paradas interactivamente con controles de movimiento. |
| **CA-16** | **RF-06 / UC-06** | La consola despliega el avance del despacho en ejecucion, mostrando barra de progreso y ultima ubicacion. |
| **CA-17** | **UC-06 Alt 1** | Al desconectar el enlace GPS, se emite alerta de desconexion y se congela la visualizacion en la ultima ubicacion conocida. |
| **CA-18** | **UC-06 Alt 2** | El transportista puede reportar novedad con motivo y justificacion, pasando el despacho a "Devolucion" o "Reprogramado". |
| **CA-19** | **UC-06 Exito** | Al confirmar la entrega exitosa, el despacho y pedido se marcan como "Completado" y el vehiculo se libera a "Disponible". |
| **CA-20** | **RNF-01** | El selector de usuarios en la barra superior restringe las acciones y vistas segun el perfil (Despachos, Transporte, Admin). |
| **CA-21** | **RNF-05** | El modulo de administracion cuenta con una funcion de diagnostico que comprueba la consistencia e integridad entre entidades. |
| **CA-22** | **RNF-06** | El sistema permite crear copias de respaldo inmediatas (snapshots), descargarlas en formato JSON y restaurarlas integralmente. |
| **CA-23** | **Diseno Funcional** | En todo el desarrollo se omiten especificaciones de colores, garantizando que la interfaz se guie estrictamente por estructura, componentes, estados y flujos operativos. |
