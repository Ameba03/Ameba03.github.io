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
let musicaIniciada = false; // empieza en false

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

  // Silenciar el <audio> nativo (sonará via WebAudio)
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
  const isOn = bgGain ? bgGain.gain.value > 0 : (!audioEl.paused);
  btnSonido.textContent = isOn ? '🔊' : '🔈';
}

async function iniciarMusica(){
  ensureAudioCtx();
  audioEl.loop = true;
  try { if (audioCtx.state === 'suspended') await audioCtx.resume(); } catch(_) {}

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
  } catch(e){ /* móvil puede requerir gesto */ }
}

// === MODO BUFFER: si iOS/Safari pausa el <audio> al reproducir <video>, usamos un loop WebAudio ===
let bgBuffer = null;
let bgSourceNode = null;
let bgBufferMode = false;
let bgDecodePromise = null;

function crearYArrancarBgSource(offset=0){
  if (!bgBuffer) return;
  ensureAudioCtx();
  if (bgSourceNode){
    try { bgSourceNode.stop(); } catch(_){}
    try { bgSourceNode.disconnect(); } catch(_){}
  }
  bgSourceNode = audioCtx.createBufferSource();
  bgSourceNode.buffer = bgBuffer;
  bgSourceNode.loop = true;
  bgSourceNode.connect(bgGain);
  const t = audioCtx.currentTime + 0.01;
  try { bgSourceNode.start(t, offset); } catch(_){}
}

async function activarBufferSiConviene(){
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
    try { audioEl.pause(); } catch(_){}
    crearYArrancarBgSource();
    bgBufferMode = true;
    musicaIniciada = true;
    setBtnIcon();
  } catch(e){ /* si falla CORS/decoding seguimos con <audio> + antipausa */ }
}

function algunVideoReproduciendo(){
  const vids = document.querySelectorAll('video');
  for (const v of vids){
    if (!v.paused && !v.ended && v.readyState > 2) return true;
  }
  return false;
}

function reanudarOMigrar(force=false){
  ensureAudioCtx();
  try { if (audioCtx?.state === 'suspended') audioCtx.resume(); } catch(_){}
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
  ['pause','ended','stalled','suspend','waiting','emptied','error','abort'].forEach(ev=>{
    audioEl.addEventListener(ev, relanzar);
  });
  document.addEventListener('play', (e)=>{
    const t = e.target;
    if (t && t.tagName === 'VIDEO'){
      setTimeout(reanudarOMigrar, 0);
    }
  }, true);
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
  if (bgGain.gain.value > 0){
    bgGain.gain.value = 0;
  } else {
    bgGain.gain.value = 0.7;
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
  iniciarMusica();
  reanudarOMigrar();
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

// ====== Vídeos dentro de la carta: suenan al verse, se callan al salir ======
function prepararVideosCarta(){
  const cont = document.getElementById('cartaScroll');
  if (!cont) return;

  const vids = cont.querySelectorAll('video');
  if (!vids.length) return;

  // Configuración base de cada vídeo
  vids.forEach(v=>{
    v.setAttribute('playsinline','');
    v.setAttribute('webkit-playsinline','');
    v.loop   = true;
    v.preload = 'metadata';
    v.muted  = true; // el elemento queda muteado, el sonido va por WebAudio
  });

  // Conectar TODOS los vídeos a WebAudio de inmediato (sin esperar gesto)
  ensureAudioCtx();
  vids.forEach(v=>{
    if (videoGains.has(v)) return; // ya montado
    const src  = audioCtx.createMediaElementSource(v);
    const gain = audioCtx.createGain();
    gain.gain.value = 0;           // empieza silenciado
    src.connect(gain).connect(audioCtx.destination);
    videoGains.set(v, gain);
  });

  // Observer: hace fade-in del audio cuando se ven y fade-out al salir
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const v = entry.target;
      const entrando = entry.isIntersecting && entry.intersectionRatio >= 0.6;
      const saliendo = !entry.isIntersecting || entry.intersectionRatio < 0.25;

      const gain = videoGains.get(v);
      if (!gain) return;

      if (entrando){
        v.play().catch(()=>{});
        const t = audioCtx.currentTime;
        gain.gain.cancelScheduledValues(t);
        gain.gain.setValueAtTime(gain.gain.value, t);
        gain.gain.linearRampToValueAtTime(1.0, t + 0.25); // fade-in rápido
        reanudarOMigrar(); // asegura que la música no se corte
      }
      if (saliendo){
        const t = audioCtx.currentTime;
        gain.gain.cancelScheduledValues(t);
        gain.gain.setValueAtTime(gain.gain.value, t);
        gain.gain.linearRampToValueAtTime(0.0, t + 0.2);  // fade-out
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
  if (audioEl && audioEl.paused) iniciarMusica();
  reanudarOMigrar();
});
