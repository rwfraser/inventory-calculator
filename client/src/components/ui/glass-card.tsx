import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-2xl border border-border/60 shadow-lg",
      "transition-all duration-300",
      className
    )}>
      {children}
    </div>
  );
}
