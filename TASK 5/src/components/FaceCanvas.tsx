import { useEffect, useRef } from 'react';
import type { FaceResult } from '@/lib/faceDetection';

interface FaceCanvasProps {
  imageSrc: string;
  faces: FaceResult[];
  recognizedNames: Map<number, string>;
  selectedFace: number | null;
  onFaceClick: (id: number) => void;
  width: number;
  height: number;
}

export default function FaceCanvas({ imageSrc, faces, recognizedNames, selectedFace, onFaceClick, width, height }: FaceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      draw(ctx, img);
    };
    img.src = imageSrc;
  }, [imageSrc, faces, recognizedNames, selectedFace]);

  function draw(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
    const canvas = ctx.canvas;
    // Fit image to canvas
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const dx = (canvas.width - img.width * scale) / 2;
    const dy = (canvas.height - img.height * scale) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, dx, dy, img.width * scale, img.height * scale);

    faces.forEach((face) => {
      const x = face.box.x * scale + dx;
      const y = face.box.y * scale + dy;
      const w = face.box.width * scale;
      const h = face.box.height * scale;

      const isSelected = selectedFace === face.id;
      const name = recognizedNames.get(face.id);

      // Box
      ctx.strokeStyle = isSelected ? '#a855f7' : '#2dd4bf';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.shadowColor = isSelected ? '#a855f7' : '#2dd4bf';
      ctx.shadowBlur = 10;
      ctx.strokeRect(x, y, w, h);
      ctx.shadowBlur = 0;

      // Corner accents
      const cornerLen = 12;
      ctx.lineWidth = 3;
      // top-left
      ctx.beginPath(); ctx.moveTo(x, y + cornerLen); ctx.lineTo(x, y); ctx.lineTo(x + cornerLen, y); ctx.stroke();
      // top-right
      ctx.beginPath(); ctx.moveTo(x + w - cornerLen, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cornerLen); ctx.stroke();
      // bottom-left
      ctx.beginPath(); ctx.moveTo(x, y + h - cornerLen); ctx.lineTo(x, y + h); ctx.lineTo(x + cornerLen, y + h); ctx.stroke();
      // bottom-right
      ctx.beginPath(); ctx.moveTo(x + w - cornerLen, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cornerLen); ctx.stroke();

      // Label
      const label = name || `Face ${face.id + 1}`;
      ctx.font = '600 13px "JetBrains Mono", monospace';
      const textWidth = ctx.measureText(label).width;
      ctx.fillStyle = isSelected ? 'rgba(168,85,247,0.85)' : 'rgba(45,212,191,0.85)';
      ctx.fillRect(x, y - 22, textWidth + 12, 20);
      ctx.fillStyle = isSelected ? '#fff' : '#0a0f14';
      ctx.fillText(label, x + 6, y - 7);

      // Landmarks (dots)
      if (isSelected && face.landmarks) {
        ctx.fillStyle = 'rgba(168,85,247,0.6)';
        const positions = face.landmarks.positions;
        positions.forEach((pt: { x: number; y: number }) => {
          ctx.beginPath();
          ctx.arc(pt.x * scale + dx, pt.y * scale + dy, 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    });
  }

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const img = imgRef.current;
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const dx = (canvas.width - img.width * scale) / 2;
    const dy = (canvas.height - img.height * scale) / 2;

    for (const face of faces) {
      const x = face.box.x * scale + dx;
      const y = face.box.y * scale + dy;
      const w = face.box.width * scale;
      const h = face.box.height * scale;
      if (cx >= x && cx <= x + w && cy >= y && cy <= y + h) {
        onFaceClick(face.id);
        return;
      }
    }
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleClick}
      className="rounded-lg cursor-crosshair w-full max-w-full"
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
}
