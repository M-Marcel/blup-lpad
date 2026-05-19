"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { apiPost, apiGet, apiDelete, type ApiResult } from "@/lib/api-client";

interface ChallengeData {
  readonly message: string;
  readonly nonce: string;
}

interface VerifyData {
  readonly address: string;
}

interface MeData {
  readonly address: string;
}

export interface SiweAuthState {
  readonly isAuthenticated: boolean;
  readonly isSigningIn: boolean;
  readonly walletAddress: string | null;
  readonly error: string | null;
  readonly signIn: () => Promise<void>;
  readonly signOut: () => Promise<void>;
}

export function useSiweAuth(): SiweAuthState {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevAddressRef = useRef<string | undefined>(address);

  useEffect(() => {
    if (!isConnected) return;
    let cancelled = false;

    apiGet<MeData>("/auth/me").then((result) => {
      if (cancelled) return;
      setIsAuthenticated(result.success);
    });

    return () => {
      cancelled = true;
    };
  }, [isConnected]);

  useEffect(() => {
    const prev = prevAddressRef.current;
    prevAddressRef.current = address;

    if (prev && address && prev.toLowerCase() !== address.toLowerCase() && isAuthenticated) {
      apiDelete("/auth/session").finally(() => {
        setIsAuthenticated(false);
        setError(null);
      });
    }
  }, [address, isAuthenticated]);

  useEffect(() => {
    if (!isConnected && isAuthenticated) {
      apiDelete("/auth/session").finally(() => {
        setIsAuthenticated(false);
        setError(null);
      });
    }
  }, [isConnected, isAuthenticated]);

  const signIn = useCallback(async () => {
    if (!address || isSigningIn) return;

    setIsSigningIn(true);
    setError(null);

    try {
      const challengeResult: ApiResult<ChallengeData> = await apiPost("/auth/challenge", { address });
      if (!challengeResult.success) {
        throw new Error(challengeResult.error);
      }

      const message = challengeResult.data.message;
      if (!message) {
        throw new Error("No SIWE message received from server");
      }

      const signature = await signMessageAsync({ message });

      const verifyResult: ApiResult<VerifyData> = await apiPost("/auth/verify", {
        message,
        signature,
      });

      if (!verifyResult.success) {
        throw new Error(verifyResult.error);
      }

      setIsAuthenticated(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sign in";
      if (msg.toLowerCase().includes("user rejected") || msg.toLowerCase().includes("user denied")) {
        setError("Sign-in cancelled");
      } else {
        setError(msg);
      }
    } finally {
      setIsSigningIn(false);
    }
  }, [address, isSigningIn, signMessageAsync]);

  const signOut = useCallback(async () => {
    try {
      await apiDelete("/auth/session");
    } finally {
      setIsAuthenticated(false);
      setError(null);
    }
  }, []);

  return {
    isAuthenticated: isAuthenticated && isConnected,
    isSigningIn,
    walletAddress: address ?? null,
    error,
    signIn,
    signOut,
  };
}
