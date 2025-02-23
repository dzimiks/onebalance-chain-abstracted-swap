import { Quote } from '@/lib/types/quote';

interface QuoteDetailsProps {
  quote: Quote;
}

export const QuoteDetails = ({ quote }: QuoteDetailsProps) => (
  <div className="p-4 bg-gray-100 rounded-lg space-y-2">
    <h3 className="font-medium">Quote Details</h3>
    <div className="text-sm">
      <p>From: {quote.originToken.amount} {quote.originToken.aggregatedAssetId}</p>
      <p>To: {quote.destinationToken.amount} {quote.destinationToken.aggregatedAssetId}</p>
      <p>Expires: {new Date(parseInt(quote.expirationTimestamp) * 1000).toLocaleString()}</p>
      <pre className="max-h-[300px] overflow-auto">{JSON.stringify({
        originToken: quote.originToken,
        destinationToken: quote.destinationToken,
      }, null, 2)}</pre>
    </div>
  </div>
);
