"use client";

import { cn } from "@/lib/cn";
import { PRESALE } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import type { SprintStatus } from "@/types";

interface SprintTrackerProps {
  readonly sprintStatus: SprintStatus;
  readonly isStarting: boolean;
  readonly onStartSession: () => void;
  readonly className?: string;
}

const REQUIRED_SESSIONS = PRESALE.REQUIRED_RENEW_SESSIONS;
const REQUIRED_DAYS = PRESALE.REQUIRED_DISTINCT_DAYS;

export function SprintTracker({
  sprintStatus,
  isStarting,
  onStartSession,
  className,
}: SprintTrackerProps) {
  const { sessionsCompleted, distinctDays, canDoSessionToday, isComplete, markedOnChain } =
    sprintStatus;

  return (
    <div className={cn("surface space-y-6 rounded-xl p-5", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[rgb(var(--fg-primary))]">
          Mind Renewal Sprint
        </h3>
        {isComplete ? (
          <StatusBadge label="Complete" variant="success" />
        ) : (
          <StatusBadge
            label={`${sessionsCompleted}/${REQUIRED_SESSIONS} sessions`}
            variant="warning"
          />
        )}
      </div>

      <p className="text-sm text-[rgb(var(--fg-muted))]">
        Complete {REQUIRED_SESSIONS} Mind Renewal sessions across {REQUIRED_DAYS}{" "}
        separate days to unlock presale access.
      </p>

      {/* Progress circles */}
      <div className="flex items-center justify-center gap-6">
        {Array.from({ length: REQUIRED_SESSIONS }, (_, i) => {
          const done = i < sessionsCompleted;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors",
                  done
                    ? "border-[var(--blessup-green)] bg-[var(--blessup-green)]/10"
                    : "border-[rgb(var(--fg-muted))]/30 bg-[rgb(var(--bg-overlay))]",
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-6 w-6 text-[var(--blessup-green)]" />
                ) : (
                  <Circle className="h-6 w-6 text-[rgb(var(--fg-muted))]/40" />
                )}
              </div>
              <span className="text-xs text-[rgb(var(--fg-muted))]">
                Session {i + 1}
              </span>
            </div>
          );
        })}
      </div>

      {/* Day tracker */}
      <div className="flex items-center justify-between rounded-lg bg-[rgb(var(--bg-overlay))] px-4 py-3">
        <span className="text-sm text-[rgb(var(--fg-muted))]">Distinct Days</span>
        <span className="text-sm font-semibold text-[rgb(var(--fg-primary))]">
          {distinctDays} / {REQUIRED_DAYS}
        </span>
      </div>

      {/* On-chain status */}
      {markedOnChain && (
        <div className="flex items-center gap-2 rounded-lg bg-[var(--blessup-green)]/5 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-[var(--blessup-green)]" />
          <span className="text-sm text-[var(--blessup-green)]">
            Verified on-chain
          </span>
        </div>
      )}

      {/* Start session CTA */}
      {!isComplete && (
        <button
          onClick={onStartSession}
          disabled={!canDoSessionToday || isStarting}
          className="btn btn-primary w-full"
        >
          {isStarting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isStarting
            ? "Starting session..."
            : canDoSessionToday
              ? "Start Today's Session"
              : "Session already completed today"}
        </button>
      )}
    </div>
  );
}
