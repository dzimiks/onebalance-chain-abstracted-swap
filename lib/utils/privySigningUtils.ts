import { Address, createWalletClient, custom, Hash } from 'viem';
import { ConnectedWallet } from '@privy-io/react-auth';
import { ChainOperation, Quote } from '@/lib/types/quote';

export const signTypedDataWithPrivy =
  (embeddedWallet: ConnectedWallet) =>
  async (typedData: any): Promise<Hash> => {
    const provider = await embeddedWallet.getEthereumProvider();
    const walletClient = createWalletClient({
      transport: custom(provider),
      account: embeddedWallet.address as Address,
    });

    return walletClient.signTypedData(typedData);
  };

export const signOperation =
  (embeddedWallet: ConnectedWallet) =>
  (operation: ChainOperation): (() => Promise<ChainOperation>) =>
  async () => {
    const signature = await signTypedDataWithPrivy(embeddedWallet)(operation.typedDataToSign);

    return {
      ...operation,
      userOp: { ...operation.userOp, signature },
    };
  };

export const signQuote = async (quote: Quote, embeddedWallet: ConnectedWallet) => {
  const signWithEmbeddedWallet = signOperation(embeddedWallet);

  const signedQuote = {
    ...quote,
  };

  signedQuote.originChainsOperations = await sequentialPromises(
    quote.originChainsOperations.map(signWithEmbeddedWallet)
  );

  if (quote.destinationChainOperation) {
    signedQuote.destinationChainOperation = await signWithEmbeddedWallet(
      quote.destinationChainOperation
    )();
  }

  return signedQuote;
};

// Helper to run an array of lazy promises in sequence
export const sequentialPromises = (promises: (() => Promise<any>)[]): Promise<any[]> => {
  return promises.reduce<Promise<any[]>>(
    (acc, curr) => acc.then(results => curr().then(result => [...results, result])),
    Promise.resolve([])
  );
};
