const tones = {
  accent: "border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  info: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  danger: "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  neutral: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
};

export default function Badge({ children, tone = "neutral", className = "" }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${tones[tone]} ${className}`}>{children}</span>;
}
