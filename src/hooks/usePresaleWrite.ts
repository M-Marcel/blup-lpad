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
import { USDC_ABI } from "@/lib/abis/USDC";
import { GENESIS_PRESALE_ABI } from "@/lib/abis/GenesisPresale";
import { getAddresses } from "@/lib/contracts";
import { TARGET_CHAIN_ID } from "@/lib/chains";
import { calculateCost } from "@/lib/formatting";
import { getErrorMessage, parseContractError } from "@/lib/errors";

const usdcAbi = parseAbi(USDC_ABI);
const genesisPresaleAbi = parseAbi(GENESIS_PRESALE_ABI);

const APPROVE_FALLBACK_GAS = 150_000n;
const PURCHASE_FALLBACK_GAS = 400_000n;
const GAS_BUFFER_NUMERATOR = 120n;
const GAS_BUFFER_DENOMINATOR = 100n;

export interface UsePresaleWriteResult {
  readonly approveUSDC: (amount: bigint) => void;
  readonly isApproving: boolean;
  readonly isApproveConfirming: boolean;
  readonly isApproveConfirmed: boolean;
  readonly approveHash: string | null;

  readonly purchaseTokens: (tokenAmount: bigint, tierPrice: bigint) => void;
  readonly isPurchasing: boolean;
  readonly isPurchaseConfirming: boolean;
  readonly isPurchaseConfirmed: boolean;
  readonly purchaseHash: string | null;

  readonly error: string | null;
  readonly reset: () => void;
}

export function usePresaleWrite(): UsePresaleWriteResult {
  const queryClient = useQueryClient();
  const { usdc, genesisPresale } = getAddresses();
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const [manualError, setManualError] = useState<string | null>(null);

  const {
    writeContract: writeApprove,
    data: approveData,
    isPending: isApprovePending,
    error: approveError,
    reset: resetApprove,
  } = useWriteContract();

  const {
    writeContract: writePurchase,
    data: purchaseData,
    isPending: isPurchasePending,
    error: purchaseError,
    reset: resetPurchase,
  } = useWriteContract();

  const {
    isLoading: isApproveConfirming,
    isSuccess: isApproveConfirmed,
  } = useWaitForTransactionReceipt({
    hash: approveData,
    query: { enabled: Boolean(approveData) },
  });

  const {
    isLoading: isPurchaseConfirming,
    isSuccess: isPurchaseConfirmed,
  } = useWaitForTransactionReceipt({
    hash: purchaseData,
    query: { enabled: Boolean(purchaseData) },
  });

  useEffect(() => {
    if (isApproveConfirmed) {
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
    }
  }, [isApproveConfirmed, queryClient]);

  useEffect(() => {
    if (isPurchaseConfirmed) {
      queryClient.invalidateQueries({ queryKey: ["readContracts"] });
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
    }
  }, [isPurchaseConfirmed, queryClient]);

  const estimateGasWithBuffer = useCallback(
    async (
      params: {
        address: Hex;
        abi: readonly string[];
        functionName: string;
        args?: readonly unknown[];
        account: Hex;
      },
      fallback: bigint,
    ): Promise<bigint> => {
      if (!publicClient) return fallback;
      try {
        const estimated = await publicClient.estimateContractGas({
          address: params.address as `0x${string}`,
          abi: parseAbi(params.abi as unknown as readonly string[]),
          functionName: params.functionName,
          args: params.args as readonly unknown[],
          account: params.account as `0x${string}`,
        });
        return (estimated * GAS_BUFFER_NUMERATOR) / GAS_BUFFER_DENOMINATOR;
      } catch (err) {
        const msg = err instanceof Error ? err.message.toLowerCase() : "";
        if (msg.includes("revert") || msg.includes("execution reverted")) {
          throw err;
        }
        return fallback;
      }
    },
    [publicClient],
  );

  const approveUSDC = useCallback(
    async (amount: bigint) => {
      if (!address) return;
      setManualError(null);

      try {
        const gas = await estimateGasWithBuffer(
          {
            address: usdc,
            abi: [...USDC_ABI],
            functionName: "approve",
            args: [genesisPresale, amount],
            account: address,
          },
          APPROVE_FALLBACK_GAS,
        );

        writeApprove({
          chainId: TARGET_CHAIN_ID,
          address: usdc,
          abi: usdcAbi,
          functionName: "approve",
          args: [genesisPresale, amount],
          gas,
        });
      } catch (err) {
        setManualError(parseContractError(err));
      }
    },
    [address, usdc, genesisPresale, estimateGasWithBuffer, writeApprove],
  );

  const purchaseTokens = useCallback(
    async (tokenAmount: bigint, tierPrice: bigint) => {
      if (!address) return;
      setManualError(null);

      try {
        const usdcCost = calculateCost(tokenAmount, tierPrice);

        const gas = await estimateGasWithBuffer(
          {
            address: genesisPresale,
            abi: [...GENESIS_PRESALE_ABI],
            functionName: "purchase",
            args: [usdcCost],
            account: address,
          },
          PURCHASE_FALLBACK_GAS,
        );

        writePurchase({
          chainId: TARGET_CHAIN_ID,
          address: genesisPresale,
          abi: genesisPresaleAbi,
          functionName: "purchase",
          args: [usdcCost],
          gas,
        });
      } catch (err) {
        setManualError(parseContractError(err));
      }
    },
    [address, genesisPresale, estimateGasWithBuffer, writePurchase],
  );

  const error = useMemo(() => {
    if (manualError) return manualError;
    if (approveError) return parseContractError(approveError);
    if (purchaseError) return parseContractError(purchaseError);
    return null;
  }, [manualError, approveError, purchaseError]);

  const reset = useCallback(() => {
    resetApprove();
    resetPurchase();
    setManualError(null);
  }, [resetApprove, resetPurchase]);

  return {
    approveUSDC,
    isApproving: isApprovePending,
    isApproveConfirming,
    isApproveConfirmed,
    approveHash: approveData ?? null,

    purchaseTokens,
    isPurchasing: isPurchasePending,
    isPurchaseConfirming,
    isPurchaseConfirmed,
    purchaseHash: purchaseData ?? null,

    error,
    reset,
  };
}
