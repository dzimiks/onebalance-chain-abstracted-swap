import { Clock, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useCountdown } from '@/lib/hooks/useCountdown';

interface QuoteCountdownProps {
  expirationTimestamp: number;
  onExpire: () => void;
}

export const QuoteCountdown = ({ expirationTimestamp, onExpire }: QuoteCountdownProps) => {
  const { formattedTime, timeLeft } = useCountdown(expirationTimestamp, onExpire);

  // Calculate total quote duration (assuming 30 seconds)
  const totalDuration = 30;
  const progressPercentage = Math.max(0, (timeLeft / totalDuration) * 100);

  // Get color based on time left - using a more modern palette
  const getTimeColor = () => {
    if (timeLeft <= 5) return 'text-red-600';
    if (timeLeft <= 10) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const getProgressColor = () => {
    if (timeLeft <= 5) return 'bg-red-500';
    if (timeLeft <= 10) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getBorderColor = () => {
    if (timeLeft <= 5) return 'border-red-200 dark:border-red-800/30';
    if (timeLeft <= 10) return 'border-amber-200 dark:border-amber-800/30';
    return 'border-emerald-200 dark:border-emerald-800/30';
  };

  const getBackgroundColor = () => {
    if (timeLeft <= 5) return 'bg-red-50 dark:bg-red-950/20';
    if (timeLeft <= 10) return 'bg-amber-50 dark:bg-amber-950/20';
    return 'bg-emerald-50 dark:bg-emerald-950/20';
  };

  if (timeLeft < 1) {
    return (
      <Card className="p-4 bg-muted/50 border-border">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="font-medium text-sm">Refreshing quote...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${getBackgroundColor()} ${getBorderColor()} border`}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className={`h-4 w-4 ${getTimeColor()}`} />
            <span className="text-sm text-foreground">Quote expires in</span>
          </div>
          <div className={`text-sm font-bold ${getTimeColor()}`}>{formattedTime}s</div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ease-linear ${getProgressColor()}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Warning message for low time */}
        {timeLeft <= 10 && (
          <div className="text-center">
            <span className={`text-xs font-medium ${getTimeColor()}`}>
              {timeLeft <= 5 ? 'Quote expiring soon...' : 'Quote will expire soon'}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
