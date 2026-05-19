export type TierId = "elite" | "legend";

export type Tier = {
  id: TierId;
  name: string;
  price: number;
  nftName: string;
  nftVariant: "standard" | "gold";
  tagline: string;
  perks: string[];
  accent: "blue" | "gold";
};

export const TIERS: Record<TierId, Tier> = {
  elite: {
    id: "elite",
    name: "Elite",
    price: 999,
    nftName: "Genesis Standard",
    nftVariant: "standard",
    tagline: "Founding access to the BlessUP Network.",
    perks: [
      "Full SaaS license",
      "Genesis Standard NFT",
      "Founder dashboard access",
      "Priority support queue",
    ],
    accent: "blue",
  },
  legend: {
    id: "legend",
    name: "Legend",
    price: 1999,
    nftName: "Genesis Gold",
    nftVariant: "gold",
    tagline: "Top-tier founder with Gold NFT and extended perks.",
    perks: [
      "Everything in Elite",
      "Genesis Gold NFT (limited)",
      "Private founder council",
      "Revenue share beta access",
    ],
    accent: "gold",
  },
};

export const UPGRADE_DELTA = TIERS.legend.price - TIERS.elite.price;
export const GENESIS_MAX_SUPPLY = 1000;
