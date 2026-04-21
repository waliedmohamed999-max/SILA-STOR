import { AlertCircle, CheckCheck, Clock, FileText, RotateCcw } from "lucide-react";

export default function MessageBubble({ message, onRetry }) {
  const isCustomer = message.sender === "customer";
  const isSystem = message.sender === "system";

  if (isSystem) {
    return (
      <div className="mx-auto max-w-[86%] rounded-full bg-[#e1f3fb] px-4 py-2 text-center text-xs font-bold text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
        {message.text}
      </div>
    );
  }

  return (
    <div className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[82%] px-3 py-2 shadow-sm ${
          isCustomer
            ? "rounded-[18px] rounded-tr-sm bg-[#dcf8c6] text-slate-950 shadow-emerald-900/10 after:absolute after:right-[-7px] after:top-0 after:h-3 after:w-3 after:bg-[#dcf8c6] after:[clip-path:polygon(0_0,100%_0,0_100%)]"
            : "rounded-[18px] rounded-tl-sm bg-white text-slate-950 after:absolute after:left-[-7px] after:top-0 after:h-3 after:w-3 after:bg-white after:[clip-path:polygon(0_0,100%_0,100%_100%)] dark:bg-slate-900 dark:text-white dark:after:bg-slate-900"
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
        {!!message.attachments?.length && (
          <div className="mt-2 grid gap-1">
            {message.attachments.map((file) => (
              <span key={file.id} className={`inline-flex items-center gap-2 rounded-xl px-2 py-1 text-xs font-bold ${isCustomer ? "bg-emerald-600/10 text-emerald-900" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                <FileText size={13} />
                {file.name}
              </span>
            ))}
          </div>
        )}
        <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${isCustomer ? "text-emerald-900/55" : "text-slate-400"}`}>
          <span>{formatTime(message.createdAt)}</span>
          {message.status === "sending" && <Clock size={12} />}
          {message.status === "sent" && isCustomer && <CheckCheck size={13} className="text-[#34b7f1]" />}
          {message.status === "failed" && (
            <button type="button" onClick={() => onRetry(message)} className="inline-flex items-center gap-1 text-red-500">
              <AlertCircle size={12} />
              إعادة
              <RotateCcw size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(value) {
  return new Intl.DateTimeFormat("ar-SA", { hour: "2-digit", minute: "2-digit" }).format(value);
}
