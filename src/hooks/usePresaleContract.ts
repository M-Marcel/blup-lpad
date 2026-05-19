"use client";

import { useEffect } from "react";
import { useReadContract, useReadContracts } from "wagmi";
import { type Address, parseAbi } from "viem";
import { GENESIS_PRESALE_ABI } from "@/lib/abis/GenesisPresale";
import { PRESALE_VESTING_ABI } from "@/lib/abis/PresaleVesting";
import { getAddresses } from "@/lib/contracts";
import { useAppStore } from "@/store/useAppStore";
import { PresaleState } from "@/lib/constants";
import type { PresaleStats } from "@/types";

const genesisPresaleAbi = parseAbi(GENESIS_PRESALE_ABI);
const presaleVestingAbi = parseAbi(PRESALE_VESTING_ABI);

export interface UsePresaleStateResult {
  readonly data: PresaleStats | undefined;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly refetch: () => void;
}

export function usePresaleState(): UsePresaleStateResult {
  const { genesisPresale } = getAddresses();
  const setPresaleState = useAppStore((s) => s.setPresaleState);

  const statsResult = useReadContract({
    address: genesisPresale,
    abi: genesisPresaleAbi,
    functionName: "getPresaleStats",
  });

  const pausedResult = useReadContract({
    address: genesisPresale,
    abi: genesisPresaleAbi,
    functionName: "paused",
  });

  let presaleStats: PresaleStats | undefined;

  if (
    statsResult.status === "success" &&
    Array.isArray(statsResult.data) &&
    statsResult.data.length >= 8
  ) {
    const stats = statsResult.data as readonly [
      bigint, bigint, bigint, bigint, boolean, bigint, bigint, bigint,
    ];
    const paused =
      pausedResult.status === "success" && pausedResult.data === true;

    presaleStats = {
      poolTotal: stats[0],
      poolRemaining: stats[1],
      totalTokensSold: stats[0] - stats[1],
      totalUsdcRaised: stats[2],
      totalParticipants: stats[3],
      presaleOpen: stats[4],
      presaleClosed: !stats[4],
      presaleOpenTime: stats[5],
      scheduledOpenTime: stats[6],
      version: stats[7],
      paused,
    };
  }

  useEffect(() => {
    if (
      statsResult.status !== "success" ||
      !Array.isArray(statsResult.data) ||
      statsResult.data.length < 8
    )
      return;
    const paused =
      pausedResult.status === "success" && pausedResult.data === true;
    const stats = statsResult.data as readonly [
      bigint, bigint, bigint, bigint, boolean, bigint, bigint, bigint,
    ];

    if (paused) {
      setPresaleState(PresaleState.CLOSED);
    } else if (stats[4]) {
      setPresaleState(PresaleState.OPEN);
    } else if (stats[6] > 0n && stats[5] === 0n) {
      setPresaleState(PresaleState.NOT_STARTED);
    } else if (!stats[4] && stats[5] > 0n) {
      setPresaleState(PresaleState.CLOSED);
    }
  }, [statsResult.status, statsResult.data, pausedResult.status, pausedResult.data, setPresaleState]);

  return {
    data: presaleStats,
    isLoading: statsResult.isLoading || pausedResult.isLoading,
    error: statsResult.error ?? pausedResult.error ?? null,
    refetch: () => {
      statsResult.refetch();
      pausedResult.refetch();
    },
  };
}

export interface UseFounderContractDataResult {
  readonly tier: number;
  readonly isQualified: boolean;
  readonly tokensPurchased: bigint;
  readonly totalSpentUsdc: bigint;
  readonly totalClaimed: bigint;
  readonly lockedBalance: bigint;
  readonly claimableBalance: bigint;
  readonly vestingMultiplier: bigint;
  readonly isLoading: boolean;
  readonly error: Error | null;
}

export function useFounderContractData(
  walletAddress: Address | undefined,
): UseFounderContractDataResult {
  const { genesisPresale, presaleVesting } = getAddresses();
  const enabled = Boolean(walletAddress);

  const {
    data: presaleData,
    isLoading: isPresaleLoading,
    error: presaleError,
  } = useReadContracts({
    contracts: [
      {
        address: genesisPresale,
        abi: genesisPresaleAbi,
        functionName: "getWalletTier",
        args: walletAddress ? [walletAddress] : undefined,
      },
      {
        address: genesisPresale,
        abi: genesisPresaleAbi,
        functionName: "isQualified",
        args: walletAddress ? [walletAddress] : undefined,
      },
      {
        address: genesisPresale,
        abi: genesisPresaleAbi,
        functionName: "getBuyerRecord",
        args: walletAddress ? [walletAddress] : undefined,
      },
    ],
    query: { enabled },
  });

  const {
    data: vestingData,
    isLoading: isVestingLoading,
    error: vestingError,
  } = useReadContracts({
    contracts: [
      {
        address: presaleVesting,
        abi: presaleVestingAbi,
        functionName: "getClaimable",
        args: walletAddress ? [walletAddress] : undefined,
      },
      {
        address: presaleVesting,
        abi: presaleVestingAbi,
        functionName: "getLockedBalance",
        args: walletAddress ? [walletAddress] : undefined,
      },
      {
        address: presaleVesting,
        abi: presaleVestingAbi,
        functionName: "getVestingMultiplier",
        args: walletAddress ? [walletAddress] : undefined,
      },
      {
        address: presaleVesting,
        abi: presaleVestingAbi,
        functionName: "getPurchase",
        args: walletAddress ? [walletAddress] : undefined,
      },
    ],
    query: { enabled },
  });

  const presaleAllSuccess =
    presaleData?.every((r) => r.status === "success") ?? false;
  const vestingAllSuccess =
    vestingData?.every((r) => r.status === "success") ?? false;

  const rawBuyer = presaleAllSuccess ? presaleData![2].result : undefined;
  const buyerRecord =
    Array.isArray(rawBuyer) && rawBuyer.length >= 2
      ? (rawBuyer as readonly [bigint, bigint])
      : undefined;

  const rawVestingPurchase = vestingAllSuccess
    ? vestingData![3].result
    : undefined;
  const vestingPurchase =
    Array.isArray(rawVestingPurchase) && rawVestingPurchase.length >= 2
      ? (rawVestingPurchase as readonly [bigint, bigint])
      : undefined;

  return {
    tier: presaleAllSuccess ? Number(presaleData![0].result) : 0,
    isQualified: presaleAllSuccess
      ? (presaleData![1].result as boolean)
      : false,
    tokensPurchased: buyerRecord?.[0] ?? 0n,
    totalSpentUsdc: buyerRecord?.[1] ?? 0n,
    totalClaimed: vestingPurchase?.[1] ?? 0n,
    claimableBalance: vestingAllSuccess
      ? (vestingData![0].result as bigint)
      : 0n,
    lockedBalance: vestingAllSuccess
      ? (vestingData![1].result as bigint)
      : 0n,
    vestingMultiplier: vestingAllSuccess
      ? (vestingData![2].result as bigint)
      : 100n,
    isLoading: isPresaleLoading || isVestingLoading,
    error: presaleError ?? vestingError ?? null,
  };
}

export interface UsePresalePricingResult {
  readonly elitePrice: bigint;
  readonly eliteMaxSpend: bigint;
  readonly legendPrice: bigint;
  readonly legendMaxSpend: bigint;
  readonly maxTokensPerFounder: bigint;
  readonly isLoading: boolean;
}

export function usePresalePricing(): UsePresalePricingResult {
  const { genesisPresale } = getAddresses();

  const { data, isLoading } = useReadContracts({
    contracts: [
      {
        address: genesisPresale,
        abi: genesisPresaleAbi,
        functionName: "getTierConfig",
        args: [1],
      },
      {
        address: genesisPresale,
        abi: genesisPresaleAbi,
        functionName: "getTierConfig",
        args: [2],
      },
      {
        address: genesisPresale,
        abi: genesisPresaleAbi,
        functionName: "maxTokensPerFounder",
      },
    ],
  });

  const allSuccess = data?.every((r) => r.status === "success") ?? false;

  const rawElite = allSuccess ? data![0].result : undefined;
  const eliteConfig =
    Array.isArray(rawElite) && rawElite.length >= 2
      ? (rawElite as readonly [bigint, bigint])
      : undefined;
  const rawLegend = allSuccess ? data![1].result : undefined;
  const legendConfig =
    Array.isArray(rawLegend) && rawLegend.length >= 2
      ? (rawLegend as readonly [bigint, bigint])
      : undefined;

  return {
    elitePrice: eliteConfig?.[0] ?? 0n,
    eliteMaxSpend: eliteConfig?.[1] ?? 0n,
    legendPrice: legendConfig?.[0] ?? 0n,
    legendMaxSpend: legendConfig?.[1] ?? 0n,
    maxTokensPerFounder: allSuccess ? (data![2].result as bigint) : 0n,
    isLoading,
  };
}
