// ----- Vídeo: asegurar reproducción en móvil -----
const video = document.getElementById('videoFondo');
function playVideoSeguro(){
  if (!video) return;
  video.muted = true;    // requerido para autoplay en iOS
  video.loop = true;
  video.play().catch(()=>{ /* iOS puede bloquear hasta un gesto */ });
}
document.addEventListener('DOMContentLoaded', playVideoSeguro);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) playVideoSeguro();
});
['touchstart','click'].forEach(ev=>{
  document.addEventListener(ev, playVideoSeguro, { once:true });
});

// ----- Música de fondo con control -----
const audio = document.getElementById('musicaFondo');
const btnSonido = document.getElementById('btnSonido');
let musicaIniciada = false;

function iniciarMusica() {
  if (musicaIniciada) return;
  if (!audio) return;
  audio.volume = 0.7;
  audio.play().then(()=>{
    musicaIniciada = true;
    btnSonido.textContent = '🔊';
  }).catch(()=>{/* si falla, el botón lo activará */});
}
btnSonido.addEventListener('click', ()=>{
  if (audio.paused) {
    audio.play().then(()=>{ musicaIniciada=true; btnSonido.textContent='🔊'; }).catch(()=>{});
  } else {
    audio.pause();
    btnSonido.textContent='🔈';
  }
});

// ----- Navegación de pantallas -----
function siguientePantalla(id) {
  document.querySelectorAll('.pantalla').forEach(p=>{
    p.classList.remove('visible'); p.classList.add('oculto');
  });
  const s = document.getElementById(id);
  if (s){ s.classList.remove('oculto'); s.classList.add('visible'); }
  iniciarMusica(); // primer toque = arranca música
}

// ----- Ir a la pregunta (scroll al final de la carta) -----
function irAPregunta(){
  const cont = document.getElementById('cartaScroll');
  const destino = document.getElementById('preguntaFinal');
  if (cont && destino){
    cont.scrollTo({ top: destino.offsetTop - 8, behavior:'smooth' });
  }
}
window.irAPregunta = irAPregunta; // para el botón del HTML

// ----- Resultado final -----
function respuestaFinal(opcion) {
  if (opcion === 'si') {
    siguientePantalla('pantalla6');
    animacionLoca();
  } else {
    siguientePantalla('pantalla7');
  }
}
window.respuestaFinal = respuestaFinal;
window.siguientePantalla = siguientePantalla;

// ----- Animación celebración -----
function animacionLoca() {
  for (let i=0;i<160;i++){
    const c=document.createElement('span');
    c.className='confeti';
    c.style.left=(Math.random()*100)+'vw';
    c.style.animationDuration=(2.5+Math.random()*2.5)+'s';
    c.style.animationDelay=(Math.random()*0.8)+'s';
    c.style.transform=`rotate(${Math.random()*360}deg)`;
    c.style.background=`hsl(${Math.floor(Math.random()*360)},90%,60%)`;
    document.body.appendChild(c);
    setTimeout(()=>c.remove(),4000);
  }
  const corazones=['💖','💗','💘','💝','❤️','🩷'];
  for(let i=0;i<30;i++){
    const h=document.createElement('span');
    h.className='heart';
    h.textContent=corazones[i%corazones.length];
    h.style.left=(5+Math.random()*90)+'vw';
    h.style.animationDuration=(3+Math.random()*3.5)+'s';
    h.style.animationDelay=(Math.random()*0.6)+'s';
    document.body.appendChild(h);
    setTimeout(()=>h.remove(),5000);
  }
}
