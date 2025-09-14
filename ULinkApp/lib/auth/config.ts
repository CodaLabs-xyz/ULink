import type { AuthConfig } from '../types/auth';

export function createULinkAuthConfig(overrides?: Partial<AuthConfig>): AuthConfig {
  const defaultConfig: AuthConfig = {
    appName: 'ULink',
    logoUrl: '/logo.svg',
    authMethods: ['email', 'sms'],
    createAccountOnLogin: 'evm-smart',
    onchainKitTheme: 'default',
    onchainKitMode: 'auto',
    loadingText: 'Initializing Web3...',
    connectPageUrl: '/connect',
    homePageUrl: '/',
    customMessages: {
      connecting: 'Connecting...',
      connected: 'Connected',
      connectWallet: 'Connect Wallet',
      signInEmail: 'Sign in with Email or Phone',
      chooseConnection: "Choose how you'd like to connect to ULink",
      connectBrowser: 'Connect Browser Wallet',
      cdpDescription: 'Creates a gasless Smart Account - no browser extension needed',
      browserDescription: 'Connect your existing wallet (MetaMask, Coinbase Wallet, etc.)',
    },
    excludeConnectors: ['cdpEmbeddedWallet', 'cdp-embedded-wallet', 'walletConnect'],
  };

  return {
    ...defaultConfig,
    ...overrides,
    customMessages: {
      ...defaultConfig.customMessages,
      ...overrides?.customMessages,
    },
  };
}

export function createBrandedAuthConfig(
  brandName: string,
  brandConfig?: {
    logoUrl?: string;
    primaryColor?: string;
    theme?: 'default' | 'base' | 'cyberpunk' | 'hacker';
    mode?: 'auto' | 'light' | 'dark';
  }
): AuthConfig {
  const { logoUrl, theme = 'default', mode = 'auto' } = brandConfig || {};
  
  return createULinkAuthConfig({
    appName: brandName,
    logoUrl: logoUrl || '/logo.svg',
    onchainKitTheme: theme,
    onchainKitMode: mode,
    customMessages: {
      chooseConnection: `Choose how you'd like to connect to ${brandName}`,
    },
  });
}