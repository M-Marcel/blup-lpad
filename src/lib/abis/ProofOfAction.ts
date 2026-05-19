export const PROOF_OF_ACTION_ABI = [
  'function isVerified(address) view returns (bool)',
  'function getActionCount(address) view returns (uint256)',
  'function getLastActionTimestamp(address) view returns (uint256)',
] as const;
