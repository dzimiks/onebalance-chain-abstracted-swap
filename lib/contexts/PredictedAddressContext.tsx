'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useEmbeddedWallet } from '@/lib/hooks/useEmbeddedWallet';
import { accountApi } from '@/lib/api/account';

interface PredictedAddressContextType {
  predictedAddress: string | null;
  getPredictedAddress: () => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

const PredictedAddressContext = createContext<PredictedAddressContextType | undefined>(undefined);

export const PredictedAddressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [predictedAddress, setPredictedAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const embeddedWallet = useEmbeddedWallet();

  // Get the predicted address for the account
  const getPredictedAddress = useCallback(async () => {
    if (!embeddedWallet || !embeddedWallet.address) {
      return null;
    }

    // Return cached address if available
    if (predictedAddress) {
      return predictedAddress;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use the same wallet address for both session and admin
      const address = embeddedWallet.address;
      const predicted = await accountApi.predictAddress(address, address);
      setPredictedAddress(predicted);
      return predicted;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to predict address';
      setError(errorMessage);
      console.error('Failed to predict address:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [embeddedWallet, predictedAddress]);

  // Clear when wallet disconnects or changes
  useEffect(() => {
    if (!embeddedWallet) {
      setPredictedAddress(null);
      setError(null);
    }
  }, [embeddedWallet]);

  const value = {
    predictedAddress,
    getPredictedAddress,
    isLoading,
    error,
  };

  return (
    <PredictedAddressContext.Provider value={value}>{children}</PredictedAddressContext.Provider>
  );
};

export const usePredictedAddress = () => {
  const context = useContext(PredictedAddressContext);
  if (context === undefined) {
    throw new Error('usePredictedAddress must be used within a PredictedAddressProvider');
  }
  return context;
};
