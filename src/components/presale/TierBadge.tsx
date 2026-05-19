"use client";

import { cn } from "@/lib/cn";
import { FounderTier } from "@/lib/constants";

interface TierBadgeProps {
  readonly tier: number;
  readonly className?: string;
}

const TIER_CONFIG: Record<
  number,
  { readonly label: string; readonly discount: string; readonly classes: string }
> = {
  [FounderTier.ELITE]: {
    label: "Elite Founder",
    discount: "30% OFF",
    classes:
      "border-[var(--blessup-gold)] bg-[var(--blessup-gold)]/10 text-[var(--blessup-gold)]",
  },
  [FounderTier.LEGEND]: {
    label: "Legend Founder",
    discount: "50% OFF",
    classes:
      "border-[var(--blessup-purple)] bg-[var(--blessup-purple)]/10 text-[var(--blessup-purple)]",
  },
};

export function TierBadge({ tier, className }: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.classes,
        className,
      )}
    >
      {config.label} &mdash; {config.discount}
    </span>
  );
}
