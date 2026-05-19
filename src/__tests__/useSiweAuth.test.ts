// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useSiweAuth } from "@/hooks/useSiweAuth";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockSignMessageAsync = vi.fn();
let mockAddress: string | undefined = "0xABCabc1234567890abcdef1234567890ABCDEF00";
let mockIsConnected = true;

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: mockAddress, isConnected: mockIsConnected }),
  useSignMessage: () => ({ signMessageAsync: mockSignMessageAsync }),
}));

const mockApiPost = vi.fn();
const mockApiGet = vi.fn();
const mockApiDelete = vi.fn();

vi.mock("@/lib/api-client", () => ({
  apiPost: (...args: unknown[]) => mockApiPost(...args),
  apiGet: (...args: unknown[]) => mockApiGet(...args),
  apiDelete: (...args: unknown[]) => mockApiDelete(...args),
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function resetMocks() {
  mockAddress = "0xABCabc1234567890abcdef1234567890ABCDEF00";
  mockIsConnected = true;
  mockSignMessageAsync.mockReset();
  mockApiPost.mockReset();
  mockApiGet.mockReset();
  mockApiDelete.mockReset();

  // Default: /auth/me returns not authenticated
  mockApiGet.mockResolvedValue({ success: false, error: "not authenticated" });
  mockApiDelete.mockResolvedValue({ success: true, data: {} });
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("useSiweAuth", () => {
  beforeEach(() => {
    resetMocks();
  });

  it("initially not authenticated", async () => {
    const { result } = renderHook(() => useSiweAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
    });
    expect(result.current.isSigningIn).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("signIn flow: challenge → sign → verify → authenticated", async () => {
    mockApiPost
      .mockResolvedValueOnce({
        success: true,
        data: { message: "Sign this message", nonce: "abc123" },
      })
      .mockResolvedValueOnce({
        success: true,
        data: { address: mockAddress },
      });

    mockSignMessageAsync.mockResolvedValue("0xSIGNATURE");

    const { result } = renderHook(() => useSiweAuth());

    await act(async () => {
      await result.current.signIn();
    });

    expect(mockApiPost).toHaveBeenCalledWith("/auth/challenge", {
      address: mockAddress,
    });
    expect(mockSignMessageAsync).toHaveBeenCalledWith({
      message: "Sign this message",
    });
    expect(mockApiPost).toHaveBeenCalledWith("/auth/verify", {
      message: "Sign this message",
      signature: "0xSIGNATURE",
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("signIn handles user rejection → sets error 'Sign-in cancelled'", async () => {
    mockApiPost.mockResolvedValueOnce({
      success: true,
      data: { message: "Sign this message", nonce: "abc123" },
    });

    mockSignMessageAsync.mockRejectedValue(new Error("User rejected the request"));

    const { result } = renderHook(() => useSiweAuth());

    await act(async () => {
      await result.current.signIn();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe("Sign-in cancelled");
  });

  it("signIn handles server error → sets error message", async () => {
    mockApiPost.mockResolvedValueOnce({
      success: false,
      error: "Internal server error",
    });

    const { result } = renderHook(() => useSiweAuth());

    await act(async () => {
      await result.current.signIn();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe("Internal server error");
  });

  it("signOut calls DELETE /auth/session and sets isAuthenticated false", async () => {
    // First sign in
    mockApiPost
      .mockResolvedValueOnce({
        success: true,
        data: { message: "msg", nonce: "n" },
      })
      .mockResolvedValueOnce({
        success: true,
        data: { address: mockAddress },
      });
    mockSignMessageAsync.mockResolvedValue("0xSIG");

    const { result } = renderHook(() => useSiweAuth());

    await act(async () => {
      await result.current.signIn();
    });
    expect(result.current.isAuthenticated).toBe(true);

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockApiDelete).toHaveBeenCalledWith("/auth/session");
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("when wallet address changes, auto-signs out", async () => {
    // Sign in first
    mockApiPost
      .mockResolvedValueOnce({
        success: true,
        data: { message: "msg", nonce: "n" },
      })
      .mockResolvedValueOnce({
        success: true,
        data: { address: mockAddress },
      });
    mockSignMessageAsync.mockResolvedValue("0xSIG");

    const { result, rerender } = renderHook(() => useSiweAuth());

    await act(async () => {
      await result.current.signIn();
    });
    expect(result.current.isAuthenticated).toBe(true);

    mockApiDelete.mockClear();

    // Change the address
    mockAddress = "0x1111111111111111111111111111111111111111";

    await act(async () => {
      rerender();
    });

    await waitFor(() => {
      expect(mockApiDelete).toHaveBeenCalledWith("/auth/session");
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  it("when disconnected, auto-signs out", async () => {
    // Sign in first
    mockApiPost
      .mockResolvedValueOnce({
        success: true,
        data: { message: "msg", nonce: "n" },
      })
      .mockResolvedValueOnce({
        success: true,
        data: { address: mockAddress },
      });
    mockSignMessageAsync.mockResolvedValue("0xSIG");

    const { result, rerender } = renderHook(() => useSiweAuth());

    await act(async () => {
      await result.current.signIn();
    });
    expect(result.current.isAuthenticated).toBe(true);

    mockApiDelete.mockClear();

    // Disconnect
    mockIsConnected = false;

    await act(async () => {
      rerender();
    });

    await waitFor(() => {
      expect(mockApiDelete).toHaveBeenCalledWith("/auth/session");
    });

    // isAuthenticated should be false because isConnected is false
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("isAuthenticated is false when not connected even if server says authenticated", async () => {
    mockIsConnected = false;
    mockApiGet.mockResolvedValue({ success: true, data: { address: mockAddress } });

    const { result } = renderHook(() => useSiweAuth());

    await waitFor(() => {
      // The hook returns isAuthenticated && isConnected
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
