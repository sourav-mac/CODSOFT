import { Button } from "@/components/ui/button";
import { FileText, Sparkles, Microscope, Eye } from "lucide-react";

const STYLES = [
  { id: "descriptive", label: "Descriptive", icon: FileText },
  { id: "poetic", label: "Poetic", icon: Sparkles },
  { id: "technical", label: "Technical", icon: Microscope },
  { id: "accessibility", label: "Alt Text", icon: Eye },
] as const;

export type CaptionStyle = (typeof STYLES)[number]["id"];

interface StyleSelectorProps {
  selected: CaptionStyle;
  onChange: (style: CaptionStyle) => void;
  disabled?: boolean;
}

const StyleSelector = ({ selected, onChange, disabled }: StyleSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {STYLES.map((style) => (
        <Button
          key={style.id}
          variant={selected === style.id ? "glow" : "glow-outline"}
          size="sm"
          disabled={disabled}
          onClick={() => onChange(style.id)}
          className="font-display text-xs"
        >
          <span className="mr-1"><style.icon className="w-3.5 h-3.5" /></span>
          {style.label}
        </Button>
      ))}
    </div>
  );
};

export default StyleSelector;
