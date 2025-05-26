import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Clock, CheckCircle, XCircle, X } from 'lucide-react';
import { QuoteStatus } from '@/lib/types/quote';

interface TransactionStatusProps {
  status: QuoteStatus | null;
  isPolling: boolean;
  onComplete?: () => void;
}

export const TransactionStatus = ({
  status,
  isPolling,
  onComplete,
}: TransactionStatusProps) => {
  // Internal state to persist status even when prop becomes null
  const [persistedStatus, setPersistedStatus] = useState<QuoteStatus | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Track if onComplete has already been called to prevent multiple calls
  const onCompleteCalledRef = useRef(false);

  // Update persisted status when new status is received
  useEffect(() => {
    if (status) {
      setPersistedStatus(status);
      setIsVisible(true);
      // Reset the onComplete flag when a new status is received
      onCompleteCalledRef.current = false;
    }
  }, [status]);

  // Call onComplete when transaction is completed or failed (only once)
  useEffect(() => {
    if (
      persistedStatus && 
      (persistedStatus.status === 'COMPLETED' || persistedStatus.status === 'FAILED') && 
      onComplete && 
      !onCompleteCalledRef.current
    ) {
      onCompleteCalledRef.current = true;
      onComplete();
    }
  }, [persistedStatus?.status, onComplete]);

  // Don't render if no status has been set yet
  if (!persistedStatus || !isVisible) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 dark:text-green-400';
      case 'FAILED':
        return 'text-red-600 dark:text-red-400';
      case 'REFUNDED':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setPersistedStatus(null);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Transaction Status</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Status:</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(persistedStatus.status)}
              <span className={`font-medium ${getStatusColor(persistedStatus.status)}`}>
                {persistedStatus.status || 'Pending'}
              </span>
            </div>
          </div>

          {/* Origin Chain Operations */}
          {persistedStatus.originChainOperations?.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Origin Chain:</span>
              <a
                href={persistedStatus.originChainOperations[0].explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:text-primary/80 hover:underline text-sm max-w-[200px] truncate"
              >
                <span>View Transaction</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Destination Chain Operations */}
          {persistedStatus.destinationChainOperations?.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">Destination Chain:</span>
              <a
                href={persistedStatus.destinationChainOperations[0].explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:text-primary/80 hover:underline text-sm max-w-[200px] truncate"
              >
                <span>View Transaction</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Additional Info */}
          {persistedStatus.status === 'COMPLETED' && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-700 text-sm font-medium">
                ✅ Transaction completed successfully!
              </p>
              <p className="text-green-600 text-xs mt-1">
                Your balances have been updated.
              </p>
            </div>
          )}

          {persistedStatus.status === 'FAILED' && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-700 text-sm font-medium">
                ❌ Transaction failed
              </p>
              <p className="text-red-600 text-xs mt-1">
                Please check the transaction details and try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}; 