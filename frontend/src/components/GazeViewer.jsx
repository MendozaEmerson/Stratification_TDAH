import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Eye } from 'lucide-react';

export default function GazeViewer({ gazeTrajectory = [], stratumName = '' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(gazeTrajectory.length || 0);
  const animationRef = useRef(null);
  const canvasRef = useRef(null);

  // Normalizar cuando cambia la trayectoria
  useEffect(() => {
    setCurrentIndex(gazeTrajectory.length);
    setIsPlaying(false);
  }, [gazeTrajectory]);

  // Loop de reproducción animada
  useEffect(() => {
    if (isPlaying) {
      const step = () => {
        setCurrentIndex((prev) => {
          if (prev >= gazeTrajectory.length) {
            setIsPlaying(false);
            return gazeTrajectory.length;
          }
          return Math.min(prev + 3, gazeTrajectory.length);
        });
        animationRef.current = requestAnimationFrame(step);
      };
      animationRef.current = requestAnimationFrame(step);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, gazeTrajectory.length]);

  // Dibujar en Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Limpiar canvas con fondo oscuro de sala de video
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Rejilla de calibración tenue
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (!gazeTrajectory || gazeTrajectory.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Sin datos de mirada cargados', width / 2, height / 2);
      return;
    }

    // Escalar puntos de pantalla 1280x720 al canvas actual (width x height)
    const scaleX = width / 1280;
    const scaleY = height / 720;

    const visiblePoints = gazeTrajectory.slice(0, currentIndex);
    if (visiblePoints.length < 2) return;

    // Dibujar trazo temporal continuo
    ctx.lineWidth = 1.8;
    for (let i = 1; i < visiblePoints.length; i++) {
      const p0 = visiblePoints[i - 1];
      const p1 = visiblePoints[i];

      const x0 = p0.x * scaleX;
      const y0 = p0.y * scaleY;
      const x1 = p1.x * scaleX;
      const y1 = p1.y * scaleY;

      // Gradiente de color según avance en el tiempo
      const ratio = i / gazeTrajectory.length;
      let strokeColor = '#38bdf8'; // Cyan
      if (ratio > 0.4 && ratio <= 0.75) strokeColor = '#818cf8'; // Índigo
      if (ratio > 0.75) strokeColor = '#f43f5e'; // Carmesí

      ctx.strokeStyle = strokeColor;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();

      // Círculos de fijación espaciados
      if (i % 8 === 0) {
        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(x1, y1, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Dibujar punto actual de la mirada (Head de la mirada)
    if (visiblePoints.length > 0) {
      const last = visiblePoints[visiblePoints.length - 1];
      const lx = last.x * scaleX;
      const ly = last.y * scaleY;

      ctx.fillStyle = '#fbbf24'; // Ámbar brillante
      ctx.beginPath();
      ctx.arc(lx, ly, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Efecto halo
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.beginPath();
      ctx.arc(lx, ly, 14, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [currentIndex, gazeTrajectory]);

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  const isSevere = stratumName.includes('Severo');

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-sky-600" />
          <h3 className="font-bold text-slate-800 text-sm">
            Trayectoria de Exploración Ocular (Scanpath I-DT)
          </h3>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          Estímulo: <em>The Present (HBN)</em>
        </span>
      </div>

      {/* Canvas */}
      <div className="relative rounded-lg overflow-hidden border border-slate-800 shadow-inner">
        <canvas
          ref={canvasRef}
          width={640}
          height={340}
          className="w-full h-auto block"
        />
        {/* Overlay informativo */}
        <div className="absolute bottom-2 left-3 text-[11px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur-sm">
          Puntos renderizados: {currentIndex} / {gazeTrajectory.length}
        </div>
        {isSevere && (
          <div className="absolute top-2 right-3 text-[11px] font-semibold text-rose-300 bg-rose-950/80 border border-rose-800 px-2.5 py-1 rounded backdrop-blur-sm">
            Dispersión sacádica elevada detectada
          </div>
        )}
      </div>

      {/* Controles de reproducción */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 text-white hover:bg-sky-700 transition-colors shadow-sm"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Reproducir</span>
              </>
            )}
          </button>
          <button
            onClick={handleRestart}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar</span>
          </button>
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-500">
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
            <span>Inicio</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
            <span>Medio</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Final</span>
          </div>
        </div>
      </div>
    </div>
  );
}

