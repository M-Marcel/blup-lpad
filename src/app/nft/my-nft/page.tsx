"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Loader2 } from "lucide-react";
import { apiGet } from "@/lib/api-client";
import { NetworkGuard } from "@/components/wallet/NetworkGuard";
import { AuthGate } from "@/components/wallet/AuthGate";
import { NftProfile } from "@/components/nft";
import type { NftProfileResponse } from "@/types/nft";

export default function MyNftPage() {
  return (
    <NetworkGuard>
      <AuthGate prompt="Connect and sign in to view your Genesis NFT.">
        <MyNftContent />
      </AuthGate>
    </NetworkGuard>
  );
}

function MyNftContent() {
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

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight text-[rgb(var(--fg-primary))]">
        My Genesis NFT
      </h1>

      {isLoading ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--nft-accent))]" />
          <p className="text-sm text-[rgb(var(--fg-muted))]">
            Loading your NFT profile...
          </p>
        </div>
      ) : error ? (
        <div className="surface flex flex-col items-center gap-4 p-6 text-center">
          <p className="text-sm text-rose-400">{error}</p>
          <button
            type="button"
            onClick={() => {
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
            }}
            className="btn btn-primary"
          >
            Try again
          </button>
        </div>
      ) : profile ? (
        <NftProfile profile={profile} />
      ) : null}
    </div>
  );
}
