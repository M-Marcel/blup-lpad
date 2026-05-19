"use client";

import { formatUnits } from "viem";
import { Field } from "@/components/shared/Field";
import { TokenAmount } from "@/components/shared/TokenAmount";
import { USDCAmount } from "@/components/shared/USDCAmount";
import { TransactionStatus } from "@/components/shared/TransactionStatus";
import { CheckCircle2, Lock } from "lucide-react";

interface PurchaseReceiptProps {
  readonly purchaseHash: string;
  readonly tokenAmount: bigint;
  readonly usdcCost: bigint;
  readonly tierName: string;
}

function formatLaunchValue(tokenAmount: bigint): string {
  const tokens = parseFloat(formatUnits(tokenAmount, 18));
  const value = tokens * 0.1;
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function PurchaseReceipt({
  purchaseHash,
  tokenAmount,
  usdcCost,
  tierName,
}: PurchaseReceiptProps) {
  return (
    <div className="surface space-y-4 rounded-xl border-[var(--blessup-green)]/30 p-5">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-[var(--blessup-green)]" />
        <h3 className="text-lg font-semibold text-[rgb(var(--fg-primary))]">
          Purchase Successful
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-[rgb(var(--fg-muted))]">Tokens Purchased</p>
          <TokenAmount amount={tokenAmount} showIcon className="text-lg" />
        </div>
        <div>
          <p className="text-xs text-[rgb(var(--fg-muted))]">USDC Spent</p>
          <USDCAmount amount={usdcCost} showIcon className="text-lg" />
        </div>
      </div>

      <Field label="Tier" value={tierName} />
      <Field
        label="Value at $0.10 Launch"
        value={
          <span className="text-[var(--blessup-green)]">
            {formatLaunchValue(tokenAmount)}
          </span>
        }
      />

      <TransactionStatus hash={purchaseHash} label="Purchase" />

      <div className="flex items-start gap-2 rounded-lg bg-[rgb(var(--bg-overlay))] p-3">
        <Lock className="mt-0.5 h-4 w-4 text-[rgb(var(--fg-muted))]" />
        <div className="text-sm text-[rgb(var(--fg-muted))]">
          <p className="font-medium text-[rgb(var(--fg-primary))]">
            Vesting Schedule
          </p>
          <p>
            25% unlocked at TGE. Remaining 75% vests linearly over 90 days.
            Visit the Dashboard to track and claim your tokens.
          </p>
        </div>
      </div>
    </div>
  );
}
