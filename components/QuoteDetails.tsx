import { Info, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Quote } from '@/lib/types/quote';
import { ContextualHelp, helpContent } from '@/components/onboarding/ContextualHelp';

interface QuoteDetailsProps {
  quote: Quote;
}

export const QuoteDetails = ({ quote }: QuoteDetailsProps) => {
  // Get asset symbols for display
  const getAssetSymbol = (assetId: string) => {
    return assetId.split(':')[1]?.toUpperCase() || assetId;
  };

  // Calculate price per token
  const getTokenPrice = (tokenType: 'origin' | 'destination') => {
    if (tokenType === 'origin') {
      const amount = parseFloat(quote.originToken.amount);
      // Handle both single fiat value and array of fiat values
      const fiatValue = quote.originToken.fiatValue as any;
      const totalFiatValue = Array.isArray(fiatValue)
        ? parseFloat(fiatValue[0]?.fiatValue || '0')
        : parseFloat(fiatValue || '0');

      if (amount === 0 || totalFiatValue === 0) return '0';
      const pricePerToken = totalFiatValue / amount;

      // Format large numbers with proper decimals
      if (pricePerToken >= 1000) {
        return pricePerToken.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      } else if (pricePerToken >= 1) {
        return pricePerToken.toFixed(2);
      } else {
        return pricePerToken.toFixed(4);
      }
    } else {
      const amount = parseFloat(quote.destinationToken.amount);
      const fiatValue = parseFloat((quote.destinationToken.fiatValue as any) || '0');

      if (amount === 0 || fiatValue === 0) return '0';
      const pricePerToken = fiatValue / amount;

      // Format based on value
      if (pricePerToken >= 1000) {
        return pricePerToken.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      } else if (pricePerToken >= 1) {
        return pricePerToken.toFixed(2);
      } else {
        return pricePerToken.toFixed(4);
      }
    }
  };

  // Format the expiration time
  const formatExpirationTime = () => {
    const expirationDate = new Date(parseInt(quote.expirationTimestamp) * 1000);
    return expirationDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const originSymbol = getAssetSymbol(quote.originToken.aggregatedAssetId);
  const destinationSymbol = getAssetSymbol(quote.destinationToken.aggregatedAssetId);

  return (
    <Card className="p-4 bg-muted/50 border-border">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">Quote Details</span>
          </div>
          <ContextualHelp
            title={helpContent.quote.title}
            content={helpContent.quote.content}
            type={helpContent.quote.type}
            position="left"
          />
        </div>

        {/* Key Details Grid */}
        <div className="grid grid-cols-1 gap-3 text-sm">
          {/* Token Prices */}
          <div className="grid grid-cols-2 gap-3">
            {/* From Token Price */}
            <div className="bg-background rounded-lg p-3 border border-border">
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <span className="text-xs">{originSymbol} Price</span>
              </div>
              <div className="font-medium text-foreground">
                1 {originSymbol} = ${getTokenPrice('origin')}
              </div>
            </div>

            {/* To Token Price */}
            <div className="bg-background rounded-lg p-3 border border-border">
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <span className="text-xs">{destinationSymbol} Price</span>
              </div>
              <div className="font-medium text-foreground">
                1 {destinationSymbol} = ${getTokenPrice('destination')}
              </div>
            </div>
          </div>

          {/* Quote ID and Expiration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background rounded-lg p-3 border border-border">
              <div className="text-muted-foreground text-xs">Quote ID</div>
              <div className="font-mono text-sm text-foreground truncate">
                {quote.id.slice(0, 8)}...{quote.id.slice(-8)}
              </div>
            </div>

            <div className="bg-background rounded-lg p-3 border border-border">
              <div className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="text-xs">Expires at</span>
              </div>
              <div className="font-medium text-foreground text-sm">{formatExpirationTime()}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
