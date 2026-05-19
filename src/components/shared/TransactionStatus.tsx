"use client";

import { useEffect, useRef } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import { type Address } from "viem";
import { txUrl } from "@/lib/explorer";
import { truncateAddress } from "@/lib/formatting";
import { Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import type { TransactionState } from "@/types";

interface TransactionStatusProps {
  readonly hash: string | null;
  readonly label?: string;
  readonly onConfirmed?: () => void;
}

export function TransactionStatus({ hash, label, onConfirmed }: TransactionStatusProps) {
  const { data: receipt, isLoading, isSuccess, isError } = useWaitForTransactionReceipt({
    hash: hash as Address | undefined,
    query: { enabled: Boolean(hash) },
  });

  const confirmedRef = useRef(false);

  useEffect(() => {
    if (isSuccess && receipt && onConfirmed && !confirmedRef.current) {
      confirmedRef.current = true;
      onConfirmed();
    }
  }, [isSuccess, receipt, onConfirmed]);

  useEffect(() => {
    confirmedRef.current = false;
  }, [hash]);

  if (!hash) return null;

  const state: TransactionState = isLoading
    ? "confirming"
    : isSuccess
      ? "confirmed"
      : isError
        ? "failed"
        : "pending";

  return (
    <div className={`surface flex items-center gap-3 p-3 ${getCardBorder(state)}`}>
      <TransactionIcon state={state} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[rgb(var(--fg-primary))]">
          {label ?? "Transaction"}{" "}
          <StatusLabel state={state} />
        </p>
        <a
          href={txUrl(hash)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[rgb(var(--fg-muted))] transition-colors hover:text-[rgb(var(--fg-primary))]"
        >
          {truncateAddress(hash)}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

function TransactionIcon({ state }: { readonly state: TransactionState }) {
  switch (state) {
    case "confirming":
    case "pending":
    case "preparing":
      return <Loader2 className="h-5 w-5 animate-spin text-[var(--blessup-green)]" />;
    case "confirmed":
      return <CheckCircle2 className="h-5 w-5 text-[var(--blessup-green)]" />;
    case "failed":
      return <XCircle className="h-5 w-5 text-rose-400" />;
    default:
      return null;
  }
}

function StatusLabel({ state }: { readonly state: TransactionState }) {
  switch (state) {
    case "preparing":
      return <span className="text-[rgb(var(--fg-muted))]">preparing...</span>;
    case "pending":
      return <span className="text-[rgb(var(--fg-muted))]">pending...</span>;
    case "confirming":
      return <span className="text-[var(--blessup-green)]">confirming...</span>;
    case "confirmed":
      return <span className="text-[var(--blessup-green)]">confirmed</span>;
    case "failed":
      return <span className="text-rose-400">failed</span>;
    default:
      return null;
  }
}

function getCardBorder(state: TransactionState): string {
  switch (state) {
    case "confirmed":
      return "border-[var(--blessup-green)]/30";
    case "failed":
      return "border-rose-400/30";
    default:
      return "";
  }
}
