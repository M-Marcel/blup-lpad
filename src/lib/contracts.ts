import type { Address } from "viem";
import { TARGET_CHAIN_ID } from "./chains";

const ZERO_ADDRESS: Address = "0x0000000000000000000000000000000000000000";

export type ContractAddresses = {
  genesisPresale: Address;
  presaleVesting: Address;
  actxToken: Address;
  usdc: Address;
  founderNft: Address;
  proofOfAction: Address;
};

const ADDRESSES: Record<number, ContractAddresses> = {
  84532: {
    genesisPresale: "0x4bBAFA96Fc2A29c0fC0904aE1eC3099a5Aa6cF44",
    presaleVesting: "0xc8a4E16bcEC023cd0941107aA392C9Cb5021e2c3",
    actxToken: "0x3f9ccf19F1372f0859E5d3CCd9270aA5Da080C30",
    usdc: "0x8e18720B9A8b9f86018Cd1Fd36C827D7190490C1",
    founderNft: (process.env.NEXT_PUBLIC_FOUNDER_NFT_ADDRESS ??
      ZERO_ADDRESS) as Address,
    proofOfAction: (process.env.NEXT_PUBLIC_PROOF_OF_ACTION_ADDRESS ??
      ZERO_ADDRESS) as Address,
  },
  8453: {
    genesisPresale: ZERO_ADDRESS,
    presaleVesting: ZERO_ADDRESS,
    actxToken: ZERO_ADDRESS,
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    founderNft: ZERO_ADDRESS,
    proofOfAction: ZERO_ADDRESS,
  },
};

export function getAddresses(): ContractAddresses {
  const addrs = ADDRESSES[TARGET_CHAIN_ID];
  if (!addrs) {
    throw new Error(
      `No contract addresses configured for chain ${TARGET_CHAIN_ID}`
    );
  }
  if (
    TARGET_CHAIN_ID === 8453 &&
    addrs.genesisPresale === ZERO_ADDRESS
  ) {
    throw new Error(
      "Mainnet deployment requires real contract addresses. " +
        "genesisPresale is still zero-address on Base mainnet."
    );
  }
  return addrs;
}
