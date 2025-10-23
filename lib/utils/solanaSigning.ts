import bs58 from 'bs58';
import type { QuoteV3, SolanaOperation } from '@/lib/types/quote';
import type { ConnectedStandardSolanaWallet } from '@privy-io/react-auth/solana';

/**
 * Signs a Solana chain operation using Privy's useSignTransaction hook (v3 recommended approach)
 * @param dataToSign - Base64 encoded data from quote response
 * @param wallet - Solana wallet instance
 * @param signTransaction - Privy's signTransaction hook function
 * @returns Base58 encoded signature
 */
export async function signSolanaOperationWithHook(
  dataToSign: string,
  wallet: ConnectedStandardSolanaWallet,
  signTransaction: (params: {
    wallet: ConnectedStandardSolanaWallet;
    transaction: Uint8Array;
    chain: string;
  }) => Promise<{ signedTransaction: Uint8Array }>
): Promise<string> {
  try {
    // 1. Convert base64 data to Uint8Array (v3 requires buffer-based inputs)
    const msgBuffer = Buffer.from(dataToSign, 'base64');
    const transaction = new Uint8Array(msgBuffer);

    console.log('Signing Solana transaction with hook, size:', transaction.length);
    console.log('Transaction first 50 bytes:', Array.from(transaction.slice(0, 50)));
    console.log('Transaction header byte:', transaction[0]);

    // Check if this is a versioned transaction (starts with 128 = 0x80)
    const isVersioned = transaction[0] === 128;
    console.log('Is versioned transaction:', isVersioned);

    console.log('Wallet address:', wallet.address);

    // IMPORTANT: OneBalance sends a MESSAGE (not a full transaction)
    // A Solana versioned message starts with: [version][message_header][...]
    // We need to extract the num_required_signatures from the message header
    // and prepend the signature count + empty signature slots

    // For versioned messages: byte 0 = version, byte 1 = num_required_signatures (in header)
    // But this is the MESSAGE format, we need to convert to TRANSACTION format

    // Versioned Transaction format is:
    // [num_signatures (compact-u16)] [signature_1 (64)] [signature_2 (64)] ... [message (version byte onwards)]

    // The message starts with version (128), then the header which includes num_required_signatures
    // Extract num_required_signatures from the message header (byte 1 of the message)
    const numSignaturesRequired = transaction[1];
    console.log('Number of signatures required from message:', numSignaturesRequired);

    const signatureSlotSize = 64;
    const totalSignatureBytes = numSignaturesRequired * signatureSlotSize;

    console.log('Total signature bytes needed:', totalSignatureBytes);

    // Build proper transaction: [sig_count][signatures][message]
    // For compact-u16: values 0-127 are single byte
    const signatureCountByte = numSignaturesRequired; // Single byte since < 128

    const transactionWithSignatures = new Uint8Array(1 + totalSignatureBytes + transaction.length);

    let offset = 0;

    // 1. Write signature count (compact-u16)
    transactionWithSignatures[offset] = signatureCountByte;
    offset += 1;

    // 2. Write empty signature slots
    const signatureSlots = new Uint8Array(totalSignatureBytes).fill(0);
    transactionWithSignatures.set(signatureSlots, offset);
    offset += totalSignatureBytes;

    // 3. Write the entire original message (including version byte)
    transactionWithSignatures.set(transaction, offset);

    console.log('Transaction with signature slots, size:', transactionWithSignatures.length);
    console.log('First 150 bytes:', Array.from(transactionWithSignatures.slice(0, 150)));

    // 2. Sign transaction using Privy's hook (proper v3 approach)
    const { signedTransaction } = await signTransaction({
      wallet,
      transaction: transactionWithSignatures,
      chain: 'solana:mainnet',
    });

    console.log('Signed transaction received, size:', signedTransaction.length);
    console.log('Signed transaction first 200 bytes:', Array.from(signedTransaction.slice(0, 200)));
    console.log('Signed transaction last 100 bytes:', Array.from(signedTransaction.slice(-100)));

    // Check if signed transaction size changed
    console.log('Original transaction with slots size:', transactionWithSignatures.length);
    console.log('Signed transaction size:', signedTransaction.length);
    console.log('Size difference:', signedTransaction.length - transactionWithSignatures.length);

    // 3. Extract signature from signed transaction
    // Try to find where the signature might be
    // Check multiple possible locations

    // Option 1: Skip sig count byte, signature at bytes 1-65
    const sig1 = signedTransaction.slice(1, 65);
    const sig1NonZero = sig1.some(byte => byte !== 0);
    console.log('Signature at bytes 1-65, non-zero:', sig1NonZero);

    // Option 2: Signature at bytes 0-64
    const sig2 = signedTransaction.slice(0, 64);
    const sig2NonZero = sig2.some(byte => byte !== 0);
    console.log('Signature at bytes 0-64, non-zero:', sig2NonZero);

    // Option 3: Check if signature is at the end
    const sigEnd = signedTransaction.slice(-64);
    const sigEndNonZero = sigEnd.some(byte => byte !== 0);
    console.log('Signature at last 64 bytes, non-zero:', sigEndNonZero);

    // Option 4: Search for first non-zero 64-byte sequence
    let foundSignature = null;
    for (let i = 0; i <= signedTransaction.length - 64; i++) {
      const chunk = signedTransaction.slice(i, i + 64);
      const hasNonZero = chunk.some(byte => byte !== 0);
      if (hasNonZero) {
        foundSignature = { offset: i, bytes: chunk };
        console.log('Found first non-zero 64-byte chunk at offset:', i);
        console.log('First 20 bytes of chunk:', Array.from(chunk.slice(0, 20)));
        break;
      }
    }

    if (!foundSignature) {
      throw new Error(
        'No non-zero signature found in signed transaction - Privy may have returned unsigned transaction'
      );
    }

    const signatureBytes = foundSignature.bytes;

    // 4. Return as base58 encoded string (Solana standard)
    const base58Signature = bs58.encode(signatureBytes);
    console.log('Base58 signature length:', base58Signature.length, 'value:', base58Signature);

    return base58Signature;
  } catch (error) {
    console.error('Error signing Solana operation with hook - full error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new Error(`Failed to sign Solana transaction: ${error}`);
  }
}

/**
 * Signs a Solana chain operation from OneBalance quote response
 * DEPRECATED: Use signSolanaOperationWithHook instead for proper v3 support
 * @param dataToSign - Base64 encoded data from quote response
 * @param wallet - Solana wallet instance (Privy embedded wallet)
 * @returns Base58 encoded signature
 */
export async function signSolanaOperation(
  dataToSign: string,
  wallet: ConnectedStandardSolanaWallet
): Promise<string> {
  try {
    // 1. Convert base64 data to Uint8Array (v3 requires buffer-based inputs)
    const msgBuffer = Buffer.from(dataToSign, 'base64');
    const transaction = new Uint8Array(msgBuffer);

    console.log('Signing Solana transaction, size:', transaction.length);
    console.log('Transaction first 20 bytes:', Array.from(transaction.slice(0, 20)));

    // 2. Sign transaction with wallet (v3 API requires transaction and chain parameters)
    console.log('Calling wallet.signTransaction...');
    console.log('Wallet details:', {
      address: wallet.address,
      hasSignTransaction: typeof wallet.signTransaction === 'function',
    });

    // Try signing with timeout to catch hanging promises
    // Note: Privy v3 may try to simulate the transaction before signing
    // If simulation fails, it shows a warning but still allows signing
    const signPromise = wallet.signTransaction({
      transaction,
      chain: 'solana:mainnet',
      // Optional: Add UI options if needed to control Privy modal behavior
      // options: { uiOptions: { showWalletUIs: true } }
    });

    const timeoutPromise = new Promise<{ signedTransaction: Uint8Array }>((_, reject) =>
      setTimeout(() => reject(new Error('Signing timeout after 30 seconds')), 30000)
    );

    console.log('Waiting for signature or timeout...');
    const result = await Promise.race([signPromise, timeoutPromise]);

    console.log('Signed transaction result:', result);
    const { signedTransaction } = result;
    console.log('Signed transaction received, size:', signedTransaction.length);

    // 3. Extract signature from signed transaction
    // In Solana transactions, the first 64 bytes are the signature
    const signatureBytes = signedTransaction.slice(0, 64);
    console.log('Signature bytes extracted:', signatureBytes.length);

    // 4. Return as base58 encoded string (Solana standard)
    const base58Signature = bs58.encode(signatureBytes);
    console.log('Base58 signature length:', base58Signature.length, 'value:', base58Signature);

    return base58Signature;
  } catch (error) {
    console.error('Error signing Solana operation - full error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
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
export function canSignSolana(wallet: ConnectedStandardSolanaWallet | null): boolean {
  return wallet !== null && typeof wallet.signTransaction === 'function';
}

/**
 * Validates a Solana address format (without @solana/web3.js dependency)
 * @param address - Address string to validate
 * @returns boolean indicating if address is valid
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    // Basic validation: Solana addresses are 32-44 characters base58
    if (address.length < 32 || address.length > 44) return false;
    // Base58 character set validation
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  } catch {
    return false;
  }
}

/**
 * Sign a Solana quote using the provided wallet
 * Updated for Privy React SDK v3
 * @param quote - Quote response to sign
 * @param solanaWallet - Solana wallet for signing
 * @returns Signed quote ready for execution
 */
export async function signSolanaQuote(
  quote: QuoteV3,
  solanaWallet: ConnectedStandardSolanaWallet
): Promise<QuoteV3> {
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
