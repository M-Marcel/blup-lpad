"use client";

import { useWatchContractEvent } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { parseAbi, zeroAddress } from "viem";
import { GENESIS_PRESALE_ABI } from "@/lib/abis/GenesisPresale";
import { PRESALE_VESTING_ABI } from "@/lib/abis/PresaleVesting";
import { getAddresses } from "@/lib/contracts";
import { apiPost } from "@/lib/api-client";
import { useAppStore } from "@/store/useAppStore";
import type { RecentPurchase } from "@/types";

const genesisPresaleAbi = parseAbi(GENESIS_PRESALE_ABI);
const presaleVestingAbi = parseAbi(PRESALE_VESTING_ABI);

const RETRY_DELAYS = [1000, 2000, 4000];

async function persistEventWithRetry(
  purchase: RecentPurchase,
  blockNumber: bigint,
): Promise<void> {
  const payload = {
    txHash: purchase.txHash,
    buyer: purchase.buyer,
    tokenAmount: purchase.amount.toString(),
    usdcAmount: purchase.usdcPaid.toString(),
    tier: purchase.tier,
    blockNumber: Number(blockNumber),
  };

  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    const result = await apiPost("/presale/events", payload);
    if (result.success) return;
    if (attempt < RETRY_DELAYS.length) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
    }
  }
}

export interface UsePresaleEventsResult {
  readonly recentPurchases: readonly RecentPurchase[];
  readonly lastPurchaseTimestamp: number | null;
  readonly isDeployed: boolean;
}

export interface UsePresaleEventsOptions {
  readonly enabled?: boolean;
}

export function usePresaleEvents(
  options: UsePresaleEventsOptions = {},
): UsePresaleEventsResult {
  const { enabled = true } = options;
  const queryClient = useQueryClient();
  const router = useRouter();
  const { genesisPresale: presaleAddress, presaleVesting: vestingAddress } =
    getAddresses();
  const isDeployed = presaleAddress !== zeroAddress;
  const isVestingDeployed = vestingAddress !== zeroAddress;
  const shouldWatch = enabled && isDeployed;

  useWatchContractEvent({
    address: presaleAddress,
    abi: genesisPresaleAbi,
    eventName: "TokensPurchased",
    enabled: shouldWatch,
    pollingInterval: 5_000,
    onLogs(logs) {
      for (const log of logs) {
        const { args } = log;
        if (!args || !("buyer" in args) || !args.buyer) continue;
        if (!log.transactionHash) continue;

        const buyer = args.buyer as string;
        const tier =
          (args as Record<string, unknown>).tier as number | undefined;
        const usdcAmount =
          (args as Record<string, unknown>).usdcAmount as bigint | undefined;
        const tokenAmount =
          (args as Record<string, unknown>).tokenAmount as bigint | undefined;
        if (tokenAmount == null) continue;

        const purchase: RecentPurchase = {
          buyer,
          amount: tokenAmount,
          tier: tier ?? 0,
          txHash: log.transactionHash ?? "",
          timestamp: Date.now(),
          usdcPaid: usdcAmount ?? 0n,
        };

        useAppStore.getState().addPurchase(purchase);

        if (log.blockNumber != null) {
          persistEventWithRetry(purchase, log.blockNumber).catch(() => {});
        }

        queryClient.invalidateQueries({ queryKey: ["readContracts"] });
        queryClient.invalidateQueries({ queryKey: ["readContract"] });
      }
    },
  });

  useWatchContractEvent({
    address: vestingAddress,
    abi: presaleVestingAbi,
    eventName: "TGETriggered",
    enabled: enabled && isVestingDeployed,
    pollingInterval: 5_000,
    onLogs() {
      setTimeout(() => {
        router.push("/presale/dashboard");
      }, 2000);
      queryClient.invalidateQueries({ queryKey: ["readContracts"] });
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
    },
  });

  const recentPurchases = useAppStore((s) => s.recentPurchases);
  const lastPurchaseTimestamp = useAppStore((s) => s.lastPurchaseTimestamp);

  return { recentPurchases, lastPurchaseTimestamp, isDeployed };
}
