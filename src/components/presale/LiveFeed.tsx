"use client";

import { useAppStore } from "@/store/useAppStore";
import { formatACTX, formatUSDC, truncateAddress } from "@/lib/formatting";
import { txUrl } from "@/lib/explorer";
import { cn } from "@/lib/cn";
import { ExternalLink, Radio } from "lucide-react";
import type { RecentPurchase } from "@/types";

const TIER_NAMES: Record<number, string> = { 1: "Elite", 2: "Legend" };
const TIER_COLORS: Record<number, string> = {
  1: "bg-[var(--blessup-gold)]/10 text-[var(--blessup-gold)]",
  2: "bg-[var(--blessup-purple)]/10 text-[var(--blessup-purple)]",
};

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function PurchaseItem({
  purchase,
  isNew,
}: {
  readonly purchase: RecentPurchase;
  readonly isNew: boolean;
}) {
  const tierName = TIER_NAMES[purchase.tier];
  const tierColor = TIER_COLORS[purchase.tier] ?? "";

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-lg border border-[rgb(var(--border-primary))] px-3 py-2",
        isNew && "animate-slide-in-top",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-[rgb(var(--fg-muted))]">
          {truncateAddress(purchase.buyer)}
        </span>
        {tierName && (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              tierColor,
            )}
          >
            {tierName}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-[rgb(var(--fg-primary))]">
          {formatACTX(purchase.amount, 0)} ACTX
        </span>
        <span className="text-xs text-[rgb(var(--fg-muted))]">
          {formatUSDC(purchase.usdcPaid)}
        </span>
        <span className="text-xs text-[rgb(var(--fg-muted))]">
          {timeAgo(purchase.timestamp)}
        </span>
        {purchase.txHash && (
          <a
            href={txUrl(purchase.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[rgb(var(--fg-muted))] transition-colors hover:text-[rgb(var(--fg-primary))]"
            aria-label="View on explorer"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

interface LiveFeedProps {
  readonly className?: string;
}

export function LiveFeed({ className }: LiveFeedProps) {
  const recentPurchases = useAppStore((s) => s.recentPurchases);
  const lastPurchaseTimestamp = useAppStore((s) => s.lastPurchaseTimestamp);

  return (
    <div className={cn("surface rounded-xl p-5", className)}>
      <div className="mb-3 flex items-center gap-2">
        <Radio className="h-4 w-4 text-[var(--blessup-green)]" />
        <h3 className="text-sm font-semibold text-[rgb(var(--fg-primary))]">
          Recent Purchases
        </h3>
        {recentPurchases.length > 0 && (
          <span className="chip ml-auto">{recentPurchases.length}</span>
        )}
      </div>

      {recentPurchases.length === 0 ? (
        <div className="flex items-center justify-center py-6">
          <span className="animate-pulse text-sm text-[rgb(var(--fg-muted))]">
            Waiting for purchases...
          </span>
        </div>
      ) : (
        <div className="max-h-[280px] space-y-1.5 overflow-y-auto">
          {recentPurchases.map((purchase, index) => (
            <PurchaseItem
              key={purchase.txHash}
              purchase={purchase}
              isNew={
                index === 0 &&
                lastPurchaseTimestamp === purchase.timestamp
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
