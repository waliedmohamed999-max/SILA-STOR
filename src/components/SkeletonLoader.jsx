export default function SkeletonLoader({ type = "dashboard" }) {
  if (type === "grid") {
    return (
      <div className="grid animate-pulse gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800" />)}
      </div>
    );
  }

  return (
    <div className="animate-pulse space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-36 rounded-2xl bg-slate-200 dark:bg-slate-800" />)}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="h-96 rounded-2xl bg-slate-200 xl:col-span-2 dark:bg-slate-800" />
        <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}
