"use client";

import type { ReactNode } from "react";
import { Web3Provider } from "./Web3Provider";
import { AuthProvider } from "./AuthProvider";

export function AppProvider({ children }: { readonly children: ReactNode }) {
  return (
    <Web3Provider>
      <AuthProvider>{children}</AuthProvider>
    </Web3Provider>
  );
}
