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
    owner: "Jorge / equipo Kenocia",
  },
  {
    num: "02",
    title: "Confirmar el significado completo de los valores posibles de U_ShopifyStatus, más allá de “S”.",
    owner: "Jorge / validación contra datos reales",
  },
  {
    num: "03",
    title: "Regla definitiva de Active / Draft / Archived ante stock 0, a nivel de variante o de producto completo.",
    owner: "Jorge / negocio Van Heusen",
  },
  {
    num: "04",
    title: "Causa raíz de los sufijos -1/-2/-3 detectados en producción (probable SKU no enviado o duplicado en el payload).",
    owner: "Cezar / Luis / Gilberto",
  },
  {
    num: "05",
    title: "Campo o tabla exacto de SAP B1 de donde se obtiene el “Reservado” para el cálculo de disponible.",
    owner: "Jorge / ambiente SAP Van Heusen",
  },
  {
    num: "06",
    title: "Convención de nomenclatura de archivos en el bucket S3, para validar que Modelo+Color es suficiente y único.",
    owner: "Jorge / equipo de desarrollo",
  },
  {
    num: "07",
    title: "Diseño del flujo Shopify → SAP para la creación de Órdenes de Venta a partir de ventas en línea.",
    owner: "Fase futura",
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
// Render: pendientes
// ------------------------------------------------------------
function renderPending() {
  const mount = document.getElementById("pending-grid");
  if (!mount) return;

  mount.innerHTML = PENDING_ITEMS.map(
    (item) => `
      <div class="pending-card">
        <span class="p-num">${item.num}</span>
        <h4>${item.title}</h4>
        <span class="p-owner">${item.owner}</span>
      </div>
    `
  ).join("");
}

// ------------------------------------------------------------
// Init
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  renderTree();
  renderPending();
});
