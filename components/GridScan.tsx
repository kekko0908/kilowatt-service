import { useEffect, useMemo, useRef, useState } from 'react';

interface GridScanProps {
  sensitivity?: number;
  lineThickness?: number;
  linesColor?: string;
  gridScale?: number;
  scanColor?: string;
  scanOpacity?: number;
  enablePost?: boolean;
  bloomIntensity?: number;
  chromaticAberration?: number;
  noiseIntensity?: number;
  className?: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const GridScan: React.FC<GridScanProps> = ({
  sensitivity = 0.5,
  lineThickness = 1,
  linesColor = '#392e4e',
  gridScale = 0.1,
  scanColor = '#FF9FFC',
  scanOpacity = 0.4,
  enablePost = true,
  bloomIntensity = 0.6,
  chromaticAberration = 0.002,
  noiseIntensity = 0.01,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current || sensitivity <= 0) return;
    const handleMove = (event: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      setOffset({
        x: nx * 40 * sensitivity,
        y: ny * 40 * sensitivity
      });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [sensitivity]);

  const gridSize = useMemo(() => {
    const size = 200 * gridScale;
    return clamp(size, 18, 120);
  }, [gridScale]);

  const postFilter = enablePost
    ? `brightness(${1 + bloomIntensity * 0.3}) saturate(${1.2 + bloomIntensity * 0.3})`
    : 'none';

  const aberration = clamp(chromaticAberration * 1000, 0, 6);
  const noiseOpacity = clamp(noiseIntensity * 6, 0, 0.15);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`.trim()}
      style={{ filter: postFilter }}
    >
      {/* Base Grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${linesColor} ${lineThickness}px, transparent ${lineThickness}px), linear-gradient(90deg, ${linesColor} ${lineThickness}px, transparent ${lineThickness}px)`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundPosition: `${offset.x}px ${offset.y}px`,
          opacity: 0.75
        }}
      />

      {/* Chromatic Aberration Layers */}
      {chromaticAberration > 0 && (
        <>
          <div
            className="absolute inset-0 mix-blend-screen"
            style={{
              backgroundImage: `linear-gradient(rgba(255,0,120,0.35) ${lineThickness}px, transparent ${lineThickness}px), linear-gradient(90deg, rgba(255,0,120,0.35) ${lineThickness}px, transparent ${lineThickness}px)`,
              backgroundSize: `${gridSize}px ${gridSize}px`,
              backgroundPosition: `${offset.x - aberration}px ${offset.y - aberration}px`,
              opacity: 0.25
            }}
          />
          <div
            className="absolute inset-0 mix-blend-screen"
            style={{
              backgroundImage: `linear-gradient(rgba(0,200,255,0.35) ${lineThickness}px, transparent ${lineThickness}px), linear-gradient(90deg, rgba(0,200,255,0.35) ${lineThickness}px, transparent ${lineThickness}px)`,
              backgroundSize: `${gridSize}px ${gridSize}px`,
              backgroundPosition: `${offset.x + aberration}px ${offset.y + aberration}px`,
              opacity: 0.22
            }}
          />
        </>
      )}

      {/* Scan Pass */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(180deg, transparent 0%, ${scanColor} 45%, transparent 60%)`,
          opacity: scanOpacity,
          mixBlendMode: 'screen',
          animation: 'gridScanMove 5.5s linear infinite'
        }}
      />

      {/* Noise */}
      {noiseOpacity > 0 && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'repeating-radial-gradient(circle at 0 0, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)',
            opacity: noiseOpacity,
            mixBlendMode: 'soft-light'
          }}
        />
      )}

      <style>
        {`
          @keyframes gridScanMove {
            0% { transform: translateY(-60%); }
            100% { transform: translateY(60%); }
          }
        `}
      </style>
    </div>
  );
};

export default GridScan;
