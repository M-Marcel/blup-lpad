import { describe, it, expect } from "vitest";
import { parseContractError, getErrorMessage } from "@/lib/errors";

describe("parseContractError", () => {
  it("returns 'Transaction cancelled' for user rejection", () => {
    expect(parseContractError(new Error("User rejected the request"))).toBe(
      "Transaction cancelled",
    );
    expect(parseContractError(new Error("User denied transaction"))).toBe(
      "Transaction cancelled",
    );
  });

  it("maps NotQualified revert", () => {
    expect(
      parseContractError(new Error("execution reverted: NotQualified()")),
    ).toBe("Your wallet is not qualified for the presale");
  });

  it("maps NoTierAssigned revert", () => {
    expect(
      parseContractError(new Error("execution reverted: NoTierAssigned()")),
    ).toBe("Your wallet has no tier assigned. Contact support.");
  });

  it("maps PresaleNotOpen revert", () => {
    expect(
      parseContractError(new Error("execution reverted: PresaleNotOpen()")),
    ).toBe("The presale is not currently open");
  });

  it("maps PoolExhausted revert", () => {
    expect(
      parseContractError(new Error("execution reverted: PoolExhausted()")),
    ).toBe("All presale tokens have been claimed");
  });

  it("maps ExceedsMaxSpend revert", () => {
    expect(
      parseContractError(new Error("execution reverted: ExceedsMaxSpend()")),
    ).toBe("Purchase would exceed your tier spend cap");
  });

  it("maps ExceedsTokenCap revert", () => {
    expect(
      parseContractError(new Error("execution reverted: ExceedsTokenCap()")),
    ).toBe("Purchase would exceed your 10,000 ACTX cap");
  });

  it("maps MaxParticipantsReached revert", () => {
    expect(
      parseContractError(
        new Error("execution reverted: MaxParticipantsReached()"),
      ),
    ).toBe("The presale has reached its 300 founder limit");
  });

  it("maps PresaleWindowExpired revert", () => {
    expect(
      parseContractError(
        new Error("execution reverted: PresaleWindowExpired()"),
      ),
    ).toBe("The 7-day presale window has expired");
  });

  it("maps InsufficientAllowance revert", () => {
    expect(
      parseContractError(
        new Error("execution reverted: InsufficientAllowance()"),
      ),
    ).toBe("USDC approval needed first");
    expect(
      parseContractError(new Error("ERC20: insufficient allowance")),
    ).toBe("USDC approval needed first");
  });

  it("maps InsufficientBalance revert", () => {
    expect(
      parseContractError(
        new Error("execution reverted: InsufficientBalance()"),
      ),
    ).toBe("Not enough USDC in your wallet");
    expect(
      parseContractError(new Error("ERC20: insufficient balance")),
    ).toBe("Not enough USDC in your wallet");
  });

  it("passes through unknown errors unchanged", () => {
    expect(parseContractError(new Error("some random error"))).toBe(
      "some random error",
    );
  });

  it("handles non-Error inputs", () => {
    expect(parseContractError("string error")).toBe("string error");
    expect(parseContractError(42)).toBe("An unexpected error occurred");
    expect(parseContractError(null)).toBe("An unexpected error occurred");
  });
});

describe("getErrorMessage", () => {
  it("extracts message from Error", () => {
    expect(getErrorMessage(new Error("test"))).toBe("test");
  });

  it("returns string input directly", () => {
    expect(getErrorMessage("hello")).toBe("hello");
  });

  it("returns fallback for unknown types", () => {
    expect(getErrorMessage(123)).toBe("An unexpected error occurred");
    expect(getErrorMessage(null)).toBe("An unexpected error occurred");
    expect(getErrorMessage(undefined)).toBe("An unexpected error occurred");
  });
});
