// Prototipo de sbc-log.com: estructura común (cabecera, pie, idioma), el
// cotizador de la portada y las páginas de servicio con sus herramientas.
// Nada se envía a ningún servidor.
(function () {
  var T = window.SBC_T;
  var SERVICIOS = window.SBC_SERVICIOS;
  var CONTENIDO = window.SBC_CONTENIDO;
  var pagina = document.body.dataset.pagina;
  var enInicio = pagina === 'inicio';
  var inicio = enInicio ? '' : 'index.html';
  var idioma = 'en';
  var alCambiarIdioma = [];

  function t(clave) { return (T[idioma] && T[idioma][clave]) || T.en[clave] || clave; }
  function c(id) { return CONTENIDO[idioma][id]; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (x) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x]; });
  }
  function icono(id, clase) { return '<svg class="icono' + (clase ? ' ' + clase : '') + '"><use href="#' + id + '"/></svg>'; }
  function num(n, decimales) {
    return Number(n).toLocaleString(idioma === 'es' ? 'es-ES' : 'en-US', { maximumFractionDigits: decimales == null ? 0 : decimales });
  }
  function urlCotizar(datos) {
    var p = new URLSearchParams();
    Object.keys(datos || {}).forEach(function (k) { if (datos[k] !== '' && datos[k] != null) p.set(k, datos[k]); });
    var q = p.toString();
    return 'index.html' + (q ? '?' + q : '') + '#cotizar';
  }
  function leerGuardado() { try { return localStorage.getItem('sbc-idioma'); } catch (e) { return null; } }
  function guardar(v) { try { localStorage.setItem('sbc-idioma', v); } catch (e) { /* sin almacenamiento */ } }
  var parametros = new URLSearchParams(location.search);
  var servicioActual = pagina === 'servicio'
    ? (SERVICIOS.find(function (s) { return s.id === parametros.get('s'); }) || SERVICIOS[0])
    : null;

  /* ── Estructura común ── */
  function montarEstructura() {
    var cotizar = servicioActual ? urlCotizar({ modo: servicioActual.modo }) : '#cotizar';
    var itemsMenu = SERVICIOS.map(function (s) {
      return '<a class="desplegable-item" href="servicio.html?s=' + s.id + '"' + (servicioActual === s ? ' aria-current="page"' : '') + '>'
        + '<span class="desplegable-icono">' + icono(s.icono) + '</span>'
        + '<span><strong data-svc-titulo="' + s.id + '"></strong><small data-svc-corto="' + s.id + '"></small></span></a>';
    }).join('');

    document.body.insertAdjacentHTML('afterbegin', window.SBC_ICONOS
      + '<div class="aviso-prototipo" data-t="aviso"></div>'
      + '<div class="franja"><div class="caja">'
      +   '<span class="franja-lugar">' + icono('i-lugar') + ' Aventura · Miami, FL</span>'
      +   '<a href="tel:+17865197711">' + icono('i-tel') + ' +1 (786) 519-7711</a>'
      +   '<a class="franja-correo" href="mailto:operations@sbc-log.com">' + icono('i-correo') + ' operations@sbc-log.com</a>'
      +   selectorIdioma()
      + '</div></div>'
      + '<header class="cabecera"><div class="caja">'
      +   '<a class="logo" href="index.html" aria-label="Stone Bridge Cargo"><img class="logo-icono" src="img/logo-icono.png" alt="" /><img class="logo-texto" src="img/logo-texto.png" alt="Stone Bridge Cargo — International Logistics" /></a>'
      +   '<nav class="menu" id="menu">'
      +     '<div class="desplegable">'
      +       '<button type="button" class="desplegable-boton" aria-expanded="false" aria-controls="panel-servicios"><span data-t="nav.servicios"></span>' + icono('i-abajo') + '</button>'
      +       '<div class="desplegable-panel" id="panel-servicios">' + itemsMenu + '</div>'
      +     '</div>'
      +     '<a href="' + inicio + '#industrias" data-t="nav.industrias"></a>'
      +     '<a href="' + inicio + '#nosotros" data-t="nav.nosotros"></a>'
      +     '<a href="' + inicio + '#proceso" data-t="nav.proceso"></a>'
      +     '<a href="#contacto" data-t="nav.contacto"></a>'
      +   '</nav>'
      +   '<a class="boton boton--naranja boton--chico" href="' + cotizar + '" data-t="nav.cotizar"></a>'
      +   '<button class="menu-movil" type="button" aria-controls="menu" aria-expanded="false" data-t-aria="nav.abrir">' + icono('i-menu') + '</button>'
      + '</div></header>');

    document.body.insertAdjacentHTML('beforeend',
      '<footer class="pie" id="contacto"><div class="caja">'
      + '<div class="pie-grilla">'
      +   '<div><a class="logo" href="index.html" aria-label="Stone Bridge Cargo"><img class="logo-icono" src="img/logo-icono.png" alt="" /><img class="logo-texto" src="img/logo-texto.png" alt="Stone Bridge Cargo" /></a>'
      +   '<p class="pie-descripcion" data-t="pie.descripcion"></p></div>'
      +   '<div><h4 data-t="pie.servicios"></h4><ul>' + SERVICIOS.map(function (s) {
            return '<li><a href="servicio.html?s=' + s.id + '" data-svc-titulo="' + s.id + '"></a></li>';
          }).join('') + '</ul></div>'
      +   '<div><h4 data-t="pie.contacto"></h4><ul class="pie-contacto">'
      +     '<li>' + icono('i-tel') + '<a href="tel:+17865197711">+1 (786) 519-7711</a></li>'
      +     '<li>' + icono('i-correo') + '<a href="mailto:operations@sbc-log.com">operations@sbc-log.com</a></li>'
      +     '<li>' + icono('i-lugar') + '<span data-t="pie.direccion"></span></li>'
      +   '</ul></div>'
      + '</div>'
      + '<div class="pie-legal"><span data-t="pie.legal"></span>' + selectorIdioma() + '</div>'
      + '</div></footer>'
      + '<button class="flotante abrir-whatsapp" type="button" aria-label="WhatsApp">' + icono('i-whatsapp') + '</button>'
      + '<nav class="barra-movil" aria-label="Quick actions">'
      +   '<a class="destacado" href="' + cotizar + '">' + icono('i-cotizar') + '<span data-t="movil.cotizar"></span></a>'
      +   '<button class="wa abrir-whatsapp" type="button">' + icono('i-whatsapp') + 'WhatsApp</button>'
      +   '<a href="tel:+17865197711">' + icono('i-tel') + '<span data-t="movil.llamar"></span></a>'
      + '</nav>'
      + '<dialog class="modal" id="modal-whatsapp">'
      +   '<h3 data-t="wa.titulo"></h3><p data-t="wa.texto"></p>'
      +   '<div class="burbuja" data-t="wa.mensaje"></div>'
      +   '<p class="modal-nota" data-t="wa.nota"></p>'
      +   '<button class="boton boton--navy" type="button" id="cerrar-whatsapp" data-t="wa.cerrar"></button>'
      + '</dialog>');
  }

  function selectorIdioma() {
    return '<div class="idioma" role="group" aria-label="Language / Idioma">'
      + '<button type="button" data-idioma="en" aria-pressed="false">EN</button>'
      + '<button type="button" data-idioma="es" aria-pressed="false">ES</button></div>';
  }

  function aplicarIdioma(nuevo) {
    idioma = T[nuevo] ? nuevo : 'en';
    document.documentElement.lang = idioma;
    document.title = servicioActual ? c(servicioActual.id).titulo + ' — Stone Bridge Cargo' : t('titulo');
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = t(el.dataset.t); });
    document.querySelectorAll('[data-t-html]').forEach(function (el) { el.innerHTML = t(el.dataset.tHtml); });
    document.querySelectorAll('[data-t-ph]').forEach(function (el) { el.placeholder = t(el.dataset.tPh); });
    document.querySelectorAll('[data-t-aria]').forEach(function (el) { el.setAttribute('aria-label', t(el.dataset.tAria)); });
    document.querySelectorAll('[data-svc-titulo]').forEach(function (el) { el.textContent = c(el.dataset.svcTitulo).titulo; });
    document.querySelectorAll('[data-svc-corto]').forEach(function (el) { el.textContent = c(el.dataset.svcCorto).corto; });
    document.querySelectorAll('[data-idioma]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.idioma === idioma)); });
    alCambiarIdioma.forEach(function (f) { f(); });
  }

  function activarEstructura() {
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-idioma]');
      if (b) { aplicarIdioma(b.dataset.idioma); guardar(idioma); }
      if (e.target.closest('.abrir-whatsapp')) document.getElementById('modal-whatsapp').showModal();
    });

    var botonMenu = document.querySelector('.menu-movil');
    var menu = document.getElementById('menu');
    botonMenu.addEventListener('click', function () {
      var abierto = menu.classList.toggle('abierto');
      botonMenu.setAttribute('aria-expanded', String(abierto));
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) { menu.classList.remove('abierto'); botonMenu.setAttribute('aria-expanded', 'false'); }
    });

    var desplegable = document.querySelector('.desplegable');
    var botonDesplegable = desplegable.querySelector('.desplegable-boton');
    function abrirDesplegable(abrir) {
      desplegable.classList.toggle('abierto', abrir);
      botonDesplegable.setAttribute('aria-expanded', String(abrir));
    }
    botonDesplegable.addEventListener('click', function () { abrirDesplegable(!desplegable.classList.contains('abierto')); });
    document.addEventListener('click', function (e) { if (!desplegable.contains(e.target)) abrirDesplegable(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') abrirDesplegable(false); });

    var modal = document.getElementById('modal-whatsapp');
    document.getElementById('cerrar-whatsapp').addEventListener('click', function () { modal.close(); });
    modal.addEventListener('click', function (e) { if (e.target === modal) modal.close(); });
  }

  /* ── Cotizador de la portada ── */
  function iniciarCotizador() {
    var form = document.getElementById('cotizador');
    if (!form) return;
    var etapas = form.querySelectorAll('.etapa');
    var progreso = document.querySelectorAll('.progreso li');
    var atras = document.getElementById('atras');
    var actual = 1;

    function valor(nombre) { return (form.querySelector('input[name="' + nombre + '"]:checked') || {}).value; }
    function marcar(nombre, v) {
      var r = form.querySelector('input[name="' + nombre + '"][value="' + v + '"]');
      if (r) { r.checked = true; ajustarCampos(); }
    }
    function ajustarCampos() {
      var modo = valor('modo');
      var fcl = modo === 'ocean' && valor('carga') !== 'lcl';
      document.getElementById('grupo-tipo-carga').hidden = modo !== 'ocean';
      document.getElementById('grupo-fcl').hidden = !fcl;
      document.getElementById('grupo-bultos').hidden = fcl || modo === 'customs';
    }
    form.addEventListener('change', function (e) {
      if (e.target.name === 'modo' || e.target.name === 'carga') ajustarCampos();
      if (e.target.name === 'modo') error('modo', false);
    });

    function actualizarBoton() {
      document.querySelector('#siguiente [data-t]').textContent = actual === 3 ? t('form.enviar') : t('form.siguiente');
    }
    function irA(n) {
      actual = n;
      etapas.forEach(function (e) { e.hidden = Number(e.dataset.etapa) !== n; });
      progreso.forEach(function (li, i) { li.classList.toggle('hecho', i < n); });
      atras.hidden = n === 1;
      actualizarBoton();
    }
    function error(nombre, visible) {
      var msj = form.querySelector('[data-error="' + nombre + '"]');
      if (msj) msj.hidden = !visible;
      var campo = form.elements[nombre];
      if (campo && campo.classList) campo.classList.toggle('error', visible);
      return visible;
    }
    function validar(n) {
      var mal = false;
      if (n === 1) {
        mal = error('modo', !valor('modo')) || mal;
        mal = error('origen', !form.origen.value.trim()) || mal;
        mal = error('destino', !form.destino.value.trim()) || mal;
      }
      if (n === 2) mal = error('mercancia', !form.mercancia.value.trim()) || mal;
      if (n === 3) {
        mal = error('nombre', !form.nombre.value.trim()) || mal;
        mal = error('correo', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.value.trim())) || mal;
      }
      if (mal) {
        var primero = form.querySelector('.etapa:not([hidden]) .error, .etapa:not([hidden]) .mensaje-error:not([hidden])');
        if (primero) primero.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      return !mal;
    }
    form.addEventListener('input', function (e) { if (e.target.name) error(e.target.name, false); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validar(actual)) return;
      if (actual < 3) { irA(actual + 1); form.scrollIntoView({ block: 'start', behavior: 'smooth' }); return; }
      form.hidden = true;
      document.querySelector('.progreso').hidden = true;
      mostrarExito();
    });
    atras.addEventListener('click', function () { irA(actual - 1); });

    function etiqueta(nombre, prefijo) { var v = valor(nombre); return v ? t(prefijo + v) : ''; }
    function mostrarExito() {
      var f = form.elements;
      var modo = valor('modo');
      var fcl = modo === 'ocean' && valor('carga') !== 'lcl';
      var lineas = [
        t('resumen.asunto') + ' — sbc-log.com (' + idioma.toUpperCase() + ')', '',
        t('resumen.modo') + ': ' + etiqueta('modo', 'modo.') + (modo === 'ocean' ? ' · ' + etiqueta('carga', 'carga.') : ''),
        t('resumen.ruta') + ': ' + f.origen.value.trim() + ' → ' + f.destino.value.trim(),
        t('resumen.fecha') + ': ' + (f.fecha.value || t('resumen.sinFecha')),
        t('resumen.mercancia') + ': ' + f.mercancia.value.trim(),
        t('resumen.tipo') + ': ' + etiqueta('tipo', 'tipo.')
      ];
      if (fcl) lineas.push(t('resumen.equipo') + ': ' + f.cantidad.value + ' × ' + f.contenedor.value);
      else if (modo !== 'customs') lineas.push(t('resumen.medidas') + ': ' + [f.bultos.value || '—', f.peso.value ? f.peso.value + ' kg' : '—', f.volumen.value || '—'].join(' / '));
      lineas.push('Incoterm: ' + (f.incoterm.value === '?' ? t('campo.noSeguro') : f.incoterm.value));
      lineas.push(t('resumen.aduana') + ': ' + (f.aduana.checked ? t('resumen.si') : t('resumen.no')));
      if (f.notas.value.trim()) lineas.push(t('resumen.notas') + ': ' + f.notas.value.trim());
      lineas.push('');
      lineas.push(t('resumen.contacto') + ': ' + [f.nombre.value.trim(), f.empresa.value.trim()].filter(Boolean).join(' · '));
      lineas.push(f.correo.value.trim() + (f.telefono.value.trim() ? ' · ' + f.telefono.value.trim() : ''));
      lineas.push(t('resumen.preferencia') + ': ' + etiqueta('preferencia', 'pref.'));
      document.getElementById('resumen').textContent = lineas.join('\n');
      document.getElementById('exito-titulo').textContent = t('exito.titulo').replace('{nombre}', f.nombre.value.trim().split(' ')[0]);
      document.getElementById('exito').hidden = false;
    }
    alCambiarIdioma.push(function () {
      actualizarBoton();
      if (!document.getElementById('exito').hidden) mostrarExito();
    });

    document.getElementById('otra').addEventListener('click', function () {
      form.reset();
      document.getElementById('exito').hidden = true;
      form.hidden = false;
      document.querySelector('.progreso').hidden = false;
      ajustarCampos();
      irA(1);
    });

    var modoRapido = 'ocean';
    document.querySelectorAll('.rapida-modos button').forEach(function (b) {
      b.addEventListener('click', function () {
        modoRapido = b.dataset.modo;
        document.querySelectorAll('.rapida-modos button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      });
    });
    document.getElementById('rapida').addEventListener('submit', function (e) {
      e.preventDefault();
      marcar('modo', modoRapido);
      form.origen.value = document.getElementById('rapida-origen').value.trim();
      form.destino.value = document.getElementById('rapida-destino').value.trim();
      irA(1);
      document.getElementById('cotizar').scrollIntoView({ behavior: 'smooth' });
      setTimeout(function () { (form.origen.value ? form.fecha : form.origen).focus({ preventScroll: true }); }, 500);
    });
    document.querySelectorAll('[data-cotizar]').forEach(function (a) {
      a.addEventListener('click', function () { marcar('modo', a.dataset.cotizar); irA(1); });
    });

    // Datos que llegan desde las herramientas de cada servicio.
    if (parametros.get('modo')) marcar('modo', parametros.get('modo'));
    if (parametros.get('carga')) marcar('carga', parametros.get('carga'));
    ['contenedor', 'cantidad', 'bultos', 'peso', 'volumen', 'notas'].forEach(function (k) {
      if (parametros.get(k) != null && form.elements[k]) form.elements[k].value = parametros.get(k);
    });
    ajustarCampos();
    irA(1);
  }

  /* ── Página de servicio ── */
  var estado = {};

  var CONTENEDORES = [
    { id: "20'", nombre: "20' Standard", l: 5.90, w: 2.35, h: 2.39, m3: 33, kg: 28200, util: 28 },
    { id: "40'", nombre: "40' Standard", l: 12.03, w: 2.35, h: 2.39, m3: 67, kg: 26700, util: 58 },
    { id: "40' HC", nombre: "40' High Cube", l: 12.03, w: 2.35, h: 2.69, m3: 76, kg: 26500, util: 68 },
    { id: "40' Reefer", nombre: "40' Reefer", l: 11.58, w: 2.29, h: 2.25, m3: 59, kg: 27500, util: null }
  ];

  var HERRAMIENTAS = {
    contenedores: {
      inicial: { contenedor: "40' HC", volumen: '22' },
      html: function (e) {
        return '<div class="herramienta-grilla">'
          + '<div>'
          +   '<div class="pestanas-contenedor" role="tablist">' + CONTENEDORES.map(function (k) {
                return '<button type="button" role="tab" data-contenedor="' + esc(k.id) + '" aria-selected="' + (k.id === e.contenedor) + '">' + esc(k.nombre) + '</button>';
              }).join('') + '</div>'
          +   '<div class="contenedor-visual" id="contenedor-visual"></div>'
          +   '<dl class="ficha" id="ficha-contenedor"></dl>'
          + '</div>'
          + '<div class="herramienta-resultado">'
          +   '<label class="etiqueta-campo" for="h-volumen">' + esc(t('h.cont.volumen')) + '</label>'
          +   '<input class="campo campo--grande" id="h-volumen" type="number" min="0" step="0.5" value="' + esc(e.volumen) + '" />'
          +   '<p class="resultado-texto" id="resultado-contenedor"></p>'
          +   '<a class="boton boton--naranja" id="usar-herramienta" href="#">' + esc(t('svc.usar')) + icono('i-flecha') + '</a>'
          + '</div></div>';
      },
      activar: function (raiz, e) {
        function pintar() {
          var k = CONTENEDORES.find(function (x) { return x.id === e.contenedor; });
          raiz.querySelectorAll('[data-contenedor]').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.contenedor === k.id)); });
          var ancho = 100 * k.l / 12.03, alto = 100 * k.h / 2.69;
          raiz.querySelector('#contenedor-visual').innerHTML =
            '<svg viewBox="0 0 520 150" role="img" aria-label="' + esc(k.nombre) + '">'
            + '<rect x="10" y="' + (140 - 1.2 * alto) + '" width="' + (5 * ancho) + '" height="' + (1.2 * alto) + '" rx="4" class="contenedor-cuerpo"/>'
            + Array.from({ length: Math.round(ancho / 4) }, function (_, i) { return '<line x1="' + (18 + i * 20) + '" x2="' + (18 + i * 20) + '" y1="' + (146 - 1.2 * alto) + '" y2="134" class="contenedor-linea"/>'; }).join('')
            + '<text x="' + (10 + 2.5 * ancho) + '" y="' + (144 - 0.6 * alto) + '" class="contenedor-texto">' + esc(k.id) + '</text></svg>';
          raiz.querySelector('#ficha-contenedor').innerHTML =
            '<div><dt>' + esc(t('h.cont.medidas')) + '</dt><dd>' + num(k.l, 2) + ' × ' + num(k.w, 2) + ' × ' + num(k.h, 2) + ' m</dd></div>'
            + '<div><dt>' + esc(t('h.cont.capacidad')) + '</dt><dd>' + num(k.m3) + ' m³</dd></div>'
            + '<div><dt>' + esc(t('h.cont.carga')) + '</dt><dd>≈ ' + num(k.kg) + ' kg</dd></div>';
        }
        function recomendar() {
          var v = parseFloat(e.volumen);
          var salida = raiz.querySelector('#resultado-contenedor');
          var datos = { modo: 'ocean' };
          if (!(v > 0)) { salida.textContent = t('h.cont.vacio'); raiz.querySelector('#usar-herramienta').href = urlCotizar(datos); return; }
          if (v <= 15) {
            salida.textContent = t('h.cont.lcl');
            datos.carga = 'lcl'; datos.volumen = num(v, 1) + ' m³';
          } else {
            var secos = CONTENEDORES.slice(0, 3);
            var k = secos.find(function (x) { return v <= x.util; });
            var n = 1;
            if (!k) { k = secos[2]; n = Math.ceil(v / k.util); }
            e.contenedor = k.id;
            pintar();
            salida.textContent = t('h.cont.fcl').replace('{n}', n).replace('{cont}', k.nombre).replace('{pct}', Math.round(100 * v / (n * k.util)));
            datos.carga = 'fcl'; datos.contenedor = k.id; datos.cantidad = n; datos.notas = t('h.cont.volumen') + ': ' + num(v, 1);
          }
          raiz.querySelector('#usar-herramienta').href = urlCotizar(datos);
        }
        raiz.addEventListener('click', function (ev) {
          var b = ev.target.closest('[data-contenedor]');
          if (b) { e.contenedor = b.dataset.contenedor; pintar(); }
        });
        raiz.querySelector('#h-volumen').addEventListener('input', function () { e.volumen = this.value; recomendar(); });
        pintar();
        recomendar();
      }
    },

    aereo: {
      inicial: { piezas: '2', largo: '120', ancho: '80', alto: '100', peso: '300' },
      html: function (e) {
        var campo = function (id, clave) {
          return '<div><label class="etiqueta-campo" for="h-' + id + '">' + esc(t(clave)) + '</label><input class="campo" id="h-' + id + '" data-dato="' + id + '" type="number" min="0" value="' + esc(e[id]) + '" /></div>';
        };
        return '<div class="herramienta-grilla">'
          + '<div class="campos-grilla">' + campo('piezas', 'h.aereo.piezas') + campo('largo', 'h.aereo.largo') + campo('ancho', 'h.aereo.ancho') + campo('alto', 'h.aereo.alto') + campo('peso', 'h.aereo.peso') + '</div>'
          + '<div class="herramienta-resultado"><div class="barras" id="barras-peso"></div><p class="resultado-texto" id="resultado-aereo"></p>'
          + '<a class="boton boton--naranja" id="usar-herramienta" href="#">' + esc(t('svc.usar')) + icono('i-flecha') + '</a></div></div>';
      },
      activar: function (raiz, e) {
        function calcular() {
          var p = +e.piezas || 0, vol = p * (+e.largo || 0) * (+e.ancho || 0) * (+e.alto || 0) / 6000, real = +e.peso || 0;
          var cobrable = Math.max(vol, real), max = Math.max(vol, real, 1);
          var barra = function (clave, valor, destacada) {
            return '<div class="barra' + (destacada ? ' barra--destacada' : '') + '"><span>' + esc(t(clave)) + '</span><div><i style="width:' + (100 * valor / max) + '%"></i></div><strong>' + num(valor, 1) + ' kg</strong></div>';
          };
          raiz.querySelector('#barras-peso').innerHTML = barra('h.aereo.volumetrico', vol, false) + barra('h.aereo.real', real, false) + barra('h.aereo.cobrable', cobrable, true);
          raiz.querySelector('#resultado-aereo').textContent = cobrable > 0 ? (vol > real ? t('h.aereo.porVolumen') : t('h.aereo.porPeso')) : '';
          raiz.querySelector('#usar-herramienta').href = urlCotizar({
            modo: 'air', bultos: e.piezas, peso: e.peso,
            volumen: e.piezas + ' × ' + e.largo + '×' + e.ancho + '×' + e.alto + ' cm',
            notas: t('h.aereo.cobrable') + ': ' + num(cobrable, 1) + ' kg · ' + t('h.aereo.volumetrico') + ': ' + num(vol, 1) + ' kg'
          });
        }
        raiz.addEventListener('input', function (ev) { if (ev.target.dataset.dato) { e[ev.target.dataset.dato] = ev.target.value; calcular(); } });
        calcular();
      }
    },

    camion: {
      inicial: { pallets: 8 },
      html: function (e) {
        return '<div class="herramienta-grilla herramienta-grilla--ancha">'
          + '<div><label class="etiqueta-campo" for="h-pallets">' + esc(t('h.camion.pallets')) + ': <strong id="h-pallets-valor"></strong></label>'
          + '<input class="deslizador" id="h-pallets" type="range" min="1" max="60" value="' + e.pallets + '" />'
          + '<div class="trailer" id="trailer" aria-hidden="true"></div><p class="trailer-pie" id="trailer-pie"></p></div>'
          + '<div class="herramienta-resultado"><p class="resultado-texto resultado-texto--grande" id="resultado-camion"></p>'
          + '<a class="boton boton--naranja" id="usar-herramienta" href="#">' + esc(t('svc.usar')) + icono('i-flecha') + '</a></div></div>';
      },
      activar: function (raiz, e) {
        function pintar() {
          var p = +e.pallets, enPrimero = Math.min(p, 26), camiones = Math.ceil(p / 26);
          raiz.querySelector('#h-pallets-valor').textContent = p;
          raiz.querySelector('#trailer').innerHTML = '<div class="trailer-caja">' + Array.from({ length: 26 }, function (_, i) {
            return '<span class="' + (i < enPrimero ? 'lleno' : '') + '"></span>';
          }).join('') + '</div><div class="trailer-cabina"></div>';
          raiz.querySelector('#trailer-pie').textContent = t('h.camion.ocupa').replace('{pct}', Math.round(100 * enPrimero / 26)) + (camiones > 1 ? ' · +' + (p - 26) : '');
          var texto = p <= 6 ? t('h.camion.ltl') : p <= 12 ? t('h.camion.parcial') : p <= 26 ? t('h.camion.ftl') : t('h.camion.varios').replace('{n}', camiones);
          raiz.querySelector('#resultado-camion').textContent = texto;
          raiz.querySelector('#usar-herramienta').href = urlCotizar({ modo: 'road', bultos: p, notas: p + ' pallets 48″×40″ · ' + texto });
        }
        raiz.querySelector('#h-pallets').addEventListener('input', function () { e.pallets = this.value; pintar(); });
        pintar();
      }
    },

    almacen: {
      inicial: { elegidos: ['o1', 'o3'] },
      html: function (e) {
        return '<div class="herramienta-grilla">'
          + '<div class="opciones-almacen">' + ['o1', 'o2', 'o3', 'o4', 'o5', 'o6'].map(function (o) {
              return '<label class="opcion"><input type="checkbox" value="' + o + '"' + (e.elegidos.indexOf(o) !== -1 ? ' checked' : '') + ' /><span>' + icono('i-check', 'icono--check') + esc(t('h.almacen.' + o)) + '</span></label>';
            }).join('') + '</div>'
          + '<div class="herramienta-resultado"><div class="etiqueta-campo">' + esc(t('h.almacen.seleccion')) + '</div><ul class="puntos" id="seleccion-almacen"></ul>'
          + '<a class="boton boton--naranja" id="usar-herramienta" href="#">' + esc(t('svc.usar')) + icono('i-flecha') + '</a></div></div>';
      },
      activar: function (raiz, e) {
        function pintar() {
          var nombres = e.elegidos.map(function (o) { return t('h.almacen.' + o); });
          raiz.querySelector('#seleccion-almacen').innerHTML = nombres.length
            ? nombres.map(function (n) { return '<li>' + icono('i-check') + '<span>' + esc(n) + '</span></li>'; }).join('')
            : '<li class="vacio">' + esc(t('h.almacen.vacio')) + '</li>';
          var usar = raiz.querySelector('#usar-herramienta');
          usar.classList.toggle('deshabilitado', !nombres.length);
          usar.href = urlCotizar({ modo: 'warehouse', notas: nombres.join('; ') });
        }
        raiz.addEventListener('change', function () {
          e.elegidos = Array.from(raiz.querySelectorAll('.opciones-almacen input:checked')).map(function (i) { return i.value; });
          pintar();
        });
        raiz.querySelector('#usar-herramienta').addEventListener('click', function (ev) { if (!e.elegidos.length) ev.preventDefault(); });
        pintar();
      }
    },

    docs: {
      inicial: { listos: ['d1', 'd2'] },
      html: function (e) {
        return '<div class="herramienta-grilla">'
          + '<div class="lista-docs">' + ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'].map(function (d) {
              return '<label class="doc"><input type="checkbox" value="' + d + '"' + (e.listos.indexOf(d) !== -1 ? ' checked' : '') + ' /><span class="doc-casilla">' + icono('i-check') + '</span><span>' + esc(t('h.docs.' + d)) + '</span></label>';
            }).join('') + '</div>'
          + '<div class="herramienta-resultado"><div class="anillo" id="anillo-docs"></div><p class="resultado-texto" id="resultado-docs"></p>'
          + '<a class="boton boton--naranja" id="usar-herramienta" href="#">' + esc(t('svc.usar')) + icono('i-flecha') + '</a></div></div>';
      },
      activar: function (raiz, e) {
        var todos = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'];
        function pintar() {
          var faltan = todos.filter(function (d) { return e.listos.indexOf(d) === -1; });
          var n = todos.length - faltan.length;
          raiz.querySelector('#anillo-docs').innerHTML = '<div class="anillo-valor" style="--avance:' + (100 * n / todos.length) + '"><span>' + n + '/' + todos.length + '</span></div>'
            + '<strong>' + esc(t('h.docs.listos').replace('{n}', n).replace('{total}', todos.length)) + '</strong>';
          var nombresFaltan = faltan.map(function (d) { var n = t('h.docs.' + d).replace(/ \([^)]*\)$/, ''); return n.charAt(0).toLowerCase() + n.slice(1); });
          raiz.querySelector('#resultado-docs').textContent = faltan.length ? t('h.docs.falta').replace('{faltan}', nombresFaltan.join(', ')) : t('h.docs.todo');
          raiz.querySelector('#usar-herramienta').href = urlCotizar({
            modo: 'customs',
            notas: t('h.docs.notasListos') + ': ' + (e.listos.map(function (d) { return t('h.docs.' + d); }).join(', ') || '—')
              + (faltan.length ? ' · ' + t('h.docs.notasFaltan') + ': ' + nombresFaltan.join(', ') : '')
          });
        }
        raiz.addEventListener('change', function () {
          e.listos = Array.from(raiz.querySelectorAll('.lista-docs input:checked')).map(function (i) { return i.value; });
          pintar();
        });
        pintar();
      }
    },

    pesada: {
      inicial: { largo: '9.5', ancho: '3.2', alto: '3.1', peso: '32' },
      html: function (e) {
        var campo = function (id, clave) {
          return '<div><label class="etiqueta-campo" for="h-' + id + '">' + esc(t(clave)) + '</label><input class="campo" id="h-' + id + '" data-dato="' + id + '" type="number" min="0" step="0.1" value="' + esc(e[id]) + '" /></div>';
        };
        return '<div class="herramienta-grilla">'
          + '<div><div class="campos-grilla campos-grilla--4">' + campo('largo', 'h.pesada.largo') + campo('ancho', 'h.pesada.ancho') + campo('alto', 'h.pesada.alto') + campo('peso', 'h.pesada.peso') + '</div>'
          + '<div class="vistas" id="vistas-pesada"></div></div>'
          + '<div class="herramienta-resultado"><div class="veredicto" id="veredicto-pesada"></div>'
          + '<a class="boton boton--naranja" id="usar-herramienta" href="#">' + esc(t('svc.usar')) + icono('i-flecha') + '</a></div></div>';
      },
      activar: function (raiz, e) {
        function vista(ancho, alto, refAncho, refAlto, excede) {
          var escala = 150 / Math.max(ancho, refAncho, 0.1), eh = 90 / Math.max(alto, refAlto, 0.1), k = Math.min(escala, eh);
          var base = 110;
          return '<svg viewBox="0 0 170 120" role="img">'
            + '<rect x="10" y="' + (base - refAlto * k) + '" width="' + (refAncho * k) + '" height="' + (refAlto * k) + '" class="vista-contenedor"/>'
            + '<rect x="10" y="' + (base - alto * k) + '" width="' + (ancho * k) + '" height="' + (alto * k) + '" class="vista-carga' + (excede ? ' vista-carga--excede' : '') + '"/>'
            + '<line x1="4" x2="166" y1="' + base + '" y2="' + base + '" class="vista-piso"/></svg>';
        }
        function evaluar() {
          var L = +e.largo || 0, W = +e.ancho || 0, H = +e.alto || 0, P = +e.peso || 0;
          var excedeLateral = L > 12.0 || H > 2.58, excedeFrente = W > 2.34 || H > 2.58;
          var tipo = (!excedeLateral && !excedeFrente && P <= 26) ? 'cabe' : (L <= 12.0 && P <= 40) ? 'oog' : 'proyecto';
          raiz.querySelector('#vistas-pesada').innerHTML =
            '<figure>' + vista(L, H, 12.03, 2.69, excedeLateral) + '<figcaption>' + esc(t('h.pesada.largo').replace(/ \(m\)/, '')) + ' × ' + esc(t('h.pesada.alto').replace(/ \(m\)/, '')) + '</figcaption></figure>'
            + '<figure>' + vista(W, H, 2.34, 2.58, excedeFrente) + '<figcaption>' + esc(t('h.pesada.ancho').replace(/ \(m\)/, '')) + ' × ' + esc(t('h.pesada.alto').replace(/ \(m\)/, '')) + '</figcaption></figure>'
            + '<p class="vistas-leyenda"><i class="ley-contenedor"></i>' + esc(t('h.pesada.contenedor')) + ' <i class="ley-carga"></i>' + esc(t('h.pesada.tuCarga')) + '</p>';
          raiz.querySelector('#veredicto-pesada').className = 'veredicto veredicto--' + tipo;
          raiz.querySelector('#veredicto-pesada').textContent = t('h.pesada.' + tipo);
          raiz.querySelector('#usar-herramienta').href = urlCotizar({
            modo: 'heavy', peso: Math.round(P * 1000), volumen: num(L, 2) + ' × ' + num(W, 2) + ' × ' + num(H, 2) + ' m', notas: t('h.pesada.' + tipo)
          });
        }
        raiz.addEventListener('input', function (ev) { if (ev.target.dataset.dato) { e[ev.target.dataset.dato] = ev.target.value; evaluar(); } });
        evaluar();
      }
    }
  };

  function renderServicio() {
    var s = servicioActual, d = c(s.id), herr = HERRAMIENTAS[s.herramienta];
    if (!estado[s.herramienta]) estado[s.herramienta] = JSON.parse(JSON.stringify(herr.inicial));
    var otros = SERVICIOS.filter(function (x) { return x !== s; });
    var como = d.parrafos || d.cita || d.destacados;

    document.getElementById('servicio').innerHTML =
      '<section class="svc-portada' + (s.imagen ? '' : ' svc-portada--ilustrada') + '"' + (s.imagen ? ' style="--imagen:url(\'' + s.imagen + '\')"' : '') + '>'
      + '<div class="caja">'
      +   '<nav class="migas" aria-label="breadcrumb"><a href="index.html">' + esc(t('nav.volver')) + '</a><span>/</span><a href="index.html#servicios">' + esc(t('nav.servicios')) + '</a><span>/</span><span aria-current="page">' + esc(d.titulo) + '</span></nav>'
      +   '<div class="antetitulo">' + esc(d.antetitulo) + '</div>'
      +   '<h1>' + esc(d.titulo) + '</h1>'
      +   '<p class="portada-bajada">' + esc(d.intro) + '</p>'
      +   '<div class="portada-botones"><a class="boton boton--naranja" href="' + urlCotizar({ modo: s.modo }) + '">' + esc(t('svc.cotizar')) + icono('i-flecha') + '</a>'
      +   '<button class="boton boton--borde abrir-whatsapp" type="button">' + icono('i-whatsapp') + esc(t('svc.experto')) + '</button></div>'
      + '</div></section>'
      + '<nav class="svc-selector" aria-label="' + esc(t('nav.servicios')) + '"><div class="caja">' + SERVICIOS.map(function (x) {
          return '<a href="servicio.html?s=' + x.id + '"' + (x === s ? ' aria-current="page"' : '') + '>' + icono(x.icono) + '<span>' + esc(c(x.id).nombre) + '</span></a>';
        }).join('') + '</div></nav>'
      + '<section class="seccion"><div class="caja">'
      +   '<div class="seccion-cabecera"><div class="antetitulo">' + esc(t('svc.soluciones')) + '</div><h2>' + esc(t('svc.solucionesTitulo')) + '</h2></div>'
      +   '<div class="svc-soluciones">' + d.soluciones.map(function (x, i) {
            return '<article class="solucion"><span class="solucion-numero">0' + (i + 1) + '</span><h3>' + esc(x.titulo) + '</h3><p>' + esc(x.texto) + '</p></article>';
          }).join('') + '</div>'
      + '</div></section>'
      + (como ? '<section class="seccion seccion--arena"><div class="caja svc-como">'
          + '<div><div class="antetitulo">' + esc(t('svc.como')) + '</div>'
          +   (d.cita ? '<blockquote class="cita">“' + esc(d.cita) + '”</blockquote>' : '<h2>' + esc(d.subtitulo || t('svc.comoTitulo')) + '</h2>')
          +   (d.parrafos || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>'
          +   (d.destacados ? '<ul class="puntos puntos--tarjeta">' + d.destacados.map(function (x) { return '<li>' + icono('i-check') + '<span>' + esc(x) + '</span></li>'; }).join('') + '</ul>'
                            : '<div class="svc-como-icono">' + icono(s.icono) + '</div>')
          + '</div></section>' : '')
      + (d.casos ? '<section class="seccion seccion--arena"><div class="caja">'
          + '<div class="seccion-cabecera"><div class="antetitulo">' + esc(t('svc.casos')) + '</div><p>' + esc(t('svc.casosTexto')) + '</p></div>'
          + '<div class="casos-pesada">' + d.casos.map(function (x) {
              return '<article class="caso-pesada"><img src="' + x.imagen + '" alt="" loading="lazy" /><div><span class="caso-sector">' + esc(x.sector) + '</span><h3>' + esc(x.titulo) + '</h3><p>' + esc(x.texto) + '</p></div></article>';
            }).join('') + '</div></div></section>' : '')
      + '<section class="seccion"><div class="caja"><div class="herramienta" id="herramienta">'
      +   '<div class="herramienta-cabecera"><span class="insignia">' + esc(t('svc.herramienta')) + '</span><h2>' + esc(t(herramientaClave(s.herramienta) + '.titulo')) + '</h2><p>' + esc(t(herramientaClave(s.herramienta) + '.texto')) + '</p></div>'
      +   herr.html(estado[s.herramienta])
      +   '<p class="herramienta-nota">' + esc(t('svc.referencia')) + '</p>'
      + '</div></div></section>'
      + '<section class="svc-cta"><div class="caja"><div><h2>' + esc(t('svc.listo')) + '</h2><p>' + esc(t('svc.listoTexto')) + '</p></div>'
      +   '<div class="portada-botones"><a class="boton boton--naranja" href="' + urlCotizar({ modo: s.modo }) + '">' + esc(t('svc.cotizar')) + icono('i-flecha') + '</a>'
      +   '<button class="boton boton--borde abrir-whatsapp" type="button">' + icono('i-whatsapp') + 'WhatsApp</button></div></div></section>'
      + '<section class="seccion seccion--arena"><div class="caja"><div class="seccion-cabecera"><div class="antetitulo">' + esc(t('svc.otros')) + '</div></div>'
      +   '<div class="otros-servicios">' + otros.map(function (x) {
            return '<a class="otro-servicio" href="servicio.html?s=' + x.id + '"><span class="servicio-icono">' + icono(x.icono) + '</span><strong>' + esc(c(x.id).titulo) + '</strong><span class="otro-flecha">' + icono('i-flecha') + '</span></a>';
          }).join('') + '</div></div></section>';

    herr.activar(document.getElementById('herramienta'), estado[s.herramienta]);
    var tira = document.querySelector('.svc-selector .caja'), activo = tira.querySelector('[aria-current]');
    tira.scrollLeft = activo.offsetLeft - (tira.clientWidth - activo.offsetWidth) / 2;
  }

  function herramientaClave(id) {
    return { contenedores: 'h.cont', aereo: 'h.aereo', camion: 'h.camion', almacen: 'h.almacen', docs: 'h.docs', pesada: 'h.pesada' }[id];
  }

  /* ── Arranque ── */
  montarEstructura();
  activarEstructura();
  iniciarCotizador();
  if (servicioActual) alCambiarIdioma.push(renderServicio);
  var navegador = (navigator.language || '').toLowerCase().indexOf('es') === 0 ? 'es' : 'en';
  aplicarIdioma(parametros.get('lang') || leerGuardado() || navegador);
})();
