"use client";

import { cn } from "@/lib/cn";
import { GENESIS_MAX_SUPPLY } from "@/lib/tiers";
import type { SupplyResponse } from "@/types/nft";

interface SupplyMeterProps {
  readonly supply: SupplyResponse | null;
  readonly className?: string;
}

function Bar({
  label,
  minted,
  total,
  accent,
}: {
  readonly label: string;
  readonly minted: number;
  readonly total: number;
  readonly accent: "blue" | "gold";
}) {
  const pct = total > 0 ? Math.min((minted / total) * 100, 100) : 0;
  const nearThreshold = pct >= 80;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[rgb(var(--fg-secondary))]">{label}</span>
        <span className="font-mono text-[rgb(var(--fg-muted))]">
          {minted} / {total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[rgb(var(--bg-overlay))]">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            accent === "gold"
              ? "bg-[rgb(var(--gold))]"
              : "bg-[rgb(var(--nft-accent))]",
            nearThreshold && "animate-pool-pulse",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function SupplyMeter({ supply, className }: SupplyMeterProps) {
  if (!supply) {
    return (
      <div className={cn("flex flex-col gap-4 rounded-xl p-4", className)}>
        <div className="h-4 w-32 animate-pulse rounded bg-[rgb(var(--bg-overlay))]" />
        <div className="h-2 w-full animate-pulse rounded-full bg-[rgb(var(--bg-overlay))]" />
        <div className="h-2 w-full animate-pulse rounded-full bg-[rgb(var(--bg-overlay))]" />
      </div>
    );
  }

  const eliteTotal = supply.totalCap - (supply.totalCap - supply.eliteAvailable - supply.eliteMinted);
  const legendTotal = GENESIS_MAX_SUPPLY - eliteTotal;

  return (
    <div className={cn("surface flex flex-col gap-4 p-5", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[rgb(var(--fg-primary))]">
          Genesis NFT Supply
        </h3>
        <span className="font-mono text-xs text-[rgb(var(--fg-muted))]">
          {supply.minted} / {GENESIS_MAX_SUPPLY} minted
        </span>
      </div>

      <Bar
        label="Elite"
        minted={supply.eliteMinted}
        total={eliteTotal > 0 ? eliteTotal : supply.totalCap}
        accent="blue"
      />
      <Bar
        label="Legend"
        minted={supply.legendMinted}
        total={legendTotal > 0 ? legendTotal : supply.totalCap}
        accent="gold"
      />
    </div>
  );
}
