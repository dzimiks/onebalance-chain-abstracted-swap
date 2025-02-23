export interface Account {
  sessionAddress: string;
  adminAddress: string;
  accountAddress: string;
}

export interface TokenInfo {
  aggregatedAssetId: string;
  amount: string;
  assetType: string | string[];
  fiatValue: never;
}

export interface QuoteRequest {
  account: Account;
  fromTokenAmount: string;
  fromAggregatedAssetId: string;
  toAggregatedAssetId: string;
}

export interface Quote {
  id: string;
  account: Account;
  originToken: TokenInfo;
  destinationToken: TokenInfo;
  expirationTimestamp: string;
  tamperProofSignature: string;
  originChainsOperations: unknown[];
}

export interface QuoteStatus {
  quoteId: string;
  status: {
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
  };
  user: string;
  recipientAccountId: string;
  originChainOperations: {
    hash: string;
    chainId: number;
    explorerUrl: string;
  }[];
  destinationChainOperations: {
    hash: string;
    chainId: number;
    explorerUrl: string;
  }[];
}
