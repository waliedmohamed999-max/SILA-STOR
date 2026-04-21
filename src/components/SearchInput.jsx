import { Search } from "lucide-react";

export default function SearchInput({ value, onChange, placeholder = "بحث", className = "" }) {
  return (
    <label className={`flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950 ${className}`}>
      <Search size={18} className="text-slate-400" />
      <input
        aria-label={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
      />
    </label>
  );
}
