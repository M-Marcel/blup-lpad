"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiGet } from "@/lib/api-client";
import { useAppStore } from "@/store/useAppStore";
import type { SupplyResponse } from "@/types/nft";

const POLL_INTERVAL_MS = 15_000;

export interface UseNftSupplyResult {
  readonly supply: SupplyResponse | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly refetch: () => Promise<void>;
}

export function useNftSupply(): UseNftSupplyResult {
  const [supply, setSupply] = useState<SupplyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const setStoreSupply = useAppStore((s) => s.setSupply);

  const fetchSupply = useCallback(async () => {
    const result = await apiGet<SupplyResponse>("/nft/supply");

    if (!result.success) {
      setError(result.error);
      return;
    }

    setSupply(result.data);
    setError(null);
    setStoreSupply({
      eliteMinted: result.data.eliteMinted,
      legendMinted: result.data.legendMinted,
      totalMinted: result.data.minted,
    });
  }, [setStoreSupply]);

  useEffect(() => {
    setIsLoading(true);
    fetchSupply().finally(() => setIsLoading(false));

    intervalRef.current = setInterval(fetchSupply, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchSupply]);

  return { supply, isLoading, error, refetch: fetchSupply };
}
