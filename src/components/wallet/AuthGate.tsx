"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useAccount } from "wagmi";
import { useAuth } from "@/providers/AuthProvider";
import { ConnectButton } from "./ConnectButton";

interface AuthGateProps {
  readonly children: ReactNode;
  readonly prompt?: string;
}

export function AuthGate({ children, prompt }: AuthGateProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { isConnected, address } = useAccount();
  const { walletAddress, isSigningIn, error, signIn } = useAuth();

  if (!mounted) return null;

  const isAuthed =
    isConnected &&
    walletAddress &&
    address &&
    walletAddress.toLowerCase() === address.toLowerCase();

  if (isAuthed) return <>{children}</>;

  return (
    <div className="surface fade-up flex flex-col items-start gap-4 p-6">
      <span className="chip text-2xs">
        <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--nft-accent))]" />
        Authentication required
      </span>
      <h2 className="text-xl font-semibold tracking-tight text-[rgb(var(--fg-primary))]">
        {prompt ?? "Connect your wallet and sign in to continue."}
      </h2>
      <p className="max-w-prose text-sm text-[rgb(var(--fg-secondary))]">
        We require a one-time wallet signature to verify ownership before any
        payment or mint. Signing is gas-free, off-chain, and only proves the
        wallet belongs to you.
      </p>
      {!isConnected || !address ? (
        <ConnectButton label="Connect wallet" />
      ) : (
        <button
          type="button"
          onClick={() => signIn()}
          disabled={isSigningIn}
          className="btn btn-primary"
        >
          {isSigningIn ? "Awaiting signature..." : "Sign in with this wallet"}
        </button>
      )}
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
