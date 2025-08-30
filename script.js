// ====== VÍDEO DE FONDO: autoplay + bucle sin corte (crossfade) ======
const bgVideo = document.getElementById('videoFondo');
let bgVideoClone = null;
let bgActivo = null;
const BG_CROSSFADE = 0.45; // segundos de fundido

function configuraBgVideo(v){
  if (!v) return;
  v.setAttribute('muted','');
  v.muted = true;
  v.removeAttribute('loop'); // hacemos el bucle por JS para evitar el "corte"
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
  v.play().catch(()=>{ /* silencioso */ });
}

function initSeamlessBg(){
  if (!bgVideo) return;
  if (!bgVideoClone){
    // Clon debajo del contenido, detrás del original
    bgVideoClone = bgVideo.cloneNode(true);
    bgVideoClone.id = 'videoFondoClone';
    bgVideo.parentNode.insertBefore(bgVideoClone, bgVideo.nextSibling);
  }
  [bgVideo, bgVideoClone].forEach(configuraBgVideo);
  bgActivo = bgVideo;

  // bucle de crossfade
  const step = () => {
    const v = bgActivo;
    if (v && isFinite(v.duration) && v.duration > 0){
      const resto = v.duration - v.currentTime;
      if (resto <= BG_CROSSFADE + 0.02){ // +pelín de colchón
        const next = (bgActivo === bgVideo) ? bgVideoClone : bgVideo;
        // arranca el siguiente desde el inicio y funde
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

// Eventos para asegurar autoplay en móvil
document.addEventListener('DOMContentLoaded', ()=>{
  initSeamlessBg();
  playVideoSeguro();
});
window.addEventListener('load', playVideoSeguro);
document.addEventListener('visibilitychange', ()=>{ if (!document.hidden) playVideoSeguro(); });
['pointerdown','touchstart','click'].forEach(ev => document.addEventListener(ev, playVideoSeguro, { once:true }));

// ====== MÚSICA DE FONDO ======
const audioEl   = document.getElementById('musicaFondo');
const btnSonido = document.getElementById('btnSonido');
let musicaIniciada = false;

// ---- Web Audio MIX ----
let audioCtx, bgGain;
const videoGains = new Map();  // <video> -> GainNode

function ensureAudioCtx(){
  if (audioCtx) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  audioCtx = new Ctx();

  // Conectar la música de fondo al contexto (y dejar el <audio> en mute)
  const bgSrc = audioCtx.createMediaElementSource(audioEl);
  bgGain = audioCtx.createGain();
  bgGain.gain.value = 0.7;           // volumen por defecto
  bgSrc.connect(bgGain).connect(audioCtx.destination);

  audioEl.muted = true;               // el elemento queda mudo, suena por WebAudio
  audioEl.volume = 0;                 // por si acaso
}

function iniciarMusica(){
  if (musicaIniciada) return;
  ensureAudioCtx();
  audioCtx.resume && audioCtx.resume();
  audioEl.play().then(()=>{
    musicaIniciada = true;
    btnSonido && (btnSonido.textContent = '🔊');
  }).catch(()=>{ /* algunos móviles bloquean hasta gesto del usuario */ });
}

// Intento de autoplay al cargar (si el navegador lo permite)
function intentarAutoMusica(){
  try{
    ensureAudioCtx();
    audioCtx.resume && audioCtx.resume();
    iniciarMusica();
  }catch(_){}
}
document.addEventListener('DOMContentLoaded', ()=> setTimeout(intentarAutoMusica, 100));
window.addEventListener('load', intentarAutoMusica);
// Primer gesto en cualquier parte de la pantalla => iniciar música
['pointerdown','touchstart','click','keydown'].forEach(ev => {
  document.addEventListener(ev, iniciarMusica, { once:true });
});

btnSonido?.addEventListener('click', ()=>{
  if (!audioCtx) ensureAudioCtx();
  if (!musicaIniciada || audioEl.paused){
    iniciarMusica();
    return;
  }
  // mute/unmute moviendo la ganancia (no pausamos el <audio>)
  if (bgGain.gain.value > 0){
    bgGain.gain.value = 0;
    btnSonido.textContent = '🔈';
  } else {
    bgGain.gain.value = 0.7;
    btnSonido.textContent = '🔊';
  }
});

// ====== Navegación entre pantallas ======
function siguientePantalla(id){
  document.querySelectorAll('.pantalla').forEach(p=>{
    p.classList.remove('visible'); p.classList.add('oculto');
  });
  const s = document.getElementById(id);
  if (s){ s.classList.remove('oculto'); s.classList.add('visible'); }
  iniciarMusica(); // sigue siendo válido
}
window.siguientePantalla = siguientePantalla;

// ====== Scroll a la pregunta final ======
function irAPregunta(){
  const cont = document.getElementById('cartaScroll');
  const destino = document.getElementById('preguntaFinal');
  if (cont && destino) cont.scrollTo({ top: destino.offsetTop - 8, behavior:'smooth' });
}
window.irAPregunta = irAPregunta;

// ====== Resultado final ======
function respuestaFinal(opcion){
  if (opcion === 'si'){
    siguientePantalla('pantalla6');
    animacionLoca();
  } else {
    siguientePantalla('pantalla7');
  }
}
window.respuestaFinal = respuestaFinal;

// ====== Animación celebración ======
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

// ====== Vídeos dentro de la carta (mezclados) ======
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
    v.muted  = true; // el elemento en mute; suena por WebAudio cuando lo hacemos audible
  });

  function setupVideoNodes(){
    ensureAudioCtx();
    vids.forEach(v=>{
      if (videoGains.has(v)) return; // ya montado
      const src  = audioCtx.createMediaElementSource(v);
      const gain = audioCtx.createGain();
      gain.gain.value = 0;           // empieza silenciado
      src.connect(gain).connect(audioCtx.destination);
      videoGains.set(v, gain);
    });
  }
  // Montamos nodos al primer gesto del usuario (y también si ya está la música en marcha)
  document.addEventListener('click', setupVideoNodes, { once:true });
  document.addEventListener('touchstart', setupVideoNodes, { once:true });
  if (musicaIniciada) setupVideoNodes();

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const v = entry.target;
      const entrando = entry.isIntersecting && entry.intersectionRatio >= 0.6;
      const saliendo = !entry.isIntersecting || entry.intersectionRatio < 0.25;

      const gain = videoGains.get(v);
      if (!gain) return; // aún no se inicializó

      if (entrando){
        v.play().catch(()=>{});
        // --- (4) AUTOPULSO del botón de sonido 1 sola vez cuando empieza a sonar un vídeo ---
        if (musicaIniciada && bgGain && bgGain.gain.value > 0 && !v.__autoPulseDone){
          // esto equivale a "mutear" música pulsando el botón (icono incluido)
          btnSonido?.click();
          v.__autoPulseDone = true;
        }
        // subimos la ganancia del vídeo (0.25s suavizado)
        const t = audioCtx.currentTime;
        gain.gain.cancelScheduledValues(t);
        gain.gain.setValueAtTime(gain.gain.value, t);
        gain.gain.linearRampToValueAtTime(1.0, t + 0.25);
      }
      if (saliendo){
        const t = audioCtx.currentTime;
        gain.gain.cancelScheduledValues(t);
        gain.gain.setValueAtTime(gain.gain.value, t);
        gain.gain.linearRampToValueAtTime(0.0, t + 0.2);
        v.pause();
        // permitimos que vuelva a "autopulsar" la próxima vez que entre
        v.__autoPulseDone = false;
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
