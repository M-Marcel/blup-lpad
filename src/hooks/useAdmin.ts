"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";

const ADMIN_WALLETS_RAW = process.env.NEXT_PUBLIC_ADMIN_WALLETS ?? "";

const ADMIN_SET = new Set(
  ADMIN_WALLETS_RAW.split(",")
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean),
);

export interface UseAdminResult {
  readonly isAdmin: boolean;
  readonly isLoading: boolean;
}

export function useAdmin(): UseAdminResult {
  const { address, isConnecting } = useAccount();

  const isAdmin = useMemo(() => {
    if (!address) return false;
    return ADMIN_SET.has(address.toLowerCase());
  }, [address]);

  return { isAdmin, isLoading: isConnecting };
}
