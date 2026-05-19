# BlessUP Launchpad

Genesis Founder NFT checkout, ACTX token presale, vesting, and admin dashboard for the BlessUP Network. Built on Base (L2).

## Stack

- **Next.js 16** (App Router, standalone output)
- **React 19** + TypeScript 5
- **wagmi 2 + viem** (contract reads/writes, gas estimation)
- **RainbowKit** (wallet connection)
- **Zustand** (client state) + **TanStack Query** (server state)
- **Tailwind CSS 4** + custom design tokens
- **Framer Motion** (animations)
- **Vitest** (unit tests)

## Architecture

111 source files, ~8,750 LOC across 5 milestones:

| Milestone | Scope | Files |
|-----------|-------|-------|
| M0 | Design system, providers, layout | 21 |
| M1 | Shared components, wallet, auth | 31 |
| M2 | NFT checkout flow | 16 |
| M3 | Presale purchase + vesting | 25 |
| M4 | Sprint tracker + admin panel | 17 |

### Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/nft` | Public | Genesis NFT tier selection + supply |
| `/nft/checkout` | Auth | Tier, payment method, order review |
| `/nft/checkout/processing/[id]` | Auth | Order polling, crypto payment details |
| `/nft/checkout/success/[id]` | Auth | Mint confirmation (poll-only, no client-side mint) |
| `/nft/my-nft` | Auth + Network | On-chain NFT profile |
| `/nft/upgrade` | Auth + Network | Elite to Legend upgrade |
| `/presale` | PageGuard | ACTX purchase (approve + buy) |
| `/presale/dashboard` | PageGuard | Vesting schedule + claim |
| `/sprint` | PageGuard | 3-day Mind Renewal Sprint |
| `/admin` | Admin | Metrics, controls, founders, pool, qualification |
| `/api/auth/[...path]` | N/A | SIWE auth proxy to backend |

### Key Directories

```
src/
  app/           Routes (12 pages + 1 API catch-all)
  components/
    admin/       AdminMetrics, PresaleControls, TGETrigger, FounderTable, WalletQualifier, PoolManager
    checkout/    OrderSummary, PaymentSelector
    layout/      Header, Footer, MobileNav, ShellLayout, Container, Wordmark
    nft/         TierCard, SupplyMeter, NftPreview, NftProfile
    presale/     PurchaseForm, ApproveButton, PurchaseButton, LiveFeed, PoolTracker, +4 more
    shared/      PageGuard, TransactionStatus, Countdown, ErrorBoundary, Field, StatusBadge, TokenAmount, USDCAmount
    sprint/      SprintTracker, SprintSession, SprintComplete
    vesting/     VestingSchedule, ClaimButton
    wallet/      AuthGate, NetworkGuard, ConnectButton, WalletInfo, ChainChip
  hooks/         15 custom hooks (contract reads, writes, auth, events)
  lib/           Utilities, constants, ABIs (6 contracts), formatting, explorer URLs
  providers/     AppProvider, Web3Provider, AuthProvider
  store/         Zustand store (nav, tx, presale state, KYC, NFT order, supply, purchases)
  types/         TypeScript definitions (index, nft, presale, api)
```

## Smart Contracts (Base Sepolia)

| Contract | Address | Purpose |
|----------|---------|---------|
| GenesisPresale | `0x4bBA...cF44` | Purchase gate, tier management, pool |
| PresaleVesting | `0xc8a4...2c3` | TGE trigger, 90-day linear vest, claims |
| ACTXToken | `0x3f9c...0C30` | ERC-20 token |
| USDC | `0x8e18...0490` | Testnet USDC |
| FounderNFT | env | Genesis Founder ERC-721 |
| ProofOfAction | env | Sprint verification |

## Getting Started

```bash
cp .env.example .env.local
# Fill in WalletConnect project ID, RPC URL, admin wallets, contract addresses

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CHAIN` | Yes | `sepolia` or `mainnet` |
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Yes | WalletConnect Cloud project ID |
| `NEXT_PUBLIC_RPC_URL` | Yes | Base chain RPC endpoint |
| `NEXT_PUBLIC_ADMIN_WALLETS` | Yes | Comma-separated admin addresses |
| `NEXT_PUBLIC_DEX_LAUNCH_DATE` | Yes | TGE/DEX launch date (ISO 8601) |
| `NEXT_PUBLIC_GENESIS_NFT_ADDRESS` | Yes | FounderNFT contract address |
| `NEXT_PUBLIC_PROOF_OF_ACTION_ADDRESS` | Yes | ProofOfAction contract address |

## Scripts

```bash
npm run dev        # Development server
npm run build      # Production build (standalone)
npm run start      # Start production server
npm run lint       # ESLint
npm run test       # Vitest (unit tests)
npm run test:watch # Vitest watch mode
```

## Presale Parameters

| Parameter | Value |
|-----------|-------|
| Total pool | 3,000,000 ACTX |
| Per-wallet cap | 10,000 ACTX |
| Elite price | $0.07 / ACTX |
| Legend price | $0.05 / ACTX |
| TGE unlock | 25% |
| Vesting | 90-day linear |
| Max participants | 300 |
| Sprint requirement | 3 sessions on 3 distinct days |

## Security

- Cookie-based SIWE authentication (no sessionStorage/localStorage)
- No client-side mint triggers (success pages poll-only)
- Gas estimation with 20% buffer on every contract write (fallback max if estimation fails)
- All `useReadContract` results checked for `status === 'success'` before accessing data
- USDC approval uses exact amount (not maxUint256)
- Batch wallet operations validate `isAddress()` before submission
- TGE trigger requires 3-step confirmation (text verification + countdown)
- CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy
- Admin actions are `onlyOwner` in contract (client-side check is UI convenience only)

## Payment Methods

**NFT Checkout:**
- Stripe (test mode): Card, BNPL (Affirm, Klarna)
- NOWPayments (sandbox): USDC, USDT, ETH, BTC

**Presale:**
- On-chain USDC approval + purchase via GenesisPresale contract
