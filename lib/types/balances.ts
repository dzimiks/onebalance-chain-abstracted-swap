/**
 * Individual asset balance with fiat value
 */
export interface IndividualAssetBalance {
  /** CAIP-19 format identifier for the individual asset (e.g., eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48) */
  assetType: string;

  /** The balance of the individual asset in string format (BigInt as string) */
  balance: string;

  /** Fiat value of the individual asset */
  fiatValue: number;
}

/**
 * Balance information for an aggregated asset
 */
export interface BalanceByAssetDto {
  /** The aggregated asset ID (e.g., ob:eth) */
  aggregatedAssetId: string;

  /** The total balance of the aggregated asset */
  balance: string;

  /** The total fiat value of the aggregated asset */
  fiatValue: number;

  /** List of individual asset balances that make up the aggregated asset */
  individualAssetBalances: IndividualAssetBalance[];

  /** Optional symbol for the asset */
  symbol?: string;

  /** Optional number of decimals for the asset */
  decimals?: number;
}

/**
 * Total balance information
 */
export interface TotalBalance {
  /** The total fiat value across all assets */
  fiatValue: number;
}

/**
 * Complete balance response structure (v2 API)
 */
export interface BalancesResponse {
  /** Array of balance information for each aggregated asset */
  balanceByAggregatedAsset: BalanceByAssetDto[];

  /** Total balance information */
  totalBalance: TotalBalance;
}

// ===== V3 API TYPES FOR MULTI-ACCOUNT BALANCES =====

/**
 * Specific asset balance (for balanceBySpecificAsset array)
 */
export interface SpecificAssetBalance {
  /** The specific asset type (CAIP-19 format) */
  assetType: string;

  /** The balance of the specific asset */
  balance: string;

  /** Fiat value of the specific asset */
  fiatValue: number;
}

/**
 * Account addresses parsed from the request
 */
export interface BalanceAccountsV3 {
  /** EVM account address (if provided) */
  evm?: string;

  /** Solana account address (if provided) */
  solana?: string;
}

/**
 * Complete balance response structure for v3 API (multi-account support)
 */
export interface BalancesResponseV3 {
  /** Parsed account addresses from the request */
  accounts: BalanceAccountsV3;

  /** Array of balance information for each aggregated asset */
  balanceByAggregatedAsset: BalanceByAssetDto[];

  /** Array of balance information for specific assets */
  balanceBySpecificAsset: SpecificAssetBalance[];

  /** Total balance information */
  totalBalance: TotalBalance;
}

/**
 * Parameters for v3 aggregated balance request
 */
export interface BalanceParamsV3 {
  /** Account identifiers in CAIP-10 format or custom format, comma-separated */
  account: string;

  /** Optional: Aggregated asset IDs to filter by, comma-separated (e.g., "ds:eth,ds:usdc") */
  aggregatedAssetId?: string;

  /** Optional: Additional token asset IDs to include, comma-separated */
  assetId?: string;
}
