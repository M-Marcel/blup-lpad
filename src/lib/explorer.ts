import { base, baseSepolia } from "viem/chains";
import { TARGET_CHAIN } from "./chains";

const BASESCAN_URL =
  TARGET_CHAIN.id === base.id
    ? base.blockExplorers.default.url
    : baseSepolia.blockExplorers.default.url;

export function txUrl(hash: string): string {
  return `${BASESCAN_URL}/tx/${hash}`;
}

export function addressUrl(addr: string): string {
  return `${BASESCAN_URL}/address/${addr}`;
}

export function tokenUrl(contractAddress: string, tokenId: number | string): string {
  return `${BASESCAN_URL}/token/${contractAddress}?a=${tokenId}`;
}

export function contractUrl(contractAddress: string): string {
  return `${BASESCAN_URL}/token/${contractAddress}`;
}
