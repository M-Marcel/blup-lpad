export const FOUNDER_NFT_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function ownerOf(uint256) view returns (address)',
  'function tokenOfOwnerByIndex(address, uint256) view returns (uint256)',
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function tokenURI(uint256) view returns (string)',
  'function totalSupply() view returns (uint256)',
] as const;
