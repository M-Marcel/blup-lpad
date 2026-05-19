"use client";

import { formatUSDC } from "@/lib/formatting";
import { CircleDollarSign } from "lucide-react";
import { cn } from "@/lib/cn";

interface USDCAmountProps {
  readonly amount: bigint;
  readonly showIcon?: boolean;
  readonly className?: string;
}

export function USDCAmount({
  amount,
  showIcon = false,
  className,
}: USDCAmountProps) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {showIcon && <CircleDollarSign className="h-4 w-4 text-[rgb(var(--fg-muted))]" />}
      <span className="font-semibold">{formatUSDC(amount)}</span>
    </span>
  );
}
