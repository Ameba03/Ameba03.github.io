function siguientePantalla(id) {
  const pantallas = document.querySelectorAll('.pantalla');
  pantallas.forEach(p => p.classList.remove('activa'));
  document.getElementById(id).classList.add('activa');
}

function responder(respuesta) {
  document.getElementById("respuesta").innerText = respuesta === "si"
    ? "Perfecto, continúa adelante."
    : "Tómate tu tiempo.";
}
