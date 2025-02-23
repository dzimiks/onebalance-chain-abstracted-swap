import { Alert } from '@/components/ui/alert';
import { useCountdown } from '@/lib/hooks/useCountdown';

interface QuoteCountdownProps {
  expirationTimestamp: number;
  onExpire: () => void;
}

export const QuoteCountdown = ({ expirationTimestamp, onExpire }: QuoteCountdownProps) => {
  const { formattedTime, timeLeft } = useCountdown(expirationTimestamp, onExpire);

  // Determine the appropriate variant based on time left
  const getAlertVariant = () => {
    if (timeLeft <= 10) return 'warning';
    return 'info';
  };

  return (
    <Alert variant={getAlertVariant()} className="flex items-center justify-between">
      {timeLeft < 1 && <span>Re-fetching quote...</span>}
      {timeLeft > 0 && <span>Quote expires in: {formattedTime} seconds</span>}
    </Alert>
  );
};