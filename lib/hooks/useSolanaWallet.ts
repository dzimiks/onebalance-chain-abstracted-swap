import { useSolanaWallets } from '@privy-io/react-auth';
import { PublicKey } from '@solana/web3.js';

/**
 * Hook to manage Solana wallet operations
 */
export const useSolanaWallet = () => {
  const { wallets, ready } = useSolanaWallets();

  // Get the embedded Solana wallet
  const embeddedWallet = wallets?.find(wallet => wallet.walletClientType === 'privy') || null;

  // Validate Solana address
  const isValidSolanaAddress = (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  // Check if wallet can sign transactions
  const canSign = embeddedWallet?.signTransaction !== undefined;

  return {
    embeddedWallet,
    allWallets: wallets,
    isReady: ready,
    canSign,
    isValidSolanaAddress,
    address: embeddedWallet?.address || null,
    connected: !!embeddedWallet?.address,
  };
};
