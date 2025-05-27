'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight, ArrowLeft, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useOnboarding } from './OnboardingProvider';

interface TooltipPosition {
  top: number;
  left: number;
  arrowPosition: 'top' | 'bottom' | 'left' | 'right';
}

export const OnboardingTooltip = () => {
  const { state, nextStep, prevStep, skipOnboarding, completeStep } = useOnboarding();
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = state.steps[state.currentStep];

  // Combined effect for DOM check and positioning
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    // If onboarding is active, start positioning
    if (state.isActive && currentStep) {
      const updatePosition = () => {
        const targetElement = document.querySelector(currentStep.target);

        if (!targetElement) {
          return;
        }

        // Create a temporary tooltip element to measure with full content
        const tempTooltip = document.createElement('div');
        tempTooltip.style.position = 'fixed';
        tempTooltip.style.visibility = 'hidden';
        tempTooltip.style.maxWidth = '320px'; // Smaller max width
        tempTooltip.style.padding = '16px';
        tempTooltip.style.lineHeight = '1.5';
        // Include both title and description for accurate measurement
        tempTooltip.innerHTML = `
          <div style="font-weight: 600; margin-bottom: 8px;">${currentStep.title}</div>
          <div style="font-size: 14px; margin-bottom: 12px;">${currentStep.description}</div>
          <div style="height: 24px; margin-bottom: 12px;"></div>
          <div style="height: 32px;"></div>
        `;
        document.body.appendChild(tempTooltip);

        const targetRect = targetElement.getBoundingClientRect();
        const tooltipRect = tempTooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let top = 0;
        let left = 0;
        let arrowPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

        const offset = 12;
        const margin = 16;

        // Try preferred position first
        switch (currentStep.position) {
          case 'bottom':
            top = targetRect.bottom + offset;
            left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
            arrowPosition = 'top';
            break;
          case 'top':
            top = targetRect.top - tooltipRect.height - offset;
            left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
            arrowPosition = 'bottom';
            break;
          case 'right':
            top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
            left = targetRect.right + offset;
            arrowPosition = 'left';
            break;
          case 'left':
            top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
            left = targetRect.left - tooltipRect.width - offset;
            arrowPosition = 'right';
            break;
        }

        // Smart repositioning if tooltip goes off-screen
        const wouldOverflowRight = left + tooltipRect.width > viewportWidth - margin;
        const wouldOverflowLeft = left < margin;
        const wouldOverflowBottom = top + tooltipRect.height > viewportHeight - margin;
        const wouldOverflowTop = top < margin;

        // If horizontal overflow, try vertical positions
        if (
          (wouldOverflowRight || wouldOverflowLeft) &&
          (currentStep.position === 'left' || currentStep.position === 'right')
        ) {
          // Try bottom first
          const bottomTop = targetRect.bottom + offset;
          if (bottomTop + tooltipRect.height <= viewportHeight - margin) {
            top = bottomTop;
            left = Math.max(
              margin,
              Math.min(
                targetRect.left + (targetRect.width - tooltipRect.width) / 2,
                viewportWidth - tooltipRect.width - margin
              )
            );
            arrowPosition = 'top';
          } else {
            // Try top
            top = targetRect.top - tooltipRect.height - offset;
            left = Math.max(
              margin,
              Math.min(
                targetRect.left + (targetRect.width - tooltipRect.width) / 2,
                viewportWidth - tooltipRect.width - margin
              )
            );
            arrowPosition = 'bottom';
          }
        }

        // If vertical overflow, try horizontal positions
        if (
          (wouldOverflowTop || wouldOverflowBottom) &&
          (currentStep.position === 'top' || currentStep.position === 'bottom')
        ) {
          // Try right first
          const rightLeft = targetRect.right + offset;
          if (rightLeft + tooltipRect.width <= viewportWidth - margin) {
            left = rightLeft;
            top = Math.max(
              margin,
              Math.min(
                targetRect.top + (targetRect.height - tooltipRect.height) / 2,
                viewportHeight - tooltipRect.height - margin
              )
            );
            arrowPosition = 'left';
          } else {
            // Try left
            left = targetRect.left - tooltipRect.width - offset;
            top = Math.max(
              margin,
              Math.min(
                targetRect.top + (targetRect.height - tooltipRect.height) / 2,
                viewportHeight - tooltipRect.height - margin
              )
            );
            arrowPosition = 'right';
          }
        }

        // Final constraint to viewport
        left = Math.max(margin, Math.min(left, viewportWidth - tooltipRect.width - margin));
        top = Math.max(margin, Math.min(top, viewportHeight - tooltipRect.height - margin));

        // Clean up temp element
        document.body.removeChild(tempTooltip);

        setPosition({ top, left, arrowPosition });
        setIsVisible(true);

        // Add highlight to target element and bring it above backdrop
        targetElement.classList.add('onboarding-highlight');
        (targetElement as HTMLElement).style.position = 'relative';
        (targetElement as HTMLElement).style.zIndex = '45'; // Above backdrop (z-40) but below tooltip (z-50)

        // Scroll target into view
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
      };

      // Update position after a delay
      const timer = setTimeout(updatePosition, 500);

      return () => {
        clearTimeout(timer);
        // Remove highlight and reset styles
        const targetElement = document.querySelector(currentStep.target);
        if (targetElement) {
          targetElement.classList.remove('onboarding-highlight');
          (targetElement as HTMLElement).style.position = '';
          (targetElement as HTMLElement).style.zIndex = '';
        }
      };
    } else {
      setIsVisible(false);
      setPosition(null);
    }
  }, [state.isActive, currentStep?.id]);

  const handleNext = () => {
    if (currentStep) {
      completeStep(currentStep.id);
    }

    if (state.currentStep < state.steps.length - 1) {
      nextStep();
    } else {
      // Onboarding complete
      skipOnboarding();
    }
  };

  const handleSkip = () => {
    skipOnboarding();
  };

  if (!state.isActive || !currentStep || !position || !isVisible) {
    return null;
  }

  const isFirstStep = state.currentStep === 0;
  const isLastStep = state.currentStep === state.steps.length - 1;

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 pointer-events-none" />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-50 animate-in fade-in-0 zoom-in-95 duration-200"
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        <Card className="relative max-w-80 p-4 shadow-lg border-2 border-primary/20 bg-background/95 backdrop-blur-sm">
          {/* Arrow */}
          <div
            className={`absolute w-3 h-3 bg-background border-primary/20 transform rotate-45 ${
              position.arrowPosition === 'top'
                ? '-top-1.5 left-1/2 -translate-x-1/2 border-t border-l'
                : position.arrowPosition === 'bottom'
                  ? '-bottom-1.5 left-1/2 -translate-x-1/2 border-b border-r'
                  : position.arrowPosition === 'left'
                    ? '-left-1.5 top-1/2 -translate-y-1/2 border-l border-b'
                    : '-right-1.5 top-1/2 -translate-y-1/2 border-r border-t'
            }`}
          />

          {/* Content */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">{currentStep.title}</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentStep.description}
            </p>

            {/* Progress indicator */}
            <div className="flex items-center gap-1">
              {state.steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-6 rounded-full transition-colors ${
                    index <= state.currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-muted-foreground">
                Step {state.currentStep + 1} of {state.steps.length}
              </div>

              <div className="flex items-center gap-2">
                {!isFirstStep && (
                  <Button variant="outline" size="sm" onClick={prevStep} className="h-8">
                    <ArrowLeft className="h-3 w-3 mr-1" />
                    Back
                  </Button>
                )}

                <Button size="sm" onClick={handleNext} className="h-8">
                  {isLastStep ? 'Finish' : 'Next'}
                  {!isLastStep && <ArrowRight className="h-3 w-3 ml-1" />}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>,
    document.body
  );
};
