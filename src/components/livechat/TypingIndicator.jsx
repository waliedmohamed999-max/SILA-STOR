export default function TypingIndicator({ agentName = "AI" }) {
  return (
    <div className="flex justify-end">
      <div className="rounded-2xl rounded-br-md border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-2 text-[11px] font-bold text-slate-400">{agentName} يكتب الآن</div>
        <div className="flex gap-1">
          {[0, 1, 2].map((item) => (
            <span
              key={item}
              className="h-2 w-2 animate-bounce rounded-full bg-indigo-400"
              style={{ animationDelay: `${item * 120}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
