import { http, cookieStorage, createConfig, createStorage } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';
import { createCDPEmbeddedWalletConnector } from '@coinbase/cdp-wagmi';

export function getConfig() {
  // Create CDP Embedded Wallet connector for social login
  const cdpConnector = createCDPEmbeddedWalletConnector({
    cdpConfig: {
      projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID!,
    },
    providerConfig: {
      chains: [base, baseSepolia],
      transports: {
        [base.id]: http(),
        [baseSepolia.id]: http(),
      },
    },
  });

  return createConfig({
    chains: [base, baseSepolia],
    connectors: [
      cdpConnector, // CDP Embedded Wallet with social login (prioritized)
      injected(),
      coinbaseWallet({
        appName: 'ULink',
        preference: 'smartWalletOnly',
      }),
      ...(process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ? [
        walletConnect({
          projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
          metadata: {
            name: 'ULink',
            description: 'Your Links, Beautifully Organized',
            url: process.env.NODE_ENV === 'production' ? 'https://ulink.dev' : 'http://localhost:3000',
            icons: [process.env.NODE_ENV === 'production' ? 'https://ulink.dev/icon.png' : 'http://localhost:3000/icon.png'],
          },
        })
      ] : []),
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [base.id]: http(),
      [baseSepolia.id]: http(),
    },
  });
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}