export type SupplyResponse = {
  readonly minted: number;
  readonly max: number;
  readonly remaining: number;
  readonly percent: number;
  readonly eliteMinted: number;
  readonly legendMinted: number;
  readonly eliteActive: number;
  readonly eliteAvailable: number;
  readonly totalActive: number;
  readonly totalCap: number;
};

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'minting'
  | 'minted'
  | 'failed'
  | 'refunded';

export type OrderResponse = {
  readonly id: string;
  readonly tier: 'elite' | 'legend';
  readonly payment: 'stripe' | 'nowpayments';
  readonly wallet: string;
  readonly upgradeFrom: string | null;
  readonly amountUsd: number;
  readonly status: OrderStatus;
  readonly tokenId: number | null;
  readonly txHash: string | null;
  readonly externalRef: string | null;
  readonly payAddress: string | null;
  readonly payAmount: string | null;
  readonly payCurrency: string | null;
  readonly payExpiresAt: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateOrderInput = {
  readonly tier: 'elite' | 'legend';
  readonly payment: 'stripe' | 'nowpayments';
  readonly wallet: string;
  readonly upgradeFrom?: string;
};

export type MintResponse = {
  readonly orderId: string;
  readonly tokenId: number;
  readonly txHash: string;
  readonly status: string;
};

export type NftProfileResponse = {
  readonly address: string;
  readonly tier: 'none' | 'elite' | 'legend';
  readonly tokenId: number | null;
  readonly multiplierBp: number;
  readonly tokenUri: string | null;
  readonly metadata: {
    readonly name?: string;
    readonly description?: string;
    readonly image?: string;
    readonly attributes?: ReadonlyArray<{
      readonly trait_type: string;
      readonly value: string | number;
      readonly display_type?: string;
    }>;
  } | null;
  readonly gatewayImage: string | null;
  readonly txHash: string | null;
  readonly orderId: string | null;
};
