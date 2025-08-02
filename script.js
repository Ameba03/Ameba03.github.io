function siguientePantalla(id) {
  const pantallas = document.querySelectorAll('.pantalla');
  pantallas.forEach(p => p.classList.remove('visible'));
  pantallas.forEach(p => p.classList.add('oculto'));

  const siguiente = document.getElementById(id);
  if (siguiente) {
    siguiente.classList.remove('oculto');
    siguiente.classList.add('visible');
  }
}

function finalizar() {
  siguientePantalla('pantallaFinal');
}
