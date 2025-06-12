<a href="https://onebalance-chain-abstracted-swap.vercel.app">
  <img alt="OneBalance Chain-Abstracted Swap" src="https://storage.googleapis.com/onebalance-public-assets/docs/guides/chain-abstracted-swap-with-privy/swap-hero.png">
  <h1 align="center">OneBalance Chain-Abstracted Swap</h1>
</a>

<p align="center">
  A modern chain-abstracted token swap and transfer app. Powered by <a href="https://www.onebalance.io">OneBalance</a>.
</p>

<p align="center">
  <a href="https://onebalance-chain-abstracted-swap.vercel.app"><strong>View Demo</strong></a> · 
  <a href="https://docs.onebalance.io/guides/chain-abstracted-swap-with-privy"><strong>Tech Guide</strong></a>
</p>

## Tech stack

- [OneBalance API](https://docs.onebalance.io/api-reference/introduction) for chain abstraction and token swapping
- [Privy](https://privy.io) for Web3 authentication and embedded wallets
- Next.js 15 with App Router and TypeScript
- Tailwind CSS with shadcn UI components
- Vercel for deployment

## How it works

1. User logs in with social accounts (no wallet required initially)
2. Privy creates an embedded wallet automatically for seamless onboarding
3. User selects tokens to swap or transfer across different blockchains
4. OneBalance finds the best rates and handles all chain abstraction
5. Transaction executes without users thinking about which chain they're on

## Cloning & running

1. Clone the repo: `git clone https://github.com/dzimiks/onebalance-chain-abstracted-swap`
2. Create a `.env` file and add your environment variables:
   - `NEXT_PUBLIC_API_URL=https://be.onebalance.io`
   - `NEXT_PUBLIC_API_KEY=your_onebalance_api_key`
   - `NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id`
3. Run `pnpm install` to install dependencies
4. Run `pnpm dev` to start the development server

## Features

- **Chain-abstracted swaps**: Trade tokens across blockchains without network switching
- **Cross-chain transfers**: Send tokens to any address on supported networks
- **Real-time quotes**: Live exchange rates with 30-second validity
- **Portfolio tracking**: View aggregated balances across all chains
- **Transaction history**: Track all swaps and transfers in one place
- **Interactive onboarding**: Guided tutorials for new users
- **Gasless transactions**: No need to worry about gas fees or holding native tokens

## Learn more

Read the complete [**technical implementation guide**](https://docs.onebalance.io/guides/chain-abstracted-swap-with-privy) to understand the architecture and build your own chain-abstracted application.

## Demo

https://github.com/user-attachments/assets/6b6a5087-9d18-4f92-90e1-094c4fb9917c
