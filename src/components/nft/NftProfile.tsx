"use client";

import Link from "next/link";
import { ExternalLink, Award, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { tokenUrl, txUrl } from "@/lib/explorer";
import { truncateAddress } from "@/lib/formatting";
import { getAddresses } from "@/lib/contracts";
import { TIERS } from "@/lib/tiers";
import { Field, StatusBadge } from "@/components/shared";
import { NftPreview } from "./NftPreview";
import type { NftProfileResponse } from "@/types/nft";

interface NftProfileProps {
  readonly profile: NftProfileResponse;
  readonly className?: string;
}

function multiplierLabel(bp: number): string {
  return `${(bp / 100).toFixed(1)}x`;
}

function multiplierVariant(bp: number): "success" | "warning" | "info" {
  if (bp >= 300) return "success";
  if (bp >= 200) return "warning";
  return "info";
}

export function NftProfile({ profile, className }: NftProfileProps) {
  const addresses = getAddresses();

  if (profile.tier === "none") {
    return (
      <div className={cn("surface flex flex-col items-center gap-6 p-8 text-center", className)}>
        <Award className="h-12 w-12 text-[rgb(var(--fg-muted))]" />
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-[rgb(var(--fg-primary))]">
            No Genesis NFT
          </h2>
          <p className="text-sm text-[rgb(var(--fg-secondary))]">
            Mint a Genesis NFT to unlock founder benefits and join the BlessUP
            Network early.
          </p>
        </div>
        <Link href="/nft" className="btn btn-primary">
          Browse Genesis NFTs
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    );
  }

  const tierConfig = TIERS[profile.tier];
  const isGold = profile.tier === "legend";

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <NftPreview
        tier={profile.tier}
        tokenId={profile.tokenId}
        imageUrl={profile.gatewayImage}
      />

      <div className={cn(isGold ? "surface-gold" : "surface", "flex flex-col gap-4 p-5")}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[rgb(var(--fg-primary))]">
            {tierConfig.nftName}
          </h2>
          <StatusBadge
            label={multiplierLabel(profile.multiplierBp)}
            variant={multiplierVariant(profile.multiplierBp)}
          />
        </div>

        <div className="flex flex-col gap-3">
          <Field label="Tier" value={tierConfig.name} />
          <Field label="Wallet" value={truncateAddress(profile.address)} />
          {profile.tokenId !== null && (
            <Field label="Token ID" value={`#${profile.tokenId}`} />
          )}
          {profile.metadata?.name && (
            <Field label="Name" value={profile.metadata.name} />
          )}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          {profile.tokenId !== null && (
            <a
              href={tokenUrl(addresses.founderNft, profile.tokenId)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[rgb(var(--nft-accent))] transition-colors hover:text-[rgb(var(--fg-primary))]"
            >
              View on BaseScan
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {profile.txHash && (
            <a
              href={txUrl(profile.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[rgb(var(--fg-muted))] transition-colors hover:text-[rgb(var(--fg-primary))]"
            >
              Mint transaction
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {profile.tier === "elite" && (
        <Link
          href="/nft/upgrade"
          className="btn btn-gold w-full text-center"
        >
          Upgrade to Legend
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
