import { useRef, useState } from "react";
import { useClickOutside } from "../hooks/useClickOutside";
import { useEscapeKey } from "../hooks/useEscapeKey";

export default function Dropdown({ trigger, children, align = "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  useEscapeKey(() => setOpen(false), open);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((value) => !value)}>{trigger}</div>
      {open && (
        <div className={`absolute z-30 mt-3 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-300/30 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/30 ${align === "right" ? "left-0" : "right-0"}`}>
          {children}
        </div>
      )}
    </div>
  );
}
