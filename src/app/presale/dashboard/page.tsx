"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useAccount } from "wagmi";
import { BarChart3, Wallet, AlertCircle } from "lucide-react";
import { useVesting } from "@/hooks/useVesting";
import { useClaimWrite } from "@/hooks/useClaimWrite";
import { useACTXBalance } from "@/hooks/useACTXToken";
import { useFounderStatus } from "@/hooks/useFounderStatus";
import { PageGuard } from "@/components/shared/PageGuard";
import { Field } from "@/components/shared/Field";
import { TokenAmount } from "@/components/shared/TokenAmount";
import { VestingSchedule } from "@/components/vesting/VestingSchedule";
import { ClaimButton } from "@/components/vesting/ClaimButton";
import { TierBadge } from "@/components/presale/TierBadge";

function DashboardContent() {
  const shouldReduceMotion = useReducedMotion();
  const { address } = useAccount();
  const vestingData = useVesting();
  const claimWrite = useClaimWrite();
  const { balance: actxBalance } = useACTXBalance(address);
  const { founderStatus } = useFounderStatus();

  const hasNoPurchase = vestingData.totalPurchased === 0n;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      {/* Header */}
      <motion.div
        className="flex flex-col items-center gap-3 text-center"
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="chip inline-flex items-center gap-1.5 text-2xs">
          <BarChart3 className="h-3 w-3 text-[var(--blessup-green)]" />
          Presale Dashboard
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-[rgb(var(--fg-primary))] sm:text-4xl">
          Your Vesting Dashboard
        </h1>
        {founderStatus.isWhitelisted && (
          <TierBadge tier={founderStatus.tier} className="mt-1" />
        )}
      </motion.div>

      {/* Empty state */}
      {hasNoPurchase && !vestingData.isLoading && (
        <motion.div
          className="surface flex flex-col items-center gap-4 rounded-xl p-8 text-center"
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Wallet className="h-10 w-10 text-[rgb(var(--fg-muted))]" />
          <h2 className="text-lg font-semibold text-[rgb(var(--fg-primary))]">
            No Presale Purchase
          </h2>
          <p className="max-w-sm text-sm text-[rgb(var(--fg-muted))]">
            You haven&apos;t purchased any ACTX tokens yet. Visit the presale
            page to make a purchase.
          </p>
          <Link href="/presale" className="btn btn-primary">
            Go to Presale
          </Link>
        </motion.div>
      )}

      {/* Wallet balance card */}
      {!hasNoPurchase && (
        <motion.div
          className="surface rounded-xl p-5"
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-[var(--blessup-green)]" />
            <h3 className="text-base font-semibold text-[rgb(var(--fg-primary))]">
              Wallet Balance
            </h3>
          </div>
          <div className="mt-3 space-y-2">
            <Field
              label="ACTX in Wallet"
              value={<TokenAmount amount={actxBalance} showIcon />}
            />
          </div>
        </motion.div>
      )}

      {/* Vesting schedule */}
      {!hasNoPurchase && (
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <VestingSchedule vestingData={vestingData} />
        </motion.div>
      )}

      {/* Claim section */}
      {!hasNoPurchase && (
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <ClaimButton
            claimableBalance={vestingData.claimableBalance}
            canClaim={vestingData.canClaim}
            tgeTriggered={vestingData.tgeTriggered}
            isClaiming={claimWrite.isClaiming}
            isConfirming={claimWrite.isConfirming}
            isConfirmed={claimWrite.isConfirmed}
            claimHash={claimWrite.claimHash}
            onClaim={claimWrite.claimTokens}
          />

          {claimWrite.error && claimWrite.error !== "Transaction cancelled" && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{claimWrite.error}</span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function PresaleDashboardPage() {
  return (
    <PageGuard requireFounderNft>
      <DashboardContent />
    </PageGuard>
  );
}
