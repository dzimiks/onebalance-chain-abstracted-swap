export interface ChainMetadata {
  chain: string;
  namespace: string;
  reference: string;
}

export interface Chain {
  chain: ChainMetadata;
  isTestnet: boolean;
}

export const CHAIN_NAMES: Record<string, string> = {
  '1': 'Ethereum',
  '10': 'Optimism',
  '137': 'Polygon',
  '8453': 'Base',
  '59144': 'Linea',
  '42161': 'Arbitrum',
  '43114': 'Avalanche',
};
