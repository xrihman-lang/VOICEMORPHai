import { useRef, useEffect, useCallback } from 'react';

interface WaveformVisualizerProps {
  data: Uint8Array | null;
  isActive: boolean;
  color?: string;
  height?: number;
}

export default function WaveformVisualizer({ data, isActive, color = '#00e5ff', height = 120 }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    if (!data || !isActive) {
      // Draw idle state
      ctx.beginPath();
      const gradient = ctx.createLinearGradient(0, h / 2, w, h / 2);
      gradient.addColorStop(0, `${color}20`);
      gradient.addColorStop(0.5, `${color}40`);
      gradient.addColorStop(1, `${color}20`);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.moveTo(0, h / 2);
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.sin(x * 0.02 + Date.now() * 0.001) * 3;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      animFrameRef.current = requestAnimationFrame(draw);
      return;
    }

    const barCount = Math.min(data.length, 64);
    const barWidth = w / barCount;
    const gap = 2;

    for (let i = 0; i < barCount; i++) {
      const value = data[i] / 255;
      const barHeight = Math.max(2, value * h * 0.85);
      const x = i * barWidth + gap / 2;
      const y = (h - barHeight) / 2;

      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, `${color}cc`);
      gradient.addColorStop(1, color);

      ctx.fillStyle = gradient;
      ctx.shadowColor = color;
      ctx.shadowBlur = value * 15;

      const radius = Math.min(3, (barWidth - gap) / 2);
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth - gap, barHeight, radius);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    animFrameRef.current = requestAnimationFrame(draw);
  }, [data, isActive, color]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-xl"
      style={{ height: `${height}px` }}
    />
  );
}
