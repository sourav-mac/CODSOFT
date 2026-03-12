import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ScanFace, Users, Loader2, Trash2 } from 'lucide-react';
import { loadModels, detectFaces, FaceRecognizer, type FaceResult } from '@/lib/faceDetection';
import FaceCanvas from '@/components/FaceCanvas';
import FaceDetailPanel from '@/components/FaceDetailPanel';
import WebcamCapture from '@/components/WebcamCapture';
import MobileBottomSheet from '@/components/MobileBottomSheet';
import { useIsMobile } from '@/hooks/use-mobile';

const recognizer = new FaceRecognizer();

export default function Index() {
  const isMobile = useIsMobile();
  const [modelsReady, setModelsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageNaturalSize, setImageNaturalSize] = useState({ w: 800, h: 500 });
  const [faces, setFaces] = useState<FaceResult[]>([]);
  const [selectedFace, setSelectedFace] = useState<number | null>(null);
  const [recognizedNames, setRecognizedNames] = useState<Map<number, string>>(new Map());
  const [knownFaces, setKnownFaces] = useState<string[]>([]);
  const [webcamActive, setWebcamActive] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadModels().then(() => {
      setModelsReady(true);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const resize = () => {
      if (containerRef.current) {
        setCanvasWidth(containerRef.current.offsetWidth);
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const processImage = useCallback(async (src: string) => {
    setImageSrc(src);
    setFaces([]);
    setSelectedFace(null);
    setRecognizedNames(new Map());
    setDetecting(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    await new Promise(r => (img.onload = r));
    setImageNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });

    const results = await detectFaces(img);
    setFaces(results);

    // Try to recognize
    const names = new Map<number, string>();
    results.forEach(f => {
      const match = recognizer.recognize(f.descriptor);
      if (match) names.set(f.id, match.label);
    });
    setRecognizedNames(names);
    setDetecting(false);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => processImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => processImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const labelFace = (id: number, name: string) => {
    const face = faces.find(f => f.id === id);
    if (!face) return;
    recognizer.addFace(name, face.descriptor);
    setRecognizedNames(prev => new Map(prev).set(id, name));
    setKnownFaces([...recognizer.knownFaces]);
  };

  const selectedFaceData = faces.find(f => f.id === selectedFace) || null;

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Header */}
      <header className="border-b border-border px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
              <ScanFace className="text-primary" size={18} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">FaceScope</h1>
              <p className="text-[10px] sm:text-xs font-mono text-muted-foreground">AI Face Detection & Recognition</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {modelsReady && (
              <span className="flex items-center gap-1.5 text-xs font-mono text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
                Models Ready
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Loading state */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-4"
            >
              <Loader2 className="text-primary animate-spin" size={32} />
              <p className="text-sm font-mono text-muted-foreground">Loading face detection models...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {modelsReady && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs sm:text-sm font-mono font-semibold hover:opacity-90 transition-opacity glow-primary"
              >
                <Upload size={14} /> Upload
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <WebcamCapture
                isActive={webcamActive}
                onToggle={() => setWebcamActive(!webcamActive)}
                onCapture={(src) => {
                  setWebcamActive(false);
                  processImage(src);
                }}
              />
              {faces.length > 0 && (
                <span className="text-xs font-mono text-muted-foreground ml-auto">
                  <Users size={12} className="inline mr-1" />
                  {faces.length} face{faces.length !== 1 ? 's' : ''} detected
                </span>
              )}
            </div>

            {/* Main area */}
            <div className={`grid gap-4 sm:gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-[1fr_300px]'}`}>
              <div ref={containerRef}>
                {imageSrc ? (
                  <div className="relative">
                    <FaceCanvas
                      imageSrc={imageSrc}
                      faces={faces}
                      recognizedNames={recognizedNames}
                      selectedFace={selectedFace}
                      onFaceClick={setSelectedFace}
                      width={canvasWidth}
                      height={Math.min(
                        Math.round(canvasWidth * (imageNaturalSize.h / imageNaturalSize.w)),
                        window.innerWidth < 640 ? Math.round(window.innerHeight * 0.45) : 800
                      )}
                    />
                    {detecting && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <Loader2 className="text-primary animate-spin" size={20} />
                          <span className="text-sm font-mono text-primary">Scanning faces...</span>
                        </div>
                        <div className="absolute left-0 right-0 h-0.5 bg-primary/60 animate-scan-line shadow-[0_0_15px_hsl(165_80%_48%/0.5)]" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center py-16 sm:py-32 hover:border-primary/40 transition-colors cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ScanFace className="text-muted-foreground group-hover:text-primary transition-colors mb-4" size={48} />
                    <p className="text-sm font-mono text-muted-foreground">Drop an image here or click to upload</p>
                    <p className="text-xs font-mono text-muted-foreground/60 mt-1">Supports JPG, PNG, WebP</p>
                  </div>
                )}
              </div>

              {/* Desktop: right panel */}
              {!isMobile && (
                <div className="space-y-4">
                  <FaceDetailPanel
                    face={selectedFaceData}
                    recognizedName={selectedFace !== null ? recognizedNames.get(selectedFace) : undefined}
                    onLabelFace={labelFace}
                    onClose={() => setSelectedFace(null)}
                  />

                  {knownFaces.length > 0 && (
                    <div className="bg-card border border-border rounded-lg p-4">
                      <h3 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Known Faces ({knownFaces.length})
                      </h3>
                      <div className="space-y-1.5">
                        {knownFaces.map(name => (
                          <div key={name} className="flex items-center justify-between text-sm">
                            <span className="font-mono text-foreground">{name}</span>
                            <button
                              onClick={() => {
                                recognizer.removeFace(name);
                                setKnownFaces([...recognizer.knownFaces]);
                              }}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!selectedFaceData && faces.length > 0 && (
                    <div className="bg-card border border-border rounded-lg p-4 text-center">
                      <p className="text-xs font-mono text-muted-foreground">Click on a detected face to see details</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile: bottom sheet for face details */}
            {isMobile && (
              <MobileBottomSheet
                isOpen={selectedFace !== null}
                onClose={() => setSelectedFace(null)}
              >
                <FaceDetailPanel
                  face={selectedFaceData}
                  recognizedName={selectedFace !== null ? recognizedNames.get(selectedFace) : undefined}
                  onLabelFace={labelFace}
                  onClose={() => setSelectedFace(null)}
                />
                {knownFaces.length > 0 && (
                  <div className="bg-muted rounded-lg p-4 mt-3">
                    <h3 className="text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Known Faces ({knownFaces.length})
                    </h3>
                    <div className="space-y-1.5">
                      {knownFaces.map(name => (
                        <div key={name} className="flex items-center justify-between text-sm">
                          <span className="font-mono text-foreground">{name}</span>
                          <button
                            onClick={() => {
                              recognizer.removeFace(name);
                              setKnownFaces([...recognizer.knownFaces]);
                            }}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </MobileBottomSheet>
            )}

            {/* Mobile hint */}
            {isMobile && !selectedFaceData && faces.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-3 text-center">
                <p className="text-xs font-mono text-muted-foreground">Tap on a detected face to see details</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
