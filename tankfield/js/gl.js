/* Batched WebGL2 world renderer. Grid, polygons, barrels, and walls go out
   in a handful of draw calls, the same split arras/diep use between the
   GPU world and a 2D text overlay. */
(() => {
  "use strict";

  const STRIDE = 16;
  const MAX = 24576;
  const quad = new Float32Array([
    -1, -1, 1, -1, -1, 1,
    -1, 1, 1, -1, 1, 1,
  ]);

  const VERT = `#version 300 es
layout(location=0) in vec2 aCorner;
layout(location=1) in vec4 i0;
layout(location=2) in vec4 i1;
layout(location=3) in vec4 iFill;
layout(location=4) in vec4 iStroke;
uniform vec2 uCam;
uniform vec2 uView;
uniform float uZoom;
uniform vec2 uShake;
out vec2 vLocal;
flat out float vType;
flat out vec4 vFill;
flat out vec4 vStroke;
flat out vec4 vP;
void main() {
  float type = i0.x;
  vec2 world;
  vec2 local;
  if (type < 0.5) {
    float ext = i0.w + i1.w + 2.0;
    local = aCorner * ext;
    float rot = i1.x;
    float c = cos(rot);
    float s = sin(rot);
    world = i0.yz + vec2(c * local.x - s * local.y, s * local.x + c * local.y);
    vP = vec4(i0.w, 0.0, i1.y, i1.w);
  } else if (type < 1.5) {
    float len = i1.x;
    float w0 = i1.y;
    float w1 = i1.z;
    float sw = i1.w;
    float pad = sw + 2.0;
    float halfW = max(max(w0, w1), 1.0) + pad;
    local = vec2(mix(-pad, len + pad, aCorner.x * 0.5 + 0.5), aCorner.y * halfW);
    float ang = i0.w;
    float c = cos(ang);
    float s = sin(ang);
    world = i0.yz + vec2(c * local.x - s * local.y, s * local.x + c * local.y);
    vP = vec4(len, w0, w1, sw);
  } else {
    local = aCorner;
    world = i0.yz + vec2((aCorner.x * 0.5 + 0.5) * i0.w, (aCorner.y * 0.5 + 0.5) * i1.x);
    vP = vec4(0.0);
  }
  vec2 css = (world - uCam) * uZoom + uView * 0.5 + uShake;
  gl_Position = vec4(css.x / uView.x * 2.0 - 1.0, 1.0 - css.y / uView.y * 2.0, 0.0, 1.0);
  vLocal = local;
  vType = type;
  vFill = iFill;
  vStroke = iStroke;
}`;

  const FRAG = `#version 300 es
precision highp float;
in vec2 vLocal;
flat in float vType;
flat in vec4 vFill;
flat in vec4 vStroke;
flat in vec4 vP;
out vec4 o;
float sdCircle(vec2 p, float r) { return length(p) - r; }
float sdRegular(vec2 p, float n, float r) {
  if (dot(p, p) < 1e-6) return -r;
  p.y = -p.y;
  float an = 3.141592653589793 / n;
  vec2 acs = vec2(cos(an), sin(an));
  float bn = mod(atan(p.x, p.y), 2.0 * an) - an;
  p = length(p) * vec2(cos(bn), abs(sin(bn)));
  p -= r * acs;
  p.y += clamp(-p.y, 0.0, r * acs.y);
  return length(p) * sign(p.x);
}
float sdTrap(vec2 p, float len, float w0, float w1) {
  vec2 a = vec2(0.0, -w0);
  vec2 b = vec2(len, -w1);
  vec2 c = vec2(len, w1);
  vec2 d = vec2(0.0, w0);
  vec2 e0 = b - a, e1 = c - b, e2 = d - c, e3 = a - d;
  vec2 v0 = p - a, v1 = p - b, v2 = p - c, v3 = p - d;
  vec2 pq0 = v0 - e0 * clamp(dot(v0, e0) / max(dot(e0, e0), 1e-5), 0.0, 1.0);
  vec2 pq1 = v1 - e1 * clamp(dot(v1, e1) / max(dot(e1, e1), 1e-5), 0.0, 1.0);
  vec2 pq2 = v2 - e2 * clamp(dot(v2, e2) / max(dot(e2, e2), 1e-5), 0.0, 1.0);
  vec2 pq3 = v3 - e3 * clamp(dot(v3, e3) / max(dot(e3, e3), 1e-5), 0.0, 1.0);
  float dist = sqrt(min(min(dot(pq0, pq0), dot(pq1, pq1)), min(dot(pq2, pq2), dot(pq3, pq3))));
  float s0 = v0.x * e0.y - v0.y * e0.x;
  float s1 = v1.x * e1.y - v1.y * e1.x;
  float s2 = v2.x * e2.y - v2.y * e2.x;
  float s3 = v3.x * e3.y - v3.y * e3.x;
  float inside = ((s0 <= 0.0 && s1 <= 0.0 && s2 <= 0.0 && s3 <= 0.0) || (s0 >= 0.0 && s1 >= 0.0 && s2 >= 0.0 && s3 >= 0.0)) ? -1.0 : 1.0;
  return dist * inside;
}
void main() {
  if (vType > 1.5) { o = vFill; return; }
  float sw = max(vP.w, 0.0);
  float d = vType < 0.5
    ? (vP.z < 2.5 ? sdCircle(vLocal, vP.x) : sdRegular(vLocal, vP.z, vP.x))
    : sdTrap(vLocal, vP.x, vP.y, vP.z);
  float aa = max(fwidth(d) * 0.85, 0.35);
  float band = sw * 0.5;
  if (d > band + aa) discard;
  float fillM = 1.0 - smoothstep(-aa, aa, d);
  float strokeM = sw > 0.04 ? (1.0 - smoothstep(band - aa, band + aa, abs(d))) : 0.0;
  float strokeK = clamp(strokeM, 0.0, 1.0);
  vec3 col = mix(vFill.rgb, vStroke.rgb, strokeK);
  float alpha = max(fillM * vFill.a, strokeM * vStroke.a);
  if (alpha < 0.012) discard;
  o = vec4(col, alpha);
}`;

  const GRID_VERT = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

  const GRID_FRAG = `#version 300 es
precision highp float;
uniform vec2 uCam;
uniform vec2 uView;
uniform vec2 uPixels;
uniform float uZoom;
uniform vec2 uShake;
uniform vec3 uBg;
uniform vec3 uGrid;
uniform float uStep;
uniform vec4 uStorm;
uniform vec4 uStormCol;
out vec4 o;
void main() {
  vec2 css = vec2(gl_FragCoord.x / uPixels.x * uView.x, uView.y - gl_FragCoord.y / uPixels.y * uView.y);
  vec2 world = (css - uView * 0.5 - uShake) / max(uZoom, 0.0001) + uCam;
  vec3 col = uBg;
  vec2 cell = world / uStep;
  vec2 g = abs(fract(cell - 0.5) - 0.5);
  vec2 fw = fwidth(cell);
  float line = max(
    1.0 - smoothstep(fw.x * 0.2, fw.x * 1.15, g.x),
    1.0 - smoothstep(fw.y * 0.2, fw.y * 1.15, g.y)
  );
  col = mix(col, uGrid, clamp(line, 0.0, 1.0));
  if (uStorm.w > 0.5 && length(world - uStorm.xy) > uStorm.z) col = mix(col, uStormCol.rgb, uStormCol.a);
  o = vec4(col, 1.0);
}`;

  let gl = null;
  let prog = null;
  let gridProg = null;
  let vao = null;
  let gridVao = null;
  let buf = null;
  let data = null;
  let count = 0;
  let viewW = 1;
  let viewH = 1;
  let dpr = 1;
  const loc = {};
  const gridLoc = {};

  function compile(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function link(vsSrc, fsSrc) {
    const vs = compile(gl.VERTEX_SHADER, vsSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(p));
      gl.deleteProgram(p);
      return null;
    }
    return p;
  }

  function attach(canvas) {
    gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      desynchronized: true,
      powerPreference: "high-performance",
    });
    if (!gl) return false;
    prog = link(VERT, FRAG);
    gridProg = link(GRID_VERT, GRID_FRAG);
    if (!prog || !gridProg) {
      gl = null;
      return false;
    }
    data = new Float32Array(MAX * STRIDE);
    buf = gl.createBuffer();
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.DYNAMIC_DRAW);
    const strideBytes = STRIDE * 4;
    for (let i = 0; i < 4; i++) {
      const locI = 1 + i;
      gl.enableVertexAttribArray(locI);
      gl.vertexAttribPointer(locI, 4, gl.FLOAT, false, strideBytes, i * 16);
      gl.vertexAttribDivisor(locI, 1);
    }
    gl.bindVertexArray(null);
    gridVao = gl.createVertexArray();
    for (const name of ["uCam", "uView", "uZoom", "uShake"]) loc[name] = gl.getUniformLocation(prog, name);
    for (const name of ["uCam", "uView", "uPixels", "uZoom", "uShake", "uBg", "uGrid", "uStep", "uStorm", "uStormCol"]) {
      gridLoc[name] = gl.getUniformLocation(gridProg, name);
    }
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    return true;
  }

  function resize(w, h, ratio) {
    viewW = Math.max(1, w);
    viewH = Math.max(1, h);
    dpr = ratio || 1;
    if (!gl) return;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  }

  function ensure(n) {
    if (count + n <= MAX) return;
    flush();
  }

  function push(values) {
    ensure(1);
    data.set(values, count * STRIDE);
    count += 1;
  }

  function shape(x, y, r, rot, sides, fill, stroke, sw, fillA, strokeA) {
    if (!(r > 0)) return;
    push([
      0, x, y, r,
      rot || 0, sides || 0, 0, sw || 0,
      fill[0], fill[1], fill[2], fillA == null ? 1 : fillA,
      stroke ? stroke[0] : 0, stroke ? stroke[1] : 0, stroke ? stroke[2] : 0, strokeA == null ? (sw > 0 ? fillA == null ? 1 : fillA : 0) : strokeA,
    ]);
  }

  function trap(x, y, ang, len, w0, w1, fill, stroke, sw, alpha) {
    if (!(len > 0)) return;
    const a = alpha == null ? 1 : alpha;
    push([
      1, x, y, ang || 0,
      len, w0, w1, sw || 0,
      fill[0], fill[1], fill[2], a,
      stroke[0], stroke[1], stroke[2], sw > 0 ? a : 0,
    ]);
  }

  function rect(x, y, w, h, fill, alpha) {
    if (!(w > 0) || !(h > 0)) return;
    const a = alpha == null ? 1 : alpha;
    push([
      2, x, y, w,
      h, 0, 0, 0,
      fill[0], fill[1], fill[2], a,
      0, 0, 0, 0,
    ]);
  }

  function flush() {
    if (!gl || !count) return;
    gl.useProgram(prog);
    gl.uniform2f(loc.uCam, camX, camY);
    gl.uniform2f(loc.uView, viewW, viewH);
    gl.uniform1f(loc.uZoom, zoom);
    gl.uniform2f(loc.uShake, shakeX, shakeY);
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data.subarray(0, count * STRIDE));
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, count);
    gl.bindVertexArray(null);
    count = 0;
  }

  let camX = 0;
  let camY = 0;
  let zoom = 1;
  let shakeX = 0;
  let shakeY = 0;

  function begin(opts) {
    camX = opts.camX;
    camY = opts.camY;
    zoom = opts.zoom || 1;
    shakeX = opts.shakeX || 0;
    shakeY = opts.shakeY || 0;
    count = 0;
    if (!gl) return;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.disable(gl.BLEND);
    gl.useProgram(gridProg);
    gl.bindVertexArray(gridVao);
    gl.uniform2f(gridLoc.uCam, camX, camY);
    gl.uniform2f(gridLoc.uView, viewW, viewH);
    gl.uniform2f(gridLoc.uPixels, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform1f(gridLoc.uZoom, zoom);
    gl.uniform2f(gridLoc.uShake, shakeX, shakeY);
    gl.uniform3fv(gridLoc.uBg, opts.bg);
    gl.uniform3fv(gridLoc.uGrid, opts.grid);
    gl.uniform1f(gridLoc.uStep, opts.gridStep || 24);
    gl.uniform4fv(gridLoc.uStorm, opts.storm || [0, 0, -1, 0]);
    gl.uniform4fv(gridLoc.uStormCol, opts.stormCol || [0.82, 0.25, 0.16, 0.2]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
    gl.enable(gl.BLEND);
  }

  function paintEmpty(r, g, b) {
    if (!gl) return;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.disable(gl.BLEND);
    gl.clearColor(r, g, b, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  window.TankfieldGL = { attach, resize, begin, shape, trap, rect, flush, paintEmpty };
})();
