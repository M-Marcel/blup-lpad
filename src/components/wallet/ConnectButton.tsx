"use client";

import { useState, useEffect } from "react";
import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { TARGET_CHAIN } from "@/lib/chains";

interface ConnectButtonProps {
  readonly showBalance?: boolean;
  readonly label?: string;
}

export function ConnectButton({ showBalance = false, label }: ConnectButtonProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className="btn btn-primary btn-sm"
      >
        {label ?? "Connect Wallet"}
      </button>
    );
  }

  return (
    <RainbowConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

        return (
          <div
            {...(!mounted && {
              "aria-hidden": true,
              style: { opacity: 0, pointerEvents: "none" as const, userSelect: "none" as const },
            })}
          >
            {!connected ? (
              <button
                onClick={openConnectModal}
                type="button"
                className="btn btn-primary btn-sm"
              >
                {label ?? "Connect Wallet"}
              </button>
            ) : chain.unsupported ? (
              <button
                onClick={openChainModal}
                type="button"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-rose-600 px-5 text-xs font-semibold text-white transition-colors hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg-base))]"
              >
                Switch to {TARGET_CHAIN.name}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {showBalance && account.displayBalance && (
                  <span className="text-xs text-[rgb(var(--fg-muted))]">
                    {account.displayBalance}
                  </span>
                )}
                <button
                  onClick={openAccountModal}
                  type="button"
                  className="btn btn-ghost btn-sm font-mono"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {account.displayName}
                </button>
              </div>
            )}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}
