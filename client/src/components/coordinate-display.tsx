import { parseCoordinate, validateCoordinateFormat } from "@/lib/inventory-math";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CoordinateDisplayProps {
  value: string;
  label?: string;
  className?: string;
}

export function CoordinateDisplay({ value, label, className }: CoordinateDisplayProps) {
  let parsed = null;
  let isValid = false;

  try {
    if (value.length === 5) {
      parsed = parseCoordinate(value);
      isValid = true;
    }
  } catch (e) {
    isValid = false;
  }

  const parts = [
    { label: "RACK", value: parsed?.rack ?? "-", char: value[0] ?? "", desc: "1-52 (a-Z)" },
    { label: "SHELF", value: parsed?.shelf ?? "-", char: value[1] ?? "", desc: "1-20 (a-t)" },
    { label: "TRAY", value: parsed?.tray ?? "-", char: value[2] ?? "", desc: "1-4" },
    { label: "BIN", value: parsed?.bin ?? "-", char: value[3] ?? "", desc: "1-15 (a-o)" },
    { label: "ITEM", value: parsed?.item ?? "-", char: value[4] ?? "", desc: "1-5" },
  ];

  return (
    <div className={cn("p-6 bg-slate-900 rounded-xl text-white shadow-xl shadow-slate-900/10", className)}>
      {label && <div className="text-slate-400 text-xs font-bold tracking-wider mb-4 uppercase">{label}</div>}
      
      <div className="grid grid-cols-5 gap-2">
        {parts.map((part, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="relative mb-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={part.char || "empty"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "w-12 h-14 rounded-lg flex items-center justify-center text-3xl font-mono font-bold border-2",
                    isValid 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : part.char 
                        ? "bg-slate-800 border-red-500/50 text-red-400" 
                        : "bg-slate-800 border-slate-700 text-slate-500"
                  )}
                >
                  {part.char || "-"}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="text-[10px] text-slate-400 font-bold tracking-widest">{part.label}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">{isValid ? part.value : part.desc}</div>
          </div>
        ))}
      </div>
      
      {!isValid && value.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="mt-4 text-center text-xs text-red-400 bg-red-950/30 py-2 rounded border border-red-900/50"
        >
          Invalid format. Required: R(a-Z) S(a-t) T(1-4) B(a-o) I(1-5)
        </motion.div>
      )}
    </div>
  );
}
