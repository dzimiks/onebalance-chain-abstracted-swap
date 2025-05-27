'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { OnboardingTooltip } from '@/components/onboarding/OnboardingTooltip';
import { HelpMenu } from '@/components/onboarding/HelpMenu';

export default function TradingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen justify-between font-[family-name:var(--font-geist-sans)] bg-background transition-colors">
      <Header />
      {children}
      <Footer />

      {/* Onboarding Components */}
      <WelcomeModal />
      <OnboardingTooltip />

      {/* Help Menu - Fixed Position above footer */}
      <div className="fixed bottom-20 right-6 z-40">
        <HelpMenu />
      </div>
    </div>
  );
}
