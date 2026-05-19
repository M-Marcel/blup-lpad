import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ---------------------------------------------------------------------------
// Mock the chains module so we can control TARGET_CHAIN per test group.
// The explorer module reads TARGET_CHAIN at import time to compute BASESCAN_URL,
// so we need vi.mock + dynamic import with resetModules to swap chains.
// ---------------------------------------------------------------------------

const BASE_MAINNET_ID = 8453;
const BASE_SEPOLIA_ID = 84532;

const baseChain = {
  id: BASE_MAINNET_ID,
  blockExplorers: { default: { url: "https://basescan.org" } },
};
const baseSepoliaChain = {
  id: BASE_SEPOLIA_ID,
  blockExplorers: { default: { url: "https://sepolia.basescan.org" } },
};

// Mutable ref so we can switch it between test groups
const mockState = { targetChain: baseSepoliaChain as typeof baseChain };

vi.mock("@/lib/chains", () => ({
  get TARGET_CHAIN() {
    return mockState.targetChain;
  },
}));

// We also need to mock viem/chains since explorer.ts imports { base, baseSepolia } from it
vi.mock("viem/chains", () => ({
  base: baseChain,
  baseSepolia: baseSepoliaChain,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loadExplorer() {
  vi.resetModules();
  // Re-apply mocks after resetModules by re-importing
  return await import("@/lib/explorer");
}

// ---------------------------------------------------------------------------
// Tests — Base Sepolia (default / testnet)
// ---------------------------------------------------------------------------

describe("explorer — Base Sepolia", () => {
  beforeEach(() => {
    mockState.targetChain = baseSepoliaChain;
  });

  it("txUrl generates sepolia tx link", async () => {
    const { txUrl } = await loadExplorer();
    expect(txUrl("0xabc")).toBe("https://sepolia.basescan.org/tx/0xabc");
  });

  it("addressUrl generates sepolia address link", async () => {
    const { addressUrl } = await loadExplorer();
    expect(addressUrl("0xdef")).toBe(
      "https://sepolia.basescan.org/address/0xdef",
    );
  });

  it("tokenUrl generates sepolia token link with tokenId", async () => {
    const { tokenUrl } = await loadExplorer();
    expect(tokenUrl("0xcontract", 42)).toBe(
      "https://sepolia.basescan.org/token/0xcontract?a=42",
    );
  });

  it("tokenUrl accepts string tokenId", async () => {
    const { tokenUrl } = await loadExplorer();
    expect(tokenUrl("0xcontract", "99")).toBe(
      "https://sepolia.basescan.org/token/0xcontract?a=99",
    );
  });

  it("contractUrl generates sepolia contract link", async () => {
    const { contractUrl } = await loadExplorer();
    expect(contractUrl("0xcontract")).toBe(
      "https://sepolia.basescan.org/token/0xcontract",
    );
  });
});

// ---------------------------------------------------------------------------
// Tests — Base Mainnet
// ---------------------------------------------------------------------------

describe("explorer — Base Mainnet", () => {
  beforeEach(() => {
    mockState.targetChain = baseChain;
  });

  it("txUrl generates mainnet tx link", async () => {
    const { txUrl } = await loadExplorer();
    expect(txUrl("0xabc")).toBe("https://basescan.org/tx/0xabc");
  });

  it("addressUrl generates mainnet address link", async () => {
    const { addressUrl } = await loadExplorer();
    expect(addressUrl("0xdef")).toBe("https://basescan.org/address/0xdef");
  });

  it("tokenUrl generates mainnet token link with tokenId", async () => {
    const { tokenUrl } = await loadExplorer();
    expect(tokenUrl("0xcontract", 42)).toBe(
      "https://basescan.org/token/0xcontract?a=42",
    );
  });

  it("contractUrl generates mainnet contract link", async () => {
    const { contractUrl } = await loadExplorer();
    expect(contractUrl("0xcontract")).toBe(
      "https://basescan.org/token/0xcontract",
    );
  });
});
