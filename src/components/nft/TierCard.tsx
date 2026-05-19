"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Crown, Shield, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Tier, TierId } from "@/lib/tiers";
import type { SupplyResponse } from "@/types/nft";

interface TierCardProps {
  readonly tier: Tier;
  readonly supply: SupplyResponse | null;
  readonly selected?: boolean;
  readonly onSelect?: (id: TierId) => void;
  readonly disabled?: boolean;
  readonly className?: string;
}

function tierRemaining(tier: Tier, supply: SupplyResponse | null): number | null {
  if (!supply) return null;
  if (tier.id === "elite") return supply.eliteAvailable;
  return supply.remaining - supply.eliteAvailable;
}

export function TierCard({
  tier,
  supply,
  selected = false,
  onSelect,
  disabled = false,
  className,
}: TierCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const remaining = tierRemaining(tier, supply);
  const isGold = tier.accent === "gold";
  const TierIcon = isGold ? Crown : Shield;

  return (
    <motion.button
      type="button"
      onClick={() => onSelect?.(tier.id)}
      disabled={disabled || remaining === 0}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn(
        isGold ? "surface-gold" : "surface",
        "relative flex flex-col items-start gap-5 p-6 text-left transition-shadow",
        selected && "ring-2 ring-[rgb(var(--nft-accent))]",
        (disabled || remaining === 0) && "pointer-events-none opacity-50",
        className,
      )}
    >
      {isGold && (
        <span className="chip absolute right-4 top-4 flex items-center gap-1 text-[rgb(var(--gold))]">
          <Sparkles className="h-3 w-3" />
          Recommended
        </span>
      )}

      <div className={cn("flex items-center gap-3", isGold ? "text-[rgb(var(--gold))]" : "text-[rgb(var(--nft-accent))]")}>
        <TierIcon className="h-6 w-6" />
        <span className="text-lg font-semibold text-[rgb(var(--fg-primary))]">{tier.name}</span>
      </div>

      <div className={cn(isGold ? "nft-frame-gold" : "nft-frame", "mx-auto h-40 w-40")}>
        <div className={cn(isGold ? "shimmer-gold" : "shimmer", "h-full w-full")} />
      </div>

      <p className="text-sm text-[rgb(var(--fg-secondary))]">{tier.tagline}</p>

      <div className="text-3xl font-bold text-[rgb(var(--fg-primary))]">
        ${tier.price.toLocaleString()}
      </div>

      <ul className="flex flex-col gap-2">
        {tier.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2 text-sm text-[rgb(var(--fg-secondary))]">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--nft-accent))]" />
            {perk}
          </li>
        ))}
      </ul>

      {remaining !== null && (
        <div className="mt-auto w-full pt-3 text-xs text-[rgb(var(--fg-muted))]">
          {remaining > 0 ? `${remaining} remaining` : "Sold out"}
        </div>
      )}
    </motion.button>
  );
}
