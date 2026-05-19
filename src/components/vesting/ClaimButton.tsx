"use client";

import { TransactionStatus } from "@/components/shared/TransactionStatus";
import { formatACTX } from "@/lib/formatting";
import { cn } from "@/lib/cn";
import { Loader2, CheckCircle2, Gift } from "lucide-react";

interface ClaimButtonProps {
  readonly claimableBalance: bigint;
  readonly canClaim: boolean;
  readonly tgeTriggered: boolean;
  readonly isClaiming: boolean;
  readonly isConfirming: boolean;
  readonly isConfirmed: boolean;
  readonly claimHash: string | null;
  readonly onClaim: () => void;
  readonly className?: string;
}

export function ClaimButton({
  claimableBalance,
  canClaim,
  tgeTriggered,
  isClaiming,
  isConfirming,
  isConfirmed,
  claimHash,
  onClaim,
  className,
}: ClaimButtonProps) {
  const isProcessing = isClaiming || isConfirming;

  const statusText = !tgeTriggered
    ? "TGE not yet triggered"
    : claimableBalance > 0n
      ? `Claim ${formatACTX(claimableBalance, 0)} ACTX`
      : "No tokens to claim";

  return (
    <div className={cn("surface space-y-3 rounded-xl p-5", className)}>
      <div className="flex items-center gap-2">
        <Gift className="h-4 w-4 text-[var(--blessup-gold)]" />
        <p className="text-sm font-semibold text-[rgb(var(--fg-primary))]">
          Claim Tokens
        </p>
      </div>

      <p className="text-xs text-[rgb(var(--fg-muted))]">
        {claimableBalance > 0n
          ? `${formatACTX(claimableBalance, 0)} ACTX available to claim`
          : tgeTriggered
            ? "No tokens available to claim yet"
            : "TGE has not been triggered yet"}
      </p>

      {isConfirmed ? (
        <div className="flex items-center gap-2 text-sm text-[var(--blessup-green)]">
          <CheckCircle2 className="h-4 w-4" />
          <span>Tokens claimed successfully</span>
        </div>
      ) : (
        <button
          onClick={onClaim}
          disabled={!canClaim || isProcessing}
          className="btn btn-primary w-full"
        >
          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isClaiming
            ? "Confirm in wallet..."
            : isConfirming
              ? "Confirming..."
              : statusText}
        </button>
      )}

      {claimHash && !isConfirmed && (
        <TransactionStatus hash={claimHash} label="Claim" />
      )}
    </div>
  );
}
