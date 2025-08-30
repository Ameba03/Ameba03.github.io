// ====== VÍDEO DE FONDO: autoplay en móvil ======
const bgVideo = document.getElementById('videoFondo');
function playVideoSeguro(){
  if (!bgVideo) return;
  bgVideo.setAttribute('muted','');
  bgVideo.muted = false;
  bgVideo.loop = true;
  bgVideo.play().catch(()=>{});
}
document.addEventListener('DOMContentLoaded', playVideoSeguro);
window.addEventListener('load', playVideoSeguro);
document.addEventListener('visibilitychange', ()=>{ if (!document.hidden) playVideoSeguro(); });
['touchstart','click'].forEach(ev => document.addEventListener(ev, playVideoSeguro, { once:true }));

// ====== MÚSICA DE FONDO ======
const audioEl   = document.getElementById('musicaFondo');
const btnSonido = document.getElementById('btnSonido');
let musicaIniciada = false;                // empieza en false (se inicia al cargar/primer gesto)

// ---- Web Audio MIX ----
let audioCtx, bgGain;
const videoGains = new Map();  // <video> -> GainNode

function ensureAudioCtx(){
  if (audioCtx) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  audioCtx = new Ctx();

  // Conectar la música de fondo al contexto
  const bgSrc = audioCtx.createMediaElementSource(audioEl);
  bgGain = audioCtx.createGain();
  bgGain.gain.value = 0.7;           // volumen por defecto
  bgSrc.connect(bgGain).connect(audioCtx.destination);

  // Silenciar el <audio> nativo para evitar duplicados/limitaciones de iOS
  if (audioEl){
    audioEl.muted = true;
    audioEl.volume = 0;
    audioEl.setAttribute('playsinline','');
    audioEl.setAttribute('webkit-playsinline','');
    audioEl.setAttribute('disableRemotePlayback','');
  }
}

function setBtnIcon(){
  if (!btnSonido) return;
  // si la ganancia está a 0 -> icono silencioso, si no, icono sonido
  const isOn = bgGain ? bgGain.gain.value > 0 : (!audioEl.paused);
  btnSonido.textContent = isOn ? '🔊' : '🔈';
}

async function iniciarMusica(){
  ensureAudioCtx();
  audioEl.loop = true;

  try { if (audioCtx.state === 'suspended') await audioCtx.resume(); } catch(_) {}

  // Si ya estamos en buffer mode, asegúrate de que hay source activo
  if (bgBufferMode){
    if (!bgSourceNode) crearYArrancarBgSource();
    musicaIniciada = true;
    setBtnIcon();
    return;
  }

  try {
    await audioEl.play();
    musicaIniciada = true;
    setBtnIcon();
  } catch(e){
    // En móvil puede requerir gesto del usuario; lo reintentamos en el primer tap/click/tecla
  }
}

// === MODO BUFFER: si iOS/Safari pausa el <audio> al reproducir <video>, usamos un loop WebAudio ===
let bgBuffer = null;        // AudioBuffer decodificado de la música
let bgSourceNode = null;    // BufferSource activo
let bgBufferMode = false;   // true cuando estamos usando el modo buffer
let bgDecodePromise = null; // promesa para no decodificar dos veces

function crearYArrancarBgSource(offset=0){
  if (!bgBuffer) return;
  ensureAudioCtx();

  if (bgSourceNode){
    try { bgSourceNode.stop(); } catch(_){}
    try { bgSourceNode.disconnect(); } catch(_){}
    bgSourceNode = null;
  }

  bgSourceNode = audioCtx.createBufferSource();
  bgSourceNode.buffer = bgBuffer;
  bgSourceNode.loop = true;
  bgSourceNode.connect(bgGain);  // usa el MISMO gain que tu botón
  const t = audioCtx.currentTime + 0.01;
  try { bgSourceNode.start(t, offset); } catch(_){}
}

async function activarBufferSiConviene(){
  // Si ya estamos en buffer o no hay audio, nada que hacer
  if (bgBufferMode || !audioEl) return;

  try{
    ensureAudioCtx();

    if (!bgDecodePromise){
      const url = audioEl.currentSrc || audioEl.src;
      if (!url) return;
      bgDecodePromise = fetch(url, { credentials: 'same-origin' })
        .then(r => r.arrayBuffer())
        .then(ab => new Promise((res, rej) => audioCtx.decodeAudioData(ab, res, rej)));
    }
    bgBuffer = await bgDecodePromise;

    // Pausamos (y ya estaba en mute) el <audio> nativo; a partir de aquí suena via WebAudio puro
    try { audioEl.pause(); } catch(_){}
    crearYArrancarBgSource();
    bgBufferMode = true;
    musicaIniciada = true;
    setBtnIcon();
  } catch(e){
    // Si falla (CORS/decodificación), seguimos con el <audio> + antipausa
  }
}

function algunVideoReproduciendo(){
  const vids = document.querySelectorAll('video');
  for (const v of vids){
    if (!v.paused && !v.ended && v.readyState > 2) return true;
  }
  return false;
}

// Relanza música si algo la pausa; si vemos que la pausa viene por un <video>, migramos a buffer
function reanudarOMigrar(force=false){
  ensureAudioCtx();
  try { if (audioCtx?.state === 'suspended') audioCtx.resume(); } catch(_){}

  // En buffer mode el loop no se "pausa"
  if (bgBufferMode){
    if (!bgSourceNode) crearYArrancarBgSource();
    return;
  }

  if ((audioEl?.paused) || force){
    if (algunVideoReproduciendo()){
      activarBufferSiConviene();
    } else {
      audioEl.play().catch(()=>{});
    }
  }
}

// === BLOQUE ANTI-PAUSA: la música NUNCA se detiene salvo por tu botón ===
function armarAntipausa(){
  if (!audioEl) return;

  const relanzar = ()=> reanudarOMigrar();

  // Si el navegador detiene el <audio> por lo que sea, lo relanzamos/migramos.
  ['pause','ended','stalled','suspend','waiting','emptied','error','abort'].forEach(ev=>{
    audioEl.addEventListener(ev, relanzar);
  });

  // Si cualquier <video> empieza a reproducirse, nos aseguramos de que el mp3 siga sonando.
  document.addEventListener('play', (e)=>{
    const t = e.target;
    if (t && t.tagName === 'VIDEO'){
      // Deja al navegador hacer “lo suyo” y luego reanuda/migra
      setTimeout(reanudarOMigrar, 0);
    }
  }, true);

  // Al volver de background o recuperar el foco, vuelve a sonar.
  window.addEventListener('pageshow', relanzar);
  window.addEventListener('focus', relanzar);
}
document.addEventListener('DOMContentLoaded', armarAntipausa);

// Intentos de inicio y desbloqueo por primer gesto global
document.addEventListener('DOMContentLoaded', ()=> setTimeout(iniciarMusica, 80));
window.addEventListener('load', iniciarMusica);
['pointerdown','touchstart','click','keydown'].forEach(ev=>{
  document.addEventListener(ev, iniciarMusica, { once:true });
});

btnSonido?.addEventListener('click', ()=>{
  ensureAudioCtx();
  if (!musicaIniciada){
    iniciarMusica();
    return;
  }
  // mute/unmute moviendo la ganancia (no pausamos el <audio> / buffer)
  if (bgGain.gain.value > 0){
    bgGain.gain.value = 0;
  } else {
    bgGain.gain.value = 0.7;
    // Si estaba forzado en pausa por el SO, reanuda/migra
    reanudarOMigrar(true);
  }
  setBtnIcon();
});

// ====== Navegación entre pantallas ======
function siguientePantalla(id){
  document.querySelectorAll('.pantalla').forEach(p=>{
    p.classList.remove('visible'); p.classList.add('oculto');
  });
  const s = document.getElementById(id);
  if (s){ s.classList.remove('oculto'); s.classList.add('visible'); }
  iniciarMusica();     // cualquier toque/cambio de pantalla sirve para arrancar la música
  reanudarOMigrar();   // y aseguramos que no se haya parado
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

// ====== Vídeos dentro de la carta (mezclados, no pausan el mp3) ======
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
    v.muted  = true;             // el elemento está en mute para que Safari no “pause” otros
  });

  // Crear nodos de audio para cada vídeo al primer gesto del usuario
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
  document.addEventListener('click', setupVideoNodes, { once:true });
  document.addEventListener('touchstart', setupVideoNodes, { once:true });

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const v = entry.target;
      const entrando = entry.isIntersecting && entry.intersectionRatio >= 0.6;
      const saliendo = !entry.isIntersecting || entry.intersectionRatio < 0.25;

      const gain = videoGains.get(v);
      if (!gain) return; // aún no se inicializó (antes del primer toque)

      if (entrando){
        v.play().catch(()=>{});
        // subimos la ganancia del vídeo (0.25s suavizado)
        const t = audioCtx.currentTime;
        gain.gain.cancelScheduledValues(t);
        gain.gain.setValueAtTime(gain.gain.value, t);
        gain.gain.linearRampToValueAtTime(1.0, t + 0.25);
        reanudarOMigrar(); // por si el SO intenta pausar la música
      }
      if (saliendo){
        const t = audioCtx.currentTime;
        gain.gain.cancelScheduledValues(t);
        gain.gain.setValueAtTime(gain.gain.value, t);
        gain.gain.linearRampToValueAtTime(0.0, t + 0.2);
        v.pause();
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
  // si volvemos a la pestaña y la música no suena, relanza/migra
  if (audioEl && audioEl.paused) iniciarMusica();
  reanudarOMigrar();
});
