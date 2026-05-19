"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn";
import { TransactionStatus } from "@/components/shared/TransactionStatus";
import { AlertTriangle, AlertCircle } from "lucide-react";
import type { UseAdminWriteResult } from "@/hooks/useAdminWrite";

type TGEStep = "initial" | "confirm_text" | "countdown" | "triggered";

interface TGETriggerProps {
  readonly adminWrite: UseAdminWriteResult;
  readonly tgeTriggered: boolean;
  readonly className?: string;
}

export function TGETrigger({ adminWrite, tgeTriggered, className }: TGETriggerProps) {
  const [step, setStep] = useState<TGEStep>(tgeTriggered ? "triggered" : "initial");
  const [confirmText, setConfirmText] = useState("");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (tgeTriggered) setStep("triggered");
  }, [tgeTriggered]);

  useEffect(() => {
    if (step !== "countdown") return;
    if (countdown <= 0) return;

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const handleTrigger = useCallback(() => {
    adminWrite.triggerTGE();
  }, [adminWrite]);

  const handleReset = useCallback(() => {
    setStep("initial");
    setConfirmText("");
    setCountdown(3);
  }, []);

  if (step === "triggered") {
    return (
      <div className={cn("surface rounded-xl p-5", className)}>
        <div className="flex items-center gap-2 text-[var(--blessup-green)]">
          <AlertTriangle className="h-5 w-5" />
          <p className="font-semibold">TGE Already Triggered</p>
        </div>
        <p className="mt-2 text-sm text-[rgb(var(--fg-muted))]">
          The Token Generation Event has already been triggered. Vesting is active.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("surface space-y-4 rounded-xl p-5", className)}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-[var(--blessup-gold)]" />
        <h3 className="text-base font-semibold text-[rgb(var(--fg-primary))]">
          Trigger TGE
        </h3>
      </div>

      <div className="rounded-lg bg-rose-500/10 p-3">
        <p className="text-sm font-medium text-rose-400">
          This action is irreversible
        </p>
        <ul className="mt-2 space-y-1 text-xs text-rose-400/80">
          <li>- Starts the 90-day vesting schedule for all purchasers</li>
          <li>- Unlocks 25% TGE allocation immediately</li>
          <li>- Cannot be undone once confirmed</li>
        </ul>
      </div>

      {/* Step 1: Initial confirmation */}
      {step === "initial" && (
        <button
          onClick={() => setStep("confirm_text")}
          className="btn btn-gold w-full"
        >
          I understand — proceed to trigger TGE
        </button>
      )}

      {/* Step 2: Type confirmation */}
      {step === "confirm_text" && (
        <div className="space-y-3">
          <p className="text-sm text-[rgb(var(--fg-muted))]">
            Type <span className="font-mono font-bold text-[rgb(var(--fg-primary))]">TRIGGER TGE</span> to continue:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="TRIGGER TGE"
            className="w-full rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-overlay))] px-3 py-2.5 font-mono text-sm text-[rgb(var(--fg-primary))] placeholder:text-[rgb(var(--fg-muted))]/50 focus:border-[var(--blessup-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--blessup-gold)]"
          />
          <div className="flex gap-2">
            <button onClick={handleReset} className="btn flex-1">
              Cancel
            </button>
            <button
              onClick={() => {
                setCountdown(3);
                setStep("countdown");
              }}
              disabled={confirmText !== "TRIGGER TGE"}
              className="btn btn-gold flex-1"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Countdown */}
      {step === "countdown" && (
        <div className="space-y-3">
          <p className="text-center text-sm text-[rgb(var(--fg-muted))]">
            Final confirmation in:
          </p>
          <p className="text-center text-4xl font-bold text-[var(--blessup-gold)]">
            {countdown > 0 ? countdown : "GO"}
          </p>
          <div className="flex gap-2">
            <button onClick={handleReset} className="btn flex-1">
              Cancel
            </button>
            <button
              onClick={handleTrigger}
              disabled={countdown > 0 || adminWrite.isPending || adminWrite.isConfirming}
              className="btn btn-gold flex-1"
            >
              {adminWrite.isPending
                ? "Confirm in wallet..."
                : adminWrite.isConfirming
                  ? "Confirming..."
                  : "TRIGGER TGE NOW"}
            </button>
          </div>
        </div>
      )}

      {adminWrite.txHash && (
        <TransactionStatus hash={adminWrite.txHash} label="TGE Trigger" />
      )}

      {adminWrite.error && adminWrite.error !== "Transaction cancelled" && (
        <div className="flex items-start gap-2 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{adminWrite.error}</span>
        </div>
      )}
    </div>
  );
}
