import { useEffect, useRef } from 'react';
import { Mesh, Program, Renderer, Triangle } from 'ogl';
import './LightRays.css';

type RaysOrigin =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'left'
  | 'right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

interface LightRaysProps {
  raysOrigin?: RaysOrigin;
  raysSpeed?: number;
  lightSpread?: number;
  rayLength?: number;
  followMouse?: boolean;
  mouseInfluence?: number;
  noiseAmount?: number;
  distortion?: number;
  className?: string;
  pulsating?: boolean;
  fadeDistance?: number;
  saturation?: number;
}

const vertex = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragment = `
precision highp float;

uniform float iTime;
uniform vec2 iResolution;
uniform vec2 rayPos;
uniform vec2 rayDir;
uniform vec3 raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2 mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float rayStrength(
  vec2 raySource,
  vec2 rayRefDirection,
  vec2 coord,
  float seedA,
  float seedB,
  float speed
) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);
  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));
  float distanceFromSource = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distanceFromSource) / maxDistance, 0.0, 1.0);
  float fadeRange = max(iResolution.x * fadeDistance, 0.001);
  float fadeFalloff = clamp((fadeRange - distanceFromSource) / fadeRange, 0.5, 1.0);
  float pulse = pulsating > 0.5 ? 0.8 + 0.2 * sin(iTime * speed * 3.0) : 1.0;
  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0,
    1.0
  );
  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void main() {
  vec2 coord = vec2(gl_FragCoord.x, iResolution.y - gl_FragCoord.y);
  vec2 finalRayDir = rayDir;

  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349, 1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234, 1.1 * raysSpeed);
  vec4 color = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    color.rgb *= 1.0 - noiseAmount + noiseAmount * n;
  }

  float brightness = 1.0 - coord.y / iResolution.y;
  color.x *= 0.1 + brightness * 0.8;
  color.y *= 0.3 + brightness * 0.6;
  color.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    color.rgb = mix(vec3(gray), color.rgb, saturation);
  }

  color.rgb *= raysColor;
  gl_FragColor = color;
}`;

const getAnchorAndDirection = (origin: RaysOrigin, width: number, height: number) => {
  const outside = 0.2;
  switch (origin) {
    case 'top-left': return { anchor: [0, -outside * height], direction: [0, 1] };
    case 'top-right': return { anchor: [width, -outside * height], direction: [0, 1] };
    case 'left': return { anchor: [-outside * width, 0.5 * height], direction: [1, 0] };
    case 'right': return { anchor: [(1 + outside) * width, 0.5 * height], direction: [-1, 0] };
    case 'bottom-left': return { anchor: [0, (1 + outside) * height], direction: [0, -1] };
    case 'bottom-center': return { anchor: [0.5 * width, (1 + outside) * height], direction: [0, -1] };
    case 'bottom-right': return { anchor: [width, (1 + outside) * height], direction: [0, -1] };
    default: return { anchor: [0.5 * width, -outside * height], direction: [0, 1] };
  }
};

const getThemeWhite = () => {
  const token = getComputedStyle(document.documentElement).getPropertyValue('--mono-50').trim();
  const lightness = Number(token.match(/([\d.]+)%\s*$/)?.[1] ?? 100) / 100;
  return [lightness, lightness, lightness];
};

export default function LightRays({
  raysOrigin = 'top-center',
  raysSpeed = 1,
  lightSpread = 0.5,
  rayLength = 3,
  followMouse = true,
  mouseInfluence = 0.1,
  noiseAmount = 0,
  distortion = 0,
  className = '',
  pulsating = false,
  fadeDistance = 1,
  saturation = 1,
}: LightRaysProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: true,
        antialias: false,
        premultipliedAlpha: true,
        dpr: Math.min(window.devicePixelRatio || 1, 1.5),
      });
    } catch {
      return;
    }

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas;
    container.appendChild(canvas);

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: [1, 1] },
      rayPos: { value: [0, 0] },
      rayDir: { value: [0, 1] },
      raysColor: { value: getThemeWhite() },
      raysSpeed: { value: raysSpeed },
      lightSpread: { value: lightSpread },
      rayLength: { value: rayLength },
      pulsating: { value: pulsating ? 1 : 0 },
      fadeDistance: { value: fadeDistance },
      saturation: { value: saturation },
      mousePos: { value: [0.5, 0.5] },
      mouseInfluence: { value: mouseInfluence },
      noiseAmount: { value: noiseAmount },
      distortion: { value: distortion },
    };

    const program = new Program(gl, { vertex, fragment, uniforms, transparent: true, depthTest: false });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const mouse = { x: 0.5, y: 0.5 };
    const smoothMouse = { x: 0.5, y: 0.5 };
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let visible = true;

    const renderFrame = (time: number) => {
      uniforms.iTime.value = time * 0.001;
      if (followMouse && mouseInfluence > 0) {
        smoothMouse.x = smoothMouse.x * 0.92 + mouse.x * 0.08;
        smoothMouse.y = smoothMouse.y * 0.92 + mouse.y * 0.08;
        uniforms.mousePos.value[0] = smoothMouse.x;
        uniforms.mousePos.value[1] = smoothMouse.y;
      }
      renderer.render({ scene: mesh });
    };

    const loop = (time: number) => {
      renderFrame(time);
      frame = requestAnimationFrame(loop);
    };

    const startOrStop = () => {
      const shouldAnimate = visible && !document.hidden && !reduceMotion;
      if (shouldAnimate && frame === 0) frame = requestAnimationFrame(loop);
      if (!shouldAnimate && frame !== 0) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(Math.max(1, Math.round(width)), Math.max(1, Math.round(height)));
      const resolution = [gl.drawingBufferWidth, gl.drawingBufferHeight];
      uniforms.iResolution.value = resolution;
      const placement = getAnchorAndDirection(raysOrigin, resolution[0], resolution[1]);
      uniforms.rayPos.value = placement.anchor;
      uniforms.rayDir.value = placement.direction;
      renderFrame(performance.now());
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = (event.clientX - rect.left) / Math.max(rect.width, 1);
      mouse.y = (event.clientY - rect.top) / Math.max(rect.height, 1);
    };

    const resizeObserver = new ResizeObserver(resize);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      startOrStop();
    }, { threshold: 0.05 });

    resizeObserver.observe(container);
    intersectionObserver.observe(container);
    if (followMouse) window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', startOrStop);
    resize();
    startOrStop();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', startOrStop);
      window.removeEventListener('pointermove', onPointerMove);
      canvas.remove();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [distortion, fadeDistance, followMouse, lightSpread, mouseInfluence, noiseAmount, pulsating, rayLength, raysOrigin, raysSpeed, saturation]);

  return <div ref={containerRef} className={`light-rays-container ${className}`.trim()} aria-hidden="true" />;
}