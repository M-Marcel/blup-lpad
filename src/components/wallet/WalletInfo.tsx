"use client";

import { useEffect, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useAuth } from "@/providers/AuthProvider";
import { chainLabel } from "@/lib/chains";
import { truncateAddress } from "@/lib/formatting";

export function WalletInfo() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { address, chainId, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { isAuthenticated, signOut } = useAuth();

  if (!mounted || !isConnected || !address) return null;

  return (
    <div className="surface flex flex-col gap-3 p-4 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[rgb(var(--fg-muted))]">Network</span>
        <span className="text-[rgb(var(--fg-primary))]">
          {chainId ? chainLabel(chainId) : "Unknown"}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[rgb(var(--fg-muted))]">Address</span>
        <span className="font-mono text-[rgb(var(--fg-primary))]">
          {truncateAddress(address)}
        </span>
      </div>
      {isAuthenticated && (
        <div className="flex items-center justify-between">
          <span className="text-[rgb(var(--fg-muted))]">Session</span>
          <span className="text-emerald-400">Verified</span>
        </div>
      )}
      <div className="gradient-divider my-1" />
      <button
        type="button"
        onClick={() => {
          signOut();
          disconnect();
        }}
        className="btn btn-ghost btn-xs justify-center"
      >
        {isAuthenticated ? "Sign out + disconnect" : "Disconnect"}
      </button>
    </div>
  );
}
