<img width="1200" alt="image" src="https://github.com/user-attachments/assets/e4408961-6fa5-41b2-b0c5-0f59cfbfb381" />

# OneBalance Chain-Abstracted Swap

A modern, user-friendly chain-abstracted token swap and transfer application built with the OneBalance Chain Abstraction Toolkit. Seamlessly swap and transfer tokens across multiple blockchains with a unified interface.

## Features

- **Chain-Abstracted Token Swapping**: Exchange tokens across different blockchains instantly
- **Token Transfers**: Send tokens to any address on supported networks
- **Real-time Quotes**: Get live exchange rates and transaction previews
- **Transaction History**: Track all your swaps and transfers in one place
- **Responsive Design**: Beautiful UI that works on desktop and mobile
- **Web2-style Authentication**: Login using social accounts (no wallet required initially)
- **Embedded Wallet**: Automatically generated wallet for seamless onboarding
- **Multi-chain Support**: Works across Ethereum, Arbitrum, Optimism, Base, Polygon, and more

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Privy** - Web3 authentication and embedded wallets
- **OneBalance API** - Chain abstraction and token swapping
- **Radix UI** - Accessible UI components

## Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- OneBalance API key
- Privy app credentials

### Installation

```bash
git clone https://github.com/dzimiks/onebalance-chain-abstracted-swap.git
cd onebalance-chain-abstracted-swap
pnpm install
```

### Environment Setup

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://be.onebalance.io
NEXT_PUBLIC_API_KEY=your_onebalance_api_key
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (trading)/         # Trading route group
│   │   ├── swap/          # Token swap page
│   │   ├── transfer/      # Token transfer page
│   │   └── history/       # Transaction history
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── onboarding/       # User onboarding flow
│   └── [feature]/        # Feature-specific components
├── lib/                  # Utilities and configurations
│   ├── api/             # API client functions
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Helper functions
└── styles/              # Global styles
```

## Key Features

### 🔄 Token Swapping

- Exchange tokens across multiple blockchains
- Real-time quotes with price impact
- Slippage protection
- Gas optimization

### 💸 Token Transfers

- Send tokens to any address
- Cross-network transfers
- Address validation
- Transfer history

### 📊 Portfolio Management

- View aggregated balances across chains
- Track asset values in USD
- Transaction history
- Real-time balance updates

### 🎯 User Experience

- Guided onboarding for new users
- Contextual help system
- Progressive disclosure
- Mobile-responsive design

## API Integration

The app integrates with the OneBalance API for:

- Asset management and pricing
- Quote generation and execution
- Transaction status monitoring
- Balance aggregation across chains

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:

- Open an issue on GitHub
- Check the OneBalance documentation
- Join our community Discord

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OneBalance](https://onebalance.io) for the chain abstraction toolkit
- [Privy](https://privy.io) for wallet authentication
- [Radix UI](https://radix-ui.com) for accessible components
- [Tailwind CSS](https://tailwindcss.com) for styling

## 📞 Support

If you have any questions or need help, please:

- Open an issue on GitHub
- Contact [@dzimiks](https://github.com/dzimiks)
- Visit our [documentation](https://docs.onebalance.io)

---

**Made with ❤️ by [@dzimiks](https://github.com/dzimiks)**

_Powered by OneBalance Chain Abstraction Toolkit_
