"use client";

import { useMemo } from "react";
import { formatACTX } from "@/lib/formatting";
import { Field } from "@/components/shared/Field";
import { TokenAmount } from "@/components/shared/TokenAmount";
import { USDCAmount } from "@/components/shared/USDCAmount";
import { PRESALE } from "@/lib/constants";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { VestingData } from "@/types";

interface VestingScheduleProps {
  readonly vestingData: VestingData;
  readonly className?: string;
}

interface Milestone {
  readonly label: string;
  readonly day: number;
  readonly percent: number;
  readonly amount: bigint;
  readonly isPassed: boolean;
}

export function VestingSchedule({ vestingData, className }: VestingScheduleProps) {
  const {
    totalPurchased,
    totalSpentUsdc,
    totalClaimed,
    claimableBalance,
    lockedBalance,
    currentDay,
    percentVested,
    tgeTriggered,
    dailyVestRate,
  } = vestingData;

  const milestones = useMemo((): readonly Milestone[] => {
    if (totalPurchased === 0n) return [];

    const tgeAmount = (totalPurchased * 25n) / 100n;

    return [
      {
        label: "TGE Unlock",
        day: 0,
        percent: 25,
        amount: tgeAmount,
        isPassed: tgeTriggered,
      },
      {
        label: "Day 30",
        day: 30,
        percent: 50,
        amount: (totalPurchased * 50n) / 100n,
        isPassed: currentDay >= 30,
      },
      {
        label: "Day 60",
        day: 60,
        percent: 75,
        amount: (totalPurchased * 75n) / 100n,
        isPassed: currentDay >= 60,
      },
      {
        label: `Day ${PRESALE.VESTING_DURATION_DAYS}`,
        day: PRESALE.VESTING_DURATION_DAYS,
        percent: 100,
        amount: totalPurchased,
        isPassed: currentDay >= PRESALE.VESTING_DURATION_DAYS,
      },
    ];
  }, [totalPurchased, currentDay, tgeTriggered]);

  if (totalPurchased === 0n) return null;

  return (
    <div className={cn("space-y-5", className)}>
      {/* Summary stats */}
      <div className="surface rounded-xl p-5">
        <h3 className="mb-3 text-base font-semibold text-[rgb(var(--fg-primary))]">
          Vesting Overview
        </h3>
        <div className="space-y-2">
          <Field
            label="Total Purchased"
            value={<TokenAmount amount={totalPurchased} showIcon />}
          />
          <Field
            label="Total Spent"
            value={<USDCAmount amount={totalSpentUsdc} showIcon />}
          />
          <Field
            label="Claimed"
            value={<TokenAmount amount={totalClaimed} />}
          />
          <Field
            label="Claimable Now"
            value={
              <span className={claimableBalance > 0n ? "text-[var(--blessup-green)]" : ""}>
                <TokenAmount amount={claimableBalance} />
              </span>
            }
          />
          <Field
            label="Locked"
            value={<TokenAmount amount={lockedBalance} />}
          />
          <Field label="Daily Vest Rate" value={<TokenAmount amount={dailyVestRate} />} />
        </div>

        {/* Progress bar */}
        <div className="mt-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-[rgb(var(--fg-muted))]">
            <span>
              Day {currentDay} / {PRESALE.VESTING_DURATION_DAYS}
            </span>
            <span>{percentVested.toFixed(1)}% vested</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[rgb(var(--bg-overlay))]">
            <div
              className="h-full rounded-full bg-[var(--blessup-green)] transition-all duration-700"
              style={{ width: `${Math.min(100, percentVested)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Milestone timeline */}
      <div className="surface rounded-xl p-5">
        <h3 className="mb-3 text-base font-semibold text-[rgb(var(--fg-primary))]">
          Vesting Schedule
        </h3>
        <div className="space-y-2">
          {milestones.map((m) => (
            <div
              key={m.label}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm",
                m.isPassed
                  ? "bg-[var(--blessup-green)]/5"
                  : "bg-[rgb(var(--bg-overlay))]",
              )}
            >
              <div className="flex items-center gap-2">
                {m.isPassed ? (
                  <CheckCircle2 className="h-4 w-4 text-[var(--blessup-green)]" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-[rgb(var(--fg-muted))]/30" />
                )}
                <span
                  className={
                    m.isPassed
                      ? "text-[rgb(var(--fg-primary))]"
                      : "text-[rgb(var(--fg-muted))]"
                  }
                >
                  {m.label}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[rgb(var(--fg-muted))]">{m.percent}%</span>
                <span
                  className={cn(
                    "font-medium",
                    m.isPassed
                      ? "text-[rgb(var(--fg-primary))]"
                      : "text-[rgb(var(--fg-muted))]",
                  )}
                >
                  {formatACTX(m.amount, 0)} ACTX
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
