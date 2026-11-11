/* [DEMO] Copia para una propuesta: WhatsApp no se abre; se muestra el mensaje que llegaría. */
(function () {
  function mostrar(url) {
    var texto = '';
    try { texto = decodeURIComponent((String(url).split('text=')[1] || '').split('&')[0]); } catch (e) { texto = ''; }
    var viejo = document.getElementById('demo-wa'); if (viejo) viejo.remove();
    var caja = document.createElement('div');
    caja.id = 'demo-wa';
    caja.setAttribute('style', 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:Montserrat,Arial,sans-serif');
    caja.innerHTML = '<div style="background:#fff;color:#111;border-radius:16px;max-width:440px;width:100%;padding:20px 20px 16px;box-shadow:0 20px 60px rgba(0,0,0,.35)">'
      + '<div style="font-weight:700;font-size:15px;margin-bottom:4px">Demo · no se envió nada</div>'
      + '<div style="font-size:13px;color:#555;line-height:1.45">En el sitio real, este botón abre WhatsApp con este mensaje ya armado:</div>'
      + '<pre style="white-space:pre-wrap;font:inherit;font-size:12.5px;line-height:1.45;background:#F3F5F4;border-radius:10px;padding:10px 12px;margin:10px 0;max-height:46vh;overflow:auto"></pre>'
      + '<button type="button" style="width:100%;height:42px;border:0;border-radius:999px;background:#1DAA9F;color:#fff;font-weight:700;cursor:pointer">Entendido</button></div>';
    caja.querySelector('pre').textContent = texto || '(mensaje)';
    caja.querySelector('button').onclick = function () { caja.remove(); };
    caja.onclick = function (e) { if (e.target === caja) caja.remove(); };
    document.body.appendChild(caja);
  }
  var abrir = window.open;
  window.open = function (url) {
    if (!url) return null;
    if (/wa\.me|whatsapp\.com/i.test(url)) { mostrar(url); return null; }
    return abrir.apply(window, arguments);
  };
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="wa.me"], a[href*="whatsapp.com"]');
    if (a) { e.preventDefault(); e.stopPropagation(); mostrar(a.getAttribute('href')); }
  }, true);
})();
// Prototipo de negrofarto.com: estructura común (cabecera, las tres puertas,
// pie, idioma y WhatsApp) y la lógica de cada página — agencia, La Fartedá y
// WuandaCrafts. Nada se envía: los pedidos se muestran como el mensaje de
// WhatsApp que llegaría a Miami o a Cartagena.
(function () {
  const T = window.NFG_T;
  const D = window.NFG_DATOS;
  const pagina = document.body.dataset.pagina; // agencia | merch | wuanda
  const base = document.body.dataset.base || ''; // '' en la raíz, '../' en las marcas
  const prefijoWa = { merch: 'lf_', wuanda: 'wc_' }[pagina] || '';
  const alCambiarIdioma = [];
  let idioma = idiomaInicial();

  function t(clave, datos) {
    let s = (T[idioma] && T[idioma][clave]) ?? T.en[clave] ?? clave;
    if (datos) s = s.replace(/\{(\w+)\}/g, (_, k) => datos[k] ?? '');
    return s;
  }
  const L = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v[idioma] ?? v.en : v);
  const esc = (s) => String(s).replace(/[&<>"']/g, (x) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x]));
  const icono = (id, clase) => `<svg class="icono${clase ? ' ' + clase : ''}" aria-hidden="true"><use href="#${id}"/></svg>`;
  const $ = (sel, raiz = document) => raiz.querySelector(sel);
  const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];
  const servicio = (id) => D.servicios.find((s) => s.id === id);
  function leer(clave) { try { return localStorage.getItem(clave); } catch (e) { return null; } }
  function guardar(clave, valor) { try { localStorage.setItem(clave, valor); } catch (e) { /* sin almacenamiento */ } }
  function idiomaInicial() {
    const guardado = leer('nfg-idioma');
    if (guardado === 'en' || guardado === 'es') return guardado;
    return /^es\b/i.test(navigator.language || '') ? 'es' : 'en';
  }
  function irA(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ── Estructura común ── */
  function selectorIdioma() {
    return '<div class="idioma" role="group" aria-label="Language / Idioma">'
      + '<button type="button" data-idioma="en" aria-pressed="false">EN</button>'
      + '<button type="button" data-idioma="es" aria-pressed="false">ES</button></div>';
  }

  function montarEstructura() {
    const inicio = base + 'index.html';
    const ancla = (id) => (pagina === 'agencia' ? '' : inicio) + '#' + id;
    // «Contacto» lleva a donde se escribe. Antes bajaba al pie y la página quedaba «mocha» (Juan, 23 oct 2026): en la
    // agencia va al formulario de cotización, que también tiene el WhatsApp y el correo directos; La Fartedá y WuandaCrafts
    // no tienen formulario (piden con su carrito), así que abren la elección de WhatsApp (Miami o Cartagena).
    const contacto = {
      agencia: '<a href="#cotizar" data-t="nav.contacto"></a>',
      wuanda: '<a href="#contacto" data-whatsapp="elegir" data-t="nav.contacto"></a>',
      merch: '<a href="#contacto" data-whatsapp="elegir" data-t="nav.contacto"></a>',
    }[pagina];
    // El botón de la cabecera también se queda en la marca: en La Fartedá lleva a su colección, no a la cotización de la agencia.
    const cta = pagina === 'wuanda'
      ? '<a class="boton boton--acento boton--chico boton--cotizar" href="#catalogo" data-t="wc.cta"></a>'
      : pagina === 'merch'
        ? '<a class="boton boton--acento boton--chico boton--cotizar" href="#coleccion" data-t="lf.cta_cab"></a>'
        : `<a class="boton boton--acento boton--chico boton--cotizar" href="${ancla('cotizar')}" data-t="nav.cotizar"></a>`;
    // Cada puerta es solo el logo de su marca: sin nombres (Juan, 12 oct y 29 oct 2026: «solo el imagotipo como en LF»). El nombre
    // va en el aria-label y en el title. La Fartedá va con su isotipo «LF» (23 oct 2026). La barra es negra en la agencia, blanca en
    // La Fartedá y morada en WuandaCrafts (29 oct 2026): sobre la blanca van los logos oscuros.
    const sobreBlanco = pagina === 'merch';
    const puertas = [
      { id: 'agencia', href: inicio, img: sobreBlanco ? 'img/marcas/nfg-blanco.svg' : 'img/marcas/nfg-negro.svg', clave: 'puerta.nfg', clase: 'nfg' },
      { id: 'merch', href: base + 'merch/index.html', img: sobreBlanco ? 'img/marcas/lafarteda-lf-oscuro.svg' : 'img/marcas/lafarteda-lf.svg', clave: 'puerta.lf', clase: 'lf' },
      { id: 'wuanda', href: base + 'wuandacrafts/index.html', img: 'img/marcas/wuandacrafts-w.svg', clave: 'puerta.wc', clase: 'wc' },
    ];

    document.body.insertAdjacentHTML('afterbegin', window.NFG_ICONOS
      + '<div class="aviso" data-t="aviso"></div>'
      + '<header class="cabecera"><div class="caja">'
      +   `<a class="logo" href="${inicio}" aria-label="NFG"><img src="${base}img/marcas/marca-negro.svg" alt="negrofarto group." width="113" height="34" /></a>`
      +   '<nav class="menu" id="menu">'
      // Servicios, Trabajos y Nosotros son de la agencia: en La Fartedá y WuandaCrafts llevaban a NFG sin avisar (Juan, 9 nov 2026),
      // así que ahí se ocultan y solo queda «Contacto». El pie conserva su columna «Agencia».
      +     (pagina === 'agencia'
        ? `<a href="${ancla('servicios')}" data-t="nav.servicios"></a>`
          + `<a href="${ancla('trabajos')}" data-t="nav.trabajos"></a>`
          + `<a href="${ancla('nosotros')}" data-t="nav.nosotros"></a>`
        : '')
      +     contacto
      +   '</nav>'
      +   selectorIdioma()
      +   (pagina === 'merch' || pagina === 'wuanda' ? `<button class="boton-carrito" type="button" id="abrir-carrito" data-t-aria="car.abrir">${icono('i-bolsa-compra')}<span class="contador" id="contador-carrito" hidden>0</span></button>` : '')
      +   cta
      +   `<button class="menu-movil" type="button" aria-controls="menu" aria-expanded="false" data-t-aria="nav.abrir">${icono('i-menu')}</button>`
      + '</div></header>'
      + '<nav class="puertas" aria-label="NFG"><div class="caja">'
      + puertas.map((p) => `<a class="puerta puerta--${p.clase}" href="${p.href}" data-t-aria="${p.clave}" data-t-title="${p.clave}"${p.id === pagina ? ' aria-current="page"' : ''}>`
          + `<img src="${base}${p.img}" alt="" /></a>`).join('')
      + '</div></nav>');

    // La agencia se presenta desde Miami (comentarios de Juan, 10 oct 2026): su pie no menciona Cartagena.
    // Cartagena queda en el pie de La Fartedá y WuandaCrafts, que sí trabajan en las dos ciudades.
    const soloMiami = pagina === 'agencia';
    document.body.insertAdjacentHTML('beforeend',
      '<footer class="pie" id="contacto"><div class="caja"><div class="pie-grilla">'
      + `<div><a class="pie-logo" href="${inicio}"><img src="${base}img/marcas/marca-negro.svg" alt="negrofarto group." width="132" height="40" /></a>`
      +   '<p class="pie-lema" data-t="pie.lema"></p>'
      +   `<div class="pie-redes"><a href="https://www.instagram.com/negrofartogroup/" target="_blank" rel="noopener" aria-label="Instagram">${icono('i-instagram')}</a></div></div>`
      + '<div><h4 data-t="pie.agencia"></h4><ul>'
      +   `<li><a href="${ancla('servicios')}" data-t="nav.servicios"></a></li>`
      +   `<li><a href="${ancla('trabajos')}" data-t="nav.trabajos"></a></li>`
      +   `<li><a href="${ancla('nosotros')}" data-t="nav.nosotros"></a></li>`
      +   `<li><a href="${ancla('cotizar')}" data-t="nav.cotizar"></a></li>`
      + '</ul></div>'
      + '<div><h4 data-t="pie.marcas"></h4><ul>'
      +   `<li><a href="${base}merch/index.html">La Fartedá</a></li>`
      +   `<li><a href="${base}wuandacrafts/index.html">WuandaCrafts</a></li>`
      +   `<li><a href="https://www.instagram.com/lafarteda/" target="_blank" rel="noopener">@lafarteda ${icono('i-externo')}</a></li>`
      +   `<li><a href="https://www.instagram.com/wuandacrafts/" target="_blank" rel="noopener">@wuandacrafts ${icono('i-externo')}</a></li>`
      + '</ul></div>'
      + '<div><h4 data-t="pie.contacto"></h4><ul>'
      +   `<li><button class="enlace" type="button" data-whatsapp="${prefijoWa}miami">${icono('i-whatsapp')} WhatsApp Miami · <span data-t="pie.usa"></span></button></li>`
      +   (soloMiami ? '' : `<li><button class="enlace" type="button" data-whatsapp="${prefijoWa}cartagena">${icono('i-whatsapp')} WhatsApp Cartagena · <span data-t="pie.col"></span></button></li>`)
      +   `<li><a href="mailto:projects@negrofarto.com">${icono('i-correo')} projects@negrofarto.com</a></li>`
      +   `<li><span class="pie-lugar">${icono('i-lugar')} ${soloMiami ? 'Miami, FL' : 'Miami, FL · Cartagena'}</span></li>`
      + '</ul></div>'
      + '</div>'
      + `<div class="pie-legal"><span data-t="${soloMiami ? 'pie.legal' : 'pie.legal_marcas'}"></span>${selectorIdioma()}</div>`
      + '</div></footer>'
      // En la agencia el WhatsApp va directo a Miami; en La Fartedá y WuandaCrafts se elige el país.
      + `<button class="flotante" type="button" data-whatsapp="${pagina === 'agencia' ? 'miami' : 'elegir'}" aria-label="WhatsApp">${icono('i-whatsapp')}</button>`
      + '<dialog class="modal" id="modal-whatsapp"></dialog>'
      + '<div class="aviso-copiado" id="aviso-copiado" role="status" aria-live="polite"></div>');
  }

  function aplicarIdioma(nuevo) {
    idioma = T[nuevo] ? nuevo : 'en';
    document.documentElement.lang = idioma;
    document.title = t('titulo.' + pagina);
    $$('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
    $$('[data-t-html]').forEach((el) => { el.innerHTML = t(el.dataset.tHtml); });
    $$('[data-t-ph]').forEach((el) => { el.placeholder = t(el.dataset.tPh); });
    $$('[data-t-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.tAria)); });
    $$('[data-t-title]').forEach((el) => { el.title = t(el.dataset.tTitle); });
    $$('[data-idioma]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.idioma === idioma)));
    alCambiarIdioma.forEach((f) => f());
  }

  /* ── WhatsApp: abre el chat real con el mensaje listo; la persona decide si lo envía ── */
  const botonCerrar = () => `<button class="modal-cerrar" type="button" data-cerrar aria-label="${esc(t('car.cerrar'))}">${icono('i-cerrar')}</button>`;
  // El enlace de WhatsApp con el mensaje listo. «destino»: miami, lf_miami o wc_miami (EE.UU.); cartagena, lf_cartagena o wc_cartagena (Colombia).
  const urlWhatsApp = (destino, mensaje) => `https://wa.me/${D.contacto.whatsapp[destino.endsWith('cartagena') ? 'cartagena' : 'miami']}?text=${encodeURIComponent(mensaje)}`;
  function abrirWhatsApp(destino, mensaje) {
    const modal = $('#modal-whatsapp');
    if (destino === 'elegir') {
      modal.innerHTML = botonCerrar() + `<div class="modal-cuerpo"><h3>${t('wa.elegir')}</h3><p>${t('wa.elegir_texto')}</p><div class="elegir-wa">`
        + ['miami', 'cartagena'].map((c) => `<button class="contacto-boton wa" type="button" data-whatsapp="${prefijoWa}${c}">${icono('i-whatsapp')}<span><strong>WhatsApp</strong><small>${t('wa.' + c)}</small></span></button>`).join('')
        + '</div></div>';
      if (!modal.open) modal.showModal();
      return;
    }
    window.open(urlWhatsApp(destino, mensaje), '_blank', 'noopener');
    if (modal.open) modal.close();
  }
  const saludo = () => t('wa.saludo' + ({ merch: '_lf', wuanda: '_wc' }[pagina] || ''));

  /* ── Copia al correo (servidor/enviar.php) ── */
  // Cada cotización y cada pedido se manda también a projects@negrofarto.com (decidido el 26 oct 2026). Solo desde negrofarto.com: la
  // vista previa y las pruebas nunca envían, salvo una prueba que active window.NFG_ENVIO ({ activo, url }). Es una copia: si falla, no
  // se nota (WhatsApp ya abrió), y va con sendBeacon para que salga aunque la persona cambie de pestaña enseguida.
  // Los pedidos de WuandaCrafts pueden llevar archivos (el logo de cada pieza): ni sendBeacon ni keepalive aguantan más de 64 KB,
  // así que van con un fetch normal y devuelven una promesa (true si el servidor la aceptó) para que el pedido espere antes de WhatsApp.
  // «archivos»: [{ archivo: File, etiqueta }].
  const enProduccion = /^(www\.)?negrofarto\.com$/i.test(location.hostname);
  const copiaActiva = () => enProduccion || !!(window.NFG_ENVIO && window.NFG_ENVIO.activo);
  function copiaAlCorreo(datos, archivos = []) {
    if (!copiaActiva()) return Promise.resolve(false);
    const envio = window.NFG_ENVIO || {};
    try {
      const fd = new FormData();
      Object.entries({ idioma, pagina: location.pathname, ...datos }).forEach(([k, v]) => { if (v != null && v !== '') fd.append(k, v); });
      archivos.forEach((a) => { fd.append('archivo[]', a.archivo, a.archivo.name); fd.append('etiquetas[]', a.etiqueta); });
      const url = envio.url || base + 'enviar.php';
      if (archivos.length) {
        // Con archivos se espera la respuesta, pero no para siempre: pasados 20 s (o envio.tiempo, en las pruebas) se da por perdida.
        const parar = new AbortController();
        const reloj = setTimeout(() => parar.abort(), envio.tiempo || 20000);
        return fetch(url, { method: 'POST', body: fd, signal: parar.signal }).then((r) => r.ok).catch(() => false).finally(() => clearTimeout(reloj));
      }
      if (!(navigator.sendBeacon && navigator.sendBeacon(url, fd))) fetch(url, { method: 'POST', body: fd, keepalive: true }).catch(() => { /* solo es una copia */ });
      return Promise.resolve(true);
    } catch (e) { return Promise.resolve(false); /* solo es una copia */ }
  }

  /* ── Correo: un enlace «mailto:» no hace nada si la computadora no tiene una app de correo configurada (Juan, 29 oct 2026: «el
     botón de correo aún no sirve», en la página temporal). Al tocar cualquier enlace de correo se copia la dirección y se avisa
     en pantalla; el enlace sigue abriendo el correo si hay con qué. ── */
  let relojCopiado = 0;
  function copiarCorreo(direccion) {
    const avisar = (copiado) => {
      const aviso = $('#aviso-copiado');
      aviso.textContent = t(copiado ? 'correo.copiado' : 'correo.escribe', { correo: direccion });
      aviso.classList.add('visible');
      clearTimeout(relojCopiado);
      relojCopiado = setTimeout(() => aviso.classList.remove('visible'), 6000);
    };
    // Se copia y se avisa en el acto, dentro del clic: sin esperar permisos ni foco (la API del portapapeles puede tardar o no contestar).
    const campo = document.createElement('textarea');
    campo.value = direccion; campo.setAttribute('readonly', ''); campo.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.appendChild(campo); campo.select(); campo.setSelectionRange(0, direccion.length);
    let copiado = false;
    try { copiado = document.execCommand('copy'); } catch (e) { /* sin permiso */ }
    campo.remove();
    avisar(copiado);
    // Si ese camino no sirvió, se prueba con la API moderna y el aviso se corrige solo si por fin se copió.
    if (!copiado && navigator.clipboard && navigator.clipboard.writeText) {
      Promise.race([navigator.clipboard.writeText(direccion).then(() => true, () => false), new Promise((ok) => setTimeout(() => ok(false), 1500))]).then((ok) => { if (ok) avisar(true); });
    }
  }

  function activarEstructura() {
    document.addEventListener('click', (e) => {
      const correo = e.target.closest('a[href^="mailto:"]');
      if (correo) copiarCorreo(correo.getAttribute('href').slice(7).split('?')[0]);
      const bIdioma = e.target.closest('[data-idioma]');
      if (bIdioma) { aplicarIdioma(bIdioma.dataset.idioma); guardar('nfg-idioma', idioma); }
      const bWa = e.target.closest('[data-whatsapp]');
      if (bWa) {
        if (bWa.tagName === 'A') e.preventDefault(); // el «Contacto» de La Fartedá: abre WhatsApp sin saltar al pie
        abrirWhatsApp(bWa.dataset.whatsapp, saludo());
      }
      const cerrar = e.target.closest('[data-cerrar]');
      if (cerrar) cerrar.closest('dialog').close();
      if (e.target.tagName === 'DIALOG') e.target.close(); // toque en el fondo
    });
    const botonMenu = $('.menu-movil');
    const menu = $('#menu');
    botonMenu.addEventListener('click', () => {
      const abierto = menu.classList.toggle('abierto');
      botonMenu.setAttribute('aria-expanded', String(abierto));
    });
    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) { menu.classList.remove('abierto'); botonMenu.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Muestra u oculta el error de un campo; devuelve si el campo está bien.
  function validarCampo(form, nombre, ok) {
    const error = $(`[data-error="${nombre}"]`, form);
    if (error) error.hidden = ok;
    const campo = form.elements[nombre];
    if (campo && campo.closest) campo.closest('.campo')?.classList.toggle('con-error', !ok);
    return ok;
  }
  function limpiarErrorAlEscribir(form) {
    form.addEventListener('input', (e) => { if (e.target.name) validarCampo(form, e.target.name, true); });
    form.addEventListener('change', (e) => { if (e.target.name) validarCampo(form, e.target.name, true); });
  }

  /* ── Agencia ── */
  function iniciarAgencia() {
    const seleccion = new Set();
    let abiertos = new Set();
    let filtro = 'todos';
    const kit = { negocio: null, etapa: null, paso: 1 }; // paso: 1 negocio · 2 etapa · 3 el kit
    const form = $('#form-cotizar');

    function pintarCinta() {
      const items = t('cinta').split(' · ').map((x) => `<span>${esc(x)}</span>`).join('');
      $('#cinta').innerHTML = items + items;
    }

    function pintarServicios() {
      $('#lista-servicios').innerHTML = D.servicios.map((s) => `
        <article class="servicio${abiertos.has(s.id) ? ' abierto' : ''}" data-servicio="${s.id}">
          <div class="servicio-icono">${icono(s.icono)}</div>
          <h3>${esc(L(s.titulo))}</h3>
          <p>${esc(L(s.corto))}</p>
          <button class="enlace-flecha servicio-ver" type="button" aria-expanded="${abiertos.has(s.id)}">${t('serv.ver')} ${icono('i-abajo')}</button>
          <div class="servicio-detalle">
            <ul class="lista-check">${L(s.incluye).map((x) => `<li>${icono('i-check')}<span>${esc(x)}</span></li>`).join('')}</ul>
            <button class="boton boton--negro boton--chico" type="button" data-cotizar="${s.id}">${t('serv.cotizar')}</button>
          </div>
        </article>`).join('');
    }
    // Toda la tarjeta abre y cierra «qué incluye»: Juan tocó la tarjeta y no pasó nada (23 oct 2026). Dentro del
    // detalle (la lista y «Cotizar este servicio») el clic no la cierra. Con teclado sigue el botón «Ver qué incluye».
    $('#lista-servicios').addEventListener('click', (e) => {
      const tarjeta = e.target.closest('.servicio');
      if (!tarjeta || e.target.closest('.servicio-detalle')) return;
      const id = tarjeta.dataset.servicio;
      const conBoton = !!e.target.closest('.servicio-ver');
      abiertos.has(id) ? abiertos.delete(id) : abiertos.add(id);
      pintarServicios();
      if (conBoton) $(`.servicio[data-servicio="${id}"] .servicio-ver`)?.focus(); // el foco no se pierde al repintar
    });

    // Recomendador de kits (reunión del 23 oct 2026; diseño elegido por Nicola el 26 oct): la caja blanca es el
    // formulario, de dos pasos (tipo de negocio, etapa) y el kit; la pregunta se escribe al cambiar de paso. Al lado,
    // sobre el fondo oscuro, el logo líquido (recursos/liquido.js) «piensa» cada vez que se elige. Sin WebGL2 o con
    // «reducir movimiento», queda el logo quieto y la pregunta aparece completa.
    // Metamorfosis (idea de Juan, 29 oct 2026): al elegir el tipo de negocio, el logo «nfg.» se deshace y el material se
    // acomoda en el logo de un trabajo de ese tipo (cafetería → SpillMug; datos.js, «negocios»). Sin WebGL2 o con «reducir
    // movimiento», el logo cambia de una vez.
    const reduceMov = matchMedia('(prefers-reduced-motion: reduce)');
    const logoKit = $('#kit-logo-caja');
    const imagenKit = $('.kit-logo', logoKit);
    const logoInicial = imagenKit.getAttribute('src');
    let logoPuesto = logoInicial;
    const liquido = window.NFG_LIQUIDO?.montar(logoKit, imagenKit) || null;
    let escribiendo = 0; // temporizador de la pregunta que se escribe

    // Pone el logo del negocio elegido (o el «nfg.» si no hay). Devuelve true si hubo cambio de logo.
    function ponerLogo() {
      const src = D.negocios.find((n) => n.id === kit.negocio)?.logo || logoInicial;
      if (src === logoPuesto) return false;
      logoPuesto = src;
      if (liquido) liquido.cambiar(src); else imagenKit.src = src;
      return true;
    }
    // Quién es el logo que se ve: una línea bajo el logo, con el enlace al trabajo (o a la tienda, si es La Fartedá).
    let htmlCliente = ''; // lo último que se escribió: la línea es una zona viva y no se repinta (ni se vuelve a leer) si no cambió
    function pintarCliente() {
      const negocio = D.negocios.find((n) => n.id === kit.negocio), caja = $('#kit-cliente');
      let html = '';
      if (negocio?.logo) {
        logoKit.dataset.cliente = negocio.id;
        const p = negocio.proyecto && D.proyectos.find((x) => x.id === negocio.proyecto);
        const flecha = icono('i-flecha');
        html = p
          ? `${esc(t('kit.cliente', { cliente: L(p.titulo) }))} <button class="kit-cliente-enlace" type="button" data-trabajo="${p.id}">${esc(t('kit.cliente_ver'))} ${flecha}</button>`
          : `${esc(t('kit.cliente_lf'))} <a class="kit-cliente-enlace" href="${esc(negocio.enlace)}">${esc(t('kit.cliente_lf_ver'))} ${flecha}</a>`;
      } else delete logoKit.dataset.cliente;
      if (html !== htmlCliente) { htmlCliente = html; caja.innerHTML = html; }
    }

    // Escribe la pregunta letra por letra. El texto de verdad no cambia (lo que falta va en un <span> transparente):
    // los lectores de pantalla lo leen completo y las líneas no se corren a mitad de palabra.
    function escribir(h) {
      const el = $('.kit-texto', h), texto = el.textContent;
      let i = 0;
      const poner = () => { el.innerHTML = `${esc(texto.slice(0, i))}<span class="kit-resto">${esc(texto.slice(i))}</span>`; };
      const letra = () => {
        i++;
        if (i >= texto.length) { el.textContent = texto; return; }
        poner();
        escribiendo = setTimeout(letra, 24 + Math.random() * 22);
      };
      poner();
      escribiendo = setTimeout(letra, 140);
    }

    function pintarKit({ animar = false } = {}) {
      clearTimeout(escribiendo);
      $('.kit-pista', logoKit).textContent = t(matchMedia('(hover: hover)').matches ? 'kit.pista' : 'kit.pista_toque');
      const negocio = D.negocios.find((n) => n.id === kit.negocio);
      const etapa = D.etapas.find((n) => n.id === kit.etapa);
      const progreso = (n, texto) => `<div class="kit-progreso"><span>${esc(texto)}</span><i class="lleno"></i><i${n > 1 ? ' class="lleno"' : ''}></i></div>`;
      const opcion = (dato, clave, elegida, i) => `<button class="kit-opcion" type="button" data-${clave}="${dato.id}" aria-pressed="${elegida}" style="--i:${i}"><span class="kit-ico">${icono(dato.icono)}</span><span>${esc(L(dato.titulo))}</span></button>`;
      const elegido = (texto) => `<div class="kit-elegido">${icono('i-check')}<strong>${esc(texto)}</strong><button class="kit-cambiar" type="button" data-volver aria-label="${esc(t('kit.cambiar_aria'))}">${t('kit.cambiar')}</button></div>`;
      const titulo = (clave) => `<h3 class="kit-pregunta" id="kit-pregunta" tabindex="-1"><span class="kit-texto">${t(clave)}</span></h3>`;
      let html;
      if (kit.paso === 1) {
        html = progreso(1, t('kit.progreso', { n: 1 })) + `<p class="kit-ceja">${t('kit.usame')}</p>` + titulo('kit.p1')
          + `<div class="kit-opciones" role="group" aria-labelledby="kit-pregunta">${D.negocios.map((n, i) => opcion(n, 'negocio', kit.negocio === n.id, i)).join('')}</div>`
          + `<p class="kit-despues">${t('kit.despues1')}</p>`;
      } else if (kit.paso === 2) {
        html = progreso(2, t('kit.progreso', { n: 2 })) + elegido(L(negocio.titulo)) + `<p class="kit-ceja">${t('kit.ya_casi')}</p>` + titulo('kit.p2')
          + `<div class="kit-opciones kit-opciones--una" role="group" aria-labelledby="kit-pregunta">${D.etapas.map((n, i) => opcion(n, 'etapa', kit.etapa === n.id, i)).join('')}</div>`
          + `<p class="kit-despues">${t('kit.despues2')}</p>`;
      } else {
        html = progreso(2, t('kit.listo')) + elegido(`${L(negocio.titulo)} · ${L(etapa.titulo)}`) + titulo('kit.resultado')
          + '<ol class="kit-items">' + itemsKit().map((it) => {
            const s = servicio(it.servicio);
            return `<li class="kit-item"><div class="servicio-icono">${icono(s.icono)}</div><div><strong>${esc(L(it.titulo))}</strong><span>${esc(L(it.porque))}</span><br /><small>${esc(L(s.titulo))}</small></div></li>`;
          }).join('') + '</ol>'
          + (etapa.nota ? `<p class="kit-nota">${esc(L(etapa.nota))}</p>` : '')
          + `<button class="boton boton--acento boton--ancho" type="button" id="pedir-kit">${t('kit.pedir')} ${icono('i-flecha')}</button>`;
      }
      $('#kit-resultado').innerHTML = html;
      pintarCliente();
      if (animar) {
        // El foco pasa a la pregunta: con teclado no se pierde al cambiar de paso y los lectores de pantalla la leen.
        $('#kit-pregunta').focus({ preventScroll: true });
        if (kit.paso < 3 && !reduceMov.matches) escribir($('#kit-pregunta'));
      }
    }
    function itemsKit() {
      const negocio = D.negocios.find((n) => n.id === kit.negocio);
      const etapa = D.etapas.find((n) => n.id === kit.etapa);
      return (etapa.extra ? [etapa.extra] : []).concat(negocio.kit);
    }
    // Al cambiar de paso, lo nuevo queda a la vista: la página solo se desplaza si la caja quedó bajo la cabecera o si la
    // pregunta nueva quedó fuera de pantalla; con el kit ya listo, se lleva la caja arriba para verlo entero. Así, en el
    // celular, el logo sigue a la vista mientras «piensa» (fuera de pantalla el motor se detiene).
    function verCaja() {
      const caja = $('#kit-resultado'), arriba = caja.getBoundingClientRect().top, pregunta = $('#kit-pregunta').getBoundingClientRect().bottom;
      if (arriba < 84 || pregunta > innerHeight - 24 || (kit.paso === 3 && arriba > innerHeight * 0.35)) caja.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Los logos de la metamorfosis (unos 200 KB) se bajan cuando la sección está por verse, para que el cambio no espere la red.
    function precargarLogos() {
      for (const n of D.negocios) {
        if (!n.logo) continue;
        if (/\.svg$/i.test(n.logo)) fetch(n.logo).catch(() => {}); else new Image().src = n.logo;
      }
    }
    // La primera vez, la pregunta se escribe justo antes de que la caja entre en pantalla (así no se ve parpadear).
    if (!reduceMov.matches && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        precargarLogos();
        if (kit.paso === 1 && !kit.negocio) escribir($('#kit-pregunta'));
      }, { rootMargin: '0px 0px 30% 0px' });
      io.observe($('#kit-resultado'));
    }
    $('#kit').addEventListener('click', (e) => {
      const n = e.target.closest('[data-negocio]');
      const s = e.target.closest('[data-etapa]');
      const volver = e.target.closest('[data-volver]');
      if (n) { kit.negocio = n.dataset.negocio; kit.paso = 2; }
      if (s) { kit.etapa = s.dataset.etapa; kit.paso = 3; }
      if (volver) kit.paso = 1;
      const trabajo = e.target.closest('[data-trabajo]');
      if (trabajo) { abrirProyecto(proyecto(trabajo.dataset.trabajo)); return; }
      if (n || s || volver) {
        const cambioDeLogo = n ? ponerLogo() : false; // la metamorfosis ya revuelve el logo
        if (!cambioDeLogo && (n || s)) liquido?.pensar(s ? 1900 : 1400); // el logo «piensa» un poco más cuando ya sale el kit
        pintarKit({ animar: true });
        verCaja();
      }
      if (e.target.closest('#pedir-kit')) {
        const items = itemsKit();
        items.forEach((it) => seleccion.add(it.servicio));
        form.elements.mensaje.value = t('kit.mensaje', {
          negocio: L(D.negocios.find((x) => x.id === kit.negocio).titulo),
          etapa: L(D.etapas.find((x) => x.id === kit.etapa).titulo).toLowerCase(),
          items: items.map((it) => L(it.titulo)).join(', '),
        });
        pintarChipsCotizar();
        validarCampo(form, 'servicios', true);
        irA('cotizar');
      }
    });

    // Los filtros son los dos rótulos de sus portadas de Instagram (Juan, 9 nov 2026): «brand created» y «worked with us».
    const filtros = ['todos', 'creada', 'trabajada'];
    // Cada trabajo abre el visor; el ícono de Instagram lleva directo a su publicación (lo pidió Juan, 10 oct 2026).
    // Van como hermanos y no uno dentro del otro: un enlace no puede ir dentro de un botón.
    const enlaceInstagram = (p, clase, contenido, aria) => `<a class="${clase}" href="${esc(p.instagram)}" target="_blank" rel="noopener"${aria ? ` aria-label="${esc(aria)}" title="${esc(aria)}"` : ''}>${contenido}</a>`;

    // Trabajos como el carrusel de Instagram (pedido de Juan en la reunión del 23 oct 2026; diseño B elegido el 26 oct):
    // en la tarjeta, el mouse recorre las láminas o reproduce el video; el visor las pasa con flechas, teclado,
    // miniaturas o deslizando. «medios» está en datos.js; sin él, el trabajo es una sola imagen (su portada).
    const proyecto = (id) => D.proyectos.find((x) => x.id === id);
    const rutaProy = (r) => `${base}img/proyectos/${r}`;
    const miniatura = (m) => rutaProy(m.poster || m.img.replace(/(\d+)\.webp$/, 't-$1.webp'));
    const mediosDe = (p) => p.medios || [{ img: p.img }];
    const conVideo = (p) => !!(p.medios && p.medios[0].video);           // la tarjeta reproduce el video…
    const conLaminas = (p) => !!(p.medios && !conVideo(p) && p.medios.length > 1); // …o recorre las láminas
    const insignia = (p) => (conVideo(p)
      ? `<span class="insignia">${icono('i-play')}${esc(p.medios[0].dur)}<span class="solo-lectores"> ${t('trab.video')}</span></span>`
      : conLaminas(p) ? `<span class="insignia">${icono('i-laminas')}${p.medios.length}<span class="solo-lectores"> ${t('trab.laminas')}</span></span>` : '');

    let tarjetaActiva = null;     // la tarjeta con el mouse encima
    const laminaTarjeta = new Map(); // id del trabajo → lámina que se ve en la tarjeta (0 = la portada)
    const precargados = new Set();
    function pintarTrabajos() {
      tarjetaActiva = null;
      $('#filtros-trabajos').innerHTML = filtros.map((f) => `<button class="chip" type="button" data-filtro="${f}" aria-pressed="${filtro === f}">${t('trab.' + f)}</button>`).join('');
      $('#lista-trabajos').innerHTML = D.proyectos.map((p) => `
        <div class="trabajo${p.medios ? ' trabajo--medios' : ''}${conLaminas(p) ? ' trabajo--laminas' : ''}" data-id="${p.id}"${filtro !== 'todos' && p.rol !== filtro ? ' hidden' : ''}>
          <button class="trabajo-abrir" type="button" data-proyecto="${p.id}">
            <img class="trabajo-portada" src="${rutaProy(p.img)}" alt="${esc(L(p.titulo))}" loading="lazy" />
            ${insignia(p)}${conLaminas(p) ? '<span class="trabajo-contador" aria-hidden="true"></span>' : ''}
            <span class="trabajo-info">${p.rol ? `<span class="trabajo-rol trabajo-rol--${p.rol}">${esc(t('trab.' + p.rol))}</span>` : ''}<strong>${esc(L(p.titulo))}</strong><span>${esc(L(p.sector))}${p.anio ? ' · ' + p.anio : ''}</span></span>
          </button>
          ${conLaminas(p) ? [-1, 1].map((paso) => `<button class="boton-circulo trabajo-flecha ${paso < 0 ? 'ant' : 'sig'}" type="button" tabindex="-1" data-paso="${paso}" aria-label="${esc(t(paso < 0 ? 'trab.ant' : 'trab.sig'))}">${icono(paso < 0 ? 'i-izq' : 'i-der')}</button>`).join('') : ''}
          ${p.instagram ? enlaceInstagram(p, 'trabajo-ig', icono('i-instagram'), t('trab.ver_ig_de', { proyecto: L(p.titulo) })) : ''}
        </div>`).join('');
    }

    // Vista previa en la tarjeta: solo con mouse (en el celular se toca y se abre el visor). Las láminas se recorren con el
    // mouse (el centro de la tarjeta) o con las flechas de los costados; el video suena (sin sonido) mientras el mouse
    // está encima, salvo con «reducir movimiento».
    function laminaDeTarjeta(card, i) {
      const p = proyecto(card.dataset.id), n = p.medios.length;
      i = Math.max(0, Math.min(n - 1, i));
      laminaTarjeta.set(p.id, i);
      $('.trabajo-portada', card).src = i === 0 ? rutaProy(p.img) : miniatura(p.medios[i]);
      $('.trabajo-contador', card).textContent = `${i + 1} / ${n}`;
    }
    function entrarTarjeta(card) {
      const p = proyecto(card.dataset.id);
      card.classList.add('viendo');
      if (conLaminas(p)) {
        laminaDeTarjeta(card, 0);
        if (!precargados.has(p.id)) { precargados.add(p.id); p.medios.forEach((m) => { new Image().src = miniatura(m); }); }
      } else if (conVideo(p) && !reduceMov.matches) {
        let v = $('.trabajo-video', card);
        if (!v) {
          v = document.createElement('video');
          Object.assign(v, { className: 'trabajo-video', muted: true, loop: true, playsInline: true, preload: 'auto', tabIndex: -1, poster: rutaProy(p.medios[0].poster), src: rutaProy(p.medios[0].video) });
          v.setAttribute('muted', ''); v.setAttribute('aria-hidden', 'true');
          $('.trabajo-portada', card).after(v);
        }
        v.play().then(() => v.classList.add('suena'), () => { /* el navegador no dejó reproducir: queda la portada */ });
      }
    }
    function salirTarjeta() {
      const card = tarjetaActiva;
      tarjetaActiva = null;
      if (!card) return;
      card.classList.remove('viendo');
      const p = proyecto(card.dataset.id);
      if (conLaminas(p)) { laminaTarjeta.delete(p.id); $('.trabajo-portada', card).src = rutaProy(p.img); }
      const v = $('.trabajo-video', card);
      if (v) { v.pause(); v.currentTime = 0; v.classList.remove('suena'); }
    }
    const lista = $('#lista-trabajos');
    lista.addEventListener('pointerover', (e) => {
      if (e.pointerType !== 'mouse') return;
      const card = e.target.closest('.trabajo--medios');
      if (card === tarjetaActiva) return;
      salirTarjeta();
      tarjetaActiva = card;
      if (card) entrarTarjeta(card);
    });
    lista.addEventListener('pointerleave', salirTarjeta);
    lista.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || !tarjetaActiva) return;
      const p = proyecto(tarjetaActiva.dataset.id);
      if (!conLaminas(p)) return;
      const r = tarjetaActiva.getBoundingClientRect(), u = (e.clientX - r.left) / r.width;
      if (u < 0.16 || u > 0.84) return; // en los costados están las flechas
      laminaDeTarjeta(tarjetaActiva, Math.floor((u - 0.16) / 0.68 * p.medios.length));
    });

    $('#trabajos').addEventListener('click', (e) => {
      const f = e.target.closest('[data-filtro]');
      if (f) { filtro = f.dataset.filtro; pintarTrabajos(); }
      const flecha = e.target.closest('.trabajo-flecha');
      if (flecha) {
        const card = flecha.closest('.trabajo');
        laminaDeTarjeta(card, (laminaTarjeta.get(card.dataset.id) || 0) + Number(flecha.dataset.paso));
        return;
      }
      const b = e.target.closest('[data-proyecto]');
      // Si se estaba viendo una lámina en la tarjeta, el visor se abre en esa.
      if (b) abrirProyecto(proyecto(b.dataset.proyecto), laminaTarjeta.get(b.dataset.proyecto) || 0);
    });

    // El visor: la lámina o el video, con flechas, contador, miniaturas (escritorio) o puntos (celular).
    const visor = $('#modal-proyecto');
    let abierto = null; // { p, medios, i }
    function abrirProyecto(p, desde = 0) {
      const s = servicio(p.servicio), medios = mediosDe(p), varias = medios.length > 1;
      abierto = { p, medios, i: Math.max(0, Math.min(medios.length - 1, desde)) };
      visor.innerHTML = botonCerrar() + '<div class="visor">'
        + `<div class="visor-medios${varias ? ' visor-medios--varias' : ''}"><div class="visor-escena">`
        + `<div class="visor-lamina" id="visor-lamina"${varias ? ` role="group" aria-roledescription="${esc(t('trab.carrusel'))}" aria-label="${esc(L(p.titulo))}"` : ''}></div>`
        + (varias
          ? '<span class="visor-contador" id="visor-contador" aria-hidden="true"></span>'
            + [-1, 1].map((paso) => `<button class="boton-circulo visor-flecha ${paso < 0 ? 'ant' : 'sig'}" type="button" data-lamina="${paso}" aria-label="${esc(t(paso < 0 ? 'trab.ant' : 'trab.sig'))}">${icono(paso < 0 ? 'i-izq' : 'i-der')}</button>`).join('')
          : '')
        + '</div>'
        + (varias
          ? '<div class="visor-tira">' + medios.map((m, k) => `<button class="visor-mini${m.video ? ' visor-mini--video' : ''}" type="button" data-ir="${k}" aria-label="${esc(t('trab.ir', { i: k + 1 }))}"><img src="${miniatura(m)}" alt="" loading="lazy" /></button>`).join('') + '</div>'
            + '<div class="visor-puntos" aria-hidden="true">' + medios.map(() => '<i></i>').join('') + '</div>'
            + '<p class="solo-lectores" id="visor-anuncio" aria-live="polite"></p>'
          : '')
        + '</div>'
        + `<div class="modal-cuerpo"><p class="ceja">${esc(L(s.titulo))}</p><h3>${esc(L(p.titulo))}</h3>`
        + (p.rol ? `<p><span class="trabajo-rol trabajo-rol--${p.rol}">${esc(t('trab.' + p.rol))}</span></p>` : '')
        + `<p><strong>${esc(L(p.sector))}</strong>${p.anio ? ' · ' + p.anio : ''}</p><p>${esc(L(p.texto))}</p>`
        + `<button class="boton boton--acento" type="button" data-similar="${p.id}">${t('trab.similar')}</button>`
        + (p.instagram ? enlaceInstagram(p, 'boton boton--borde', `${icono('i-instagram')}${esc(t('trab.ver_ig'))}`) : '')
        + '</div></div>';
      visor.showModal();
      pintarLamina(false);
    }
    function pintarLamina(avisar) {
      const { p, medios, i } = abierto, m = medios[i], n = medios.length, marco = $('#visor-lamina');
      marco.querySelectorAll('video').forEach((v) => v.pause());
      marco.innerHTML = m.video
        ? `<video class="visor-video" src="${rutaProy(m.video)}" poster="${rutaProy(m.poster)}" controls playsinline muted loop autoplay></video>`
        : `<img src="${rutaProy(m.img)}" alt="${esc(L(p.titulo))}${n > 1 ? ' — ' + esc(t('trab.lamina_de', { i: i + 1, n })) : ''}" />`;
      if (n < 2) return;
      $('#visor-contador').textContent = `${i + 1} / ${n}`;
      $$('.visor-mini', visor).forEach((b, k) => { b.setAttribute('aria-current', String(k === i)); if (k === i) b.scrollIntoView({ inline: 'center', block: 'nearest' }); });
      $$('.visor-puntos i', visor).forEach((d, k) => d.classList.toggle('activo', k === i));
      $$('.visor-flecha', visor).forEach((b) => { const sin = Number(b.dataset.lamina) < 0 ? i === 0 : i === n - 1; b.disabled = sin; });
      if (avisar) $('#visor-anuncio').textContent = t('trab.lamina_de', { i: i + 1, n });
      [i - 1, i + 1].forEach((k) => { if (medios[k] && medios[k].img) new Image().src = rutaProy(medios[k].img); });
    }
    function irALamina(k) {
      if (!abierto || k < 0 || k > abierto.medios.length - 1 || k === abierto.i) return;
      abierto.i = k;
      pintarLamina(true);
    }
    visor.addEventListener('click', (e) => {
      const paso = e.target.closest('[data-lamina]');
      if (paso) { irALamina(abierto.i + Number(paso.dataset.lamina)); return; }
      const mini = e.target.closest('[data-ir]');
      if (mini) { irALamina(Number(mini.dataset.ir)); return; }
      const b = e.target.closest('[data-similar]');
      if (!b) return;
      const p = proyecto(b.dataset.similar);
      seleccion.add(p.servicio);
      form.elements.mensaje.value = t('trab.mensaje', { proyecto: L(p.titulo) });
      pintarChipsCotizar();
      validarCampo(form, 'servicios', true);
      visor.close();
      irA('cotizar');
    });
    visor.addEventListener('keydown', (e) => {
      // Con el foco en el video, las flechas son del reproductor (adelantar y retroceder).
      if (!abierto || e.target.tagName === 'VIDEO' || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
      e.preventDefault();
      irALamina(abierto.i + (e.key === 'ArrowRight' ? 1 : -1));
    });
    // Deslizar con el dedo sobre la lámina: a la izquierda, la siguiente.
    let toque = null;
    visor.addEventListener('pointerdown', (e) => { toque = e.pointerType !== 'mouse' && e.target.closest('.visor-lamina') ? { x: e.clientX, y: e.clientY } : null; });
    visor.addEventListener('pointerup', (e) => {
      if (!toque || !abierto) return;
      const dx = e.clientX - toque.x, dy = e.clientY - toque.y;
      toque = null;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) irALamina(abierto.i + (dx < 0 ? 1 : -1));
    });
    visor.addEventListener('pointercancel', () => { toque = null; });
    // Al cerrar, el video se detiene (un diálogo cerrado seguiría sonando) y el visor queda vacío.
    visor.addEventListener('close', () => { visor.querySelectorAll('video').forEach((v) => v.pause()); abierto = null; visor.innerHTML = ''; });

    // Cotización
    function pintarChipsCotizar() {
      $('#cot-servicios').innerHTML = D.servicios.map((s) => `<button class="chip" type="button" data-servicio-cot="${s.id}" aria-pressed="${seleccion.has(s.id)}">${icono(s.icono)}${esc(L(s.titulo))}</button>`).join('');
    }
    function pintarRuta() {
      const donde = form.elements.donde.value;
      const ruta = $('#cot-ruta');
      ruta.hidden = !donde;
      if (donde) ruta.innerHTML = icono('i-whatsapp') + t('cot.ruta_miami'); // las cotizaciones de la agencia van a Miami
    }
    $('#cot-servicios').addEventListener('click', (e) => {
      const b = e.target.closest('[data-servicio-cot]');
      if (!b) return;
      const id = b.dataset.servicioCot;
      seleccion.has(id) ? seleccion.delete(id) : seleccion.add(id);
      pintarChipsCotizar();
      validarCampo(form, 'servicios', true);
    });
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-cotizar]');
      if (!b) return;
      seleccion.add(b.dataset.cotizar);
      pintarChipsCotizar();
      validarCampo(form, 'servicios', true);
      irA('cotizar');
    });
    form.addEventListener('change', (e) => { if (e.target.name === 'donde') pintarRuta(); });
    limpiarErrorAlEscribir(form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = (n) => form.elements[n].value.trim();
      const oks = [
        validarCampo(form, 'servicios', seleccion.size > 0),
        validarCampo(form, 'nombre', v('nombre') !== ''),
        validarCampo(form, 'telefono', v('telefono').replace(/\D/g, '').length >= 7),
        validarCampo(form, 'donde', v('donde') !== ''),
      ];
      if (oks.includes(false)) { $('.con-error input, [data-error]:not([hidden])', form)?.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
      const lineas = [t('cot.wa_hola'), '',
        `• ${t('cot.wa_servicios')}: ${D.servicios.filter((s) => seleccion.has(s.id)).map((s) => L(s.titulo)).join(', ')}`];
      if (v('negocio')) lineas.push(`• ${t('cot.wa_negocio')}: ${v('negocio')}`);
      lineas.push(`• ${t('cot.wa_donde')}: ${t('cot.' + v('donde'))}`);
      lineas.push(`• ${t('cot.wa_cuando')}: ${t('cot.' + v('cuando'))}`);
      if (v('mensaje')) lineas.push(`• ${t('cot.wa_mensaje')}: ${v('mensaje')}`);
      lineas.push('', `${t('cot.wa_contacto')}: ${v('nombre')} · ${v('telefono')}${v('correo') ? ' · ' + v('correo') : ''}`);
      const mensaje = lineas.join('\n');
      copiaAlCorreo({ tipo: 'cotizacion', destino: 'miami', nombre: v('nombre'), telefono: v('telefono'), correo: v('correo'), mensaje });
      abrirWhatsApp('miami', mensaje);
    });

    // «¿Por qué farto?»: el video de Juan (alojado en la web desde el 10 nov 2026) se abre en una ventana y arranca solo, sin sonido (no trae
    // audio). Con «reducir movimiento» no arranca: se le da play. El video solo se baja al abrir la ventana y se quita al cerrarla.
    const ventanaVideo = $('#modal-video');
    $('#abrir-video').addEventListener('click', () => {
      const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
      ventanaVideo.innerHTML = botonCerrar() + '<div class="video-cuerpo">'
        + `<video src="${base}${esc(D.nosotros.video)}" poster="${base}${esc(D.nosotros.poster)}" controls playsinline muted loop preload="auto"${quieto ? '' : ' autoplay'} aria-label="${esc(t('nos.video'))}"></video>`
        + `<p class="video-pie">${esc(t('nos.video_nota'))}</p>`
        + `<a class="boton boton--borde boton--chico" href="${esc(D.nosotros.instagram)}" target="_blank" rel="noopener">${icono('i-instagram')}${esc(t('trab.ver_ig'))}</a></div>`;
      ventanaVideo.showModal();
    });
    ventanaVideo.addEventListener('close', () => { $('video', ventanaVideo)?.pause(); ventanaVideo.innerHTML = ''; });

    alCambiarIdioma.push(pintarCinta, pintarServicios, pintarKit, pintarTrabajos, pintarChipsCotizar, pintarRuta);
  }

  /* ── La Fartedá: tienda con precios por país y pedido por WhatsApp ── */
  function iniciarMerch() {
    const productos = [];
    ['camiseta', 'tote'].forEach((tipo) => D.disenos.forEach((d) => productos.push({ id: `${tipo}-${d.id}`, tipo, diseno: d, img: `${tipo}-${d.id}.webp` })));
    let pais = leer('nfg-pais') === 'col' ? 'col' : 'usa';
    let filtro = 'todo';
    let carrito = [];
    try { carrito = JSON.parse(leer('nfg-carrito') || '[]').filter((l) => productos.some((p) => p.id === l.producto)); } catch (e) { carrito = []; }
    let actual = null; // producto abierto en la ficha
    // Cómo recibe el pedido quien compra en EE.UU. (Juan, 9 y 10 nov 2026: «por zona y zip code»): por su código postal se sabe si está en el área
    // de Miami (D.envio.zipLocal), donde elige pick-up / a medio camino o envío; fuera, se le envía y el costo depende de la zona. No hay tarifas
    // todavía: no se calcula nada, se confirma en el chat. En Colombia el envío va aparte: desde COP 20.000 (D.envio.copMinimo).
    let zip = '';     // solo cifras, hasta 5
    let modo = null;  // en el área de Miami: 'recoger' o 'envio' (null = sin elegir)
    const zipListo = () => /^\d{5}$/.test(zip);
    const zipLocal = () => zipListo() && D.envio.zipLocal.includes(zip.slice(0, 3));
    const entrega = () => (!zipListo() ? null : zipLocal() ? modo : 'envio'); // null = falta el ZIP o elegir
    let eleccion = null;
    const ficha = $('#modal-producto');
    const cajon = $('#cajon-carrito');

    const opcionesDe = (p) => p.diseno[p.tipo];
    function precio(p) {
      const tabla = p.tipo === 'tote' ? D.precios.tote : D.precios[p.diseno.precioCamiseta || 'camiseta'];
      return pais === 'usa' ? tabla.usd : tabla.cop;
    }
    function dinero(n) {
      return pais === 'usa'
        ? '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USD'
        : '$' + Math.round(n).toLocaleString('es-CO') + ' COP';
    }
    const nombreTipo = (p) => t(p.tipo === 'tote' ? 'lf.tote' : 'lf.camiseta');
    function nombreColor(p, c) {
      const nota = opcionesDe(p).notaColor && opcionesDe(p).notaColor[c];
      return L(D.colores[c].nombre) + (nota ? ' · ' + L(nota) : '');
    }
    const puntos = (p) => `<span class="puntos">${opcionesDe(p).colores.map((c) => `<span class="punto" style="background:${D.colores[c].hex}" title="${esc(L(D.colores[c].nombre))}"></span>`).join('')}</span>`;

    function pintarBarra() {
      $('#lf-filtros').innerHTML = [['todo', 'lf.todos'], ['camiseta', 'lf.camisetas'], ['tote', 'lf.totes']]
        .map(([id, clave]) => `<button class="chip" type="button" data-filtro="${id}" aria-pressed="${filtro === id}">${t(clave)}</button>`).join('');
      $$('[data-pais]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pais === pais)));
      $('#lf-nota-envio').innerHTML = icono('i-envio') + t(pais === 'usa' ? 'lf.nota_usa' : 'lf.nota_col', { monto: dinero(D.envio.copMinimo) });
    }
    function pintarProductos() {
      $('#lista-productos').innerHTML = productos.filter((p) => filtro === 'todo' || p.tipo === filtro).map((p) => `
        <button class="producto" type="button" data-producto="${p.id}">
          ${p.diseno.masVendido && p.tipo === 'camiseta' ? `<span class="etiqueta-producto">${t('lf.mas_vendido')}</span>` : ''}
          <img src="${base}img/productos/${p.img}" alt="${esc(p.diseno.nombre)} — ${esc(nombreTipo(p))}" loading="lazy" />
          <span class="producto-info">
            <span class="producto-tipo">${esc(nombreTipo(p))}</span>
            <span class="producto-nombre">${esc(p.diseno.nombre)}</span>
            <span class="producto-precio">${dinero(precio(p))}</span>
            ${puntos(p)}
          </span>
        </button>`).join('');
    }
    $('#coleccion').addEventListener('click', (e) => {
      const f = e.target.closest('[data-filtro]');
      if (f) { filtro = f.dataset.filtro; pintarBarra(); pintarProductos(); }
      const b = e.target.closest('[data-pais]');
      if (b) cambiarPais(b.dataset.pais);
      const p = e.target.closest('[data-producto]');
      if (p) abrirFicha(productos.find((x) => x.id === p.dataset.producto));
    });
    function cambiarPais(nuevo) {
      pais = nuevo;
      guardar('nfg-pais', pais);
      pintarBarra(); pintarProductos(); pintarCarrito();
      if (ficha.open) pintarFicha();
    }

    function abrirFicha(p) {
      actual = p;
      const op = opcionesDe(p);
      eleccion = { color: op.colores[0], talla: null, estilo: op.estilos ? 0 : null, cantidad: 1, error: false };
      pintarFicha();
      ficha.showModal();
    }
    function pintarFicha() {
      const p = actual;
      const op = opcionesDe(p);
      const grupo = (titulo, extra, html) => `<div class="grupo-opciones"><h4>${titulo}${extra ? `<span>${extra}</span>` : ''}</h4><div class="opciones">${html}</div></div>`;
      ficha.innerHTML = botonCerrar() + '<div class="ficha">'
        + `<div class="ficha-img"><img src="${base}img/productos/${p.img}" alt="${esc(p.diseno.nombre)}" /></div>`
        + '<div class="modal-cuerpo">'
        +   `<p class="producto-tipo">${esc(nombreTipo(p))}${p.diseno.masVendido && p.tipo === 'camiseta' ? ' · ' + t('lf.mas_vendido') : ''}</p>`
        +   `<h3>${esc(p.diseno.nombre)}</h3>`
        +   `<p>${esc(L(p.diseno.texto))}${p.tipo === 'tote' ? ' ' + esc(t('lf.tote_texto')) : ''}${op.detalle ? ' ' + esc(L(op.detalle)) : ''}</p>`
        +   `<p class="ficha-precio">${dinero(precio(p))}<small>${t(pais === 'usa' ? 'lf.envio_usa' : 'lf.envio_col', { monto: dinero(D.envio.copMinimo) })}</small></p>`
        +   grupo(t('lf.color'), esc(nombreColor(p, eleccion.color)), op.colores.map((c) => `<button class="opcion-btn" type="button" data-color="${c}" aria-pressed="${eleccion.color === c}"><span class="punto" style="background:${D.colores[c].hex}"></span>${esc(L(D.colores[c].nombre))}</button>`).join(''))
        +   (op.estilos ? grupo(t('lf.estilo'), '', op.estilos.map((s, i) => `<button class="opcion-btn" type="button" data-estilo="${i}" aria-pressed="${eleccion.estilo === i}">${esc(L(s))}</button>`).join('')) : '')
        +   (p.tipo === 'camiseta' ? grupo(t('lf.talla'), t('lf.tallas_nota'), D.tallas.map((s) => `<button class="opcion-btn" type="button" data-talla="${s}" aria-pressed="${eleccion.talla === s}">${s}</button>`).join(''))
              + `<p class="error-campo"${eleccion.error ? '' : ' hidden'}>${t('lf.err_talla')}</p>` : '')
        +   `<div class="grupo-opciones"><h4>${t('lf.cantidad')}</h4><div class="fila-agregar">`
        +     `<div class="cantidad"><button type="button" data-cant="-1" aria-label="${esc(t('car.menos'))}">${icono('i-menos')}</button><output>${eleccion.cantidad}</output><button type="button" data-cant="1" aria-label="${esc(t('car.mas'))}">${icono('i-mas')}</button></div>`
        +     `<button class="boton boton--acento" type="button" id="agregar">${icono('i-bolsa-compra')} ${t('lf.agregar')}</button>`
        +   '</div></div>'
        + '</div></div>';
    }
    ficha.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b || b.hasAttribute('data-cerrar')) return;
      if (b.dataset.color) eleccion.color = b.dataset.color;
      else if (b.dataset.estilo) eleccion.estilo = Number(b.dataset.estilo);
      else if (b.dataset.talla) { eleccion.talla = b.dataset.talla; eleccion.error = false; }
      else if (b.dataset.cant) eleccion.cantidad = Math.min(20, Math.max(1, eleccion.cantidad + Number(b.dataset.cant)));
      else if (b.id === 'agregar') {
        if (actual.tipo === 'camiseta' && !eleccion.talla) { eleccion.error = true; pintarFicha(); return; }
        agregar();
        return;
      } else return;
      pintarFicha();
    });
    function agregar() {
      const linea = { producto: actual.id, color: eleccion.color, talla: eleccion.talla, estilo: eleccion.estilo };
      const igual = carrito.find((l) => l.producto === linea.producto && l.color === linea.color && l.talla === linea.talla && l.estilo === linea.estilo);
      if (igual) igual.cantidad = Math.min(20, igual.cantidad + eleccion.cantidad);
      else carrito.push({ ...linea, cantidad: eleccion.cantidad });
      guardarCarrito();
      ficha.close();
      pintarCarrito();
      const contador = $('#contador-carrito');
      contador.classList.remove('latido'); void contador.offsetWidth; contador.classList.add('latido');
      cajon.showModal();
    }

    function guardarCarrito() { guardar('nfg-carrito', JSON.stringify(carrito)); }
    function detalleLinea(l, p) {
      const partes = [nombreTipo(p), nombreColor(p, l.color)];
      if (l.estilo != null && opcionesDe(p).estilos) partes.push(L(opcionesDe(p).estilos[l.estilo]));
      if (opcionesDe(p).detalle) partes.push(L(opcionesDe(p).detalle).replace(/\.$/, '').toLowerCase());
      if (l.talla) partes.push(`${t('lf.talla_corta')} ${l.talla}`);
      return partes.join(', ');
    }
    function total() { return carrito.reduce((s, l) => s + precio(productos.find((p) => p.id === l.producto)) * l.cantidad, 0); }
    // Lo que dice la fila «Envío» y el total: en pesos, el envío mínimo se suma y el total es «desde».
    function textoEnvio() {
      if (pais === 'col') return t('car.envio_desde', { monto: dinero(D.envio.copMinimo) });
      const e = entrega();
      return t(e === 'recoger' ? 'car.envio_recoger' : e === 'envio' ? 'car.envio_chat' : 'car.envio_zip');
    }
    const textoTotal = () => (pais === 'col' ? t('car.total_desde', { total: dinero(total() + D.envio.copMinimo) }) : dinero(total()));
    // Lo que va bajo el ZIP: qué hacer, o las dos opciones si está en el área de Miami.
    function htmlEntrega() {
      if (!zipListo()) return `<p class="entrega-nota">${t('car.zip_falta')}</p>`;
      if (!zipLocal()) return `<p class="entrega-nota">${icono('i-envio')}<span>${t('car.zip_lejos')}</span></p>`;
      return `<p class="entrega-nota">${icono('i-lugar')}<span>${t('car.zip_local')}</span></p><div class="opciones">`
        + [['recoger', 'car.modo_recoger', 'car.modo_recoger_sub'], ['envio', 'car.modo_envio', 'car.modo_envio_sub']].map(([id, titulo, sub]) =>
          `<button class="opcion-btn opcion-zona" type="button" data-modo="${id}" aria-pressed="${modo === id}"><strong>${t(titulo)}</strong><small>${t(sub)}</small></button>`).join('')
        + '</div>';
    }
    // Repinta solo la entrega y la fila del envío (sin tocar el campo del ZIP, para no perder lo que se está escribiendo).
    function pintarEntrega() {
      const caja = $('#lf-entrega', cajon);
      if (caja) caja.innerHTML = htmlEntrega();
      const valor = $('#lf-envio-valor', cajon);
      if (valor) valor.textContent = textoEnvio();
    }
    function pintarCarrito() {
      const unidades = carrito.reduce((s, l) => s + l.cantidad, 0);
      const contador = $('#contador-carrito');
      contador.hidden = unidades === 0;
      contador.textContent = unidades;
      const datos = { nombre: cajon.querySelector('[name="nombre"]')?.value || '', ciudad: cajon.querySelector('[name="ciudad"]')?.value || '', notas: cajon.querySelector('[name="notas"]')?.value || '' };
      cajon.innerHTML = `<div class="cajon-cabeza"><h3>${t('car.titulo')}</h3>${botonCerrar()}</div>`
        + '<div class="cajon-lista">'
        + (carrito.length === 0
          ? `<div class="cajon-vacio">${icono('i-bolsa-compra')}<p>${t('car.vacio')}</p><button class="boton boton--negro boton--chico" type="button" data-cerrar>${t('car.seguir')}</button></div>`
          : carrito.map((l, i) => {
            const p = productos.find((x) => x.id === l.producto);
            return `<div class="linea-carrito"><img src="${base}img/productos/${p.img}" alt="" />`
              + `<div><strong>${esc(p.diseno.nombre)}</strong><small>${esc(detalleLinea(l, p))}</small>`
              + `<div class="cantidad cantidad--chica"><button type="button" data-linea="${i}" data-cant="-1" aria-label="${esc(t('car.menos'))}">${icono('i-menos')}</button><output>${l.cantidad}</output><button type="button" data-linea="${i}" data-cant="1" aria-label="${esc(t('car.mas'))}">${icono('i-mas')}</button></div></div>`
              + `<div class="linea-precio">${dinero(precio(p) * l.cantidad)}<button class="quitar" type="button" data-quitar="${i}" aria-label="${esc(t('car.quitar'))}">${icono('i-basura')}</button></div></div>`;
          }).join(''))
        + '</div>'
        + (carrito.length === 0 ? '' : '<form class="cajon-pie" id="form-pedido" novalidate>'
          + '<div class="totales">'
          +   `<div><span>${t('car.subtotal')}</span><span>${dinero(total())}</span></div>`
          +   `<div><span>${t('car.envio')}</span><span id="lf-envio-valor">${textoEnvio()}</span></div>`
          +   `<div class="total"><span>${t('car.total')}</span><span>${textoTotal()}</span></div>`
          + '</div>'
          + (pais === 'usa'
            ? `<div class="grupo-opciones grupo-zona"><h4>${t('car.zona')}</h4>`
              + `<label class="campo campo-zip"><span class="etiqueta-campo">${t('car.zip')}</span><input name="zip" inputmode="numeric" autocomplete="postal-code" maxlength="5" placeholder="33180" value="${esc(zip)}" /></label>`
              + `<div id="lf-entrega" aria-live="polite">${htmlEntrega()}</div>`
              + `<p class="error-campo" data-error="zip" hidden>${t('car.err_zip')}</p><p class="error-campo" data-error="zona" hidden>${t('car.err_zona')}</p></div>`
            : '')
          + '<div class="fila-2">'
          +   `<label class="campo"><span class="etiqueta-campo">${t('car.nombre')}</span><input name="nombre" autocomplete="name" value="${esc(datos.nombre)}" /></label>`
          +   `<label class="campo"><span class="etiqueta-campo">${t(pais === 'usa' ? 'car.ciudad_usa' : 'car.ciudad')}</span><input name="ciudad" autocomplete="address-level2" value="${esc(datos.ciudad)}" /></label>`
          + '</div>'
          + `<label class="campo"><span class="etiqueta-campo">${t('car.notas')} <span class="opcional">(${t('cot.opcional')})</span></span><textarea name="notas" rows="2" placeholder="${esc(t('car.notas_ph'))}">${esc(datos.notas)}</textarea></label>`
          + `<p class="error-campo" data-error="pedido" hidden>${t('car.err')}</p>`
          + `<p class="ruta">${icono('i-whatsapp')}${esc(t('car.ruta', { destino: t(pais === 'col' ? 'destino.lf_cartagena' : 'destino.lf_miami') }))}</p>`
          + `<button class="boton boton--acento boton--ancho" type="submit">${icono('i-whatsapp')} ${t('car.enviar')}</button>`
          + '</form>');
    }
    cajon.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.modo) { // pick-up o envío, en el área de Miami: solo cambia la entrega
        modo = b.dataset.modo;
        pintarEntrega();
        const errZona = $('[data-error="zona"]', cajon);
        if (errZona) errZona.hidden = true;
        return;
      } else if (b.dataset.linea != null) {
        const l = carrito[Number(b.dataset.linea)];
        l.cantidad = Math.min(20, l.cantidad + Number(b.dataset.cant));
        if (l.cantidad < 1) carrito.splice(Number(b.dataset.linea), 1);
      } else if (b.dataset.quitar != null) {
        carrito.splice(Number(b.dataset.quitar), 1);
      } else return;
      guardarCarrito();
      pintarCarrito();
    });
    cajon.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const nombre = f.elements.nombre.value.trim();
      const ciudad = f.elements.ciudad.value.trim();
      const zipOk = pais !== 'usa' || zipListo();
      const zonaOk = pais !== 'usa' || !zipListo() || entrega() !== null;
      const ok = nombre !== '' && ciudad !== '' && zipOk && zonaOk;
      $('[data-error="pedido"]', f).hidden = nombre !== '' && ciudad !== '';
      const errZip = $('[data-error="zip"]', f), errZona = $('[data-error="zona"]', f);
      if (errZip) { errZip.hidden = zipOk; f.elements.zip.closest('.campo').classList.toggle('con-error', !zipOk); }
      if (errZona) errZona.hidden = zonaOk;
      f.elements.nombre.closest('.campo').classList.toggle('con-error', !nombre);
      f.elements.ciudad.closest('.campo').classList.toggle('con-error', !ciudad);
      if (!ok) return;
      // Con la fecha (mes, día y dos letras o cifras al azar) no se repite casi nunca: LF-1026-A7. Antes era LF-#### al azar.
      const fecha = new Date(), dos = (n) => String(n).padStart(2, '0'), azar = () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)];
      const numero = `LF-${dos(fecha.getMonth() + 1)}${dos(fecha.getDate())}-${azar()}${azar()}`;
      const lineas = [t('lf.wa_hola'), t('lf.wa_pedido', { numero, pais: t(pais === 'usa' ? 'lf.usa_nombre' : 'lf.col_nombre') }), ''];
      carrito.forEach((l) => {
        const p = productos.find((x) => x.id === l.producto);
        lineas.push(`• ${l.cantidad} × ${p.diseno.nombre} — ${detalleLinea(l, p)} — ${dinero(precio(p) * l.cantidad)}`);
      });
      lineas.push('');
      if (pais === 'col') lineas.push(t('lf.wa_subtotal', { total: dinero(total()) }), t('lf.wa_envio_col', { monto: dinero(D.envio.copMinimo) }), t('lf.wa_total_desde', { total: dinero(total() + D.envio.copMinimo) }));
      else lineas.push(t('lf.wa_total', { total: dinero(total()) }), t(entrega() === 'recoger' ? 'lf.wa_envio_miami' : 'lf.wa_envio_otro', { zip }));
      lineas.push('');
      lineas.push(`${t('lf.wa_nombre')}: ${nombre} · ${t('lf.wa_ciudad')}: ${ciudad}`);
      const notas = f.elements.notas.value.trim();
      if (notas) lineas.push(`${t('lf.wa_notas')}: ${notas}`);
      const mensaje = lineas.join('\n');
      copiaAlCorreo({ tipo: 'lafarteda', destino: pais === 'col' ? 'cartagena' : 'miami', ref: numero, moneda: pais === 'col' ? 'COP' : 'USD', nombre, ciudad, mensaje });
      abrirWhatsApp(pais === 'col' ? 'lf_cartagena' : 'lf_miami', mensaje);
    });
    cajon.addEventListener('input', (e) => {
      if (e.target.name) e.target.closest('.campo')?.classList.remove('con-error');
      if (e.target.name === 'zip') { // solo cifras; al completar los 5 se sabe si es el área de Miami
        const limpio = e.target.value.replace(/\D/g, '').slice(0, 5);
        if (limpio !== e.target.value) e.target.value = limpio;
        const eraLocal = zipLocal();
        zip = limpio;
        if (zipLocal() !== eraLocal) modo = null;
        pintarEntrega();
        const errZip = $('[data-error="zip"]', cajon);
        if (errZip) errZip.hidden = true;
      }
    });
    $('#abrir-carrito').addEventListener('click', () => { pintarCarrito(); cajon.showModal(); });

    alCambiarIdioma.push(pintarBarra, pintarProductos, pintarCarrito, () => { if (ficha.open) pintarFicha(); });
  }

  /* ── WuandaCrafts: catálogo estilo Etsy, ficha de cada pieza y «Tu pedido» (pase 4) ── */
  // Maqueta A, elegida por Nicola el 26 oct 2026 (docs/maquetas/pase-4-wuandacrafts). Tres pantallas en una sola página: el inicio (héroe,
  // catálogo y piezas recientes), la ficha de una pieza (#pieza/<id>) y el cajón «Tu pedido». El catálogo es D.wc (datos.js).
  // Todavía no hay precios ni medidas confirmadas por Juan: se ve «$ —» y las etiquetas «por definir» y «ejemplo».
  // El pedido sale por WhatsApp (Miami o Cartagena) y, desde negrofarto.com, con copia al correo. El logo o la imagen de cada pieza viaja
  // solo por el correo (hasta 5 por pedido): si no puede ir, el mensaje de WhatsApp dice que la persona lo envía por el chat.
  function iniciarWuanda() {
    const W = D.wc;
    W.catalogo.forEach((p) => { if (p.fotos && !p.foto) p.foto = p.fotos[0].img; }); // la portada de una pieza con galería es su primera foto
    const piezaDe = (id) => W.catalogo.find((x) => x.id === id);
    const estiloDe = (p, id) => (p.variantes || []).find((v) => v.id === id);
    // Precios (Juan, 10 nov 2026): en dólares, con el envío incluido, por pieza y según la cantidad de la línea (W.escalas y W.tarifas). La tarifa
    // sale del estilo elegido o, si no tiene, de la pieza; la calcomanía no tiene escalas: solo un «desde» (precioDesde).
    const usd = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const tarifaDe = (p, estilo) => W.tarifas[(estiloDe(p, estilo) || {}).precio || p.precio] || null;
    const escalonDe = (cantidad) => Math.max(0, W.escalas.findIndex((r) => cantidad >= r.desde && (r.hasta == null || cantidad <= r.hasta)));
    // { unidad, desde }: el precio por pieza para esa cantidad y si es un «desde». null si la pieza no tiene precio.
    function precioDe(p, estilo, cantidad) {
      const tf = tarifaDe(p, estilo);
      if (tf) return { unidad: tf[escalonDe(cantidad)], desde: false };
      return p.precioDesde != null ? { unidad: p.precioDesde, desde: true } : null;
    }
    const montoTxt = (n, desde) => (desde ? t('wc.desde_precio', { precio: usd(n) }) : usd(n));
    // La tarjeta: el precio de 1 y el de 12 o más («desde» si cambia según el estilo).
    function precioTarjeta(p) {
      const tarifas = (p.variantes && p.variantes.some((v) => v.precio) ? p.variantes.map((v) => W.tarifas[v.precio || p.precio]) : [W.tarifas[p.precio]]).filter(Boolean);
      if (!tarifas.length) return p.precioDesde != null ? `<b>${esc(t('wc.desde_precio', { precio: usd(p.precioDesde) }))}</b>` : `${esc(t('wc.desde'))} <b>$ —</b>`;
      const uno = Math.min(...tarifas.map((tf) => tf[0])), mucho = Math.min(...tarifas.map((tf) => tf[tf.length - 1]));
      const varios = new Set(tarifas.map((tf) => tf[0])).size > 1;
      return `<b>${esc(varios ? t('wc.desde_precio', { precio: usd(uno) }) : usd(uno))}</b> <small>${esc(t('wc.precio_cantidad', { n: W.escalas[W.escalas.length - 1].desde, precio: usd(mucho) }))}</small>`;
    }
    // El total del pedido: la suma de las líneas («desde» si alguna lo es) y, si la persona quiere, la propina.
    let propina = 0; // por ciento: 0, 10, 15 o 20 (Juan, 10 nov 2026: «¿podemos colocar algo que la gente deje tip?»)
    function cuentas() {
      let subtotal = 0, desde = false;
      pedido.forEach((l) => { const pr = precioDe(piezaDe(l.pieza), l.estilo, l.cantidad); if (pr) { subtotal += pr.unidad * l.cantidad; desde = desde || pr.desde; } });
      const extra = Math.round(subtotal * propina) / 100;
      return { subtotal, extra, total: subtotal + extra, desde };
    }
    const catDe = (id) => W.categorias.find((x) => x.id === id);
    const fuenteDe = (id) => W.fuentes.find((x) => x.id === id) || W.fuentes[0];
    const colorDe = (id) => (id && W.colores[id] ? L(W.colores[id].nombre) : '');
    const vistaInicio = $('#vista-inicio');
    const vistaPieza = $('#vista-pieza');
    const cajon = $('#cajon-pedido');
    const barra = $('#barra-pedido');
    const nd = (clave = 'wc.nd') => `<span class="nd">${esc(t(clave))}</span>`;
    const TOPE = W.topeMb * 1048576;
    const ACEPTA = 'image/png,image/jpeg,image/webp,image/gif,application/pdf,.png,.jpg,.jpeg,.webp,.gif,.pdf';
    const pesoTxt = (b) => (b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB');
    const saltarA = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ block: 'start', behavior: 'instant' }); };
    const diasHasta = (valor) => (valor ? (new Date(valor + 'T12:00:00') - new Date()) / 864e5 : Infinity);

    let categoria = 'todo';
    let filtroTamano = 'todos';
    let elec = null; // lo que se está eligiendo en la ficha abierta
    let pedido = []; // las líneas de «Tu pedido»
    let scrollInicio = 0;
    let hashAntes = '';
    let enviando = false;

    /* «Tu pedido» se guarda en el navegador, sin los archivos: un File no cabe en localStorage. Una línea que tenía logo vuelve sin él y
       pide subirlo de nuevo (o, si no, el mensaje de WhatsApp dice que se envía por el chat). Todo lo que vuelve se sanea. */
    const CLAVE = 'nfg-pedido-wc';
    try {
      pedido = JSON.parse(leer(CLAVE) || '[]').filter((l) => piezaDe(l.pieza)).map((l) => ({
        pieza: l.pieza, estilo: estiloDe(piezaDe(l.pieza), l.estilo) ? l.estilo : '', tamano: String(l.tamano || '').slice(0, 20), color: W.colores[l.color] ? l.color : '',
        cantidad: Math.min(500, Math.max(1, parseInt(l.cantidad, 10) || 1)), texto: String(l.texto || '').slice(0, 60), fuente: fuenteDe(l.fuente).id,
        notas: String(l.notas || '').slice(0, 500), archivo: null, archivoNombre: String(l.archivoNombre || '').slice(0, 120),
      }));
    } catch (e) { pedido = []; }
    const guardarPedido = () => guardar(CLAVE, JSON.stringify(pedido.map(({ archivo, ...resto }) => resto)));

    /* ── El catálogo ── */
    const fotoHtml = (p, i = 0) => (p.foto
      ? `<img src="${base}img/wuanda/${p.fotos ? p.fotos[i].img : p.foto}" alt="${esc(L(p.pie || p.titulo))}" style="object-position:${p.encuadre || '50% 50%'}" />`
      : `<div class="pz-tile">${icono(p.icono)}<span class="pz-pendiente">${esc(t('wc.foto_pronto'))}</span></div>`);
    const insignia = (p) => (p.insignia ? `<span class="pz-insignia">${esc(t(p.insignia === 'nuevo' ? 'wc.nuevo' : 'wc.mas_vendido'))}</span>` : '');
    const tarjeta = (p) => `
      <a class="pz tono-${p.tono}" href="#pieza/${p.id}">
        <div class="pz-foto">${fotoHtml(p)}${insignia(p)}</div>
        <div class="pz-info"><span class="pz-cat">${esc(L(catDe(p.cat).titulo))}</span><strong class="pz-nombre">${esc(L(p.titulo))}</strong><span class="pz-precio">${precioTarjeta(p)}</span></div>
      </a>`;
    function pintarCatalogo() {
      $('#wc-tabs').innerHTML = [{ id: 'todo', icono: 'i-todo', titulo: t('wc.todo') }, ...W.categorias.map((c) => ({ id: c.id, icono: c.icono, titulo: L(c.titulo) }))]
        .map((c) => `<button class="cat-tab" type="button" data-cat="${c.id}" aria-pressed="${categoria === c.id}">${icono(c.icono)}${esc(c.titulo)}</button>`).join('');
      // Los termos tienen una subcategoría (Juan, 23 oct 2026): "también por onzas", el tamaño. Los estilos (lata, botella, huevo…) ya no son un
      // filtro: desde el 9 nov 2026 son las opciones dentro de cada termo.
      const sub = $('#wc-sub');
      sub.hidden = categoria !== 'termos';
      if (categoria === 'termos') {
        const chips = (lista, actual, atributo) => lista.map(([id, txt]) => `<button class="chip" type="button" data-${atributo}="${esc(id)}" aria-pressed="${actual === id}">${esc(txt)}</button>`).join('');
        sub.innerHTML = `<div class="sub-grupo"><span class="rotulo">${esc(t('wc.tamano'))}</span><div class="chips chips--claro">${chips([['todos', t('wc.tamano_todos')], ...W.tamanosFiltro.map((x) => [x, x])], filtroTamano, 'f-tamano')}${nd('wc.tamano_otros')}</div></div>`;
      }
      const lista = W.catalogo.filter((p) => (categoria === 'todo' || p.cat === categoria)
        && (categoria !== 'termos' || filtroTamano === 'todos' || (p.tamanos || []).includes(filtroTamano)));
      $('#wc-grilla').innerHTML = lista.length ? lista.map(tarjeta).join('') : `<p class="cat-vacio">${esc(t('wc.vacio_filtro'))}</p>`;
    }
    function elegirCategoria(id) { categoria = id; filtroTamano = 'todos'; pintarCatalogo(); }

    /* ── Tendedero de fotos (recursos/tendedero.js): las piezas cuelgan de una cuerda que se arrastra, y las de portada, de la cortina del
       héroe. «¿Quieres uno así?» lleva a la categoría de esa pieza en el catálogo. ── */
    const tipoDe = (id) => D.tipos.find((x) => x.id === id);
    const fotoPieza = (p) => ({
      img: `${base}img/wuanda/${p.img}`, encuadre: p.encuadre, alt: L(p.titulo), titulo: L(p.titulo),
      nota: L(p.nota || tipoDe(p.tipo).titulo), texto: L(tipoDe(p.tipo).texto), enlace: p.instagram,
    });
    const textosTendedero = () => ({
      region: t('wc.piezas_ceja'), carrusel: t('tend.carrusel'), anterior: t('tend.anterior'), siguiente: t('tend.siguiente'),
      accion: t('wc.quiero'), anuncio: (n, total, titulo) => t('tend.anuncio', { n, total, titulo }),
      enlace: (titulo) => t('trab.ver_ig_de', { proyecto: titulo }),
    });
    const textosCortina = () => ({ ver: (titulo) => t('tend.ver', { titulo }) });
    const portada = D.piezas.filter((p) => p.portada);
    const tendedero = window.NFG_TENDEDERO.carrusel($('#tendedero-piezas'), { items: D.piezas.map(fotoPieza), textos: textosTendedero(), accion: 'pieza' });
    const cortina = window.NFG_TENDEDERO.cortina($('#cortina-heroe'), {
      items: portada.map(fotoPieza), cuerdas: 3, enlace: '#piezas', textos: textosCortina(),
      alElegir: (i) => { irA('piezas'); tendedero.ir(D.piezas.indexOf(portada[i])); },
    });
    function pintarPiezas() {
      tendedero.actualizar(D.piezas.map(fotoPieza), textosTendedero());
      cortina.actualizar(portada.map(fotoPieza), textosCortina());
    }

    /* ── La ficha de una pieza ── */
    const nuevaEleccion = (p) => ({
      id: p.id, estilo: (p.variantes || [])[0]?.id || '', foto: 0, tamano: (p.tamanos || [])[0] || '', color: (p.colores || [])[0] || '', cantidad: 1, pers: p.unidad === 'pliego', texto: '',
      fuente: W.fuentes[0].id, notas: '', archivo: null, archivoUrl: '', galeria: 'pliego',
    });
    function liberarVista() { if (elec && elec.archivoUrl) URL.revokeObjectURL(elec.archivoUrl); }
    const luz = (hex) => { const n = parseInt(hex.slice(1), 16); return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; };

    // La calcomanía: el pliego con su área de impresión y el nombre en la fuente elegida (idea de Nicola, 23 oct 2026).
    const tamanoNombre = (texto) => { const n = [...texto].length; return n <= 6 ? 't1' : n <= 10 ? 't2' : n <= 16 ? 't3' : n <= 28 ? 't4' : 't5'; };
    function htmlHoja(mini) {
      const f = fuenteDe(elec.fuente);
      const hex = elec.color ? W.colores[elec.color].hex : '#6b4a8a';
      const texto = elec.texto.trim();
      const imagen = elec.archivoUrl ? `<img class="pliego-img" src="${elec.archivoUrl}" alt="" />` : (elec.archivo ? `<span class="pliego-pdf">${icono('i-pdf')}</span>` : '');
      return `<span class="pliego-hoja${luz(hex) > 0.9 ? ' pliego-hoja--oscura' : ''}">`
        + (mini ? '' : `<span class="pliego-area"><span>${esc(t('wc.area_imp'))}</span></span>`)
        + `<span class="pliego-contenido${imagen ? ' con-imagen' : ''}">${imagen}${texto || !imagen ? `<span class="pliego-nombre ${tamanoNombre(texto || t('wc.pers_ejemplo'))}${texto ? '' : ' vacio'}" style="font-family:${f.css};font-weight:${f.peso};color:${hex}">${esc(texto || t('wc.pers_ejemplo'))}</span>` : ''}</span>`
        + (mini ? '' : `<span class="pliego-medida">${esc(t('wc.pliego_medida'))}</span>`) + '</span>';
    }
    function htmlArchivo() {
      if (elec.archivo) {
        const mini = elec.archivoUrl ? `<img src="${elec.archivoUrl}" alt="" />` : icono('i-pdf');
        return `<div class="adjunto"><div class="adjunto-mini">${mini}</div><div><strong>${esc(elec.archivo.name)}</strong><small>${icono('i-check')} ${esc(t('wc.listo'))} · ${pesoTxt(elec.archivo.size)}</small></div>`
          + `<button class="btn-quitar" type="button" data-quitar-archivo>${esc(t('wc.quitar_archivo'))}</button></div>`;
      }
      return `<label class="soltar"><input type="file" id="p-archivo" accept="${ACEPTA}" /><span class="soltar-icono">${icono('i-foto')}</span>`
        + `<strong>${esc(t('wc.subir'))}</strong><small>${esc(t('wc.subir_nota', { mb: W.topeMb }))}</small></label>`;
    }

    function pintarPieza() {
      const p = piezaDe(elec.id);
      const c = catDe(p.cat);
      const esCalco = p.unidad === 'pliego';
      const campo = (titulo, extra, cuerpo, para) => {
        const etiqueta = para ? 'label' : 'span';
        const atributo = para ? ` for="${para}"` : '';
        return esCalco
          ? `<div class="grupo campo"><${etiqueta} class="grupo-cab"${atributo}>${titulo}${extra ? `<span>${extra}</span>` : ''}</${etiqueta}>${cuerpo}</div>`
          : `<div class="campo"><${etiqueta} class="etiqueta-campo"${atributo}>${titulo}${extra ? ` <span class="opcional">(${extra})</span>` : ''}</${etiqueta}>${cuerpo}</div>`;
      };
      const marco = esCalco
        ? `<div class="pliego" data-g="pliego">${htmlHoja(false)}</div>${p.foto ? `<div data-g="foto" hidden>${fotoHtml(p)}</div>` : ''}`
        : `${fotoHtml(p, elec.foto)}${insignia(p)}`;
      // La galería de fotos de la pieza (Drive de Juan, 9 nov 2026): una tira de miniaturas bajo la foto grande.
      const minisFotos = !esCalco && p.fotos && p.fotos.length > 1
        ? `<div class="mini-galeria mini-galeria--fotos" role="group" aria-label="${esc(t('wc.fotos'))}">${p.fotos.map((f, i) => `<button class="mini" type="button" data-foto="${i}" aria-label="${esc(t('wc.foto_n', { i: i + 1, n: p.fotos.length }))}" aria-pressed="${i === elec.foto}"><img src="${base}img/wuanda/${f.mini}" alt="" loading="lazy" /></button>`).join('')}</div>` : '';
      const minis = esCalco && p.foto
        ? `<div class="mini-galeria"><button class="mini" type="button" data-galeria="pliego" aria-label="${esc(t('wc.area_imp'))}"><span class="pliego">${htmlHoja(true)}</span></button>`
          + `<button class="mini" type="button" data-galeria="foto" aria-label="${esc(L(p.pie || p.titulo))}">${fotoHtml(p)}</button></div>` : '';
      const ig = p.instagram ? `<div class="galeria-ig"><span>${esc(L(p.pie || p.titulo))}</span><a href="${esc(p.instagram)}" target="_blank" rel="noopener">${icono('i-instagram')}${esc(t('wc.ig_ver'))}</a></div>` : '';

      const gEstilo = p.variantes
        ? `<div class="grupo"><div class="grupo-cab">${esc(t('wc.estilo'))}</div><div class="chips chips--claro">${p.variantes.map((x) => `<button class="chip" type="button" data-estilo="${x.id}" aria-pressed="false">${esc(L(x.titulo))}</button>`).join('')}</div></div>` : '';
      const gTamano = p.tamanos
        ? `<div class="grupo"><div class="grupo-cab">${esc(t('wc.tamano'))}<span>${nd('wc.ejemplo')}</span></div><div class="chips chips--claro">${p.tamanos.map((x) => `<button class="chip" type="button" data-tamano="${esc(x)}" aria-pressed="false">${esc(x)}</button>`).join('')}</div></div>` : '';
      const gColor = p.colores
        ? `<div class="grupo"><div class="grupo-cab">${esc(t(esCalco ? 'wc.color_vinil' : 'wc.color'))}<span><span id="p-color-nombre"></span> ${p.coloresReales ? '' : nd('wc.ejemplo')}</span></div>`
          + `<div class="muestras">${p.colores.map((x) => `<button class="muestra" type="button" data-color="${x}" style="background:${W.colores[x].hex}" aria-label="${esc(colorDe(x))}" title="${esc(colorDe(x))}" aria-pressed="false"></button>`).join('')}</div></div>` : '';
      const gCantidad = `<div class="grupo"><div class="grupo-cab">${esc(t(esCalco ? 'wc.cuantos_pliegos' : 'wc.cuantos'))}</div>`
        + `<div class="cantidad-fila"><div class="cantidad"><button type="button" data-cant="-1" aria-label="${esc(t('car.menos'))}">${icono('i-menos')}</button>`
        + `<input id="p-cant" type="number" min="1" max="500" inputmode="numeric" aria-label="${esc(t(esCalco ? 'wc.cuantos_pliegos' : 'wc.cuantos'))}" />`
        + `<button type="button" data-cant="1" aria-label="${esc(t('car.mas'))}">${icono('i-mas')}</button></div><p>${esc(t(esCalco ? 'wc.escala_nota_pliego' : 'wc.escala_nota'))}</p></div>`
        + `<div class="escala"><div class="escala-cab"><span>${esc(t(esCalco ? 'wc.escala_pliego' : 'wc.escala_pieza'))}</span><span>${esc(t('wc.usd_envio'))}</span></div>`
        + (tarifaDe(p, elec.estilo) ? W.escalas : [{ desde: 1, hasta: null }]).map((r, i) => `<div class="escala-fila" data-fila="${i}"><span>${esc(r.hasta == null ? t('wc.rango_mas', { a: r.desde }) : t('wc.rango', { a: r.desde, b: r.hasta }))}<em hidden>${esc(t('wc.tu_cantidad'))}</em></span><span class="escala-precio"></span></div>`).join('')
        + '</div></div>';

      const cNombre = campo(esc(t('wc.pers_nombre')), '', `<input id="p-texto" maxlength="60" autocomplete="off" placeholder="${esc(t('wc.pers_nombre_ph'))}" value="${esc(elec.texto)}" />`, 'p-texto');
      const cFuente = campo(esc(t('wc.pers_fuente')), '', `<div class="fuentes">${W.fuentes.map((f) => `<button class="fuente" type="button" data-fuente="${f.id}" aria-pressed="false"><span class="ejemplo" style="font-family:${f.css};font-weight:${f.peso}"></span><small>${esc(L(f.nombre))}</small></button>`).join('')}</div>`);
      const cArchivo = campo(esc(t(esCalco ? 'wc.pers_logo_calco' : 'wc.pers_logo')), esc(t('cot.opcional')),
        `<div id="p-archivo-zona">${htmlArchivo()}</div><p class="error-campo" id="p-err-archivo" hidden></p><span class="nota-campo">${esc(t('wc.subir_llega'))}</span>`);
      const cNotas = campo(esc(t('wc.pers_notas')), esc(t('cot.opcional')), `<textarea id="p-notas" rows="2" maxlength="500" placeholder="${esc(t('wc.pers_notas_ph'))}">${esc(elec.notas)}</textarea>`, 'p-notas');
      const personalizar = esCalco
        ? cNombre + cFuente + cArchivo
        : `<div class="personalizar"><div class="pers-cab"><div><strong>${icono('i-pincel')}${esc(t('wc.pers'))}</strong><small>${esc(t('wc.pers_sub'))}</small></div>`
          + `<button class="interruptor" id="p-pers" type="button" role="switch" aria-checked="false" aria-label="${esc(t('wc.pers'))}"></button></div>`
          + `<div class="pers-cuerpo" id="p-pers-cuerpo" hidden>${cNombre}${cFuente}${cArchivo}${cNotas}</div></div>`;
      const como = `<div class="como"><p class="ceja">${esc(t('wc.uno_ceja'))}</p><ol>${[1, 2, 3].map((n) => `<li><span class="n">${n}</span><div><strong>${esc(t('wc.u' + n + 't'))}</strong><p>${esc(t('wc.u' + n + 'x'))}</p></div></li>`).join('')}</ol></div>`;

      vistaPieza.innerHTML = '<div class="caja">'
        + `<nav class="migas" aria-label="${esc(t('wc.migas'))}"><a href="#catalogo">${esc(t('wc.migas_cat'))}</a>${icono('i-flecha')}<a href="#catalogo" data-cat="${p.cat}">${esc(L(c.titulo))}</a>${icono('i-flecha')}<b aria-current="page">${esc(L(p.titulo))}</b></nav>`
        + '<div class="pieza">'
        +   `<div class="galeria"><div class="galeria-marco tono-${p.tono}${minisFotos ? ' galeria-marco--fotos' : ''}">${marco}</div>${minis}${minisFotos}${ig}</div>`
        +   '<div class="pieza-info">'
        +     `<div class="pieza-titulo"><span class="pz-cat">${esc(L(c.titulo))}</span><h1 tabindex="-1">${esc(L(p.titulo))}</h1>`
        +       `<div class="pieza-precio"><b id="p-precio"></b> <span id="p-precio-unidad">${esc(t(esCalco ? 'wc.por_pliego' : 'wc.por_pieza'))}</span></div>`
        +       `<p class="pieza-envio">${icono('i-envio')}<span>${esc(t('wc.envio_incluido'))}</span></p><p class="pieza-texto">${esc(L(p.texto || c.texto))}</p></div>`
        +     gEstilo + gTamano + gColor + (esCalco ? cNombre + cFuente : '') + gCantidad + (esCalco ? cArchivo : personalizar)
        +     `<div class="accion"><p class="error-campo" id="p-err-calco" hidden>${esc(t('wc.err_calco'))}</p>`
        +       `<button class="boton boton--acento boton--ancho" type="button" data-agregar data-escritorio>${icono('i-bolsa-compra')}${esc(t('wc.agregar'))}</button>`
        +       `<p class="accion-nota">${icono('i-whatsapp')}<span>${esc(t('wc.nota_agregar'))}</span></p></div>`
        +   '</div>'
        +   como
        + '</div></div>'
        + `<div class="pieza-barra"><div class="resumen"><strong id="p-resumen"></strong><span id="p-total"></span></div><button class="boton boton--acento" type="button" data-agregar>${esc(t('wc.agregar_corto'))}</button></div>`;
      sincronizarPieza();
    }
    // Lo que cambia con cada toque se actualiza en su sitio (sin repintar la ficha), para no perder el foco ni lo que se está escribiendo.
    function sincronizarPieza() {
      const p = piezaDe(elec.id);
      const v = vistaPieza;
      $$('[data-tamano]', v).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tamano === elec.tamano)));
      $$('[data-estilo]', v).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.estilo === elec.estilo)));
      if (p.fotos) {
        const grande = $('.galeria-marco img', v);
        if (grande) { grande.src = `${base}img/wuanda/${p.fotos[elec.foto].img}`; grande.alt = p.fotos.length > 1 ? `${L(p.pie || p.titulo)} — ${t('wc.foto_n', { i: elec.foto + 1, n: p.fotos.length })}` : L(p.pie || p.titulo); }
        $$('[data-foto]', v).forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.foto) === elec.foto)));
      }
      $$('[data-color]', v).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.color === elec.color)));
      const nombreColor = $('#p-color-nombre', v);
      if (nombreColor) nombreColor.textContent = colorDe(elec.color);
      const cant = $('#p-cant', v);
      if (cant && document.activeElement !== cant) cant.value = elec.cantidad;
      // El precio (cambia con el estilo y con la cantidad) y la fila de la escala que corresponde.
      const tf = tarifaDe(p, elec.estilo), pr = precioDe(p, elec.estilo, elec.cantidad);
      const activa = tf ? escalonDe(elec.cantidad) : 0;
      $$('.escala-fila', v).forEach((f, i) => { f.classList.toggle('activa', i === activa); $('em', f).hidden = i !== activa; });
      $$('.escala-precio', v).forEach((s, i) => { s.textContent = tf ? usd(tf[i]) : montoTxt(p.precioDesde, true); });
      if (pr) {
        $('#p-precio', v).textContent = montoTxt(pr.unidad, pr.desde);
        $('#p-total', v).textContent = t('wc.total_x', { total: montoTxt(pr.unidad * elec.cantidad, pr.desde) });
      }
      const interruptor = $('#p-pers', v);
      if (interruptor) { interruptor.setAttribute('aria-checked', String(elec.pers)); $('#p-pers-cuerpo', v).hidden = !elec.pers; }
      $$('[data-fuente]', v).forEach((b) => { b.setAttribute('aria-pressed', String(b.dataset.fuente === elec.fuente)); $('.ejemplo', b).textContent = elec.texto.trim() || t('wc.pers_ejemplo'); });
      if (p.unidad === 'pliego') {
        $$('.pliego', v).forEach((w) => { w.innerHTML = htmlHoja(!!w.closest('.mini')); });
        $$('[data-g]', v).forEach((g) => { g.hidden = g.dataset.g !== elec.galeria; });
        $$('[data-galeria]', v).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.galeria === elec.galeria)));
      }
      const unidad = t(p.unidad === 'pliego' ? (elec.cantidad === 1 ? 'wc.u_pliego' : 'wc.u_pliegos') : (elec.cantidad === 1 ? 'wc.u_pieza' : 'wc.u_piezas'));
      $('#p-resumen', v).textContent = [`${elec.cantidad} ${unidad}`, estiloDe(p, elec.estilo) && L(estiloDe(p, elec.estilo).titulo), colorDe(elec.color)].filter(Boolean).join(' · ');
    }
    function pintarArchivo() {
      $('#p-archivo-zona', vistaPieza).innerHTML = htmlArchivo();
      $('#p-err-archivo', vistaPieza).hidden = true;
      sincronizarPieza();
    }

    // Un archivo se acepta aquí si es png, jpg, webp, gif o pdf y pesa hasta W.topeMb (lo mismo que comprueba enviar.php). Devuelve el error, o ''.
    function errorDeArchivo(f) {
      if (!/\.(png|jpe?g|webp|gif|pdf)$/i.test(f.name) || (f.type && !/^(image\/(png|jpeg|webp|gif)|application\/pdf)$/.test(f.type)) || f.size < 1) return t('wc.err_archivo_tipo');
      if (f.size > TOPE) return t('wc.err_archivo_peso', { mb: W.topeMb });
      return '';
    }
    function aceptarArchivo(f) {
      if (!f) return;
      const error = errorDeArchivo(f);
      const aviso = $('#p-err-archivo', vistaPieza);
      if (error) { aviso.textContent = error; aviso.hidden = false; const campo = $('#p-archivo', vistaPieza); if (campo) campo.value = ''; return; }
      liberarVista();
      elec.archivo = f;
      elec.archivoUrl = f.type.startsWith('image/') ? URL.createObjectURL(f) : '';
      pintarArchivo();
    }

    vistaPieza.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.tamano != null) elec.tamano = b.dataset.tamano;
      else if (b.dataset.estilo) elec.estilo = b.dataset.estilo;
      else if (b.dataset.foto != null) elec.foto = Number(b.dataset.foto);
      else if (b.dataset.color) elec.color = b.dataset.color;
      else if (b.dataset.cant) { elec.cantidad = Math.min(500, Math.max(1, elec.cantidad + Number(b.dataset.cant))); $('#p-cant', vistaPieza).value = elec.cantidad; }
      else if (b.dataset.fuente) elec.fuente = b.dataset.fuente;
      else if (b.dataset.galeria) elec.galeria = b.dataset.galeria;
      else if (b.id === 'p-pers') elec.pers = !elec.pers;
      else if (b.hasAttribute('data-quitar-archivo')) { liberarVista(); elec.archivo = null; elec.archivoUrl = ''; pintarArchivo(); return; }
      else if (b.hasAttribute('data-agregar')) { agregarAlPedido(); return; }
      else return;
      sincronizarPieza();
    });
    vistaPieza.addEventListener('input', (e) => {
      const id = e.target.id;
      if (id === 'p-cant') { const n = parseInt(e.target.value, 10); if (n >= 1) elec.cantidad = Math.min(500, n); sincronizarPieza(); }
      else if (id === 'p-texto') { elec.texto = e.target.value; $('#p-err-calco', vistaPieza).hidden = true; sincronizarPieza(); }
      else if (id === 'p-notas') elec.notas = e.target.value;
    });
    vistaPieza.addEventListener('change', (e) => {
      if (e.target.id === 'p-cant') e.target.value = elec.cantidad; // un campo vacío o con basura vuelve a la cantidad vigente
      if (e.target.id === 'p-archivo') aceptarArchivo(e.target.files && e.target.files[0]);
    });
    // Arrastrar el logo sobre el recuadro (en el computador).
    vistaPieza.addEventListener('dragover', (e) => { const z = e.target.closest('.soltar'); if (z) { e.preventDefault(); z.classList.add('encima'); } });
    vistaPieza.addEventListener('dragleave', (e) => { const z = e.target.closest('.soltar'); if (z) z.classList.remove('encima'); });
    vistaPieza.addEventListener('drop', (e) => {
      const z = e.target.closest('.soltar');
      if (!z) return;
      e.preventDefault();
      z.classList.remove('encima');
      aceptarArchivo(e.dataTransfer && e.dataTransfer.files[0]);
    });

    function agregarAlPedido() {
      const p = piezaDe(elec.id);
      const texto = elec.pers ? elec.texto.trim() : '';
      const archivo = elec.pers ? elec.archivo : null;
      if (p.unidad === 'pliego' && !texto && !archivo) { $('#p-err-calco', vistaPieza).hidden = false; return; }
      pedido.push({
        pieza: p.id, estilo: elec.estilo, tamano: elec.tamano, color: elec.color, cantidad: elec.cantidad, texto, fuente: texto ? elec.fuente : W.fuentes[0].id,
        notas: elec.pers ? elec.notas.trim() : '', archivo, archivoNombre: archivo ? archivo.name : '',
      });
      guardarPedido();
      pintarPedido();
      const contador = $('#contador-carrito');
      contador.classList.remove('latido'); void contador.offsetWidth; contador.classList.add('latido');
      cajon.showModal();
    }

    /* ── «Tu pedido» ── */
    const hoy = new Date();
    const minFecha = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
    const nombreFuente = (id) => L(fuenteDe(id).nombre).toLowerCase();
    function sincronizarBarras() {
      const enPieza = !vistaPieza.hidden;
      barra.hidden = enPieza || pedido.length === 0;
      document.body.classList.toggle('con-barra', enPieza || pedido.length > 0);
    }
    function pintarPedidoBarra() {
      const cu = cuentas(), span = $('.resumen span', barra);
      if (span) span.textContent = t('wc.total_x', { total: montoTxt(cu.total, cu.desde) });
    }
    function pintarPedido() {
      const n = pedido.length;
      const unidades = `${n} ${t(n === 1 ? 'wc.u_pieza' : 'wc.u_piezas')}`;
      const contador = $('#contador-carrito');
      contador.hidden = n === 0;
      contador.textContent = n;
      const cu = cuentas();
      barra.innerHTML = `<div class="resumen"><strong>${esc(t('car.titulo'))} · ${esc(unidades)}</strong><span>${esc(t('wc.total_x', { total: montoTxt(cu.total, cu.desde) }))}</span></div><button class="boton boton--acento" type="button" data-abrir-pedido>${esc(t('wc.car_ver'))}</button>`;
      sincronizarBarras();
      const alto = { cajon: cajon.scrollTop, lista: (cajon.querySelector('.cajon-lista') || {}).scrollTop || 0 };
      const antes = cajon.querySelector('form');
      const d = antes ? { nombre: antes.elements.nombre.value, telefono: antes.elements.telefono.value, fecha: antes.elements.fecha.value, donde: antes.elements.donde.value } : { nombre: '', telefono: '', fecha: '', donde: '' };
      const lineaPrecio = (l) => {
        const pr = precioDe(piezaDe(l.pieza), l.estilo, l.cantidad);
        return pr ? `<span>${esc(montoTxt(pr.unidad * l.cantidad, pr.desde))}</span><small>${esc(t('wc.c_u', { precio: usd(pr.unidad) }))}</small>` : '<span>$ —</span>';
      };
      const linea = (l, i) => {
        const p = piezaDe(l.pieza);
        const miniatura = p.foto ? `<img src="${base}img/wuanda/${p.foto}" alt="" style="object-position:${p.encuadre || '50% 50%'}" />` : `<span class="linea-tile tono-${p.tono}">${icono(p.icono)}</span>`;
        const detalle = [estiloDe(p, l.estilo) && L(estiloDe(p, l.estilo).titulo), l.tamano, colorDe(l.color)].filter(Boolean).join(' · ');
        const extras = [];
        if (l.texto) extras.push(`<span>${icono('i-pincel')}${esc(t('wc.l_nombre', { x: l.texto, fuente: nombreFuente(l.fuente) }))}</span>`);
        if (l.archivo) extras.push(`<span class="ok">${icono('i-check')}${esc(t('wc.l_archivo', { archivo: l.archivoNombre }))}</span>`);
        else if (l.archivoNombre) extras.push(`<span class="falta">${icono('i-foto')}<span>${esc(t('wc.l_archivo_falta', { archivo: l.archivoNombre }))}</span> <label class="enlace-subir">${esc(t('wc.subir_de_nuevo'))}<input type="file" data-reponer="${i}" accept="${ACEPTA}" /></label></span>`);
        if (l.notas) extras.push(`<span>${icono('i-chat')}${esc(l.notas)}</span>`);
        if (!extras.length) extras.push(`<span>${esc(t('wc.l_sin_pers'))}</span>`);
        return `<div class="linea-carrito">${miniatura}<div><strong>${esc(L(p.titulo))}</strong>${detalle ? `<small>${esc(detalle)}</small>` : ''}<div class="linea-extras">${extras.join('')}</div>`
          + `<div class="cantidad cantidad--chica"><button type="button" data-linea="${i}" data-cant="-1" aria-label="${esc(t('car.menos'))}">${icono('i-menos')}</button><output>${l.cantidad}</output><button type="button" data-linea="${i}" data-cant="1" aria-label="${esc(t('car.mas'))}">${icono('i-mas')}</button></div></div>`
          + `<div class="linea-precio">${lineaPrecio(l)}<button class="quitar" type="button" data-quitar="${i}" aria-label="${esc(t('car.quitar'))}">${icono('i-basura')}</button></div></div>`;
      };
      cajon.innerHTML = `<div class="cajon-cabeza"><h3>${esc(t('car.titulo'))} <small>${n ? esc(unidades) : ''}</small></h3>${botonCerrar()}</div>`
        + '<div class="cajon-lista">'
        + (n === 0
          ? `<div class="cajon-vacio">${icono('i-bolsa-compra')}<p>${esc(t('wc.car_vacio'))}</p><button class="boton boton--negro boton--chico" type="button" data-seguir>${esc(t('wc.car_seguir'))}</button></div>`
          : pedido.map(linea).join(''))
        + '</div>'
        + (n === 0 ? '' : '<form class="cajon-pie" id="form-pedido" novalidate>'
          + '<div class="fila-2">'
          +   `<label class="campo"><span class="etiqueta-campo">${esc(t('wc.nombre'))}</span><input name="nombre" autocomplete="name" value="${esc(d.nombre)}" /><span class="error-campo" data-error="nombre" hidden>${esc(t('wc.err_nombre'))}</span></label>`
          +   `<label class="campo"><span class="etiqueta-campo">${esc(t('wc.whatsapp'))}</span><input name="telefono" type="tel" autocomplete="tel" value="${esc(d.telefono)}" /><span class="error-campo" data-error="telefono" hidden>${esc(t('wc.err_tel'))}</span></label>`
          + '</div>'
          + `<fieldset class="campo"><legend class="etiqueta-campo">${esc(t('wc.donde'))}</legend><div class="opciones-radio opciones-radio--2">`
          +   `<label class="opcion"><input type="radio" name="donde" value="usa"${d.donde === 'usa' ? ' checked' : ''} /><span>${esc(t('wc.usa'))}</span></label>`
          +   `<label class="opcion"><input type="radio" name="donde" value="col"${d.donde === 'col' ? ' checked' : ''} /><span>${esc(t('wc.col'))}</span></label></div>`
          +   `<p class="ruta" id="wc-ruta" hidden></p><p class="error-campo" data-error="donde" hidden>${esc(t('wc.err_donde'))}</p></fieldset>`
          + `<label class="campo"><span class="etiqueta-campo">${esc(t('wc.fecha'))} <span class="opcional">(${esc(t('cot.opcional'))})</span></span><input name="fecha" type="date" min="${minFecha}" value="${esc(d.fecha)}" /><span class="aviso-fecha" id="wc-fecha-aviso" hidden>${esc(t('wc.fecha_aviso'))}</span></label>`
          + `<fieldset class="campo campo-propina"><legend class="etiqueta-campo">${esc(t('wc.propina'))} <span class="opcional">(${esc(t('cot.opcional'))})</span></legend><div class="chips chips--claro">`
          +   [0, 10, 15, 20].map((x) => `<button class="chip" type="button" data-propina="${x}" aria-pressed="${propina === x}">${esc(x ? x + ' %' : t('wc.propina_no'))}</button>`).join('')
          + '</div></fieldset>'
          + '<div class="totales" id="wc-totales"></div>'
          + `<p class="error-campo" data-error="pedido" hidden>${esc(t('wc.err_pedido'))}</p>`
          + `<button class="boton boton--acento boton--ancho" type="submit">${icono('i-whatsapp')} ${esc(t('car.enviar'))}</button>`
          + `<p class="nota-form">${esc(t('cot.nota'))}</p>`
          + '</form>');
      const f = cajon.querySelector('form');
      if (f) { pintarRuta(f); revisarFecha(f); pintarTotales(f); }
      cajon.scrollTop = alto.cajon;
      const lista = cajon.querySelector('.cajon-lista');
      if (lista) lista.scrollTop = alto.lista;
    }
    function pintarRuta(f) {
      const donde = f.elements.donde.value;
      const ruta = $('#wc-ruta', f);
      ruta.hidden = !donde;
      if (donde) ruta.innerHTML = icono('i-whatsapp') + esc(t('car.ruta', { destino: t(donde === 'col' ? 'destino.wc_cartagena' : 'destino.wc_miami') }));
    }
    function revisarFecha(f) { $('#wc-fecha-aviso', f).hidden = !(diasHasta(f.elements.fecha.value) < 5); }
    // Subtotal y propina (si la hay), el total y lo que incluye: en EE.UU. el envío; en Colombia el precio en pesos se confirma en el chat.
    function pintarTotales(f) {
      const cu = cuentas(), col = f.elements.donde.value === 'col';
      $('#wc-totales', f).innerHTML = (cu.extra
        ? `<div><span>${esc(t('car.subtotal'))}</span><span>${esc(montoTxt(cu.subtotal, cu.desde))}</span></div><div><span>${esc(t('wc.propina_linea', { pct: propina }))}</span><span>${esc(montoTxt(cu.extra, cu.desde))}</span></div>`
        : '')
        + `<div class="total"><span>${esc(t('car.total'))}</span><span>${esc(montoTxt(cu.total, cu.desde))}</span></div>`
        + `<p class="nota-precio">${esc(t(col ? 'wc.nota_cop' : 'wc.nota_usd'))}</p>`;
      $$('[data-propina]', f).forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.propina) === propina)));
    }

    cajon.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.linea != null) {
        const l = pedido[Number(b.dataset.linea)];
        l.cantidad = Math.min(500, l.cantidad + Number(b.dataset.cant));
        if (l.cantidad < 1) pedido.splice(Number(b.dataset.linea), 1);
      } else if (b.dataset.quitar != null) {
        pedido.splice(Number(b.dataset.quitar), 1);
      } else if (b.dataset.propina != null) { // la propina solo cambia los totales
        propina = Number(b.dataset.propina);
        pintarTotales(b.form);
        pintarPedidoBarra();
        return;
      } else if (b.hasAttribute('data-seguir')) {
        cajon.close();
        if (location.hash === '#catalogo') saltarA('catalogo'); else location.hash = '#catalogo';
        return;
      } else return;
      guardarPedido();
      pintarPedido();
    });
    cajon.addEventListener('input', (e) => {
      const f = e.target.form;
      if (!f || !e.target.name) return;
      validarCampo(f, e.target.name, true);
      $('[data-error="pedido"]', f).hidden = true;
      if (e.target.name === 'fecha') revisarFecha(f);
    });
    cajon.addEventListener('change', (e) => {
      const el = e.target;
      if (el.name === 'donde') { pintarRuta(el.form); pintarTotales(el.form); validarCampo(el.form, 'donde', true); }
      if (el.name === 'fecha') revisarFecha(el.form);
      if (el.dataset.reponer != null) { // volver a subir el logo de una línea que se recuperó sin su archivo
        const f = el.files && el.files[0];
        if (!f) return;
        const error = errorDeArchivo(f);
        if (error) {
          const extras = el.closest('.linea-extras');
          $$('.error-campo', extras).forEach((x) => x.remove());
          extras.insertAdjacentHTML('beforeend', `<span class="error-campo">${esc(error)}</span>`);
          return;
        }
        const l = pedido[Number(el.dataset.reponer)];
        l.archivo = f;
        l.archivoNombre = f.name;
        guardarPedido();
        pintarPedido();
      }
    });

    // Los logos que pueden ir por correo: hasta W.maxArchivos y W.totalMb en total (lo mismo que acepta enviar.php). Cada uno lleva la
    // etiqueta de su pieza («1 · Termo lata») para que quien abra el correo sepa a cuál corresponde. El resto va por el chat de WhatsApp.
    function archivosParaCorreo() {
      const elegidos = [];
      let total = 0;
      pedido.forEach((l, i) => {
        if (!l.archivo || elegidos.length >= W.maxArchivos || total + l.archivo.size > W.totalMb * 1048576) return;
        total += l.archivo.size;
        elegidos.push({ linea: i, archivo: l.archivo, etiqueta: `${i + 1} · ${L(piezaDe(l.pieza).titulo)}` });
      });
      return elegidos;
    }
    function armarMensaje({ nombre, telefono, fecha, porCorreo, donde }) {
      const lineas = [t('wc.wa_hola'), ''];
      pedido.forEach((l, i) => {
        const p = piezaDe(l.pieza);
        const pr = precioDe(p, l.estilo, l.cantidad);
        const precio = pr ? ` — ${t('wc.wa_precio', { unidad: montoTxt(pr.unidad, pr.desde), total: montoTxt(pr.unidad * l.cantidad, pr.desde) })}` : '';
        lineas.push(`${i + 1}. ${l.cantidad} × ${L(p.titulo)}${p.unidad === 'pliego' ? ` (${t(l.cantidad === 1 ? 'wc.u_pliego' : 'wc.u_pliegos')})` : ''}${precio}`);
        const detalle = [estiloDe(p, l.estilo) && L(estiloDe(p, l.estilo).titulo), l.tamano, colorDe(l.color)].filter(Boolean).join(' · ');
        if (detalle) lineas.push(`   ${detalle}`);
        if (l.texto) lineas.push(`   ${t('wc.wa_nombre_texto')}: «${l.texto}» (${t('wc.wa_fuente', { f: nombreFuente(l.fuente) })})`);
        if (l.archivoNombre) lineas.push(`   ${t(porCorreo.has(i) ? 'wc.wa_archivo_correo' : 'wc.wa_archivo_chat', { archivo: l.archivoNombre })}`);
        if (l.notas) lineas.push(`   ${t('wc.wa_notas')}: ${l.notas}`);
        lineas.push('');
      });
      const cu = cuentas();
      if (cu.extra) lineas.push(t('wc.wa_subtotal', { total: montoTxt(cu.subtotal, cu.desde) }), t('wc.wa_propina', { pct: propina, monto: montoTxt(cu.extra, cu.desde) }));
      lineas.push(t(donde === 'col' ? 'wc.wa_total_cop' : 'wc.wa_total', { total: montoTxt(cu.total, cu.desde) }), '');
      if (fecha) lineas.push(`${t('wc.wa_fecha')}: ${new Date(fecha + 'T12:00:00').toLocaleDateString(idioma === 'es' ? 'es-CO' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`);
      lineas.push(`${t('wc.wa_contacto')}: ${nombre} · ${telefono}`);
      return lineas.join('\n');
    }
    cajon.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.target;
      if (enviando || !pedido.length) return;
      const v = (n) => f.elements[n].value.trim();
      const oks = [
        validarCampo(f, 'nombre', v('nombre') !== ''),
        validarCampo(f, 'telefono', v('telefono').replace(/\D/g, '').length >= 7),
        validarCampo(f, 'donde', v('donde') !== ''),
      ];
      $('[data-error="pedido"]', f).hidden = !oks.includes(false);
      if (oks.includes(false)) { $('.con-error, [data-error]:not([hidden])', f)?.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
      const destino = v('donde') === 'col' ? 'cartagena' : 'miami';
      const datos = { nombre: v('nombre'), telefono: v('telefono'), fecha: v('fecha'), donde: v('donde') };
      const aCorreo = { tipo: 'wuandacrafts', destino, rush: diasHasta(datos.fecha) < 5 ? '1' : '', nombre: datos.nombre, telefono: datos.telefono };
      const archivos = copiaActiva() ? archivosParaCorreo() : [];
      if (!archivos.length) {
        // Sin archivos que subir (o en la vista previa): el mismo camino de siempre, WhatsApp abre al tiro.
        const mensaje = armarMensaje({ ...datos, porCorreo: new Set() });
        copiaAlCorreo({ ...aCorreo, mensaje });
        abrirWhatsApp(destino === 'cartagena' ? 'wc_cartagena' : 'wc_miami', mensaje);
        return;
      }
      // Con archivos, la copia sale primero (un navegador no deja mandar un logo con sendBeacon) y WhatsApp espera su respuesta; así el
      // mensaje solo dice «enviado al correo» si de verdad llegó. La pestaña se abre ya, con el toque: si no, el navegador la bloquea.
      enviando = true;
      const boton = $('[type="submit"]', f);
      const textoBoton = boton.innerHTML;
      boton.disabled = true;
      boton.textContent = t('wc.enviando');
      const ventana = window.open('', '_blank');
      if (ventana) { try { ventana.opener = null; ventana.document.title = 'WhatsApp'; ventana.document.body.textContent = t('wc.enviando'); } catch (x) { /* otra pestaña: no pasa */ } }
      try {
        const porCorreo = new Set(archivos.map((a) => a.linea));
        const llego = await copiaAlCorreo({ ...aCorreo, mensaje: armarMensaje({ ...datos, porCorreo }) }, archivos);
        const mensaje = armarMensaje({ ...datos, porCorreo: llego ? porCorreo : new Set() });
        const url = urlWhatsApp(destino === 'cartagena' ? 'wc_cartagena' : 'wc_miami', mensaje);
        if (ventana) ventana.location.href = url;
        else {
          // El navegador no dejó abrir la pestaña con el toque: se intenta igual y se deja un botón, que sí se puede tocar.
          window.open(url, '_blank', 'noopener');
          $('#wa-listo', f)?.remove();
          boton.insertAdjacentHTML('afterend', `<a class="boton boton--negro boton--ancho" id="wa-listo" href="${esc(url)}" target="_blank" rel="noopener">${icono('i-whatsapp')} ${esc(t('wc.wa_listo'))}</a>`);
        }
      } finally {
        boton.disabled = false;
        boton.innerHTML = textoBoton;
        enviando = false;
      }
    });

    /* ── Qué se ve: inicio o ficha (#pieza/<id>) ── */
    function actualizarTitulo() {
      const p = elec && !vistaPieza.hidden ? piezaDe(elec.id) : null;
      document.title = p ? `${L(p.titulo)} — WuandaCrafts` : t('titulo.wuanda');
    }
    function ruta(evento) {
      const m = /^#pieza\/([\w-]+)$/.exec(location.hash);
      const p = m && piezaDe(m[1]);
      if (p) {
        if (!vistaPieza.hidden && elec && elec.id === p.id) return;
        if (!vistaInicio.hidden) { scrollInicio = window.scrollY; hashAntes = evento && evento.oldURL ? new URL(evento.oldURL).hash : ''; }
        liberarVista();
        elec = nuevaEleccion(p);
        vistaInicio.hidden = true;
        vistaPieza.hidden = false;
        pintarPieza();
        window.scrollTo({ top: 0, behavior: 'instant' });
        $('h1', vistaPieza).focus({ preventScroll: true });
      } else if (!vistaPieza.hidden) {
        const id = location.hash.slice(1);
        vistaPieza.hidden = true;
        vistaPieza.innerHTML = '';
        vistaInicio.hidden = false;
        liberarVista();
        elec = null;
        // Con «atrás» vuelves donde estabas; con «Catálogo» (o una categoría) de las migas, al catálogo.
        if (location.hash === hashAntes) window.scrollTo({ top: scrollInicio, behavior: 'instant' });
        else if (id && document.getElementById(id)) saltarA(id);
        else window.scrollTo({ top: scrollInicio, behavior: 'instant' });
      }
      sincronizarBarras();
      actualizarTitulo();
    }
    window.addEventListener('hashchange', ruta);
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; // el cambio entre inicio y ficha lo maneja ruta()

    document.addEventListener('click', (e) => {
      const cat = e.target.closest('[data-cat]');
      const ft = e.target.closest('[data-f-tamano]');
      const quiero = e.target.closest('[data-pieza]');
      if (cat) elegirCategoria(cat.dataset.cat);
      if (ft) { filtroTamano = ft.dataset.fTamano; pintarCatalogo(); }
      if (quiero) { // «¿Quieres uno así?»: al catálogo, en la categoría de esa pieza (las ilustraciones a medida ya no son una categoría)
        const tipo = tipoDe(D.piezas[Number(quiero.dataset.pieza)].tipo);
        elegirCategoria(tipo && tipo.categoria ? tipo.categoria : 'todo');
        saltarA('catalogo');
      }
      if (e.target.closest('#regalos-cta')) { elegirCategoria('termos'); saltarA('catalogo'); } // regalos de empresa: termos y lámparas, con su logo y en cantidad
      if (e.target.closest('[data-abrir-pedido]')) { pintarPedido(); cajon.showModal(); }
    });
    $('#abrir-carrito').addEventListener('click', () => { pintarPedido(); cajon.showModal(); });

    pintarCatalogo();
    pintarPedido();
    ruta();
    alCambiarIdioma.push(pintarCatalogo, pintarPiezas, pintarPedido, () => { if (!vistaPieza.hidden && elec) pintarPieza(); actualizarTitulo(); });
  }

  montarEstructura();
  activarEstructura();
  if (pagina === 'agencia') iniciarAgencia();
  if (pagina === 'merch') iniciarMerch();
  if (pagina === 'wuanda') iniciarWuanda();
  aplicarIdioma(idioma);
})();
