"use client";

import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { TIERS, type TierId } from "@/lib/tiers";
import { useNftSupply } from "@/hooks/useNftSupply";
import { TierCard, SupplyMeter } from "@/components/nft";

const TIER_ORDER: readonly TierId[] = ["elite", "legend"] as const;

export default function NftPage() {
  const router = useRouter();
  const { supply } = useNftSupply();
  const shouldReduceMotion = useReducedMotion();

  function handleSelect(id: TierId) {
    router.push(`/nft/checkout?tier=${id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10">
      <motion.div
        className="flex flex-col items-center gap-3 text-center"
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="chip inline-flex items-center gap-1.5 text-2xs">
          <Sparkles className="h-3 w-3 text-[rgb(var(--gold))]" />
          Genesis Collection
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-[rgb(var(--fg-primary))] sm:text-4xl">
          Become a BlessUP Founder
        </h1>
        <p className="max-w-xl text-sm text-[rgb(var(--fg-secondary))]">
          Mint a Genesis NFT to unlock your founder license, dashboard access,
          and early-stage perks in the BlessUP Network.
        </p>
      </motion.div>

      <div className={cn("grid gap-6", "sm:grid-cols-2")}>
        {TIER_ORDER.map((id, i) => (
          <motion.div
            key={id}
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.15 * (i + 1),
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <TierCard
              tier={TIERS[id]}
              supply={supply}
              onSelect={handleSelect}
              className="h-full"
            />
          </motion.div>
        ))}
      </div>

      <SupplyMeter supply={supply} className="mx-auto w-full max-w-lg" />
    </div>
  );
}
