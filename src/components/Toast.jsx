import { Bell, CheckCircle2, X, XCircle } from "lucide-react";

export default function Toast({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-5 left-5 z-[70] flex w-[calc(100%-40px)] max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div key={toast.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-300/30 animate-[toastIn_.22s_ease-out] dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30">
          <div className="flex gap-3">
            <div className={toast.type === "success" ? "text-success" : toast.type === "error" ? "text-danger" : "text-accent"}>
              {toast.type === "success" ? <CheckCircle2 size={20} /> : toast.type === "error" ? <XCircle size={20} /> : <Bell size={20} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-slate-950 dark:text-white">{toast.title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{toast.message}</p>
            </div>
            <button aria-label="Close toast" onClick={() => onRemove(toast.id)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
