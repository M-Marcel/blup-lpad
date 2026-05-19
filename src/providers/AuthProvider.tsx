"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAccount } from "wagmi";
import { useSiweAuth, type SiweAuthState } from "@/hooks/useSiweAuth";

const DEFAULT_AUTH_STATE: SiweAuthState = {
  isAuthenticated: false,
  isSigningIn: false,
  walletAddress: null,
  error: null,
  signIn: async () => {},
  signOut: async () => {},
};

const AuthContext = createContext<SiweAuthState>(DEFAULT_AUTH_STATE);

function AuthProviderInner({ children }: { readonly children: ReactNode }) {
  const auth = useSiweAuth();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && !auth.isAuthenticated && !auth.isSigningIn && !auth.error) {
      auth.signIn();
    }
  }, [isConnected, auth.isAuthenticated, auth.isSigningIn, auth.error, auth.signIn]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <AuthContext.Provider value={DEFAULT_AUTH_STATE}>
        {children}
      </AuthContext.Provider>
    );
  }

  return <AuthProviderInner>{children}</AuthProviderInner>;
}

export function useAuth(): SiweAuthState {
  return useContext(AuthContext);
}
