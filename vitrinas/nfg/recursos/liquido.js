// Logo líquido: el isotipo «nfg.» armado con miles de partículas que se vuelven líquidas al pasar el cursor (o el
// dedo) y vuelven solas a su sitio. Va sobre el fondo oscuro de «¿No sabes por dónde empezar?», junto al formulario
// del recomendador de kits, y «piensa» (se revuelve solo, con pensar()) cuando se elige una opción. Antes ahí había
// una caja blanca con el logo quieto, que Juan veía «flat», «un pedazo blanco de cuadrado» (reunión del 23 oct 2026).
// Nicola trajo el efecto el 26 oct.
// Adaptado de «Sculpture Hero — liquid particle hero» de guglielmogiannattasio.it (21st.dev). El motor de
// partículas (WebGL2) es el suyo, pasado de TypeScript y React a JavaScript sin dependencias; conserva sus nombres
// para que se pueda comparar con el original. Cambios para la marca:
// - la estela toma el turquesa y el aguamarina de Negrofarto, en vez del brillo metálico;
// - las partículas salen del logo (SVG pasado a píxeles sobre el color de fondo de la sección) y su tamaño y lugar
//   los pone el CSS con el <img> de respaldo;
// - la cantidad de partículas y el radio del cursor van según el ancho del logo, no de un héroe a pantalla completa;
// - el armado inicial remolinea menos, para que no se salga de la caja;
// - pensar(): un cursor invisible lo revuelve en espiral y lo suelta;
// - cambiar(): la metamorfosis que propuso Juan el 29 oct 2026 (tipo Venom): al elegir el tipo de negocio, el logo se
//   deshace en material líquido y ese mismo material se acomoda en el logo de un trabajo (cafetería → SpillMug). Cada
//   partícula sigue donde estaba y solo cambia de casa y de color; el logo nuevo puede ser un SVG o una imagen;
// - sin movimiento ambiental continuo (WCAG 2.2.2): solo el armado al aparecer (unos 3 s), la reacción al cursor
//   y lo que dura pensar() o la metamorfosis.
// Sin WebGL2, con «reducir movimiento» o si algo falla, queda el logo quieto (el <img>).
(function () {
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };

  /* ── Shaders: los del original. Solo cambia el color de la estela, en PART_VS ── */

  const NOISE = `
float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); vec2 u=f*f*f*(f*(f*6.0-15.0)+10.0);
  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x), mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x), u.y); }
vec2 ambientField(vec2 uv, float t){
  vec2 q = uv*vec2(3.2,1.7);
  vec2 a = vec2(vnoise(q+vec2(t*0.11,0.0))-0.5, vnoise(q+vec2(5.2,t*0.08)+3.1)-0.5);
  vec2 q2 = uv*vec2(7.5,4.0) + vec2(-t*0.19, t*0.13);
  vec2 b = vec2(vnoise(q2+1.7)-0.5, vnoise(q2+9.3)-0.5);
  return a + b*0.45;
}
`;

  // Energía del material en un punto: la usan la imagen y las partículas, para que el fundido sea complementario.
  const ENERGY = `
float energyAt(vec2 rectPx, vec2 mouse, float radius, float presence, float wakeEnergy){
  vec2 d = rectPx - mouse;
  float f = exp(-dot(d,d)/(radius*radius))*presence;
  return smoothstep(0.06, 0.5, f*1.15 + wakeEnergy*1.7);
}
`;

  const QUAD_VS = `#version 300 es
layout(location=0) in vec2 aPos;
out vec2 vUv;
void main(){ vUv = aPos*0.5+0.5; gl_Position = vec4(aPos,0.0,1.0); }
`;

  // Mapa de flujo (la estela del cursor). RGBA8: velocidad codificada alrededor de 128 y energía en B.
  const FLOW_FS = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 o;
uniform sampler2D uPrev;
uniform vec2 uTexel;
uniform vec2 uMouse;
uniform vec2 uVel;
uniform vec2 uSize;
uniform float uRadius;
uniform float uPresence;
uniform float uDecay;
vec2 decV(vec4 c){ return (c.rg*255.0-128.0)/127.0; }
void main(){
  vec2 v0 = decV(texture(uPrev, vUv));
  vec2 uv = vUv - v0*uTexel*2.5;
  vec4 c = texture(uPrev, uv)*0.52
    + 0.12*(texture(uPrev, uv+vec2(uTexel.x,0.0)) + texture(uPrev, uv-vec2(uTexel.x,0.0))
          + texture(uPrev, uv+vec2(0.0,uTexel.y)) + texture(uPrev, uv-vec2(0.0,uTexel.y)));
  vec2 v = decV(c);
  float p = c.b;
  vec2 d = (vUv-uMouse)*uSize;
  float f = exp(-dot(d,d)/(uRadius*uRadius))*uPresence;
  float sp = clamp(length(uVel)*2.5, 0.0, 1.0);
  v += uVel*f*0.22;
  p = max(p, f*sp);
  v *= uDecay;
  p *= uDecay;
  v = sign(v)*max(abs(v)-1.2/127.0, 0.0);
  p = max(p-1.2/255.0, 0.0);
  v = clamp(v, -1.0, 1.0);
  o = vec4((v*127.0+128.0)/255.0, p, 1.0);
}
`;

  // Un paso de la simulación en la GPU: estado = (desplazamiento.xy, velocidad.xy) en px CSS del rectángulo.
  const SIM_FS = `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D uState;
uniform sampler2D uHome;
uniform sampler2D uFlow;
uniform vec2 uSize;
uniform vec2 uMouse;
uniform float uRadius;
uniform float uPresence;
uniform float uStrength;
uniform float uSpread;
uniform float uTurb;
uniform float uReturn;
uniform float uTime;
uniform float uDt;
uniform float uIntro;
uniform float uIntroTurb;
uniform vec2 uWallMin;
uniform vec2 uWallMax;
${NOISE}
vec2 curl(vec2 p){
  const float e = 0.35;
  float a = vnoise(p+vec2(0.0,e)) - vnoise(p-vec2(0.0,e));
  float b = vnoise(p+vec2(e,0.0)) - vnoise(p-vec2(e,0.0));
  return vec2(a, -b)/(2.0*e);
}
void main(){
  ivec2 ij = ivec2(gl_FragCoord.xy);
  vec4 hm = texelFetch(uHome, ij, 0);
  if(hm.w <= 0.0){ o = vec4(0.0); return; }
  vec4 st = texelFetch(uState, ij, 0);
  vec2 off = st.xy;
  vec2 vel = st.zw;
  float sd = hm.z;
  float light = 0.45 + sd*1.1;

  vec2 p = hm.xy*uSize + off;
  vec4 fl = texture(uFlow, clamp(p/uSize, 0.0, 1.0));
  vec2 wake = (fl.rg*255.0-128.0)/127.0;
  float pr = fl.b;

  vec2 toM = p - uMouse;
  float r2 = dot(toM,toM);
  float f = exp(-r2/(uRadius*uRadius))*uPresence;
  vec2 n = toM*inversesqrt(r2+1.0);
  float e = clamp(pr*2.0 + f, 0.0, 1.0);

  vec2 acc = vec2(0.0);
  acc += n*f*1.25*uStrength*uSpread*light;
  acc += vec2(-n.y, n.x)*f*1.45*uStrength*uSpread*(0.4+sd);
  acc += (wake*42.0*uSpread*light - vel)*e*0.08;
  vec2 q = p*0.0095 + vec2(uTime*0.35, -uTime*0.2);
  vec2 c = curl(q) + 0.5*curl(q*2.3 + 7.1);
  acc += c*(e*1.2*uSpread + uIntro*uIntroTurb)*uTurb*light;
  float k = (0.006 + 0.02*uReturn)*(0.65+sd*0.7)*(1.0 - uIntro*0.75);
  acc -= off*k;
  // NFG: paredes blandas en los bordes del lienzo (la metamorfosis dispersa el material más que el armado inicial): el
  // material que llega se frena y vuelve, en vez de salirse y quedar cortado en seco
  acc -= (p - clamp(p, uWallMin, uWallMax))*0.06;

  vel += acc*uDt;
  vel *= pow(mix(0.93, 0.955, e), uDt);
  off += vel*uDt;
  if(dot(off,off) < 0.0004 && dot(vel,vel) < 0.0004){ off = vec2(0.0); vel = vec2(0.0); }
  o = vec4(off, vel);
}
`;

  // Partículas: un cuadrito por partícula, una cápsula estirada en la dirección en que se mueve.
  const PART_VS = `#version 300 es
precision highp float;
layout(location=0) in vec2 aCorner;
uniform sampler2D uState;
uniform sampler2D uHome;
uniform sampler2D uCol;
uniform sampler2D uColFrom;
uniform sampler2D uFlow;
uniform int uTexW;
uniform vec4 uRect;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uRadius;
uniform float uPresence;
uniform float uDot;
uniform float uTime;
uniform float uAmbient;
uniform float uStreak;
uniform float uIntroVis;
uniform float uRest;
uniform float uColMix;
uniform vec3 uTint;
uniform vec3 uEstela;
uniform vec3 uBrillo;
out vec2 vLocal;
out float vHalfLen;
out float vR;
out vec3 vCol;
out float vA;
${NOISE}
${ENERGY}
void main(){
  int id = gl_InstanceID;
  ivec2 ij = ivec2(id % uTexW, id / uTexW);
  vec4 hm = texelFetch(uHome, ij, 0);
  vec4 st = texelFetch(uState, ij, 0);
  // NFG: en la metamorfosis, el color pasa del que tenía la partícula en el logo anterior al suyo en el nuevo
  vec4 cl = mix(texelFetch(uColFrom, ij, 0), texelFetch(uCol, ij, 0), uColMix);

  float wakeE = texture(uFlow, hm.xy).b;
  float E = energyAt(hm.xy*uRect.zw, uMouse, uRadius, uPresence, wakeE);
  float lift = smoothstep(0.35, 2.5, length(st.xy));
  float a = max(max(E, lift), max(uRest, 1.0-uIntroVis));
  if(a < 0.01 || hm.w <= 0.0){ gl_Position = vec4(2.0,2.0,2.0,1.0); return; }

  vec2 base = uRect.xy + hm.xy*uRect.zw + st.xy;
  base -= ambientField(hm.xy, uTime)*10.0*uAmbient;

  vec2 v = st.zw;
  float sp = length(v);
  vec2 dir = sp > 0.001 ? v/sp : vec2(1.0,0.0);
  float r = uDot*hm.w*0.5;
  float len = min(sp*1.25, 18.0)*uStreak;
  vec2 lc = aCorner*vec2(r + len*0.5 + 1.0, r + 1.0);
  vec2 center = base - dir*len*0.5;
  vec2 world = center + dir*lc.x + vec2(-dir.y, dir.x)*lc.y;

  vec2 clip = world/uRes*2.0-1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  vLocal = lc;
  vHalfLen = len*0.5;
  vR = r;
  vec3 col = cl.rgb*uTint;
  // NFG: el material que corre toma el turquesa de la marca, y el más rápido, el aguamarina
  // (en el original se aclaraba como metal líquido)
  col = mix(col, uEstela, smoothstep(1.0, 9.0, sp)*0.9);
  col = mix(col, uBrillo, smoothstep(9.0, 22.0, sp)*0.55);
  vCol = col;
  vA = a;
}
`;

  const PART_FS = `#version 300 es
precision highp float;
in vec2 vLocal;
in float vHalfLen;
in float vR;
in vec3 vCol;
in float vA;
uniform float uDpr;
out vec4 o;
void main(){
  vec2 q = vec2(max(abs(vLocal.x)-vHalfLen, 0.0), vLocal.y);
  float d = length(q) - vR;
  float a = clamp(0.5 - d*uDpr, 0.0, 1.0);
  float tail = vHalfLen > 0.0 ? clamp(0.5 - vLocal.x/(2.0*(vHalfLen+vR)), 0.0, 1.0) : 0.0;
  a *= 1.0 - tail*0.55;
  a *= vA;
  if(a < 0.004) discard;
  o = vec4(vCol*a, a);
}
`;

  // La imagen nítida, con un lente suave, que se desvanece donde el material se volvió líquido.
  const IMAGE_FS = `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D uImg;
uniform sampler2D uFlow;
uniform vec2 uRes;
uniform float uDpr;
uniform vec4 uRect;
uniform vec3 uBg;
uniform vec3 uImgBg;
uniform vec2 uMouse;
uniform float uPresence;
uniform float uRadius;
uniform float uStrength;
uniform float uTime;
uniform float uAmbient;
uniform float uIntroVis;
uniform float uRest;
uniform float uAlphaMode;
${NOISE}
${ENERGY}
void main(){
  vec2 px = vec2(gl_FragCoord.x, uRes.y*uDpr - gl_FragCoord.y)/uDpr;
  vec2 size = uRect.zw;
  vec2 uv = (px-uRect.xy)/size;
  if(uv.x < -0.05 || uv.x > 1.05 || uv.y < -0.12 || uv.y > 1.12){ o = vec4(0.0); return; }
  vec4 fl = texture(uFlow, clamp(uv,0.0,1.0));
  vec2 vel = (fl.rg*255.0-128.0)/127.0;
  vec2 rp = uv*size;
  vec2 toM = rp - uMouse;
  float fall = exp(-dot(toM,toM)/(uRadius*uRadius))*uPresence;
  vec2 disp = -toM*0.22*uStrength*fall - vel*10.0*uStrength;
  disp += ambientField(uv, uTime)*10.0*uAmbient;
  vec2 suv = uv + disp/size;
  vec4 tx = texture(uImg, suv);
  vec3 col = tx.rgb;
  vec2 e = smoothstep(vec2(0.0), vec2(0.004,0.01), suv) * smoothstep(vec2(1.0), vec2(0.996,0.99), suv);
  float key = uAlphaMode > 0.5 ? tx.a : smoothstep(0.012, 0.05, length(col-uImgBg));
  float k = key*e.x*e.y;
  float E = energyAt(rp, uMouse, uRadius, uPresence, fl.b);
  float show = (1.0 - max(E, uRest))*uIntroVis;
  vec3 mat = uAlphaMode > 0.5 ? col : col*(uBg/max(uImgBg, vec3(0.001)));
  float A = k*show;
  o = vec4(mat*A, A);
}
`;

  function compile(gl, vs, fs) {
    const make = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(sh);
        gl.deleteShader(sh);
        throw new Error('Shader: ' + log);
      }
      return sh;
    };
    const p = gl.createProgram();
    const v = make(gl.VERTEX_SHADER, vs);
    const f = make(gl.FRAGMENT_SHADER, fs);
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.bindAttribLocation(p, 0, 'aPos');
    gl.linkProgram(p);
    gl.deleteShader(v);
    gl.deleteShader(f);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('Link: ' + gl.getProgramInfoLog(p));
    const u = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(p, i);
      if (info) u[info.name] = gl.getUniformLocation(p, info.name);
    }
    return { p, u };
  }

  /* ── Motor ── */

  const TEX_W = 1024;
  const SETTLE_FRAMES = 270;

  // NFG, la metamorfosis: el material de un logo pasa a otro sin saltar. Cada partícula del logo nuevo toma el lugar y la
  // velocidad de una del anterior (la i-ésima de las n nuevas, de la que le toca entre las m viejas, en el mismo orden) y
  // su desplazamiento se corrige para que siga exactamente donde estaba aunque su casa ahora sea otra.
  const REHOME_FS = `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D uOldState;
uniform sampler2D uOldHome;
uniform sampler2D uNewHome;
uniform vec2 uSize;
uniform float uNOld;
uniform float uNNew;
void main(){
  ivec2 ij = ivec2(gl_FragCoord.xy);
  vec4 hn = texelFetch(uNewHome, ij, 0);
  if(hn.w <= 0.0){ o = vec4(0.0); return; }
  int i = ij.y*${TEX_W} + ij.x;
  int s = min(int(floor((float(i) + 0.5)*uNOld/uNNew)), int(uNOld) - 1);
  ivec2 sj = ivec2(s % ${TEX_W}, s / ${TEX_W});
  vec4 st = texelFetch(uOldState, sj, 0);
  vec4 ho = texelFetch(uOldHome, sj, 0);
  o = vec4((ho.xy - hn.xy)*uSize + st.xy, st.zw);
}
`;

  class LiquidEngine {
    lastImage = null;
    // Se llama una vez, cuando el primer cuadro ya se dibujó.
    onFirstFrame = null;

    lowPower = false;
    stateFormat = { internal: 0, type: 0 };
    imgTex = null;
    flowTex = [];
    flowFb = [];
    flowW = 256;
    flowH = 104;
    flowIdx = 0;
    flowDirty = false;
    homeTex = null;
    colTex = null;
    stateTex = [];
    stateFb = [];
    stateIdx = 0;
    texH = 1;
    n = 0;
    gridW = 1;
    stateDirty = false;
    alphaMode = false;
    imgBg = [0.918, 0.914, 0.906];
    flowing = 0;
    homeData = null;
    colData = null;
    // metamorfosis: el color de partida de cada partícula y cuánto lleva pasando al suyo (0 a 1)
    colFromTex = null;
    mezcla = 1;
    derritiendo = false;
    derritiendoDesde = 0;
    // lo que tarda el armado, en ms: 3200 al aparecer el logo, menos en la metamorfosis
    introMs = 3200;

    aspect = 2.5;
    rect = { x: 0, y: 0, w: 1, h: 1 };
    cssW = 1;
    cssH = 1;

    target = { x: -9999, y: -9999 };
    mouse = { x: -9999, y: -9999 };
    prevMouse = { x: -9999, y: -9999 };
    mvel = { x: 0, y: 0 };
    presence = 0;
    presenceTarget = 0;
    burst = 0;
    lastInput = -1e9;
    settle = 1e9;
    touchRelease = 0;

    time = 0;
    introT = 1;
    raf = 0;
    running = false;
    last = 0;
    skip = 0;
    visible = true;
    ready = false;
    destroyed = false;
    lost = false;

    constructor(canvas, opts, onFail) {
      this.canvas = canvas;
      this.opts = opts;
      this.onFail = onFail;
      // alpha: mientras el lienzo no pinta, se ve lo que hay debajo
      const gl = canvas.getContext('webgl2', {
        alpha: true, antialias: false, depth: false, stencil: false,
        premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance',
      });
      if (!gl) throw new Error('WebGL2 unavailable');
      this.gl = gl;
      this.lowPower = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4
        || window.matchMedia('(pointer: coarse)').matches;
      this.initGL();
      canvas.addEventListener('webglcontextlost', this.onLost, false);
    }

    onLost = (e) => {
      e.preventDefault();
      this.lost = true;
      this.stop();
      this.onFail();
    };

    initGL() {
      const gl = this.gl;
      // destinos de render en coma flotante: RGBA16F alcanza (desplazamientos en px, con precisión de subpíxel)
      const full = gl.getExtension('EXT_color_buffer_float');
      const half = full ? null : gl.getExtension('EXT_color_buffer_half_float');
      if (!full && !half) throw new Error('No float render targets');
      this.stateFormat = { internal: gl.RGBA16F, type: gl.HALF_FLOAT };

      this.pFlow = compile(gl, QUAD_VS, FLOW_FS);
      this.pSim = compile(gl, QUAD_VS, SIM_FS);
      this.pPart = compile(gl, PART_VS, PART_FS);
      this.pImg = compile(gl, QUAD_VS, IMAGE_FS);
      this.pRehome = compile(gl, QUAD_VS, REHOME_FS);

      this.vao = gl.createVertexArray();
      gl.bindVertexArray(this.vao);
      this.quad = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      for (let i = 0; i < 2; i++) {
        const t = this.makeTex(gl.RGBA8, this.flowW, this.flowH, gl.RGBA, gl.UNSIGNED_BYTE, null, gl.LINEAR);
        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
        this.flowTex.push(t);
        this.flowFb.push(fb);
      }
      this.clearFlow();
    }

    makeTex(internal, w, h, format, type, data, filter) {
      const gl = this.gl;
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, data);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    }

    clearFlow() {
      const gl = this.gl;
      for (const fb of this.flowFb) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.viewport(0, 0, this.flowW, this.flowH);
        gl.clearColor(128 / 255, 128 / 255, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      this.flowDirty = false;
    }

    clearState() {
      const gl = this.gl;
      for (const fb of this.stateFb) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.viewport(0, 0, TEX_W, this.texH);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      this.stateDirty = false;
    }

    // La imagen nítida del logo, como textura (con mipmaps, para que se vea bien al achicarla).
    texturaImagen(img) {
      const gl = this.gl;
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    }

    // NFG: acepta también un <canvas> (el logo pasado a píxeles), no solo un <img>.
    setImage(img) {
      if (this.destroyed || this.lost) return;
      const gl = this.gl;
      this.lastImage = img;
      this.aspect = (img.naturalWidth || img.width) / (img.naturalHeight || img.height) || 2.5;
      this.flowH = Math.max(32, Math.round(this.flowW / this.aspect));
      for (const t of this.flowTex) {
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, this.flowW, this.flowH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      }
      this.clearFlow();
      if (this.imgTex) gl.deleteTexture(this.imgTex);
      this.imgTex = this.texturaImagen(img);
      this.buildParticles(img);
      this.ready = true;
      if (this.opts.intro && !this.opts.reducedMotion) this.startIntro();
      this.wake();
    }

    // Una partícula por cada píxel con material de una grilla puesta sobre la imagen.
    buildParticles(img) {
      this.subir(this.muestrear(img));
    }

    // NFG: lo que pasa en la CPU al armar las partículas (separado de subir() para la metamorfosis).
    muestrear(img) {
      // NFG: la grilla va según el ancho del logo en pantalla (~1,2 partículas por px), no fija para un héroe
      // a pantalla completa como en el original (640 o 1000).
      const gw = Math.round(clamp(this.rect.w, 120, 900) * (this.lowPower ? 1 : 1.2) * Math.sqrt(clamp(this.opts.density, 0.15, 2)));
      const gh = Math.max(1, Math.round(gw / this.aspect));
      this.gridW = gw;
      let data;
      try {
        const c = document.createElement('canvas');
        c.width = gw;
        c.height = gh;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, gw, gh);
        data = ctx.getImageData(0, 0, gw, gh).data;
      } catch {
        throw new Error('Image is not CORS-readable');
      }
      // una imagen recortada (transparente) se muestrea por alfa; una de fondo plano, por distancia de color
      let transparent = 0;
      for (let i = 3; i < data.length; i += 4 * 7) if (data[i] < 250) transparent++;
      this.alphaMode = transparent > data.length / (4 * 7) / 20;
      if (this.opts.imgBg) this.imgBg = this.opts.imgBg;
      else if (!this.alphaMode) {
        // fondo plano: el promedio de las cuatro esquinas
        let r = 0, g = 0, b = 0, n = 0;
        const pw = Math.max(2, Math.round(gw * 0.012));
        for (const [cx, cy] of [[0, 0], [gw - pw, 0], [0, gh - pw], [gw - pw, gh - pw]]) {
          for (let y = cy; y < cy + pw; y++) {
            for (let x = cx; x < cx + pw; x++) {
              const i = (y * gw + x) * 4;
              r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
            }
          }
        }
        this.imgBg = [r / n / 255, g / n / 255, b / n / 255];
      }
      const home = [];
      const col = [];
      for (let y = 0; y < gh; y++) {
        for (let x = 0; x < gw; x++) {
          const i = (y * gw + x) * 4;
          const r = data[i] / 255;
          const g = data[i + 1] / 255;
          const b = data[i + 2] / 255;
          if (this.alphaMode) {
            const a = data[i + 3] / 255;
            if (a < 0.12) continue;
            if (a < 0.5 && Math.random() > a * 2) continue;
          } else {
            const dev = Math.hypot(r - this.imgBg[0], g - this.imgBg[1], b - this.imgBg[2]);
            if (dev < 0.03) continue;
            if (dev < 0.07 && Math.random() > (dev - 0.03) / 0.04) continue;
          }
          const jx = (Math.random() - 0.5) * 0.6;
          const jy = (Math.random() - 0.5) * 0.6;
          home.push((x + 0.5 + jx) / gw, (y + 0.5 + jy) / gh, Math.random(), 0.85 + Math.random() * 0.3);
          col.push(data[i], data[i + 1], data[i + 2], 255);
        }
      }
      const n = home.length / 4;
      return { home, col, n, texH: Math.max(1, Math.ceil(n / TEX_W)) };
    }

    // Sube las partículas a la GPU. Las texturas de las anteriores se borran, salvo con «conservar» (la metamorfosis las
    // sigue necesitando): entonces se devuelven para borrarlas después con soltar().
    subir({ home, col, n, texH }, conservar = false) {
      const gl = this.gl;
      this.n = n;
      this.texH = texH;
      const total = TEX_W * this.texH;
      const homeArr = new Float32Array(total * 4);
      homeArr.set(home);
      const colArr = new Uint8Array(total * 4);
      colArr.set(col);

      const viejas = { tex: [this.homeTex, this.colTex, this.colFromTex, ...this.stateTex].filter(Boolean), fb: this.stateFb };
      if (!conservar) this.soltar(viejas);
      this.stateTex = [];
      this.stateFb = [];
      this.colFromTex = null;
      this.homeTex = this.makeTex(gl.RGBA32F, TEX_W, this.texH, gl.RGBA, gl.FLOAT, homeArr, gl.NEAREST);
      this.colTex = this.makeTex(gl.RGBA8, TEX_W, this.texH, gl.RGBA, gl.UNSIGNED_BYTE, colArr, gl.NEAREST);
      for (let i = 0; i < 2; i++) {
        const t = this.makeTex(this.stateFormat.internal, TEX_W, this.texH, gl.RGBA, this.stateFormat.type, null, gl.NEAREST);
        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('Float FBO incomplete');
        this.stateTex.push(t);
        this.stateFb.push(fb);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      this.homeData = homeArr;
      this.colData = colArr;
      this.clearState();
      return viejas;
    }

    soltar({ tex, fb }) {
      const gl = this.gl;
      for (const t of tex) gl.deleteTexture(t);
      for (const f of fb) gl.deleteFramebuffer(f);
    }

    startIntro() {
      const gl = this.gl;
      const home = this.homeData;
      if (!home) return;
      const w = this.rect.w > 10 ? this.rect.w : 1300;
      const total = TEX_W * this.texH;
      const st = new Float32Array(total * 4);
      for (let i = 0; i < this.n; i++) {
        const hx = home[i * 4] - 0.5;
        const hy = home[i * 4 + 1] - 0.5;
        const sd = home[i * 4 + 2];
        const ang = (Math.random() - 0.5) * 0.9 + (hx > 0 ? 0 : Math.PI);
        const dist = w * (0.04 + Math.random() * 0.14) * (0.5 + Math.abs(hx) * 1.4);
        st[i * 4] = Math.cos(ang) * dist + hx * w * 0.25 * sd;
        st[i * 4 + 1] = Math.sin(ang) * dist * 0.55 + hy * 120 * (Math.random() - 0.5);
      }
      gl.bindTexture(gl.TEXTURE_2D, this.stateTex[this.stateIdx]);
      gl.texImage2D(gl.TEXTURE_2D, 0, this.stateFormat.internal, TEX_W, this.texH, 0, gl.RGBA, gl.FLOAT, st);
      this.introT = 0;
      this.stateDirty = true;
    }

    resize(cssW, cssH, rect) {
      this.cssW = Math.max(1, cssW);
      this.cssH = Math.max(1, cssH);
      this.rect = rect;
      let dpr = Math.min(window.devicePixelRatio || 1, this.lowPower ? 1.5 : 2);
      const px = this.cssW * this.cssH * dpr * dpr;
      if (px > 4.5e6) dpr = Math.max(1, Math.sqrt(4.5e6 / (this.cssW * this.cssH)));
      const w = Math.round(this.cssW * dpr);
      const h = Math.round(this.cssH * dpr);
      if (this.canvas.width !== w || this.canvas.height !== h) {
        this.canvas.width = w;
        this.canvas.height = h;
      }
      this.draw();
    }

    setVisible(v) {
      this.visible = v;
      if (v) this.wake();
      else this.stop();
    }

    pointer(type, x, y, touch) {
      if (!this.opts.interactive || this.lost) return;
      const now = performance.now();
      if (type === 'leave' || type === 'up') {
        if (touch) this.touchRelease = now + 260;
        else this.presenceTarget = 0;
        this.wake();
        return;
      }
      if (this.mouse.x < -9000 || type === 'down') {
        this.mouse.x = this.prevMouse.x = x;
        this.mouse.y = this.prevMouse.y = y;
      }
      this.target.x = x;
      this.target.y = y;
      this.presenceTarget = 1;
      this.lastInput = now;
      this.settle = 0;
      if (type === 'down') {
        this.burst = 1;
        this.touchRelease = 0;
      }
      this.wake();
    }

    // NFG: el logo «piensa». Un cursor invisible lo revuelve en una espiral que se abre y se cierra, y lo suelta.
    pensar(ms = 1500) {
      if (!this.ready || this.lost || this.destroyed || !this.opts.interactive) return;
      cancelAnimationFrame(this.pensandoRaf);
      const r = this.rect, cx = r.x + r.w / 2, cy = r.y + r.h / 2, ini = performance.now();
      const paso = (ahora) => {
        if (this.destroyed || this.lost) return;
        const k = clamp((ahora - ini) / ms, 0, 1);
        const ang = -Math.PI / 2 + k * Math.PI * 2.6;
        const rad = 0.06 + 0.3 * Math.sin(Math.PI * k);
        this.pointer('move', cx + Math.cos(ang) * r.w * rad * 1.15, cy + Math.sin(ang) * r.w * rad * 0.62, false);
        if (k < 1) this.pensandoRaf = requestAnimationFrame(paso);
        else this.pointer('leave', 0, 0, false);
      };
      this.pensandoRaf = requestAnimationFrame(paso);
    }

    // NFG, metamorfosis, primera mitad: todo el logo pasa a ser material (partículas, que en reposo se ven igual que la
    // imagen) y el remolino del armado inicial lo revuelve: se deshace sin que nadie lo toque. Sigue así hasta transformar().
    derretir() {
      if (!this.ready || this.lost || this.destroyed) return;
      this.derritiendo = true;
      this.derritiendoDesde = performance.now();
      this.introT = 0;
      this.introMs = 2200;
      this.stateDirty = true;
      this.wake();
    }

    // NFG, metamorfosis, segunda mitad: el mismo material se acomoda en otro logo. «img» es el logo nuevo, ya en píxeles y
    // del mismo tamaño y proporción que el anterior. Cada partícula nueva toma el lugar de una de las anteriores (por la GPU,
    // sin leer nada de vuelta) y de ahí vuelve sola a su nueva casa, con el remolino del armado cada vez más suave; el color
    // pasa del de antes al suyo, y la imagen nítida entra cuando el material se asienta. Con «instantaneo» (fuera de pantalla,
    // donde nadie la ve) el logo nuevo queda en su sitio de una vez. Devuelve false si no pudo.
    transformar(img, instantaneo = false) {
      if (this.destroyed || this.lost) return false;
      // sin material todavía, o con otra proporción (el lugar del logo cambió de forma): se arma de cero, con el armado inicial
      const proporcion = (img.naturalWidth || img.width) / (img.naturalHeight || img.height);
      if (!this.ready || !this.n || Math.abs(proporcion - this.aspect) > 0.01) { this.setImage(img); return true; }
      const gl = this.gl;
      const d = this.muestrear(img);
      if (!d.n) return false;
      const antes = { n: this.n, home: this.homeTex, estado: this.stateTex[this.stateIdx], col: this.colData };
      const viejas = this.subir(d, true);
      // el color de partida: el de la partícula a la que sustituye
      const desde = new Uint8Array(TEX_W * this.texH * 4);
      for (let i = 0; i < d.n; i++) {
        const s = Math.min(antes.n - 1, Math.floor((i + 0.5) * antes.n / d.n));
        desde.set(antes.col.subarray(s * 4, s * 4 + 4), i * 4);
      }
      this.colFromTex = this.makeTex(gl.RGBA8, TEX_W, this.texH, gl.RGBA, gl.UNSIGNED_BYTE, desde, gl.NEAREST);
      // el estado: la posición y la velocidad de la que sustituye, con el desplazamiento corregido por el cambio de casa
      const P = this.pRehome;
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.stateFb[this.stateIdx]);
      gl.viewport(0, 0, TEX_W, this.texH);
      gl.disable(gl.BLEND);
      gl.useProgram(P.p);
      gl.bindVertexArray(this.vao);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, antes.estado);
      gl.uniform1i(P.u.uOldState, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, antes.home);
      gl.uniform1i(P.u.uOldHome, 1);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, this.homeTex);
      gl.uniform1i(P.u.uNewHome, 2);
      gl.uniform2f(P.u.uSize, this.rect.w, this.rect.h);
      gl.uniform1f(P.u.uNOld, antes.n);
      gl.uniform1f(P.u.uNNew, d.n);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      this.soltar(viejas);
      if (this.imgTex) gl.deleteTexture(this.imgTex);
      this.imgTex = this.texturaImagen(img);
      this.lastImage = img;
      this.mezcla = 0;
      this.derritiendo = false;
      this.introT = 0;
      this.introMs = 2200;
      this.stateDirty = true;
      if (instantaneo) {
        this.mezcla = 1;
        this.introT = 1;
        this.clearState();
        gl.deleteTexture(this.colFromTex);
        this.colFromTex = null;
      }
      this.wake();
      return true;
    }

    wake() {
      if (!this.ready || this.running || !this.visible || this.destroyed || this.lost) {
        if (this.ready && !this.running) this.draw();
        return;
      }
      this.running = true;
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.frame);
    }

    stop() {
      this.running = false;
      cancelAnimationFrame(this.raf);
    }

    // NFG: el radio es una fracción del ancho del logo (en el original, px a 1440 de ancho).
    radiusPx() {
      return this.opts.radius * this.rect.w;
    }

    strength() {
      return this.opts.strength * (this.opts.reducedMotion ? 0.5 : 1);
    }

    frame = (now) => {
      if (!this.running) return;
      const rawMs = now - this.last;
      const dt = clamp(rawMs / 16.6667, 0.25, 3);
      this.last = now;
      const o = this.opts;
      const ambientOn = o.ambient && !o.reducedMotion;

      if (this.touchRelease && now > this.touchRelease) {
        this.presenceTarget = 0;
        this.touchRelease = 0;
      }
      const ease = 1 - Math.pow(1 - 0.22, dt);
      this.mouse.x += (this.target.x - this.mouse.x) * ease;
      this.mouse.y += (this.target.y - this.mouse.y) * ease;
      const vx = (this.mouse.x - this.prevMouse.x) / dt;
      const vy = (this.mouse.y - this.prevMouse.y) / dt;
      this.prevMouse.x = this.mouse.x;
      this.prevMouse.y = this.mouse.y;
      this.mvel.x += (clamp(vx, -60, 60) - this.mvel.x) * 0.5;
      this.mvel.y += (clamp(vy, -60, 60) - this.mvel.y) * 0.5;
      const pk = this.presenceTarget > this.presence ? 0.1 : 0.035;
      this.presence += (this.presenceTarget - this.presence) * (1 - Math.pow(1 - pk, dt));
      if (this.presence < 0.001 && this.presenceTarget === 0) this.presence = 0;
      const fk = this.presenceTarget > this.flowing ? 0.05 : 0.018;
      this.flowing += (this.presenceTarget - this.flowing) * (1 - Math.pow(1 - fk, dt));
      if (this.flowing < 0.002 && this.presenceTarget === 0) this.flowing = 0;
      // si el logo nuevo no llega (o no se pudo preparar), el material no se queda derretido: se arma otra vez
      if (this.derritiendo && now - this.derritiendoDesde > 4000) this.derritiendo = false;
      if (this.introT < 1 && !this.derritiendo) this.introT = Math.min(1, this.introT + Math.min(rawMs, 100) / this.introMs);
      if (this.mezcla < 1) {
        this.mezcla = Math.min(1, this.mezcla + Math.min(rawMs, 100) / 700);
        if (this.mezcla >= 1 && this.colFromTex) { this.gl.deleteTexture(this.colFromTex); this.colFromTex = null; }
      }

      const interacting = this.presence > 0.001 || this.burst > 0;
      // el reposo se cuenta en cuadros simulados, para que un equipo lento no salte a mitad del regreso
      this.settle = interacting ? 0 : this.settle + dt;
      const active = interacting || this.settle < SETTLE_FRAMES || this.introT < 1 || this.mezcla < 1;

      if (!active) {
        if (this.flowDirty) this.clearFlow();
        if (this.stateDirty) this.clearState();
        if (!ambientOn) {
          this.draw();
          this.firstFrame();
          this.stop();
          return;
        }
        this.raf = requestAnimationFrame(this.frame);
        if (this.skip++ % 2) return;
        this.time += (dt * 2 * o.speed) / 60;
        this.draw();
        this.firstFrame();
        return;
      }
      this.raf = requestAnimationFrame(this.frame);
      // el campo se acelera mientras el material se revuelve
      this.time += (dt * o.speed * (1 + this.flowing * 1.6)) / 60;
      this.stepFlow(dt);
      this.stepSim(dt);
      this.burst = Math.max(0, this.burst - 0.1 * dt);
      this.draw();
      this.firstFrame();
    };

    firstFrame() {
      if (this.onFirstFrame) {
        const cb = this.onFirstFrame;
        this.onFirstFrame = null;
        // un cuadro más, para que el lienzo ya esté en pantalla
        requestAnimationFrame(() => cb());
      }
    }

    stepFlow(dt) {
      const gl = this.gl;
      const P = this.pFlow;
      const dst = 1 - this.flowIdx;
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.flowFb[dst]);
      gl.viewport(0, 0, this.flowW, this.flowH);
      gl.disable(gl.BLEND);
      gl.useProgram(P.p);
      gl.bindVertexArray(this.vao);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.flowTex[this.flowIdx]);
      gl.uniform1i(P.u.uPrev, 0);
      gl.uniform2f(P.u.uTexel, 1 / this.flowW, 1 / this.flowH);
      const r = this.rect;
      gl.uniform2f(P.u.uMouse, (this.mouse.x - r.x) / r.w, (this.mouse.y - r.y) / r.h);
      gl.uniform2f(P.u.uVel, clamp(this.mvel.x / 40, -1, 1), clamp(this.mvel.y / 40, -1, 1));
      gl.uniform2f(P.u.uSize, r.w, r.h);
      gl.uniform1f(P.u.uRadius, this.radiusPx());
      gl.uniform1f(P.u.uPresence, Math.max(this.presence, this.burst));
      gl.uniform1f(P.u.uDecay, Math.pow(0.968, dt));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      this.flowIdx = dst;
      this.flowDirty = true;
    }

    stepSim(dt) {
      if (!this.n) return;
      const gl = this.gl;
      const P = this.pSim;
      const o = this.opts;
      const r = this.rect;
      const dst = 1 - this.stateIdx;
      const intro = o.reducedMotion || !o.intro ? 0 : Math.pow(1 - this.introT, 2);
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.stateFb[dst]);
      gl.viewport(0, 0, TEX_W, this.texH);
      gl.disable(gl.BLEND);
      gl.useProgram(P.p);
      gl.bindVertexArray(this.vao);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.stateTex[this.stateIdx]);
      gl.uniform1i(P.u.uState, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.homeTex);
      gl.uniform1i(P.u.uHome, 1);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, this.flowTex[this.flowIdx]);
      gl.uniform1i(P.u.uFlow, 2);
      gl.uniform2f(P.u.uSize, r.w, r.h);
      gl.uniform2f(P.u.uMouse, this.mouse.x - r.x, this.mouse.y - r.y);
      gl.uniform1f(P.u.uRadius, this.radiusPx());
      gl.uniform1f(P.u.uPresence, Math.max(this.presence, this.burst));
      gl.uniform1f(P.u.uStrength, this.strength() * (1 + this.burst * 1.5));
      gl.uniform1f(P.u.uSpread, clamp(o.spread, 0, 2));
      gl.uniform1f(P.u.uTurb, clamp(o.turbulence, 0, 2) * (o.reducedMotion ? 0.3 : 1));
      gl.uniform1f(P.u.uReturn, clamp(o.returnSpeed, 0, 2));
      gl.uniform1f(P.u.uTime, this.time);
      gl.uniform1f(P.u.uDt, dt);
      gl.uniform1f(P.u.uIntro, intro);
      gl.uniform1f(P.u.uIntroTurb, o.introTurb);
      // las paredes quedan 20 px adentro del lienzo (en px del rectángulo del logo): el material frena antes de llegar al borde
      gl.uniform2f(P.u.uWallMin, 20 - r.x, 20 - r.y);
      gl.uniform2f(P.u.uWallMax, this.cssW - 20 - r.x, this.cssH - 20 - r.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      this.stateIdx = dst;
      this.stateDirty = true;
    }

    draw() {
      if (!this.ready || this.lost || this.destroyed) return;
      const gl = this.gl;
      const o = this.opts;
      const r = this.rect;
      const rm = o.reducedMotion;
      const introVis = rm || !o.intro ? 1 : Math.pow(this.introT, 2.2);
      const base = o.ambient && !rm ? clamp(o.ambientIntensity, 0, 2) : 0;
      const amb = base + this.flowing * 0.85 * clamp(o.liquid, 0, 2) * (rm ? 0.3 : 1);
      const rest = o.restStyle === 'particles' ? 1 : 0;
      const [br, bg, bb] = o.bg;
      const [ir, ig, ib] = this.imgBg;
      const dpr = this.canvas.width / this.cssW;
      const pres = Math.max(this.presence, this.burst);
      const mx = this.mouse.x - r.x;
      const my = this.mouse.y - r.y;

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      gl.bindVertexArray(this.vao);
      gl.disable(gl.BLEND);

      const I = this.pImg;
      gl.useProgram(I.p);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.imgTex);
      gl.uniform1i(I.u.uImg, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.flowTex[this.flowIdx]);
      gl.uniform1i(I.u.uFlow, 1);
      gl.uniform2f(I.u.uRes, this.cssW, this.cssH);
      gl.uniform1f(I.u.uDpr, dpr);
      gl.uniform4f(I.u.uRect, r.x, r.y, r.w, r.h);
      gl.uniform3f(I.u.uBg, br, bg, bb);
      gl.uniform3f(I.u.uImgBg, ir, ig, ib);
      gl.uniform2f(I.u.uMouse, mx, my);
      gl.uniform1f(I.u.uPresence, pres);
      gl.uniform1f(I.u.uRadius, this.radiusPx());
      gl.uniform1f(I.u.uStrength, this.strength());
      gl.uniform1f(I.u.uTime, this.time);
      gl.uniform1f(I.u.uAmbient, amb);
      gl.uniform1f(I.u.uIntroVis, introVis);
      gl.uniform1f(I.u.uRest, rest);
      gl.uniform1f(I.u.uAlphaMode, this.alphaMode ? 1 : 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // en reposo, con la imagen nítida, las partículas no se ven: no se dibujan
      if (!this.n || (!this.stateDirty && rest === 0 && introVis >= 1)) return;

      const P = this.pPart;
      gl.useProgram(P.p);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.stateTex[this.stateIdx]);
      gl.uniform1i(P.u.uState, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.homeTex);
      gl.uniform1i(P.u.uHome, 1);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, this.colTex);
      gl.uniform1i(P.u.uCol, 2);
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, this.flowTex[this.flowIdx]);
      gl.uniform1i(P.u.uFlow, 3);
      gl.uniform1i(P.u.uTexW, TEX_W);
      gl.uniform4f(P.u.uRect, r.x, r.y, r.w, r.h);
      gl.uniform2f(P.u.uRes, this.cssW, this.cssH);
      gl.uniform2f(P.u.uMouse, mx, my);
      gl.uniform1f(P.u.uRadius, this.radiusPx());
      gl.uniform1f(P.u.uPresence, pres);
      const spacing = r.w / this.gridW;
      gl.uniform1f(P.u.uDot, spacing * 1.45 * clamp(o.dotSize, 0.2, 3));
      gl.uniform1f(P.u.uTime, this.time);
      gl.uniform1f(P.u.uAmbient, amb);
      gl.uniform1f(P.u.uStreak, (o.streaks ? 1 : 0) * (0.45 + 0.55 * introVis));
      gl.uniform1f(P.u.uIntroVis, introVis);
      gl.uniform1f(P.u.uRest, rest);
      gl.uniform1f(P.u.uDpr, dpr);
      if (this.alphaMode) gl.uniform3f(P.u.uTint, 1, 1, 1);
      else gl.uniform3f(P.u.uTint, br / Math.max(ir, 0.001), bg / Math.max(ig, 0.001), bb / Math.max(ib, 0.001));
      gl.activeTexture(gl.TEXTURE4);
      gl.bindTexture(gl.TEXTURE_2D, this.colFromTex || this.colTex);
      gl.uniform1i(P.u.uColFrom, 4);
      gl.uniform1f(P.u.uColMix, this.colFromTex ? this.mezcla * this.mezcla * (3 - 2 * this.mezcla) : 1);
      gl.uniform3f(P.u.uEstela, ...o.estela);
      gl.uniform3f(P.u.uBrillo, ...o.brillo);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.n);
      gl.disable(gl.BLEND);
    }

    destroy() {
      this.destroyed = true;
      this.stop();
      cancelAnimationFrame(this.pensandoRaf);
      this.canvas.removeEventListener('webglcontextlost', this.onLost);
      const gl = this.gl;
      if (!this.lost) {
        gl.deleteBuffer(this.quad);
        gl.deleteVertexArray(this.vao);
        for (const t of [...this.flowTex, ...this.stateTex, this.imgTex, this.homeTex, this.colTex, this.colFromTex]) if (t) gl.deleteTexture(t);
        for (const f of [...this.flowFb, ...this.stateFb]) gl.deleteFramebuffer(f);
        for (const p of [this.pFlow, this.pSim, this.pPart, this.pImg, this.pRehome]) if (p) gl.deleteProgram(p.p);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
    }
  }

  /* ── El logo líquido en la página ── */

  // Ajustes del efecto para el logo (los nombres son los del original).
  const OPCIONES = {
    interactive: true, strength: 1, radius: 0.28, density: 1, dotSize: 1.25, spread: 1, turbulence: 1,
    returnSpeed: 1, streaks: true, restStyle: 'image', ambient: false, ambientIntensity: 0, speed: 1, intro: true,
    reducedMotion: false, liquid: 1,
    // NFG: remolino del armado inicial (1,5 en el original, fijo en el shader). Con 1,5 las partículas se salían del
    // lienzo y quedaban cortadas.
    introTurb: 0.4,
    // bg e imgBg (el color de fondo de la sección) se ponen al montar: el logo se pasa a píxeles sobre ese color
    estela: rgb('#1daa9f'), brillo: rgb('#62e4da'), // --turquesa y --turquesa-claro
  };
  // Cuánto se deshace el logo (ms) antes de acomodarse en el nuevo, en la metamorfosis.
  const DERRETIR_MS = 700;
  // Aire alrededor del logo, en fracción de su ancho: el lente y las orillas del efecto no lo recortan.
  const MARGEN = 0.08;

  // El color de fondo de verdad de un elemento: el del primer ancestro con fondo opaco, como [r, g, b] de 0 a 255.
  function fondoDe(el) {
    for (let e = el; e; e = e.parentElement) {
      const m = getComputedStyle(e).backgroundColor.match(/[\d.]+/g);
      if (m && (m.length < 4 || +m[3] > 0.99)) return m.slice(0, 3).map(Number);
    }
    return [255, 255, 255];
  }

  // El logo en píxeles, sobre «fondo» y con su margen. «ancho» × «alto» es el lugar del logo en pantalla (el <img>): el logo
  // se acomoda adentro, entero, sea cual sea su proporción (en la metamorfosis llegan logos cuadrados y alargados al
  // mismo lugar), y queda donde diga «alinear» ([x, y] de 0 a 1: [0, .5] a la izquierda, [.5, .5] centrado; el object-position
  // del <img>, para que el respaldo y el lienzo muestren lo mismo). Un SVG se dibuja con sus trazados (Path2D) y no pasando el <img> al lienzo: Safari puede
  // marcar como «contaminado» un lienzo con un SVG dibujado, y entonces no deja leer sus píxeles. El SVG tiene que ser solo
  // <path> (con fill, fill-opacity, fill-rule, stroke y transform: como los que hace herramientas/construir-logos.mjs o
  // los que salen de un PDF). Una imagen (WebP o PNG, con fondo transparente) se dibuja directo: del mismo sitio no
  // contamina el lienzo. Sobre el mismo color que la página, las orillas suavizadas del logo se ven bien: no se oscurecen.
  async function rasterizar(src, ancho, alto, fondo, alinear) {
    const escala = Math.min(Math.min(window.devicePixelRatio || 1, 2) * 1.5, 1400 / (ancho * (1 + 2 * MARGEN)));
    const m = ancho * MARGEN;
    const c = document.createElement('canvas');
    c.width = Math.round((ancho + 2 * m) * escala);
    c.height = Math.round((alto + 2 * m) * escala);
    const ctx = c.getContext('2d');
    ctx.fillStyle = `rgb(${fondo.join(',')})`;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.scale(escala, escala);
    ctx.translate(m, m);
    if (/\.svg(\?|#|$)/i.test(src)) await trazarSVG(ctx, src, ancho, alto, alinear);
    else await dibujarImagen(ctx, src, ancho, alto, alinear);
    return c;
  }
  async function trazarSVG(ctx, src, ancho, alto, [ax, ay]) {
    const r = await fetch(src);
    if (!r.ok) throw new Error(`${src}: ${r.status}`);
    const svg = new DOMParser().parseFromString(await r.text(), 'image/svg+xml');
    const [vx, vy, vw, vh] = svg.documentElement.getAttribute('viewBox').split(/[\s,]+/).map(Number);
    const k = Math.min(ancho / vw, alto / vh);
    ctx.translate((ancho - vw * k) * ax, (alto - vh * k) * ay);
    ctx.scale(k, k);
    ctx.translate(-vx, -vy);
    const num = (trazo, atributo, defecto) => (trazo.hasAttribute(atributo) ? Number(trazo.getAttribute(atributo)) : defecto);
    for (const trazo of svg.querySelectorAll('path')) {
      ctx.save();
      if (trazo.hasAttribute('transform')) { const q = new DOMMatrix(trazo.getAttribute('transform')); ctx.transform(q.a, q.b, q.c, q.d, q.e, q.f); }
      const forma = new Path2D(trazo.getAttribute('d'));
      const relleno = trazo.getAttribute('fill');
      if (relleno !== 'none') {
        ctx.globalAlpha = num(trazo, 'fill-opacity', 1);
        ctx.fillStyle = relleno || '#000';
        ctx.fill(forma, trazo.getAttribute('fill-rule') === 'evenodd' ? 'evenodd' : 'nonzero');
      }
      const linea = trazo.getAttribute('stroke');
      if (linea && linea !== 'none') {
        ctx.globalAlpha = num(trazo, 'stroke-opacity', 1);
        ctx.strokeStyle = linea;
        ctx.lineWidth = num(trazo, 'stroke-width', 1);
        ctx.lineCap = trazo.getAttribute('stroke-linecap') || 'butt';
        ctx.lineJoin = trazo.getAttribute('stroke-linejoin') || 'miter';
        ctx.miterLimit = num(trazo, 'stroke-miterlimit', 4);
        ctx.stroke(forma);
      }
      ctx.restore();
    }
  }
  async function dibujarImagen(ctx, src, ancho, alto, [ax, ay]) {
    const im = new Image();
    im.src = src;
    await im.decode();
    const k = Math.min(ancho / im.naturalWidth, alto / im.naturalHeight);
    const w = im.naturalWidth * k, h = im.naturalHeight * k;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(im, (ancho - w) * ax, (alto - h) * ay, w, h);
  }
  // Espera a que el <img> de respaldo cargue: su tamaño en pantalla es el del logo.
  const cargada = (im) => (im.complete ? (im.naturalWidth ? Promise.resolve() : Promise.reject(new Error('logo')))
    : new Promise((ok, mal) => { im.addEventListener('load', ok, { once: true }); im.addEventListener('error', mal, { once: true }); }));

  // Pone el logo líquido en «caja» (recibe el cursor y es el lienzo, que la cubre entera: conviene que sea más ancha
  // que el logo para que el efecto tenga aire). «img» es el logo de respaldo, hijo de «caja»: el CSS decide su tamaño
  // y su lugar, y el motor dibuja el logo justo ahí. «caja» recibe data-liquido="on" cuando el lienzo ya pinta, y
  // data-tocado cuando alguien pasa el cursor. El motor arranca cuando la caja se ve (así el armado inicial no pasa
  // sin que nadie lo vea) y se detiene fuera de pantalla.
  // Devuelve { medir, pensar, cambiar, destruir }, o null si no hay WebGL2 o se pidió reducir movimiento: queda el <img>.
  // cambiar(src) es la metamorfosis: el logo se deshace y el material se acomoda en el de «src»; el <img> toma ese src de
  // una vez, para que quede el logo nuevo si no hay lienzo o deja de haberlo.
  function montar(caja, img) {
    if (reducir.matches || !window.WebGL2RenderingContext) return null;
    const capa = caja;
    const fondo = fondoDe(caja);
    const opciones = { ...OPCIONES, bg: fondo.map((v) => v / 255), imgBg: fondo.map((v) => v / 255) };
    const lienzo = document.createElement('canvas');
    lienzo.className = 'liquido';
    lienzo.setAttribute('aria-hidden', 'true');
    capa.append(lienzo);
    caja.style.touchAction = 'pan-y'; // con el dedo, lo horizontal mueve el material y lo vertical sigue bajando la página
    let motor = null, vivo = true, visible = false, empezado = false;
    let deseado = null, turno = 0; // el logo que se pidió con cambiar() y el número del último pedido
    let vista = false, pendiente = null; // se ve al menos el 40 % del lugar del logo; un cambio que espera a que se vea

    function medidas() {
      const c = lienzo.getBoundingClientRect(), i = img.getBoundingClientRect(); // el lienzo puede salirse de la caja (el CSS decide)
      const m = i.width * MARGEN;
      return { ancho: lienzo.clientWidth, alto: lienzo.clientHeight, logo: i,
        rect: { x: i.left - c.left - m, y: i.top - c.top - m, w: i.width + 2 * m, h: i.height + 2 * m } };
    }
    // Dónde queda el logo dentro de su lugar, según el CSS del <img> (object-position): a la izquierda en la computadora y
    // centrado en el celular.
    function alineacion() {
      const eje = (v) => ({ left: 0, top: 0, center: 0.5, right: 1, bottom: 1 }[v] ?? parseFloat(v) / 100); // Safari puede dar palabras
      const [x, y] = getComputedStyle(img).objectPosition.split(' ').map(eje);
      return [Number.isFinite(x) ? x : 0.5, Number.isFinite(y) ? y : 0.5];
    }
    function medir() {
      if (!motor) return;
      const m = medidas();
      motor.resize(m.ancho, m.alto, m.rect);
    }
    async function empezar() {
      empezado = true;
      try {
        await cargada(img);
        const m = medidas();
        const origen = deseado || img.currentSrc || img.src;
        const fuente = await rasterizar(origen, m.logo.width, m.logo.height, fondo, alineacion());
        if (!vivo) return;
        motor = new LiquidEngine(lienzo, opciones, destruir);
        motor.onFirstFrame = () => { if (vivo) capa.dataset.liquido = 'on'; };
        motor.resize(m.ancho, m.alto, m.rect);
        motor.setImage(fuente);
        motor.setVisible(visible);
        if (deseado && deseado !== origen) cambiar(deseado); // pidieron otro logo mientras se preparaba este
      } catch {
        destruir(); // sin WebGL2 completo o sin poder leer el logo: queda el <img>
      }
    }

    const punto = (e) => { const c = lienzo.getBoundingClientRect(); return [e.clientX - c.left, e.clientY - c.top]; };
    const al = (tipo) => (e) => {
      if (!motor) return;
      if (tipo === 'move' || tipo === 'down') capa.dataset.tocado = '';
      motor.pointer(tipo, ...punto(e), e.pointerType === 'touch');
    };
    const eventos = { pointermove: al('move'), pointerdown: al('down'), pointerup: al('up'), pointercancel: al('up'), pointerleave: al('leave') };
    for (const [nombre, f] of Object.entries(eventos)) caja.addEventListener(nombre, f);

    const ro = new ResizeObserver(medir);
    ro.observe(caja);
    ro.observe(img);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      vista = e.intersectionRatio >= 0.4;
      if (visible && !empezado && vista) empezar();
      motor?.setVisible(visible);
      if (vista && pendiente && motor) { const p = pendiente; pendiente = null; cambiar(p); } // el cambio espera a que se vea
    }, { threshold: [0, 0.4] });
    io.observe(caja);

    // La metamorfosis. El material se deshace unos instantes (derretir) mientras se prepara el logo nuevo, y entonces se acomoda
    // en él (transformar). Si piden otro antes de terminar, gana el último. Como el armado inicial, no pasa sin que nadie la
    // vea: si el lugar del logo no se ve (en el celular, quien toca una opción suele tener el formulario a la vista y el logo
    // arriba), el cambio espera a que se vea el 40 %; y si la persona se aleja a mitad, el logo nuevo queda puesto de una vez.
    const pausa = (ms) => new Promise((ok) => setTimeout(ok, ms));
    async function cambiar(src) {
      deseado = src;
      const mio = ++turno;
      img.src = src;
      if (!motor) return;
      if (!vista) { pendiente = src; return; } // el cambio no pasa sin que nadie lo vea: espera a que el logo se vea
      pendiente = null;
      motor.derretir();
      try {
        const m = medidas();
        const [fuente] = await Promise.all([rasterizar(src, m.logo.width, m.logo.height, fondo, alineacion()), pausa(DERRETIR_MS)]);
        if (!vivo || mio !== turno) return;
        if (!motor.transformar(fuente, !visible)) destruir(); // queda el <img> con el logo nuevo
      } catch {
        destruir(); // queda el <img> con el logo nuevo
      }
    }

    function destruir() {
      if (!vivo) return;
      vivo = false;
      pendiente = null;
      io.disconnect();
      ro.disconnect();
      for (const [nombre, f] of Object.entries(eventos)) caja.removeEventListener(nombre, f);
      caja.style.touchAction = '';
      motor?.destroy();
      motor = null;
      lienzo.remove();
      delete capa.dataset.liquido;
      delete capa.dataset.tocado;
    }
    // Lo revuelve solo, como si pensara (al elegir una opción del recomendador).
    function pensar(ms) {
      if (!motor) return;
      capa.dataset.tocado = '';
      motor.pensar(ms);
    }
    return { medir, pensar, cambiar, destruir };
  }

  window.NFG_LIQUIDO = { montar };
})();
