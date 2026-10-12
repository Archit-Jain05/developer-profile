import { useEffect, useRef } from "react";

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

const vec3 BURGUNDY = vec3(0.4275, 0.0, 0.1020);

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

  vec2 q = vec2(fbm(p * 1.3 + vec2(0.0, t)), fbm(p * 1.3 + vec2(5.2, -t)));
  vec2 r = vec2(fbm(p * 1.5 + 3.0 * q + vec2(1.7, 9.2) + t * 1.4), fbm(p * 1.5 + 3.0 * q + vec2(8.3, 2.8) - t));
  float f = fbm(p * 1.1 + 2.6 * r);

  vec2 m = vec2(uPointer.x * aspect, uPointer.y);
  float pull = exp(-dot(p - m, p - m) * 3.0) * uPresence;

  float mass = smoothstep(0.32, 0.92, f + 0.42 * uv.y + 0.38 * pull - 0.12);
  vec3 colour = BURGUNDY * mass;
  float wisp = smoothstep(0.74, 0.98, f + 0.25 * pull) * mass;
  colour += vec3(1.0) * wisp * 0.16;

  float vignette = smoothstep(1.35, 0.25, length((uv - vec2(0.5, 0.82)) * vec2(1.0, 1.25)));
  colour *= vignette;
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

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
      pointer.presence += (pointer.target - pointer.presence) * 0.03;
      gl.uniform1f(uTime, calm ? 12 : time / 1000);
      gl.uniform2f(uPointer, pointer.x, pointer.y);
      gl.uniform1f(uPresence, pointer.presence);
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
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
