function siguientePantalla(id) {
  document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
  document.getElementById(id).classList.add('activa');
}

function responder(respuesta) {
  const div = document.getElementById("respuesta");
  if (respuesta === "si") {
    div.innerHTML = "🎉 ¡Bienvenido! 🚀✨";
  } else {
    div.innerHTML = "😅 Ups, te has equivocado. Vuelve a pensarlo anda.";
    setTimeout(() => {
      location.reload();
    }, 3000);
  }
}
