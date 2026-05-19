"use client";

import { cn } from "@/lib/cn";
import { formatUSDC } from "@/lib/formatting";
import { PRESALE } from "@/lib/constants";

interface PriceDisplayProps {
  readonly tierPrice: bigint;
  readonly tierName: string;
  readonly className?: string;
}

export function PriceDisplay({ tierPrice, tierName, className }: PriceDisplayProps) {
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className="text-lg font-bold text-[rgb(var(--fg-primary))]">
        {formatUSDC(tierPrice)}
      </span>
      <span className="text-sm text-[rgb(var(--fg-muted))]">
        / ACTX ({tierName})
      </span>
      <span className="text-sm text-[rgb(var(--fg-muted))] line-through">
        {formatUSDC(PRESALE.PUBLIC_PRICE)}
      </span>
    </div>
  );
}
