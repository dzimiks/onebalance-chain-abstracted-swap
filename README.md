<img width="1200" alt="image" src="https://github.com/user-attachments/assets/bcc50c09-733c-4a8e-a556-a024a983f780" />

# OneBalance Cross-Chain Swap

A modern, user-friendly cross-chain token swap and transfer application built with the OneBalance Chain Abstraction Toolkit. Seamlessly swap and transfer tokens across multiple blockchains with a unified interface.

## 🚀 Features

- **Cross-Chain Token Swapping**: Exchange tokens across different blockchains instantly
- **Multi-Chain Transfers**: Send tokens to any address on supported networks
- **Transaction History**: Track all your swaps and transfers in one place
- **Real-Time Quotes**: Get the best rates with live price updates
- **Secure Wallet Integration**: Connect with popular wallets securely
- **Dark/Light Mode**: Beautiful UI that adapts to your preference
- **Mobile Responsive**: Works perfectly on all devices

## 🛠 Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Blockchain Integration**: OneBalance API, Privy Auth
- **State Management**: TanStack Query
- **Development**: ESLint, Prettier, Husky

## 🌐 Supported Networks

The application supports multiple blockchain networks through OneBalance's chain abstraction technology:

- Ethereum Mainnet
- Polygon
- Arbitrum
- Optimism
- Base
- And more...

## 🔧 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/dzimiks/one-balance-cross-chain-swap.git
cd one-balance-cross-chain-swap
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:

```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
ONEBALANCE_API_KEY=your_onebalance_api_key
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage

### Token Swapping

1. Connect your wallet
2. Select the token you want to swap from
3. Choose the destination token
4. Enter the amount
5. Review the quote and execute the swap

### Token Transfers

1. Navigate to the Transfer tab
2. Select the token to send
3. Enter the recipient address
4. Choose the destination network
5. Confirm and send

### Transaction History

View all your past transactions in the History tab, including:

- Swap details and rates
- Transfer confirmations
- Transaction status
- Blockchain explorer links

## 🔒 Security

- All transactions are secured by blockchain technology
- Private keys never leave your device
- Smart contract interactions are audited
- No personal data is stored on our servers

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
