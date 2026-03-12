import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CaptionDisplayProps {
  caption: string;
  style: string;
}

const CaptionDisplay = ({ caption, style }: CaptionDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 glow-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <span className="text-xs font-display text-primary uppercase tracking-wider">
            {style} caption
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          title="Copy caption"
        >
          {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <p className="text-foreground leading-relaxed">{caption}</p>
    </div>
  );
};

export default CaptionDisplay;
