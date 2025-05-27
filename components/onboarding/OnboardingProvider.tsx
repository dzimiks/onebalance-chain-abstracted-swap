'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'hover' | 'focus';
  completed: boolean;
}

interface OnboardingState {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  hasSeenWelcome: boolean;
  completedActions: Set<string>;
}

interface OnboardingContextType {
  state: OnboardingState;
  startOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;
  completeStep: (stepId: string) => void;
  skipOnboarding: () => void;
  markActionCompleted: (action: string) => void;
  shouldShowHelp: (target: string) => boolean;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

const SWAP_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to OneBalance! 👋',
    description:
      'Swap tokens across different blockchains in seconds, without switching networks or worrying about gas fees.',
    target: '[data-onboarding="main-card"]',
    position: 'bottom',
    completed: false,
  },
  {
    id: 'connect-wallet',
    title: 'Connect Your Wallet',
    description:
      "Click here to connect your wallet. Don't worry - we'll create one for you if you don't have one!",
    target: '[data-onboarding="connect-button"]',
    position: 'bottom',
    action: 'click',
    completed: false,
  },
  {
    id: 'select-token',
    title: 'Choose What to Swap',
    description:
      'Select the token you want to swap from. We support popular tokens across multiple blockchains.',
    target: '[data-onboarding="from-token"]',
    position: 'right',
    action: 'click',
    completed: false,
  },
  {
    id: 'enter-amount',
    title: 'Enter Amount',
    description:
      'Type how much you want to swap, or use the percentage buttons for quick selection.',
    target: '[data-onboarding="amount-input"]',
    position: 'top',
    action: 'focus',
    completed: false,
  },
  {
    id: 'select-target',
    title: 'Choose Target Token',
    description:
      "Pick what token you want to receive. We'll find the best rate across all supported chains.",
    target: '[data-onboarding="to-token"]',
    position: 'left',
    action: 'click',
    completed: false,
  },
  {
    id: 'review-quote',
    title: 'Review Your Quote',
    description: 'Check the exchange rate and estimated fees. Our quotes are valid for 30 seconds.',
    target: '[data-onboarding="quote-details"]',
    position: 'top',
    completed: false,
  },
  {
    id: 'execute-swap',
    title: 'Execute Your Swap',
    description:
      "Click to confirm your swap. We'll handle all the complex blockchain interactions for you.",
    target: '[data-onboarding="swap-button"]',
    position: 'top',
    action: 'click',
    completed: false,
  },
];

const TRANSFER_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'transfer-welcome',
    title: 'Welcome to Transfers! 💸',
    description: 'Send tokens to any address across different blockchains quickly and securely.',
    target: '[data-onboarding="transfer-card"]',
    position: 'bottom',
    completed: false,
  },
  {
    id: 'connect-wallet',
    title: 'Connect Your Wallet',
    description:
      "Click here to connect your wallet. Don't worry - we'll create one for you if you don't have one!",
    target: '[data-onboarding="connect-button"]',
    position: 'bottom',
    action: 'click',
    completed: false,
  },
  {
    id: 'select-transfer-token',
    title: 'Choose Token to Send',
    description:
      'Select which token you want to transfer. We support popular tokens across multiple blockchains.',
    target: '[data-onboarding="transfer-token"]',
    position: 'right',
    action: 'click',
    completed: false,
  },
  {
    id: 'enter-recipient',
    title: 'Enter Recipient Address',
    description: 'Type the wallet address or ENS name where you want to send the tokens.',
    target: '[data-onboarding="transfer-recipient"]',
    position: 'top',
    action: 'focus',
    completed: false,
  },
  {
    id: 'select-network',
    title: 'Choose Destination Network',
    description: 'Pick which blockchain network the recipient should receive the tokens on.',
    target: '[data-onboarding="transfer-network"]',
    position: 'top',
    action: 'click',
    completed: false,
  },
  {
    id: 'execute-transfer',
    title: 'Send Your Transfer',
    description: "Click to confirm your transfer. We'll handle the cross-chain routing for you.",
    target: '[data-onboarding="transfer-button"]',
    position: 'top',
    action: 'click',
    completed: false,
  },
];

// Helper function to get appropriate steps based on current page
const getOnboardingSteps = () => {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    if (pathname.includes('/transfer')) {
      return TRANSFER_ONBOARDING_STEPS;
    }
  }
  return SWAP_ONBOARDING_STEPS; // Default to swap steps
};

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<OnboardingState>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onebalance-onboarding');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          steps: getOnboardingSteps(), // Always use current page steps
          completedActions: new Set(parsed.completedActions || []),
        };
      }
    }

    return {
      isActive: false,
      currentStep: 0,
      steps: getOnboardingSteps(),
      hasSeenWelcome: false,
      completedActions: new Set<string>(),
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const toSave = {
        ...state,
        completedActions: Array.from(state.completedActions),
      };
      localStorage.setItem('onebalance-onboarding', JSON.stringify(toSave));
    }
  }, [state]);

  const startOnboarding = () => {
    setState(prev => ({
      ...prev,
      isActive: true,
      currentStep: 0,
      hasSeenWelcome: true,
      steps: getOnboardingSteps(), // Refresh steps for current page
    }));
  };

  const nextStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.steps.length - 1),
    }));
  };

  const prevStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
  };

  const completeStep = (stepId: string) => {
    setState(prev => ({
      ...prev,
      steps: prev.steps.map(step => (step.id === stepId ? { ...step, completed: true } : step)),
    }));
  };

  const skipOnboarding = () => {
    setState(prev => ({
      ...prev,
      isActive: false,
      hasSeenWelcome: true,
    }));
  };

  const markActionCompleted = (action: string) => {
    setState(prev => ({
      ...prev,
      completedActions: new Set([...prev.completedActions, action]),
    }));
  };

  const shouldShowHelp = (target: string) => {
    return !state.hasSeenWelcome || state.isActive;
  };

  const resetOnboarding = () => {
    setState({
      isActive: false,
      currentStep: 0,
      steps: getOnboardingSteps(),
      hasSeenWelcome: false,
      completedActions: new Set<string>(),
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('onebalance-onboarding');
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        state,
        startOnboarding,
        nextStep,
        prevStep,
        completeStep,
        skipOnboarding,
        markActionCompleted,
        shouldShowHelp,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};
