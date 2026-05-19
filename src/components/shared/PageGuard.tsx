"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { NetworkGuard } from "@/components/wallet/NetworkGuard";
import { getAddresses } from "@/lib/contracts";
import { FOUNDER_NFT_ABI } from "@/lib/abis/FounderNFT";
import { PROOF_OF_ACTION_ABI } from "@/lib/abis/ProofOfAction";
import { Loader2, ArrowRight, ShieldX, Clock } from "lucide-react";

interface PageGuardProps {
  readonly children: ReactNode;
  readonly requireFounderNft?: boolean;
  readonly requireProofOfAction?: boolean;
  readonly requirePresaleOpen?: boolean;
}

export function PageGuard({
  children,
  requireFounderNft = false,
  requireProofOfAction = false,
  requirePresaleOpen = false,
}: PageGuardProps) {
  return (
    <NetworkGuard>
      <PageGuardInner
        requireFounderNft={requireFounderNft}
        requireProofOfAction={requireProofOfAction}
        requirePresaleOpen={requirePresaleOpen}
      >
        {children}
      </PageGuardInner>
    </NetworkGuard>
  );
}

function PageGuardInner({
  children,
  requireFounderNft,
  requireProofOfAction,
  requirePresaleOpen: _requirePresaleOpen,
}: Omit<PageGuardProps, never>) {
  const { address } = useAccount();
  const addresses = getAddresses();

  const { data: nftBalance, isLoading: nftLoading } = useReadContract({
    address: addresses.founderNft as `0x${string}`,
    abi: FOUNDER_NFT_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(requireFounderNft && address) },
  });

  const { data: isVerified, isLoading: poaLoading } = useReadContract({
    address: addresses.proofOfAction as `0x${string}`,
    abi: PROOF_OF_ACTION_ABI,
    functionName: "isVerified",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(requireProofOfAction && address) },
  });

  const isLoading =
    (requireFounderNft && nftLoading) || (requireProofOfAction && poaLoading);

  if (isLoading) {
    return (
      <div className="guard-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--blessup-green)]" />
          <p className="text-sm text-[rgb(var(--fg-muted))]">Loading your status...</p>
        </div>
      </div>
    );
  }

  if (requireFounderNft && (!nftBalance || nftBalance === 0n)) {
    return (
      <div className="guard-center px-4">
        <div className="surface w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10">
            <ShieldX className="h-8 w-8 text-rose-400" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-[rgb(var(--fg-primary))]">
            Founder NFT Required
          </h2>
          <p className="mb-6 text-sm text-[rgb(var(--fg-secondary))]">
            You need a Genesis Founder NFT to access this page. Purchase an
            Elite or Legend tier NFT to get started.
          </p>
          <Link href="/nft" className="btn btn-primary">
            <ArrowRight className="h-4 w-4" />
            Get Your Founder NFT
          </Link>
        </div>
      </div>
    );
  }

  if (requireProofOfAction && !isVerified) {
    return (
      <div className="guard-center px-4">
        <div className="surface w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--blessup-gold)]/10">
            <Clock className="h-8 w-8 text-[var(--blessup-gold)]" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-[rgb(var(--fg-primary))]">
            Genesis Sprint Required
          </h2>
          <p className="mb-6 text-sm text-[rgb(var(--fg-secondary))]">
            Complete the Genesis Sprint (3 Mind Renewal sessions across 3
            separate days) to unlock presale access.
          </p>
          <Link href="/sprint" className="btn btn-primary">
            <ArrowRight className="h-4 w-4" />
            Go to Genesis Sprint
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
