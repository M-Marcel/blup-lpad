"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { CheckCircle2, ArrowRight, Shield } from "lucide-react";

interface SprintCompleteProps {
  readonly markedOnChain: boolean;
  readonly className?: string;
}

export function SprintComplete({ markedOnChain, className }: SprintCompleteProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "surface flex flex-col items-center gap-5 rounded-xl p-8 text-center",
        className,
      )}
      initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--blessup-green)]/10">
        <CheckCircle2 className="h-8 w-8 text-[var(--blessup-green)]" />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-[rgb(var(--fg-primary))]">
          Sprint Complete!
        </h2>
        <p className="mt-2 text-sm text-[rgb(var(--fg-muted))]">
          You&apos;ve completed the Genesis Mind Renewal Sprint. You&apos;re now
          eligible for the presale.
        </p>
      </div>

      {markedOnChain ? (
        <div className="flex items-center gap-2 text-sm text-[var(--blessup-green)]">
          <Shield className="h-4 w-4" />
          <span>Verified on-chain via ProofOfAction</span>
        </div>
      ) : (
        <p className="text-xs text-[rgb(var(--fg-muted))]">
          Awaiting on-chain verification...
        </p>
      )}

      <a href="/presale" className="btn btn-primary mt-2">
        <ArrowRight className="h-4 w-4" />
        Proceed to Presale
      </a>
    </motion.div>
  );
}
