"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { TARGET_CHAIN, TARGET_CHAIN_ID } from "@/lib/chains";
import { ConnectButton } from "./ConnectButton";
import { Loader2, AlertCircle, Wifi, WifiOff } from "lucide-react";

interface NetworkGuardProps {
  readonly children: ReactNode;
}

export function NetworkGuard({ children }: NetworkGuardProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="guard-center">
        <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--fg-muted))]" />
      </div>
    );
  }

  return <NetworkGuardInner>{children}</NetworkGuardInner>;
}

function NetworkGuardInner({ children }: NetworkGuardProps) {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  if (!isConnected) {
    return (
      <div className="guard-center px-4">
        <div className="surface w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--bg-overlay))]">
            <WifiOff className="h-8 w-8 text-[rgb(var(--fg-muted))]" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-[rgb(var(--fg-primary))]">
            Connect Your Wallet
          </h2>
          <p className="mb-6 text-sm text-[rgb(var(--fg-secondary))]">
            Connect your wallet to access the BlessUP Launchpad. We support
            MetaMask, Coinbase Wallet, and WalletConnect.
          </p>
          <div className="flex justify-center">
            <ConnectButton label="Connect to Get Started" />
          </div>
        </div>
      </div>
    );
  }

  if (chainId !== TARGET_CHAIN_ID) {
    return (
      <div className="guard-center px-4">
        <div className="surface w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10">
            <AlertCircle className="h-8 w-8 text-rose-400" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-[rgb(var(--fg-primary))]">
            Wrong Network
          </h2>
          <p className="mb-6 text-sm text-[rgb(var(--fg-secondary))]">
            The BlessUP Launchpad runs on {TARGET_CHAIN.name}. Please switch
            your wallet to the correct network.
          </p>
          <button
            onClick={() => switchChain({ chainId: TARGET_CHAIN_ID })}
            disabled={isSwitching}
            type="button"
            className="btn btn-primary"
          >
            <Wifi className="h-4 w-4" />
            {isSwitching ? "Switching..." : `Switch to ${TARGET_CHAIN.name}`}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
