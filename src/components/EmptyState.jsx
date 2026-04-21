import { Search } from "lucide-react";

export default function EmptyState({ title, text, action }) {
  return (
    <div className="card flex min-h-56 flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
        <Search size={26} />
      </div>
      <h3 className="font-heading text-lg font-bold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
