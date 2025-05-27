<img width="1200" alt="image" src="https://github.com/user-attachments/assets/bcc50c09-733c-4a8e-a556-a024a983f780" />

# OneBalance Cross-Chain Swap Demo

A modern cross-chain token swap and transfer application built with the OneBalance Chain Abstraction Toolkit. Features a Uniswap-inspired interface with guided onboarding, transaction history, and Privy wallet integration.

Live demo: https://one-balance-cross-chain-swap.vercel.app.

## ✨ Features

- **Cross-Chain Swaps & Transfers**: Execute token operations across multiple blockchain networks
- **Transaction History**: View and track all your transactions with detailed information
- **Guided Onboarding**: Interactive tutorial for new users
- **Real-Time Quotes**: Live exchange rates with countdown timers
- **Wallet Integration**: Privy wallet with embedded wallet support
- **Portfolio View**: Unified balance display across all chains
- **Dark Mode**: Theme toggle with system preference detection
- **Responsive Design**: Works on desktop and mobile devices

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Wallet**: Privy
- **Blockchain**: Viem
- **Code Quality**: ESLint, Prettier, Husky

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

1. **Connect Wallet** - Authenticate with Privy
2. **Choose Mode** - Navigate between Swap, Transfer, and History tabs
3. **Select Tokens** - Pick source and target assets
4. **Enter Amount** - Type amount or use percentage buttons
5. **Review Quote** - Check exchange rate and fees
6. **Execute** - Sign and submit the transaction
7. **Track Progress** - Monitor status in real-time

## 🔧 Architecture

### Key Components

- **`SwapForm`** - Token swap interface
- **`TransferForm`** - Cross-chain transfer interface
- **`TransactionHistory`** - Transaction tracking with expandable details
- **`ConnectButton`** - Wallet connection and portfolio view
- **`WelcomeModal`** - Onboarding tutorial system

### Routes

- `/swap` - Token swapping interface
- `/transfer` - Cross-chain transfers
- `/history` - Transaction history

## 🌐 OneBalance API

Key endpoints used:

- `/api/account/predict-address` - Generate smart account addresses
- `/api/v1/quote` - Get swap/transfer quotes
- `/api/quotes/execute-quote` - Execute transactions
- `/api/status/get-execution-status` - Monitor progress
- `/api/status/get-tx-history` - Transaction history
- `/api/v2/balances/aggregated-balance` - Balance data
- `/api/assets/list` - Supported assets
- `/api/chains/supported-list` - Supported chains

## 🔍 Development

### Performance

- Debounced API calls
- Memoized callbacks
- Efficient polling cleanup
- Optimized re-renders

### Code Quality

- Full TypeScript
- ESLint + Prettier
- Pre-commit hooks
- Modular components

## 🛠 Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier
```

## 📄 License

This project is open source and available under the MIT License.
