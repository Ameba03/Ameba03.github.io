/* ====== VÍDEO DE FONDO: autoplay + bucle sin corte (crossfade) ====== */
const bgVideo = document.getElementById('videoFondo');
let bgVideoClone = null;
let bgActivo = null;
const BG_CROSSFADE = 0.45; // s

function configuraBgVideo(v){
  if (!v) return;
  v.setAttribute('muted','');
  v.muted = true;
  v.removeAttribute('loop');
  v.loop = false;
  v.autoplay = true;
  v.playsInline = true;
  v.setAttribute('playsinline','');
  v.setAttribute('webkit-playsinline','');
  v.preload = 'auto';
  try{ v.load(); }catch(_){}
  v.addEventListener('canplay', ()=>{ v.play().catch(()=>{}); }, { once:true });
}

function ensurePlay(v){
  if (!v) return;
  v.setAttribute('muted','');
  v.muted = true;
  v.autoplay = true;
  v.play().catch(()=>{});
}

function initSeamlessBg(){
  if (!bgVideo) return;
  if (!bgVideoClone){
    bgVideoClone = bgVideo.cloneNode(true);
    bgVideoClone.id = 'videoFondoClone';
    bgVideo.parentNode.insertBefore(bgVideoClone, bgVideo.nextSibling);
  }
  [bgVideo, bgVideoClone].forEach(configuraBgVideo);
  bgActivo = bgVideo;

  const step = () => {
    const v = bgActivo;
    if (v && isFinite(v.duration) && v.duration > 0){
      const resto = v.duration - v.currentTime;
      if (resto <= BG_CROSSFADE + 0.02){
        const next = (bgActivo === bgVideo) ? bgVideoClone : bgVideo;
        try { next.currentTime = 0.001; } catch(_){}
        ensurePlay(next);
        next.style.opacity = '1';
        v.style.opacity = '0';
        setTimeout(()=>{
          try{ v.pause(); }catch(_){}
          bgActivo = next;
        }, (BG_CROSSFADE * 1000) + 30);
      }
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function playVideoSeguro(){
  if (!bgVideo) return;
  ensurePlay(bgActivo || bgVideo);
  ensurePlay(bgVideoClone || bgVideo);
}

document.addEventListener('DOMContentLoaded', ()=>{
  initSeamlessBg();
  playVideoSeguro();
});
window.addEventListener('load', playVideoSeguro);
document.addEventListener('visibilitychange', ()=>{ if (!document.hidden) playVideoSeguro(); });
['pointerdown','touchstart','click'].forEach(ev => document.addEventListener(ev, playVideoSeguro, { once:true }));


/* ====== MÚSICA DE FONDO (fondo.mp3) – simple y robusta ====== */
const audioEl   = document.getElementById('musicaFondo');
const btnSonido = document.getElementById('btnSonido');

function updateBtnIcon(){
  if (!btnSonido || !audioEl) return;
  btnSonido.textContent = (!audioEl.paused) ? '🔊' : '🔈';
}

function iniciarMusica(){
  if (!audioEl) return;
  audioEl.loop = true;                 // aseguramos bucle
  audioEl.play().then(updateBtnIcon).catch(()=>{}); // si el navegador bloquea, se activará con el primer gesto
}

// intentos de autoplay y desbloqueo por primer gesto
document.addEventListener('DOMContentLoaded', ()=> {
  setTimeout(()=>{ audioEl?.load(); iniciarMusica(); }, 120);
});
window.addEventListener('load', iniciarMusica);
['pointerdown','touchstart','click','keydown'].forEach(ev=>{
  document.addEventListener(ev, ()=>{ iniciarMusica(); }, { once:true });
});

btnSonido?.addEventListener('click', ()=>{
  if (!audioEl) return;
  if (audioEl.paused){
    audioEl.play().then(updateBtnIcon).catch(()=>{});
  } else {
    audioEl.pause();
    updateBtnIcon();
  }
});
audioEl?.addEventListener('play',  updateBtnIcon);
audioEl?.addEventListener('pause', updateBtnIcon);


/* ====== Navegación entre pantallas ====== */
function siguientePantalla(id){
  document.querySelectorAll('.pantalla').forEach(p=>{
    p.classList.remove('visible'); p.classList.add('oculto');
  });
  const s = document.getElementById(id);
  if (s){ s.classList.remove('oculto'); s.classList.add('visible'); }
  iniciarMusica(); // por si aún no estaba sonando
}
window.siguientePantalla = siguientePantalla;

/* ====== Scroll a la pregunta final ====== */
function irAPregunta(){
  const cont = document.getElementById('cartaScroll');
  const destino = document.getElementById('preguntaFinal');
  if (cont && destino) cont.scrollTo({ top: destino.offsetTop - 8, behavior:'smooth' });
}
window.irAPregunta = irAPregunta;

/* ====== Resultado final ====== */
function respuestaFinal(opcion){
  if (opcion === 'si'){
    siguientePantalla('pantalla6');
    animacionLoca();
  } else {
    siguientePantalla('pantalla7');
  }
}
window.respuestaFinal = respuestaFinal;

/* ====== Animación celebración ====== */
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

/* ====== Vídeos dentro de la carta ======
   - Mantiene los vídeos en mute por defecto.
   - Cuando un vídeo entra en foco, lo reproducimos y (si la música estaba sonando)
     "autopulsamos" el botón de sonido UNA vez para pausar la música.
===================================================== */
let audioCtx; // solo para el audio de los vídeos
const videoGains = new Map(); // si más adelante quieres volver a fades finos

function ensureAudioCtx(){
  if (audioCtx) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  audioCtx = new Ctx();
}

function prepararVideosCarta(){
  const cont = document.getElementById('cartaScroll');
  if (!cont) return;

  const vids = cont.querySelectorAll('video');
  if (!vids.length) return;

  vids.forEach(v=>{
    v.setAttribute('playsinline','');
    v.setAttribute('webkit-playsinline','');
    v.loop   = true;
    v.preload = 'metadata';
    v.muted  = true; // por defecto en silencio
  });

  // Si quieres hacer mezclas/fades más adelante, montamos nodos cuando haya gesto
  function setupVideoNodes(){
    ensureAudioCtx();
    vids.forEach(v=>{
      if (videoGains.has(v)) return;
      const src  = audioCtx.createMediaElementSource(v);
      const gain = audioCtx.createGain();
      gain.gain.value = 0; // empezamos en 0
      src.connect(gain).connect(audioCtx.destination);
      videoGains.set(v, gain);
    });
  }
  document.addEventListener('click', setupVideoNodes, { once:true });
  document.addEventListener('touchstart', setupVideoNodes, { once:true });
  audioEl?.addEventListener('play', setupVideoNodes, { once:true });

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const v = entry.target;
      const entrando = entry.isIntersecting && entry.intersectionRatio >= 0.6;
      const saliendo = !entry.isIntersecting || entry.intersectionRatio < 0.25;

      const gain = videoGains.get(v); // puede no existir si no hubo gesto aún

      if (entrando){
        // Hacemos audible el vídeo si ya hubo interacción:
        v.play().catch(()=>{});
        if (audioCtx && gain){
          const t = audioCtx.currentTime;
          gain.gain.cancelScheduledValues(t);
          gain.gain.setValueAtTime(gain.gain.value, t);
          gain.gain.linearRampToValueAtTime(1.0, t + 0.25);
          v.muted = true; // suena por WebAudio
        } else {
          // sin WebAudio (antes del gesto), intentamos desmutear si el user ya tocó
          v.muted = false;
        }

        // === AUTOPULSO: si la música de fondo está sonando, la pausamos 1 vez
        if (audioEl && !audioEl.paused && !v.__autoPulseDone){
          btnSonido?.click();      // pausa música y actualiza icono
          v.__autoPulseDone = true;
        }
      }

      if (saliendo){
        if (audioCtx && gain){
          const t = audioCtx.currentTime;
          gain.gain.cancelScheduledValues(t);
          gain.gain.setValueAtTime(gain.gain.value, t);
          gain.gain.linearRampToValueAtTime(0.0, t + 0.2);
        }
        v.pause();
        v.muted = true;
        v.__autoPulseDone = false; // listo para volver a autopulsar la próxima vez
      }
    });
  }, { root: cont, threshold: [0, 0.25, 0.6, 1] });

  vids.forEach(v=> io.observe(v));
}

document.addEventListener('DOMContentLoaded', prepararVideosCarta);
document.addEventListener('visibilitychange', async ()=>{
  if (audioCtx && audioCtx.state === 'suspended') {
    try { await audioCtx.resume(); } catch(e){}
  }
});
