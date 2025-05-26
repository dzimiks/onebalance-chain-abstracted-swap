import { Info, Clock, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Quote } from '@/lib/types/quote';

interface QuoteDetailsProps {
  quote: Quote;
}

export const QuoteDetails = ({ quote }: QuoteDetailsProps) => {
  // Get asset symbols for display
  const getAssetSymbol = (assetId: string) => {
    return assetId.split(':')[1]?.toUpperCase() || assetId;
  };

  // Calculate exchange rate
  const getExchangeRate = () => {
    const fromAmount = parseFloat(quote.originToken.amount);
    const toAmount = parseFloat(quote.destinationToken.amount);
    if (fromAmount === 0) return '0';
    const rate = toAmount / fromAmount;
    return rate.toFixed(6);
  };

  // Format the expiration time
  const formatExpirationTime = () => {
    const expirationDate = new Date(parseInt(quote.expirationTimestamp) * 1000);
    return expirationDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <Card className="p-4 bg-slate-50 border-slate-200">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-slate-600" />
          <span className="font-medium text-slate-800">Quote Details</span>
        </div>

        {/* Key Details Grid */}
        <div className="grid grid-cols-1 gap-3 text-sm">
          {/* Exchange Rate */}
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span className="text-slate-600">Exchange Rate</span>
              </div>
              <div className="font-medium text-slate-900">
                1 {getAssetSymbol(quote.originToken.aggregatedAssetId)} = {getExchangeRate()} {getAssetSymbol(quote.destinationToken.aggregatedAssetId)}
              </div>
            </div>
          </div>

          {/* Quote ID and Expiration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-2 border border-slate-200">
              <div className="text-slate-500">Quote ID</div>
              <div className="font-mono text-xs text-slate-700 truncate">
                {quote.id.slice(0, 8)}...{quote.id.slice(-8)}
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-2 border border-slate-200">
              <div className="text-slate-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Expires at
              </div>
              <div className="font-medium text-slate-700">
                {formatExpirationTime()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
