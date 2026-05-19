"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Coins, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatACTX, formatUSDC, poolPercentage } from "@/lib/formatting";
import { PRESALE } from "@/lib/constants";
import { PresaleState } from "@/lib/constants";
import { useAppStore } from "@/store/useAppStore";
import { usePresaleState } from "@/hooks/usePresaleContract";
import { useFounderStatus } from "@/hooks/useFounderStatus";
import { usePresaleEvents } from "@/hooks/usePresaleEvents";
import { PageGuard } from "@/components/shared/PageGuard";
import { Field } from "@/components/shared/Field";
import { TokenAmount } from "@/components/shared/TokenAmount";
import { USDCAmount } from "@/components/shared/USDCAmount";
import { PurchaseForm } from "@/components/presale/PurchaseForm";
import { PoolTracker } from "@/components/presale/PoolTracker";
import { LiveFeed } from "@/components/presale/LiveFeed";
import { PresaleCountdown } from "@/components/presale/PresaleCountdown";
import { TierBadge } from "@/components/presale/TierBadge";

function PresaleContent() {
  const shouldReduceMotion = useReducedMotion();
  const presaleStoreState = useAppStore((s) => s.presaleState);
  const { data: presaleStats } = usePresaleState();
  const { founderStatus } = useFounderStatus();
  usePresaleEvents();

  const isNotStarted = presaleStoreState === PresaleState.NOT_STARTED;
  const isOpen = presaleStoreState === PresaleState.OPEN;
  const isClosed =
    presaleStoreState === PresaleState.CLOSED ||
    presaleStoreState === PresaleState.TGE_TRIGGERED ||
    presaleStoreState === PresaleState.VESTING ||
    presaleStoreState === PresaleState.COMPLETED;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-10">
      {/* Header */}
      <motion.div
        className="flex flex-col items-center gap-3 text-center"
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="chip inline-flex items-center gap-1.5 text-2xs">
          <Coins className="h-3 w-3 text-[var(--blessup-green)]" />
          Genesis Presale
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-[rgb(var(--fg-primary))] sm:text-4xl">
          ACTX Token Presale
        </h1>
        <p className="max-w-xl text-sm text-[rgb(var(--fg-secondary))]">
          Exclusive founder pricing for Genesis NFT holders who completed the
          Mind Renewal Sprint.
        </p>
        {founderStatus.isWhitelisted && (
          <TierBadge tier={founderStatus.tier} className="mt-1" />
        )}
      </motion.div>

      {/* NOT_STARTED state */}
      {isNotStarted && (
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="surface flex max-w-lg flex-col items-center gap-4 rounded-xl p-8 text-center">
            <Clock className="h-10 w-10 text-[var(--blessup-gold)]" />
            <h2 className="text-xl font-semibold text-[rgb(var(--fg-primary))]">
              Presale Opening Soon
            </h2>
            <p className="text-sm text-[rgb(var(--fg-muted))]">
              The Genesis Presale has not opened yet. Ensure your Founder NFT
              and Sprint are ready before launch.
            </p>
            <PresaleCountdown className="mt-2" />
          </div>

          <PresaleInfoGrid presaleStats={presaleStats} />
        </motion.div>
      )}

      {/* OPEN state */}
      {isOpen && (
        <div className="grid gap-8 lg:grid-cols-5">
          <motion.div
            className="lg:col-span-3"
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <PurchaseForm />
          </motion.div>

          <motion.div
            className="flex flex-col gap-6 lg:col-span-2"
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <PresaleCountdown />
            <PoolTracker />
            <LiveFeed />
          </motion.div>
        </div>
      )}

      {/* CLOSED / post-sale state */}
      {isClosed && (
        <motion.div
          className="flex flex-col items-center gap-8"
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="surface flex max-w-lg flex-col items-center gap-4 rounded-xl p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--blessup-green)]/10">
              <CheckCircle2 className="h-7 w-7 text-[var(--blessup-green)]" />
            </div>
            <h2 className="text-xl font-semibold text-[rgb(var(--fg-primary))]">
              Presale Closed
            </h2>
            <p className="text-sm text-[rgb(var(--fg-muted))]">
              The Genesis Presale has concluded. Visit your dashboard to view
              your vesting schedule and claim tokens.
            </p>
            <Link href="/presale/dashboard" className="btn btn-primary mt-2">
              <TrendingUp className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </div>

          {/* Summary stats */}
          {presaleStats && (
            <div className="surface w-full max-w-lg rounded-xl p-5">
              <h3 className="mb-3 text-base font-semibold text-[rgb(var(--fg-primary))]">
                Sale Summary
              </h3>
              <div className="space-y-2">
                <Field
                  label="Total Sold"
                  value={<TokenAmount amount={presaleStats.totalTokensSold} />}
                />
                <Field
                  label="USDC Raised"
                  value={<USDCAmount amount={presaleStats.totalUsdcRaised} />}
                />
                <Field
                  label="Participants"
                  value={presaleStats.totalParticipants.toString()}
                />
                <Field
                  label="Pool Filled"
                  value={`${poolPercentage(
                    presaleStats.poolTotal - presaleStats.poolRemaining,
                    presaleStats.poolTotal,
                  ).toFixed(1)}%`}
                />
              </div>
            </div>
          )}

          {founderStatus.hasPurchased && (
            <div className="surface w-full max-w-lg rounded-xl p-5">
              <h3 className="mb-3 text-base font-semibold text-[rgb(var(--fg-primary))]">
                Your Purchase
              </h3>
              <div className="space-y-2">
                <Field
                  label="Tokens Purchased"
                  value={
                    <TokenAmount amount={founderStatus.tokensPurchased} showIcon />
                  }
                />
                <Field
                  label="Total Spent"
                  value={
                    <USDCAmount amount={founderStatus.totalSpentUsdc} showIcon />
                  }
                />
                <Field label="Tier" value={founderStatus.tierName} />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

interface PresaleInfoGridProps {
  readonly presaleStats: import("@/types").PresaleStats | undefined;
}

function PresaleInfoGrid({ presaleStats }: PresaleInfoGridProps) {
  if (!presaleStats) return null;

  return (
    <div className="grid w-full max-w-lg gap-3 sm:grid-cols-2">
      <div className="surface rounded-xl p-4 text-center">
        <p className="text-xs text-[rgb(var(--fg-muted))]">Pool Size</p>
        <p className="mt-1 text-lg font-semibold text-[rgb(var(--fg-primary))]">
          {formatACTX(presaleStats.poolTotal, 0)}
        </p>
        <p className="text-xs text-[rgb(var(--fg-muted))]">ACTX</p>
      </div>
      <div className="surface rounded-xl p-4 text-center">
        <p className="text-xs text-[rgb(var(--fg-muted))]">Max Per Founder</p>
        <p className="mt-1 text-lg font-semibold text-[rgb(var(--fg-primary))]">
          {formatACTX(PRESALE.PER_WALLET_CAP, 0)}
        </p>
        <p className="text-xs text-[rgb(var(--fg-muted))]">ACTX</p>
      </div>
      <div className="surface rounded-xl p-4 text-center">
        <p className="text-xs text-[rgb(var(--fg-muted))]">Elite Price</p>
        <p className="mt-1 text-lg font-semibold text-[var(--blessup-green)]">
          {formatUSDC(PRESALE.ELITE_PRICE)}
        </p>
        <p className="text-xs text-[rgb(var(--fg-muted))]">per token</p>
      </div>
      <div className="surface rounded-xl p-4 text-center">
        <p className="text-xs text-[rgb(var(--fg-muted))]">Legend Price</p>
        <p className="mt-1 text-lg font-semibold text-[var(--blessup-gold)]">
          {formatUSDC(PRESALE.LEGEND_PRICE)}
        </p>
        <p className="text-xs text-[rgb(var(--fg-muted))]">per token</p>
      </div>
    </div>
  );
}

export default function PresalePage() {
  return (
    <PageGuard requireFounderNft requireProofOfAction>
      <PresaleContent />
    </PageGuard>
  );
}
