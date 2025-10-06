import { MessageV0, VersionedTransaction, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import type { QuoteV3, SolanaOperation } from '@/lib/types/quote';

/**
 * Signs a Solana chain operation from OneBalance quote response
 * @param dataToSign - Base64 encoded data from quote response
 * @param wallet - Solana wallet instance (Privy embedded wallet)
 * @returns Base58 encoded signature
 */
export async function signSolanaOperation(dataToSign: string, wallet: any): Promise<string> {
  try {
    // 1. Convert base64 data to message buffer
    const msgBuffer = Buffer.from(dataToSign, 'base64');

    // 2. Deserialize into MessageV0
    const message = MessageV0.deserialize(msgBuffer);

    // 3. Create versioned transaction
    const transaction = new VersionedTransaction(message);

    // 4. Sign with wallet
    const signedTx = await wallet.signTransaction(transaction);

    // 5. Extract signature and encode as base58
    const signature = bs58.encode(Buffer.from(signedTx.signatures[signedTx.signatures.length - 1]));

    return signature;
  } catch (error) {
    console.error('Error signing Solana operation:', error);
    throw new Error(`Failed to sign Solana transaction: ${error}`);
  }
}

/**
 * Validates a Solana signature format
 * @param signature - Base58 encoded signature to validate
 * @returns boolean indicating if signature is valid format
 */
export function isValidSolanaSignature(signature: string): boolean {
  try {
    const decoded = bs58.decode(signature);
    return decoded.length === 64; // Solana signatures are 64 bytes
  } catch (error) {
    return false;
  }
}

/**
 * Helper function to check if wallet supports Solana signing
 * @param wallet - Wallet instance to check
 * @returns boolean indicating if wallet can sign Solana transactions
 */
export function canSignSolana(wallet: any): boolean {
  return wallet && typeof wallet.signTransaction === 'function';
}

/**
 * Validates a Solana address format
 * @param address - Address string to validate
 * @returns boolean indicating if address is valid
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sign a Solana quote using the provided wallet
 * @param quote - Quote response to sign
 * @param solanaWallet - Solana wallet for signing
 * @returns Signed quote ready for execution
 */
export async function signSolanaQuote(quote: QuoteV3, solanaWallet: any): Promise<QuoteV3> {
  try {
    const signedOperations = await Promise.all(
      quote.originChainsOperations.map(async operation => {
        if ('type' in operation && operation.type === 'solana') {
          const solanaOp = operation as SolanaOperation;

          // Skip if already signed (signature is not empty or "0x")
          if (solanaOp.signature && solanaOp.signature !== '0x' && solanaOp.signature !== '') {
            return solanaOp;
          }

          const signature = await signSolanaOperation(solanaOp.dataToSign, solanaWallet);

          // Create the signed operation, ensuring we replace the signature properly
          const signedOp = {
            ...solanaOp,
            signature: signature, // Replace the "0x" placeholder with actual signature
          };

          return signedOp;
        }
        return operation;
      })
    );

    const signedQuote = {
      ...quote,
      originChainsOperations: signedOperations,
    };

    return signedQuote;
  } catch (error) {
    console.error('Error signing Solana quote:', error);
    throw error;
  }
}

/**
 * Get readable transaction status from quote status
 * @param status - Raw status from API
 * @returns User-friendly status string
 */
export function getReadableStatus(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Transaction pending...';
    case 'IN_PROGRESS':
      return 'Processing transaction...';
    case 'COMPLETED':
      return 'Transaction completed successfully!';
    case 'FAILED':
      return 'Transaction failed';
    case 'REFUNDED':
      return 'Transaction refunded';
    default:
      return `Status: ${status}`;
  }
}
