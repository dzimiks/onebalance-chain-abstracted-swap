import { Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Quote } from '@/lib/types/quote';

interface QuoteDetailsProps {
  quote: Quote;
}

export const QuoteDetails = ({ quote }: QuoteDetailsProps) => (
  <Alert variant="info">
    <Info className="h-4 w-4" />
    <AlertTitle>Quote Details</AlertTitle>
    <AlertDescription>
      <p>From: {quote.originToken.amount} {quote.originToken.aggregatedAssetId}</p>
      <p>To: {quote.destinationToken.amount} {quote.destinationToken.aggregatedAssetId}</p>
      <p>Now: {new Date().toLocaleString()}</p>
      <p>Expires: {new Date(parseInt(quote.expirationTimestamp) * 1000).toLocaleString()}</p>
      <pre className="max-h-[300px] overflow-auto">{JSON.stringify({
        originToken: quote.originToken,
        destinationToken: quote.destinationToken,
      }, null, 2)}</pre>
    </AlertDescription>
  </Alert>
);
