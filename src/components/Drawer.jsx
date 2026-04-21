import { useEscapeKey } from "../hooks/useEscapeKey";

export default function Drawer({ open, onClose, side = "right", children }) {
  useEscapeKey(onClose, open);
  const position = side === "left" ? "left-0 -translate-x-full" : "left-0 -translate-x-full";
  const opened = "translate-x-0";

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />}
      <aside className={`fixed top-0 z-50 h-screen w-full max-w-md border-slate-200 bg-white shadow-2xl transition-transform dark:border-slate-800 dark:bg-slate-950 ${position} ${open ? opened : ""}`}>
        {children}
      </aside>
    </>
  );
}
