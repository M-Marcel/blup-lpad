// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNftSupply } from "@/hooks/useNftSupply";
import type { SupplyResponse } from "@/types/nft";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockApiGet = vi.fn();

vi.mock("@/lib/api-client", () => ({
  apiGet: (...args: unknown[]) => mockApiGet(...args),
}));

const mockSetSupply = vi.fn();

vi.mock("@/store/useAppStore", () => ({
  useAppStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ setSupply: mockSetSupply }),
}));

/* ------------------------------------------------------------------ */
/*  Fixtures                                                           */
/* ------------------------------------------------------------------ */

const supplyData: SupplyResponse = {
  minted: 150,
  max: 1000,
  remaining: 850,
  percent: 15,
  eliteMinted: 100,
  legendMinted: 50,
  eliteActive: 80,
  eliteAvailable: 920,
  totalActive: 130,
  totalCap: 1000,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const flushMicrotasks = () => act(() => Promise.resolve());

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("useNftSupply", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockApiGet.mockReset();
    mockSetSupply.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fetches supply on mount", async () => {
    mockApiGet.mockResolvedValue({ success: true, data: supplyData });

    const { result } = renderHook(() => useNftSupply());

    await flushMicrotasks();

    expect(mockApiGet).toHaveBeenCalledWith("/nft/supply");
    expect(result.current.supply).toEqual(supplyData);
  });

  it("sets loading false after fetch", async () => {
    mockApiGet.mockResolvedValue({ success: true, data: supplyData });

    const { result } = renderHook(() => useNftSupply());

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await flushMicrotasks();

    expect(result.current.isLoading).toBe(false);
  });

  it("sets error on failure", async () => {
    mockApiGet.mockResolvedValue({ success: false, error: "Service unavailable" });

    const { result } = renderHook(() => useNftSupply());

    await flushMicrotasks();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("Service unavailable");
    expect(result.current.supply).toBeNull();
  });

  it("polls at 15s interval", async () => {
    mockApiGet.mockResolvedValue({ success: true, data: supplyData });

    renderHook(() => useNftSupply());

    // Initial fetch
    await flushMicrotasks();
    expect(mockApiGet).toHaveBeenCalledTimes(1);

    // Advance 15s — second poll
    act(() => {
      vi.advanceTimersByTime(15_000);
    });
    await flushMicrotasks();
    expect(mockApiGet).toHaveBeenCalledTimes(2);

    // Advance another 15s — third poll
    act(() => {
      vi.advanceTimersByTime(15_000);
    });
    await flushMicrotasks();
    expect(mockApiGet).toHaveBeenCalledTimes(3);
  });

  it("refetch triggers new fetch", async () => {
    mockApiGet.mockResolvedValue({ success: true, data: supplyData });

    const { result } = renderHook(() => useNftSupply());

    await flushMicrotasks();
    expect(mockApiGet).toHaveBeenCalledTimes(1);

    const updatedSupply: SupplyResponse = { ...supplyData, minted: 200 };
    mockApiGet.mockResolvedValue({ success: true, data: updatedSupply });

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockApiGet).toHaveBeenCalledTimes(2);
    expect(result.current.supply).toEqual(updatedSupply);
  });

  it("syncs to Zustand store: eliteMinted, legendMinted, totalMinted", async () => {
    mockApiGet.mockResolvedValue({ success: true, data: supplyData });

    renderHook(() => useNftSupply());

    await flushMicrotasks();

    expect(mockSetSupply).toHaveBeenCalledWith({
      eliteMinted: 100,
      legendMinted: 50,
      totalMinted: 150,
    });
  });
});
