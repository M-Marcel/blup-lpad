import { parseUnits } from "viem";

export const PRESALE = {
  TOTAL_POOL: parseUnits("3000000", 18),
  PER_WALLET_CAP: parseUnits("10000", 18),

  ELITE_PRICE: parseUnits("0.07", 6),
  LEGEND_PRICE: parseUnits("0.05", 6),
  PUBLIC_PRICE: parseUnits("0.10", 6),

  ELITE_MAX_USDC: parseUnits("700", 6),
  LEGEND_MAX_USDC: parseUnits("500", 6),

  TGE_UNLOCK_PCT: 25,
  VESTING_DURATION_DAYS: 90,
  MULTIPLIER_BOOST: 0.1,

  PRESALE_DURATION_DAYS: 7,
  PRE_LAUNCH_BUFFER_HOURS: 48,
  UPGRADE_CUTOFF_HOURS: 24,

  MAX_PARTICIPANTS: 300,

  REQUIRED_RENEW_SESSIONS: 3,
  REQUIRED_DISTINCT_DAYS: 3,
} as const;

export enum FounderTier {
  NONE = 0,
  ELITE = 1,
  LEGEND = 2,
}

export enum PresaleState {
  NOT_STARTED = "NOT_STARTED",
  SPRINT_PHASE = "SPRINT_PHASE",
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  TGE_TRIGGERED = "TGE_TRIGGERED",
  VESTING = "VESTING",
  COMPLETED = "COMPLETED",
}
