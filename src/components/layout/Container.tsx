import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

interface ContainerProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("mx-auto max-w-6xl px-6", className)}>
      {children}
    </div>
  );
}
