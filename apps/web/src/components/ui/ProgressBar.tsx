interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
}

export function ProgressBar({ value, max, className = '' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-16 h-[3px] bg-card-2 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-success"
          style={{ width: `${pct}%`, opacity: 0.7 }}
        />
      </div>
      <span className="text-[10px] text-ink-4 font-mono num">{pct}%</span>
    </div>
  );
}
