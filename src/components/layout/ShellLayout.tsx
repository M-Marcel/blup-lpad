"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface ShellLayoutProps {
  readonly children: ReactNode;
}

export function ShellLayout({ children }: ShellLayoutProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      {mounted && <Header />}
      <main className="flex-1">{children}</main>
      {mounted && <Footer />}
    </>
  );
}
