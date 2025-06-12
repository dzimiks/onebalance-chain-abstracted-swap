import { useWallets } from '@privy-io/react-auth';
import { ConnectedWallet } from '@privy-io/react-auth';

/**
 * Hook to get the embedded wallet from Privy
 * @returns The embedded wallet or null if not found
 */
export const useEmbeddedWallet = (): ConnectedWallet | null => {
  const { wallets } = useWallets();
  return wallets.find(wallet => wallet.walletClientType === 'privy') || wallets[0] || null;
};
