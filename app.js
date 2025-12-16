// ===== CLASE CITA =====
class Cita {
  constructor(id, nombre, apellidos, dni, telefono, fechaNacimiento, fechaCita, observaciones) {
    this.id = id;
    this.nombre = nombre;
    this.apellidos = apellidos;
    this.dni = dni;
    this.telefono = telefono;
    this.fechaNacimiento = fechaNacimiento;
    this.fechaCita = fechaCita;
    this.observaciones = observaciones;
  }
}

// ===== VARIABLES GLOBALES =====
let citas = [];
let editando = false;
let idEditar = null;

// ===== ELEMENTOS DEL DOM =====
const formulario = document.querySelector('#formcita');
const tablaCitas = document.querySelector('#cuerpoTabla');

// ===== FUNCIONES AUXILIARES =====

// Genera un ID único
function generarID() {
  return Date.now().toString();
}

// Guarda citas en LocalStorage 
function guardarCitas() {
  localStorage.setItem('citas', JSON.stringify(citas));
}

// Carga citas desde LocalStorage
function cargarCitas() {
  const datos = localStorage.getItem('citas');
  if (datos) {
    citas = JSON.parse(datos);
  }
  renderizarTabla();
}

// Formatear fecha 
function formatearFecha(fechaISO) {
  if (!fechaISO) return '';
  const fecha = new Date(fechaISO);
  return fecha.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Limpia los mensajes de error
function limpiarErrores() {
  const errores = document.querySelectorAll('.error');
  errores.forEach(err => err.textContent = '');
  const inputs = document.querySelectorAll('input, textarea');
  inputs.forEach(input => input.classList.remove('error'));
}

// ===== VALIDACIÓN DEL FORMULARIO =====
function validarFormulario(datos) {
  let valido = true;
  limpiarErrores();

  if (datos.nombre.trim() === '') {
    mostrarError('nombre', 'El nombre es obligatorio');
    valido = false;
  }

  if (datos.apellidos.trim() === '') {
    mostrarError('apellidos', 'Los apellidos son obligatorios');
    valido = false;
  }

  // --- DNI ---
  const dniInput = datos.dni.trim().toUpperCase();
  
  // Acepta 7 u 8 números seguidos de CUALQUIER letra mayúscula
  const formatoValido = /^\d{7,8}[A-Z]$/.test(dniInput);

  if (!formatoValido) {
    mostrarError('dni', 'Formato inválido (Ej: 12345678A)');
    valido = false;
  }
  // -------------------------------------------------------

  if (!/^\d{9}$/.test(datos.telefono.trim())) {
    mostrarError('telefono', 'Teléfono no válido (9 dígitos)');
    valido = false;
  }

  if (datos.fechaNacimiento.trim() === '') {
    mostrarError('fechaNacimiento', 'Obligatorio');
    valido = false;
  }

  if (datos.fechaCita.trim() === '') {
    mostrarError('fechaCita', 'Obligatorio');
    valido = false;
  }

  return valido;
}

function mostrarError(idCampo, mensaje) {
  const campo = document.getElementById(idCampo);
  campo.classList.add('error');
  let error = campo.nextElementSibling;
  if (!error || !error.classList.contains('error')) {
    error = document.createElement('span');
    error.classList.add('error');
    campo.parentNode.appendChild(error);
  }
  error.textContent = mensaje;
}

// Renderiza la tabla de citas
function renderizarTabla() {
  tablaCitas.innerHTML = '';

  if (citas.length === 0) {
    const fila = document.createElement('tr');
    fila.classList.add('vacio');
    fila.innerHTML = `<td colspan="9">Dato vacío</td>`;
    tablaCitas.appendChild(fila);
    return;
  }

  citas.forEach((cita, index) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${index + 1}</td>
      <td>${cita.nombre}</td>
      <td>${cita.apellidos}</td>
      <td>${cita.dni}</td>
      <td>${cita.telefono}</td>
      <td>${cita.fechaNacimiento}</td>
      <td>${formatearFecha(cita.fechaCita)}</td> 
      <td>${cita.observaciones}</td>
      <td>
        <button class="editar" data-id="${cita.id}">Editar</button>
        <button class="eliminar" data-id="${cita.id}">Eliminar</button>
      </td>
    `;
    tablaCitas.appendChild(fila);
  });
}

function limpiarFormulario() {
  formulario.reset();
  limpiarErrores();
  editando = false;
  idEditar = null;
}

function cargarFormulario(cita) {
  document.getElementById('nombre').value = cita.nombre;
  document.getElementById('apellidos').value = cita.apellidos;
  document.getElementById('dni').value = cita.dni;
  document.getElementById('telefono').value = cita.telefono;
  document.getElementById('fechaNacimiento').value = cita.fechaNacimiento;
  
 
  document.getElementById('fechaCita').value = cita.fechaCita; 
  
  document.getElementById('observaciones').value = cita.observaciones;
  editando = true;
  idEditar = cita.id;
}

// ===== EVENTOS =====
formulario.addEventListener('submit', function(e) {
  e.preventDefault();

  const datos = {
    nombre: document.getElementById('nombre').value,
    apellidos: document.getElementById('apellidos').value,
    dni: document.getElementById('dni').value,
    telefono: document.getElementById('telefono').value,
    fechaNacimiento: document.getElementById('fechaNacimiento').value,
    fechaCita: document.getElementById('fechaCita').value,
    observaciones: document.getElementById('observaciones').value
  };

  if (!validarFormulario(datos)) return;

  if (editando) {
    const index = citas.findIndex(c => c.id === idEditar);
    // Reconstruimos el objeto conservando el orden de propiedades del constructor
    citas[index] = new Cita(
        idEditar, 
        datos.nombre, 
        datos.apellidos, 
        datos.dni, 
        datos.telefono, 
        datos.fechaNacimiento, 
        datos.fechaCita, 
        datos.observaciones
    );
  } else {
    const nuevaCita = new Cita(
        generarID(), 
        datos.nombre, 
        datos.apellidos, 
        datos.dni, 
        datos.telefono, 
        datos.fechaNacimiento, 
        datos.fechaCita, 
        datos.observaciones
    );
    citas.push(nuevaCita);
  }

  guardarCitas();
  renderizarTabla();
  limpiarFormulario();
});

tablaCitas.addEventListener('click', function(e) {
  if (e.target.classList.contains('eliminar')) {
    const id = e.target.dataset.id;
    citas = citas.filter(c => c.id !== id);
    guardarCitas();
    renderizarTabla();
    limpiarFormulario();
  }

  if (e.target.classList.contains('editar')) {
    const id = e.target.dataset.id;
    const cita = citas.find(c => c.id === id);
    cargarFormulario(cita);
  }
});

formulario.addEventListener('reset', function() {
  limpiarFormulario();
});

document.addEventListener('DOMContentLoaded', cargarCitas);