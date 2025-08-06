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
  from: {
    account: {
      sessionAddress: string;
      adminAddress: string;
      accountAddress: string;
    };
    asset: {
      assetId: string;
    };
    amount: string;
  };
  to: {
    asset: {
      assetId: string;
    };
    account?: string; // Optional CAIP account ID for transfers to other accounts
    amount?: string; // Optional for quotes (used for exact output)
  };
}

export interface ChainOperation {
  userOp: {
    sender: string;
    nonce: string;
    callData: string;
    callGasLimit: string;
    verificationGasLimit: string;
    preVerificationGas: string;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
    paymaster: string;
    paymasterVerificationGasLimit: string;
    paymasterPostOpGasLimit: string;
    paymasterData: string;
    signature: string;
  };
  typedDataToSign: {
    domain: unknown;
    types: unknown;
    primaryType: string;
    message: unknown;
  };
  assetType: string;
  amount: string;
}

export interface Quote {
  id: string;
  account: Account;
  originToken: TokenInfo;
  destinationToken: TokenInfo;
  expirationTimestamp: string;
  tamperProofSignature: string;
  originChainsOperations: ChainOperation[];
  destinationChainOperation?: ChainOperation;
}

export interface QuoteStatus {
  quoteId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'IN_PROGRESS' | 'REFUNDED';
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

// ===== V3 API TYPES FOR SOLANA & CROSS-CHAIN =====

export interface SolanaAccount {
  type: 'solana';
  accountAddress: string;
}

export interface EVMAccount {
  type: 'kernel-v3.1-ecdsa';
  accountAddress: string;
  deploymentType: 'ERC4337';
  signerAddress: string;
}

export type AccountV3 = SolanaAccount | EVMAccount;

export interface SolanaOperation {
  type: 'solana';
  instructions: any[];
  recentBlockHash: string;
  feePayer: string;
  signature?: string;
  dataToSign: string;
  assetType: string;
  amount: string;
}

export interface EVMOperation {
  userOp: {
    sender: string;
    nonce: string;
    callData: string;
    callGasLimit: string;
    verificationGasLimit: string;
    preVerificationGas: string;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
    paymaster: string;
    paymasterVerificationGasLimit: string;
    paymasterPostOpGasLimit: string;
    paymasterData: string;
    signature?: string;
  };
  typedDataToSign: {
    domain: unknown;
    types: unknown;
    primaryType: string;
    message: unknown;
  };
  assetType: string;
  amount: string;
}

export type ChainOperationV3 = SolanaOperation | EVMOperation;

export interface QuoteRequestV3 {
  from: {
    accounts: AccountV3[];
    asset: {
      assetId: string;
    };
    amount: string;
  };
  to: {
    asset: {
      assetId: string;
    };
    account?: string; // Optional CAIP account ID for cross-chain transfers
    amount?: string; // Optional for quotes (used for exact output)
  };
}

export interface TokenInfoV3 {
  assetType: string | string[];
  amount: string;
  minimumAmount?: string;
  fiatValue: string;
  recipientAccount?: string;
}

export interface QuoteV3 {
  id: string;
  accounts: AccountV3[];
  originToken: TokenInfoV3;
  destinationToken: TokenInfoV3;
  expirationTimestamp: string;
  tamperProofSignature?: string;
  originChainsOperations: ChainOperationV3[];
  destinationChainOperation?: ChainOperationV3;
  fees?: {
    assets: Record<string, string>;
    cumulativeUSD: string;
  };
}

export interface QuoteStatusV3 {
  quoteId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'IN_PROGRESS' | 'REFUNDED';
  user: string;
  recipientAccountId: string;
  originChainOperations: {
    hash: string;
    chainId?: number;
    explorerUrl: string;
  }[];
  destinationChainOperations: {
    hash: string;
    chainId?: number;
    explorerUrl: string;
  }[];
}
