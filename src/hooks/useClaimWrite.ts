"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  useAccount,
  usePublicClient,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { parseAbi } from "viem";
import { PRESALE_VESTING_ABI } from "@/lib/abis/PresaleVesting";
import { getAddresses } from "@/lib/contracts";
import { TARGET_CHAIN_ID } from "@/lib/chains";
import { getErrorMessage } from "@/lib/errors";

const vestingAbi = parseAbi(PRESALE_VESTING_ABI);

const CLAIM_FALLBACK_GAS = 400_000n;
const GAS_BUFFER_NUMERATOR = 120n;
const GAS_BUFFER_DENOMINATOR = 100n;

export interface UseClaimWriteResult {
  readonly claimTokens: () => void;
  readonly isClaiming: boolean;
  readonly isConfirming: boolean;
  readonly isConfirmed: boolean;
  readonly claimHash: string | null;
  readonly error: string | null;
  readonly reset: () => void;
}

function parseClaimError(error: unknown): string {
  const msg = getErrorMessage(error);
  const lower = msg.toLowerCase();

  if (lower.includes("user rejected") || lower.includes("user denied")) {
    return "Transaction cancelled";
  }
  if (lower.includes("tgenottriggered")) {
    return "Token Generation Event has not been triggered yet";
  }
  if (lower.includes("nothingtoclaim")) {
    return "No tokens available to claim yet";
  }
  if (lower.includes("notqualified")) {
    return "Your wallet is not qualified";
  }

  return msg;
}

export function useClaimWrite(): UseClaimWriteResult {
  const queryClient = useQueryClient();
  const { presaleVesting } = getAddresses();
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const {
    writeContract: writeClaim,
    data: claimData,
    isPending: isClaimPending,
    error: claimError,
    reset: resetClaim,
  } = useWriteContract();

  const {
    isLoading: isClaimConfirming,
    isSuccess: isClaimConfirmed,
  } = useWaitForTransactionReceipt({
    hash: claimData,
    query: { enabled: Boolean(claimData) },
  });

  useEffect(() => {
    if (isClaimConfirmed) {
      queryClient.invalidateQueries({ queryKey: ["readContracts"] });
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
    }
  }, [isClaimConfirmed, queryClient]);

  const claimTokens = useCallback(async () => {
    if (!address || !publicClient) {
      writeClaim({
        chainId: TARGET_CHAIN_ID,
        address: presaleVesting,
        abi: vestingAbi,
        functionName: "claim",
        gas: CLAIM_FALLBACK_GAS,
      });
      return;
    }

    let gas = CLAIM_FALLBACK_GAS;
    try {
      const estimated = await publicClient.estimateContractGas({
        address: presaleVesting,
        abi: vestingAbi,
        functionName: "claim",
        account: address,
      });
      gas = (estimated * GAS_BUFFER_NUMERATOR) / GAS_BUFFER_DENOMINATOR;
    } catch {
      // Use fallback gas
    }

    writeClaim({
      chainId: TARGET_CHAIN_ID,
      address: presaleVesting,
      abi: vestingAbi,
      functionName: "claim",
      gas,
    });
  }, [address, publicClient, presaleVesting, writeClaim]);

  const error = useMemo(() => {
    if (!claimError) return null;
    return parseClaimError(claimError);
  }, [claimError]);

  return {
    claimTokens,
    isClaiming: isClaimPending,
    isConfirming: isClaimConfirming,
    isConfirmed: isClaimConfirmed,
    claimHash: claimData ?? null,
    error,
    reset: resetClaim,
  };
}
