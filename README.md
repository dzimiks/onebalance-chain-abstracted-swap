<img width="1200" alt="image" src="https://github.com/user-attachments/assets/bcc50c09-733c-4a8e-a556-a024a983f780" />

# OneBalance Cross-Chain Swap Demo

A modern, user-friendly demonstration of cross-chain token swaps and transfers using the OneBalance Chain Abstraction Toolkit with Privy wallet integration. Features a clean, Uniswap-inspired interface with real-time quotes and seamless user experience.

Live demo: https://one-balance-cross-chain-swap.vercel.app.

## ✨ Features

### Core Functionality

- **Privy Wallet Integration**: Seamless wallet connection with embedded wallet support
- **Cross-Chain Swaps**: Execute token swaps across multiple blockchain networks
- **Cross-Chain Transfers**: Send tokens to any address across supported chains
- **Aggregated Balances**: View unified balances across all supported chains
- **Real-Time Quotes**: Automatic quote fetching with live exchange rates
- **Transaction Monitoring**: Real-time status tracking with visual progress indicators

### User Interface

- **Tabbed Navigation**: Uniswap-inspired tab system for Swap and Transfer modes
- **Modern UI**: Clean, responsive interface with intuitive design
- **Smart Token Input**: Large amount displays with USD value calculations
- **Percentage Buttons**: Quick selection (25%, 50%, 75%, MAX) for easy amount entry
- **Visual Quote Countdown**: Progress bar with color-coded urgency indicators
- **Exchange Rate Display**: Clear rate information for informed trading decisions
- **Persistent Transaction Status**: Status remains visible until manually dismissed
- **Dark Mode Support**: Complete dark/light theme toggle with system preference detection

### Technical Features

- **Automatic Quote Refresh**: Quotes update automatically when amounts or assets change
- **Memory Leak Prevention**: Optimized polling and state management
- **Error Handling**: Comprehensive error states with user-friendly messages
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Code Quality**: ESLint, Prettier, Husky, and lint-staged for consistent code formatting
- **Type Safety**: Full TypeScript implementation with proper type definitions

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with modern color palette
- **UI Components**: shadcn/ui with custom enhancements
- **Wallet**: Privy for authentication and transaction signing
- **Blockchain**: Viem for Ethereum interactions
- **State Management**: React hooks with optimized re-rendering
- **Code Quality**: ESLint, Prettier, Husky, lint-staged
- **Theme**: next-themes for dark/light mode support

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

### Swap Mode

1. **Connect Wallet**: Click "Connect Wallet" to authenticate with Privy
2. **Select Assets**: Choose source and target tokens from the dropdown menus
3. **Enter Amount**: Type amount or use percentage buttons (25%, 50%, 75%, MAX)
4. **Review Quote**: View exchange rate and quote details with countdown timer
5. **Execute Swap**: Click "Swap" to sign and execute the transaction
6. **Monitor Progress**: Track transaction status with real-time updates

### Transfer Mode

1. **Connect Wallet**: Authenticate with your Privy wallet
2. **Select Asset**: Choose the token you want to transfer
3. **Enter Amount**: Specify the amount using input or percentage buttons
4. **Enter Recipient**: Provide the recipient's wallet address or ENS name
5. **Review Quote**: Check transfer costs and details
6. **Execute Transfer**: Click "Transfer" to send tokens to the recipient
7. **Track Status**: Monitor the transfer progress in real-time

## 🔧 Component Architecture

### Core Components

- **`TabNavigation`**: Uniswap-inspired tab system for switching between Swap and Transfer modes
- **`SwapForm`**: Complete swap interface with token selection, amount input, and quote management
- **`TransferForm`**: Transfer interface with recipient address input and validation
- **`TokenInput`**: Modern token input with amount, asset selector, and percentage buttons
- **`AssetSelect`**: Enhanced asset selector with token icons, search, and balance display
- **`QuoteCountdown`**: Visual countdown with progress bar and color-coded urgency
- **`QuoteDetails`**: Clean display of exchange rates and quote information
- **`TransactionStatus`**: Persistent status tracking with dismiss functionality
- **`ConnectButton`**: Wallet connection with expandable asset portfolio view
- **`ModeToggle`**: Simple dark/light theme toggle

### Layout Structure

- **Route Groups**: `(trading)` layout for shared header/footer
- **Dynamic Routing**: `/swap` and `/transfer` routes with proper navigation
- **Shared Components**: Consistent header, footer, and navigation across pages

### Key Features

- **Automatic Quote Fetching**: Debounced API calls for optimal performance
- **Smart Button States**: Context-aware button text and disabled states
- **Memory Leak Prevention**: Proper cleanup of intervals and event listeners
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Address Validation**: Real-time validation for recipient addresses and ENS names

## 🌐 OneBalance API Integration

This demo integrates with several OneBalance API endpoints:

- **`/api/account/predict-address`** - Generate smart account addresses
- **`/api/v1/quote`** - Get cross-chain swap and transfer quotes with pricing
- **`/api/quotes/execute-quote`** - Execute signed swap and transfer transactions
- **`/api/status/get-execution-status`** - Monitor transaction progress
- **`/api/v2/balances/aggregated-balance`** - Fetch unified balance data
- **`/api/assets/list`** - Get supported assets and their metadata
- **`/api/chains/supported-list`** - Retrieve supported blockchain networks

### Transfer Implementation

Transfers use the same `/v1/quote` endpoint as swaps but include a recipient address:

```typescript
const quoteRequest = {
  from: {
    account: { sessionAddress, adminAddress, accountAddress },
    asset: { assetId: 'ds:usdc' },
    amount: '1000000', // 1 USDC
  },
  to: {
    asset: { assetId: 'ds:usdc' }, // Same asset for transfers
    account: 'eip155:1:0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Recipient
  },
};
```

## 🔍 Development Highlights

### Performance Optimizations

- **Debounced API calls**: Reduces unnecessary quote requests
- **Memoized callbacks**: Prevents unnecessary re-renders
- **Efficient polling**: Smart cleanup of background processes

### User Experience Enhancements

- **Visual feedback**: Progress bars, loading states, and status indicators
- **Error prevention**: Input validation and clear error messages
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Address validation**: Real-time validation for Ethereum addresses and ENS names

### Code Quality

- **TypeScript**: Full type safety throughout the application
- **Component modularity**: Reusable, well-structured components
- **Clean architecture**: Separation of concerns and maintainable code
- **Pre-commit hooks**: Automated linting and formatting with Husky and lint-staged
- **Consistent formatting**: Prettier configuration for code consistency

## 🛠 Development Tools

### Code Quality Setup

- **ESLint**: Configured with Next.js and TypeScript rules
- **Prettier**: Automated code formatting with consistent style
- **Husky**: Git hooks for pre-commit quality checks
- **lint-staged**: Run linters only on staged files for faster commits

### Available Scripts

```bash
# Development
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues automatically
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting
```

### Pre-commit Hooks

The project automatically runs linting and formatting on staged files before each commit:

- ESLint fixes JavaScript/TypeScript issues
- Prettier formats code consistently
- Only staged files are processed for faster commits

## 🎨 Design System

### Color Palette

- **Emerald**: Positive states, good time remaining, exchange rates
- **Amber**: Warning states, moderate urgency
- **Red**: Critical states, urgent actions
- **Slate**: Neutral content, professional appearance

### Theme Support

- **Light Mode**: Clean, modern interface with subtle shadows
- **Dark Mode**: Elegant dark theme with proper contrast ratios
- **System Preference**: Automatically detects and follows system theme
- **Manual Toggle**: Easy switching between themes with persistent preference

### Component Design

- **Modern Cards**: Rounded corners with subtle shadows and borders
- **Interactive Elements**: Smooth hover transitions and focus states
- **Visual Hierarchy**: Clear typography and spacing for optimal readability
- **Responsive Layout**: Mobile-first design that scales beautifully

## 📄 License

This project is open source and available under the MIT License.
