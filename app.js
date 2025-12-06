// ----- Datos y almacenamiento -----
const STORAGE_KEY = "movimientos_gastos_personales";

let movimientos = [];

// Cargar desde localStorage
function cargarMovimientos() {
  const data = localStorage.getItem(STORAGE_KEY);
  movimientos = data ? JSON.parse(data) : [];
}

function guardarMovimientos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movimientos));
}

// ----- Navegación tipo SPA -----
const navButtons = document.querySelectorAll(".nav-btn");
const views = document.querySelectorAll(".view");

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const view = btn.dataset.view;
    cambiarVista(view);
  });
});

function cambiarVista(viewName) {
  navButtons.forEach((b) => b.classList.remove("active"));
  views.forEach((v) => v.classList.remove("active"));

  document
    .querySelector(`[data-view="${viewName}"]`)
    .classList.add("active");
  document.getElementById(`view-${viewName}`).classList.add("active");
}

// ----- Registro de movimiento -----
const formMovimiento = document.getElementById("form-movimiento");
const mensajeForm = document.getElementById("mensaje-form");

formMovimiento.addEventListener("submit", (e) => {
  e.preventDefault();

  const tipo = document.getElementById("tipo").value;
  const monto = parseFloat(document.getElementById("monto").value);
  const categoria = document.getElementById("categoria").value;
  const descripcion = document.getElementById("descripcion").value.trim();
  const fecha = document.getElementById("fecha").value;

  if (!tipo || !monto || !categoria || !fecha) {
    mostrarMensaje("Por favor complete todos los campos obligatorios.", "error");
    return;
  }

  const nuevoMovimiento = {
    id: Date.now(),
    tipo,
    monto,
    categoria,
    descripcion,
    fecha
  };

  movimientos.push(nuevoMovimiento);
  guardarMovimientos();
  actualizarUI();

  formMovimiento.reset();
  mostrarMensaje("Movimiento registrado correctamente.", "ok");
});

function mostrarMensaje(texto, tipo) {
  mensajeForm.textContent = texto;
  mensajeForm.className = "mensaje " + tipo;
  setTimeout(() => {
    mensajeForm.textContent = "";
    mensajeForm.className = "mensaje";
  }, 3000);
}

// ----- Actualización de UI -----
const totalIngresosEl = document.getElementById("total-ingresos");
const totalGastosEl = document.getElementById("total-gastos");
const saldoEl = document.getElementById("saldo");
const tbodyUltimos = document.getElementById("tbody-ultimos");
const tbodyHistorial = document.getElementById("tbody-historial");

function actualizarResumen() {
  let totalIngresos = 0;
  let totalGastos = 0;

  movimientos.forEach((m) => {
    if (m.tipo === "ingreso") totalIngresos += m.monto;
    if (m.tipo === "gasto") totalGastos += m.monto;
  });

  const saldo = totalIngresos - totalGastos;

  totalIngresosEl.textContent = "S/ " + totalIngresos.toFixed(2);
  totalGastosEl.textContent = "S/ " + totalGastos.toFixed(2);
  saldoEl.textContent = "S/ " + saldo.toFixed(2);
}

function formatearMonto(monto) {
  return monto.toFixed(2);
}

function crearFilaMovimiento(mov) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${mov.fecha}</td>
    <td>${mov.tipo === "ingreso" ? "Ingreso" : "Gasto"}</td>
    <td>${mov.categoria}</td>
    <td>${mov.descripcion || "-"}</td>
    <td style="text-align:right;">${formatearMonto(mov.monto)}</td>
  `;
  return tr;
}

function actualizarTablas() {
  // Últimos movimientos (máx. 5)
  tbodyUltimos.innerHTML = "";
  const ultimos = [...movimientos]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  ultimos.forEach((m) => {
    tbodyUltimos.appendChild(crearFilaMovimiento(m));
  });

  // Historial completo (con filtros)
  aplicarFiltrosHistorial();
}

// ----- Filtros de historial -----
const filtroTipo = document.getElementById("filtro-tipo");
const filtroCategoria = document.getElementById("filtro-categoria");

filtroTipo.addEventListener("change", aplicarFiltrosHistorial);
filtroCategoria.addEventListener("change", aplicarFiltrosHistorial);

function aplicarFiltrosHistorial() {
  const tipoSeleccionado = filtroTipo.value;
  const categoriaSeleccionada = filtroCategoria.value;

  tbodyHistorial.innerHTML = "";

  let lista = [...movimientos];

  if (tipoSeleccionado !== "todos") {
    lista = lista.filter((m) => m.tipo === tipoSeleccionado);
  }

  if (categoriaSeleccionada !== "todas") {
    lista = lista.filter((m) => m.categoria === categoriaSeleccionada);
  }

  // Ordenar por fecha de creación (id)
  lista.sort((a, b) => b.id - a.id);

  lista.forEach((m) => {
    tbodyHistorial.appendChild(crearFilaMovimiento(m));
  });
}

// ----- Inicialización -----
function actualizarUI() {
  actualizarResumen();
  actualizarTablas();
}

cargarMovimientos();
actualizarUI();
cambiarVista("dashboard");
