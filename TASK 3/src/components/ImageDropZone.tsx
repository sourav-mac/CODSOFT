import { useState, useCallback } from "react";
import { Upload, Image as ImageIcon, X } from "lucide-react";

interface ImageDropZoneProps {
  onImageSelect: (base64: string, file: File) => void;
  preview: string | null;
  onClear: () => void;
  isProcessing: boolean;
}

const ImageDropZone = ({ onImageSelect, preview, onClear, isProcessing }: ImageDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onImageSelect(base64, file);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (preview) {
    return (
      <div className="relative group rounded-xl overflow-hidden border border-border bg-card">
        <img
          src={preview}
          alt="Uploaded preview"
          className="w-full max-h-[400px] object-contain bg-muted/50"
        />
        {!isProcessing && (
          <button
            onClick={onClear}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-card/80 backdrop-blur border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isProcessing && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-display text-primary animate-pulse-glow">
                Analyzing image...
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative rounded-xl border-2 border-dashed p-12 text-center transition-all cursor-pointer ${
        isDragging
          ? "drop-zone-active border-primary/50"
          : "border-border hover:border-primary/30 hover:glow-border"
      }`}
      onClick={() => document.getElementById("file-input")?.click()}
    >
      <input
        id="file-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
          {isDragging ? (
            <ImageIcon className="w-8 h-8 text-primary animate-pulse-glow" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="text-foreground font-medium mb-1">
            {isDragging ? "Drop your image" : "Upload an image"}
          </p>
          <p className="text-sm text-muted-foreground">
            Drag & drop or click to browse
          </p>
        </div>
        <p className="text-xs text-muted-foreground/60">
          JPG, PNG, WebP up to 10MB
        </p>
      </div>
    </div>
  );
};

export default ImageDropZone;
