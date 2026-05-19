"use client";

import { cn } from "@/lib/cn";
import { truncateAddress } from "@/lib/formatting";
import { CheckCircle2, Clock } from "lucide-react";
import type { SprintSession as SprintSessionType } from "@/types";

interface SprintSessionProps {
  readonly session: SprintSessionType;
  readonly index: number;
  readonly className?: string;
}

export function SprintSession({ session, index, className }: SprintSessionProps) {
  const sessionDate = new Date(session.sessionDate);
  const formattedDate = sessionDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg px-4 py-3",
        session.verifiedOnChain
          ? "bg-[var(--blessup-green)]/5"
          : "bg-[rgb(var(--bg-overlay))]",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {session.verifiedOnChain ? (
          <CheckCircle2 className="h-4 w-4 text-[var(--blessup-green)]" />
        ) : (
          <Clock className="h-4 w-4 text-[rgb(var(--fg-muted))]" />
        )}
        <div>
          <p className="text-sm font-medium text-[rgb(var(--fg-primary))]">
            Session {index + 1}
          </p>
          <p className="text-xs text-[rgb(var(--fg-muted))]">{formattedDate}</p>
        </div>
      </div>

      <div className="text-right">
        <p className="font-mono text-xs text-[rgb(var(--fg-muted))]">
          {truncateAddress(session.actionHash)}
        </p>
        {session.verifiedOnChain && (
          <p className="text-xs text-[var(--blessup-green)]">On-chain</p>
        )}
      </div>
    </div>
  );
}
