"use client";

import { cn } from "@/lib/cn";
import { formatACTX, formatUSDC, poolPercentage } from "@/lib/formatting";
import { Field } from "@/components/shared/Field";
import { TokenAmount } from "@/components/shared/TokenAmount";
import { USDCAmount } from "@/components/shared/USDCAmount";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PresaleState } from "@/lib/constants";
import type { PresaleStats } from "@/types";

interface AdminMetricsProps {
  readonly presaleStats: PresaleStats | undefined;
  readonly presaleState: PresaleState;
  readonly className?: string;
}

function stateVariant(state: PresaleState): "success" | "warning" | "error" | "neutral" {
  switch (state) {
    case PresaleState.OPEN:
      return "success";
    case PresaleState.NOT_STARTED:
    case PresaleState.SPRINT_PHASE:
      return "warning";
    case PresaleState.CLOSED:
    case PresaleState.COMPLETED:
      return "error";
    default:
      return "neutral";
  }
}

export function AdminMetrics({ presaleStats, presaleState, className }: AdminMetricsProps) {
  if (!presaleStats) {
    return (
      <div className={cn("surface rounded-xl p-5", className)}>
        <p className="text-sm text-[rgb(var(--fg-muted))]">Loading metrics...</p>
      </div>
    );
  }

  const fillPct = poolPercentage(
    presaleStats.poolTotal - presaleStats.poolRemaining,
    presaleStats.poolTotal,
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Status row */}
      <div className="flex items-center gap-3">
        <StatusBadge label={presaleState} variant={stateVariant(presaleState)} />
        {presaleStats.paused && <StatusBadge label="Paused" variant="error" />}
      </div>

      {/* Metrics grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Pool Total"
          value={<TokenAmount amount={presaleStats.poolTotal} />}
        />
        <MetricCard
          label="Pool Remaining"
          value={<TokenAmount amount={presaleStats.poolRemaining} />}
        />
        <MetricCard
          label="Pool Filled"
          value={`${fillPct.toFixed(1)}%`}
        />
        <MetricCard
          label="Tokens Sold"
          value={<TokenAmount amount={presaleStats.totalTokensSold} />}
        />
        <MetricCard
          label="USDC Raised"
          value={<USDCAmount amount={presaleStats.totalUsdcRaised} />}
        />
        <MetricCard
          label="Participants"
          value={presaleStats.totalParticipants.toString()}
        />
      </div>

      {/* Timestamps */}
      <div className="surface rounded-xl p-4">
        <div className="space-y-2">
          <Field
            label="Scheduled Open"
            value={
              presaleStats.scheduledOpenTime > 0n
                ? new Date(Number(presaleStats.scheduledOpenTime) * 1000).toLocaleString()
                : "Not scheduled"
            }
          />
          <Field
            label="Opened At"
            value={
              presaleStats.presaleOpenTime > 0n
                ? new Date(Number(presaleStats.presaleOpenTime) * 1000).toLocaleString()
                : "Not yet"
            }
          />
          <Field
            label="Contract Version"
            value={`v${presaleStats.version.toString()}`}
          />
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  readonly label: string;
  readonly value: React.ReactNode;
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="surface rounded-xl p-4">
      <p className="text-xs text-[rgb(var(--fg-muted))]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[rgb(var(--fg-primary))]">
        {value}
      </p>
    </div>
  );
}
