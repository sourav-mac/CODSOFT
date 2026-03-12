const chips = ["Admission", "Courses", "Fees", "Hostel", "Timings", "Contact"];

const QuickChips = ({ onSelect }: { onSelect: (text: string) => void }) => (
  <div className="flex flex-wrap gap-2 px-4 py-2">
    {chips.map((chip) => (
      <button
        key={chip}
        onClick={() => onSelect(chip)}
        className="px-3 py-1.5 text-xs font-medium rounded-full border border-border bg-card text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
      >
        {chip}
      </button>
    ))}
  </div>
);

export default QuickChips;
