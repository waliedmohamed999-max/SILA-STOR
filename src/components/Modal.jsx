import { useRef } from "react";
import { X } from "lucide-react";
import { useClickOutside } from "../hooks/useClickOutside";
import { useEscapeKey } from "../hooks/useEscapeKey";
import Button from "./Button";

export default function Modal({ open, title, onClose, children }) {
  const ref = useRef(null);
  useClickOutside(ref, onClose, open);
  useEscapeKey(onClose, open);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <section ref={ref} className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        {title && (
          <header className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="font-heading text-xl font-black text-slate-950 dark:text-white">{title}</h2>
            <Button aria-label="إغلاق النافذة" variant="secondary" size="icon" onClick={onClose}>
              <X size={18} />
            </Button>
          </header>
        )}
        {children}
      </section>
    </div>
  );
}
