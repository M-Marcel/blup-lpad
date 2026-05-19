export function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-8 w-8 overflow-hidden rounded-md border border-[rgb(var(--line-strong))] bg-[rgb(var(--bg-overlay))]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgb(var(--nft-accent)/0.8),transparent_60%)]" />
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-semibold tracking-tight text-[rgb(var(--fg-primary))]">
          B
        </div>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-sm font-semibold tracking-tight">
          <span className="blessup-gradient-text">BlessUP</span>
        </span>
        <span className="text-2xs uppercase tracking-[0.18em] text-[rgb(var(--fg-muted))]">
          Launchpad
        </span>
      </div>
    </div>
  );
}
