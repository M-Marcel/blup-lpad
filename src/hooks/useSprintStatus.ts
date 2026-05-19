"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useReadContract } from "wagmi";
import { parseAbi } from "viem";
import { PROOF_OF_ACTION_ABI } from "@/lib/abis/ProofOfAction";
import { getAddresses } from "@/lib/contracts";
import { apiGet, apiPost } from "@/lib/api-client";
import type { SprintStatus } from "@/types";

const proofOfActionAbi = parseAbi(PROOF_OF_ACTION_ABI);

export interface UseSprintStatusResult {
  readonly sprintStatus: SprintStatus | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly completeSession: () => Promise<boolean>;
  readonly refetch: () => void;
}

export function useSprintStatus(): UseSprintStatusResult {
  const { address } = useAccount();
  const { proofOfAction } = getAddresses();

  const [sprintStatus, setSprintStatus] = useState<SprintStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChainResult = useReadContract({
    address: proofOfAction,
    abi: proofOfActionAbi,
    functionName: "isVerified",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  const onChainCompleted =
    onChainResult.status === "success"
      ? (onChainResult.data as boolean)
      : false;

  const fetchStatus = useCallback(async () => {
    if (!address) {
      setSprintStatus(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await apiGet<SprintStatus>("/sprint/status");

    if (result.success) {
      setSprintStatus(result.data);
    } else {
      setSprintStatus(null);
      if (result.error !== "Not found") {
        setError(result.error);
      }
    }

    setIsLoading(false);
  }, [address]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (!sprintStatus?.isComplete || onChainCompleted) return;

    const interval = setInterval(fetchStatus, 30_000);
    return () => clearInterval(interval);
  }, [sprintStatus?.isComplete, onChainCompleted, fetchStatus]);

  const mergedStatus: SprintStatus | null = sprintStatus
    ? {
        ...sprintStatus,
        markedOnChain: onChainCompleted || sprintStatus.markedOnChain,
      }
    : null;

  const completeSession = useCallback(async (): Promise<boolean> => {
    if (!address) return false;
    setError(null);

    const result = await apiPost<SprintStatus>("/sprint/complete");

    if (result.success) {
      setSprintStatus(result.data);
      return true;
    }

    setError(result.error);
    return false;
  }, [address]);

  return {
    sprintStatus: mergedStatus,
    isLoading,
    error,
    completeSession,
    refetch: fetchStatus,
  };
}
