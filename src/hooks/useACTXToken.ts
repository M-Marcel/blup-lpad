"use client";

import { useReadContract } from "wagmi";
import { type Address, parseAbi } from "viem";
import { ACTX_TOKEN_ABI } from "@/lib/abis/ACTXToken";
import { getAddresses } from "@/lib/contracts";

const tokenAbi = parseAbi(ACTX_TOKEN_ABI);

export interface UseACTXBalanceResult {
  readonly balance: bigint;
  readonly isLoading: boolean;
  readonly refetch: () => void;
}

export function useACTXBalance(
  walletAddress: Address | undefined,
): UseACTXBalanceResult {
  const { actxToken } = getAddresses();

  const { data, isLoading, status, refetch } = useReadContract({
    address: actxToken,
    abi: tokenAbi,
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

export interface UseACTXTotalSupplyResult {
  readonly totalSupply: bigint;
  readonly isLoading: boolean;
}

export function useACTXTotalSupply(): UseACTXTotalSupplyResult {
  const { actxToken } = getAddresses();

  const { data, isLoading, status } = useReadContract({
    address: actxToken,
    abi: tokenAbi,
    functionName: "totalSupply",
  });

  return {
    totalSupply: status === "success" ? (data as bigint) : 0n,
    isLoading,
  };
}
