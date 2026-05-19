"use client";

import { useState, useMemo, useCallback } from "react";
import { isAddress, type Hex } from "viem";
import { cn } from "@/lib/cn";
import { FounderTier } from "@/lib/constants";
import { TransactionStatus } from "@/components/shared/TransactionStatus";
import { AlertCircle, CheckCircle2, Users } from "lucide-react";
import type { UseAdminWriteResult } from "@/hooks/useAdminWrite";

const MAX_BATCH_SIZE = 50;

interface WalletQualifierProps {
  readonly adminWrite: UseAdminWriteResult;
  readonly className?: string;
}

export function WalletQualifier({ adminWrite, className }: WalletQualifierProps) {
  const [rawInput, setRawInput] = useState("");
  const [selectedTier, setSelectedTier] = useState<number>(FounderTier.ELITE);

  const parsed = useMemo(() => {
    const lines = rawInput
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const valid: Hex[] = [];
    const invalid: string[] = [];

    for (const line of lines) {
      if (isAddress(line)) {
        valid.push(line as Hex);
      } else {
        invalid.push(line);
      }
    }

    return { valid, invalid, total: lines.length };
  }, [rawInput]);

  const batchExceeded = parsed.valid.length > MAX_BATCH_SIZE;

  const handleQualifyAndSetTier = useCallback(() => {
    if (parsed.valid.length === 0 || batchExceeded) return;

    adminWrite.qualifyWallets(parsed.valid);
  }, [parsed.valid, batchExceeded, adminWrite]);

  const handleSetTiers = useCallback(() => {
    if (parsed.valid.length === 0 || batchExceeded) return;

    const tiers = parsed.valid.map(() => selectedTier);
    adminWrite.setWalletTiers(parsed.valid, tiers);
  }, [parsed.valid, batchExceeded, selectedTier, adminWrite]);

  const isProcessing = adminWrite.isPending || adminWrite.isConfirming;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-[var(--blessup-green)]" />
        <h3 className="text-base font-semibold text-[rgb(var(--fg-primary))]">
          Batch Wallet Operations
        </h3>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-[rgb(var(--fg-muted))]">
          Wallet addresses (one per line)
        </label>
        <textarea
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder={"0x1234...abcd\n0x5678...efgh"}
          rows={6}
          className="w-full rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-overlay))] px-3 py-2.5 font-mono text-xs text-[rgb(var(--fg-primary))] placeholder:text-[rgb(var(--fg-muted))]/50 focus:border-[var(--blessup-green)] focus:outline-none focus:ring-1 focus:ring-[var(--blessup-green)]"
        />
      </div>

      {/* Validation feedback */}
      {parsed.total > 0 && (
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[var(--blessup-green)]">
              <CheckCircle2 className="h-3 w-3" />
              {parsed.valid.length} valid
            </span>
            {parsed.invalid.length > 0 && (
              <span className="flex items-center gap-1 text-rose-400">
                <AlertCircle className="h-3 w-3" />
                {parsed.invalid.length} invalid
              </span>
            )}
          </div>
          {batchExceeded && (
            <span className="flex items-center gap-1 text-amber-400">
              <AlertCircle className="h-3 w-3" />
              Max {MAX_BATCH_SIZE} wallets per batch — reduce the list
            </span>
          )}
        </div>
      )}

      {/* Tier selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[rgb(var(--fg-muted))]">
          Assign tier
        </label>
        <select
          value={selectedTier}
          onChange={(e) => setSelectedTier(Number(e.target.value))}
          className="w-full rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-overlay))] px-3 py-2 text-sm text-[rgb(var(--fg-primary))] focus:border-[var(--blessup-green)] focus:outline-none"
        >
          <option value={FounderTier.ELITE}>Elite</option>
          <option value={FounderTier.LEGEND}>Legend</option>
        </select>
      </div>

      {/* Actions */}
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          onClick={handleQualifyAndSetTier}
          disabled={parsed.valid.length === 0 || batchExceeded || isProcessing}
          className="btn btn-primary w-full"
        >
          Qualify {parsed.valid.length} wallet{parsed.valid.length !== 1 ? "s" : ""}
        </button>
        <button
          onClick={handleSetTiers}
          disabled={parsed.valid.length === 0 || batchExceeded || isProcessing}
          className="btn w-full"
        >
          Set Tier for {parsed.valid.length}
        </button>
      </div>

      {adminWrite.txHash && (
        <TransactionStatus hash={adminWrite.txHash} label="Batch Operation" />
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
