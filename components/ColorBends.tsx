import { useEffect, useMemo, useRef } from 'react';

interface ColorBendsProps {
  colors?: string[];
  rotation?: number;
  speed?: number;
  scale?: number;
  frequency?: number;
  warpStrength?: number;
  mouseInfluence?: number;
  parallax?: number;
  noise?: number;
  transparent?: boolean;
  autoRotate?: number;
  color?: string;
  className?: string;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return [r, g, b];
  }
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(clean);
  if (!result) return [255, 255, 255];
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
};

const toRgba = (hex: string, alpha: number) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const ColorBends: React.FC<ColorBendsProps> = ({
  colors = ['#ff5c7a', '#8a5cff', '#00ffd1'],
  rotation = 0,
  speed = 0.2,
  scale = 1,
  frequency = 1,
  warpStrength = 1,
  mouseInfluence = 1,
  parallax = 0.5,
  noise = 0.1,
  transparent = true,
  autoRotate = 0,
  color = '',
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
  const noiseRef = useRef<HTMLCanvasElement | null>(null);
  const lastNoiseRef = useRef(0);

  const normalizedColors = useMemo(() => {
    return colors.length ? colors : ['#ff5c7a', '#8a5cff', '#00ffd1'];
  }, [colors]);

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
        y: clamp((event.clientY - rect.top) / rect.height, 0, 1)
      };
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const noiseCanvas = document.createElement('canvas');
    noiseRef.current = noiseCanvas;
    const noiseCtx = noiseCanvas.getContext('2d');

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const { width, height } = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (noiseRef.current) {
        noiseRef.current.width = 120;
        noiseRef.current.height = 120;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const drawNoise = () => {
      if (!noiseCtx || !noiseRef.current) return;
      const { width, height } = noiseRef.current;
      const imageData = noiseCtx.createImageData(width, height);
      const n = clamp(noise, 0, 0.5);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const value = Math.random() * 255;
        imageData.data[i] = value;
        imageData.data[i + 1] = value;
        imageData.data[i + 2] = value;
        imageData.data[i + 3] = 255 * n;
      }
      noiseCtx.putImageData(imageData, 0, 0);
    };

    const render = (time: number) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const t = time * 0.001;

      smoothMouseRef.current.x =
        smoothMouseRef.current.x * 0.92 + mouseRef.current.x * 0.08;
      smoothMouseRef.current.y =
        smoothMouseRef.current.y * 0.92 + mouseRef.current.y * 0.08;

      const mouseOffset = {
        x: (smoothMouseRef.current.x - 0.5) * 2,
        y: (smoothMouseRef.current.y - 0.5) * 2
      };

      ctx.clearRect(0, 0, width, height);
      if (!transparent) {
        ctx.fillStyle = color || '#000';
        ctx.fillRect(0, 0, width, height);
      }

      const baseRotation = rotation + autoRotate * t + t * speed * 0.35;
      const radius = Math.max(width, height) * 0.65 * scale;
      const centerX = width / 2 + mouseOffset.x * parallax * 20;
      const centerY = height / 2 + mouseOffset.y * parallax * 20;

      ctx.globalCompositeOperation = 'screen';
      normalizedColors.forEach((col, index) => {
        const angle = baseRotation + index * (Math.PI * 2 / normalizedColors.length);
        const wave =
          Math.sin(t * frequency * 1.4 + index * 1.7) *
          warpStrength *
          0.18 *
          radius;
        const posX =
          centerX + Math.cos(angle) * (radius * 0.25 + wave) + mouseOffset.x * mouseInfluence * 40;
        const posY =
          centerY + Math.sin(angle) * (radius * 0.25 + wave) + mouseOffset.y * mouseInfluence * 40;

        const gradient = ctx.createRadialGradient(posX, posY, 0, posX, posY, radius);
        gradient.addColorStop(0, toRgba(col, 0.8));
        gradient.addColorStop(0.35, toRgba(col, 0.35));
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(posX, posY, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';

      if (noise > 0 && noiseRef.current) {
        if (t - lastNoiseRef.current > 0.12) {
          drawNoise();
          lastNoiseRef.current = t;
        }
        ctx.globalAlpha = clamp(noise * 0.5, 0, 0.2);
        ctx.drawImage(noiseRef.current, 0, 0, width, height);
        ctx.globalAlpha = 1;
      }

      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [
    normalizedColors,
    rotation,
    speed,
    scale,
    frequency,
    warpStrength,
    mouseInfluence,
    parallax,
    noise,
    transparent,
    autoRotate,
    color
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`.trim()}
    />
  );
};

export default ColorBends;
