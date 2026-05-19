"use client";

import { useAccount } from "wagmi";
import { cn } from "@/lib/cn";
import { TIERS, UPGRADE_DELTA, type TierId } from "@/lib/tiers";
import { PAYMENT_METHODS, type PaymentMethodId } from "@/lib/payments";
import { truncateAddress } from "@/lib/formatting";
import { Field, StatusBadge } from "@/components/shared";
import { Loader2 } from "lucide-react";

interface OrderSummaryProps {
  readonly tier: TierId;
  readonly paymentMethod: PaymentMethodId;
  readonly upgradeFrom?: TierId;
  readonly onConfirm: () => void;
  readonly isSubmitting: boolean;
  readonly className?: string;
}

export function OrderSummary({
  tier,
  paymentMethod,
  upgradeFrom,
  onConfirm,
  isSubmitting,
  className,
}: OrderSummaryProps) {
  const { address } = useAccount();
  const tierConfig = TIERS[tier];
  const payment = PAYMENT_METHODS.find((m) => m.id === paymentMethod);
  const isUpgrade = Boolean(upgradeFrom);
  const price = isUpgrade ? UPGRADE_DELTA : tierConfig.price;

  return (
    <div className={cn("surface flex flex-col gap-5 p-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[rgb(var(--fg-primary))]">
          Order Summary
        </h3>
        {isUpgrade && <StatusBadge label="Upgrade" variant="warning" />}
      </div>

      <div className="flex flex-col gap-3">
        <Field label="NFT Tier" value={tierConfig.name} />
        <Field label="NFT" value={tierConfig.nftName} />
        <Field label="Payment" value={payment?.name ?? paymentMethod} />
        {address && (
          <Field label="Wallet" value={truncateAddress(address)} />
        )}
        {isUpgrade && upgradeFrom && (
          <Field label="Upgrading from" value={TIERS[upgradeFrom].name} />
        )}

        <div className="my-1 border-t border-[rgb(var(--border-subtle))]" />

        <Field
          label="Total"
          value={
            <span className="text-lg font-bold text-[rgb(var(--fg-primary))]">
              ${price.toLocaleString()}
            </span>
          }
        />
      </div>

      <button
        type="button"
        onClick={onConfirm}
        disabled={isSubmitting}
        className={cn(
          "btn w-full",
          tier === "legend" ? "btn-gold" : "btn-primary",
        )}
      >
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating order...
          </span>
        ) : (
          `Confirm — $${price.toLocaleString()}`
        )}
      </button>
    </div>
  );
}
