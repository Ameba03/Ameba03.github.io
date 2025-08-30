// ====== VÍDEO DE FONDO: asegurar reproducción ======
const video = document.getElementById('videoFondo');
function playVideoSeguro(){
  if (!video) return;
  video.muted = true;         // requerido para autoplay en iOS
  video.loop = true;
  video.play().catch(()=>{});
}
document.addEventListener('DOMContentLoaded', playVideoSeguro);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) playVideoSeguro();
});
['touchstart','click'].forEach(ev=>{
  document.addEventListener(ev, playVideoSeguro, { once:true });
});

// ====== MÚSICA DE FONDO (mp3) ======
const audio = document.getElementById('musicaFondo');
const btnSonido = document.getElementById('btnSonido');
let musicaIniciada = false;

function iniciarMusica() {
  if (musicaIniciada || !audio) return;
  audio.volume = 0.7;
  audio.play().then(()=>{
    musicaIniciada = true;
    if (btnSonido) btnSonido.textContent = '🔊';
  }).catch(()=>{ /* iOS pedirá un toque extra */ });
}
btnSonido?.addEventListener('click', ()=>{
  if (audio.paused) {
    audio.play().then(()=>{ musicaIniciada=true; btnSonido.textContent='🔊'; }).catch(()=>{});
  } else {
    audio.pause();
    btnSonido.textContent='🔈';
  }
});

// ====== NAVEGACIÓN ENTRE PANTALLAS ======
function siguientePantalla(id) {
  document.querySelectorAll('.pantalla').forEach(p=>{
    p.classList.remove('visible'); p.classList.add('oculto');
  });
  const s = document.getElementById(id);
  if (s){ s.classList.remove('oculto'); s.classList.add('visible'); }
  iniciarMusica(); // primer toque = arranca música
}
window.siguientePantalla = siguientePantalla;

// ====== SCROLL a la pregunta final ======
function irAPregunta(){
  const cont = document.getElementById('cartaScroll');
  const destino = document.getElementById('preguntaFinal');
  if (cont && destino){
    cont.scrollTo({ top: destino.offsetTop - 8, behavior:'smooth' });
  }
}
window.irAPregunta = irAPregunta;

// ====== RESULTADO FINAL ======
function respuestaFinal(opcion) {
  if (opcion === 'si') {
    siguientePantalla('pantalla6');
    animacionLoca();
  } else {
    siguientePantalla('pantalla7');
  }
}
window.respuestaFinal = respuestaFinal;

// ====== ANIMACIÓN CELEBRACIÓN ======
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
    setTimeout(()=>c.remove(),4200);
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
    setTimeout(()=>h.remove(),5200);
  }
}

// ====== VIDEOS DENTRO DE LA CARTA (autoplay al ver, con sonido, loop, responsive) ======
function prepararVideosCarta(){
  const cont = document.getElementById('cartaScroll');
  if (!cont) return;

  const vids = cont.querySelectorAll('video');
  if (!vids.length) return;

  let currentVideo = null;      // vídeo que suena ahora
  let audioWasPlaying = false;  // si el mp3 estaba sonando antes del vídeo

  vids.forEach(v=>{
    v.setAttribute('playsinline','');
    v.setAttribute('webkit-playsinline','');
    v.loop = true;
    v.preload = 'metadata';
  });

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const v = entry.target;
      const entrando = entry.isIntersecting && entry.intersectionRatio >= 0.6;
      const saliendo = !entry.isIntersecting || entry.intersectionRatio < 0.25;

      if (entrando) {
        // Pausar cualquier otro vídeo activo
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
        // Reproducir con sonido el vídeo actual
        currentVideo = v;
        v.muted = false;
        v.play().catch(()=>{ /* si falla, el user puede darle play */ });
      }

      if (saliendo && currentVideo === v) {
        // Al salir el vídeo activo, lo pausamos y devolvemos el mp3 si procedía
        v.pause();
        v.muted = true;
        currentVideo = null;

        if (audio && audioWasPlaying) {
          audio.play().then(()=>{
            if (btnSonido) btnSonido.textContent='🔊';
          }).catch(()=>{});
        }
        audioWasPlaying = false;
      }
    });
  }, { root: cont, threshold: [0, 0.25, 0.6, 1] });

  vids.forEach(v=> io.observe(v));
}

document.addEventListener('DOMContentLoaded', prepararVideosCarta);
