"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { chainLabel, TARGET_CHAIN } from "@/lib/chains";

export function ChainChip() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { chainId, isConnected } = useAccount();
  const id = mounted && isConnected && chainId ? chainId : TARGET_CHAIN.id;

  return (
    <span className="chip">
      <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--nft-accent))]" />
      {chainLabel(id)}
    </span>
  );
}
