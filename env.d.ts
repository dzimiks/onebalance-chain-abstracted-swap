declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL?: string;
    NEXT_PUBLIC_API_KEY: string;
    NEXT_PUBLIC_SOLANA_RPC_URL: string;
    NEXT_PUBLIC_SOLANA_WS_URL: string;
  }
}
