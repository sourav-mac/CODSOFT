import { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, CameraOff, Pause, Play } from 'lucide-react';
import { detectFaces, type FaceResult } from '@/lib/faceDetection';

interface WebcamCaptureProps {
  onCapture: (dataUrl: string) => void;
  isActive: boolean;
  onToggle: () => void;
  recognizedNames?: Map<number, string>;
}

export default function WebcamCapture({ onCapture, isActive, onToggle, recognizedNames = new Map() }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const detectingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [liveDetection, setLiveDetection] = useState(true);
  const [liveFaces, setLiveFaces] = useState<FaceResult[]>([]);
  const [fps, setFps] = useState(0);
  const lastDetectTime = useRef(0);

  useEffect(() => {
    if (isActive) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setError(null);
        })
        .catch(() => setError('Camera access denied'));
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      setLiveFaces([]);
      cancelAnimationFrame(animFrameRef.current);
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive]);

  // Continuous detection loop
  useEffect(() => {
    if (!isActive || !liveDetection) {
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const loop = async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || detectingRef.current) {
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      detectingRef.current = true;
      const start = performance.now();
      try {
        const results = await detectFaces(video, true);
        setLiveFaces(results);
        const elapsed = performance.now() - start;
        lastDetectTime.current = elapsed;
        setFps(Math.round(1000 / Math.max(elapsed, 1)));
      } catch {
        // skip frame
      }
      detectingRef.current = false;
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isActive, liveDetection]);

  // Draw overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video || !isActive) return;

    const draw = () => {
      if (video.readyState < 2) {
        requestAnimationFrame(draw);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      liveFaces.forEach((face) => {
        const { x, y, width: w, height: h } = face.box;

        // Box
        ctx.strokeStyle = '#2dd4bf';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#2dd4bf';
        ctx.shadowBlur = 8;
        ctx.strokeRect(x, y, w, h);
        ctx.shadowBlur = 0;

        // Corner accents
        const cl = 10;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x, y + cl); ctx.lineTo(x, y); ctx.lineTo(x + cl, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w - cl, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cl); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y + h - cl); ctx.lineTo(x, y + h); ctx.lineTo(x + cl, y + h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + w - cl, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cl); ctx.stroke();

        // Label
        const topExpr = Object.entries(face.expressions).sort((a, b) => b[1] - a[1])[0];
        const label = `${face.gender === 'male' ? '♂' : '♀'} ~${face.age}y ${topExpr ? topExpr[0] : ''}`;
        ctx.font = '600 12px "JetBrains Mono", monospace';
        const tw = ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(45,212,191,0.85)';
        ctx.fillRect(x, y - 20, tw + 10, 18);
        ctx.fillStyle = '#0a0f14';
        ctx.fillText(label, x + 5, y - 6);
      });
    };
    const id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, [liveFaces, isActive]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    onCapture(canvas.toDataURL('image/jpeg'));
  }, [onCapture]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onToggle}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-mono transition-all ${
            isActive
              ? 'bg-destructive/20 text-destructive border border-destructive/30'
              : 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20'
          }`}
        >
          {isActive ? <CameraOff size={14} /> : <Camera size={14} />}
          {isActive ? 'Stop' : 'Camera'}
        </button>
        {isActive && (
          <button
            onClick={() => setLiveDetection(p => !p)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 transition-colors"
          >
            {liveDetection ? <Pause size={14} /> : <Play size={14} />}
            {liveDetection ? 'Pause' : 'Resume'}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-destructive font-mono">{error}</p>}

      {isActive && (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="rounded-lg w-full border border-glow"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none"
          />
          {/* HUD */}
          {liveDetection && (
            <div className="absolute top-2 left-2 flex items-center gap-2">
              <span className="bg-card/80 backdrop-blur-sm border border-border rounded px-2 py-0.5 text-[10px] font-mono text-primary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                LIVE
              </span>
              <span className="bg-card/80 backdrop-blur-sm border border-border rounded px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                {liveFaces.length} face{liveFaces.length !== 1 ? 's' : ''} · {fps} FPS
              </span>
            </div>
          )}
          <button
            onClick={capture}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-mono font-semibold hover:opacity-90 transition-opacity glow-primary"
          >
            Capture & Detect
          </button>
        </div>
      )}
    </div>
  );
}
