// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNftOrder } from "@/hooks/useNftOrder";
import type { OrderResponse } from "@/types/nft";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockApiGet = vi.fn();
const mockApiPost = vi.fn();

vi.mock("@/lib/api-client", () => ({
  apiGet: (...args: unknown[]) => mockApiGet(...args),
  apiPost: (...args: unknown[]) => mockApiPost(...args),
}));

const mockSetNftOrder = vi.fn();

vi.mock("@/store/useAppStore", () => ({
  useAppStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ setNftOrder: mockSetNftOrder }),
}));

/* ------------------------------------------------------------------ */
/*  Fixtures                                                           */
/* ------------------------------------------------------------------ */

const baseOrder: OrderResponse = {
  id: "order-1",
  tier: "elite",
  payment: "stripe",
  wallet: "0xABC",
  upgradeFrom: null,
  amountUsd: 500,
  status: "pending",
  tokenId: null,
  txHash: null,
  externalRef: null,
  payAddress: null,
  payAmount: null,
  payCurrency: null,
  payExpiresAt: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Flush all pending microtasks (resolved promises) */
const flushMicrotasks = () => act(() => Promise.resolve());

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("useNftOrder", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    mockSetNftOrder.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("createOrder: calls POST /nft/orders and returns order ID on success", async () => {
    mockApiPost.mockResolvedValue({ success: true, data: baseOrder });

    const { result } = renderHook(() => useNftOrder());

    let orderId: string | null = null;
    await act(async () => {
      orderId = await result.current.createOrder({
        tier: "elite",
        payment: "stripe",
        wallet: "0xABC",
      });
    });

    expect(mockApiPost).toHaveBeenCalledWith("/nft/orders", {
      tier: "elite",
      payment: "stripe",
      wallet: "0xABC",
    });
    expect(orderId).toBe("order-1");
    expect(result.current.order).toEqual(baseOrder);
    expect(result.current.error).toBeNull();
    expect(mockSetNftOrder).toHaveBeenCalledWith({
      currentOrderId: "order-1",
      orderStatus: "pending",
    });
  });

  it("createOrder: returns null and sets error on failure", async () => {
    mockApiPost.mockResolvedValue({ success: false, error: "Bad request" });

    const { result } = renderHook(() => useNftOrder());

    let orderId: string | null = null;
    await act(async () => {
      orderId = await result.current.createOrder({
        tier: "elite",
        payment: "stripe",
        wallet: "0xABC",
      });
    });

    expect(orderId).toBeNull();
    expect(result.current.error).toBe("Bad request");
  });

  it("fetchOrder: calls GET /nft/orders/:id and updates order state", async () => {
    mockApiGet.mockResolvedValue({ success: true, data: baseOrder });

    const { result } = renderHook(() => useNftOrder());

    await act(async () => {
      await result.current.fetchOrder("order-1");
    });

    expect(mockApiGet).toHaveBeenCalledWith("/nft/orders/order-1");
    expect(result.current.order).toEqual(baseOrder);
    expect(result.current.error).toBeNull();
    expect(mockSetNftOrder).toHaveBeenCalledWith({
      currentOrderId: "order-1",
      orderStatus: "pending",
    });
  });

  it("fetchOrder: sets error on failure", async () => {
    mockApiGet.mockResolvedValue({ success: false, error: "Not found" });

    const { result } = renderHook(() => useNftOrder());

    await act(async () => {
      await result.current.fetchOrder("order-999");
    });

    expect(result.current.error).toBe("Not found");
  });

  it("startPolling: polls at 2.5s intervals and stops on terminal status", async () => {
    const processingOrder = { ...baseOrder, status: "processing" as const };
    const mintedOrder = { ...baseOrder, status: "minted" as const, tokenId: 42 };

    mockApiGet
      .mockResolvedValueOnce({ success: true, data: processingOrder })
      .mockResolvedValueOnce({ success: true, data: processingOrder })
      .mockResolvedValueOnce({ success: true, data: mintedOrder });

    const { result } = renderHook(() => useNftOrder());

    // startPolling fires an immediate poll
    act(() => {
      result.current.startPolling("order-1");
    });

    // Flush the immediate async poll
    await flushMicrotasks();

    expect(mockApiGet).toHaveBeenCalledTimes(1);
    expect(result.current.isPolling).toBe(true);

    // Advance 2.5s — second poll fires
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    await flushMicrotasks();

    expect(mockApiGet).toHaveBeenCalledTimes(2);

    // Advance 2.5s — third poll returns terminal "minted"
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    await flushMicrotasks();

    expect(mockApiGet).toHaveBeenCalledTimes(3);
    expect(result.current.isPolling).toBe(false);
    expect(result.current.order?.status).toBe("minted");
  });

  it("stopPolling: clears interval", async () => {
    mockApiGet.mockResolvedValue({ success: true, data: baseOrder });

    const { result } = renderHook(() => useNftOrder());

    act(() => {
      result.current.startPolling("order-1");
    });
    await flushMicrotasks();

    expect(result.current.isPolling).toBe(true);

    act(() => {
      result.current.stopPolling();
    });

    expect(result.current.isPolling).toBe(false);

    mockApiGet.mockClear();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    await flushMicrotasks();

    // No more calls after stopping
    expect(mockApiGet).not.toHaveBeenCalled();
  });

  it("cleanup on unmount clears interval", async () => {
    mockApiGet.mockResolvedValue({ success: true, data: baseOrder });

    const { result, unmount } = renderHook(() => useNftOrder());

    act(() => {
      result.current.startPolling("order-1");
    });
    await flushMicrotasks();

    expect(result.current.isPolling).toBe(true);

    mockApiGet.mockClear();
    unmount();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    await flushMicrotasks();

    expect(mockApiGet).not.toHaveBeenCalled();
  });
});
