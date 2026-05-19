import { formatUnits } from "viem";

export function formatACTX(amount: bigint, decimals: number = 2): string {
  return Number(formatUnits(amount, 18)).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatUSDC(amount: bigint): string {
  return `$${Number(formatUnits(amount, 6)).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Ceiling division: ensures sufficient USDC for a given ACTX amount at a tier price.
export function calculateCost(
  tokenAmount: bigint,
  pricePerToken: bigint
): bigint {
  if (tokenAmount === 0n || pricePerToken === 0n) return 0n;
  const ONE_TOKEN = 10n ** 18n;
  return (tokenAmount * pricePerToken + ONE_TOKEN - 1n) / ONE_TOKEN;
}

export function poolPercentage(remaining: bigint, total: bigint): number {
  if (total === 0n) return 0;
  return Number((remaining * 10000n) / total) / 100;
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function daysSinceTGE(): number {
  const tgeDateStr = process.env.NEXT_PUBLIC_DEX_LAUNCH_DATE;
  if (!tgeDateStr) return 0;
  const tgeDate = new Date(tgeDateStr);
  if (isNaN(tgeDate.getTime())) return 0;
  const diff = Date.now() - tgeDate.getTime();
  if (diff < 0) return 0;
  return Math.min(90, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function daysUntil(target: Date): number {
  const diff = target.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
