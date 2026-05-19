"use client";

import { truncateAddress } from "@/lib/formatting";
import { addressUrl } from "@/lib/explorer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TierBadge } from "@/components/presale/TierBadge";
import { ExternalLink } from "lucide-react";
import type { FounderInfo } from "@/types";

interface FounderTableRowProps {
  readonly founder: FounderInfo;
}

function kycVariant(status: string): "success" | "warning" | "error" | "neutral" {
  switch (status) {
    case "approved":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "error";
    default:
      return "neutral";
  }
}

export function FounderTableRow({ founder }: FounderTableRowProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-[rgb(var(--bg-overlay))] px-4 py-3 text-sm">
      <div className="min-w-0 flex-1">
        <a
          href={addressUrl(founder.walletAddress)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-xs text-[rgb(var(--fg-primary))] hover:text-[var(--blessup-green)]"
        >
          {truncateAddress(founder.walletAddress)}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <TierBadge tier={founder.tier} />

      <StatusBadge label={founder.kycStatus} variant={kycVariant(founder.kycStatus)} />

      <StatusBadge
        label={founder.sprintCompleted ? "Sprint ✓" : "Sprint ✗"}
        variant={founder.sprintCompleted ? "success" : "neutral"}
      />

      <div className="w-24 text-right">
        <span className="text-xs text-[rgb(var(--fg-muted))]">
          {founder.tokensPurchased ?? "0"} ACTX
        </span>
      </div>
    </div>
  );
}
