/* 🎥 Fondo de vídeo */
#videoFondo {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  z-index: -1;
  background: black;
  pointer-events: none;
}

/* 💻 Layout base */
:root {
  --negro: rgba(0,0,0,.7);
  --blanco: #fff;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  height: 100%;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  color: var(--blanco);
  overflow: hidden; /* no scroll global */
}

#contenido {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
}

/* 💬 Tarjetas */
.card {
  background: var(--negro);
  backdrop-filter: blur(2px);
  padding: 22px 26px;
  border-radius: 14px;
  max-width: 900px;
  width: min(92vw, 900px);
  box-shadow: 0 10px 30px rgba(0,0,0,.35);
}

.card p { font-size: 1.15rem; margin: 0 0 16px; }

.primario, .secundario, .card button {
  padding: 12px 22px;
  font-size: 1rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform .08s ease, opacity .2s ease;
}
.primario { background: var(--blanco); color: #111; }
.secundario { background: transparent; color: var(--blanco); outline: 2px solid var(--blanco); }
.grande { font-size: 1.15rem; padding: 14px 26px; }
.card button:hover { transform: translateY(-1px); opacity: .95; }

/* 👻 Oculto/visible */
.pantalla { display: none; }
.visible { display: block; }
.oculto { display: none; }

/* 📝 Carta */
.carta header h2 { margin: 0 0 6px; }
.carta header small { opacity: .8; }

.carta .scroll {
  margin-top: 10px;
  max-height: 68vh;       /* ← hace scroll dentro de la carta */
  overflow-y: auto;
  text-align: left;
  padding-right: 6px;
}

.carta .scroll p { line-height: 1.55; }

.carta .scroll::-webkit-scrollbar { width: 8px; }
.carta .scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.25); border-radius: 8px; }

.galeria2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 14px 0;
}
.foto-sola { margin: 14px 0; text-align: center; }

.carta img {
  width: 100%;
  height: auto;
  border-radius: 10px;
  display: block;
}

.carta figcaption {
  text-align: center;
  opacity: .8;
  font-size: .9rem;
  margin-top: 6px;
}

/* Pregunta final dentro de la carta */
.pregunta-final {
  margin: 28px 0 6px;
  text-align: center;
  padding-top: 8px;
  border-top: 1px solid rgba(255,255,255,.15);
}
.pregunta-final h2 { margin: 6px 0 14px; }
.pregunta-final .acciones { display: flex; gap: 12px; justify-content: center; }

/* 🎇 Animación celebración (confeti + corazones) */
#confeti, .confeti, .heart {
  position: fixed;
  pointer-events: none;
  z-index: 5;
}

@keyframes caer {
  to { transform: translateY(105vh) rotate(720deg); opacity: 1; }
}
@keyframes subir {
  to { transform: translateY(-110vh) scale(1.2); opacity: 0; }
}

.confeti {
  top: -10vh;
  width: 10px; height: 14px;
  background: white;
  opacity: .9;
  border-radius: 2px;
  animation: caer linear forwards;
}

.heart {
  bottom: -8vh;
  font-size: 22px;
  animation: subir 4s ease-in forwards;
}

/* Explosión/zoom de la tarjeta al decir que sí */
.animacion-cohetes { animation: pop 0.8s ease forwards; }
.grande { font-size: 1.3rem; }
@keyframes pop {
  0% { transform: scale(0.95); }
  60% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* 🔊 Botón de sonido */
.sonido {
  position: fixed;
  top: 14px; right: 14px;
  z-index: 2;
  background: var(--negro);
  color: var(--blanco);
  border: 1px solid rgba(255,255,255,.35);
  border-radius: 999px;
  padding: 8px 12px;
  line-height: 1;
}

/* 📱 Responsive */
@media (max-width: 768px) {
  .card { padding: 20px 18px; }
  .galeria2 { grid-template-columns: 1fr; }
  .pregunta-final .acciones { flex-direction: column; }
}
