# ULink App Refactoring Guide

This document outlines the refactored structure of the ULink application for better separation of concerns and code reusability.

## 🏗️ Refactored Structure

### `/lib` - Core Utilities & Configuration
```
lib/
├── index.ts                  # Main exports
├── utils.ts                  # Common utilities (cn, formatAddress, etc.)
├── wagmi.ts                  # Configurable Wagmi setup
├── auth/
│   └── config.ts            # Authentication configuration helpers
└── types/
    └── auth.ts              # Authentication type definitions
```

### `/components/common` - Reusable Components
```
components/common/
├── index.ts                  # Component exports
└── loading-spinner.tsx       # Configurable loading components
```

### `/components/wallet` - Web3 Authentication
```
components/wallet/
└── unified-auth.tsx          # Configurable auth component with CDP + browser wallets
```

### `/providers` - Context Providers
```
providers/
└── web3-provider.tsx         # Configurable Web3 provider with multiple chains/themes
```

## 🔧 Key Improvements

### 1. Configurable Web3 Setup

**Before:**
```tsx
// Hard-coded configuration
const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [/* fixed connectors */]
});
```

**After:**
```tsx
// Flexible configuration
import { createULinkWagmiConfig } from '@/lib';

const config = createULinkWagmiConfig({
  appName: 'My App',
  enableWalletConnect: true,
  chains: [mainnet, polygon], // Different chains
});
```

### 2. Configurable Authentication

**Before:**
```tsx
// Fixed messages and behavior
<UnifiedAuth onAuthSuccess={callback} />
```

**After:**
```tsx
// Customizable authentication
import { createULinkAuthConfig } from '@/lib';

const authConfig = createULinkAuthConfig({
  customMessages: {
    connectWallet: 'Join Our Platform',
    chooseConnection: 'Select your preferred connection method'
  },
  excludeConnectors: ['walletConnect'],
  onSignOut: () => customSignOutHandler()
});

<UnifiedAuth config={authConfig} onAuthSuccess={callback} />
```

### 3. Reusable Providers

**Before:**
```tsx
// Fixed provider setup
<Web3Provider>
  <App />
</Web3Provider>
```

**After:**
```tsx
// Configurable provider
<Web3Provider config={{
  appName: 'Custom App',
  onchainKitTheme: 'cyberpunk',
  authMethods: ['email'], // Only email, no SMS
  loadingText: 'Connecting to Web3...'
}}>
  <App />
</Web3Provider>
```

## 📦 Extracting Components for Other Apps

### Method 1: Copy Reusable Directories
Copy these directories to your new project:
- `/lib` - Core utilities and configuration
- `/components/common` - Reusable UI components
- `/components/wallet` - Authentication components
- `/providers` - Context providers

### Method 2: Create a Shared Package
1. Create a new package: `@ulink/shared`
2. Move reusable code to the package
3. Export components and utilities
4. Install in multiple projects

```bash
# In shared package
npm init @ulink/shared
# Move /lib, /components/common, etc.

# In consuming apps
npm install @ulink/shared
```

### Method 3: Use as Template
Use the refactored structure as a template for new projects:

```tsx
// New app using ULink patterns
import { 
  createBrandedAuthConfig, 
  createULinkWagmiConfig,
  cn, 
  formatAddress 
} from '@/lib';
import { UnifiedAuth } from '@/components/wallet/unified-auth';
import { Web3Provider } from '@/providers/web3-provider';

// Brand-specific configuration
const wagmiConfig = createULinkWagmiConfig({
  appName: 'MyBrand',
  appDescription: 'My branded application',
  chains: [mainnet, optimism]
});

const authConfig = createBrandedAuthConfig('MyBrand', {
  theme: 'cyberpunk',
  mode: 'dark'
});
```

## 🎯 Benefits Achieved

### 1. **Separation of Concerns**
- ✅ Configuration separated from implementation
- ✅ Reusable components isolated from app-specific logic  
- ✅ Type definitions centralized and shared

### 2. **Maximum Reusability**
- ✅ Components work across different brands/apps
- ✅ Configuration-driven behavior
- ✅ Easy to extract and share

### 3. **Developer Experience**
- ✅ Clear API boundaries
- ✅ TypeScript support throughout
- ✅ Consistent patterns across components

### 4. **Maintainability**
- ✅ Single source of truth for configurations
- ✅ Standardized component interfaces
- ✅ Easy to test and debug

## 🚀 Usage Examples

### Custom Branded App
```tsx
import { createBrandedAuthConfig } from '@/lib';

const myAppConfig = createBrandedAuthConfig('DeFi Platform', {
  logoUrl: '/defi-logo.svg',
  theme: 'cyberpunk',
  mode: 'dark'
});

export default function MyApp() {
  return (
    <Web3Provider config={{
      appName: 'DeFi Platform',
      onchainKitTheme: 'cyberpunk',
      onchainKitMode: 'dark'
    }}>
      <UnifiedAuth 
        config={myAppConfig}
        onAuthSuccess={() => router.push('/dashboard')}
      />
    </Web3Provider>
  );
}
```

### Multi-Chain Support
```tsx
import { arbitrum, polygon } from 'wagmi/chains';

const multiChainConfig = createULinkWagmiConfig({
  appName: 'Multi-Chain App',
  chains: [mainnet, arbitrum, polygon],
  enableWalletConnect: true
});
```

### Custom Connector Setup
```tsx
const customAuthConfig = createULinkAuthConfig({
  excludeConnectors: ['walletConnect'], // Remove WalletConnect
  customMessages: {
    connectBrowser: 'Connect Your Crypto Wallet'
  }
});
```

This refactoring makes the ULink codebase highly reusable while maintaining clean separation of concerns. Components can now be easily extracted and used across different applications with minimal modification.