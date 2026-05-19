"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { PartyPopper, ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";
import { txUrl } from "@/lib/explorer";
import { truncateAddress } from "@/lib/formatting";
import { TIERS } from "@/lib/tiers";
import { useNftOrder } from "@/hooks/useNftOrder";
import { AuthGate } from "@/components/wallet/AuthGate";
import { NftPreview } from "@/components/nft";
import { Field } from "@/components/shared";

export default function SuccessPage() {
  const params = useParams<{ id: string }>();
  const { order, error, fetchOrder } = useNftOrder();
  const shouldReduceMotion = useReducedMotion();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (params.id && !loaded) {
      fetchOrder(params.id).then(() => setLoaded(true));
    }
  }, [params.id, fetchOrder, loaded]);

  return (
    <AuthGate prompt="Connect your wallet to view your mint result.">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 px-4 py-16">
        {!loaded ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState error={error} />
        ) : order ? (
          <SuccessContent
            order={order}
            shouldReduceMotion={shouldReduceMotion ?? false}
          />
        ) : (
          <ErrorState error="Order not found." />
        )}
      </div>
    </AuthGate>
  );
}

function SuccessContent({
  order,
  shouldReduceMotion,
}: {
  readonly order: NonNullable<ReturnType<typeof useNftOrder>["order"]>;
  readonly shouldReduceMotion: boolean;
}) {
  const tierConfig = TIERS[order.tier];
  const isGold = order.tier === "legend";

  return (
    <>
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full",
            isGold
              ? "bg-[rgb(var(--gold)/0.15)]"
              : "bg-[rgb(var(--nft-accent)/0.15)]",
          )}
        >
          <PartyPopper
            className={cn(
              "h-8 w-8",
              isGold
                ? "text-[rgb(var(--gold))]"
                : "text-[rgb(var(--nft-accent))]",
            )}
          />
        </div>

        <h1 className="text-2xl font-bold text-[rgb(var(--fg-primary))]">
          Welcome, Founder!
        </h1>
        <p className="text-center text-sm text-[rgb(var(--fg-secondary))]">
          Your {tierConfig.nftName} has been minted successfully. You now have
          full access to the BlessUP founder dashboard.
        </p>
      </motion.div>

      <motion.div
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        <NftPreview
          tier={order.tier}
          tokenId={order.tokenId}
          imageUrl={null}
        />
      </motion.div>

      <motion.div
        className={cn(isGold ? "surface-gold" : "surface", "w-full p-5")}
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex flex-col gap-3">
          <Field label="Tier" value={tierConfig.name} />
          <Field label="NFT" value={tierConfig.nftName} />
          {order.tokenId !== null && (
            <Field
              label="Token ID"
              value={
                <span className="font-mono">#{order.tokenId}</span>
              }
            />
          )}
          {order.txHash && (
            <Field
              label="Transaction"
              value={
                <a
                  href={txUrl(order.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[rgb(var(--nft-accent))] transition-colors hover:text-[rgb(var(--fg-primary))]"
                >
                  {truncateAddress(order.txHash)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              }
            />
          )}
          <Field
            label="Amount"
            value={`$${order.amountUsd.toLocaleString()}`}
          />
        </div>
      </motion.div>

      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <a
          href="/nft/my-nft"
          className={cn(
            "btn flex-1 text-center",
            isGold ? "btn-gold" : "btn-primary",
          )}
        >
          View my NFT
        </a>
        <a
          href="/presale"
          className="btn btn-outline flex-1 text-center"
        >
          Go to Presale
        </a>
      </div>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="h-16 w-16 animate-pulse rounded-full bg-[rgb(var(--bg-overlay))]" />
      <div className="h-6 w-48 animate-pulse rounded bg-[rgb(var(--bg-overlay))]" />
      <div className="aspect-square w-full max-w-xs animate-pulse rounded-xl bg-[rgb(var(--bg-overlay))]" />
      <div className="h-32 w-full animate-pulse rounded-xl bg-[rgb(var(--bg-overlay))]" />
    </div>
  );
}

function ErrorState({ error }: { readonly error: string }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-sm text-rose-400">{error}</p>
      <a href="/nft" className="btn btn-primary">
        Back to NFTs
      </a>
    </div>
  );
}
