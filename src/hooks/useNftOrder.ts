"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { apiGet, apiPost } from "@/lib/api-client";
import { useAppStore } from "@/store/useAppStore";
import type { OrderResponse, CreateOrderInput, OrderStatus } from "@/types/nft";

const POLL_INTERVAL_MS = 2_500;

const TERMINAL_STATUSES: ReadonlySet<OrderStatus> = new Set([
  "minted",
  "failed",
  "refunded",
]);

export interface UseNftOrderResult {
  readonly order: OrderResponse | null;
  readonly isCreating: boolean;
  readonly isPolling: boolean;
  readonly error: string | null;
  readonly createOrder: (input: CreateOrderInput) => Promise<string | null>;
  readonly fetchOrder: (orderId: string) => Promise<void>;
  readonly startPolling: (orderId: string) => void;
  readonly stopPolling: () => void;
}

export function useNftOrder(): UseNftOrderResult {
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const setNftOrder = useAppStore((s) => s.setNftOrder);

  const syncStore = useCallback(
    (o: OrderResponse) => {
      setNftOrder({ currentOrderId: o.id, orderStatus: o.status });
    },
    [setNftOrder],
  );

  const fetchOrder = useCallback(
    async (orderId: string) => {
      const result = await apiGet<OrderResponse>(`/nft/orders/${orderId}`);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setOrder(result.data);
      setError(null);
      syncStore(result.data);
    },
    [syncStore],
  );

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const startPolling = useCallback(
    (orderId: string) => {
      stopPolling();
      setIsPolling(true);

      const poll = async () => {
        const result = await apiGet<OrderResponse>(`/nft/orders/${orderId}`);

        if (!result.success) {
          setError(result.error);
          return;
        }

        setOrder(result.data);
        setError(null);
        syncStore(result.data);

        if (TERMINAL_STATUSES.has(result.data.status)) {
          stopPolling();
        }
      };

      poll();
      intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    },
    [stopPolling, syncStore],
  );

  const createOrder = useCallback(
    async (input: CreateOrderInput): Promise<string | null> => {
      setIsCreating(true);
      setError(null);

      const result = await apiPost<OrderResponse>("/nft/orders", input);

      setIsCreating(false);

      if (!result.success) {
        setError(result.error);
        return null;
      }

      setOrder(result.data);
      syncStore(result.data);
      return result.data.id;
    },
    [syncStore],
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    order,
    isCreating,
    isPolling,
    error,
    createOrder,
    fetchOrder,
    startPolling,
    stopPolling,
  };
}
