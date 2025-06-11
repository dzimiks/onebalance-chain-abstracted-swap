export interface ChainMetadata {
  chain: string;
  namespace: string;
  reference: string;
}

export interface Chain {
  chain: ChainMetadata;
  isTestnet: boolean;
}

export interface ChainConfig {
  name: string;
  logoUrl: string;
}

export const CHAIN_CONFIG: Record<string, ChainConfig> = {
  '1': {
    name: 'Ethereum Mainnet',
    logoUrl: 'https://storage.googleapis.com/onebalance-public-assets/networks/1.svg',
  },
  '10': {
    name: 'Optimism',
    logoUrl: 'https://storage.googleapis.com/onebalance-public-assets/networks/10.svg',
  },
  '137': {
    name: 'Polygon',
    logoUrl: 'https://storage.googleapis.com/onebalance-public-assets/networks/137.svg',
  },
  '8453': {
    name: 'Base',
    logoUrl: 'https://storage.googleapis.com/onebalance-public-assets/networks/8453.svg',
  },
  '59144': {
    name: 'Linea',
    logoUrl: 'https://storage.googleapis.com/onebalance-public-assets/networks/59144.svg',
  },
  '42161': {
    name: 'Arbitrum',
    logoUrl: 'https://storage.googleapis.com/onebalance-public-assets/networks/42161.svg',
  },
  '43114': {
    name: 'Avalanche',
    logoUrl: 'https://storage.googleapis.com/onebalance-public-assets/networks/43114.svg',
  },
};

// Legacy support for existing code
export const CHAIN_NAMES: Record<string, string> = Object.fromEntries(
  Object.entries(CHAIN_CONFIG).map(([chainId, config]) => [chainId, config.name])
);

// Utility functions
export const getChainName = (chainId: string | number): string => {
  const id = chainId.toString();
  return CHAIN_CONFIG[id]?.name || `Chain ${id}`;
};

export const getChainLogoUrl = (chainId: string | number): string => {
  const id = chainId.toString();
  return CHAIN_CONFIG[id]?.logoUrl || '';
};

export const getChainConfig = (chainId: string | number): ChainConfig | null => {
  const id = chainId.toString();
  return CHAIN_CONFIG[id] || null;
};

// Helper function for CAIP chain IDs (e.g., "eip155:1" -> "1")
export const extractChainIdFromCAIP = (caipChainId: string): string => {
  return caipChainId.split(':')[1] || caipChainId;
};

// Helper function for asset types (e.g., "eip155:1/erc20:..." -> "1")
export const extractChainIdFromAssetType = (assetType: string): string => {
  const chainPart = assetType.split('/')[0];
  return extractChainIdFromCAIP(chainPart);
};
