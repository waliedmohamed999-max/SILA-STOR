import { ChevronDown } from "lucide-react";

export default function Table({ columns, rows, sort, onSort, renderRow, renderMobileCard }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      {renderMobileCard && (
        <div className="grid gap-3 p-3 lg:hidden">
          {rows.length ? rows.map(renderMobileCard) : (
            <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:bg-slate-900">
              لا توجد بيانات مطابقة.
            </div>
          )}
        </div>
      )}
      <div className={`overflow-x-auto ${renderMobileCard ? "hidden lg:block" : ""}`}>
        <table className="w-full min-w-[840px] text-right text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-black">
                  {column.sortable ? (
                    <button onClick={() => onSort(column.key)} className="inline-flex items-center gap-1 rounded-lg transition hover:text-accent">
                      {column.label}
                      <ChevronDown size={14} className={sort?.key === column.key && sort.direction === "asc" ? "rotate-180" : ""} />
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {rows.length ? rows.map(renderRow) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-500">لا توجد بيانات مطابقة.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
