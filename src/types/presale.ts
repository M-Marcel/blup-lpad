// === Presale State (must match contract lifecycle) ===

export enum PresaleState {
  NOT_STARTED = 'NOT_STARTED',
  SPRINT_PHASE = 'SPRINT_PHASE',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  TGE_TRIGGERED = 'TGE_TRIGGERED',
  VESTING = 'VESTING',
  COMPLETED = 'COMPLETED',
}

// === Founder Tier (must match contract enum) ===

export enum FounderTier {
  NONE = 0,
  ELITE = 1,
  LEGEND = 2,
}

// === Purchase Form ===

export interface PurchaseFormValues {
  readonly usdcAmount: string;
}

// === Tier Display Config ===

export interface TierDisplayConfig {
  readonly tier: FounderTier;
  readonly name: string;
  readonly priceLabel: string;
  readonly maxSpendLabel: string;
  readonly color: string;
}

// === Presale Countdown ===

export interface CountdownParts {
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
  readonly isExpired: boolean;
}
