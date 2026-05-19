"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/cn";
import { apiGet } from "@/lib/api-client";
import { FounderTableHeader, type SortField, type SortDir, type TierFilter } from "./FounderTableHeader";
import { FounderTableRow } from "./FounderTableRow";
import { Loader2, Users } from "lucide-react";
import type { FounderInfo } from "@/types";

interface PaginatedResult {
  readonly founders: readonly FounderInfo[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

const PAGE_SIZE = 25;

interface FounderTableProps {
  readonly className?: string;
}

export function FounderTable({ className }: FounderTableProps) {
  const [founders, setFounders] = useState<readonly FounderInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>("wallet");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");

  const fetchFounders = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
      sort: sortField,
      dir: sortDir,
      ...(tierFilter !== "all" ? { tier: tierFilter } : {}),
    });

    const result = await apiGet<PaginatedResult>(`/admin/founders?${params}`);

    if (result.success) {
      setFounders(result.data.founders);
      setTotal(result.data.total);
    }
    setIsLoading(false);
  }, [page, sortField, sortDir, tierFilter]);

  useEffect(() => {
    fetchFounders();
  }, [fetchFounders]);

  const handleSort = useCallback(
    (field: SortField) => {
      if (field === sortField) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDir("asc");
      }
      setPage(1);
    },
    [sortField],
  );

  const handleFilterTier = useCallback((filter: TierFilter) => {
    setTierFilter(filter);
    setPage(1);
  }, []);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[rgb(var(--fg-primary))]">
          Founders ({total})
        </h3>
      </div>

      <FounderTableHeader
        sortField={sortField}
        sortDir={sortDir}
        tierFilter={tierFilter}
        onSort={handleSort}
        onFilterTier={handleFilterTier}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--blessup-green)]" />
        </div>
      ) : founders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <Users className="h-8 w-8 text-[rgb(var(--fg-muted))]" />
          <p className="text-sm text-[rgb(var(--fg-muted))]">No founders found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {founders.map((f) => (
            <FounderTableRow key={f.walletAddress} founder={f} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn px-3 py-1 text-xs"
          >
            Prev
          </button>
          <span className="text-xs text-[rgb(var(--fg-muted))]">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="btn px-3 py-1 text-xs"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
