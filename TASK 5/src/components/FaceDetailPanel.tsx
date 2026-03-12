import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Smile, Calendar, Tag, X, Check } from 'lucide-react';
import type { FaceResult } from '@/lib/faceDetection';

interface FaceDetailPanelProps {
  face: FaceResult | null;
  recognizedName: string | undefined;
  onLabelFace: (id: number, name: string) => void;
  onClose: () => void;
}

export default function FaceDetailPanel({ face, recognizedName, onLabelFace, onClose }: FaceDetailPanelProps) {
  const [nameInput, setNameInput] = useState('');

  if (!face) return null;

  const topExpression = Object.entries(face.expressions).sort((a, b) => b[1] - a[1])[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="bg-card border border-glow rounded-lg p-4 sm:p-5 space-y-3 sm:space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono font-semibold text-primary tracking-wider uppercase">
            Face #{face.id + 1} Analysis
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Identity */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <User size={12} /> IDENTITY
          </div>
          {recognizedName ? (
            <div className="flex items-center gap-2">
              <span className="text-primary font-semibold">{recognizedName}</span>
              <span className="text-xs text-muted-foreground">(recognized)</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter name..."
                className="flex-1 bg-muted border border-border rounded px-3 py-1.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && nameInput.trim()) {
                    onLabelFace(face.id, nameInput.trim());
                    setNameInput('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (nameInput.trim()) {
                    onLabelFace(face.id, nameInput.trim());
                    setNameInput('');
                  }
                }}
                className="bg-primary text-primary-foreground rounded px-3 py-1.5 hover:opacity-90 transition-opacity"
              >
                <Check size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Age & Gender */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground mb-1">
              <Calendar size={11} /> AGE
            </div>
            <p className="text-lg font-semibold text-foreground">~{face.age}</p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground mb-1">
              <Tag size={11} /> GENDER
            </div>
            <p className="text-lg font-semibold text-foreground capitalize">{face.gender}</p>
            <p className="text-xs text-muted-foreground">{(face.genderProbability * 100).toFixed(0)}%</p>
          </div>
        </div>

        {/* Expression */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground mb-2">
            <Smile size={11} /> EXPRESSION
          </div>
          <div className="space-y-1.5">
            {Object.entries(face.expressions)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4)
              .map(([expr, val]) => (
                <div key={expr} className="flex items-center gap-2">
                  <span className="text-xs font-mono w-20 capitalize text-secondary-foreground">{expr}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(val as number) * 100}%` }}
                      className={`h-full rounded-full ${expr === topExpression[0] ? 'bg-primary' : 'bg-accent'}`}
                    />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                    {((val as number) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Coordinates */}
        <div className="text-xs font-mono text-muted-foreground space-y-0.5 pt-2 border-t border-border">
          <p>pos: ({Math.round(face.box.x)}, {Math.round(face.box.y)})</p>
          <p>size: {Math.round(face.box.width)}×{Math.round(face.box.height)}px</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
