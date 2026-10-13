import { useEffect, useRef } from "react";
import { getTheme, subscribeTheme } from "../../hooks/useTheme.js";

const VERTEX = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

/*
 * A slow, smoky light: two layers of warped noise feeding each other (domain
 * warping), lit brightest near the top of the hero and pulled toward the
 * pointer. Its colour never goes past the brand burgundy; the brightest wisps
 * pick up a little white, the way the name's gradient does.
 */
const FRAGMENT = `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform float uPresence;
uniform float uDay;
uniform sampler2D uField;
uniform vec3 uGround;

const vec3 BURGUNDY = vec3(0.4275, 0.0, 0.1020);
const vec3 DEEP_BLUE = vec3(0.03, 0.06, 0.25);

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  float t = uTime * 0.035;

  // The pointer repels the smoke the way it repels dots: a grid of springy
  // points (simulated in JS) is pushed away from the pointer, overshoots a
  // little and settles back; the smoke is shifted by that displacement.
  vec2 off = (texture2D(uField, uv).rg - 0.5) * 0.5;
  vec2 w = p - off * vec2(1.0, 1.0);

  vec2 q = vec2(fbm(w * 1.3 + vec2(0.0, t)), fbm(w * 1.3 + vec2(5.2, -t)));
  vec2 r = vec2(fbm(w * 1.5 + 3.0 * q + vec2(1.7, 9.2) + t * 1.4), fbm(w * 1.5 + 3.0 * q + vec2(8.3, 2.8) - t));
  float f = fbm(w * 1.1 + 2.6 * r);

  float mass = smoothstep(0.32, 0.92, f + 0.42 * uv.y - 0.12);
  float wisp = smoothstep(0.74, 0.98, f) * mass;
  float vignette = smoothstep(1.35, 0.25, length((uv - vec2(0.5, 0.82)) * vec2(1.0, 1.25)));

  // Night: burgundy light on black, with faint white wisps.
  vec3 night = (BURGUNDY * mass + vec3(1.0) * wisp * 0.16) * vignette;
  // Day: the same smoke as dark blue ink drifting through white.
  vec3 day = mix(uGround, DEEP_BLUE, min(1.0, mass * 0.95 + wisp * 0.1) * vignette);
  vec3 colour = mix(night, day, uDay);
  colour += (hash(gl_FragCoord.xy + uTime) - 0.5) / 160.0;

  gl_FragColor = vec4(colour, 1.0);
}
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "shader");
  return shader;
}

/**
 * The hero's moving light, drawn with a single fragment shader on a plain
 * WebGL canvas, so it appears with the page instead of waiting for the 3D
 * library. It renders at half resolution (it is soft anyway), pauses when off
 * screen, and holds one still frame for anyone who asks for reduced motion.
 */
export default function FluidLight({ className }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return;

    let program;
    try {
      program = gl.createProgram();
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "link");
    } catch (error) {
      console.warn("[hero] light shader failed:", error.message);
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, "uResolution");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uPointer = gl.getUniformLocation(program, "uPointer");
    const uPresence = gl.getUniformLocation(program, "uPresence");
    const uDay = gl.getUniformLocation(program, "uDay");
    const uField = gl.getUniformLocation(program, "uField");
    const uGround = gl.getUniformLocation(program, "uGround");
    // The page colour (a 6-digit hex token), so the light's ground meets the page.
    const readGround = () => {
      const hex = getComputedStyle(document.documentElement).getPropertyValue("--base").trim();
      return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    };
    let ground = readGround();

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // The springy grid: offsets and velocities in height units, one per point.
    const GW = 40;
    const GH = 24;
    const off = new Float32Array(GW * GH * 2);
    const vel = new Float32Array(GW * GH * 2);
    const bytes = new Uint8Array(GW * GH * 4);
    const mouse = { x: 0.5, y: 0.7 };
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    gl.uniform1i(uField, 0);
    const RADIUS = 0.3; // how far from the pointer smoke is pushed (screen heights)
    const STRENGTH = 0.006;
    const SPRING = 0.03;
    const DAMPING = 0.1;
    const stepField = (aspect) => {
      mouse.x += (pointer.tx - mouse.x) * 0.14;
      mouse.y += (pointer.ty - mouse.y) * 0.14;
      for (let j = 0; j < GH; j++) {
        for (let i = 0; i < GW; i++) {
          const n = (j * GW + i) * 2;
          const rx = (i / (GW - 1)) * aspect;
          const ry = j / (GH - 1);
          const dx = rx - mouse.x * aspect;
          const dy = ry - mouse.y;
          const dist = Math.hypot(dx, dy) + 1e-4;
          if (dist < RADIUS) {
            const force = (1 - dist / RADIUS) ** 2 * STRENGTH * pointer.presence;
            vel[n] += (dx / dist) * force;
            vel[n + 1] += (dy / dist) * force;
          }
          vel[n] += -off[n] * SPRING;
          vel[n + 1] += -off[n + 1] * SPRING;
          vel[n] *= 1 - DAMPING;
          vel[n + 1] *= 1 - DAMPING;
          off[n] += vel[n];
          off[n + 1] += vel[n + 1];
          const m = (j * GW + i) * 4;
          bytes[m] = Math.max(0, Math.min(255, 127.5 + (off[n] / 0.5) * 255));
          bytes[m + 1] = Math.max(0, Math.min(255, 127.5 + (off[n + 1] / 0.5) * 255));
          bytes[m + 3] = 255;
        }
      }
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, GW, GH, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
    };
    const pointer = { x: 0.5, y: 0.7, tx: 0.5, ty: 0.7, presence: 0, target: 0 };

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.5;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
    };

    const draw = (time) => {
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      if (!calm) stepField(canvas.width / canvas.height);
      pointer.presence += (pointer.target - pointer.presence) * 0.03;
      gl.uniform1f(uTime, calm ? 12 : time / 1000);
      gl.uniform2f(uPointer, pointer.x, pointer.y);
      gl.uniform1f(uPresence, pointer.presence);
      gl.uniform1f(uDay, getTheme() === "light" ? 1 : 0);
      gl.uniform3f(uGround, ground[0], ground[1], ground[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    let frame = 0;
    let visible = true;
    const loop = (time) => {
      draw(time);
      frame = visible ? requestAnimationFrame(loop) : 0;
    };

    const onMove = (e) => {
      const box = canvas.getBoundingClientRect();
      pointer.tx = (e.clientX - box.left) / box.width;
      pointer.ty = 1 - (e.clientY - box.top) / box.height;
      pointer.target = 1;
    };
    const onLeave = () => {
      pointer.target = 0;
    };

    resize();
    const resizer = new ResizeObserver(() => {
      resize();
      if (calm) draw(0);
    });
    resizer.observe(canvas);
    // The moving light redraws every frame anyway; the still one needs telling.
    const stopTheme = subscribeTheme(() => {
      ground = readGround();
      if (calm) draw(0);
    });

    let observer;
    if (calm) {
      draw(0);
    } else {
      observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !frame) frame = requestAnimationFrame(loop);
      });
      observer.observe(canvas);
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      resizer.disconnect();
      stopTheme();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
