import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

interface FieldProps {
  readonly label: string;
  readonly value: ReactNode;
  readonly className?: string;
}

export function Field({ label, value, className }: FieldProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <span className="text-sm text-[rgb(var(--fg-muted))]">{label}</span>
      <span className="text-sm font-medium text-[rgb(var(--fg-primary))]">{value}</span>
    </div>
  );
}
