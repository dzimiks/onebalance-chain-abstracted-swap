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
  /** The aggregated asset ID (e.g., ds:eth) */
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
 * Complete balance response structure
 */
export interface BalancesResponse {
  /** Array of balance information for each aggregated asset */
  balanceByAsset: BalanceByAssetDto[];

  /** Total balance information */
  totalBalance: TotalBalance;
}
