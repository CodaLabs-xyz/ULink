import { http, cookieStorage, createConfig, createStorage } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';
import { createCDPEmbeddedWalletConnector } from '@coinbase/cdp-wagmi';

export interface WagmiConfigOptions {
  appName?: string;
  appDescription?: string;
  appUrl?: string;
  iconUrl?: string;
  chains?: readonly [any, ...any[]];
  enableCDP?: boolean;
  enableWalletConnect?: boolean;
}

export function createULinkWagmiConfig(options?: WagmiConfigOptions) {
  const {
    appName = 'ULink',
    appDescription = 'Your Links, Beautifully Organized',
    appUrl = process.env.NODE_ENV === 'production' ? 'https://ulink.dev' : 'http://localhost:3000',
    iconUrl = process.env.NODE_ENV === 'production' ? 'https://ulink.dev/icon.png' : 'http://localhost:3000/icon.png',
    chains = [baseSepolia, base], // Prioritize Base Sepolia testnet
    enableCDP = true,
    enableWalletConnect = true,
  } = options || {};

  const connectors = [];

  // Add CDP Embedded Wallet connector if enabled
  if (enableCDP && process.env.NEXT_PUBLIC_CDP_PROJECT_ID) {
    const cdpConnector = createCDPEmbeddedWalletConnector({
      cdpConfig: {
        projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID,
      },
      providerConfig: {
        chains,
        transports: chains.reduce((acc, chain) => {
          acc[chain.id] = http();
          return acc;
        }, {} as Record<number, ReturnType<typeof http>>),
      },
    });
    connectors.push(cdpConnector);
  }

  // Add standard wallet connectors
  connectors.push(injected());
  
  connectors.push(coinbaseWallet({
    appName,
    preference: 'smartWalletOnly',
  }));

  // Add WalletConnect if enabled and configured
  if (enableWalletConnect && process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
    connectors.push(walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
      metadata: {
        name: appName,
        description: appDescription,
        url: appUrl,
        icons: [iconUrl],
      },
    }));
  }

  return createConfig({
    chains,
    connectors,
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: chains.reduce((acc, chain) => {
      acc[chain.id] = http();
      return acc;
    }, {} as Record<number, ReturnType<typeof http>>),
  });
}

export function getConfig() {
  return createULinkWagmiConfig();
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}