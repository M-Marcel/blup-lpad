"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { Wordmark } from "./Wordmark";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { ChainChip } from "@/components/wallet/ChainChip";
import { MobileNav } from "./MobileNav";
import { cn } from "@/lib/cn";
import type { NavLink } from "@/types";

const NAV_LINKS: ReadonlyArray<NavLink> = [
  { href: "/", label: "Home", requiresAuth: false },
  { href: "/nft", label: "Founder NFT", requiresAuth: false },
  { href: "/presale", label: "Presale", requiresAuth: false },
  { href: "/sprint", label: "Genesis Sprint", requiresAuth: true },
];

const PUBLIC_LINKS = NAV_LINKS.filter((l) => !l.requiresAuth);

function NavContent({
  links,
  pathname,
}: {
  readonly links: ReadonlyArray<NavLink>;
  readonly pathname: string;
}) {
  return (
    <>
      <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--nft-accent))]",
              pathname === link.href
                ? "bg-[rgb(var(--nft-accent)/0.15)] text-[rgb(var(--fg-primary))]"
                : "text-[rgb(var(--fg-secondary))] hover:text-[rgb(var(--fg-primary))]",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex md:items-center md:gap-3">
          <ChainChip />
          <ConnectButton showBalance />
        </div>
        <MobileNav links={links} currentPath={pathname} />
      </div>
    </>
  );
}

function WalletAwareNav({ pathname }: { readonly pathname: string }) {
  const { isConnected } = useAccount();

  const visibleLinks = NAV_LINKS.filter(
    (link) => !link.requiresAuth || isConnected,
  );

  return <NavContent links={visibleLinks} pathname={pathname} />;
}

export function Header() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 border-b border-[rgb(var(--line-subtle)/0.6)] bg-[rgb(var(--bg-base)/0.7)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--nft-accent))] rounded-md">
          <Wordmark />
        </Link>

        {mounted ? (
          <WalletAwareNav pathname={pathname} />
        ) : (
          <NavContent links={PUBLIC_LINKS} pathname={pathname} />
        )}
      </div>
    </header>
  );
}
