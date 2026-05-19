"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { useFounderStatus } from "@/hooks/useFounderStatus";
import { useUSDCBalance, useUSDCAllowance } from "@/hooks/useUSDC";
import { usePresaleWrite } from "@/hooks/usePresaleWrite";
import { calculateCost, formatACTX, formatUSDC } from "@/lib/formatting";
import { Field } from "@/components/shared/Field";
import { ApproveButton } from "./ApproveButton";
import { PurchaseButton } from "./PurchaseButton";
import { PurchaseReceipt } from "./PurchaseReceipt";
import { PriceDisplay } from "./PriceDisplay";
import { AlertCircle, Clock } from "lucide-react";

type FormStep = "input" | "approving" | "purchasing" | "completed";

const ONE_TOKEN = 10n ** 18n;

export function PurchaseForm() {
  const { address } = useAccount();
  const { founderStatus: founder } = useFounderStatus();
  const { balance: usdcBalance, refetch: refetchBalance } =
    useUSDCBalance(address);
  const { allowance, refetch: refetchAllowance } = useUSDCAllowance(address);
  const presaleWrite = usePresaleWrite();

  const [inputValue, setInputValue] = useState("");
  const [step, setStep] = useState<FormStep>("input");
  const [isRefreshingAllowance, setIsRefreshingAllowance] = useState(false);

  const parsedTokenAmount = useMemo(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || isNaN(Number(trimmed)) || Number(trimmed) <= 0) return 0n;
    const whole = Math.floor(Number(trimmed));
    if (whole <= 0) return 0n;
    return parseUnits(String(whole), 18);
  }, [inputValue]);

  const usdcCost = useMemo(
    () => calculateCost(parsedTokenAmount, founder.tierPrice),
    [parsedTokenAmount, founder.tierPrice],
  );

  const launchValue = useMemo(() => {
    if (parsedTokenAmount === 0n) return "$0.00";
    const tokens = parseFloat(formatUnits(parsedTokenAmount, 18));
    const value = tokens * 0.1;
    return `$${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [parsedTokenAmount]);

  const maxTokens = useMemo(() => {
    if (founder.tierPrice === 0n) return 0n;
    const affordableTokens = (usdcBalance * ONE_TOKEN) / founder.tierPrice;
    const usdcCapTokens =
      founder.tierPrice > 0n
        ? (founder.usdcCapRemaining * ONE_TOKEN) / founder.tierPrice
        : 0n;
    let max = founder.tokenCapRemaining;
    if (usdcCapTokens < max) max = usdcCapTokens;
    if (affordableTokens < max) max = affordableTokens;
    return max;
  }, [
    usdcBalance,
    founder.tierPrice,
    founder.usdcCapRemaining,
    founder.tokenCapRemaining,
  ]);

  const validation = useMemo(() => {
    if (parsedTokenAmount === 0n) return null;
    if (parsedTokenAmount > founder.tokenCapRemaining) {
      return `Exceeds your remaining token cap of ${formatACTX(founder.tokenCapRemaining, 0)} ACTX`;
    }
    if (usdcCost > founder.usdcCapRemaining) {
      return `Exceeds your remaining USDC spend cap of ${formatUSDC(founder.usdcCapRemaining)}`;
    }
    if (usdcCost > usdcBalance) {
      return `Insufficient USDC (need ${formatUSDC(usdcCost)}, have ${formatUSDC(usdcBalance)})`;
    }
    return null;
  }, [
    parsedTokenAmount,
    founder.tokenCapRemaining,
    founder.usdcCapRemaining,
    usdcCost,
    usdcBalance,
  ]);

  const isInputValid = parsedTokenAmount > 0n && validation === null;
  const needsApproval = usdcCost > 0n && allowance < usdcCost;
  const allowanceSufficient = usdcCost > 0n && allowance >= usdcCost;

  const fillPercent = useCallback(
    (pct: number) => {
      if (maxTokens === 0n) return;
      const amount = (maxTokens * BigInt(pct)) / 100n;
      const whole = Number(amount / ONE_TOKEN);
      setInputValue(String(Math.max(1, whole)));
    },
    [maxTokens],
  );

  const purchasedAmountRef = useRef(0n);

  const handleApprove = useCallback(() => {
    if (!isInputValid) return;
    setStep("approving");
    presaleWrite.approveUSDC(usdcCost);
  }, [isInputValid, presaleWrite, usdcCost]);

  const handlePurchase = useCallback(() => {
    if (!isInputValid) return;
    purchasedAmountRef.current = parsedTokenAmount;
    setStep("purchasing");
    presaleWrite.purchaseTokens(parsedTokenAmount, founder.tierPrice);
  }, [isInputValid, presaleWrite, parsedTokenAmount, founder.tierPrice]);

  useEffect(() => {
    if (step === "approving" && presaleWrite.isApproveConfirmed) {
      setIsRefreshingAllowance(true);
      setStep("input");
      Promise.resolve(refetchAllowance()).finally(() => {
        setIsRefreshingAllowance(false);
      });
    }
  }, [step, presaleWrite.isApproveConfirmed, refetchAllowance]);

  useEffect(() => {
    if (step === "purchasing" && presaleWrite.isPurchaseConfirmed) {
      setStep("completed");
      refetchBalance();
      refetchAllowance();
    }
  }, [step, presaleWrite.isPurchaseConfirmed, refetchBalance, refetchAllowance]);

  const handleNewPurchase = () => {
    setStep("input");
    setInputValue("");
    presaleWrite.reset();
  };

  if (!founder.canPurchase && !founder.isLoading) {
    const reason = !founder.isWhitelisted
      ? "You are not registered as a Genesis Founder."
      : !founder.isQualified
        ? "Complete the Genesis Sprint first."
        : founder.tokenCapRemaining === 0n
          ? "You have reached your purchase cap."
          : "The presale is not currently open.";

    return (
      <div className="surface flex flex-col items-center gap-4 rounded-xl p-8">
        <Clock className="h-10 w-10 text-[rgb(var(--fg-muted))]" />
        <div className="text-center">
          <h3 className="font-semibold text-[rgb(var(--fg-primary))]">
            Purchase Not Available
          </h3>
          <p className="mt-1 text-sm text-[rgb(var(--fg-muted))]">{reason}</p>
        </div>
      </div>
    );
  }

  if (step === "completed" && presaleWrite.purchaseHash) {
    return (
      <div className="space-y-4">
        <PurchaseReceipt
          purchaseHash={presaleWrite.purchaseHash}
          tokenAmount={parsedTokenAmount}
          usdcCost={usdcCost}
          tierName={founder.tierName}
        />
        {founder.tokenCapRemaining > 0n && (
          <button onClick={handleNewPurchase} className="btn w-full">
            Make Another Purchase
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="surface space-y-6 rounded-xl p-5">
      <div>
        <h3 className="text-lg font-semibold text-[rgb(var(--fg-primary))]">
          Purchase ACTX
        </h3>
        <PriceDisplay
          tierPrice={founder.tierPrice}
          tierName={founder.tierName}
          className="mt-1"
        />
      </div>

      {/* Token amount input */}
      <div className="space-y-2">
        <label
          htmlFor="token-amount"
          className="text-sm font-medium text-[rgb(var(--fg-muted))]"
        >
          Amount (ACTX)
        </label>
        <input
          id="token-amount"
          type="number"
          min="1"
          step="1"
          placeholder="Enter token amount"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={step !== "input"}
          className="w-full rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-overlay))] px-3 py-2.5 text-sm text-[rgb(var(--fg-primary))] placeholder:text-[rgb(var(--fg-muted))]/50 focus:border-[var(--blessup-green)] focus:outline-none focus:ring-1 focus:ring-[var(--blessup-green)] disabled:opacity-50"
        />

        <div className="flex gap-2">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              onClick={() => fillPercent(pct)}
              disabled={step !== "input" || maxTokens === 0n}
              className="chip flex-1 cursor-pointer transition-colors hover:bg-[rgb(var(--bg-overlay))] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={
                pct === 100
                  ? "Fill maximum amount"
                  : `Fill ${pct} percent of maximum`
              }
            >
              {pct === 100 ? "MAX" : `${pct}%`}
            </button>
          ))}
        </div>

        <p className="text-xs text-[rgb(var(--fg-muted))]">
          Remaining cap: {formatACTX(founder.tokenCapRemaining, 0)} ACTX
        </p>
      </div>

      {/* Cost summary */}
      {parsedTokenAmount > 0n && (
        <div className="space-y-2 rounded-lg bg-[rgb(var(--bg-overlay))] p-3">
          <Field label="Cost" value={`${formatUSDC(usdcCost)} USDC`} />
          <Field label="Your USDC Balance" value={formatUSDC(usdcBalance)} />
          <div className="border-t border-[rgb(var(--border-primary))]" />
          <Field
            label="Value at $0.10 launch"
            value={
              <span className="text-[var(--blessup-green)]">{launchValue}</span>
            }
          />
        </div>
      )}

      {/* Validation error */}
      {validation && (
        <div className="flex items-start gap-2 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{validation}</span>
        </div>
      )}

      {/* Write hook error */}
      {presaleWrite.error && presaleWrite.error !== "Transaction cancelled" && (
        <div className="flex items-start gap-2 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{presaleWrite.error}</span>
        </div>
      )}

      {/* Two-step purchase flow */}
      {isInputValid && (
        <div className="space-y-4">
          {needsApproval && (
            <ApproveButton
              usdcAmount={usdcCost}
              isApproving={presaleWrite.isApproving}
              isApproveConfirming={presaleWrite.isApproveConfirming}
              isApproveConfirmed={presaleWrite.isApproveConfirmed}
              approveHash={presaleWrite.approveHash}
              onApprove={handleApprove}
              disabled={step === "purchasing"}
            />
          )}

          {isRefreshingAllowance && (
            <p className="text-center text-xs text-[rgb(var(--fg-muted))]">
              Refreshing allowance...
            </p>
          )}

          <PurchaseButton
            tokenAmount={parsedTokenAmount}
            isPurchasing={presaleWrite.isPurchasing}
            isPurchaseConfirming={presaleWrite.isPurchaseConfirming}
            purchaseHash={presaleWrite.purchaseHash}
            onPurchase={handlePurchase}
            disabled={!allowanceSufficient || isRefreshingAllowance}
          />
        </div>
      )}
    </div>
  );
}
