"use client";

import { useAccount, useReadContract } from "wagmi";
import { parseAbi } from "viem";
import { useFounderContractData, usePresaleState, usePresalePricing } from "./usePresaleContract";
import { FOUNDER_NFT_ABI } from "@/lib/abis/FounderNFT";
import { getAddresses } from "@/lib/contracts";
import { FounderTier } from "@/lib/constants";
import type { FounderStatus } from "@/types";

const founderNftAbi = parseAbi(FOUNDER_NFT_ABI);

const TIER_NAMES: Record<number, string> = {
  [FounderTier.NONE]: "None",
  [FounderTier.ELITE]: "Elite",
  [FounderTier.LEGEND]: "Legend",
};

export interface UseFounderStatusResult {
  readonly founderStatus: FounderStatus;
  readonly hasFounderNft: boolean;
  readonly isLoading: boolean;
}

export function useFounderStatus(): UseFounderStatusResult {
  const { address, isConnected, chainId } = useAccount();
  const { founderNft } = getAddresses();
  const isCorrectChain = chainId === 84532 || chainId === 8453;

  const {
    tier,
    isQualified,
    tokensPurchased,
    totalSpentUsdc,
    lockedBalance,
    claimableBalance,
    isLoading: isContractLoading,
  } = useFounderContractData(address);

  const { data: presaleStats, isLoading: isPresaleLoading } = usePresaleState();
  const {
    elitePrice,
    legendPrice,
    eliteMaxSpend,
    legendMaxSpend,
    maxTokensPerFounder,
    isLoading: isPricingLoading,
  } = usePresalePricing();

  const nftBalanceResult = useReadContract({
    address: founderNft,
    abi: founderNftAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  const hasFounderNft =
    nftBalanceResult.status === "success"
      ? (nftBalanceResult.data as bigint) > 0n
      : false;

  const isElite = tier === FounderTier.ELITE;
  const isLegend = tier === FounderTier.LEGEND;
  const isWhitelisted = tier > FounderTier.NONE;

  const tierPrice = isElite ? elitePrice : legendPrice;
  const maxSpendUsdc = isElite ? eliteMaxSpend : legendMaxSpend;
  const usdcCapRemaining =
    maxSpendUsdc > totalSpentUsdc ? maxSpendUsdc - totalSpentUsdc : 0n;
  const tokenCapRemaining =
    maxTokensPerFounder > tokensPurchased
      ? maxTokensPerFounder - tokensPurchased
      : 0n;

  const presaleOpen = presaleStats?.presaleOpen ?? false;

  const founderStatus: FounderStatus = {
    isConnected,
    isCorrectChain,
    tier,
    tierName: TIER_NAMES[tier] ?? "Unknown",
    isWhitelisted,
    isElite,
    isLegend,
    tierPrice,
    maxSpendUsdc,
    isQualified,
    hasPurchased: tokensPurchased > 0n,
    canPurchase:
      isWhitelisted &&
      isQualified &&
      presaleOpen &&
      usdcCapRemaining > 0n &&
      tokenCapRemaining > 0n,
    tokensPurchased,
    totalSpentUsdc,
    usdcCapRemaining,
    tokenCapRemaining,
    lockedBalance,
    claimableBalance,
    isLoading: isContractLoading || isPresaleLoading || isPricingLoading,
  };

  return {
    founderStatus,
    hasFounderNft,
    isLoading:
      isContractLoading ||
      isPresaleLoading ||
      isPricingLoading ||
      nftBalanceResult.isLoading,
  };
}
