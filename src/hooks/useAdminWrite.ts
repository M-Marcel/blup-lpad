"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useAccount,
  usePublicClient,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { parseAbi, type Hex } from "viem";
import { GENESIS_PRESALE_ABI } from "@/lib/abis/GenesisPresale";
import { PRESALE_VESTING_ABI } from "@/lib/abis/PresaleVesting";
import { getAddresses } from "@/lib/contracts";
import { TARGET_CHAIN_ID } from "@/lib/chains";
import { getErrorMessage } from "@/lib/errors";

const genesisPresaleAbi = parseAbi(GENESIS_PRESALE_ABI);
const presaleVestingAbi = parseAbi(PRESALE_VESTING_ABI);

const GAS_BUFFER_NUMERATOR = 120n;
const GAS_BUFFER_DENOMINATOR = 100n;
const DEFAULT_FALLBACK_GAS = 200_000n;
const BATCH_PER_WALLET_GAS = 50_000n;

export interface UseAdminWriteResult {
  readonly openPresale: () => void;
  readonly closePresale: () => void;
  readonly scheduleOpen: (openAt: bigint) => void;
  readonly triggerTGE: () => void;
  readonly qualifyWallet: (wallet: Hex) => void;
  readonly qualifyWallets: (wallets: readonly Hex[]) => void;
  readonly setWalletTier: (wallet: Hex, tier: number) => void;
  readonly setWalletTiers: (wallets: readonly Hex[], tiers: readonly number[]) => void;
  readonly fundPool: (amount: bigint) => void;
  readonly updateTierConfig: (tier: number, priceUsdc: bigint, maxSpendUsdc: bigint) => void;
  readonly pause: () => void;
  readonly unpause: () => void;

  readonly isPending: boolean;
  readonly isConfirming: boolean;
  readonly isConfirmed: boolean;
  readonly txHash: string | null;
  readonly error: string | null;
  readonly reset: () => void;
}

export function useAdminWrite(): UseAdminWriteResult {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { genesisPresale, presaleVesting } = getAddresses();

  const [manualError, setManualError] = useState<string | null>(null);

  const {
    writeContract,
    data: txData,
    isPending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txData,
      query: { enabled: Boolean(txData) },
    });

  const estimateGas = useCallback(
    async (
      contractAddress: Hex,
      abi: readonly string[],
      functionName: string,
      args: readonly unknown[],
      fallbackGas: bigint,
    ): Promise<bigint> => {
      if (!publicClient || !address) return fallbackGas;
      try {
        const estimated = await publicClient.estimateContractGas({
          address: contractAddress,
          abi: parseAbi(abi),
          functionName,
          args,
          account: address,
        });
        return (estimated * GAS_BUFFER_NUMERATOR) / GAS_BUFFER_DENOMINATOR;
      } catch (err) {
        const msg = err instanceof Error ? err.message.toLowerCase() : "";
        if (msg.includes("revert") || msg.includes("execution reverted")) {
          throw err;
        }
        return fallbackGas;
      }
    },
    [publicClient, address],
  );

  const execPresale = useCallback(
    async (functionName: string, args: readonly unknown[] = [], fallbackGas?: bigint) => {
      if (!address) return;
      setManualError(null);
      try {
        const gas = await estimateGas(
          genesisPresale,
          [...GENESIS_PRESALE_ABI],
          functionName,
          args,
          fallbackGas ?? DEFAULT_FALLBACK_GAS,
        );
        writeContract({
          chainId: TARGET_CHAIN_ID,
          address: genesisPresale,
          abi: genesisPresaleAbi,
          functionName: functionName as never,
          args: args as never,
          gas,
        });
      } catch (err) {
        setManualError(getErrorMessage(err));
      }
    },
    [address, genesisPresale, estimateGas, writeContract],
  );

  const execVesting = useCallback(
    async (functionName: string, args: readonly unknown[] = [], fallbackGas?: bigint) => {
      if (!address) return;
      setManualError(null);
      try {
        const gas = await estimateGas(
          presaleVesting,
          [...PRESALE_VESTING_ABI],
          functionName,
          args,
          fallbackGas ?? DEFAULT_FALLBACK_GAS,
        );
        writeContract({
          chainId: TARGET_CHAIN_ID,
          address: presaleVesting,
          abi: presaleVestingAbi,
          functionName: functionName as never,
          args: args as never,
          gas,
        });
      } catch (err) {
        setManualError(getErrorMessage(err));
      }
    },
    [address, presaleVesting, estimateGas, writeContract],
  );

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["readContracts"] });
    queryClient.invalidateQueries({ queryKey: ["readContract"] });
  }, [queryClient]);

  const error = useMemo(() => {
    if (manualError) return manualError;
    if (writeError) {
      const msg = getErrorMessage(writeError);
      if (msg.toLowerCase().includes("user rejected")) return "Transaction cancelled";
      return msg;
    }
    return null;
  }, [manualError, writeError]);

  const reset = useCallback(() => {
    resetWrite();
    setManualError(null);
  }, [resetWrite]);

  useEffect(() => {
    if (isConfirmed) {
      invalidateAll();
    }
  }, [isConfirmed, invalidateAll]);

  return {
    openPresale: () => execPresale("openPresale"),
    closePresale: () => execPresale("closePresale"),
    scheduleOpen: (openAt: bigint) => execPresale("scheduleOpen", [openAt]),
    triggerTGE: () => execVesting("triggerTGE"),
    qualifyWallet: (wallet: Hex) => execPresale("qualifyWallet", [wallet]),
    qualifyWallets: (wallets: readonly Hex[]) =>
      execPresale("qualifyWallets", [wallets], BATCH_PER_WALLET_GAS * BigInt(wallets.length)),
    setWalletTier: (wallet: Hex, tier: number) =>
      execPresale("setWalletTier", [wallet, tier]),
    setWalletTiers: (wallets: readonly Hex[], tiers: readonly number[]) =>
      execPresale("setWalletTiers", [wallets, tiers], BATCH_PER_WALLET_GAS * BigInt(wallets.length)),
    fundPool: (amount: bigint) => execPresale("fundPool", [amount]),
    updateTierConfig: (tier: number, priceUsdc: bigint, maxSpendUsdc: bigint) =>
      execPresale("updateTierConfig", [tier, priceUsdc, maxSpendUsdc]),
    pause: () => execPresale("pause"),
    unpause: () => execPresale("unpause"),

    isPending,
    isConfirming,
    isConfirmed,
    txHash: txData ?? null,
    error,
    reset,
  };
}
