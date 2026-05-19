"use client";

import { Suspense, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/cn";
import { TIERS, type TierId } from "@/lib/tiers";
import type { PaymentMethodId } from "@/lib/payments";
import { useNftOrder } from "@/hooks/useNftOrder";
import { useNftSupply } from "@/hooks/useNftSupply";
import { AuthGate } from "@/components/wallet/AuthGate";
import { TierCard } from "@/components/nft";
import { PaymentSelector, OrderSummary } from "@/components/checkout";

type CheckoutStep = "tier" | "payment" | "review";

const TIER_ORDER: readonly TierId[] = ["elite", "legend"] as const;

function CheckoutFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address } = useAccount();
  const { supply } = useNftSupply();
  const { createOrder, isCreating } = useNftOrder();

  const tierParam = searchParams.get("tier") as TierId | null;
  const upgradeFrom = searchParams.get("upgradeFrom") as TierId | null;

  const [selectedTier, setSelectedTier] = useState<TierId | null>(
    tierParam && tierParam in TIERS ? tierParam : null,
  );
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodId>("stripe");

  const step: CheckoutStep = !selectedTier
    ? "tier"
    : selectedPayment === "stripe" || selectedPayment === "nowpayments"
      ? "payment"
      : "payment";

  const [confirmedPayment, setConfirmedPayment] = useState(false);
  const currentStep: CheckoutStep = !selectedTier
    ? "tier"
    : !confirmedPayment
      ? "payment"
      : "review";

  const handleTierSelect = useCallback((id: TierId) => {
    setSelectedTier(id);
    setConfirmedPayment(false);
  }, []);

  const handlePaymentContinue = useCallback(() => {
    setConfirmedPayment(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!selectedTier || !address) return;

    const orderId = await createOrder({
      tier: selectedTier,
      payment: selectedPayment,
      wallet: address,
      ...(upgradeFrom ? { upgradeFrom } : {}),
    });

    if (orderId) {
      router.push(`/nft/checkout/processing/${orderId}`);
    }
  }, [selectedTier, selectedPayment, address, upgradeFrom, createOrder, router]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (currentStep === "review") {
              setConfirmedPayment(false);
            } else if (currentStep === "payment") {
              setSelectedTier(null);
            } else {
              router.push("/nft");
            }
          }}
          className="inline-flex items-center gap-1.5 text-sm text-[rgb(var(--fg-muted))] transition-colors hover:text-[rgb(var(--fg-primary))]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <StepIndicator current={currentStep} />
      </div>

      {currentStep === "tier" && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-[rgb(var(--fg-primary))]">
            Select your tier
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {TIER_ORDER.map((id) => (
              <TierCard
                key={id}
                tier={TIERS[id]}
                supply={supply}
                selected={selectedTier === id}
                onSelect={handleTierSelect}
              />
            ))}
          </div>
        </div>
      )}

      {currentStep === "payment" && selectedTier && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-[rgb(var(--fg-primary))]">
            Choose payment
          </h2>
          <PaymentSelector
            selected={selectedPayment}
            onSelect={setSelectedPayment}
          />
          <button
            type="button"
            onClick={handlePaymentContinue}
            className="btn btn-primary mt-2 w-full sm:w-auto sm:self-end"
          >
            Continue to review
          </button>
        </div>
      )}

      {currentStep === "review" && selectedTier && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-[rgb(var(--fg-primary))]">
            Review your order
          </h2>
          <OrderSummary
            tier={selectedTier}
            paymentMethod={selectedPayment}
            upgradeFrom={upgradeFrom ?? undefined}
            onConfirm={handleConfirm}
            isSubmitting={isCreating}
          />
        </div>
      )}
    </div>
  );
}

function StepIndicator({ current }: { readonly current: CheckoutStep }) {
  const steps: readonly CheckoutStep[] = ["tier", "payment", "review"];
  const labels: Record<CheckoutStep, string> = {
    tier: "Tier",
    payment: "Payment",
    review: "Review",
  };

  const currentIdx = steps.indexOf(current);

  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          {i > 0 && (
            <div
              className={cn(
                "h-px w-6",
                i <= currentIdx
                  ? "bg-[rgb(var(--nft-accent))]"
                  : "bg-[rgb(var(--border-subtle))]",
              )}
            />
          )}
          <span
            className={cn(
              "text-xs font-medium",
              i === currentIdx
                ? "text-[rgb(var(--nft-accent))]"
                : i < currentIdx
                  ? "text-[rgb(var(--fg-secondary))]"
                  : "text-[rgb(var(--fg-muted))]",
            )}
          >
            {labels[s]}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGate prompt="Connect your wallet to purchase a Genesis NFT.">
      <Suspense
        fallback={
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
            <div className="h-6 w-48 animate-pulse rounded bg-[rgb(var(--bg-overlay))]" />
            <div className="h-64 w-full animate-pulse rounded-xl bg-[rgb(var(--bg-overlay))]" />
          </div>
        }
      >
        <CheckoutFlow />
      </Suspense>
    </AuthGate>
  );
}
