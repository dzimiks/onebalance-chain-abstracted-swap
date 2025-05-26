import { CHAIN_NAMES } from '@/lib/types/chains';

/**
 * Gets chain ID from asset type (e.g., "eip155:42161/erc20:0x..." -> "42161").
 *
 * @param assetType
 */
export const getChainIdFromAssetType = (assetType: string): string => {
  return assetType.split(':')[1]?.split('/')[0];
};

/**
 * Gets chain name from asset type.
 *
 * @param assetType
 */
export const getChainNameFromAssetType = (assetType: string): string => {
  const chainId = getChainIdFromAssetType(assetType);
  return CHAIN_NAMES[chainId] || `Chain ${chainId}`;
};
