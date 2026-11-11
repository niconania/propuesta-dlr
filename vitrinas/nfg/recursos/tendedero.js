// Tendedero de fotos: fotos instantáneas prendidas con ganchos a una cuerda, que se mecen con el movimiento.
// Dos formas con la misma física:
// - carrusel: una cuerda horizontal con comba. Se arrastra, o se mueve con las flechas y el teclado; la foto del
//   centro es la activa y la barra de abajo dice cuál es. Para galerías (las piezas de WuandaCrafts). Si una foto trae
//   «enlace», es un enlace de verdad: tocar la del centro abre su publicación (Juan, 29 oct 2026: «cuando le doy clic a las
//   polaroids no me lleva a Instagram»); tocar otra solo la trae al centro, y arrastrar no abre nada.
// - cortina: cuerdas verticales con fotos que se mecen cuando el puntero pasa por encima. Para columnas
//   angostas o un héroe; cada foto es un enlace (a su «enlace», si lo tiene).
// Idea adaptada de «Polaroid Line Carousel» (21st.dev), reescrita en JavaScript sin dependencias; los colores
// salen de las variables CSS de la marca. No hay reproducción automática, la brisa se apaga sola a los 5 s
// (WCAG 2.2.2) y con «reducir movimiento» las fotos quedan quietas.
(function () {
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)');
  const limitar = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (x) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x]));
  const dos = (n) => String(n).padStart(2, '0');
  const BRISA = 5000;
  // Medidas de la foto: tienen que coincidir con .t-papel, .t-imagen y .t-nota en estilos.css.
  const GANCHO = 10, BORDE = 9, NOTA = 44;
  const altoFoto = (ancho) => GANCHO + BORDE + (ancho - 2 * BORDE) * 4 / 3 + NOTA;

  // Un paso de un resorte críticamente amortiguado hacia «objetivo».
  function resorte(x, v, objetivo, dt, k = 70) {
    const nv = v + (k * (objetivo - x) - 2 * Math.sqrt(k) * v) * dt;
    return [x + nv * dt, nv];
  }
  // Un paso del vaivén de una foto colgada (ángulo en radianes): el empuje la saca, la gravedad la devuelve a su
  // ángulo de reposo y el roce la frena.
  function mecer(a, w, reposo, empuje, dt) {
    const nw = w + (-38 * (a - reposo) - 4.2 * w + empuje) * dt;
    return [limitar(a + nw * dt, -0.6, 0.6), nw];
  }

  const papel = (it) => '<span class="t-papel"><span class="t-imagen">'
    + `<img src="${esc(it.img)}" alt="" loading="lazy" draggable="false"${it.encuadre ? ` style="object-position:${esc(it.encuadre)}"` : ''} />`
    + '</span><span class="t-nota"></span></span><span class="t-gancho" aria-hidden="true"></span>';

  // La animación corre solo mientras algo se mueve y el componente está en pantalla. paso(dt, ahora) devuelve
  // true para seguir; alAparecer() se llama cada vez que el componente entra en pantalla.
  function bucle(raiz, paso, alAparecer) {
    let raf = 0, antes = 0, visible = false;
    const cuadro = (ahora) => {
      raf = 0;
      if (!visible) return;
      const dt = limitar((ahora - antes) / 1000, 0.001, 0.033);
      antes = ahora;
      if (paso(dt, ahora)) raf = requestAnimationFrame(cuadro);
    };
    const despertar = () => {
      if (visible && !raf) { antes = performance.now(); raf = requestAnimationFrame(cuadro); }
    };
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) { alAparecer(); despertar(); }
    }).observe(raiz);
    return despertar;
  }

  /* ── Carrusel: cuerda horizontal ──
     op.items: [{ img, encuadre, alt, nota, titulo, texto, enlace }]   (enlace: publicación de Instagram, opcional)
     op.textos: { region, carrusel, anterior, siguiente, accion, anuncio(n, total, titulo), enlace(titulo) }
     op.accion: nombre del atributo data-* del botón de la barra (lleva el índice de la foto activa). */
  function carrusel(raiz, op) {
    const n = op.items.length;
    let items = op.items, textos = op.textos;
    raiz.classList.add('tendedero');
    raiz.setAttribute('role', 'region');
    raiz.tabIndex = 0;
    const flecha = (paso, d) => `<button class="t-flecha" type="button" data-paso="${paso}"><svg class="icono" viewBox="0 0 16 16" aria-hidden="true"><path d="${d}"/></svg></button>`;
    // Una foto con enlace es un <a> (se puede abrir con clic, con Enter o en otra pestaña); solo la activa se alcanza con el teclado.
    const foto = (it, i) => (it.enlace
      ? `<a class="t-foto" data-i="${i}" href="${esc(it.enlace)}" target="_blank" rel="noopener" draggable="false" tabindex="-1">${papel(it)}</a>`
      : `<div class="t-foto" data-i="${i}">${papel(it)}</div>`);
    raiz.innerHTML = '<div class="t-escena"><svg class="t-cuerda" aria-hidden="true"><path /></svg>'
      + items.map(foto).join('') + '</div>'
      + '<div class="caja t-barra"><div class="t-pie"><strong class="t-titulo"></strong><span class="t-texto"></span></div>'
      + '<span class="t-cuenta" aria-hidden="true"></span>' + flecha(-1, 'M10 3 5 8l5 5') + flecha(1, 'm6 3 5 5-5 5')
      + '<a class="t-enlace" target="_blank" rel="noopener" hidden><svg class="icono" aria-hidden="true"><use href="#i-instagram"/></svg></a>'
      + (op.accion ? `<button class="boton boton--acento boton--chico t-accion" type="button" data-${op.accion}="0"></button>` : '')
      + '</div><p class="t-anuncio" aria-live="polite"></p>';

    const $ = (s) => raiz.querySelector(s);
    const escena = $('.t-escena'), cuerda = $('.t-cuerda path'), boton = $('.t-accion'), enlace = $('.t-enlace');
    const fotos = [...raiz.querySelectorAll('.t-foto')];
    const flechas = [...raiz.querySelectorAll('.t-flecha')];
    const S = { off: 0, vel: 0, objetivo: 0, a: items.map(() => 0), w: items.map(() => 0) };
    let m = { w: 0, cw: 0, sep: 1, y0: 30, comba: 0 };
    let activa = -1, arrastre = null, brisaHasta = 0, hablar = false;
    let toque = null; // el último toque: { sigue } dice si el clic que viene después puede seguir el enlace de la foto

    function medir() {
      const w = escena.clientWidth;
      if (!w || w === m.w) return;
      const max = op.ancho || 250;
      const cw = Math.round(limitar(120 + w * 0.2, 140, max));
      const comba = Math.round(Math.min(op.comba ?? 44, w * 0.04));
      m = { w, cw, sep: cw * 1.12, y0: 30, comba };
      raiz.style.setProperty('--t-ancho', cw + 'px');
      escena.style.height = Math.round(m.y0 + comba + altoFoto(cw) + 36) + 'px';
      cuerda.setAttribute('d', `M0 ${m.y0} Q${w / 2} ${m.y0 + 2 * comba} ${w} ${m.y0}`);
      S.off = S.objetivo = Math.max(0, activa) * m.sep;
      S.vel = 0;
      colocar(0, performance.now());
    }

    // Coloca cada foto sobre la cuerda y la mece según cómo se mueve la cuerda. Devuelve true mientras algo se mueva.
    function colocar(dt, ahora) {
      const { w, cw, sep, y0, comba } = m;
      const quieto = reducir.matches;
      let linea = 0, moviendo = false; // linea: velocidad de las fotos en pantalla, px/s (+ = a la derecha)
      if (arrastre && arrastre.movido) {
        linea = arrastre.v * 1000;
        moviendo = true;
      } else if (dt) {
        const antes = S.off;
        [S.off, S.vel] = resorte(S.off, S.vel, S.objetivo, dt);
        linea = -(S.off - antes) / dt;
        if (Math.abs(S.off - S.objetivo) > 0.3 || Math.abs(S.vel) > 2) moviendo = true;
        else { S.off = S.objetivo; S.vel = 0; }
      }
      const brisa = !quieto && ahora < brisaHasta;
      const cerca = limitar(Math.round(S.off / sep), 0, n - 1);
      fotos.forEach((el, i) => {
        const x = w / 2 + i * sep - S.off;
        if (x < -cw || x > w + cw) { el.style.visibility = 'hidden'; return; }
        el.style.visibility = '';
        if (dt && !quieto) {
          const empuje = linea * 0.0034 + (brisa ? Math.sin(ahora / 650 + i * 1.7) * 0.8 : 0);
          [S.a[i], S.w[i]] = mecer(S.a[i], S.w[i], 0, empuje, dt);
          if (Math.abs(S.a[i]) > 0.001 || Math.abs(S.w[i]) > 0.004) moviendo = true;
          else if (!brisa) S.a[i] = S.w[i] = 0;
        }
        const t = limitar(x / w, 0, 1);
        const y = y0 + 4 * comba * t * (1 - t) - 7; // la cuerda pasa por el gancho
        el.style.transform = `translate(${(x - cw / 2).toFixed(1)}px,${y.toFixed(1)}px) rotate(${S.a[i].toFixed(4)}rad)`;
        el.style.zIndex = String(n - Math.abs(i - cerca));
      });
      if (cerca !== activa) marcar(cerca);
      return moviendo || brisa;
    }

    function marcar(i) {
      activa = i;
      fotos.forEach((el, j) => {
        el.dataset.activa = j === i ? '1' : '0';
        el.setAttribute('aria-hidden', String(j !== i));
        if (el.tagName === 'A') el.tabIndex = j === i ? 0 : -1;
      });
      flechas[0].setAttribute('aria-disabled', String(i === 0));
      flechas[1].setAttribute('aria-disabled', String(i === n - 1));
      pintarBarra(true);
    }
    function pintarBarra(animar) {
      const it = items[activa] || {};
      $('.t-titulo').textContent = it.titulo || '';
      $('.t-texto').textContent = it.texto || '';
      $('.t-cuenta').innerHTML = `<b>${dos(activa + 1)}</b> / ${dos(n)}`;
      if (boton) { boton.setAttribute('data-' + op.accion, String(activa)); boton.textContent = textos.accion; }
      // La publicación de Instagram de la foto activa (como en la galería de la agencia), si la tiene.
      enlace.hidden = !it.enlace;
      if (it.enlace) {
        const etiqueta = textos.enlace ? textos.enlace(it.titulo || '') : 'Instagram';
        enlace.href = it.enlace;
        enlace.setAttribute('aria-label', etiqueta);
        enlace.title = etiqueta;
      }
      // Solo se anuncia cuando la persona mueve el carrusel, no al cargar la página.
      if (hablar) $('.t-anuncio').textContent = textos.anuncio(activa + 1, n, it.titulo || '');
      if (animar) { const pie = $('.t-pie'); pie.classList.remove('t-entra'); void pie.offsetWidth; pie.classList.add('t-entra'); }
    }

    // Va a la foto i. Los clics seguidos se suman: cuentan desde el destino, no desde la foto que pasa por el centro.
    function ir(i) {
      S.objetivo = limitar(i, 0, n - 1) * m.sep;
      brisaHasta = performance.now() + BRISA;
      hablar = true;
      despertar();
    }
    const destino = () => Math.round(S.objetivo / m.sep);

    escena.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      arrastre = { id: e.pointerId, x: e.clientX, off: S.off, lx: e.clientX, lt: e.timeStamp, v: 0, movido: false };
    });
    escena.addEventListener('pointermove', (e) => {
      const d = arrastre;
      if (!d || e.pointerId !== d.id) return;
      const dx = e.clientX - d.x;
      if (!d.movido) {
        if (Math.abs(dx) < 6) return;
        d.movido = true;
        raiz.dataset.arrastre = '';
        escena.setPointerCapture(e.pointerId);
        hablar = true;
      }
      const dt = Math.max(1, e.timeStamp - d.lt);
      d.v = 0.7 * ((e.clientX - d.lx) / dt) + 0.3 * d.v; // px/ms
      d.lx = e.clientX;
      d.lt = e.timeStamp;
      const fin = (n - 1) * m.sep;
      let off = d.off - dx;
      if (off < 0) off *= 0.35; else if (off > fin) off = fin + (off - fin) * 0.35; // los extremos ceden con resistencia
      S.off = off;
      despertar();
    });
    const soltar = (e) => {
      const d = arrastre;
      if (!d || e.pointerId !== d.id) return;
      arrastre = null;
      if (d.movido) {
        delete raiz.dataset.arrastre;
        toque = { sigue: false }; // arrastrar no abre nada
        S.vel = -d.v * 1000;
        ir(Math.round((S.off - d.v * 180) / m.sep)); // el impulso decide hasta dónde llega
      } else if (e.type === 'pointerup') {
        const f = e.target.closest('.t-foto');
        if (f) {
          const i = Number(f.dataset.i);
          toque = { sigue: i === activa }; // la del centro abre su publicación; otra solo se trae al centro
          if (i !== activa) ir(i);
        }
      }
      setTimeout(() => { toque = null; }, 400); // si no llega un clic (se soltó fuera, o tras arrastrar), el toque no queda colgado
    };
    escena.addEventListener('pointerup', soltar);
    escena.addEventListener('pointercancel', soltar);
    raiz.addEventListener('keydown', (e) => {
      const i = { ArrowRight: destino() + 1, ArrowLeft: destino() - 1, Home: 0, End: n - 1 }[e.key];
      if (i === undefined) return;
      e.preventDefault();
      ir(i);
    });
    raiz.addEventListener('click', (e) => {
      const b = e.target.closest('.t-flecha');
      if (b && b.getAttribute('aria-disabled') !== 'true') ir(destino() + Number(b.dataset.paso));
      const f = e.target.closest('a.t-foto');
      if (f) {
        // Sin toque anterior (Enter en la foto activa) el enlace sigue; tras un arrastre, o en una foto que no era la activa, no.
        if (toque && !toque.sigue) e.preventDefault();
        toque = null;
      }
    });

    // Cambio de idioma: textos nuevos sin mover la cuerda.
    function actualizar(nuevos, nuevosTextos) {
      items = nuevos;
      textos = nuevosTextos;
      raiz.setAttribute('aria-roledescription', textos.carrusel);
      raiz.setAttribute('aria-label', textos.region);
      flechas[0].setAttribute('aria-label', textos.anterior);
      flechas[1].setAttribute('aria-label', textos.siguiente);
      fotos.forEach((el, i) => {
        el.querySelector('img').alt = items[i].alt || '';
        el.querySelector('.t-nota').textContent = items[i].nota || '';
        if (el.tagName === 'A') el.setAttribute('aria-label', textos.enlace ? textos.enlace(items[i].titulo || '') : 'Instagram');
      });
      if (activa >= 0) pintarBarra(false);
    }

    const despertar = bucle(raiz, colocar, () => { brisaHasta = performance.now() + BRISA; });
    new ResizeObserver(medir).observe(escena);
    actualizar(items, textos);
    medir();
    return { ir, actualizar, get activa() { return activa; } };
  }

  /* ── Cortina: cuerdas verticales ──
     op.items: [{ img, encuadre, nota, titulo, enlace }] · op.cuerdas: número, o función del ancho que lo devuelve
     op.textos: { ver(titulo) } · op.enlace: href de las fotos sin «enlace» propio · op.alElegir(i): al hacer clic en una de esas. */
  function cortina(raiz, op) {
    const n = op.items.length;
    let items = op.items;
    raiz.classList.add('cortina');
    raiz.innerHTML = '<svg class="t-cuerda" aria-hidden="true"></svg>'
      + items.map((it, i) => (it.enlace
        ? `<a class="t-foto" href="${esc(it.enlace)}" target="_blank" rel="noopener" draggable="false" data-i="${i}">${papel(it)}</a>`
        : `<a class="t-foto" href="${esc(op.enlace || '#')}" draggable="false" data-i="${i}">${papel(it)}</a>`)).join('');
    const svg = raiz.querySelector('.t-cuerda');
    const fotos = [...raiz.querySelectorAll('.t-foto')];
    // Cada foto cuelga un poco torcida, como quedan al prenderlas a mano.
    const reposo = items.map((_, i) => [-0.05, 0.035, -0.025, 0.05, -0.04, 0.03][i % 6]);
    const S = { a: reposo.slice(), w: items.map(() => 0) };
    let pos = [], m = { w: 0, cw: 0, h: 0 }, brisaHasta = 0, ultimo = null;

    function medir() {
      const w = raiz.clientWidth;
      if (!w || w === m.w) return;
      const cuerdas = Math.min(n, typeof op.cuerdas === 'function' ? op.cuerdas(w) : op.cuerdas || 1);
      const col = w / cuerdas;
      const cw = Math.round(limitar(col * 0.86, 100, op.ancho || 200));
      const h = altoFoto(cw);
      const sep = h + 22;
      const desfase = Math.round(sep * 0.3); // las cuerdas pares cuelgan más abajo, para que no quede en fila
      const filas = Math.ceil(n / cuerdas);
      pos = items.map((_, i) => {
        const fila = Math.floor(i / cuerdas);
        const enFila = fila === filas - 1 ? n - fila * cuerdas : cuerdas;
        const c = (i % cuerdas) + Math.floor((cuerdas - enFila) / 2); // la última fila incompleta va al centro
        return { c, x: col * (c + 0.5), y: 18 + fila * sep + (c % 2) * desfase };
      });
      m = { w, cw, h };
      raiz.style.setProperty('--t-ancho', cw + 'px');
      raiz.style.height = Math.round(Math.max(...pos.map((p) => p.y)) + h + 24) + 'px';
      svg.innerHTML = Array.from({ length: cuerdas }, (_, c) => {
        const ys = pos.filter((p) => p.c === c).map((p) => p.y);
        if (!ys.length) return '';
        const x = (col * (c + 0.5)).toFixed(1), fin = Math.max(...ys) + 8, curva = c % 2 ? 4 : -4;
        return `<path d="M${x} 0 Q${(+x + curva).toFixed(1)} ${(fin / 2).toFixed(1)} ${x} ${fin.toFixed(1)}"/><circle class="t-clavo" cx="${x}" cy="3" r="3.5"/>`;
      }).join('');
      colocar(0, performance.now());
    }

    function colocar(dt, ahora) {
      const quieto = reducir.matches;
      const brisa = !quieto && ahora < brisaHasta;
      let moviendo = false;
      fotos.forEach((el, i) => {
        const p = pos[i];
        if (dt && !quieto) {
          const empuje = brisa ? Math.sin(ahora / 800 + i * 2.1) * 0.7 : 0;
          [S.a[i], S.w[i]] = mecer(S.a[i], S.w[i], reposo[i], empuje, dt);
          if (Math.abs(S.a[i] - reposo[i]) > 0.001 || Math.abs(S.w[i]) > 0.004) moviendo = true;
        }
        const a = quieto ? reposo[i] : S.a[i];
        el.style.transform = `translate(${(p.x - m.cw / 2).toFixed(1)}px,${(p.y - 7).toFixed(1)}px) rotate(${a.toFixed(4)}rad)`;
      });
      return moviendo || brisa;
    }

    // El puntero que pasa por encima empuja las fotos hacia donde se mueve.
    raiz.addEventListener('pointermove', (e) => {
      if (reducir.matches) return;
      const r = raiz.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      if (ultimo) {
        const vx = limitar(((x - ultimo.x) / Math.max(8, e.timeStamp - ultimo.t)) * 1000, -2500, 2500);
        pos.forEach((p, i) => {
          if (Math.abs(x - p.x) < m.cw * 0.55 && y > p.y && y < p.y + m.h) S.w[i] -= vx * 0.00015;
        });
        despertar();
      }
      ultimo = { x, t: e.timeStamp };
    });
    raiz.addEventListener('pointerleave', () => { ultimo = null; });
    raiz.addEventListener('click', (e) => {
      const f = e.target.closest('.t-foto');
      if (f && op.alElegir && !items[Number(f.dataset.i)].enlace) { e.preventDefault(); op.alElegir(Number(f.dataset.i)); }
    });

    function actualizar(nuevos, textos) {
      items = nuevos;
      fotos.forEach((el, i) => {
        el.querySelector('.t-nota').textContent = items[i].nota || '';
        el.setAttribute('aria-label', textos.ver(items[i].titulo || ''));
      });
    }

    const despertar = bucle(raiz, colocar, () => { brisaHasta = performance.now() + BRISA; });
    new ResizeObserver(medir).observe(raiz);
    actualizar(items, op.textos);
    medir();
    return { actualizar };
  }

  window.NFG_TENDEDERO = { carrusel, cortina };
})();
