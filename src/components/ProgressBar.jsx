export default function ProgressBar({ value, tone = "bg-accent", className = "" }) {
  return (
    <div className={`h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${className}`}>
      <div className={`h-full rounded-full transition-all duration-700 ${tone}`} style={{ width: `${Math.max(4, Math.min(100, value))}%` }} />
    </div>
  );
}
