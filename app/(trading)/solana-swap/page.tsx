import { SolanaSwapForm } from '@/components/SolanaSwapForm';
import { TabNavigation } from '@/components/TabNavigation';

export default function SolanaSwapPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Solana Swap Demo</h1>
          <p className="text-gray-600 mt-2">
            Test the OneBalance v3 API with SOL ↔ USDC swaps on Solana
          </p>
        </div>

        <TabNavigation />

        <SolanaSwapForm />
      </div>
    </div>
  );
}
