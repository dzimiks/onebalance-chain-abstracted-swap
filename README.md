<img width="1200" alt="image" src="https://github.com/user-attachments/assets/bcc50c09-733c-4a8e-a556-a024a983f780" />

# OneBalance Cross-Chain Swap Demo

A demonstration of cross-chain token swaps using the OneBalance Chain Abstraction Toolkit with Privy wallet integration.

Live demo: https://one-balance-cross-chain-swap.vercel.app.

## Features

- Connect with Privy wallet
- View aggregated balances across multiple chains
- Cross-chain token swaps between different networks
- Real-time swap quotes with price impact details
- Quote countdown with auto-refresh
- Transaction status tracking

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Privy for wallet connection
- Viem for transaction signing

## Setup

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
NEXT_PUBLIC_PRIVY_APP_ID=
```

4. Run the development server

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) to see the app

## How It Works

1. Connect your wallet using Privy
2. Select source and target chains/assets
3. Enter the amount to swap
4. Get a quote with price impact details
5. Execute the swap with signature via Privy
6. Monitor transaction status until completion

## OneBalance API Integration

This demo uses several OneBalance API endpoints:
- `/api/account/predict-address` - Get the smart account address
- `/api/quotes/swap-quote` - Get cross-chain swap quotes
- `/api/quotes/execute-quote` - Execute signed quotes
- `/api/status/get-execution-status` - Check transaction status
- `/api/balances/aggregated-balance` - Get balances across chains

## Development Notes

This project demonstrates:

- Cross-chain asset transfers
- EIP-712 signature handling
- Smart account abstraction
- Privy wallet integration
- Tailwind and shadcn/ui styling
