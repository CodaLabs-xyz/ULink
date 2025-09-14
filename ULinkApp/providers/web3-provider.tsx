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
  config?: {
    appName?: string;
    logoUrl?: string;
    authMethods?: ("email" | "sms")[];
    createAccountOnLogin?: "evm-smart" | "evm-externally-owned";
    onchainKitTheme?: 'default' | 'base' | 'cyberpunk' | 'hacker';
    onchainKitMode?: 'auto' | 'light' | 'dark';
    loadingText?: string;
  };
}

export function Web3Provider({ children, config: customConfig }: Web3ProviderProps) {
  const [queryClient] = useState(() => new QueryClient());
  const [config] = useState(() => getConfig());
  const [mounted, setMounted] = useState(false);

  const {
    appName = "ULink",
    logoUrl = "/logo.svg",
    authMethods = ["email", "sms"],
    createAccountOnLogin = "evm-smart",
    onchainKitTheme = 'default',
    onchainKitMode = 'auto',
    loadingText = "Initializing Web3...",
  } = customConfig || {};

  useEffect(() => {
    setMounted(true);
  }, []);

  // CDP Configuration
  const CDP_CONFIG: Config = {
    projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID ?? "",
    createAccountOnLogin,
  };

  // App Configuration for CDP React
  const APP_CONFIG: AppConfig = {
    name: appName,
    logoUrl,
    authMethods,
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">{loadingText}</p>
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
                name: appName,
                mode: onchainKitMode,
                theme: onchainKitTheme
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