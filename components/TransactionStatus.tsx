import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';
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
    console.log({ status, isPolling });
  // Call onComplete when transaction is completed or failed
  useEffect(() => {
    if (status && (status.status === 'COMPLETED' || status.status === 'FAILED') && onComplete) {
      onComplete();
    }
  }, [status, onComplete]);

  if (!status) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600';
      case 'FAILED':
        return 'text-red-600';
      case 'REFUNDED':
        return 'text-orange-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Transaction Status</h3>
          {isPolling && (
            <div className="flex items-center text-sm text-gray-500">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400 mr-2"></div>
              Monitoring...
            </div>
          )}
        </div>

        <div className="space-y-3">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">Status:</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.status)}
              <span className={`font-medium ${getStatusColor(status.status)}`}>
                {status.status || 'Pending'}
              </span>
            </div>
          </div>

          {/* Origin Chain Operations */}
          {status.originChainOperations?.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Origin Chain:</span>
              <a
                href={status.originChainOperations[0].explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-500 hover:underline text-sm max-w-[200px] truncate"
              >
                <span>View Transaction</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Destination Chain Operations */}
          {status.destinationChainOperations?.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Destination Chain:</span>
              <a
                href={status.destinationChainOperations[0].explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-500 hover:underline text-sm max-w-[200px] truncate"
              >
                <span>View Transaction</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Additional Info */}
          {status.status === 'COMPLETED' && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-700 text-sm font-medium">
                ✅ Transaction completed successfully!
              </p>
              <p className="text-green-600 text-xs mt-1">
                Your balances have been updated.
              </p>
            </div>
          )}

          {status.status === 'FAILED' && (
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