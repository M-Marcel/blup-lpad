import { base, baseSepolia } from "viem/chains";
import type { Chain } from "viem";

export const SUPPORTED_CHAINS = [baseSepolia, base] as const;

export const TARGET_CHAIN: Chain =
  process.env.NEXT_PUBLIC_CHAIN === "mainnet" ? base : baseSepolia;

export const TARGET_CHAIN_ID = TARGET_CHAIN.id;

export const CHAIN_LABEL: Record<number, string> = {
  84532: "Base Sepolia",
  8453: "Base",
};

export function chainLabel(id: number): string {
  return CHAIN_LABEL[id] ?? `Chain ${id}`;
}
