'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  HelpCircle,
  BookOpen,
  MessageCircle,
  ExternalLink,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useOnboarding } from './OnboardingProvider';

export const HelpMenu = () => {
  const { startOnboarding, resetOnboarding } = useOnboarding();
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const router = useRouter();

  const quickHelp = [
    {
      icon: '🔗',
      title: 'Login',
      content: 'Click "Login" in the top right. We\'ll create a secure account for you instantly.',
    },
    {
      icon: '🔄',
      title: 'Make a Swap',
      content: 'Select tokens, enter amount, and click "Swap". We handle the rest!',
    },
    {
      icon: '⚡',
      title: 'Cross-Chain',
      content: 'Swap between different blockchains without switching networks.',
    },
    {
      icon: '💰',
      title: 'Gasless',
      content: 'We sponsor gas fees - no need to worry about ETH for transactions.',
    },
  ];

  const handleRestartTour = () => {
    // Close the help dialog first
    setShowHelpDialog(false);
    // Determine which page to navigate to based on current location
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/swap';
    const targetPath = currentPath.includes('/transfer') ? '/transfer' : '/swap';

    // Navigate to appropriate page, then start onboarding
    router.push(targetPath);
    setTimeout(() => {
      startOnboarding();
    }, 100);
  };

  const handleResetTutorial = () => {
    // Reset onboarding state so user can see welcome modal and tour again
    resetOnboarding();
    setShowHelpDialog(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0"
        onClick={() => setShowHelpDialog(true)}
      >
        <HelpCircle className="h-4 w-4" />
        <span className="sr-only">Help menu</span>
      </Button>

      {/* Help Topics Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Help & Support
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="space-y-3">
              <Button onClick={handleRestartTour} className="w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                Take Guided Tour
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" asChild className="flex-1">
                  <a href="https://docs.onebalance.io" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Documentation
                  </a>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetTutorial}
                  className="flex-1"
                  title="Reset tutorial progress to see the welcome screen again"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Tutorial
                </Button>
              </div>
            </div>

            {/* Quick Help */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Quick Help</h3>
              <div className="grid gap-3">
                {quickHelp.map((item, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <h4 className="font-medium text-foreground text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Contact Support */}
            <Card className="p-4 bg-muted/30">
              <h3 className="font-semibold text-foreground mb-2">Need more help?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Join our community or contact support for assistance.
              </p>
              <div className="flex gap-2">
                <Button size="sm" asChild className="flex-1">
                  <a href="https://discord.gg/onebalance" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Discord
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <a href="mailto:support@onebalance.io" target="_blank" rel="noopener noreferrer">
                    Email
                  </a>
                </Button>
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
