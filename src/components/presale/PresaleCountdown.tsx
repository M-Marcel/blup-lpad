"use client";

import { useMemo } from "react";
import { Countdown } from "@/components/shared/Countdown";
import { usePresaleState } from "@/hooks/usePresaleContract";
import { PresaleState } from "@/lib/constants";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/cn";

interface PresaleCountdownProps {
  readonly className?: string;
}

export function PresaleCountdown({ className }: PresaleCountdownProps) {
  const presaleState = useAppStore((s) => s.presaleState);
  const { data } = usePresaleState();

  const targetDate = useMemo(() => {
    if (!data) return null;

    if (presaleState === PresaleState.NOT_STARTED && data.scheduledOpenTime > 0n) {
      return new Date(Number(data.scheduledOpenTime) * 1000);
    }

    if (presaleState === PresaleState.OPEN && data.presaleOpenTime > 0n) {
      const closeTime = Number(data.presaleOpenTime) + 7 * 86400;
      return new Date(closeTime * 1000);
    }

    return null;
  }, [presaleState, data]);

  const label = useMemo(() => {
    if (presaleState === PresaleState.NOT_STARTED) return "Presale opens in";
    if (presaleState === PresaleState.OPEN) return "Presale closes in";
    return "";
  }, [presaleState]);

  if (!targetDate) return null;

  return (
    <div className={cn("surface rounded-xl p-4", className)}>
      <Countdown targetDate={targetDate} label={label} />
    </div>
  );
}
