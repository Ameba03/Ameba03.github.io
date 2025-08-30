/*******************************
 * 1) VÍDEO DE FONDO (autoplay)
 *******************************/
const bgVideo = document.getElementById('videoFondo');
function playVideoSeguro(){
  if (!bgVideo) return;
  bgVideo.setAttribute('muted','');
  bgVideo.muted = false;
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

let musicaIniciada = true;
let playRetryTimer = null;
let playRetries = 0;
const MAX_RETRIES = 20;

function setBtnIcon(){
  if (!btnSonido || !audioEl) return;
  btnSonido.textContent = (!audioEl.paused) ? '🔊' : '🔈';
}

function tryStartMusic(){
  if (!audioEl) return;
  audioEl.autoplay = true;
  audioEl.loop = true;
  audioEl.muted = false;   // queremos oírla desde el inicio
  audioEl.volume = 1;

  audioEl.play().then(()=>{
    musicaIniciada = true;
    clearTimeout(playRetryTimer);
    setBtnIcon();
  }).catch(()=>{
    // Si el navegador bloquea, reintenta en breve y al cargar/visibilidad
    if (playRetries < MAX_RETRIES){
      clearTimeout(playRetryTimer);
      playRetryTimer = setTimeout(()=>{ playRetries++; tryStartMusic(); }, 1200);
    }
  });
}

// Intentos agresivos de arranque al entrar
document.addEventListener('DOMContentLoaded', ()=> { tryStartMusic(); setTimeout(tryStartMusic, 80); });
window.addEventListener('load', tryStartMusic);
window.addEventListener('pageshow', () => tryStartMusic());
document.addEventListener('visibilitychange', ()=>{ if (!document.hidden && (audioEl.paused || !musicaIniciada)) tryStartMusic(); });

// Botón: la música solo la paras/activas manualmente
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
 * 3) NAVEGACIÓN / UI (tal cual tenías)
 *******************************************/
function siguientePantalla(id){
  document.querySelectorAll('.pantalla').forEach(p=>{
    p.classList.remove('visible'); p.classList.add('oculto');
  });
  const s = document.getElementById(id);
  if (s){ s.classList.remove('oculto'); s.classList.add('visible'); }

  // Garantiza música activa en pantalla 1 (y en las demás)
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
 *    - Siempre en bucle (autoplay sin toque, en mute)
 *    - El audio del vídeo SOLO se oye mientras esté visible (>=60%)
 *    - Al salir de pantalla se silencia, pero el vídeo sigue en bucle
 *    - La música de fondo NO se toca (no se pausa automáticamente)
 *****************************************************************/
function prepararVideosCarta(){
  const cont = document.getElementById('cartaScroll');
  if (!cont) return;

  const vids = cont.querySelectorAll('video');
  if (!vids.length) return;

  // Configuración base + autoplay (permitido porque van en mute)
  vids.forEach(v=>{
    v.setAttribute('playsinline','');
    v.setAttribute('webkit-playsinline','');
    v.loop = true;
    v.preload = 'auto';
    v.muted = true;          // autoplay seguro en móvil
    v.setAttribute('muted','');
    v.play().catch(()=>{});

    // Si por cualquier razón se para, lo relanzamos
    v.addEventListener('pause', ()=>{ v.play().catch(()=>{}); });
    v.addEventListener('stalled', ()=>{ v.play().catch(()=>{}); });
    v.addEventListener('waiting', ()=>{ v.play().catch(()=>{}); });
  });

  // Observer para activar/desactivar el SONIDO según visibilidad
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const v = entry.target;
      const entrando = entry.isIntersecting && entry.intersectionRatio >= 0.6;
      const saliendo = !entry.isIntersecting || entry.intersectionRatio < 0.25;

      if (entrando){
        // El vídeo ya está reproduciéndose; solo activamos sonido
        v.muted = false;
        // Forzamos play por si el user pausó manualmente
        v.play().catch(()=>{});
      }
      if (saliendo){
        // Silenciamos, pero NO paramos el vídeo (sigue el bucle)
        v.muted = true;
      }
    });
  }, { root: cont, threshold: [0, 0.25, 0.6, 1] });

  vids.forEach(v=> io.observe(v));
}

document.addEventListener('DOMContentLoaded', prepararVideosCarta);
document.addEventListener('visibilitychange', ()=>{
  if (!document.hidden){
    // Si volvemos a la pestaña, asegura música y que los vídeos sigan
    tryStartMusic();
    const cont = document.getElementById('cartaScroll');
    cont?.querySelectorAll('video').forEach(v=> v.play().catch(()=>{}));
  }
});

