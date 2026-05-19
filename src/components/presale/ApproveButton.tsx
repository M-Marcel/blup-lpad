"use client";

import { TransactionStatus } from "@/components/shared/TransactionStatus";
import { formatUSDC } from "@/lib/formatting";
import { Loader2, CheckCircle2 } from "lucide-react";

interface ApproveButtonProps {
  readonly usdcAmount: bigint;
  readonly isApproving: boolean;
  readonly isApproveConfirming: boolean;
  readonly isApproveConfirmed: boolean;
  readonly approveHash: string | null;
  readonly onApprove: () => void;
  readonly disabled?: boolean;
}

export function ApproveButton({
  usdcAmount,
  isApproving,
  isApproveConfirming,
  isApproveConfirmed,
  approveHash,
  onApprove,
  disabled = false,
}: ApproveButtonProps) {
  const isProcessing = isApproving || isApproveConfirming;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
            isApproveConfirmed
              ? "bg-[var(--blessup-green)] text-white"
              : "border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-overlay))] text-[rgb(var(--fg-muted))]"
          }`}
        >
          {isApproveConfirmed ? "✓" : "1"}
        </span>
        <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--fg-muted))]">
          Approve USDC
        </p>
      </div>

      {isApproveConfirmed ? (
        <div className="flex items-center gap-2 text-sm text-[var(--blessup-green)]">
          <CheckCircle2 className="h-4 w-4" />
          <span>USDC approved</span>
        </div>
      ) : (
        <button
          onClick={onApprove}
          disabled={disabled || isProcessing}
          className="btn w-full"
        >
          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isApproving
            ? "Confirm in wallet..."
            : isApproveConfirming
              ? "Confirming..."
              : `Approve ${formatUSDC(usdcAmount)} USDC`}
        </button>
      )}

      {approveHash && !isApproveConfirmed && (
        <TransactionStatus hash={approveHash} label="USDC Approval" />
      )}
    </div>
  );
}
