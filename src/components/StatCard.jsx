import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function StatCard({ title, value, delta, icon: Icon, positive = true, strip = [35, 55, 42, 76, 60, 88, 74] }) {
  return (
    <div className="card group overflow-hidden p-5 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70 dark:hover:shadow-black/30">
      <div className="flex items-start justify-between">
        <div className="rounded-2xl bg-slate-100 p-3 text-accent transition group-hover:bg-accent group-hover:text-white dark:bg-slate-900">
          <Icon size={22} />
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${positive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {delta}
        </span>
      </div>
      <p className="mt-5 text-sm font-bold text-slate-500">{title}</p>
      <h3 className="mt-1 font-heading text-3xl font-black text-slate-950 dark:text-white">{value}</h3>
      <div className="mt-5 flex h-10 items-end gap-1.5">
        {strip.map((height, index) => <span key={index} className="flex-1 rounded-t-lg bg-gradient-to-t from-accent to-violetAccent opacity-80 transition-all group-hover:opacity-100" style={{ height: `${height}%` }} />)}
      </div>
    </div>
  );
}
