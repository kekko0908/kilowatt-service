import React, { useEffect, useRef } from 'react';

const CyberBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let frame = 0;

    const gridSize = 40;
    const spread = 2.8;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let rafId = 0;
    const animate = () => {
      frame += 1;
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(0, 243, 255, 0)');
      gradient.addColorStop(0.5, 'rgba(0, 243, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(191, 0, 255, 0.2)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1;

      const centerX = width / 2;
      const startX = -width * spread;
      const endX = width * (spread + 1);
      for (let x = startX; x < endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(centerX + (x - centerX) * spread, height);
        ctx.stroke();
      }

      const offset = (frame * 1) % gridSize;
      for (let y = 0; y < height; y += gridSize) {
        const yPos = y + offset;
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(width, yPos);
        ctx.stroke();
      }

      for (let i = 0; i < 30; i += 1) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const opacity = Math.random() * 0.5;
        ctx.fillStyle = `rgba(0, 243, 255, ${opacity})`;
        ctx.fillRect(x, y, 1, 1);
      }

      rafId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none opacity-60"
    />
  );
};

export default CyberBackground;
