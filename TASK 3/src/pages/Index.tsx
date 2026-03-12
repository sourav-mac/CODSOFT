import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ImageDropZone from "@/components/ImageDropZone";
import StyleSelector, { type CaptionStyle } from "@/components/StyleSelector";
import CaptionDisplay from "@/components/CaptionDisplay";
import { Button } from "@/components/ui/button";
import { Scan, Sparkles } from "lucide-react";

const Index = () => {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [style, setStyle] = useState<CaptionStyle>("descriptive");
  const [caption, setCaption] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageSelect = useCallback((base64: string) => {
    setImageBase64(base64);
    setPreview(base64);
    setCaption(null);
  }, []);

  const handleClear = useCallback(() => {
    setImageBase64(null);
    setPreview(null);
    setCaption(null);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!imageBase64) return;
    setIsProcessing(true);
    setCaption(null);

    try {
      const { data, error } = await supabase.functions.invoke("caption-image", {
        body: { imageBase64, style },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setCaption(data.caption);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to generate caption";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  }, [imageBase64, style]);

  return (
    <div className="min-h-screen bg-background bg-grid relative">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12 sm:py-20">
        {/* Header */}
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs font-display text-muted-foreground mb-4">
            <Sparkles className="w-3 h-3 text-primary" />
            Powered by AI Vision
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-display text-gradient mb-3 leading-tight">
            Image Caption AI
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Upload an image and let AI generate intelligent captions using
            computer vision and natural language processing.
          </p>
        </header>

        {/* Main content */}
        <div className="space-y-6">
          <ImageDropZone
            onImageSelect={handleImageSelect}
            preview={preview}
            onClear={handleClear}
            isProcessing={isProcessing}
          />

          {imageBase64 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-display text-muted-foreground uppercase tracking-wider mb-2">
                  Caption Style
                </label>
                <StyleSelector
                  selected={style}
                  onChange={setStyle}
                  disabled={isProcessing}
                />
              </div>

              <Button
                variant="glow"
                size="lg"
                className="w-full font-display"
                onClick={handleGenerate}
                disabled={isProcessing}
              >
                <Scan className="w-4 h-4 mr-2" />
                {isProcessing ? "Analyzing..." : "Generate Caption"}
              </Button>
            </div>
          )}

          {caption && <CaptionDisplay caption={caption} style={style} />}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <p className="text-xs text-muted-foreground/40 font-display">
            CNN Feature Extraction → Transformer Decoder → Natural Language Output
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
