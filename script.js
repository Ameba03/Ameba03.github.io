function siguientePantalla(id) {
  document.querySelectorAll('.pantalla').forEach(p => {
    p.classList.remove('activa');
    p.classList.add('oculto');
  });
  const siguiente = document.getElementById(id);
  if (siguiente) {
    siguiente.classList.remove('oculto');
    siguiente.classList.add('activa');
  }
}

function responder(respuesta) {
  const div = document.getElementById('respuesta');
  if (respuesta === 'si') {
    div.innerHTML = '🚀 ¡BOOOM! Allá vamos ✨';
  } else {
    div.innerHTML = 'Uuups... vuelve a pensarlo 🤔';
  }
}
