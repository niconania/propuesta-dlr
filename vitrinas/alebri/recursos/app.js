// Prototipo de byalebri.com: cabecera y pie comunes, el color por área, los
// números que cuentan al aparecer, la grilla de proyectos con filtros, las
// fichas de proyecto con sus videos y el formulario de contacto (que no envía).
(function () {
  const D = window.ALEBRI;
  const pagina = document.body.dataset.pagina;
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, raiz = document) => raiz.querySelector(sel);
  const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (x) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x]));
  const img = (ruta) => 'img/' + ruta;
  const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
  const ICONOS = {
    flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    atras: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    externo: '<path d="M7 17 17 7M8 7h9v9"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    cerrar: '<path d="M6 6l12 12M18 6 6 18"/>',
    play: '<path d="M8 5.5v13l10.5-6.5z"/>',
    premio: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 3.5-2 3.5 2-1.5-7"/>',
    izq: '<path d="m15 6-6 6 6 6"/>',
    der: '<path d="m9 6 6 6-6 6"/>',
  };
  const icono = (nombre) => `<svg class="icono" viewBox="0 0 24 24" aria-hidden="true">${ICONOS[nombre]}</svg>`;

  /* ── Estructura común ── */
  function montarEstructura() {
    const enInicio = pagina === 'inicio';
    const ancla = (id) => (enInicio ? '' : 'index.html') + '#' + id;
    document.body.insertAdjacentHTML('afterbegin',
      '<div class="aviso"><strong>Prototipo para Alejandra</strong> · Textos y cifras de ejemplo, sacados de tu Behance e Instagram. El contacto no envía nada.</div>'
      + '<header class="cabecera"><div class="caja">'
      +   `<a class="logo" href="${enInicio ? '#' : 'index.html'}" aria-label="alebri, inicio"><img src="img/marca/firma-negra.png" alt="alebri — Alejandra Briceño Ch, visual communication" width="78" height="46" /></a>`
      +   '<nav class="menu" id="menu">'
      +     `<a href="${ancla('proyectos')}">Proyectos</a><a href="${ancla('areas')}">Áreas</a><a href="${ancla('sobre-mi')}">Sobre mí</a><a href="${ancla('contacto')}">Contacto</a>`
      +   '</nav>'
      +   `<a class="boton boton--acento boton--chico" href="${ancla('contacto')}">Hablemos</a>`
      +   `<button class="menu-movil" type="button" aria-controls="menu" aria-expanded="false" aria-label="Abrir menú">${icono('menu')}</button>`
      + '</div></header>');
    document.body.insertAdjacentHTML('beforeend',
      '<footer class="pie"><div class="caja">'
      + '<img src="img/marca/firma-blanca.png" alt="alebri" width="108" height="64" />'
      + '<nav class="pie-enlaces">' + D.redes.map((r) => `<a href="${r.url}" target="_blank" rel="noopener">${esc(r.nombre)}</a>`).join('') + '<span>hola@byalebri.com</span></nav>'
      + '<div><div class="pie-colores"><span style="background:var(--azul)"></span><span style="background:var(--amarillo)"></span><span style="background:var(--rosado)"></span></div><p>© 2026 Alejandra Briceño Ch</p></div>'
      + '</div></footer>');

    const boton = $('.menu-movil');
    const menu = $('#menu');
    boton.addEventListener('click', () => boton.setAttribute('aria-expanded', String(menu.classList.toggle('abierto'))));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) { menu.classList.remove('abierto'); boton.setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-cerrar]')) e.target.closest('dialog').close();
      if (e.target.tagName === 'DIALOG') e.target.close(); // toque en el fondo
    });
  }

  // Cada área tiene su color: elegirla pinta la web entera.
  function ponerArea(id) {
    document.body.dataset.area = id;
    $$('.hero-areas a').forEach((a) => a.classList.toggle('activa', a.dataset.area === id));
  }

  function revelar() {
    const io = new IntersectionObserver((entradas) => entradas.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
    }), { threshold: 0.12 });
    $$('[data-revelar]:not(.visible)').forEach((el) => io.observe(el));
  }

  // Los "numeritos": cuentan desde cero cuando aparecen en pantalla.
  function contadores() {
    const animar = (el) => {
      const fin = Number(el.dataset.contar);
      const prefijo = el.dataset.prefijo || '';
      if (reducido) { el.textContent = prefijo + fin; return; }
      const inicio = performance.now();
      const duracion = 1500 + fin * 25;
      const paso = (t) => {
        const k = Math.min(1, (t - inicio) / duracion);
        el.textContent = prefijo + Math.round(fin * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
    };
    const io = new IntersectionObserver((entradas) => entradas.forEach((en) => {
      if (en.isIntersecting) { animar(en.target); io.unobserve(en.target); }
    }), { threshold: 0.5 });
    $$('[data-contar]').forEach((el) => io.observe(el));
  }

  /* ── Portada ── */
  function iniciarInicio() {
    let filtro = D.areas[location.hash.slice(1)] ? location.hash.slice(1) : 'todo';
    let sub = null;

    $('#numeros').innerHTML = D.numeros.map((n, i) => `<div class="numero" data-revelar style="--i:${i}"><strong data-contar="${n.valor}" data-prefijo="${n.prefijo || ''}">0</strong><span>${esc(n.texto)}</span></div>`).join('');

    $('#lista-areas').innerHTML = Object.entries(D.areas).map(([id, a], i) => {
      const suyos = D.proyectos.filter((p) => p.area === id);
      const fotos = suyos.filter((p) => p.portada).slice(0, 3);
      return `<button class="area c-${id}" type="button" data-ir-area="${id}" data-revelar style="--i:${i}">`
        + `<h3>${a.nombre}</h3><p>${esc(a.texto)}</p>`
        + `<span class="area-fotos">${fotos.map((p) => `<img src="${img(p.portada)}" alt="" loading="lazy" />`).join('')}</span>`
        + `<span class="area-cuenta">${plural(suyos.length, 'proyecto', 'proyectos')} ${icono('flecha')}</span></button>`;
    }).join('');

    const etiquetas = [['todo', 'Todo'], ...Object.entries(D.areas).map(([id, a]) => [id, a.nombre])];
    function pintarFiltros() {
      $('#filtros').innerHTML = etiquetas.map(([id, nombre]) => `<button class="filtro c-${id}" type="button" data-filtro="${id}" aria-pressed="${filtro === id}">${nombre}</button>`).join('');
      const sf = $('#subfiltros');
      sf.hidden = filtro !== 'diseno';
      sf.innerHTML = [['', 'Todo diseño'], ...Object.entries(D.subareas)]
        .map(([id, nombre]) => `<button class="filtro c-diseno" type="button" data-sub="${id}" aria-pressed="${(sub || '') === id}">${nombre}</button>`).join('');
    }
    function tarjeta(p, i, conDestacados) {
      const clases = ['proyecto', 'c-' + p.area];
      if (conDestacados && p.destacado) clases.push('proyecto--destacado');
      if (p.vertical) clases.push('proyecto--vertical');
      if (!p.portada) clases.push('proyecto--pendiente');
      const media = p.portada
        ? `<img src="${img(p.portada)}" alt="" loading="lazy" />`
        : `<span class="marca-colab">${esc(p.titulo)}</span><span class="pendiente">${esc(p.pendiente)}</span>`;
      return `<a class="${clases.join(' ')}" href="proyecto.html?p=${p.id}" style="animation-delay:${Math.min(i, 8) * 50}ms">`
        + `<div class="proyecto-img"><span class="proyecto-etiqueta">${D.areas[p.area].nombre}</span>`
        + (p.premio ? `<span class="proyecto-premio">★ ${esc(p.premio.split(' · ')[0])}</span>` : '') + media + '</div>'
        + `<div><h3>${esc(p.tituloCorto || p.titulo)}</h3><span class="proyecto-meta">${esc(p.tipo)}${p.anio ? ' · ' + p.anio : ''}${p.pendiente && p.portada ? ' · ' + esc(p.pendiente) : ''}</span></div></a>`;
    }
    function pintarProyectos() {
      const lista = D.proyectos.filter((p) => (filtro === 'todo' || p.area === filtro) && (!sub || p.sub === sub));
      $('#lista-proyectos').innerHTML = lista.map((p, i) => tarjeta(p, i, filtro === 'todo')).join('');
      $('#titulo-proyectos').innerHTML = filtro === 'todo'
        ? 'Todo lo que he hecho, <em>por áreas.</em>'
        : `${D.areas[filtro].nombre}: <em>${plural(lista.length, 'proyecto', 'proyectos')}.</em>`;
    }
    function elegir(id, irAProyectos) {
      filtro = id;
      sub = null;
      ponerArea(id);
      pintarFiltros();
      pintarProyectos();
      history.replaceState(null, '', id === 'todo' ? location.pathname + location.search : '#' + id);
      if (irAProyectos) $('#proyectos').scrollIntoView({ behavior: reducido ? 'auto' : 'smooth' });
    }

    document.addEventListener('click', (e) => {
      const f = e.target.closest('[data-filtro]');
      if (f) elegir(f.dataset.filtro, false);
      const s = e.target.closest('[data-sub]');
      if (s) { sub = s.dataset.sub || null; pintarFiltros(); pintarProyectos(); }
      const a = e.target.closest('[data-ir-area], .hero-areas a[data-area]');
      if (a) { e.preventDefault(); elegir(a.dataset.irArea || a.dataset.area, true); }
    });
    // Pasar sobre una palabra de la portada adelanta su color.
    $$('.hero-areas a').forEach((a) => {
      a.addEventListener('mouseenter', () => ponerArea(a.dataset.area));
      a.addEventListener('mouseleave', () => ponerArea(filtro));
    });

    const coloresPremio = ['cine', 'cine', 'animacion'];
    $('#lista-premios').innerHTML = D.premios.map((p, i) => `<li class="premio c-${coloresPremio[i]}" data-revelar style="--i:${i}"><span class="premio-icono">${icono('premio')}</span><div><strong>${esc(p.titulo)} · ${esc(p.detalle)}</strong><span>${esc(p.texto)}</span></div></li>`).join('');
    $('#lista-redes').innerHTML = D.redes.map((r) => `<li><a href="${r.url}" target="_blank" rel="noopener"><strong>${esc(r.nombre)}</strong><span>${esc(r.usuario)} ↗</span></a></li>`).join('');

    iniciarContacto();
    ponerArea(filtro);
    pintarFiltros();
    pintarProyectos();
    contadores();
    revelar();
    iniciarEntrada();
  }

  /* ── La entrada de la portada ── */
  // Cada palabra de sus áreas llega como un rodillo de tragamonedas.
  const LETRAS = 'abcdefhiklmnorstuvwxzñ'; // sin letras con descendente, que asomarían en la ventana
  function rodillo(enlace, demora, vueltas, duracion) {
    const palabra = enlace.dataset.palabra || enlace.textContent.trim();
    enlace.dataset.palabra = palabra;
    enlace.setAttribute('aria-label', palabra);
    enlace.innerHTML = [...palabra].map((letra, i) => {
      const tira = Array.from({ length: vueltas }, () => LETRAS[(Math.random() * LETRAS.length) | 0]).concat(letra);
      return `<span class="letra" aria-hidden="true"><span class="letra-final">${letra}</span>`
        + `<span class="tira" style="--n:${vueltas};--d:${demora + i * 45}ms;--dur:${duracion}ms">${tira.map((x) => `<span>${x}</span>`).join('')}</span></span>`;
    }).join('');
  }
  function iniciarEntrada() {
    const hero = $('.hero');
    const palabras = $$('.hero-areas a');
    const muneca = window.ALEBRI_MUNECA;
    const tiempos = [];
    const entrar = () => {
      tiempos.forEach(clearTimeout);
      if (reducido) return;
      document.body.classList.remove('entrando');
      void document.body.offsetWidth;
      document.body.classList.add('entrando');
      palabras.forEach((p, i) => rodillo(p, 120 + i * 130, 9, 900));
      tiempos.push(setTimeout(() => muneca && muneca.saludar(), 1350));
      tiempos.push(setTimeout(() => document.body.classList.remove('entrando'), 2500));
    };
    // Pasar sobre una palabra la vuelve a girar.
    const ultima = new Map();
    palabras.forEach((p) => p.addEventListener('mouseenter', () => {
      if (reducido || document.body.classList.contains('entrando') || performance.now() - (ultima.get(p) || 0) < 700) return;
      ultima.set(p, performance.now());
      rodillo(p, 0, 5, 600);
      $$('.tira', p).forEach((t) => t.classList.add('rueda'));
    }));
    // Un clic en el fondo suelta letras de sus colores.
    hero.addEventListener('pointerdown', (e) => {
      if (reducido || e.target.closest('a, button, .muneca')) return;
      const b = hero.getBoundingClientRect();
      const colores = ['var(--azul)', 'var(--amarillo)', 'var(--rosado)', '#111'];
      for (let i = 0; i < 12; i++) {
        const angulo = (i / 12) * Math.PI * 2 + Math.random() * 0.5;
        const distancia = 60 + Math.random() * 90;
        const chispa = document.createElement('span');
        chispa.className = 'chispa';
        chispa.textContent = 'alebri'[i % 6];
        chispa.style.cssText = `left:${e.clientX - b.left}px;top:${e.clientY - b.top}px;color:${colores[i % 4]};`
          + `--dx:${(Math.cos(angulo) * distancia).toFixed(0)}px;--dy:${(Math.sin(angulo) * distancia - 30).toFixed(0)}px;--rot:${((Math.random() - 0.5) * 260).toFixed(0)}deg`;
        hero.appendChild(chispa);
        setTimeout(() => chispa.remove(), 1000);
      }
    });
    $('.sello').addEventListener('click', entrar);
    entrar();
  }

  /* ── Contacto (no envía nada: muestra el correo que llegaría) ── */
  function iniciarContacto() {
    const form = $('#form-contacto');
    const opciones = [['identidad', 'Identidad visual', 'diseno'], ['redes', 'Redes sociales', 'diseno'], ['ilustracion', 'Ilustración', 'diseno'], ['animacion', 'Animación', 'animacion'], ['cine', 'Cine', 'cine'], ['contenido', 'Colaboración de contenido', 'contenido']];
    const elegidas = new Set();
    const pintar = () => {
      $('#chips-contacto').innerHTML = opciones.map(([id, nombre, area]) => `<button class="chip c-${area}" type="button" data-tipo="${id}" aria-pressed="${elegidas.has(id)}">${nombre}</button>`).join('');
    };
    const error = (nombre, visible) => {
      $(`[data-error="${nombre}"]`, form).hidden = !visible;
      form.elements[nombre]?.closest('.campo')?.classList.toggle('con-error', visible);
    };
    form.addEventListener('click', (e) => {
      const b = e.target.closest('[data-tipo]');
      if (!b) return;
      elegidas.has(b.dataset.tipo) ? elegidas.delete(b.dataset.tipo) : elegidas.add(b.dataset.tipo);
      error('tipos', false);
      pintar();
    });
    form.addEventListener('input', (e) => { if (e.target.name) error(e.target.name, false); });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = (n) => form.elements[n].value.trim();
      const fallos = [
        ['tipos', elegidas.size === 0],
        ['nombre', !v('nombre')],
        ['correo', !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v('correo'))],
        ['mensaje', !v('mensaje')],
      ];
      fallos.forEach(([n, mal]) => error(n, mal));
      if (fallos.some(([, mal]) => mal)) return;
      const tipos = opciones.filter(([id]) => elegidas.has(id)).map(([, nombre]) => nombre).join(', ');
      let modal = $('#modal-correo');
      if (!modal) { document.body.insertAdjacentHTML('beforeend', '<dialog class="modal" id="modal-correo"></dialog>'); modal = $('#modal-correo'); }
      modal.innerHTML = `<button class="cerrar" type="button" data-cerrar aria-label="Cerrar">${icono('cerrar')}</button>`
        + '<div class="modal-cuerpo"><h3>Así te llegaría el mensaje</h3><p>En la web real, esto entra a tu correo con tu dominio:</p>'
        + '<div class="correo"><dl>'
        + '<dt>Para</dt><dd>hola@byalebri.com</dd>'
        + `<dt>De</dt><dd>${esc(v('nombre'))} · ${esc(v('correo'))}</dd>`
        + `<dt>Asunto</dt><dd>Nuevo proyecto: ${esc(tipos)}</dd>`
        + `</dl><pre>${esc(v('mensaje'))}</pre></div>`
        + '<p class="nota">Prototipo: no se envió nada.</p>'
        + '<button class="boton boton--acento" type="button" data-cerrar>Entendido</button></div>';
      modal.showModal();
    });
    pintar();
  }

  /* ── Ficha de proyecto ── */
  function iniciarProyecto() {
    const id = new URLSearchParams(location.search).get('p');
    const p = D.proyectos.find((x) => x.id === id) || D.proyectos[0];
    const indice = D.proyectos.indexOf(p);
    const siguiente = D.proyectos[(indice + 1) % D.proyectos.length];
    const videos = p.video ? [p.video, ...(p.extras || [])] : [];
    let actual = 0;
    ponerArea(p.area);
    document.title = `${p.titulo} — alebri`;

    const urlVideo = (v) => (v.tipo === 'youtube'
      ? `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`
      : `https://www-ccv.adobe.io/v1/player/ccv/${v.id}/embed?api_key=behance1&bgcolor=%23191919&autoplay=true`);
    const portadaVideo = () => `<button class="reproductor-portada" type="button" data-reproducir aria-label="Reproducir el video"><img src="${img(p.portada)}" alt="" /><span class="boton-play">${icono('play')}</span></button>`;
    const reproducir = () => {
      $('#reproductor').innerHTML = `<iframe src="${urlVideo(videos[actual])}" title="${esc(p.titulo)}" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe>`;
    };

    let media = '';
    if (p.imagenes) {
      media = '<div class="galeria">' + p.imagenes.map((ruta, i) => `<button type="button" data-foto="${i}" aria-label="Ver imagen ${i + 1} en grande"><img src="${img('proyectos/' + ruta)}" alt="${esc(p.titulo)}, imagen ${i + 1}" loading="lazy" /></button>`).join('') + '</div>';
    } else if (p.vertical && p.portada) {
      media = `<div class="vertical-img"><img src="${img(p.portada)}" alt="${esc(p.titulo)}" /></div>`;
    } else if (!p.portada) {
      media = `<div class="ficha-pendiente"><strong>Aquí va el video de ${esc(p.titulo)}</strong><span>Me lo pasas por Drive y queda reproduciéndose en esta página.</span></div>`;
    }

    $('#ficha').innerHTML = '<div class="caja">'
      + '<section class="ficha-cabeza">'
      +   `<a class="volver" href="index.html#${p.area}">${icono('atras')} ${D.areas[p.area].nombre}</a>`
      +   `<div class="ficha-etiquetas"><span class="area-chip">${D.areas[p.area].nombre}</span>${p.premio ? `<span class="premio-chip">★ ${esc(p.premio)}</span>` : ''}</div>`
      +   `<h1>${esc(p.titulo)}</h1>`
      +   `<p class="ficha-meta">${esc(p.tipo)}${p.anio ? ' · ' + p.anio : ''}</p>`
      + '</section>'
      + (videos.length ? `<div class="reproductor" id="reproductor">${portadaVideo()}</div>`
        + `<div class="mas-videos" role="group" aria-label="Videos del proyecto">${videos.length > 1 ? videos.map((v, k) => `<button type="button" data-video="${k}" aria-pressed="${k === 0}">${k === 0 ? 'Video principal' : 'Video ' + (k + 1)}</button>`).join('') : ''}</div>` : '')
      + '<div class="ficha-grilla">'
      +   `<div><p class="ficha-texto">${esc(p.texto)}</p>${p.proceso ? `<ol class="proceso">${p.proceso.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>` : ''}</div>`
      +   '<aside class="ficha-lado">'
      +     (p.herramientas ? `<div><h3>Herramientas</h3><div class="chips-herramientas">${p.herramientas.map((h) => `<span>${esc(h)}</span>`).join('')}</div></div>` : '')
      +     (p.enlaces ? `<div><h3>Enlaces</h3><ul>${p.enlaces.map((e) => (e.url ? `<li><a href="${e.url}" target="_blank" rel="noopener">${esc(e.texto)} ${icono('externo')}</a></li>` : `<li class="sin-enlace">${esc(e.texto)}</li>`)).join('')}</ul></div>` : '')
      +     (p.pendiente ? `<div><h3>Pendiente</h3><p>${esc(p.pendiente)}</p></div>` : '')
      +   '</aside>'
      + '</div>'
      + media
      + `<a class="siguiente c-${siguiente.area}" href="proyecto.html?p=${siguiente.id}"><div><small>Siguiente · ${D.areas[siguiente.area].nombre}</small><strong>${esc(siguiente.tituloCorto || siguiente.titulo)}</strong></div>${icono('flecha')}</a>`
      + '</div>';

    // Visor de imágenes en grande, con flechas y teclado.
    document.body.insertAdjacentHTML('beforeend', `<dialog class="visor" id="visor"><img alt="" /><button class="cerrar" type="button" data-cerrar aria-label="Cerrar">${icono('cerrar')}</button>`
      + `<button class="visor-flecha visor-flecha--ant" type="button" data-mover="-1" aria-label="Anterior">${icono('izq')}</button><button class="visor-flecha visor-flecha--sig" type="button" data-mover="1" aria-label="Siguiente">${icono('der')}</button></dialog>`);
    const visor = $('#visor');
    let foto = 0;
    const mostrar = (i) => {
      foto = (i + p.imagenes.length) % p.imagenes.length;
      const im = $('img', visor);
      im.src = img('proyectos/' + p.imagenes[foto]);
      im.alt = `${p.titulo}, imagen ${foto + 1}`;
    };
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-reproducir]')) reproducir();
      const v = e.target.closest('[data-video]');
      if (v) {
        actual = Number(v.dataset.video);
        $$('[data-video]').forEach((b) => b.setAttribute('aria-pressed', String(b === v)));
        reproducir();
      }
      const f = e.target.closest('[data-foto]');
      if (f) { mostrar(Number(f.dataset.foto)); visor.showModal(); }
      const m = e.target.closest('[data-mover]');
      if (m) mostrar(foto + Number(m.dataset.mover));
    });
    document.addEventListener('keydown', (e) => {
      if (!visor.open) return;
      if (e.key === 'ArrowRight') mostrar(foto + 1);
      if (e.key === 'ArrowLeft') mostrar(foto - 1);
    });
  }

  montarEstructura();
  if (pagina === 'inicio') iniciarInicio();
  if (pagina === 'proyecto') iniciarProyecto();
})();
