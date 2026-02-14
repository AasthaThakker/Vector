"use client";

import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-strong rounded-xl p-6",
        hover && "transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}
