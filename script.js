// ============================================================
// KENO-SHOPY — datos y comportamiento interactivo
// ============================================================

const PRODUCT_TREE = {
  id: "root",
  type: "padre",
  label: "BF5CACC06 · 730",
  title: "Producto padre",
  detail: {
    sub: "Clave de agrupación: U_ARGNS_MOD + U_ARGNS_COL",
    rows: [
      ["Modelo (U_ARGNS_MOD)", "BF5CACC06"],
      ["Color (U_ARGNS_COL)", "730"],
      ["Título en Shopify", "UDF · Descripción Padre (nuevo)"],
      ["Categoría", "U_Traductor"],
      ["Imágenes", "Amazon S3 · una búsqueda por grupo"],
      ["Shopify Product ID", "UDF en OITM · replicado a todas las variantes"],
    ],
  },
  children: [
    {
      id: "v1",
      type: "hijo",
      label: "BF5CACC06-730-S",
      title: "Variante · Talla S",
      detail: {
        sub: "SKU = ItemCode exacto, sin sufijo",
        rows: [
          ["ItemCode (SAP)", "BF5CACC06-730-S"],
          ["Talla (U_argns_size)", "S"],
          ["Precio (Lista 02)", "L 716.00"],
          ["Stock físico (OITW, A01)", "3"],
          ["Reservado", "1"],
          ["Disponible enviado a Shopify", "2"],
        ],
      },
    },
    {
      id: "v2",
      type: "hijo",
      label: "BF5CACC06-730-M",
      title: "Variante · Talla M",
      detail: {
        sub: "SKU = ItemCode exacto, sin sufijo",
        rows: [
          ["ItemCode (SAP)", "BF5CACC06-730-M"],
          ["Talla (U_argns_size)", "M"],
          ["Precio (Lista 02)", "L 716.00"],
          ["Stock físico (OITW, A01)", "2"],
          ["Reservado", "0"],
          ["Disponible enviado a Shopify", "2"],
        ],
      },
    },
    {
      id: "v3",
      type: "hijo",
      label: "BF5CACC06-730-L",
      title: "Variante · Talla L",
      detail: {
        sub: "SKU = ItemCode exacto, sin sufijo",
        rows: [
          ["ItemCode (SAP)", "BF5CACC06-730-L"],
          ["Talla (U_argns_size)", "L"],
          ["Precio (Lista 02)", "L 716.00"],
          ["Stock físico (OITW, A01)", "2"],
          ["Reservado", "2"],
          ["Disponible enviado a Shopify", "0 → revisar regla Draft/Archived"],
        ],
      },
    },
  ],
};

const PENDING_ITEMS = [
  {
    num: "01",
    title: "Nombre técnico definitivo del UDF “Descripción Padre” y si su captura es manual o derivada.",
    owner: "Jorge Urbina",
    context: "Shopify necesita un Title/Description por producto padre, pero SAP no tiene ningún campo pensado para eso — ItemName describe la variante completa (Modelo+Color+Talla), no el producto comercial. Por eso se definió un UDF nuevo que se repite igual en todas las variantes de un mismo grupo.",
    risk: "Sin un nombre definitivo y una regla de captura clara, cada desarrollador puede interpretar el campo distinto, o el equipo de SAP puede capturarlo de forma inconsistente entre artículos — generando títulos de producto irregulares en la tienda.",
    decision: "Definir el nombre técnico del campo (ej. U_DescPadre) y decidir si se captura manualmente al crear el primer ItemCode del grupo, o se deriva automáticamente limpiando sufijos de ItemName.",
  },
  {
    num: "02",
    title: "Confirmar el significado completo de los valores posibles de U_ShopifyStatus, más allá de “S”.",
    owner: "Jorge Urbina",
    context: "Este campo es la bandera que decide si un ItemCode está pendiente de sincronizar. En los datos revisados solo se observó el valor “S” poblado en una fila, con el resto vacío — no queda claro si vacío significa “pendiente”, “no aplica” o “nunca sincronizado”.",
    risk: "Si el addon asume un significado incorrecto para los valores vacíos o para otros valores que puedan existir, corre el riesgo de saltarse artículos que sí debían sincronizarse, o de reprocesar artículos que ya estaban correctamente enviados.",
    decision: "Levantar el catálogo completo de valores posibles de U_ShopifyStatus contra datos reales de producción y documentar qué acción dispara cada uno.",
  },
  {
    num: "03",
    title: "Regla definitiva de Active / Draft / Archived ante stock 0, a nivel de variante o de producto completo.",
    owner: "Jorge Urbina / negocio Van Heusen",
    context: "Una vez corregida la estructura padre/variante, sigue sin definirse qué debe pasar en Shopify cuando una talla específica llega a 0 unidades disponibles: ocultar solo esa talla, o todo el producto si todas sus tallas están en 0.",
    risk: "Es el síntoma original que motivó esta revisión — sin esta regla, el comportamiento actual seguirá siendo inconsistente sin importar qué tan bien quede resuelta la estructura de datos.",
    decision: "Acordar con negocio si la baja de disponibilidad se maneja por variante (talla individual oculta dentro del mismo producto) o solo cuando el producto completo se agota.",
  },
  {
    num: "04",
    title: "Causa raíz de los sufijos -1/-2/-3 detectados en producción (probable SKU no enviado o duplicado en el payload).",
    owner: "Jefree Gómez",
    context: "Se confirmó que el ItemCode real de SAP no lleva ningún sufijo numérico — ese sufijo lo agrega Shopify automáticamente cuando detecta que el SKU enviado está vacío o duplicado dentro del mismo request de creación de variantes.",
    risk: "Mientras no se corrija, cada variante nueva que se cree seguirá rompiendo el principio de SKU exacto, obligando a corregir manualmente el SKU después de cada creación.",
    decision: "Revisar el bloque de código que construye el payload de creación de variantes y confirmar que el campo sku se está enviando explícitamente y sin duplicados dentro del mismo lote.",
  },
  {
    num: "05",
    title: "Campo o tabla exacto de SAP B1 de donde se obtiene el “Reservado” para el cálculo de disponible.",
    owner: "Jorge Urbina / ambiente SAP Van Heusen",
    context: "El stock que se envía a Shopify debe ser el disponible real (stock físico menos reservado), no el stock físico bruto de OITW. Sin embargo, el campo o vista exacta donde SAP B1 expone ese “reservado” todavía no se ha validado contra el ambiente real de Van Heusen.",
    risk: "Usar el stock físico bruto sin descontar lo reservado expone en la tienda unidades que ya están comprometidas internamente, lo que puede generar sobreventa.",
    decision: "Validar contra el ambiente SAP de Van Heusen cuál es el campo correcto (candidatos típicos: OITW.OnOrder, IsCommited, o una vista de compromisos) antes de implementar el cálculo de disponible.",
  },
  {
    num: "06",
    title: "Convención de nomenclatura de archivos en el bucket S3, para validar que Modelo+Color es suficiente y único.",
    owner: "Gilberto Salguero",
    context: "El Proceso 3 busca la imagen en S3 usando el código padre como prefijo. Si se mantiene el alcance vigente, ese prefijo es Modelo+Color; si se amplía el alcance para tratar el color como variante, el prefijo pasaría a ser solo Modelo.",
    risk: "Si la convención real de nombres en el bucket no es estrictamente única bajo el prefijo elegido, podría existir colisión entre modelos distintos que comparten un prefijo parcial, devolviendo la imagen equivocada.",
    decision: "Confirmar la convención exacta de nombres de archivo en el bucket S3 y validar la unicidad del prefijo, una vez que se resuelva la decisión de alcance sobre el color.",
  },
  {
    num: "07",
    title: "Diseño del flujo Shopify → SAP para la creación de Órdenes de Venta a partir de ventas en línea.",
    owner: "Fase futura",
    context: "Toda venta confirmada en Shopify eventualmente debe generar una Orden de Venta en SAP B1, usando como referencia el mismo SKU/ItemCode definido en este análisis.",
    risk: "No hay riesgo inmediato — esta fase depende de que la estructura padre/variante y el principio de SKU exacto queden completamente estables primero, porque cualquier inconsistencia en el cruce SKU↔ItemCode se propagaría directamente a la creación de pedidos.",
    decision: "Queda fuera de alcance de este documento. Se retoma una vez validada la estructura padre/variante en producción.",
  },
];

// ------------------------------------------------------------
// Render: árbol padre / variante
// ------------------------------------------------------------
function renderTree() {
  const mount = document.getElementById("product-tree");
  const detailPanel = document.getElementById("tree-detail");
  if (!mount) return;

  const rootRow = document.createElement("div");
  rootRow.className = "tree-root-row";
  rootRow.appendChild(buildNode(PRODUCT_TREE));
  mount.appendChild(rootRow);

  const branch = document.createElement("div");
  branch.className = "tree-branch";
  PRODUCT_TREE.children.forEach((child) => {
    branch.appendChild(buildNode(child));
  });
  mount.appendChild(branch);

  function buildNode(nodeData) {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "tnode";
    el.setAttribute("data-id", nodeData.id);
    el.innerHTML = `<span class="tnode-tag">${nodeData.type === "padre" ? "Padre" : "Hijo"}</span><span>${nodeData.label}</span>`;
    el.addEventListener("click", () => selectNode(nodeData, el));
    return el;
  }

  function selectNode(nodeData, el) {
    mount.querySelectorAll(".tnode").forEach((n) => n.classList.remove("is-active"));
    el.classList.add("is-active");

    const rowsHtml = nodeData.detail.rows
      .map(
        ([label, value]) =>
          `<div class="detail-row"><span class="dr-label">${label}</span><span class="dr-value mono">${value}</span></div>`
      )
      .join("");

    detailPanel.innerHTML = `
      <h4>${nodeData.title}</h4>
      <p class="detail-sub">${nodeData.detail.sub}</p>
      ${rowsHtml}
    `;
  }

  // seleccionar el padre por defecto para que el panel no quede vacío
  const firstNode = mount.querySelector(".tnode");
  if (firstNode) selectNode(PRODUCT_TREE, firstNode);
}

// ------------------------------------------------------------
// Render: pendientes (interactivo)
// ------------------------------------------------------------
function renderPending() {
  const grid = document.getElementById("pending-grid");
  const detail = document.getElementById("pending-detail");
  if (!grid || !detail) return;

  grid.innerHTML = PENDING_ITEMS.map(
    (item) => `
      <button type="button" class="pending-card" data-num="${item.num}">
        <span class="p-num">${item.num}</span>
        <h4>${item.title}</h4>
        <span class="p-owner">${item.owner}</span>
        <span class="p-hint">Toca para ver el detalle ↓</span>
      </button>
    `
  ).join("");

  grid.querySelectorAll(".pending-card").forEach((card) => {
    card.addEventListener("click", () => {
      const isAlreadyOpen = card.classList.contains("is-open");
      grid.querySelectorAll(".pending-card").forEach((c) => c.classList.remove("is-open"));

      if (isAlreadyOpen) {
        detail.hidden = true;
        detail.innerHTML = "";
        return;
      }

      card.classList.add("is-open");
      const item = PENDING_ITEMS.find((i) => i.num === card.dataset.num);
      detail.hidden = false;
      detail.innerHTML = `
        <div class="pending-detail-head">
          <div>
            <h4>${item.num} · ${item.title}</h4>
            <span class="p-owner">${item.owner}</span>
          </div>
          <button type="button" class="pending-detail-close" aria-label="Cerrar detalle">×</button>
        </div>
        <div class="pending-detail-section">
          <span class="pending-detail-label">Contexto</span>
          <p>${item.context}</p>
        </div>
        <div class="pending-detail-section">
          <span class="pending-detail-label">Qué pasa si queda sin resolver</span>
          <p>${item.risk}</p>
        </div>
        <div class="pending-detail-section">
          <span class="pending-detail-label">Decisión puntual que falta</span>
          <p>${item.decision}</p>
        </div>
      `;
      detail.querySelector(".pending-detail-close").addEventListener("click", () => {
        card.classList.remove("is-open");
        detail.hidden = true;
        detail.innerHTML = "";
      });
      detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });
}

// ------------------------------------------------------------
// Init
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  renderTree();
  renderPending();
});
