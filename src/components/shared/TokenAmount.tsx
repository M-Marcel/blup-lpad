"use client";

import { formatACTX } from "@/lib/formatting";
import { Coins } from "lucide-react";
import { cn } from "@/lib/cn";

interface TokenAmountProps {
  readonly amount: bigint;
  readonly decimals?: number;
  readonly showIcon?: boolean;
  readonly showSymbol?: boolean;
  readonly className?: string;
}

export function TokenAmount({
  amount,
  decimals = 2,
  showIcon = false,
  showSymbol = true,
  className,
}: TokenAmountProps) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {showIcon && <Coins className="h-4 w-4 text-[var(--blessup-green)]" />}
      <span className="font-semibold">{formatACTX(amount, decimals)}</span>
      {showSymbol && <span className="text-[rgb(var(--fg-muted))]">ACTX</span>}
    </span>
  );
}
