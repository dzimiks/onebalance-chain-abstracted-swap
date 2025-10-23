import { useWallets, type ConnectedStandardSolanaWallet } from '@privy-io/react-auth/solana';

/**
 * Hook to manage Solana wallet operations
 * Updated for Privy React SDK v3
 */
export const useSolanaWallet = () => {
  const { ready, wallets } = useWallets();

  // Get the first Solana wallet (embedded or connected)
  // In v3, useWallets() from solana entrypoint returns only Solana wallets
  const embeddedWallet: ConnectedStandardSolanaWallet | null = wallets?.[0] || null;

  // Validate Solana address (basic validation without @solana/web3.js)
  const isValidSolanaAddress = (address: string): boolean => {
    try {
      // Basic validation: Solana addresses are 32-44 characters base58
      if (address.length < 32 || address.length > 44) return false;
      // Base58 character set validation
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
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
