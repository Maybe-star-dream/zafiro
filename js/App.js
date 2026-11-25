const STORAGE_KEY = "zafiro_carrito_cop_v1";
const ENVIO_ESTANDAR = 12000;
const ENVIO_GRATIS_DESDE = 180000;

const PRODUCTOS = [
  { id: 1, nombre: "Camiseta Oversize Algodón", descripcion: "Tela 100% algodón peinado de caída estructurada.", precio: 68000, imagen: "img/Producto1.jpg" },
  { id: 2, nombre: "Pantalón Chino Recto", descripcion: "Corte clásico cómodo para uso diario o casual.", precio: 115000, imagen: "img/Producto2.jpg" },
  { id: 3, nombre: "Chaqueta Ligera Rompevientos", descripcion: "Ideal para tardes frescas y desplazamientos urbanos.", precio: 145000, imagen: "img/Producto3.jpg" },
  { id: 4, nombre: "Gorra Minimalista Bordada", descripcion: "Ajuste trasero regulable con logo discreto.", precio: 45000, imagen: "img/Producto4.jpg" },
  { id: 5, nombre: "Bolso Tote de Lona", descripcion: "Amplio espacio interior con costuras reforzadas.", precio: 59000, imagen: "img/Producto5.jpg" },
  { id: 6, nombre: "Buzo con Capucha Clásico", descripcion: "Algodón perchado suave y abrigador.", precio: 128000, imagen: "img/Producto6.jpg" },
  { id: 7, nombre: "Cinturón en Cuero Sintético", descripcion: "Hebilla metálica mate con acabado limpio.", precio: 49000, imagen: "img/Producto7.jpg" },
  { id: 8, nombre: "Medias Altas Pack x3", descripcion: "Tejido transpirable con ajuste elástico cómodo.", precio: 32000, imagen: "img/Producto8.jpg" },
  { id: 9, nombre: "Camisa Manga Corta Texturizada", descripcion: "Fresca y versátil para climas cálidos.", precio: 89000, imagen: "img/Producto9.jpg" },
  { id: 10, nombre: "Canguro Cruzado Urbano", descripcion: "Compartimentos prácticos para celular y llaves.", precio: 74000, imagen: "img/Producto10.jpg" }
];

let carrito = cargarCarrito();

const catalogoGrid = document.getElementById("catalogo-grid");
const carritoItemsEl = document.getElementById("carrito-items");
const contadorHeaderEl = document.getElementById("contador-header");
const totalUnidadesEl = document.getElementById("total-unidades");
const subtotalGeneralEl = document.getElementById("subtotal-general");
const costoEnvioEl = document.getElementById("costo-envio");
const totalPagarEl = document.getElementById("total-pagar");
const btnVaciarCarrito = document.getElementById("btn-vaciar-carrito");
const formCheckout = document.getElementById("form-checkout");
const confirmacionCompraEl = document.getElementById("confirmacion-compra");
const alertaSistemaEl = document.getElementById("alerta-sistema");

function formatearCOP(valor) {
  return `$${new Intl.NumberFormat("es-CO").format(valor)} COP`;
}

function guardarCarrito() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
}

function cargarCarrito() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mostrarAlerta(mensaje, tipo = "warn") {
  if (!alertaSistemaEl) return;
  alertaSistemaEl.textContent = mensaje;
  alertaSistemaEl.classList.remove("hidden");
  alertaSistemaEl.style.background = tipo === "success" ? "#ecfdf5" : "#fffbeb";
  alertaSistemaEl.style.borderColor = tipo === "success" ? "#10b981" : "#f59e0b";
  alertaSistemaEl.style.color = tipo === "success" ? "#064e3b" : "#78350f";

  clearTimeout(mostrarAlerta._timer);
  mostrarAlerta._timer = setTimeout(() => {
    alertaSistemaEl.classList.add("hidden");
  }, 3500);
}

function renderCatalogo() {
  if (!catalogoGrid) return;
  catalogoGrid.innerHTML = "";

  for (const prod of PRODUCTOS) {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}" />
      <div class="product-body">
        <h3 class="product-title">${prod.nombre}</h3>
        <p class="product-desc">${prod.descripcion}</p>
        <p class="product-price">${formatearCOP(prod.precio)}</p>
        <button type="button" class="btn btn-primary btn-full" data-add-id="${prod.id}">
          Agregar al carrito
        </button>
      </div>
    `;
    catalogoGrid.appendChild(card);
  }
}

function agregarAlCarrito(productoId) {
  const producto = PRODUCTOS.find((p) => p.id === productoId);
  if (!producto) return;

  const existente = carrito.find((item) => item.productoId === productoId);
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ productoId, cantidad: 1 });
  }

  if (confirmacionCompraEl) confirmacionCompraEl.classList.add("hidden");
  guardarCarrito();
  renderCarrito();
  mostrarAlerta(`Se agregó "${producto.nombre}" al carrito.`, "success");
}

function cambiarCantidad(productoId, nuevaCantidad) {
  const cantidadNum = Number(nuevaCantidad);
  if (!Number.isFinite(cantidadNum) || cantidadNum <= 0) {
    eliminarProducto(productoId);
    return;
  }

  const item = carrito.find((i) => i.productoId === productoId);
  if (item) {
    item.cantidad = Math.floor(cantidadNum);
    guardarCarrito();
    renderCarrito();
  }
}

function eliminarProducto(productoId) {
  carrito = carrito.filter((item) => item.productoId !== productoId);
  guardarCarrito();
  renderCarrito();
}

function vaciarCarrito() {
  carrito = [];
  guardarCarrito();
  renderCarrito();
  mostrarAlerta("El carrito se ha vaciado.");
}

function calcularTotales() {
  let subtotal = 0;
  let unidades = 0;

  for (const item of carrito) {
    const prod = PRODUCTOS.find((p) => p.id === item.productoId);
    if (prod) {
      subtotal += prod.precio * item.cantidad;
      unidades += item.cantidad;
    }
  }

  const envio = unidades > 0 ? (subtotal >= ENVIO_GRATIS_DESDE ? 0 : ENVIO_ESTANDAR) : 0;
  const total = unidades === 0 ? 0 : subtotal + envio;

  return { subtotal, envio, total, unidades };
}

function renderCarrito() {
  const { subtotal, envio, total, unidades } = calcularTotales();

  if (contadorHeaderEl) contadorHeaderEl.textContent = String(unidades);
  if (totalUnidadesEl) totalUnidadesEl.textContent = String(unidades);
  if (subtotalGeneralEl) subtotalGeneralEl.textContent = formatearCOP(subtotal);
  if (costoEnvioEl) costoEnvioEl.textContent = formatearCOP(envio);
  if (totalPagarEl) totalPagarEl.textContent = formatearCOP(total);

  if (!carritoItemsEl) return;
  carritoItemsEl.innerHTML = "";

  if (carrito.length === 0) {
    carritoItemsEl.innerHTML = `
      <div class="empty-cart">
        <p>Tu carrito está vacío.</p>
        <p>Agrega productos desde el catálogo para comenzar.</p>
      </div>
    `;
    return;
  }

  for (const item of carrito) {
    const prod = PRODUCTOS.find((p) => p.id === item.productoId);
    if (!prod) continue;

    const subtotalProducto = prod.precio * item.cantidad;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}" />
      <div class="cart-item-info">
        <h4>${prod.nombre}</h4>
        <p class="cart-item-meta">Unitario: ${formatearCOP(prod.precio)}</p>
        <p class="cart-item-subtotal">Subtotal: ${formatearCOP(subtotalProducto)}</p>
      </div>
      <div class="cart-item-controls">
        <label>
          <span class="cart-item-meta">Cant:</span>
          <input
            type="number"
            min="1"
            class="qty-input"
            value="${item.cantidad}"
            data-qty-id="${prod.id}"
            aria-label="Cantidad de ${prod.nombre}"
          />
        </label>
        <button type="button" class="btn-remove" data-remove-id="${prod.id}">
          Eliminar
        </button>
      </div>
    `;
    carritoItemsEl.appendChild(row);
  }
}

function manejarFinalizarCompra(event) {
  event.preventDefault();
  const { total, unidades } = calcularTotales();

  if (unidades === 0 || total === 0) {
    mostrarAlerta("No puedes finalizar la compra porque el carrito está vacío.");
    return;
  }

  const nombre = document.getElementById("comprador-nombre").value.trim();
  const correo = document.getElementById("comprador-correo").value.trim();
  const telefono = document.getElementById("comprador-telefono").value.trim();
  const direccion = document.getElementById("comprador-direccion").value.trim();

  if (!nombre || !correo || !telefono || !direccion) {
    mostrarAlerta("Por favor completa todos los campos obligatorios para finalizar la compra.");
    return;
  }

  if (confirmacionCompraEl) {
    confirmacionCompraEl.classList.remove("hidden");
    confirmacionCompraEl.innerHTML = `
      <strong>¡Compra simulada confirmada!</strong><br />
      Comprador: <strong>${nombre}</strong><br />
      Correo: ${correo} · Teléfono: ${telefono}<br />
      Dirección de entrega: ${direccion}<br />
      Valor total de la compra: <strong>${formatearCOP(total)}</strong>
    `;
  }

  carrito = [];
  guardarCarrito();
  renderCarrito();
  formCheckout.reset();
  mostrarAlerta("Compra procesada correctamente.", "success");
}

if (catalogoGrid) {
  catalogoGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add-id]");
    if (!btn) return;
    agregarAlCarrito(Number(btn.dataset.addId));
  });
}

if (carritoItemsEl) {
  carritoItemsEl.addEventListener("change", (e) => {
    const input = e.target.closest("[data-qty-id]");
    if (!input) return;
    cambiarCantidad(Number(input.dataset.qtyId), input.value);
  });

  carritoItemsEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove-id]");
    if (!btn) return;
    eliminarProducto(Number(btn.dataset.removeId));
  });
}

if (btnVaciarCarrito) {
  btnVaciarCarrito.addEventListener("click", vaciarCarrito);
}

if (formCheckout) {
  formCheckout.addEventListener("submit", manejarFinalizarCompra);
}

renderCatalogo();
renderCarrito();