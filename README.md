<img width="1200" alt="image" src="https://github.com/user-attachments/assets/bcc50c09-733c-4a8e-a556-a024a983f780" />

# OneBalance Cross-Chain Swap Demo

A modern, user-friendly demonstration of cross-chain token swaps using the OneBalance Chain Abstraction Toolkit with Privy wallet integration. Features a clean, Uniswap-inspired interface with real-time quotes and seamless user experience.

Live demo: https://one-balance-cross-chain-swap.vercel.app.

## ✨ Features

### Core Functionality
- **Privy Wallet Integration**: Seamless wallet connection with embedded wallet support
- **Cross-Chain Swaps**: Execute token swaps across multiple blockchain networks
- **Aggregated Balances**: View unified balances across all supported chains
- **Real-Time Quotes**: Automatic quote fetching with live exchange rates
- **Transaction Monitoring**: Real-time status tracking with visual progress indicators

### User Experience
- **Modern UI**: Clean, Uniswap-inspired interface with intuitive design
- **Smart Token Input**: Large amount displays with USD value calculations
- **Percentage Buttons**: Quick selection (25%, 50%, 75%, MAX) for easy amount entry
- **Visual Quote Countdown**: Progress bar with color-coded urgency indicators
- **Exchange Rate Display**: Clear rate information for informed trading decisions
- **Persistent Transaction Status**: Status remains visible until manually dismissed

### Technical Features
- **Automatic Quote Refresh**: Quotes update automatically when amounts or assets change
- **Memory Leak Prevention**: Optimized polling and state management
- **Error Handling**: Comprehensive error states with user-friendly messages
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with modern color palette
- **UI Components**: shadcn/ui with custom enhancements
- **Wallet**: Privy for authentication and transaction signing
- **Blockchain**: Viem for Ethereum interactions
- **State Management**: React hooks with optimized re-rendering

## 🚀 Setup

1. Clone the repository

```bash
git clone https://github.com/dzimiks/one-balance-cross-chain-swap.git
cd one-balance-cross-chain-swap
```

2. Install dependencies

```bash
pnpm install
```

3. Create a `.env` file with the following variables:

```
NEXT_PUBLIC_API_URL=https://be.onebalance.io
NEXT_PUBLIC_API_KEY=42bb629272001ee1163ca0dbbbc07bcbb0ef57a57baf16c4b1d4672db4562c11
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
```

4. Run the development server

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) to see the app

## 📱 How It Works

1. **Connect Wallet**: Click "Connect Wallet" to authenticate with Privy
2. **Select Assets**: Choose source and target tokens from the dropdown menus
3. **Enter Amount**: Type amount or use percentage buttons (25%, 50%, 75%, MAX)
4. **Review Quote**: View exchange rate and quote details with countdown timer
5. **Execute Swap**: Click "Swap" to sign and execute the transaction
6. **Monitor Progress**: Track transaction status with real-time updates

## 🔧 Component Architecture

### Core Components
- **`TokenInput`**: Modern token input with amount, asset selector, and percentage buttons
- **`AssetSelect`**: Enhanced asset selector with token icons and balance display
- **`QuoteCountdown`**: Visual countdown with progress bar and color-coded urgency
- **`QuoteDetails`**: Clean display of exchange rates and quote information
- **`TransactionStatus`**: Persistent status tracking with dismiss functionality

### Key Features
- **Automatic Quote Fetching**: Debounced API calls for optimal performance
- **Smart Button States**: Context-aware button text and disabled states
- **Memory Leak Prevention**: Proper cleanup of intervals and event listeners
- **Responsive Design**: Mobile-first approach with desktop enhancements

## 🌐 OneBalance API Integration

This demo integrates with several OneBalance API endpoints:

- **`/api/account/predict-address`** - Generate smart account addresses
- **`/api/v1/quote`** - Get cross-chain swap quotes with pricing
- **`/api/quotes/execute-quote`** - Execute signed swap transactions
- **`/api/status/get-execution-status`** - Monitor transaction progress
- **`/api/v2/balances/aggregated-balance`** - Fetch unified balance data
- **`/api/assets/list`** - Get supported assets and their metadata
- **`/api/chains/supported-list`** - Retrieve supported blockchain networks

## 🔍 Development Highlights

### Performance Optimizations
- **Debounced API calls**: Reduces unnecessary quote requests
- **Memoized callbacks**: Prevents unnecessary re-renders
- **Efficient polling**: Smart cleanup of background processes

### User Experience Enhancements
- **Visual feedback**: Progress bars, loading states, and status indicators
- **Error prevention**: Input validation and clear error messages
- **Accessibility**: Proper ARIA labels and keyboard navigation

### Code Quality
- **TypeScript**: Full type safety throughout the application
- **Component modularity**: Reusable, well-structured components
- **Clean architecture**: Separation of concerns and maintainable code

## 📄 License

This project is open source and available under the MIT License.
