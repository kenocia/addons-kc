# Análisis de Rediseño — Integración SAP Business One → Shopify (KenoShopy)
## Estructura Producto Padre / Variante

**Cliente:** Van Heusen de C.A.
**Proyecto:** KenoShopy — Integración SAP B1 ↔ Shopify
**Fecha:** Junio 2026
**Preparado por:** Lumo by Kenocia

---

## 1. Contexto y motivo del rediseño

El desarrollo de KenoShopy ha evolucionado en tres etapas, cada una ampliando el alcance sin que la anterior contemplara la siguiente:

1. **Etapa 1 — Sincronización básica:** envío de información de productos desde SAP B1 hacia Shopify (catálogo, precio, stock), sin considerar imágenes ni estructura de variantes.
2. **Etapa 2 — Imágenes:** incorporación de imágenes de producto obtenidas desde Amazon S3, asociadas por SKU.
3. **Etapa 3 — Estructura padre/variante (actual):** identificación de que el modelo de datos de Shopify exige una jerarquía **producto padre → variantes**, mientras que SAP B1 no tiene ese concepto como entidad — cada combinación Modelo-Color-Talla es simplemente un `ItemCode` plano en `OITM`.

El resultado de no haber considerado la jerarquía padre/variante desde el inicio es visible en datos reales de producción: en el listado de Shopify (cliente Van Heusen), variantes que deberían agruparse bajo un mismo producto (ej. un blazer en distintas tallas) aparecen como **productos independientes**, cada uno con su propio estado Active y sin agregación de inventario. Esto provoca que productos con una talla específica en 0 unidades permanezcan visibles y comprables en la tienda, cuando deberían reflejar disponibilidad agregada o desactivarse a nivel de variante.

Este documento define la estructura correcta y el alcance del rediseño necesario para corregirlo.

---

## 2. Alcance de este análisis

**Incluido:**
- Estructura de datos producto padre / variante entre SAP B1 y Shopify.
- Campos de SAP B1 (UDF existentes y nuevos) requeridos para sostener esa estructura.
- Reglas de agrupación, creación y actualización de productos y variantes.
- Tratamiento del SKU y eliminación de sufijos no controlados.
- Manejo de imágenes (S3) y categorías a nivel de producto padre.
- Lógica de control de duplicados en procesamiento por lotes.

**Explícitamente fuera de alcance (fase futura):**
- Flujo Shopify → SAP B1 para creación de Órdenes de Venta (OV) a partir de ventas en Shopify. Se menciona como siguiente fase porque las variantes definidas aquí son las que eventualmente alimentarán ese flujo, pero su diseño detallado no se cubre en este documento.

---

## 3. Modelo de datos: estado actual en SAP B1

SAP B1 no tiene un concepto nativo de "producto padre". La tabla `OITM` almacena un registro por cada combinación única de Modelo-Color-Talla, identificado por `ItemCode`.

### 3.1 Campos relevantes identificados

| Campo | Tabla | Rol actual |
|---|---|---|
| `ItemCode` | OITM | Identificador único de la variante. Formato: `MODELO-COLOR-TALLA` (ej. `BF5CACC06-730-XLG`). Controla precio y stock. **No debe llevar sufijo adicional.** |
| `ItemName` | OITM | Descripción del artículo a nivel SAP (no necesariamente igual al título deseado en Shopify). |
| `U_ARGNS_MOD` | OITM (UDF) | Modelo. Parte de la clave de agrupación del producto padre. |
| `U_ARGNS_COL` | OITM (UDF) | Color. Parte de la clave de agrupación del producto padre — **confirmado que el mismo modelo puede variar de descripción/imagen según color**, por lo que el color es indispensable en la clave, no solo el modelo. |
| `U_argns_size` | OITM (UDF) | Talla. Variable de opción dentro del producto padre (no agrupa, diferencia). |
| `U_ShopifyStatus` | OITM (UDF) | Bandera de control de sincronización por variante (ej. `S` = sincronizado/pendiente; valor a confirmar formalmente). |
| `U_Traductor` | OITM (UDF) | Mapeo de categoría hacia la taxonomía de categorías de Shopify. |
| *(UDF Shopify Product ID — ya existe)* | OITM (UDF) | Almacena el ID del producto padre creado en Shopify. Se repite en cada variante (`ItemCode`) que pertenece al mismo grupo Modelo+Color. |
| Stock por almacén | OITW | Cantidad disponible por `ItemCode` en almacén `A01` (almacén relevante para Shopify). |
| Precio de venta | ITM1 (o tabla de listas de precio) | Precio según **Lista de Precios 02** (lista de tienda), por `ItemCode`. |

### 3.2 Campo nuevo requerido

| Campo propuesto | Tabla | Rol |
|---|---|---|
| **Descripción Padre** *(nombre definitivo pendiente)* | OITM (UDF nuevo) | Texto que se repetirá de forma idéntica en todos los `ItemCode` que comparten Modelo+Color. Será el `Title`/`Description` del producto padre en Shopify. Necesario porque `ItemName` no está garantizado como apto para mostrar al cliente final ni necesariamente es idéntico entre variantes hermanas. |

> **Pendiente de definición:** nombre técnico del UDF y si su mantenimiento será manual (capturado por el usuario de SAP al crear el primer ítem del grupo) o derivado automáticamente desde `ItemName` con limpieza de sufijos de talla/color.

---

## 4. Modelo de datos objetivo: estructura en Shopify

```
PRODUCTO PADRE (no existe como entidad en SAP; se construye en el addon)
  Clave de agrupación: U_ARGNS_MOD + U_ARGNS_COL
  ├─ Title / Description   ← UDF "Descripción Padre" (nuevo)
  ├─ Category               ← U_Traductor
  ├─ Media (imágenes)       ← Amazon S3, asociadas al grupo Modelo+Color
  ├─ Option 1: Talla        ← derivado de U_argns_size de cada variante del grupo
  └─ Variantes:
       SKU            = ItemCode completo (ej. BF5CACC06-730-XLG) — SIN sufijo
       Price           = Lista de Precios 02
       Inventory (A01) = Stock real por ItemCode
       Option value     = U_argns_size
```

### 4.1 Principio rector

> **El SKU en Shopify debe ser idéntico, carácter por carácter, al `ItemCode` de SAP.** No se permite que Shopify autogenere variaciones del SKU (`-1`, `-2`, `-3`), ni que el addon agregue sufijos propios. El cruce entre ambos sistemas para cualquier operación futura (actualización de precio, stock, o creación de OV) debe poder resolverse con una igualdad directa `SKU = ItemCode`, sin tablas de traducción adicionales a nivel de variante.

Esto es una decisión de arquitectura deliberada: mantener el `Shopify Product ID` como única tabla de traducción necesaria (a nivel de producto padre), evitando una segunda capa de indirección a nivel de variante que incrementaría el riesgo de desincronización.

---

## 5. Reglas de negocio a implementar

### 5.1 Clave de agrupación del producto padre

```
clave_padre = U_ARGNS_MOD + U_ARGNS_COL
```

Confirmado que el Modelo por sí solo es insuficiente, dado que el mismo modelo puede tener descripción e imágenes distintas según el color.

### 5.2 Creación vs. actualización de producto padre

Para cada `ItemCode` pendiente de sincronizar:

1. Calcular `clave_padre`.
2. Verificar si **alguna** fila de `OITM` con esa misma `clave_padre` ya tiene el UDF de `Shopify Product ID` poblado.
   - **Si existe:** no crear producto nuevo. Usar ese Product ID y agregar/actualizar únicamente la variante correspondiente a este `ItemCode`.
   - **Si no existe:** crear el producto padre en Shopify (con Title/Descripción Padre, Category vía `U_Traductor`, Media desde S3) junto con la primera variante. Tomar el Product ID resultante y propagarlo al UDF de **todas** las filas de `OITM` que comparten esa `clave_padre`, no solo la que disparó la creación.

### 5.3 Control de concurrencia en procesamiento por lotes

**Riesgo identificado:** si dos o más `ItemCode` del mismo `clave_padre` llegan en el mismo lote de sincronización y aún no se ha confirmado/guardado el `Shopify Product ID` de ninguno, una verificación variante-por-variante contra SAP en tiempo real puede no detectar la relación entre ellos, resultando en productos padre duplicados en Shopify para el mismo Modelo+Color.

**Regla de mitigación:** el procesamiento de cada lote debe **agrupar primero en memoria** (por `clave_padre`) la totalidad de `ItemCode` pendientes, y solo después de tener el lote completamente agrupado, decidir por cada grupo si corresponde crear producto nuevo o agregar variantes a uno existente. Esto garantiza que ninguna variante hermana dentro del mismo lote quede "invisible" para las demás durante el procesamiento.

### 5.4 Tratamiento del stock y estado Active/Draft

> **Pendiente de definición formal** (mencionado para seguimiento, no resuelto en este documento): una vez que la estructura padre/variante esté correctamente implementada, la regla de "stock en 0" deja de evaluarse a nivel de producto y debe evaluarse a nivel de **variante individual**, considerando además si la condición de desactivación debe aplicar:
> - por variante (ocultar solo la talla sin stock, dejando visibles las demás), o
> - por producto completo (solo si **todas** las variantes del grupo están en 0).
>
> Se recomienda definir esta regla en una iteración posterior, una vez validada la corrección de la estructura padre/variante en un entorno de prueba.

---

## 6. Arquitectura de procesos del addon

El addon se organiza en **tres procesos diferenciados**, cada uno con su propia clave de búsqueda y su propio dato de salida. Mantenerlos separados (en lugar de un único proceso monolítico por `ItemCode`) es lo que permite resolver correctamente tanto la jerarquía padre/variante como la eficiencia de las consultas a S3.

### Proceso 1 — Envío de padre + hijos a Shopify (creación/actualización de estructura)

Crea o actualiza el producto padre en Shopify junto con sus variantes (hijos), conforme a las reglas de agrupación y anti-duplicados ya definidas en las secciones 5.2 y 5.3. Dentro de este proceso, el **stock que se controla por hijo no es el stock físico bruto de `OITW`**, sino el **disponible real**:

```
Disponible (por ItemCode) = Stock físico (OITW, almacén A01) − Reservado (comprometido en SAP)
```

Este disponible es el valor que se envía como inventario de la variante en Shopify. Enviar el stock físico bruto sin descontar lo reservado expondría en la tienda unidades que ya están comprometidas internamente (por ejemplo, en órdenes de venta o reservas), generando sobreventa.

> **Pendiente de confirmar formalmente:** la tabla/campo exacto de SAP B1 de donde se obtiene el "reservado" (candidato típico: `OITW.OnOrder`/`IsCommited`, o una vista de compromisos según la configuración del cliente). Debe validarse contra el ambiente real de Van Heusen antes de implementar el cálculo.

### Proceso 2 — Obtención de SKU (hijos) con precio y stock

Proceso de lectura que recorre los `ItemCode` (hijos) en SAP y obtiene, para cada uno, su precio (Lista de Precios 02) y su stock disponible (ver cálculo del Proceso 1). Este proceso alimenta tanto la creación/actualización de variantes del Proceso 1 como las actualizaciones periódicas de precio/stock sobre variantes ya existentes en Shopify (sin necesidad de tocar el producto padre).

### Proceso 3 — Obtención de imágenes desde Amazon S3 (a nivel de producto padre)

**Estado actual (incorrecto):** el addon busca la imagen en S3 usando el **SKU completo del hijo** (`ItemCode`, ej. `BF5CACC06-730-XLG`), repitiendo la búsqueda/descarga de la misma imagen una vez por cada talla de un mismo modelo-color.

**Estado objetivo:** la búsqueda en S3 debe realizarse usando únicamente el **código padre** (`U_ARGNS_MOD + U_ARGNS_COL`, ej. `BF5CACC06-730`), dado que la imagen es la misma para todas las variantes (tallas) de ese modelo-color. Esto:
- Elimina búsquedas/descargas redundantes a S3 (una sola consulta por grupo, no una por variante).
- Alinea el proceso de imágenes con la misma clave de agrupación usada para el producto padre (sección 5.1), evitando que un cambio futuro en la convención de nombres de archivo en S3 deba mantenerse sincronizado en dos lugares distintos del addon.

> **Pendiente de confirmar:** convención exacta de nomenclatura de archivos en el bucket S3 para validar que el prefijo `MODELO-COLOR` sea suficiente y único (es decir, que no haya colisión de nombres de archivo entre modelos distintos que compartan ese prefijo parcial).

### 6.1 Relación entre los tres procesos

```
Proceso 2 (SKU, precio, stock)  ──┐
                                    ├──→ Proceso 1 (crear/actualizar padre + variantes en Shopify)
Proceso 3 (imágenes por padre)  ──┘
```

Los procesos 2 y 3 actúan como proveedores de datos hacia el Proceso 1, pero con claves de búsqueda distintas: el Proceso 2 trabaja a nivel de variante (`ItemCode`), mientras que el Proceso 3 trabaja a nivel de grupo (`U_ARGNS_MOD + U_ARGNS_COL`). Esta diferencia de granularidad es intencional y debe preservarse — es precisamente la inversión de esta lógica (buscar imágenes por hijo en vez de por padre) lo que se identifica como el defecto actual a corregir.

---

## 7. Pseudocódigo de referencia (para diseño, no implementación inmediata)

```
PASO 1 — Extracción del lote pendiente (una sola consulta)
  SELECT ItemCode, U_ARGNS_MOD, U_ARGNS_COL, U_argns_size,
         U_ShopifyStatus, U_Traductor, [UDF Shopify Product ID],
         [UDF Descripción Padre]
  FROM OITM
  WHERE U_ShopifyStatus = <criterio de pendiente>
  -- complementado con cruce a OITW (stock A01) e ITM1 (lista de precios 02)

PASO 2 — Agrupación en memoria
  Para cada fila del lote:
      clave = (U_ARGNS_MOD, U_ARGNS_COL)
      agregar fila a grupos[clave].variantes
      si fila tiene Shopify Product ID:
          grupos[clave].product_id_existente = ese valor

PASO 3 — Resolución por grupo
  Para cada grupo:
      si product_id_existente:
          usar ese Product ID
          por cada variante del grupo → crear/actualizar variante (SKU = ItemCode exacto)
      si no:
          crear producto padre con la primera variante
          tomar el Product ID resultante
          por cada variante restante → agregar como variante adicional
      actualizar el UDF de Shopify Product ID en SAP para TODAS las variantes del grupo
```

---

## 8. Puntos pendientes de decisión

| # | Punto pendiente | Responsable de definir |
|---|---|---|
| 1 | Nombre técnico definitivo del UDF "Descripción Padre" y si su captura es manual o derivada | Jorge / equipo Kenocia |
| 2 | Confirmar significado completo de los valores posibles de `U_ShopifyStatus` (no solo `S`) | Jorge / validación contra datos reales |
| 3 | Regla definitiva de Active/Draft/Archived ante stock 0, a nivel de variante vs. producto completo | Jorge / negocio Van Heusen |
| 4 | Verificación de causa raíz de los sufijos `-1/-2/-3` detectados en producción (probable: SKU no enviado o duplicado en payload de creación de variantes) | Equipo de desarrollo (Cezar/Luis/Gilberto), revisión de código actual |
| 5 | Campo/tabla exacto de SAP B1 de donde se obtiene el "Reservado" para el cálculo de disponible (Proceso 1) | Jorge / validación contra ambiente SAP de Van Heusen |
| 6 | Convención de nomenclatura de archivos en el bucket S3, para confirmar que el prefijo Modelo+Color es suficiente y único | Jorge / equipo de desarrollo |
| 7 | Diseño del flujo Shopify → SAP (creación de OV a partir de ventas) | Fase futura, fuera de este alcance |

---

## 9. Conclusión

El problema raíz detectado no es de sincronización de datos, sino de **modelo de datos y de granularidad de procesos**: el desarrollo se inició sin establecer la jerarquía producto padre/variante que Shopify requiere, tratando cada `ItemCode` de SAP como una unidad aislada en los tres procesos del addon — incluyendo el Proceso 3, donde la búsqueda de imágenes en S3 se ejecuta hoy por cada variante (hijo) cuando debería ejecutarse una sola vez por grupo (padre).

La corrección no consiste en ajustes puntuales sobre el código existente, sino en:
1. Redefinir la clave de agrupación (`U_ARGNS_MOD` + `U_ARGNS_COL`) e introducir el campo de Descripción Padre.
2. Reconstruir la lógica de creación/actualización (Proceso 1) para que opere primero a nivel de grupo (producto padre) y después a nivel de variante (`ItemCode` = SKU exacto, sin sufijos), incorporando el cálculo de disponible (stock físico menos reservado).
3. Corregir el Proceso 3 para que la búsqueda de imágenes use el código padre, no el SKU completo del hijo.

Esta corrección debe hacerse antes de seguir ampliando funcionalidad (incluyendo la fase de OV), dado que cualquier desarrollo posterior dependerá de que el cruce `SKU ↔ ItemCode` sea exacto y confiable, y de que los tres procesos compartan una única clave de agrupación consistente.
