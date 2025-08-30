/* ========== 1) VIDEO DE FONDO: autoplay + crossfade sin corte ========== */
const bgA = document.getElementById('videoFondo');
let bgB, activo = 'A';
const FADE_S = 0.6;       // duración del fundido
const MARGEN_S = 0.22;    // empezamos el fundido un pelín antes del final

function preparaBg(v){
  if (!v) return;
  v.muted = true; v.setAttribute('muted','');
  v.autoplay = true; v.loop = false;         // bucle manual
  v.playsInline = true; v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline','');
  v.preload = 'auto';
  v.addEventListener('loadedmetadata', ()=> v.play().catch(()=>{}), { once:true });
}

function ensurePlay(v){ v && v.play && v.play().catch(()=>{}); }

function initBgSeamless(){
  if (!bgA) return;
  // clon para el crossfade
  bgB = bgA.cloneNode(true);
  bgB.id = 'videoFondoClone';
  bgB.style.opacity = '0';
  bgA.parentNode.insertBefore(bgB, bgA.nextSibling);

  preparaBg(bgA); preparaBg(bgB);
  ensurePlay(bgA); ensurePlay(bgB);

  const tick = ()=>{
    const v = (activo==='A'?bgA:bgB);
    if (v && isFinite(v.duration) && v.duration>0){
      const resto = v.duration - v.currentTime;
      if (resto <= (FADE_S + MARGEN_S)){
        const next = (activo==='A'?bgB:bgA);
        try{ next.currentTime = 0.001; }catch(_){}
        ensurePlay(next);
        next.style.opacity = '1';
        v.style.opacity = '0';
        setTimeout(()=>{
          try{ v.pause(); }catch(_){}
          activo = (activo==='A'?'B':'A');
        }, FADE_S*1000 + 40);
      }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function kickBgAutoplay(){
  ensurePlay(bgA);
  ensurePlay(bgB);
}

document.addEventListener('DOMContentLoaded', ()=>{ initBgSeamless(); kickBgAutoplay(); });
window.addEventListener('load', kickBgAutoplay);
document.addEventListener('visibilitychange', ()=>{ if (!document.hidden) kickBgAutoplay(); });
['pointerdown','touchstart','click'].forEach(ev =>
  document.addEventListener(ev, kickBgAutoplay, { once:true })
);


/* ========== 2) MÚSICA DE FONDO (fondo.mp3) ========== */
const musica = document.getElementById('musicaFondo');
const btnSonido = document.getElementById('btnSonido');
let userInteracted = false;
let pausadaPorVideo = false;
let videosAudibles = 0;

function iconoSonido(){
  if (!btnSonido || !musica) return;
  btnSonido.textContent = (!musica.paused) ? '🔊' : '🔈';
}
function startMusic(){
  if (!musica) return;
  musica.loop = true;
  musica.play().then(iconoSonido).catch(()=>{ /* móvil la inicia tras el primer gesto */ });
}
function stopMusic(){ if (musica){ musica.pause(); iconoSonido(); } }

document.addEventListener('DOMContentLoaded', ()=>{ setTimeout(startMusic, 120); });
window.addEventListener('load', startMusic);
['pointerdown','touchstart','click','keydown'].forEach(ev=>{
  document.addEventListener(ev, ()=>{ userInteracted=true; startMusic(); }, { once:true });
});

btnSonido?.addEventListener('click', ()=>{
  if (!musica) return;
  if (musica.paused){ startMusic(); pausadaPorVideo = false; }
  else { stopMusic(); pausadaPorVideo = false; }
});
musica?.addEventListener('play',  iconoSonido);
musica?.addEventListener('pause', iconoSonido);


/* ========== 3) NAVEGACIÓN / UI (igual que tenías) ========== */
function siguientePantalla(id){
  document.querySelectorAll('.pantalla').forEach(p=>{
    p.classList.remove('visible'); p.classList.add('oculto');
  });
  const s = document.getElementById(id);
  if (s){ s.classList.remove('oculto'); s.classList.add('visible'); }
  startMusic(); // por si aún no sonaba y este fue el 1er gesto
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


/* ========== 4) VÍDEOS DE LA CARTA: sonido del vídeo pausa música y la reanuda al salir ========== */
let audioCtx;
const videoGains = new WeakMap();

function ensureCtx(){
  if (!audioCtx){
    const Ctx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new Ctx();
  }
}

function prepararVideosCarta(){
  const cont = document.getElementById('cartaScroll');
  if (!cont) return;
  const vids = cont.querySelectorAll('video');
  if (!vids.length) return;

  vids.forEach(v=>{
    v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline',
