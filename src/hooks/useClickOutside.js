import { useEffect } from "react";

export function useClickOutside(ref, onClose, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;

    const handleMouseDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [enabled, onClose, ref]);
}
