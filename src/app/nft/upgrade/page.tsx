"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ArrowUpRight, Crown, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { TIERS, UPGRADE_DELTA } from "@/lib/tiers";
import { apiGet } from "@/lib/api-client";
import { NetworkGuard } from "@/components/wallet/NetworkGuard";
import { AuthGate } from "@/components/wallet/AuthGate";
import { NftPreview } from "@/components/nft";
import { Field, StatusBadge } from "@/components/shared";
import type { NftProfileResponse } from "@/types/nft";

export default function UpgradePage() {
  return (
    <NetworkGuard>
      <AuthGate prompt="Connect and sign in to upgrade your Genesis NFT.">
        <UpgradeContent />
      </AuthGate>
    </NetworkGuard>
  );
}

function UpgradeContent() {
  const { address } = useAccount();
  const [profile, setProfile] = useState<NftProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    apiGet<NftProfileResponse>("/nft/me").then((result) => {
      if (result.success) {
        setProfile(result.data);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    });
  }, [address]);

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 px-4 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--nft-accent))]" />
        <p className="text-sm text-[rgb(var(--fg-muted))]">
          Checking your current NFT...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-sm text-rose-400">{error}</p>
        <Link href="/nft" className="btn btn-primary">
          Back to NFTs
        </Link>
      </div>
    );
  }

  if (!profile || profile.tier === "none") {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[rgb(var(--fg-primary))]">
          No NFT to Upgrade
        </h1>
        <p className="text-sm text-[rgb(var(--fg-secondary))]">
          You need a Genesis NFT before you can upgrade. Mint one first.
        </p>
        <Link href="/nft" className="btn btn-primary">
          Browse Genesis NFTs
        </Link>
      </div>
    );
  }

  if (profile.tier === "legend") {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 px-4 py-16 text-center">
        <Crown className="h-12 w-12 text-[rgb(var(--gold))]" />
        <h1 className="text-2xl font-bold text-[rgb(var(--fg-primary))]">
          Already a Legend
        </h1>
        <p className="text-sm text-[rgb(var(--fg-secondary))]">
          You already hold the Genesis Gold NFT — the highest tier available.
        </p>
        <Link href="/nft/my-nft" className="btn btn-gold">
          View my NFT
        </Link>
      </div>
    );
  }

  const fromTier = TIERS.elite;
  const toTier = TIERS.legend;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8 px-4 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-[rgb(var(--fg-primary))]">
          Upgrade to Legend
        </h1>
        <p className="text-sm text-[rgb(var(--fg-secondary))]">
          Upgrade your {fromTier.nftName} to {toTier.nftName} and unlock
          top-tier founder perks.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="surface flex flex-col items-center gap-3 p-5 opacity-60">
          <NftPreview
            tier="elite"
            tokenId={profile.tokenId}
            imageUrl={profile.gatewayImage}
            className="max-w-[160px]"
          />
          <StatusBadge label="Current" variant="neutral" />
          <span className="text-sm font-medium text-[rgb(var(--fg-primary))]">
            {fromTier.nftName}
          </span>
        </div>

        <div className="surface-gold flex flex-col items-center gap-3 p-5">
          <NftPreview
            tier="legend"
            tokenId={null}
            imageUrl={null}
            className="max-w-[160px]"
          />
          <StatusBadge label="Upgrade" variant="warning" />
          <span className="text-sm font-medium text-[rgb(var(--fg-primary))]">
            {toTier.nftName}
          </span>
        </div>
      </div>

      <div className="surface-gold flex flex-col gap-4 p-5">
        <h3 className="text-sm font-semibold text-[rgb(var(--fg-primary))]">
          What you get
        </h3>
        <ul className="flex flex-col gap-2">
          {toTier.perks
            .filter((p) => !fromTier.perks.includes(p))
            .map((perk) => (
              <li
                key={perk}
                className="flex items-start gap-2 text-sm text-[rgb(var(--fg-secondary))]"
              >
                <Crown className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--gold))]" />
                {perk}
              </li>
            ))}
        </ul>

        <div className="border-t border-[rgb(var(--gold)/0.2)] pt-3">
          <Field
            label="Upgrade cost"
            value={
              <span className="text-lg font-bold text-[rgb(var(--fg-primary))]">
                ${UPGRADE_DELTA.toLocaleString()}
              </span>
            }
          />
          <p className="mt-1 text-xs text-[rgb(var(--fg-muted))]">
            You only pay the difference between Elite (${fromTier.price.toLocaleString()}) and Legend ($
            {toTier.price.toLocaleString()}).
          </p>
        </div>
      </div>

      <Link
        href="/nft/checkout?tier=legend&upgradeFrom=elite"
        className="btn btn-gold w-full text-center"
      >
        Upgrade to Legend — ${UPGRADE_DELTA.toLocaleString()}
        <ArrowUpRight className="ml-1 h-4 w-4" />
      </Link>
    </div>
  );
}
