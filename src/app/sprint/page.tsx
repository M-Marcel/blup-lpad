"use client";

import { useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Zap, AlertCircle } from "lucide-react";
import { useSprintStatus } from "@/hooks/useSprintStatus";
import { PageGuard } from "@/components/shared/PageGuard";
import { SprintTracker } from "@/components/sprint/SprintTracker";
import { SprintSession } from "@/components/sprint/SprintSession";
import { SprintComplete } from "@/components/sprint/SprintComplete";

function SprintContent() {
  const shouldReduceMotion = useReducedMotion();
  const { sprintStatus, isLoading, error, completeSession, refetch } =
    useSprintStatus();
  const [isStarting, setIsStarting] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const handleStartSession = useCallback(async () => {
    setIsStarting(true);
    setSessionError(null);
    const success = await completeSession();
    if (!success) {
      setSessionError("Failed to start session. Please try again.");
    }
    setIsStarting(false);
  }, [completeSession]);

  if (isLoading && !sprintStatus) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--blessup-green)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10">
      {/* Header */}
      <motion.div
        className="flex flex-col items-center gap-3 text-center"
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="chip inline-flex items-center gap-1.5 text-2xs">
          <Zap className="h-3 w-3 text-[var(--blessup-gold)]" />
          Genesis Sprint
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-[rgb(var(--fg-primary))] sm:text-4xl">
          Mind Renewal Sprint
        </h1>
        <p className="max-w-md text-sm text-[rgb(var(--fg-secondary))]">
          Complete 3 Mind Renewal sessions across 3 separate days to prove your
          commitment and unlock presale access.
        </p>
      </motion.div>

      {/* Sprint complete celebration */}
      {sprintStatus?.isComplete && (
        <SprintComplete markedOnChain={sprintStatus.markedOnChain} />
      )}

      {/* Sprint tracker */}
      {sprintStatus && !sprintStatus.isComplete && (
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <SprintTracker
            sprintStatus={sprintStatus}
            isStarting={isStarting}
            onStartSession={handleStartSession}
          />
        </motion.div>
      )}

      {/* Session history */}
      {sprintStatus && sprintStatus.sessions.length > 0 && (
        <motion.div
          className="space-y-3"
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <h3 className="text-base font-semibold text-[rgb(var(--fg-primary))]">
            Session History
          </h3>
          <div className="space-y-2">
            {sprintStatus.sessions.map((session, i) => (
              <SprintSession key={session.id} session={session} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Errors */}
      {(error || sessionError) && (
        <div className="flex items-start gap-2 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{sessionError ?? error}</span>
        </div>
      )}
    </div>
  );
}

export default function SprintPage() {
  return (
    <PageGuard requireFounderNft>
      <SprintContent />
    </PageGuard>
  );
}
