/* [DEMO] Servidor de mentira para la copia de demostración de la tienda SVR.
   Reemplaza al Apps Script real: lo que se marque en el panel (4dm1n/) se
   guarda solo en el navegador de quien mira y la tienda lo lee de ahí.
   No hay planilla, ni pedidos, ni WhatsApp reales. Ofertas y stock de ejemplo. */
(function () {
  var LLAVE = 'svr-demo-propuesta-v2';
  var hoy = new Date().toISOString();
  var INICIAL = {
    agotados: ['topialyse-palpebral'],
    inventario: {
      'sebia-active-gel': 18, 'sebia-gel-moussant-200': 32, 'sebia-gel-moussant-400': 4,
      'sebia-ampoule-az': 12, 'sebia-serum': 9, 'topialyse-huile-lavante': 21,
      'topialyse-baume-protect': 15, 'cicavit-creme-hppi': 27, 'sunsecure-extreme': 40,
      'sunsecure-blur': 3, 'sunsecure-fluide-photoage': 11, 'sensifine-extreme': 7,
      'sensifine-eau-micellaire': 24, 'clairial-ampoule': 6, 'clairial-night-peel': 14,
      'antiage-ampoule-c': 10, 'antiage-ampoule-b3': 2, 'antiage-c20': 8, 'antiage-hyalu': 5
    },
    precios: {
      'sunsecure-extreme': { precio: 45.11, antes: 53.07, t: hoy },
      'sebia-active-gel': { precio: 50.29, antes: 59.16, t: hoy },
      'antiage-c20': { precio: 61.25, antes: 76.56, t: hoy }
    }
  };

  function leer() {
    try {
      var d = JSON.parse(localStorage.getItem(LLAVE));
      if (d && Array.isArray(d.agotados) && d.precios && d.inventario) return d;
    } catch (e) { /* sin almacenamiento: estado inicial */ }
    return JSON.parse(JSON.stringify(INICIAL));
  }
  function guardar(d) {
    try { localStorage.setItem(LLAVE, JSON.stringify(d)); } catch (e) { /* modo privado */ }
  }

  function responder(url, opciones) {
    var d = leer(), cuerpo = {};
    if (opciones && opciones.body) { try { cuerpo = JSON.parse(opciones.body); } catch (e) { cuerpo = {}; } }
    var accion = cuerpo.accion || ((String(url).match(/accion=([^&]+)/) || [])[1]) || '';
    var r;
    if (accion === 'entrar') r = { ok: true, agotados: d.agotados, precios: d.precios };
    else if (accion === 'agotados') {
      if (Array.isArray(cuerpo.agotados)) { d.agotados = cuerpo.agotados; guardar(d); }
      r = { ok: true, agotados: d.agotados, inventario: d.inventario, precios: d.precios };
    }
    else if (accion === 'inventario-leer') r = { ok: true, inventario: d.inventario };
    else if (accion === 'inventario-guardar') {
      Object.keys(cuerpo.cambios || {}).forEach(function (k) {
        var v = cuerpo.cambios[k];
        if (v === null || v === undefined) delete d.inventario[k]; else d.inventario[k] = v;
      });
      guardar(d);
      r = { ok: true, inventario: d.inventario };
    }
    else if (accion === 'precios-guardar') {
      Object.keys(cuerpo.cambios || {}).forEach(function (k) {
        var v = cuerpo.cambios[k];
        if (!v) delete d.precios[k];
        else d.precios[k] = { precio: v.precio, antes: v.antes || null, t: new Date().toISOString() };
      });
      guardar(d);
      r = { ok: true, precios: d.precios };
    }
    else r = { ok: true, demo: true };   // un pedido: no va a ningún lado
    return new Response(JSON.stringify(r), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  var fetchReal = window.fetch.bind(window);
  window.fetch = function (url, opciones) {
    if (typeof url === 'string' && url.indexOf('demo://svr') === 0) {
      return new Promise(function (ok) { setTimeout(function () { ok(responder(url, opciones)); }, 220); });
    }
    return fetchReal(url, opciones);
  };
})();
