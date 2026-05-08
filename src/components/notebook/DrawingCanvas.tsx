import { useRef, useState, useEffect } from 'react';
import { X, Check, RotateCcw, Eraser, PenTool, Highlighter } from 'lucide-react';

interface DrawingCanvasProps {
  onSave: (dataUrl: string) => void;
  onClose: () => void;
}

const COLORS = [
  '#000000', '#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#db2777',
  '#0d9488', '#4f46e5', '#9333ea', '#c026d3', '#e11d48', '#f59e0b', '#10b981'
];

export const DrawingCanvas = ({ onSave, onClose }: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [isHighlighter, setIsHighlighter] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineWidth = isHighlighter ? 20 : lineWidth;
    ctx.strokeStyle = isEraser ? '#ffffff' : color;
    ctx.globalAlpha = isHighlighter && !isEraser ? 0.3 : 1;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL());
      onClose();
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-surface-hover p-1 rounded-xl">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => { setColor(c); setIsEraser(false); }}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c && !isEraser ? 'scale-110 border-brand' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="flex bg-surface rounded-xl p-1 border border-border">
            <button
              onClick={() => { setIsEraser(false); setIsHighlighter(false); }}
              className={`p-1.5 rounded-lg transition-all ${!isEraser && !isHighlighter ? 'bg-brand text-white shadow-sm' : 'text-text-muted hover:bg-surface-hover'}`}
              title="Pen"
            >
              <PenTool size={16} />
            </button>
            <button
              onClick={() => { setIsEraser(false); setIsHighlighter(true); }}
              className={`p-1.5 rounded-lg transition-all ${isHighlighter ? 'bg-brand text-white shadow-sm' : 'text-text-muted hover:bg-surface-hover'}`}
              title="Highlighter"
            >
              <Highlighter size={16} />
            </button>
            <button
              onClick={() => { setIsEraser(true); setIsHighlighter(false); }}
              className={`p-1.5 rounded-lg transition-all ${isEraser ? 'bg-brand text-white shadow-sm' : 'text-text-muted hover:bg-surface-hover'}`}
              title="Eraser"
            >
              <Eraser size={16} />
            </button>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="w-24 accent-brand"
            disabled={isHighlighter}
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleClear} className="p-2 rounded-xl hover:bg-surface-hover text-text-muted" title="Clear">
            <RotateCcw size={18} />
          </button>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-danger/10 text-danger" title="Cancel">
            <X size={18} />
          </button>
          <button onClick={handleSave} className="bg-brand text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2">
            <Check size={18} /> Save Drawing
          </button>
        </div>
      </div>
      <div className="flex-1 relative bg-white cursor-crosshair overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full touch-none"
        />
      </div>
    </div>
  );
};
