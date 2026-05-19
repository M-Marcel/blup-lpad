import { describe, it, expect } from "vitest";
import {
  calculateCost,
  poolPercentage,
  formatACTX,
  formatUSDC,
  truncateAddress,
} from "@/lib/formatting";

const ONE_TOKEN = 10n ** 18n;
const ONE_USDC = 10n ** 6n;

describe("calculateCost", () => {
  it("returns 0 for zero token amount", () => {
    expect(calculateCost(0n, 50_000n)).toBe(0n);
  });

  it("returns 0 for zero price", () => {
    expect(calculateCost(100n * ONE_TOKEN, 0n)).toBe(0n);
  });

  it("returns 0 when both are zero", () => {
    expect(calculateCost(0n, 0n)).toBe(0n);
  });

  it("computes exact cost for 1 token at $0.05", () => {
    const price = 50_000n; // 0.05 USDC (6 decimals)
    const result = calculateCost(ONE_TOKEN, price);
    expect(result).toBe(price);
  });

  it("computes cost for 100 tokens at $0.05", () => {
    const price = 50_000n;
    const result = calculateCost(100n * ONE_TOKEN, price);
    expect(result).toBe(100n * price);
  });

  it("uses ceiling division — never underpays", () => {
    const price = 33_333n; // ~$0.033333 — doesn't divide evenly
    const result = calculateCost(ONE_TOKEN, price);
    // Ceiling div: (1e18 * 33333 + 1e18 - 1) / 1e18
    // = (33333e18 + 1e18 - 1) / 1e18 = 33333 + ceil((1e18 - 1)/1e18) = 33334
    expect(result).toBeGreaterThanOrEqual(price);
  });

  it("handles large token amounts without overflow", () => {
    const price = 50_000n;
    const largeAmount = 10_000n * ONE_TOKEN; // max per founder
    const result = calculateCost(largeAmount, price);
    expect(result).toBe(10_000n * price);
  });

  it("1 wei of tokens still produces a nonzero cost for nonzero price", () => {
    const price = 50_000n;
    const result = calculateCost(1n, price);
    // Ceiling div: (1 * 50000 + 1e18 - 1) / 1e18 = ceil(50000 / 1e18) = 1
    expect(result).toBe(1n);
  });
});

describe("poolPercentage", () => {
  it("returns 0 when total is 0", () => {
    expect(poolPercentage(100n, 0n)).toBe(0);
  });

  it("returns 100 when remaining equals total", () => {
    expect(poolPercentage(1000n, 1000n)).toBe(100);
  });

  it("returns 50 when half remaining", () => {
    expect(poolPercentage(500n, 1000n)).toBe(50);
  });

  it("returns 0 when nothing remaining", () => {
    expect(poolPercentage(0n, 1000n)).toBe(0);
  });
});

describe("formatACTX", () => {
  it("formats zero", () => {
    expect(formatACTX(0n)).toBe("0.00");
  });

  it("formats 1 ACTX", () => {
    expect(formatACTX(ONE_TOKEN)).toBe("1.00");
  });

  it("formats with custom decimals", () => {
    expect(formatACTX(ONE_TOKEN, 0)).toBe("1");
  });

  it("formats large amounts with commas", () => {
    expect(formatACTX(10_000n * ONE_TOKEN)).toBe("10,000.00");
  });
});

describe("formatUSDC", () => {
  it("formats zero", () => {
    expect(formatUSDC(0n)).toBe("$0.00");
  });

  it("formats 1 USDC", () => {
    expect(formatUSDC(ONE_USDC)).toBe("$1.00");
  });

  it("formats large amounts with commas", () => {
    expect(formatUSDC(1_000_000n * ONE_USDC)).toBe("$1,000,000.00");
  });
});

describe("truncateAddress", () => {
  it("truncates a standard address", () => {
    expect(truncateAddress("0x1234567890abcdef1234567890abcdef12345678")).toBe(
      "0x1234...5678",
    );
  });
});
