'use client';

import { useState, useRef, useEffect } from 'react';
import { HelpCircle, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ContextualHelpProps {
  title: string;
  content: string;
  type?: 'info' | 'warning' | 'tip';
  trigger?: 'hover' | 'click';
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  children?: React.ReactNode;
}

export const ContextualHelp = ({
  title,
  content,
  type = 'info',
  trigger = 'hover',
  position = 'top',
  className = '',
  children,
}: ContextualHelpProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'tip':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'warning':
        return 'border-amber-200 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-950/20';
      case 'tip':
        return 'border-blue-200 dark:border-blue-800/30 bg-blue-50 dark:bg-blue-950/20';
      default:
        return 'border-border bg-background';
    }
  };

  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current || !tooltipRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = 0;
      let left = 0;
      const offset = 8;

      switch (position) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - offset;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = triggerRect.bottom + offset;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.left - tooltipRect.width - offset;
          break;
        case 'right':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.right + offset;
          break;
      }

      // Keep tooltip within viewport
      if (left < 8) left = 8;
      if (left + tooltipRect.width > viewportWidth - 8) {
        left = viewportWidth - tooltipRect.width - 8;
      }
      if (top < 8) top = 8;
      if (top + tooltipRect.height > viewportHeight - 8) {
        top = viewportHeight - tooltipRect.height - 8;
      }

      setTooltipPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={`inline-flex items-center ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {children || (
          <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-muted/50">
            {getIcon()}
          </Button>
        )}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          <Card className={`max-w-xs p-3 shadow-lg ${getColors()}`}>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                {getIcon()}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground">{title}</h4>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{content}</p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

// Predefined help content for common concepts
export const helpContent = {
  slippage: {
    title: 'Slippage Tolerance',
    content:
      "The maximum price difference you're willing to accept. Higher slippage means your trade is more likely to succeed, but you might get a worse price.",
    type: 'info' as const,
  },
  gasless: {
    title: 'Gasless Transactions',
    content:
      'We sponsor the blockchain fees for you! No need to hold ETH or worry about gas prices.',
    type: 'tip' as const,
  },
  crossChain: {
    title: 'Cross-Chain Swap',
    content:
      'Swap tokens between different blockchains (like Ethereum to Polygon) in a single transaction.',
    type: 'info' as const,
  },
  aggregatedBalance: {
    title: 'Aggregated Balance',
    content:
      'Your total token balance across all supported blockchains, shown as one unified amount.',
    type: 'info' as const,
  },
  smartAccount: {
    title: 'Smart Account',
    content:
      'A more advanced wallet that can automate transactions and provide better security features.',
    type: 'tip' as const,
  },
  quote: {
    title: 'Quote Expiration',
    content:
      'Prices change quickly in crypto. Our quotes are valid for 30 seconds to ensure you get the rate you see.',
    type: 'warning' as const,
  },
};
