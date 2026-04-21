import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

export default function Pagination({ page, totalPages, onPage }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 dark:border-slate-800">
      <Button variant="secondary" onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1}>
        <ChevronLeft size={16} />
        السابق
      </Button>
      <span className="text-sm font-bold text-slate-500">صفحة {page} من {totalPages}</span>
      <Button variant="secondary" onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
        التالي
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
