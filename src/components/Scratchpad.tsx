import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Eraser, RotateCcw, X, Minimize2, Maximize2 } from 'lucide-react';

interface ScratchpadProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState<string>('#3b82f6'); // default vivid blue pen
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || isMinimized) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set high DPI canvas resolution
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [isOpen, isMinimized]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = lineWidth * 5;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }

    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-40 transition-all duration-200 bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden ${
        isMinimized
          ? 'bottom-4 right-4 w-72 h-14'
          : 'bottom-4 right-4 w-[92vw] sm:w-[420px] h-[360px] md:h-[400px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-800">손글씨 연습장 / 계산 메모</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-md transition-colors"
            title={isMinimized ? '확대' : '축소'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-rose-600 hover:bg-slate-200/60 rounded-md transition-colors"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Controls Bar */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-white border-b border-slate-100 text-xs shrink-0">
            {/* Tool selection */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTool('pen')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${
                  tool === 'pen'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>펜</span>
              </button>
              <button
                type="button"
                onClick={() => setTool('eraser')}
                className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${
                  tool === 'eraser'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>지우개</span>
              </button>
            </div>

            {/* Colors */}
            {tool === 'pen' && (
              <div className="flex items-center gap-1.5">
                {[
                  { hex: '#3b82f6', label: '파랑' },
                  { hex: '#0f172a', label: '검정' },
                  { hex: '#ef4444', label: '빨강' },
                  { hex: '#10b981', label: '초록' },
                ].map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-4 h-4 rounded-full transition-transform ${
                      color === c.hex ? 'scale-125 ring-2 ring-offset-1 ring-slate-400' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            )}

            {/* Clear */}
            <button
              type="button"
              onClick={clearCanvas}
              className="px-2 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md flex items-center gap-1 transition-colors"
              title="전체 지우기"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>지우기</span>
            </button>
          </div>

          {/* Canvas area */}
          <div className="relative flex-1 bg-white cursor-crosshair touch-none">
            {/* Grid pattern background for calculation guidance */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40"
              style={{
                backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </>
      )}
    </div>
  );
};
