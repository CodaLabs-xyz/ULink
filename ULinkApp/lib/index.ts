// Utilities
export { cn } from './utils';

// Web3 Configuration
export { 
  createULinkWagmiConfig, 
  getConfig,
  type WagmiConfigOptions 
} from './wagmi';

// Authentication Configuration
export {
  createULinkAuthConfig,
  createBrandedAuthConfig
} from './auth/config';

// Types
export type {
  AuthMethod,
  CreateAccountType,
  AuthConfig,
  WalletConnection,
  AuthState,
} from './types/auth';