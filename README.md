# Keno-Shopy — Sitio de análisis (GitHub Pages)

Sitio estático con el análisis interactivo de la integración SAP Business One ↔ Shopify (Keno-Shopy, cliente Van Heusen de C.A.). No requiere build ni dependencias — son 3 archivos planos.

## Archivos

- `index.html` — estructura y contenido del sitio
- `styles.css` — identidad visual (paleta, tipografía, layout)
- `script.js` — datos del árbol producto padre/variante interactivo y la grilla de pendientes

## Publicar en GitHub Pages

1. Crea un repositorio nuevo (o usa uno existente del `kenocia-odoo` org) y sube estos 3 archivos a la raíz, o a una carpeta `/docs`.
2. En GitHub: **Settings → Pages → Source**, selecciona la rama (`main`) y la carpeta (`/root` o `/docs` según dónde subiste los archivos).
3. Guarda. GitHub te da una URL del tipo `https://<usuario-u-org>.github.io/<repo>/` en uno o dos minutos.

## Ver localmente antes de publicar

No necesitas servidor para abrirlo — doble click en `index.html` funciona directamente en cualquier navegador. Si prefieres servirlo localmente:

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

## Actualizar el contenido

- **Texto y secciones:** editar directamente en `index.html`.
- **Colores y tipografía:** los tokens están al inicio de `styles.css` (bloque `:root`), cambiar ahí se propaga a todo el sitio.
- **Árbol padre/variante (interactivo):** editar el objeto `PRODUCT_TREE` en `script.js` — agregar o quitar variantes ahí se refleja automáticamente en el diagrama.
- **Tarjetas de pendientes:** editar el array `PENDING_ITEMS` en `script.js`.
