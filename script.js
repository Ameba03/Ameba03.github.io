function siguientePantalla(id) {
  const pantallas = document.querySelectorAll('.pantalla');
  pantallas.forEach(p => {
    p.classList.remove('visible');
    p.classList.add('oculto');
  });

  const siguiente = document.getElementById(id);
  if (siguiente) {
    siguiente.classList.remove('oculto');
    siguiente.classList.add('visible');
  }
}

function finalizar() {
  siguientePantalla('pantalla4');
}

function respuestaFinal(opcion) {
  if (opcion === 'si') {
    siguientePantalla('pantalla6');
  } else {
    siguientePantalla('pantalla7');
  }
}
