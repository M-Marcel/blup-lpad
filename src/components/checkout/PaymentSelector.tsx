"use client";

import { CreditCard, Coins } from "lucide-react";
import { cn } from "@/lib/cn";
import { PAYMENT_METHODS, type PaymentMethodId } from "@/lib/payments";
import { StatusBadge } from "@/components/shared";

interface PaymentSelectorProps {
  readonly selected: PaymentMethodId;
  readonly onSelect: (method: PaymentMethodId) => void;
  readonly className?: string;
}

const ICONS: Record<PaymentMethodId, typeof CreditCard> = {
  stripe: CreditCard,
  nowpayments: Coins,
};

export function PaymentSelector({ selected, onSelect, className }: PaymentSelectorProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <h3 className="text-sm font-semibold text-[rgb(var(--fg-primary))]">
        Payment Method
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
        {PAYMENT_METHODS.map((method) => {
          const Icon = ICONS[method.id];
          const isSelected = selected === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelect(method.id)}
              className={cn(
                "surface flex flex-col gap-2 p-4 text-left transition-shadow",
                isSelected && "ring-2 ring-[rgb(var(--nft-accent))]",
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-[rgb(var(--nft-accent))]" />
                  <span className="text-sm font-medium text-[rgb(var(--fg-primary))]">
                    {method.name}
                  </span>
                </div>
                <StatusBadge label={method.mode} variant="info" />
              </div>

              <p className="text-xs text-[rgb(var(--fg-muted))]">
                {method.subtitle}
              </p>

              <div className="flex flex-wrap gap-1">
                {method.options.map((opt) => (
                  <span key={opt} className="chip text-2xs">
                    {opt}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
