'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, X, Zap, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useOnboarding } from './OnboardingProvider';

export const WelcomeModal = () => {
  const { state, startOnboarding, skipOnboarding } = useOnboarding();
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const slides = [
    {
      icon: <Sparkles className="h-8 w-8 text-blue-500" />,
      title: 'Welcome to OneBalance! ✨',
      description: 'Swap tokens across different blockchains in seconds, without the complexity.',
      highlight: 'No network switching, no gas worries, just simple swaps.',
    },
    {
      icon: <Zap className="h-8 w-8 text-emerald-500" />,
      title: 'Lightning Fast Swaps ⚡',
      description: 'Get quotes in real-time and execute swaps in under 30 seconds.',
      highlight: 'We handle all the blockchain complexity for you.',
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-500" />,
      title: 'Secure & Simple 🛡️',
      description: 'Your funds are always secure. We never hold your assets.',
      highlight: 'Connect with any wallet or let us create one for you.',
    },
    {
      icon: <Globe className="h-8 w-8 text-orange-500" />,
      title: 'Cross-Chain Magic 🌍',
      description: 'Swap between Ethereum, Polygon, Arbitrum, and more - all in one place.',
      highlight: 'One interface, multiple blockchains.',
    },
  ];

  const isOpen = !state.hasSeenWelcome;
  const currentSlideData = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;
  const showFinalSlide = currentSlide >= slides.length;

  const handleNext = () => {
    if (isLastSlide) {
      // Move to final CTA slide
      setCurrentSlide(prev => prev + 1);
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    skipOnboarding();
  };

  const handleStartTour = () => {
    // Navigate to swap page first, then start onboarding
    router.push('/swap');
    // Small delay to ensure navigation completes
    setTimeout(() => {
      startOnboarding();
    }, 100);
  };

  const handleJustExplore = () => {
    skipOnboarding();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md p-0 gap-0 border-0 bg-transparent shadow-none [&>button]:hidden">
        <DialogTitle className="sr-only">Welcome to OneBalance</DialogTitle>
        <Card className="relative overflow-hidden bg-background border-2 border-primary/10">
          {/* Single close button for all slides */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="absolute top-4 right-4 h-8 w-8 p-0 text-muted-foreground hover:text-foreground z-10"
          >
            <X className="h-4 w-4" />
          </Button>

          {!showFinalSlide ? (
            // Slides
            <div className="p-8 text-center space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="p-4 rounded-2xl bg-muted/50">{currentSlideData.icon}</div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">{currentSlideData.title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {currentSlideData.description}
                </p>
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-sm font-medium text-primary">{currentSlideData.highlight}</p>
                </div>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleSkip} className="flex-1">
                  Skip
                </Button>
                <Button onClick={handleNext} className="flex-1">
                  {isLastSlide ? 'Get Started' : 'Next'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            // Final CTA slide
            <div className="p-8 text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-2xl bg-primary/10">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Ready to Start Swapping? 🚀</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Choose how you would like to begin your OneBalance journey.
                </p>
              </div>

              <div className="space-y-3">
                <Button onClick={handleStartTour} className="w-full" size="lg">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Take the Guided Tour
                </Button>
                <Button variant="outline" onClick={handleJustExplore} className="w-full" size="lg">
                  Just Let Me Explore
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                You can always restart the tour from the help menu
              </p>
            </div>
          )}
        </Card>
      </DialogContent>
    </Dialog>
  );
};
