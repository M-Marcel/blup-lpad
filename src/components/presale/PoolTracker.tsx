"use client";

import { useState, useEffect, useCallback } from "react";
import { usePresaleState } from "@/hooks/usePresaleContract";
import { useAppStore } from "@/store/useAppStore";
import { formatACTX, poolPercentage } from "@/lib/formatting";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

interface PoolTrackerProps {
  readonly className?: string;
}

function getBarColor(remainingPercent: number): string {
  if (remainingPercent > 50) return "bg-[var(--blessup-green)]";
  if (remainingPercent > 25) return "bg-[var(--blessup-gold)]";
  return "bg-rose-500";
}

export function PoolTracker({ className }: PoolTrackerProps) {
  const { data, isLoading } = usePresaleState();
  const lastPurchaseTimestamp = useAppStore((s) => s.lastPurchaseTimestamp);
  const recentPurchases = useAppStore((s) => s.recentPurchases);

  const [isPulsing, setIsPulsing] = useState(false);
  const [floatAmount, setFloatAmount] = useState<string | null>(null);

  useEffect(() => {
    if (!lastPurchaseTimestamp || recentPurchases.length === 0) return;
    const latest = recentPurchases[0];
    if (!latest) return;

    setIsPulsing(true);
    setFloatAmount(formatACTX(latest.amount, 0));
  }, [lastPurchaseTimestamp, recentPurchases]);

  const handlePulseEnd = useCallback(() => {
    setIsPulsing(false);
  }, []);

  const handleFloatEnd = useCallback(() => {
    setFloatAmount(null);
  }, []);

  if (isLoading || !data) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Loader2 className="h-4 w-4 animate-spin text-[rgb(var(--fg-muted))]" />
        <span className="text-sm text-[rgb(var(--fg-muted))]">
          Loading pool data...
        </span>
      </div>
    );
  }

  const { totalTokensSold, poolTotal, poolRemaining } = data;
  const remainingPercent = poolPercentage(poolRemaining, poolTotal);
  const soldPercent = poolTotal > 0n ? 100 - remainingPercent : 0;
  const barColor = getBarColor(remainingPercent);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-[rgb(var(--fg-muted))]">Pool Progress</span>
        <span className="font-medium text-[rgb(var(--fg-primary))]">
          {formatACTX(poolRemaining, 0)} of {formatACTX(poolTotal, 0)} ACTX
          remaining
        </span>
      </div>

      <div className="relative">
        <div
          className={isPulsing ? "animate-pool-pulse" : ""}
          onAnimationEnd={handlePulseEnd}
        >
          <div className="h-4 w-full overflow-hidden rounded-full bg-[rgb(var(--bg-overlay))]">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                barColor,
              )}
              style={{ width: `${soldPercent}%` }}
            />
          </div>
        </div>

        {floatAmount && (
          <span
            className="animate-float-up pointer-events-none absolute -top-1 right-0 text-xs font-semibold text-[var(--blessup-green)]"
            onAnimationEnd={handleFloatEnd}
          >
            -{floatAmount} ACTX
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-[rgb(var(--fg-muted))]">
        <span>{formatACTX(totalTokensSold, 0)} ACTX sold</span>
        <span>{soldPercent.toFixed(1)}% filled</span>
      </div>
    </div>
  );
}
