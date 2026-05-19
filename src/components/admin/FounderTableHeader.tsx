"use client";

import { cn } from "@/lib/cn";
import { ChevronDown } from "lucide-react";

export type SortField = "wallet" | "tier" | "status";
export type SortDir = "asc" | "desc";
export type TierFilter = "all" | "elite" | "legend" | "none";

interface FounderTableHeaderProps {
  readonly sortField: SortField;
  readonly sortDir: SortDir;
  readonly tierFilter: TierFilter;
  readonly onSort: (field: SortField) => void;
  readonly onFilterTier: (filter: TierFilter) => void;
}

export function FounderTableHeader({
  sortField,
  sortDir,
  tierFilter,
  onSort,
  onFilterTier,
}: FounderTableHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex gap-2">
        <SortButton
          label="Wallet"
          field="wallet"
          active={sortField === "wallet"}
          dir={sortDir}
          onClick={onSort}
        />
        <SortButton
          label="Tier"
          field="tier"
          active={sortField === "tier"}
          dir={sortDir}
          onClick={onSort}
        />
        <SortButton
          label="Status"
          field="status"
          active={sortField === "status"}
          dir={sortDir}
          onClick={onSort}
        />
      </div>

      <select
        value={tierFilter}
        onChange={(e) => onFilterTier(e.target.value as TierFilter)}
        className="rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-overlay))] px-3 py-1.5 text-xs text-[rgb(var(--fg-primary))] focus:border-[var(--blessup-green)] focus:outline-none"
      >
        <option value="all">All Tiers</option>
        <option value="elite">Elite</option>
        <option value="legend">Legend</option>
        <option value="none">None</option>
      </select>
    </div>
  );
}

interface SortButtonProps {
  readonly label: string;
  readonly field: SortField;
  readonly active: boolean;
  readonly dir: SortDir;
  readonly onClick: (field: SortField) => void;
}

function SortButton({ label, field, active, dir, onClick }: SortButtonProps) {
  return (
    <button
      onClick={() => onClick(field)}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors",
        active
          ? "bg-[var(--blessup-green)]/10 text-[var(--blessup-green)]"
          : "text-[rgb(var(--fg-muted))] hover:text-[rgb(var(--fg-primary))]",
      )}
    >
      {label}
      {active && (
        <ChevronDown
          className={cn("h-3 w-3 transition-transform", dir === "asc" && "rotate-180")}
        />
      )}
    </button>
  );
}
