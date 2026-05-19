"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck, ShieldX, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAppStore } from "@/store/useAppStore";
import { useAdmin } from "@/hooks/useAdmin";
import { useAdminWrite } from "@/hooks/useAdminWrite";
import { usePresaleState } from "@/hooks/usePresaleContract";
import { useVesting } from "@/hooks/useVesting";
import { NetworkGuard } from "@/components/wallet/NetworkGuard";
import { AuthGate } from "@/components/wallet/AuthGate";
import {
  AdminMetrics,
  PresaleControls,
  TGETrigger,
  FounderTable,
  WalletQualifier,
  PoolManager,
} from "@/components/admin";

type AdminTab = "metrics" | "controls" | "founders" | "pool" | "qualify";

const TABS: readonly { readonly id: AdminTab; readonly label: string }[] = [
  { id: "metrics", label: "Metrics" },
  { id: "controls", label: "Controls" },
  { id: "founders", label: "Founders" },
  { id: "pool", label: "Pool" },
  { id: "qualify", label: "Qualify" },
];

function AdminContent() {
  const shouldReduceMotion = useReducedMotion();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin();
  const adminWrite = useAdminWrite();
  const presaleState = useAppStore((s) => s.presaleState);
  const { data: presaleStats } = usePresaleState();
  const vestingData = useVesting();
  const [activeTab, setActiveTab] = useState<AdminTab>("metrics");

  if (isAdminLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--blessup-green)]" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10">
          <ShieldX className="h-8 w-8 text-rose-400" />
        </div>
        <h2 className="text-lg font-semibold text-[rgb(var(--fg-primary))]">
          Access Denied
        </h2>
        <p className="text-sm text-[rgb(var(--fg-muted))]">
          Your wallet is not authorized for admin access.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10">
      {/* Header */}
      <motion.div
        className="flex flex-col items-center gap-3 text-center"
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="chip inline-flex items-center gap-1.5 text-2xs">
          <ShieldCheck className="h-3 w-3 text-[var(--blessup-green)]" />
          Admin Panel
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-[rgb(var(--fg-primary))]">
          Presale Administration
        </h1>
      </motion.div>

      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-[rgb(var(--bg-overlay))] p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-[rgb(var(--bg-primary))] text-[rgb(var(--fg-primary))] shadow-sm"
                : "text-[rgb(var(--fg-muted))] hover:text-[rgb(var(--fg-primary))]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div
        key={activeTab}
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "metrics" && (
          <AdminMetrics
            presaleStats={presaleStats}
            presaleState={presaleState}
          />
        )}

        {activeTab === "controls" && (
          <div className="space-y-6">
            <PresaleControls
              presaleState={presaleState}
              adminWrite={adminWrite}
            />
            <TGETrigger
              adminWrite={adminWrite}
              tgeTriggered={vestingData.tgeTriggered}
            />
          </div>
        )}

        {activeTab === "founders" && <FounderTable />}

        {activeTab === "pool" && (
          <PoolManager
            presaleStats={presaleStats}
            adminWrite={adminWrite}
          />
        )}

        {activeTab === "qualify" && (
          <WalletQualifier adminWrite={adminWrite} />
        )}
      </motion.div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <NetworkGuard>
      <AuthGate prompt="Connect your admin wallet to access the control panel.">
        <AdminContent />
      </AuthGate>
    </NetworkGuard>
  );
}
