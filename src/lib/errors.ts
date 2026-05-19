export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred";
}

export function parseContractError(error: unknown): string {
  const msg = getErrorMessage(error);
  const lower = msg.toLowerCase();

  if (lower.includes("user rejected") || lower.includes("user denied")) {
    return "Transaction cancelled";
  }
  if (lower.includes("notqualified")) {
    return "Your wallet is not qualified for the presale";
  }
  if (lower.includes("notierassigned")) {
    return "Your wallet has no tier assigned. Contact support.";
  }
  if (lower.includes("presalenotopen")) {
    return "The presale is not currently open";
  }
  if (lower.includes("poolexhausted")) {
    return "All presale tokens have been claimed";
  }
  if (lower.includes("exceedsmaxspend")) {
    return "Purchase would exceed your tier spend cap";
  }
  if (lower.includes("exceedstokencap")) {
    return "Purchase would exceed your 10,000 ACTX cap";
  }
  if (lower.includes("maxparticipantsreached")) {
    return "The presale has reached its 300 founder limit";
  }
  if (lower.includes("presalewindowexpired")) {
    return "The 7-day presale window has expired";
  }
  if (lower.includes("insufficientallowance") || lower.includes("insufficient allowance")) {
    return "USDC approval needed first";
  }
  if (lower.includes("insufficientbalance") || lower.includes("insufficient balance")) {
    return "Not enough USDC in your wallet";
  }

  return msg;
}
