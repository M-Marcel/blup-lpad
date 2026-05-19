"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { TierId } from "@/lib/tiers";

interface NftPreviewProps {
  readonly tier: TierId;
  readonly tokenId?: number | null;
  readonly imageUrl?: string | null;
  readonly className?: string;
}

export function NftPreview({ tier, tokenId, imageUrl, className }: NftPreviewProps) {
  const shouldReduceMotion = useReducedMotion();
  const isGold = tier === "legend";

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-xs",
        isGold ? "nft-frame-gold" : "nft-frame",
        className,
      )}
    >
      <AnimatePresence mode="wait">
        {imageUrl ? (
          <motion.img
            key="image"
            src={imageUrl}
            alt={`Genesis ${isGold ? "Gold" : "Standard"} NFT`}
            className="aspect-square w-full rounded-xl object-cover"
            initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : (
          <motion.div
            key="placeholder"
            className={cn(
              "flex aspect-square w-full items-center justify-center rounded-xl",
              isGold ? "shimmer-gold" : "shimmer",
            )}
            initial={shouldReduceMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className="text-sm text-[rgb(var(--fg-muted))]">
              {isGold ? "Genesis Gold" : "Genesis Standard"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {tokenId != null && (
        <div className="absolute bottom-3 right-3 rounded-md bg-[rgb(var(--bg-base)/0.8)] px-2 py-1 font-mono text-xs text-[rgb(var(--fg-secondary))]">
          #{tokenId}
        </div>
      )}
    </div>
  );
}
