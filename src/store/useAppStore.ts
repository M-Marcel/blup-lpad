import { create } from "zustand";
import { PresaleState } from "@/lib/constants";
import type { KycStatus, RecentPurchase } from "@/types";
import type { OrderStatus } from "@/types/nft";

const MAX_RECENT_PURCHASES = 20;

interface NftOrderState {
  readonly currentOrderId: string | null;
  readonly orderStatus: OrderStatus | null;
}

interface SupplyState {
  readonly eliteMinted: number;
  readonly legendMinted: number;
  readonly totalMinted: number;
}

interface AppState {
  readonly isMobileNavOpen: boolean;
  readonly setMobileNavOpen: (open: boolean) => void;

  readonly pendingTxHash: string | null;
  readonly setPendingTxHash: (hash: string | null) => void;

  readonly presaleState: PresaleState;
  readonly setPresaleState: (state: PresaleState) => void;

  readonly kycStatus: KycStatus;
  readonly setKycStatus: (status: KycStatus) => void;

  readonly nftOrder: NftOrderState;
  readonly setNftOrder: (order: NftOrderState) => void;

  readonly supply: SupplyState;
  readonly setSupply: (supply: SupplyState) => void;

  readonly recentPurchases: readonly RecentPurchase[];
  readonly lastPurchaseTimestamp: number | null;
  readonly addPurchase: (purchase: RecentPurchase) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  isMobileNavOpen: false,
  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),

  pendingTxHash: null,
  setPendingTxHash: (hash) => set({ pendingTxHash: hash }),

  presaleState: PresaleState.NOT_STARTED,
  setPresaleState: (presaleState) => set({ presaleState }),

  kycStatus: "not_started",
  setKycStatus: (kycStatus) => set({ kycStatus }),

  nftOrder: { currentOrderId: null, orderStatus: null },
  setNftOrder: (nftOrder) => set({ nftOrder }),

  supply: { eliteMinted: 0, legendMinted: 0, totalMinted: 0 },
  setSupply: (supply) => set({ supply }),

  recentPurchases: [],
  lastPurchaseTimestamp: null,
  addPurchase: (purchase) => {
    const current = get().recentPurchases;
    if (current.some((p) => p.txHash === purchase.txHash)) return;
    const updated = [purchase, ...current].slice(0, MAX_RECENT_PURCHASES);
    set({ recentPurchases: updated, lastPurchaseTimestamp: purchase.timestamp });
  },
}));
