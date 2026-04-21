import { AlertCircle, CheckCheck, Clock, RotateCcw } from "lucide-react";

export default function MessageBubble({ message, onRetry }) {
  const isCustomer = message.sender === "customer";
  const isSystem = message.sender === "system";

  if (isSystem) {
    return (
      <div className="mx-auto max-w-[86%] rounded-full bg-slate-100 px-4 py-2 text-center text-xs font-bold text-slate-500 dark:bg-slate-900">
        {message.text}
      </div>
    );
  }

  return (
    <div className={`flex ${isCustomer ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[84%] rounded-2xl px-4 py-3 shadow-sm ${
          isCustomer
            ? "rounded-bl-md bg-accent text-white shadow-indigo-500/20"
            : "rounded-br-md border border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
        {!!message.attachments?.length && (
          <div className="mt-2 grid gap-1">
            {message.attachments.map((file) => (
              <span key={file.id} className="rounded-xl bg-white/15 px-2 py-1 text-xs font-bold">
                {file.name}
              </span>
            ))}
          </div>
        )}
        <div className={`mt-2 flex items-center gap-1 text-[10px] ${isCustomer ? "text-white/75" : "text-slate-400"}`}>
          <span>{formatTime(message.createdAt)}</span>
          {message.status === "sending" && <Clock size={12} />}
          {message.status === "sent" && isCustomer && <CheckCheck size={12} />}
          {message.status === "failed" && (
            <button type="button" onClick={() => onRetry(message)} className="inline-flex items-center gap-1 text-red-200">
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
