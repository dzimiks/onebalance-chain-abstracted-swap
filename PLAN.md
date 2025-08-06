# Solana Support Integration Plan

## 🎯 Objective

Integrate Solana network support into the existing OneBalance codebase and showcase the comprehensive examples from the OneBalance Solana documentation, including both same-chain and cross-chain operations.

## 📋 Current State Analysis

- ✅ **Dependencies**: All required Solana packages already installed (`@solana/web3.js`, `@solana/spl-token`, `bs58`)
- ✅ **Basic Signing**: Core `signSolanaOperation` utility exists in `lib/utils/solanaSigning.ts`
- ✅ **Privy Integration**: Already configured for wallet management
- ⚠️ **API Version**: Currently using v1 API, need to upgrade to v3 for Solana support
- ❌ **Solana Assets**: No Solana tokens in constants/asset lists
- ❌ **Solana Wallet Support**: Missing Solana wallet detection and management
- ❌ **UI Components**: No Solana-specific UI components or chain selection

## 🚀 Phase 1: Foundation & API Upgrade (Priority: HIGH)

### 1.1 Upgrade to OneBalance API v3

- [x] Update `lib/api.ts` to use v3 endpoints (`https://be.onebalance.io/api/v3/`)
- [x] Update `lib/api/quotes.ts` to use new v3 quote endpoints
- [x] Update `lib/types/quote.ts` to support new v3 response structure including Solana operations
- [x] Add support for multi-account requests (EVM + Solana)

### 1.2 Solana Asset Integration

- [x] Add Solana assets to `lib/constants.ts`:
  - SOL: `"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501"`
  - USDC (Solana): `"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"`
- [x] Update asset loading logic in `lib/hooks/useAssets.ts`
- [x] Add Solana chain definitions

### 1.3 Enhanced Solana Wallet Support

- [x] Update `app/providers.tsx` to include Solana wallet support in Privy config
- [x] Create `lib/hooks/useSolanaWallet.ts` for Solana-specific wallet operations
- [x] Extend `lib/hooks/useEmbeddedWallet.ts` to detect both EVM and Solana wallets
- [x] Add Solana wallet connection status to UI

## 🔧 Phase 2: Core Solana Functionality (Priority: HIGH)

### 2.1 Enhanced Quote System

- [x] Update `lib/types/quote.ts` to include Solana operation types:
  ```typescript
  interface SolanaOperation {
    type: 'solana';
    instructions: any[];
    recentBlockHash: string;
    feePayer: string;
    signature?: string;
    dataToSign: string;
    assetType: string;
    amount: string;
  }
  ```
- [x] Extend `QuoteRequest` type to support multiple account types
- [x] Add cross-chain operation support

### 2.2 Solana Transaction Execution

- [x] Enhance `lib/utils/solanaSigning.ts` with additional utilities:
  - Address validation
  - Transaction status checking
  - Error handling improvements
- [x] Create `lib/hooks/useQuotesV3.ts` for v3 API operations
- [x] Add cross-chain signing coordinator for mixed EVM/Solana operations

### 2.3 Balance & Chain Management

- [x] Create `lib/hooks/useBalancesV3.ts` for v3 aggregated balance support
- [x] Add aggregated balance support across EVM + Solana
- [ ] Create `lib/hooks/useChains.ts` extension for Solana chain info

## 🎨 Phase 3: UI Components & User Experience (Priority: MEDIUM)

### 3.1 Core UI Updates ✅ COMPLETED

- [x] Updated `SolanaSwapForm.tsx` to use TokenInput with asset dropdowns
- [x] Added Solana assets with proper icons and UI support
- [x] Integrated v3 aggregated balance display
- [x] Added TabNavigation support for /solana-swap route

### 3.2 Enhanced Swap Experience ✅ COMPLETED

- [x] Default amount changed to 0.001 SOL
- [x] Real-time quote fetching with debouncing
- [x] Percentage buttons for balance utilization
- [x] Asset swapping (SOL ↔ USDC)
- [x] Transaction status monitoring with explorer links

### 3.3 Future Enhancements

- [ ] Create `components/SolanaWalletInfo.tsx` for enhanced Solana account details
- [ ] Create `components/CrossChainIndicator.tsx` for multi-chain operations
- [ ] Update `components/TransferForm.tsx` for cross-chain transfers
- [ ] Add validation for Solana addresses and amounts

## 📚 Phase 4: Documentation Examples Integration (Priority: MEDIUM)

### 4.1 Example Components

Based on the OneBalance docs, create showcase components:

- [x] **Example 1**: `components/SolanaSwapForm.tsx` ✅ **COMPLETED & ENHANCED**
  - SOL ↔ ANY TOKEN cross-chain swaps with comprehensive asset selection
  - Real-time quote display with auto-refresh
  - v3 aggregated balance integration
  - Percentage buttons for balance utilization
  - Enhanced UI matching SwapForm.tsx design
  - Transaction monitoring with status updates
  - Cross-chain indicator for multi-blockchain swaps
  - Support for all aggregated assets (USDT, WETH, ETH, DAI, etc.)

- [ ] **Example 2**: `components/examples/SolToUsdcCrossChain.tsx`
  - SOL (Solana) → USDC (Arbitrum)
  - Cross-chain fee display
  - Multi-step execution tracking

- [ ] **Example 3**: `components/examples/UsdcSolanaToArbitrum.tsx`
  - USDC (Solana) → USDC (Arbitrum)
  - Transfer-focused UI
  - Recipient address input

- [ ] **Example 4**: `components/examples/AggregatedUsdcToSol.tsx`
  - Aggregated USDC (EVM + Solana) → SOL
  - Multi-account balance display
  - Complex signing flow demo

### 4.2 Demo Pages

- [ ] Create `/app/(trading)/examples/` route
- [ ] Add example navigation in `components/TabNavigation.tsx`
- [ ] Create individual pages for each example
- [ ] Add code snippets and explanations

## 🧪 Phase 5: Testing & Validation (Priority: HIGH)

### 5.1 Functional Testing

- [ ] Test all 4 documented examples with real transactions
- [ ] Validate signature generation and transaction execution
- [ ] Test error scenarios and edge cases
- [ ] Cross-browser compatibility testing

### 5.2 Integration Testing

- [ ] Test mixed EVM + Solana operations
- [ ] Validate balance aggregation accuracy
- [ ] Test wallet switching between networks
- [ ] Performance testing for quote generation

## 🔍 Phase 6: Advanced Features (Priority: LOW)

### 6.1 Enhanced UX

- [ ] Add transaction history for Solana operations
- [ ] Implement retry mechanisms for failed transactions
- [ ] Add estimated completion times
- [ ] Solana network congestion indicators

### 6.2 Developer Experience

- [ ] Add comprehensive TypeScript types
- [ ] Create hook utilities for common Solana operations
- [ ] Add debugging tools and transaction inspection
- [ ] Create reusable Solana components library

## 📋 Implementation Checklist

### Quick Wins (Week 1)

- [ ] API v3 upgrade
- [ ] Basic Solana asset integration
- [ ] Enhanced wallet support
- [ ] SOL → USDC same-chain example

### Core Features (Week 2)

- [ ] Cross-chain quote system
- [ ] Enhanced UI components
- [ ] All 4 documentation examples
- [ ] Transaction execution flow

### Polish & Testing (Week 3)

- [ ] Comprehensive testing
- [ ] Error handling improvements
- [ ] Documentation and examples
- [ ] Performance optimization

## 🎯 Success Metrics

- [ ] All 4 OneBalance Solana examples working end-to-end
- [ ] Seamless wallet experience across EVM and Solana
- [ ] Sub-5-second quote generation for cross-chain operations
- [ ] 100% transaction success rate in prod environment
- [ ] Clean, reusable component architecture

## 📖 References

- [OneBalance Solana Examples](https://docs.onebalance.io/guides/solana/examples)
- [Crossmint Solana+Privy Example](https://github.com/Crossmint/solana-wallets-privy-quickstart)
- [OneBalance API v3 Documentation](https://docs.onebalance.io/api-reference)

---

_Last Updated: $(date)_
