"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { useNftOrder } from "@/hooks/useNftOrder";
import { AuthGate } from "@/components/wallet/AuthGate";
import { Field } from "@/components/shared";

export default function ProcessingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { order, isPolling, error, startPolling, stopPolling } = useNftOrder();

  const orderId = params.id;

  useEffect(() => {
    if (orderId) {
      startPolling(orderId);
    }
    return () => stopPolling();
  }, [orderId, startPolling, stopPolling]);

  useEffect(() => {
    if (order?.status === "minted" && orderId) {
      router.replace(`/nft/checkout/success/${orderId}`);
    }
  }, [order?.status, orderId, router]);

  const isCrypto = order?.payment === "nowpayments";
  const isFailed = order?.status === "failed";
  const isRefunded = order?.status === "refunded";

  return (
    <AuthGate prompt="Connect your wallet to view order status.">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 px-4 py-16 text-center">
        {isFailed || isRefunded ? (
          <FailedState
            status={order?.status ?? "failed"}
            onRetry={() => router.push("/nft")}
          />
        ) : (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-[rgb(var(--nft-accent))]" />
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-semibold text-[rgb(var(--fg-primary))]">
                Processing your order
              </h1>
              <p className="text-sm text-[rgb(var(--fg-secondary))]">
                {isCrypto
                  ? "Waiting for your crypto payment to confirm on-chain."
                  : "Waiting for payment confirmation from Stripe."}
              </p>
            </div>

            {order && (
              <div className="surface w-full max-w-sm p-5">
                <div className="flex flex-col gap-3">
                  <Field label="Order" value={truncateId(order.id)} />
                  <Field label="Status" value={formatStatus(order.status)} />
                  <Field label="Tier" value={order.tier} />

                  {isCrypto && order.payAddress && (
                    <>
                      <div className="my-1 border-t border-[rgb(var(--border-subtle))]" />
                      <Field
                        label="Send to"
                        value={<CopyableAddress address={order.payAddress} />}
                      />
                      {order.payAmount && order.payCurrency && (
                        <Field
                          label="Amount"
                          value={`${order.payAmount} ${order.payCurrency.toUpperCase()}`}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-rose-400">
                Polling error: {error}. Retrying...
              </p>
            )}
          </>
        )}
      </div>
    </AuthGate>
  );
}

function FailedState({
  status,
  onRetry,
}: {
  readonly status: string;
  readonly onRetry: () => void;
}) {
  return (
    <>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/15">
        <span className="text-2xl">✕</span>
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-[rgb(var(--fg-primary))]">
          {status === "refunded" ? "Payment Refunded" : "Order Failed"}
        </h1>
        <p className="text-sm text-[rgb(var(--fg-secondary))]">
          {status === "refunded"
            ? "Your payment has been refunded. No NFT was minted."
            : "Something went wrong with your order. Please try again."}
        </p>
      </div>
      <button type="button" onClick={onRetry} className="btn btn-primary">
        Back to NFTs
      </button>
    </>
  );
}

function CopyableAddress({ address }: { readonly address: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 font-mono text-xs text-[rgb(var(--fg-primary))] transition-colors hover:text-[rgb(var(--nft-accent))]"
    >
      {`${address.slice(0, 8)}...${address.slice(-6)}`}
      {copied ? (
        <Check className="h-3 w-3 text-emerald-400" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  );
}

function truncateId(id: string): string {
  return id.length > 12 ? `${id.slice(0, 8)}...` : id;
}

function formatStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
