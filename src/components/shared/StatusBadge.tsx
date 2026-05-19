import { cn } from "@/lib/cn";

type StatusVariant = "success" | "warning" | "error" | "info" | "neutral";

interface StatusBadgeProps {
  readonly label: string;
  readonly variant?: StatusVariant;
  readonly className?: string;
}

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  success: "bg-emerald-500/15 text-emerald-400",
  warning: "bg-[var(--blessup-gold)]/15 text-[var(--blessup-gold)]",
  error: "bg-rose-500/15 text-rose-400",
  info: "bg-[rgb(var(--nft-accent)/0.15)] text-[rgb(var(--nft-accent))]",
  neutral: "bg-[rgb(var(--bg-overlay))] text-[rgb(var(--fg-muted))]",
};

export function StatusBadge({ label, variant = "neutral", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
