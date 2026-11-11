// La muñeca de alebri, dibujada en SVG con su estilo: pelo largo negro con
// mechas de sus tres colores, ojos almendrados, sonrisa ladeada y camisa blanca
// con cuello en V, rodeada de los personajes de colores de su banner (cada
// color es un área). Sube desde abajo, saluda, sigue el puntero con los ojos y
// vuelve a saludar al pasar el mouse o al tocarla.
(function () {
  const arte = document.querySelector('.hero-arte');
  if (!arte) return;
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T = 'stroke="#111" stroke-linecap="round" stroke-linejoin="round"';

  // Doble trazo (contorno negro + relleno) para brazos y dedos, como en su dibujo.
  const extremidad = (d, ancho, color) => `<path d="${d}" fill="none" ${T} stroke-width="${ancho + 13}"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${ancho}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const dedos = ['M 478 300 L 470 262', 'M 490 296 L 490 254', 'M 502 298 L 510 258', 'M 512 308 L 526 276', 'M 468 322 L 446 306'];

  const amigos = `
    <g class="amigo amigo--cine" style="--i:0">
      <path d="M 26 600 C 30 498 64 448 110 446 C 156 448 190 498 194 600" fill="none" stroke="var(--rosado)" stroke-width="8" stroke-linecap="round"/>
      <path d="M 90 446 L 110 474 L 130 446" fill="none" stroke="var(--rosado)" stroke-width="7" stroke-linejoin="round"/>
      <path d="M 94 392 L 92 446 M 126 392 L 128 446" stroke="var(--rosado)" stroke-width="7" stroke-linecap="round"/>
      <circle cx="110" cy="330" r="64" fill="var(--rosado)"/>
      <path d="M 44 330 C 42 236 178 236 176 330" fill="none" stroke="var(--rosado)" stroke-width="12" stroke-linecap="round"/>
      <ellipse cx="44" cy="342" rx="18" ry="30" fill="var(--rosado)"/><ellipse cx="176" cy="342" rx="18" ry="30" fill="var(--rosado)"/>
      <path d="M 78 300 C 92 284 116 280 134 286" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
    </g>
    <g class="amigo amigo--animacion" style="--i:1">
      <circle cx="150" cy="590" r="62" fill="var(--amarillo)"/>
      <path d="M 86 576 C 70 576 70 604 88 604 M 214 576 C 230 576 230 604 212 604" fill="none" stroke="var(--amarillo)" stroke-width="8" stroke-linecap="round"/>
    </g>
    <g class="amigo amigo--diseno" style="--i:2">
      <path d="M 520 600 C 524 530 548 500 584 498 C 620 500 640 530 646 600" fill="none" stroke="var(--azul)" stroke-width="8" stroke-linecap="round"/>
      <circle cx="584" cy="430" r="56" fill="var(--azul)"/>
      <circle cx="596" cy="360" r="26" fill="var(--azul)"/>
      <path d="M 532 440 C 520 440 520 462 534 462" fill="none" stroke="var(--azul)" stroke-width="7" stroke-linecap="round"/>
      <path d="M 560 404 C 572 394 590 392 604 398" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
    </g>
    <g class="amigo amigo--animacion" style="--i:3">
      <path d="M 572 70 C 530 70 508 104 508 144 C 508 196 498 236 492 280 L 652 280 C 646 236 636 196 636 144 C 636 104 614 70 572 70 Z" fill="var(--amarillo)"/>
      <path d="M 520 170 C 506 170 506 194 522 196" fill="none" stroke="var(--amarillo)" stroke-width="7" stroke-linecap="round"/>
    </g>
    <g class="amigo amigo--diseno" style="--i:4">
      <circle cx="196" cy="96" r="34" fill="none" stroke="var(--azul)" stroke-width="7"/>
      <path d="M 160 92 C 158 50 230 44 234 88 C 220 72 180 70 160 92 Z" fill="var(--azul)"/>
      <path d="M 196 130 L 196 170 M 150 216 C 156 186 172 172 196 170 C 220 172 236 186 242 216" fill="none" stroke="var(--azul)" stroke-width="7" stroke-linecap="round"/>
    </g>
    <g class="amigo amigo--cine" style="--i:5">
      <path d="M 404 16 C 436 6 470 18 474 44 C 476 72 444 90 428 122 C 414 96 396 68 396 44 C 396 30 398 22 404 16 Z" fill="var(--rosado)"/>
    </g>`;

  const muneca = `
    <svg class="muneca-vp" x="30" y="-36" width="600" height="640" viewBox="0 0 600 640" overflow="hidden">
      <defs>
        <clipPath id="ojo-i"><path d="M 250 244 Q 268 228 290 242 Q 270 257 250 244 Z"/></clipPath>
        <clipPath id="ojo-d"><path d="M 310 242 Q 332 228 350 244 Q 330 257 310 242 Z"/></clipPath>
      </defs>
      <g class="muneca" role="button" tabindex="0" aria-label="Saludar a alebri">
        <g class="m-sube"><g class="m-respira">
          <g class="m-cabeza">
            <path d="M 300 90 C 230 90 186 138 180 206 C 174 270 182 336 176 404 C 170 470 162 530 168 660 L 432 660 C 438 530 430 470 424 404 C 418 336 426 270 420 206 C 414 138 370 90 300 90 Z" fill="#111"/>
            <path d="M 198 252 C 194 280 194 302 196 322" stroke="var(--rosado)" stroke-width="7" stroke-linecap="round"/>
            <path d="M 192 446 C 190 466 190 486 192 502" stroke="var(--azul)" stroke-width="7" stroke-linecap="round"/>
            <path d="M 398 178 C 408 196 412 214 412 234" stroke="var(--amarillo)" stroke-width="7" stroke-linecap="round"/>
            <path d="M 408 478 C 410 498 410 520 408 540" stroke="var(--rosado)" stroke-width="7" stroke-linecap="round"/>
          </g>
          <path d="M 278 350 L 278 404 L 322 404 L 322 350 Z" fill="var(--piel)"/>
          <path d="M 210 418 C 236 398 266 394 300 394 C 334 394 364 398 390 418 C 408 454 414 540 416 660 L 184 660 C 186 540 192 454 210 418 Z" fill="#fff" stroke="#111" stroke-width="7" stroke-linejoin="round"/>
          <path d="M 262 398 L 300 452 L 338 398 Z" fill="var(--piel)"/>
          <path d="M 256 396 L 300 456 L 344 396" fill="none" ${T} stroke-width="7"/>
          <path d="M 278 352 L 278 398 M 322 352 L 322 398" ${T} stroke-width="6"/>
          <g class="m-cara">
            <path d="M 234 206 C 234 166 262 146 300 146 C 338 146 366 166 366 206 L 364 270 C 362 322 338 362 300 370 C 262 362 238 322 236 270 Z" fill="var(--piel)" ${T} stroke-width="7"/>
            <path d="M 300 90 C 368 90 414 136 420 206 L 372 216 C 366 178 344 158 314 152 C 302 162 288 160 276 154 C 252 162 238 182 232 216 L 180 206 C 186 136 232 90 300 90 Z" fill="#111"/>
            <path d="M 372 214 C 380 250 378 290 368 318 M 232 214 C 224 250 226 290 236 318" fill="none" stroke="#111" stroke-width="16" stroke-linecap="round"/>
            <g class="m-cejas"><path d="M 252 218 Q 266 209 284 214 M 316 214 Q 334 209 348 218" fill="none" ${T} stroke-width="5"/></g>
            <g class="m-ojos">
              <path d="M 250 244 Q 268 228 290 242 Q 270 257 250 244 Z M 310 242 Q 332 228 350 244 Q 330 257 310 242 Z" fill="#fff"/>
              <g clip-path="url(#ojo-i)"><g class="m-pupila"><circle cx="263" cy="244" r="8" fill="#111"/></g></g>
              <g clip-path="url(#ojo-d)"><g class="m-pupila"><circle cx="323" cy="244" r="8" fill="#111"/></g></g>
              <path d="M 250 244 Q 268 228 290 242 Q 270 257 250 244 Z M 310 242 Q 332 228 350 244 Q 330 257 310 242 Z" fill="none" ${T} stroke-width="4.5"/>
              <path d="M 246 243 Q 268 224 293 240 M 307 240 Q 332 224 354 243" fill="none" ${T} stroke-width="6.5"/>
            </g>
            <path class="m-feliz" d="M 252 248 Q 268 232 286 248 M 314 248 Q 330 232 348 248" fill="none" ${T} stroke-width="5.5"/>
            <path d="M 298 262 C 292 278 290 292 298 297" fill="none" ${T} stroke-width="5"/>
            <circle cx="309" cy="297" r="3.4" fill="#111"/>
            <path class="m-boca" d="M 300 326 Q 318 335 334 318" fill="none" ${T} stroke-width="5.5"/>
            <path class="m-risa" d="M 290 322 Q 314 348 338 316 Q 314 332 290 322 Z" fill="#111" ${T} stroke-width="4"/>
          </g>
          <g class="m-brazo">
            <g class="m-antebrazo">
              ${extremidad('M 452 438 L 482 352', 28, 'var(--piel)')}
              <g class="m-mano">
                <ellipse cx="490" cy="318" rx="30" ry="34" fill="#111" transform="rotate(10 490 318)"/>
                ${dedos.map((d) => `<path d="${d}" stroke="#111" stroke-width="23" stroke-linecap="round"/>`).join('')}
                <ellipse cx="490" cy="318" rx="24" ry="28" fill="var(--piel)" transform="rotate(10 490 318)"/>
                ${dedos.map((d) => `<path d="${d}" stroke="var(--piel)" stroke-width="12" stroke-linecap="round"/>`).join('')}
              </g>
            </g>
            ${extremidad('M 384 430 L 452 438', 36, '#fff')}
          </g>
        </g></g>
      </g>
    </svg>`;

  const globo = `
    <g class="globo" aria-hidden="true">
      <path d="M 404 52 h 214 a 30 30 0 0 1 30 30 v 4 a 30 30 0 0 1 -30 30 h -150 l -34 26 l 6 -26 h -36 a 30 30 0 0 1 -30 -30 v -4 a 30 30 0 0 1 30 -30 Z" fill="#fff" ${T} stroke-width="5"/>
      <text x="513" y="94" text-anchor="middle">¡Hola! Soy alebri</text>
    </g>`;

  arte.insertAdjacentHTML('beforeend',
    `<svg class="escena" viewBox="0 0 660 600" role="img" aria-label="La muñeca de alebri, en negro, rodeada de personajes azules, amarillos y rosados">${amigos}${muneca}${globo}</svg>`
    + '<button class="sello" type="button" aria-label="Repetir la entrada"><img src="img/marca/firma-negra.png" alt="" width="104" height="62" /></button>');

  const escena = arte.querySelector('.escena');
  const figura = arte.querySelector('.muneca');
  const cabeza = arte.querySelector('.m-cara');
  let saludando = false;
  let espera = 0;

  function saludar() {
    if (saludando || reducido) return;
    saludando = true;
    figura.classList.add('saludando');
    escena.classList.add('con-globo');
    clearTimeout(espera);
    espera = setTimeout(() => {
      figura.classList.remove('saludando');
      escena.classList.remove('con-globo');
      saludando = false;
    }, 2300);
  }

  // Los ojos y la cabeza siguen al puntero.
  let cuadro = 0;
  window.addEventListener('pointermove', (e) => {
    if (reducido || e.pointerType === 'touch') return;
    cancelAnimationFrame(cuadro);
    cuadro = requestAnimationFrame(() => {
      const b = cabeza.getBoundingClientRect();
      const dx = e.clientX - (b.left + b.width / 2);
      const dy = e.clientY - (b.top + b.height / 2);
      const k = (v, d) => Math.max(-1, Math.min(1, v / d));
      escena.style.setProperty('--ex', (k(dx, 300) * 7).toFixed(2));
      escena.style.setProperty('--ey', (k(dy, 300) * 3).toFixed(2));
      escena.style.setProperty('--giro', (k(dx, 800) * 5).toFixed(2));
    });
  }, { passive: true });

  figura.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch' && !arte.closest('.hero').classList.contains('entrando')) saludar(); });
  figura.addEventListener('click', saludar);
  figura.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); saludar(); } });

  window.ALEBRI_MUNECA = { saludar };
})();
