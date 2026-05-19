import Link from "next/link";
import { TARGET_CHAIN } from "@/lib/chains";
import { getAddresses } from "@/lib/contracts";
import { addressUrl } from "@/lib/explorer";
import { truncateAddress } from "@/lib/formatting";

export function Footer() {
  const addresses = getAddresses();

  return (
    <footer className="border-t border-[rgb(var(--line-subtle)/0.6)] py-10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="mb-2 text-sm font-semibold">
              <span className="blessup-gradient-text">BlessUP</span> Network
            </h3>
            <p className="text-xs text-[rgb(var(--fg-muted))]">
              Inspiring and rewarding billions of business souls through
              gamified referral marketing.
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-[rgb(var(--fg-primary))]">
              Contracts
            </h3>
            <div className="flex flex-col gap-1">
              <ContractLink label="ACTX Token" address={addresses.actxToken} />
              <ContractLink label="Genesis Presale" address={addresses.genesisPresale} />
              <ContractLink label="Founder NFT" address={addresses.founderNft} />
            </div>
            <p className="mt-2 text-xs text-[rgb(var(--fg-muted))]">
              Network: {TARGET_CHAIN.name}
            </p>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-[rgb(var(--fg-primary))]">
              Resources
            </h3>
            <div className="flex flex-col gap-1">
              <Link
                href="/"
                className="text-xs text-[rgb(var(--fg-muted))] transition-colors hover:text-[rgb(var(--fg-primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--nft-accent))] rounded-sm"
              >
                Home
              </Link>
              <a
                href="https://blessup.network"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[rgb(var(--fg-muted))] transition-colors hover:text-[rgb(var(--fg-primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--nft-accent))] rounded-sm"
              >
                BlessUP Network
              </a>
              <a
                href="https://naxum.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[rgb(var(--fg-muted))] transition-colors hover:text-[rgb(var(--fg-primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--nft-accent))] rounded-sm"
              >
                NaXum Technologies
              </a>
            </div>
          </div>
        </div>

        <div className="gradient-divider mx-auto mt-8 w-full max-w-md" />

        <p className="mt-4 text-center text-xs text-[rgb(var(--fg-muted))]">
          &copy; {new Date().getFullYear()} BlessUP Technologies. All rights
          reserved. ACTX tokens are utility tokens and are not investment
          products.
        </p>
      </div>
    </footer>
  );
}

function ContractLink({
  label,
  address,
}: {
  readonly label: string;
  readonly address: string;
}) {
  const isZeroAddress =
    address === "0x0000000000000000000000000000000000000000";

  if (isZeroAddress) {
    return (
      <span className="text-xs text-[rgb(var(--fg-muted))]">
        {label}: <span className="italic">Not deployed</span>
      </span>
    );
  }

  return (
    <a
      href={addressUrl(address)}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs text-[rgb(var(--fg-muted))] transition-colors hover:text-[rgb(var(--fg-primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--nft-accent))] rounded-sm"
    >
      {label}: {truncateAddress(address)}
    </a>
  );
}
