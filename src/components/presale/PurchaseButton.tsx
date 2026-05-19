"use client";

import { TransactionStatus } from "@/components/shared/TransactionStatus";
import { formatACTX } from "@/lib/formatting";
import { Loader2 } from "lucide-react";

interface PurchaseButtonProps {
  readonly tokenAmount: bigint;
  readonly isPurchasing: boolean;
  readonly isPurchaseConfirming: boolean;
  readonly purchaseHash: string | null;
  readonly onPurchase: () => void;
  readonly disabled?: boolean;
}

export function PurchaseButton({
  tokenAmount,
  isPurchasing,
  isPurchaseConfirming,
  purchaseHash,
  onPurchase,
  disabled = false,
}: PurchaseButtonProps) {
  const isProcessing = isPurchasing || isPurchaseConfirming;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
            !disabled
              ? "bg-[var(--blessup-green)] text-white"
              : "border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-overlay))] text-[rgb(var(--fg-muted))]"
          }`}
        >
          2
        </span>
        <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--fg-muted))]">
          Purchase
        </p>
      </div>

      <button
        onClick={onPurchase}
        disabled={disabled || isProcessing}
        className="btn btn-primary w-full"
      >
        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPurchasing
          ? "Confirm in wallet..."
          : isPurchaseConfirming
            ? "Confirming..."
            : `Purchase ${formatACTX(tokenAmount, 0)} ACTX`}
      </button>

      {purchaseHash && (
        <TransactionStatus hash={purchaseHash} label="ACTX Purchase" />
      )}
    </div>
  );
}
