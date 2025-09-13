'use client';

import React, { type ReactNode, useState, useEffect } from 'react';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { type Config } from '@coinbase/cdp-hooks';
import { CDPReactProvider, type AppConfig } from '@coinbase/cdp-react/components/CDPReactProvider';
import { baseSepolia } from 'wagmi/chains';
import { getConfig } from '@/lib/wagmi';

interface Web3ProviderProps {
  children: ReactNode;
}

// CDP Configuration
const CDP_CONFIG: Config = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID ?? "",
  createAccountOnLogin: "evm-smart", // Smart Account for gasless transactions
};

// App Configuration for CDP React
const APP_CONFIG: AppConfig = {
  name: "ULink",
  logoUrl: "/logo.svg",
  authMethods: ["email", "sms"], // Enable both email and SMS authentication
};

export function Web3Provider({ children }: Web3ProviderProps) {
  const [queryClient] = useState(() => new QueryClient());
  const [config] = useState(() => getConfig());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log('[Web3Provider] Mounting...');
    setMounted(true);
  }, []);

  console.log('[Web3Provider] Render - mounted:', mounted, 'CDP_CONFIG:', CDP_CONFIG);

  if (!mounted) {
    // During hydration, render a loading wrapper to prevent provider context issues
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Initializing Web3...</p>
        </div>
      </div>
    );
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <CDPReactProvider config={CDP_CONFIG} app={APP_CONFIG}>
          <OnchainKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
            chain={baseSepolia}
            config={{
              appearance: {
                name: 'ULink',
                mode: 'auto',
                theme: 'default'
              }
            }}
          >
            {children}
          </OnchainKitProvider>
        </CDPReactProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}