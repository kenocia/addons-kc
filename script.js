// ============================================================
// KENO-SHOPY — datos y comportamiento interactivo
// ============================================================

// ------------------------------------------------------------
// Árbol — Alcance vigente: padre = Modelo + Color, hijos = Tallas
// ------------------------------------------------------------
const TREE_VIGENTE = {
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
      ["Imágenes", "Amazon S3 · búsqueda por Modelo + Color"],
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

// ------------------------------------------------------------
// Árbol — Alcance ampliado: padre = Modelo, hijos = Color (con
// sus propias tallas anidadas como variantes finales)
// ------------------------------------------------------------
const TREE_AMPLIADO = {
  id: "root",
  type: "padre",
  label: "BF5CACC06",
  title: "Producto padre",
  detail: {
    sub: "Clave de agrupación: U_ARGNS_MOD (solo Modelo)",
    rows: [
      ["Modelo (U_ARGNS_MOD)", "BF5CACC06"],
      ["Título en Shopify", "UDF · Descripción Padre (nuevo)"],
      ["Categoría", "U_Traductor"],
      ["Imágenes", "Amazon S3 · búsqueda única por Modelo"],
      ["Opciones de variante", "Color y Talla"],
      ["Requiere", "Lookup en vivo contra UDT de colores en SAP (ej. 730 → Navy)"],
      ["Si el código no tiene traducción", "La variante se sincroniza sin Color como opción — queda solo con Talla"],
      ["Shopify Product ID", "UDF en OITM · replicado a todas las variantes de todos los colores"],
    ],
  },
  children: [
    {
      id: "c1",
      type: "color",
      label: "Color 730 · Navy",
      title: "Color · Navy (730)",
      detail: {
        sub: "El color pasa a ser una opción de variante, no parte del padre",
        rows: [
          ["Código SAP (U_ARGNS_COL)", "730"],
          ["Nombre comercial", "Navy"],
          ["Fuente del nombre", "UDT de colores en SAP · lookup en vivo (Proceso 2)"],
          ["Tallas bajo este color", "S, M, L"],
        ],
      },
      children: [
        {
          id: "v1",
          type: "hijo",
          label: "BF5CACC06-730-S",
          title: "Variante · Navy / Talla S",
          detail: {
            sub: "SKU = ItemCode exacto, sin sufijo",
            rows: [
              ["ItemCode (SAP)", "BF5CACC06-730-S"],
              ["Color", "Navy (730)"],
              ["Talla (U_argns_size)", "S"],
              ["Precio (Lista 02)", "L 716.00"],
              ["Disponible enviado a Shopify", "2"],
            ],
          },
        },
        {
          id: "v2",
          type: "hijo",
          label: "BF5CACC06-730-M",
          title: "Variante · Navy / Talla M",
          detail: {
            sub: "SKU = ItemCode exacto, sin sufijo",
            rows: [
              ["ItemCode (SAP)", "BF5CACC06-730-M"],
              ["Color", "Navy (730)"],
              ["Talla (U_argns_size)", "M"],
              ["Precio (Lista 02)", "L 716.00"],
              ["Disponible enviado a Shopify", "2"],
            ],
          },
        },
      ],
    },
    {
      id: "c2",
      type: "color",
      label: "Color 001 · Blanco",
      title: "Color · Blanco (001)",
      detail: {
        sub: "El color pasa a ser una opción de variante, no parte del padre",
        rows: [
          ["Código SAP (U_ARGNS_COL)", "001"],
          ["Nombre comercial", "Blanco"],
          ["Fuente del nombre", "UDT de colores en SAP · lookup en vivo (Proceso 2)"],
          ["Tallas bajo este color", "S, M"],
        ],
      },
      children: [
        {
          id: "v3",
          type: "hijo",
          label: "BF5CACC06-001-S",
          title: "Variante · Blanco / Talla S",
          detail: {
            sub: "SKU = ItemCode exacto, sin sufijo",
            rows: [
              ["ItemCode (SAP)", "BF5CACC06-001-S"],
              ["Color", "Blanco (001)"],
              ["Talla (U_argns_size)", "S"],
              ["Precio (Lista 02)", "L 716.00"],
              ["Disponible enviado a Shopify", "1"],
            ],
          },
        },
        {
          id: "v4",
          type: "hijo",
          label: "BF5CACC06-001-M",
          title: "Variante · Blanco / Talla M",
          detail: {
            sub: "SKU = ItemCode exacto, sin sufijo",
            rows: [
              ["ItemCode (SAP)", "BF5CACC06-001-M"],
              ["Color", "Blanco (001)"],
              ["Talla (U_argns_size)", "M"],
              ["Precio (Lista 02)", "L 716.00"],
              ["Disponible enviado a Shopify", "0 → revisar regla Draft/Archived"],
            ],
          },
        },
      ],
    },
  ],
};

// ------------------------------------------------------------
// Gantt — plan de trabajo según el alcance elegido
// ------------------------------------------------------------
const GANTT = {
  vigente: {
    title: "Color dentro del padre — 5 días hábiles",
    totalDays: 5,
    tracks: [
      {
        label: "SAP Business One",
        tasks: [
          { name: "UDF Descripción Padre + validar U_ShopifyStatus", start: 1, duration: 1 },
        ],
      },
      {
        label: "Shopify / Addon",
        tasks: [
          { name: "Agrupación en memoria por Modelo + Color", start: 1, duration: 2 },
          { name: "Proceso 1 · creación/actualización padre + variantes", start: 2, duration: 2 },
          { name: "Proceso 3 · imágenes S3 por Modelo + Color", start: 3, duration: 2 },
          { name: "Pruebas de extremo a extremo", start: 4, duration: 1 },
        ],
      },
    ],
  },
  ampliado: {
    title: "Color como variante real — 11 días hábiles (~2 semanas)",
    totalDays: 11,
    tracks: [
      {
        label: "SAP Business One",
        tasks: [
          { name: "UDF Descripción Padre", start: 1, duration: 2 },
          { name: "Validar y exponer UDT de colores existente para el addon", start: 1, duration: 1 },
        ],
      },
      {
        label: "Shopify / Addon",
        tasks: [
          { name: "Rediseño de agrupación: clave pasa a ser solo Modelo", start: 1, duration: 3 },
          { name: "Proceso 2 · integrar lookup en vivo contra UDT de colores", start: 2, duration: 2 },
          { name: "Proceso 1 · padre con 2 niveles de variante (Color + Talla)", start: 3, duration: 3 },
          { name: "Proceso 3 · imágenes S3 por Modelo únicamente", start: 5, duration: 2 },
          { name: "Migración de productos ya creados bajo el esquema anterior", start: 7, duration: 2 },
          { name: "Pruebas de extremo a extremo", start: 9, duration: 3 },
        ],
      },
    ],
  },
};

function renderGantt(scope) {
  const mount = document.getElementById("gantt");
  const titleEl = document.getElementById("gantt-title");
  if (!mount) return;

  const plan = GANTT[scope] || GANTT.vigente;
  if (titleEl) titleEl.textContent = plan.title;

  const scaleSpans = Array.from({ length: plan.totalDays }, (_, i) => `<span>D${i + 1}</span>`).join("");

  const tracksHtml = plan.tracks
    .map((track) => {
      const rows = track.tasks
        .map((task) => {
          const leftPct = ((task.start - 1) / plan.totalDays) * 100;
          const widthPct = (task.duration / plan.totalDays) * 100;
          return `
            <div class="gantt-row">
              <span class="gantt-row-label">${task.name}</span>
              <div class="gantt-bar-track">
                <div class="gantt-bar" style="left:${leftPct}%; width:${widthPct}%;">
                  ${task.duration}&nbsp;día${task.duration > 1 ? "s" : ""}
                </div>
              </div>
            </div>
          `;
        })
        .join("");
      return `
        <div class="gantt-track-group">
          <div class="gantt-track-label">${track.label}</div>
          ${rows}
        </div>
      `;
    })
    .join("");

  mount.innerHTML = `
    <div class="gantt-scale" style="grid-template-columns: repeat(${plan.totalDays}, 1fr);">${scaleSpans}</div>
    ${tracksHtml}
    <div class="gantt-legend">
      <div class="gantt-legend-item"><span class="gantt-legend-dot"></span> Duración estimada en días hábiles</div>
    </div>
  `;
}

const PENDING_GROUPS = [
  {
    key: "comunes",
    label: "Comunes a ambas opciones",
    hint: "No dependen de la decisión sobre el color — aplican sin importar qué tarjeta se elija arriba.",
    items: [
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
        title: "Campo exacto de SAP B1 para el cálculo de disponible.",
        owner: "Jorge Urbina",
        resolved: true,
        context: "El stock que se envía a Shopify debe ser el disponible real, no el stock físico bruto. Se confirmó contra SAP B1 el campo exacto y la fórmula: Disponible = OITW.OnHand − OITW.IsCommited, filtrado por WhsCode = 'A01'.",
        risk: "Resuelto — ya no hay riesgo de sobreventa por usar stock físico bruto, siempre que el Proceso 1 aplique esta fórmula exacta sobre OITW.",
        decision: "Sin pendiente. La fórmula queda fija: OnHand − IsCommited, sobre el almacén A01.",
      },
    ],
  },
  {
    key: "vigente",
    label: "Solo si el padre lleva el color",
    hint: "Aplican únicamente bajo el Alcance vigente (Modelo + Color agrupando el padre).",
    items: [
      {
        num: "06",
        title: "Convención de nomenclatura de archivos en el bucket S3, para validar que Modelo+Color es suficiente y único.",
        owner: "Gilberto Salguero",
        context: "El Proceso 3 busca la imagen en S3 usando Modelo+Color como prefijo bajo este alcance.",
        risk: "Si la convención real de nombres en el bucket no es estrictamente única bajo ese prefijo, podría existir colisión entre modelos distintos que comparten un prefijo parcial, devolviendo la imagen equivocada.",
        decision: "Confirmar la convención exacta de nombres de archivo en el bucket S3 y validar la unicidad del prefijo Modelo+Color.",
      },
    ],
  },
  {
    key: "ampliado",
    label: "Solo si el color es variante",
    hint: "Aplican únicamente bajo el Alcance ampliado (color como variante real, padre solo por Modelo).",
    items: [
      {
        num: "06",
        title: "Convención de nomenclatura de archivos en el bucket S3, para validar que Modelo (solo) es suficiente y único.",
        owner: "Gilberto Salguero",
        context: "Bajo este alcance, el Proceso 3 busca la imagen en S3 usando únicamente el Modelo como prefijo — un prefijo más corto que bajo el alcance vigente, con mayor probabilidad teórica de colisión entre modelos distintos.",
        risk: "Si dos modelos distintos comparten un prefijo de nombre de archivo bajo solo-Modelo, la búsqueda podría devolver la imagen de un modelo equivocado.",
        decision: "Confirmar la convención exacta de nombres de archivo en el bucket S3 y validar la unicidad del prefijo de solo-Modelo antes de implementar el Proceso 3 bajo este alcance.",
      },
      {
        num: "07",
        title: "Nombre técnico exacto de la UDT de colores en SAP, para documentarlo en el addon.",
        owner: "Jorge Urbina",
        context: "Se confirmó que SAP ya tiene una UDT propia con el código de color y su nombre comercial, y que el código (ej. 730) es global y consistente sin importar el modelo. Falta el nombre técnico exacto de esa tabla para que el addon apunte el lookup correctamente.",
        risk: "Sin el nombre exacto, el desarrollo no puede apuntar el lookup en vivo del Proceso 2 a la tabla correcta.",
        decision: "Confirmar el nombre técnico de la UDT con el equipo/SAP y documentarlo en la especificación del Proceso 2.",
      },
      {
        num: "08",
        title: "Validar con negocio la regla de degradación cuando un código de color no tiene traducción en la UDT.",
        owner: "Jorge Urbina / negocio Van Heusen",
        context: "Se definió que si el addon encuentra un ItemCode cuyo código de color no tiene fila en la UDT, la variante se sincroniza igual pero sin Color como opción visible — queda solo con Talla, en vez de bloquear la sincronización o mostrar el código crudo.",
        risk: "Si negocio no está de acuerdo con que una variante aparezca sin opción de color visible, hay que definir una alternativa (ej. bloquear hasta completar la UDT, o usar un nombre genérico tipo 'Color sin definir').",
        decision: "Confirmar con negocio que omitir el color (dejando solo Talla) es aceptable como comportamiento por defecto ante códigos sin traducción.",
      },
      {
        num: "09",
        title: "Diseño del flujo Shopify → SAP para la creación de Órdenes de Venta a partir de ventas en línea.",
        owner: "Fase futura",
        context: "Toda venta confirmada en Shopify eventualmente debe generar una Orden de Venta en SAP B1, usando como referencia el mismo SKU/ItemCode definido en este análisis.",
        risk: "No hay riesgo inmediato — esta fase depende de que la estructura padre/variante y el principio de SKU exacto queden completamente estables primero.",
        decision: "Queda fuera de alcance de este documento. Se retoma una vez validada la estructura padre/variante en producción.",
      },
    ],
  },
];

// ------------------------------------------------------------
// Render: árbol padre / variante (reacciona al scope activo)
// ------------------------------------------------------------
function renderTree(scope) {
  const mount = document.getElementById("product-tree");
  const detailPanel = document.getElementById("tree-detail");
  if (!mount) return;

  const tree = scope === "ampliado" ? TREE_AMPLIADO : TREE_VIGENTE;
  mount.innerHTML = "";

  const rootRow = document.createElement("div");
  rootRow.className = "tree-root-row";
  rootRow.appendChild(buildNode(tree));
  mount.appendChild(rootRow);

  renderBranch(tree.children, mount);

  function renderBranch(nodes, parentEl) {
    const branch = document.createElement("div");
    branch.className = "tree-branch";
    nodes.forEach((node) => {
      const wrap = document.createElement("div");
      wrap.className = "tree-node-wrap";
      wrap.appendChild(buildNode(node));
      if (node.children && node.children.length) {
        renderBranch(node.children, wrap);
      }
      branch.appendChild(wrap);
    });
    parentEl.appendChild(branch);
  }

  function buildNode(nodeData) {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "tnode";
    el.setAttribute("data-id", nodeData.id);
    const tagLabel = nodeData.type === "padre" ? "Padre" : nodeData.type === "color" ? "Color" : "Hijo";
    el.innerHTML = `<span class="tnode-tag">${tagLabel}</span><span>${nodeData.label}</span>`;
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      selectNode(nodeData, el);
    });
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
  if (firstNode) selectNode(tree, firstNode);
}

// ------------------------------------------------------------
// Render: pendientes (interactivo, agrupado por: comunes + scope activo)
// ------------------------------------------------------------
function renderPending(scope) {
  const grid = document.getElementById("pending-grid");
  const detail = document.getElementById("pending-detail");
  if (!grid || !detail) return;

  detail.hidden = true;
  detail.innerHTML = "";

  const comunes = PENDING_GROUPS.find((g) => g.key === "comunes");
  const scoped = PENDING_GROUPS.find((g) => g.key === (scope === "ampliado" ? "ampliado" : "vigente"));
  const groupsToShow = [comunes, scoped].filter(Boolean);

  // índice plano para poder encontrar el item al hacer clic, evitando
  // colisiones de "num" repetido entre el grupo vigente y el ampliado
  const flatItems = [];

  grid.innerHTML = groupsToShow
    .map((group) => {
      const cardsHtml = group.items
        .map((item) => {
          const key = `${group.key}-${item.num}`;
          flatItems.push({ key, item });
          return `
            <button type="button" class="pending-card ${item.resolved ? "is-resolved" : ""}" data-key="${key}">
              <span class="p-num">${item.num}${item.resolved ? " · Resuelto" : ""}</span>
              <h4>${item.title}</h4>
              <span class="p-owner">${item.owner}</span>
              <span class="p-hint">Toca para ver el detalle ↓</span>
            </button>
          `;
        })
        .join("");
      return `
        <div class="pending-group">
          <div class="pending-group-head">
            <h3>${group.label}</h3>
            <p>${group.hint}</p>
          </div>
          <div class="pending-grid-inner">${cardsHtml}</div>
        </div>
      `;
    })
    .join("");

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
      const found = flatItems.find((f) => f.key === card.dataset.key);
      const item = found ? found.item : null;
      if (!item) return;

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
// Control de alcance: las propias tarjetas de decisión son el control
// ------------------------------------------------------------
function initDecisionCards() {
  const cards = document.querySelectorAll(".decision-card[data-scope-card]");
  if (!cards.length) return;

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const scope = card.dataset.scopeCard;
      setScope(scope);
    });
  });
}

function setScope(scope) {
  document.documentElement.setAttribute("data-scope", scope);
  document.querySelectorAll(".decision-card[data-scope-card]").forEach((c) => {
    c.classList.toggle("is-selected", c.dataset.scopeCard === scope);
  });
  renderTree(scope);
  renderGantt(scope);
  renderPending(scope);
}

// ------------------------------------------------------------
// Init
// ------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  setScope("vigente");
  initDecisionCards();
});
