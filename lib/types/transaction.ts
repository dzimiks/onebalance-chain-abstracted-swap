export interface ChainOperation {
  hash: string;
  chainId: number;
  explorerUrl: string;
}

export interface TokenInfo {
  aggregatedAssetId: string;
  amount: string;
  assetType: string | string[];
  fiatValue?: string | { assetType: string; fiatValue: string }[];
  minimumAmount?: string;
  minimumFiatValue?: string;
}

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Transaction {
  quoteId: string;
  status: TransactionStatus;
  user: string;
  recipientAccountId?: string;
  originChainOperations: ChainOperation[];
  destinationChainOperations?: ChainOperation[];
  type: 'SWAP' | 'TRANSFER';
  originToken: TokenInfo;
  destinationToken?: TokenInfo;
  timestamp: string;
}

export interface TransactionHistoryResponse {
  transactions: Transaction[];
  continuation?: string;
}

export interface TransactionHistoryParams {
  user: string;
  limit: number;
  continuation?: string;
}
