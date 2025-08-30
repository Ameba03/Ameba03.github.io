/*******************************
 * 1) VÍDEO DE FONDO (autoplay)
 *******************************/
const bgVideo = document.getElementById('videoFondo');
function playVideoSeguro(){
  if (!bgVideo) return;
  bgVideo.setAttribute('muted','');
  bgVideo.muted = true;
  bgVideo.loop = true;
  bgVideo.playsInline = true;
  bgVideo.setAttribute('playsinline','');
  bgVideo.setAttribute('webkit-playsinline','');
  bgVideo.play().catch(()=>{});
}
document.addEventListener('DOMContentLoaded', playVideoSeguro);
window.addEventListener('load', playVideoSeguro);
document.addEventListener('visibilitychange', ()=>{ if (!document.hidden) playVideoSeguro(); });
['touchstart','click'].forEach(ev => document.addEventListener(ev, playVideoSeguro, { once:true }));


/************************************
 * 2) MÚSICA DE FONDO (fondo.mp3)
 *    - Activa desde el inicio
 *    - Solo se para con el botón
 ************************************/
const audioEl   = document.getElementById('musicaFondo');
const btnSonido = document.getElementById('btnSonido');

let musicaIniciada = false;
let retryTimer = null;
let retryCount = 0;
const MAX_RETRIES = 30;   // insiste ~30s si el navegador bloquea

function setBtnIcon(){
  if (!btnSonido) return;
  btnSonido.textContent = (!audioEl?.paused) ? '🔊' : '🔈';
}

function tryStartMusic(){
  if (!audioEl) return;
  audioEl.autoplay = true;
  audioEl.loop = true;
  audioEl.muted = false;
  audioEl.volume = 1;

  const p = audioEl.play();
  if (!p || !p.then) return;

  p.then(()=>{
    musicaIniciada = true;
    clearInterval(retryTimer);
    retryTimer = null;
    setBtnIcon();
  }).catch(()=>{
    // Reintento periódico (algunos navegadores requieren interacción previa)
    if (!retryTimer){
      retryTimer = setInterval(()=>{
        if (retryCount++ >= MAX_RETRIES){ clearInterval(retryTimer); retryTimer = null; return; }
        audioEl.play().catch(()=>{});
      }, 1000);
    }
  });
}

// arranque agresivo al cargar
document.addEventListener('DOMContentLoaded', ()=>{ tryStartMusic(); setTimeout(tryStartMusic, 80); });
window.addEventListener('load', tryStartMusic);
window.addEventListener('pageshow', tryStartMusic);
document.addEventListener('visibilitychange', ()=>{ if (!document.hidden && (audioEl.paused || !musicaIniciada)) tryStartMusic(); });

// cualquier gesto ayuda a desbloquear si hizo falta
['pointerdown','click','touchstart','keydown','wheel','scroll','mousemove'].forEach(ev=>{
  document.addEventListener(ev, tryStartMusic, { once:false });
});

// botón: la música solo se para/activa manualmente
btnSonido?.addEventListener('click', ()=>{
  if (!audioEl) return;
  if (audioEl.paused){
    tryStartMusic();
  } else {
    audioEl.pause();
    setBtnIcon();
  }
});
audioEl?.addEventListener('play',  setBtnIcon);
audioEl?.addEventListener('pause', setBtnIcon);


/*******************************************
 * 3) NAVEGACIÓN / UI (como tenías)
 *******************************************/
function siguientePantalla(id){
  document.querySelectorAll('.pantalla').forEach(p=>{
    p.classList.remove('visible'); p.classList.add('oculto');
  });
  const s = document.getElementById(id);
  if (s){ s.classList.remove('oculto'); s.classList.add('visible'); }
  // asegúrate de que la música está activa al cambiar
  tryStartMusic();
}
window.siguientePantalla = siguientePantalla;

function irAPregunta(){
  const cont = document.getElementById('cartaScroll');
  const destino = document.getElementById('preguntaFinal');
  if (cont && destino) cont.scrollTo({ top: destino.offsetTop - 8, behavior:'smooth' });
}
window.irAPregunta = irAPregunta;

function respuestaFinal(opcion){
  if (opcion === 'si'){
    siguientePantalla('pantalla6');
    animacionLoca();
  } else {
    siguientePantalla('pantalla7');
  }
}
window.respuestaFinal = respuestaFinal;

function animacionLoca(){
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
  const hearts=['💖','💗','💘','💝','❤️','🩷'];
  for(let i=0;i<30;i++){
    const h=document.createElement('span');
    h.className='heart';
    h.textContent=hearts[i%hearts.length];
    h.style.left=(5+Math.random()*90)+'vw';
    h.style.animationDuration=(3+Math.random()*3.5)+'s';
    h.style.animationDelay=(Math.random()*0.6)+'s';
    document.body.appendChild(h);
    setTimeout(()=>h.remove(),5000);
  }
}


/*****************************************************************
 * 4) VÍDEOS DE LA CARTA
 *    - Siempre en bucle (autoplay mute)
 *    - Sonido SOLO cuando están visibles (≥60% del área scrolleable)
 *    - Al salir, se silencian pero siguen reproduciéndose
 *    - NO tocan la música de fondo
 *****************************************************************/
function prepararVideosCarta(){
  const cont = document.getElementById('cartaScroll');
  if (!cont) return;

  const vids = cont.querySelectorAll('video');
  if (!vids.length) return;

  vids.forEach(v=>{
    v.setAttribute('playsinline','');
    v.setAttribute('webkit-playsinline','');
    v.loop = true;
    v.preload = 'auto';
    v.muted = true;                // autoplay seguro
    v.setAttribute('muted','');
    const forcePlay = ()=> v.play().catch(()=>{});
    forcePlay();
    ['pause','stalled','waiting','ended'].forEach(ev => v.addEventListener(ev, forcePlay));
  });

  // Sonido en función de visibilidad
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const v = entry.target;
      const visible = entry.isIntersecting && entry.intersectionRatio >= 0.6;
      if (visible){
        v.play().catch(()=>{});
        v.muted = false;           // oyes el vídeo
      } else {
        v.muted = true;            // se silencia, pero NO se pausa
      }
    });
  }, { root: cont, threshold: [0, 0.6, 1] });

  vids.forEach(v=> io.observe(v));
}

document.addEventListener('DOMContentLoaded', prepararVideosCarta);
document.addEventListener('visibilitychange', ()=>{
  if (!document.hidden){
    tryStartMusic();
    const cont = document.getElementById('cartaScroll');
    cont?.querySelectorAll('video').forEach(v=> v.play().catch(()=>{}));
  }
});
