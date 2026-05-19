"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { PresaleState } from "@/lib/constants";
import { TransactionStatus } from "@/components/shared/TransactionStatus";
import { Play, Square, Pause, PlayCircle, Calendar, AlertCircle } from "lucide-react";
import type { UseAdminWriteResult } from "@/hooks/useAdminWrite";

interface PresaleControlsProps {
  readonly presaleState: PresaleState;
  readonly adminWrite: UseAdminWriteResult;
  readonly className?: string;
}

export function PresaleControls({
  presaleState,
  adminWrite,
  className,
}: PresaleControlsProps) {
  const [scheduleDate, setScheduleDate] = useState("");
  const isProcessing = adminWrite.isPending || adminWrite.isConfirming;

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-base font-semibold text-[rgb(var(--fg-primary))]">
        Presale Controls
      </h3>

      {/* State-conditional actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        {presaleState === PresaleState.NOT_STARTED && (
          <>
            <ActionButton
              label="Open Presale"
              icon={<Play className="h-4 w-4" />}
              onClick={adminWrite.openPresale}
              disabled={isProcessing}
              variant="primary"
            />

            <div className="space-y-2">
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-overlay))] px-3 py-2 text-sm text-[rgb(var(--fg-primary))] focus:border-[var(--blessup-green)] focus:outline-none"
              />
              <ActionButton
                label="Schedule Open"
                icon={<Calendar className="h-4 w-4" />}
                onClick={() => {
                  if (!scheduleDate) return;
                  const timestamp = BigInt(Math.floor(new Date(scheduleDate).getTime() / 1000));
                  adminWrite.scheduleOpen(timestamp);
                }}
                disabled={isProcessing || !scheduleDate}
              />
            </div>
          </>
        )}

        {presaleState === PresaleState.OPEN && (
          <>
            <ActionButton
              label="Close Presale"
              icon={<Square className="h-4 w-4" />}
              onClick={adminWrite.closePresale}
              disabled={isProcessing}
              variant="danger"
            />
            <ActionButton
              label="Pause"
              icon={<Pause className="h-4 w-4" />}
              onClick={adminWrite.pause}
              disabled={isProcessing}
              variant="warning"
            />
          </>
        )}

        {presaleState === PresaleState.CLOSED && (
          <ActionButton
            label="Unpause"
            icon={<PlayCircle className="h-4 w-4" />}
            onClick={adminWrite.unpause}
            disabled={isProcessing}
          />
        )}
      </div>

      {/* Transaction feedback */}
      {adminWrite.txHash && (
        <TransactionStatus hash={adminWrite.txHash} label="Admin Action" />
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

interface ActionButtonProps {
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly onClick: () => void;
  readonly disabled?: boolean;
  readonly variant?: "default" | "primary" | "danger" | "warning";
}

function ActionButton({
  label,
  icon,
  onClick,
  disabled,
  variant = "default",
}: ActionButtonProps) {
  const variantClass =
    variant === "primary"
      ? "btn-primary"
      : variant === "danger"
        ? "btn bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
        : variant === "warning"
          ? "btn bg-[var(--blessup-gold)]/10 text-[var(--blessup-gold)] hover:bg-[var(--blessup-gold)]/20"
          : "btn";

  return (
    <button onClick={onClick} disabled={disabled} className={`${variantClass} w-full`}>
      {icon}
      {label}
    </button>
  );
}
