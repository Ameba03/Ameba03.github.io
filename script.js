// ----- Vídeo de fondo: intentar autoplay real en móvil -----
const video = document.getElementById('videoFondo');
function playVideoSeguro(){
  if (!video) return;
  video.setAttribute('muted','');
  video.muted = true;          // requerido para autoplay en iOS
  video.loop = true;
  // varios intentos para distintos navegadores
  video.play().catch(()=>{});
}
document.addEventListener('DOMContentLoaded', playVideoSeguro);
window.addEventListener('load', playVideoSeguro);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) playVideoSeguro();
});
['touchstart','click'].forEach(ev=>{
  document.addEventListener(ev, playVideoSeguro, { once:true });
});
video?.addEventListener('loadeddata', playVideoSeguro);

// ----- Música de fondo con control -----
const audio = document.getElementById('musicaFondo');
const btnSonido = document.getElementById('btnSonido');
let musicaIniciada = false;

function iniciarMusica() {
  if (musicaIniciada || !audio) return;
  audio.volume = 0.7;
  audio.play().then(()=>{
    musicaIniciada = true;
    if (btnSonido) btnSonido.textContent = '🔊';
  }).catch(()=>{/* iOS puede pedir otro toque */});
}
btnSonido?.addEventListener('click', ()=>{
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
window.siguientePantalla = siguientePantalla;

// ----- Ir a la pregunta (scroll al final de la carta) -----
function irAPregunta(){
  const cont = document.getElementById('cartaScroll');
  const destino = document.getElementById('preguntaFinal');
  if (cont && destino){
    cont.scrollTo({ top: destino.offsetTop - 8, behavior:'smooth' });
  }
}
window.irAPregunta = irAPregunta;

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

// ----- Vídeos dentro de la carta -----
// Reproducción en bucle; sonido SOLO cuando están visibles; pausa el mp3 mientras suenan
function prepararVideosCarta(){
  const cont = document.getElementById('cartaScroll');
  if (!cont) return;

  const vids = cont.querySelectorAll('video');
  if (!vids.length) return;

  let currentVideo = null;      // vídeo que suena ahora
  let audioWasPlaying = false;  // recordar si el mp3 estaba sonando

  vids.forEach(v=>{
    v.setAttribute('playsinline','');
    v.setAttribute('webkit-playsinline','');
    v.loop = true;
    v.preload = 'metadata';
    v.muted = true; // estado inicial
  });

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const v = entry.target;
      const entrando = entry.isIntersecting && entry.intersectionRatio >= 0.6;
      const saliendo = !entry.isIntersecting || entry.intersectionRatio < 0.25;

      if (entrando) {
        // Pausar otro vídeo activo
        if (currentVideo && currentVideo !== v) {
          currentVideo.pause();
          currentVideo.muted = true;
        }
        // Pausar mp3 si estaba sonando
        if (audio && !audio.paused) {
          audioWasPlaying = true;
          audio.pause();
          if (btnSonido) btnSonido.textContent = '🔈';
        } else {
          audioWasPlaying = false;
        }

        currentVideo = v;
        v.muted = false;           // permitir sonido (ya hubo interacción en la app)
        v.play().catch(()=>{});    // si el navegador no deja, el usuario puede darle play
      }

      if (saliendo && currentVideo === v) {
        v.pause();
        v.muted = true;
        currentVideo = null;

        if (audio && audioWasPlaying) {
          audio.play().then(()=>{ if (btnSonido) btnSonido.textContent='🔊'; }).catch(()=>{});
        }
        audioWasPlaying = false;
      }
    });
  }, { root: cont, threshold: [0, 0.25, 0.6, 1] });

  vids.forEach(v=> io.observe(v));
}
document.addEventListener('DOMContentLoaded', prepararVideosCarta);
