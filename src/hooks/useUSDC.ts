"use client";

import { useReadContract } from "wagmi";
import { type Address, parseAbi } from "viem";
import { USDC_ABI } from "@/lib/abis/USDC";
import { getAddresses } from "@/lib/contracts";

const usdcAbi = parseAbi(USDC_ABI);

export interface UseUSDCBalanceResult {
  readonly balance: bigint;
  readonly isLoading: boolean;
  readonly refetch: () => void;
}

export function useUSDCBalance(
  walletAddress: Address | undefined,
): UseUSDCBalanceResult {
  const { usdc } = getAddresses();

  const { data, isLoading, status, refetch } = useReadContract({
    address: usdc,
    abi: usdcAbi,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress] : undefined,
    query: { enabled: Boolean(walletAddress) },
  });

  return {
    balance: status === "success" ? (data as bigint) : 0n,
    isLoading,
    refetch,
  };
}

export interface UseUSDCAllowanceResult {
  readonly allowance: bigint;
  readonly isLoading: boolean;
  readonly refetch: () => void;
}

export function useUSDCAllowance(
  walletAddress: Address | undefined,
): UseUSDCAllowanceResult {
  const { usdc, genesisPresale } = getAddresses();

  const { data, isLoading, status, refetch } = useReadContract({
    address: usdc,
    abi: usdcAbi,
    functionName: "allowance",
    args: walletAddress ? [walletAddress, genesisPresale] : undefined,
    query: { enabled: Boolean(walletAddress) },
  });

  return {
    allowance: status === "success" ? (data as bigint) : 0n,
    isLoading,
    refetch,
  };
}
