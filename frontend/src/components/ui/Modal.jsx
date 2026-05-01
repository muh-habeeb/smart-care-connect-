import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

export function Modal({ isOpen, onClose, title, children, className }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm smooth-enter p-4 sm:p-6"
      onClick={onClose}
    >
      <div 
        className={cn("relative w-full max-w-lg bg-slate-900/80 backdrop-blur-3xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden flex flex-col max-h-[90vh]", className)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/50">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto text-slate-200">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
