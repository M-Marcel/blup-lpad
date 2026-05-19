"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { apiGet, apiPost } from "@/lib/api-client";
import { useAppStore } from "@/store/useAppStore";
import type { KycStatus, KycStatusResponse, KycInitiateResponse } from "@/types";

export interface UseKycStatusResult {
  readonly kycStatus: KycStatus;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly refetch: () => void;
}

export function useKycStatus(): UseKycStatusResult {
  const { address } = useAccount();
  const setKycStatus = useAppStore((s) => s.setKycStatus);
  const [kycStatus, setLocalKycStatus] = useState<KycStatus>("not_started");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!address) {
      setLocalKycStatus("not_started");
      setKycStatus("not_started");
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await apiGet<KycStatusResponse>("/kyc/status");

    if (result.success) {
      setLocalKycStatus(result.data.kycStatus);
      setKycStatus(result.data.kycStatus);
    } else {
      setLocalKycStatus("not_started");
      setKycStatus("not_started");
    }

    setIsLoading(false);
  }, [address, setKycStatus]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (kycStatus !== "pending") return;

    const interval = setInterval(fetchStatus, 10_000);
    return () => clearInterval(interval);
  }, [kycStatus, fetchStatus]);

  return {
    kycStatus,
    isLoading,
    error,
    refetch: fetchStatus,
  };
}

export interface UseKycInitiateResult {
  readonly initiateKyc: () => Promise<string | null>;
  readonly isLoading: boolean;
  readonly error: string | null;
}

export function useKycInitiate(): UseKycInitiateResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateKyc = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    const result = await apiPost<KycInitiateResponse>("/kyc/initiate");

    setIsLoading(false);

    if (!result.success) {
      setError(result.error);
      return null;
    }

    if (result.data.alreadyApproved) {
      return null;
    }

    return result.data.inquiryUrl ?? null;
  }, []);

  return {
    initiateKyc,
    isLoading,
    error,
  };
}
