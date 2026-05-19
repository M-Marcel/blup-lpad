"use client";

import { useState, useCallback } from "react";
import { parseUnits } from "viem";
import { cn } from "@/lib/cn";
import { Field } from "@/components/shared/Field";
import { TokenAmount } from "@/components/shared/TokenAmount";
import { TransactionStatus } from "@/components/shared/TransactionStatus";
import { AlertCircle, Database } from "lucide-react";
import type { PresaleStats } from "@/types";
import type { UseAdminWriteResult } from "@/hooks/useAdminWrite";

interface PoolManagerProps {
  readonly presaleStats: PresaleStats | undefined;
  readonly adminWrite: UseAdminWriteResult;
  readonly className?: string;
}

export function PoolManager({ presaleStats, adminWrite, className }: PoolManagerProps) {
  const [fundAmount, setFundAmount] = useState("");

  const handleFund = useCallback(() => {
    const trimmed = fundAmount.trim();
    if (!trimmed || isNaN(Number(trimmed)) || Number(trimmed) <= 0) return;
    const amount = parseUnits(trimmed, 18);
    adminWrite.fundPool(amount);
  }, [fundAmount, adminWrite]);

  const isProcessing = adminWrite.isPending || adminWrite.isConfirming;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4 text-[var(--blessup-green)]" />
        <h3 className="text-base font-semibold text-[rgb(var(--fg-primary))]">
          Pool Manager
        </h3>
      </div>

      {/* Current pool stats */}
      {presaleStats && (
        <div className="surface rounded-lg p-4">
          <div className="space-y-2">
            <Field
              label="Pool Total"
              value={<TokenAmount amount={presaleStats.poolTotal} />}
            />
            <Field
              label="Pool Remaining"
              value={<TokenAmount amount={presaleStats.poolRemaining} />}
            />
            <Field
              label="Tokens Sold"
              value={<TokenAmount amount={presaleStats.totalTokensSold} />}
            />
          </div>
        </div>
      )}

      {/* Fund pool */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[rgb(var(--fg-muted))]">
          Fund amount (ACTX tokens)
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            step="1"
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
            placeholder="Amount to add to pool"
            className="flex-1 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-overlay))] px-3 py-2.5 text-sm text-[rgb(var(--fg-primary))] placeholder:text-[rgb(var(--fg-muted))]/50 focus:border-[var(--blessup-green)] focus:outline-none focus:ring-1 focus:ring-[var(--blessup-green)]"
          />
          <button
            onClick={handleFund}
            disabled={!fundAmount.trim() || isProcessing}
            className="btn btn-primary"
          >
            Fund
          </button>
        </div>
      </div>

      {adminWrite.txHash && (
        <TransactionStatus hash={adminWrite.txHash} label="Pool Fund" />
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
