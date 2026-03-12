const TypingIndicator = () => (
  <div className="flex items-end gap-2 animate-fade-in-up">
    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
      🎓
    </div>
    <div className="bg-bot text-bot-foreground px-4 py-3 rounded-2xl rounded-bl-sm">
      <div className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-typing-dot-1" />
        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-typing-dot-2" />
        <span className="w-2 h-2 rounded-full bg-muted-foreground animate-typing-dot-3" />
      </div>
    </div>
  </div>
);

export default TypingIndicator;
