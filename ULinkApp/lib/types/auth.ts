export type AuthMethod = 'email' | 'sms';
export type CreateAccountType = 'evm-smart' | 'evm-externally-owned';

export interface AuthConfig {
  appName?: string;
  logoUrl?: string;
  authMethods?: AuthMethod[];
  createAccountOnLogin?: CreateAccountType;
  onchainKitTheme?: 'default' | 'base' | 'cyberpunk' | 'hacker';
  onchainKitMode?: 'auto' | 'light' | 'dark';
  loadingText?: string;
  connectPageUrl?: string;
  homePageUrl?: string;
  customMessages?: {
    connecting?: string;
    connected?: string;
    connectWallet?: string;
    signInEmail?: string;
    chooseConnection?: string;
    connectBrowser?: string;
    cdpDescription?: string;
    browserDescription?: string;
  };
  excludeConnectors?: string[];
  onSignOut?: () => void;
}

export interface WalletConnection {
  isConnected: boolean;
  address?: string;
  chainId?: number;
  connector?: {
    id: string;
    name: string;
  };
  type: 'cdp' | 'browser' | 'none';
}

export interface AuthState {
  isInitialized: boolean;
  isSignedIn: boolean;
  isLoading: boolean;
  error?: string;
  walletConnection: WalletConnection;
}