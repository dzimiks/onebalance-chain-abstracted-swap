export interface AggregatedAssetEntity {
  assetType: string;
  decimals: number;
  name: string;
  symbol: string;
}

export interface Asset {
  aggregatedAssetId: string;
  symbol: string;
  name: string;
  decimals: number;
  aggregatedEntities: AggregatedAssetEntity[];
}
