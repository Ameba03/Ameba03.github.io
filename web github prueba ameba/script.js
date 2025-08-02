function siguientePantalla(id) {
  document.querySelectorAll('.pantalla').forEach(p => p.classList.add('oculto'));
  document.getElementById(id).classList.remove('oculto');
}

function responder(respuesta) {
  const div = document.getElementById("respuesta");
  if (respuesta === "si") {
    div.innerHTML = "🚀 ¡Prepárate! Esto va a despegar... 🚀";
    div.classList.add("cohete");
  } else {
    div.innerHTML = "🙃 Upps... te has equivocado. ¡Vuelve a pensarlo anda!";
    setTimeout(() => location.reload(), 4000);
  }
}
