/**
 * Deployment Status Utility
 * 
 * Helps track and validate contract deployment status
 */

export interface DeploymentStatus {
  isDeployed: boolean;
  contractAddresses: {
    projectRegistry?: string;
    membershipNFT?: string;
    analyticsTracker?: string;
  };
  network: string;
  chainId: number;
  placeholderAddresses: string[];
}

export interface ContractInfo {
  name: string;
  address: string;
  isPlaceholder: boolean;
  blockExplorer?: string;
}

/**
 * Placeholder addresses that indicate contracts haven't been deployed yet
 */
const PLACEHOLDER_ADDRESSES = [
  '0x742d35Cc6754Cb7C67d15C5a4C6b37e2c50cBf38', // ProjectRegistry placeholder
  '0x0000000000000000000000000000000000000000', // Zero address
];

/**
 * Check if an address is a placeholder
 */
export function isPlaceholderAddress(address: string): boolean {
  return PLACEHOLDER_ADDRESSES.includes(address.toLowerCase()) || 
         address === '' || 
         address === undefined;
}

/**
 * Get current deployment status
 */
export function getDeploymentStatus(): DeploymentStatus {
  const projectRegistry = process.env.NEXT_PUBLIC_PROJECT_REGISTRY_CONTRACT || '';
  const membershipNFT = process.env.NEXT_PUBLIC_MEMBERSHIP_NFT_CONTRACT || '';
  const analyticsTracker = process.env.NEXT_PUBLIC_ANALYTICS_TRACKER_CONTRACT || '';

  const addresses = {
    projectRegistry: projectRegistry || undefined,
    membershipNFT: membershipNFT || undefined,
    analyticsTracker: analyticsTracker || undefined,
  };

  const isDeployed = !isPlaceholderAddress(projectRegistry) && 
                    !isPlaceholderAddress(membershipNFT) && 
                    !isPlaceholderAddress(analyticsTracker);

  return {
    isDeployed,
    contractAddresses: addresses,
    network: 'Base Sepolia',
    chainId: 84532,
    placeholderAddresses: PLACEHOLDER_ADDRESSES,
  };
}

/**
 * Get contract info with metadata
 */
export function getContractInfo(): ContractInfo[] {
  const status = getDeploymentStatus();
  
  return [
    {
      name: 'ProjectRegistry',
      address: status.contractAddresses.projectRegistry || 'Not deployed',
      isPlaceholder: isPlaceholderAddress(status.contractAddresses.projectRegistry || ''),
      blockExplorer: status.contractAddresses.projectRegistry 
        ? `https://sepolia.basescan.org/address/${status.contractAddresses.projectRegistry}`
        : undefined,
    },
    {
      name: 'MembershipNFT',
      address: status.contractAddresses.membershipNFT || 'Not deployed',
      isPlaceholder: isPlaceholderAddress(status.contractAddresses.membershipNFT || ''),
      blockExplorer: status.contractAddresses.membershipNFT 
        ? `https://sepolia.basescan.org/address/${status.contractAddresses.membershipNFT}`
        : undefined,
    },
    {
      name: 'AnalyticsTracker',
      address: status.contractAddresses.analyticsTracker || 'Not deployed',
      isPlaceholder: isPlaceholderAddress(status.contractAddresses.analyticsTracker || ''),
      blockExplorer: status.contractAddresses.analyticsTracker 
        ? `https://sepolia.basescan.org/address/${status.contractAddresses.analyticsTracker}`
        : undefined,
    },
  ];
}

/**
 * Generate deployment instructions
 */
export function getDeploymentInstructions(): string {
  const status = getDeploymentStatus();
  
  if (status.isDeployed) {
    return 'All contracts are deployed and ready!';
  }

  return `
## Deploy ULink Smart Contracts

1. **Setup Environment**:
   \`\`\`bash
   cd ULinkContracts
   cp .env.example .env
   # Edit .env with your deployment wallet private key
   \`\`\`

2. **Deploy to Base Sepolia**:
   \`\`\`bash
   make setup
   make build
   make test
   make deploy-sepolia
   \`\`\`

3. **Update Frontend Environment**:
   \`\`\`bash
   cd ../ULinkApp
   echo "NEXT_PUBLIC_PROJECT_REGISTRY_CONTRACT=<deployed-address>" >> .env.local
   echo "NEXT_PUBLIC_MEMBERSHIP_NFT_CONTRACT=<deployed-address>" >> .env.local
   echo "NEXT_PUBLIC_ANALYTICS_TRACKER_CONTRACT=<deployed-address>" >> .env.local
   \`\`\`

See DEPLOYMENT.md for detailed instructions.
  `.trim();
}

/**
 * Validate environment variables
 */
export function validateEnvironment(): {
  isValid: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required environment variables
  const projectRegistry = process.env.NEXT_PUBLIC_PROJECT_REGISTRY_CONTRACT;
  const membershipNFT = process.env.NEXT_PUBLIC_MEMBERSHIP_NFT_CONTRACT;
  const analyticsTracker = process.env.NEXT_PUBLIC_ANALYTICS_TRACKER_CONTRACT;

  if (!projectRegistry) {
    missing.push('NEXT_PUBLIC_PROJECT_REGISTRY_CONTRACT');
  } else if (isPlaceholderAddress(projectRegistry)) {
    warnings.push('NEXT_PUBLIC_PROJECT_REGISTRY_CONTRACT is using placeholder address');
  }

  if (!membershipNFT) {
    missing.push('NEXT_PUBLIC_MEMBERSHIP_NFT_CONTRACT');
  } else if (isPlaceholderAddress(membershipNFT)) {
    warnings.push('NEXT_PUBLIC_MEMBERSHIP_NFT_CONTRACT is using placeholder address');
  }

  if (!analyticsTracker) {
    missing.push('NEXT_PUBLIC_ANALYTICS_TRACKER_CONTRACT');
  } else if (isPlaceholderAddress(analyticsTracker)) {
    warnings.push('NEXT_PUBLIC_ANALYTICS_TRACKER_CONTRACT is using placeholder address');
  }

  return {
    isValid: missing.length === 0 && warnings.length === 0,
    missing,
    warnings,
  };
}

/**
 * Generate .env.local template with deployed addresses
 */
export function generateEnvTemplate(addresses: {
  projectRegistry: string;
  membershipNFT: string;
  analyticsTracker: string;
}): string {
  return `
# ULink Smart Contract Addresses (Base Sepolia)
NEXT_PUBLIC_PROJECT_REGISTRY_CONTRACT=${addresses.projectRegistry}
NEXT_PUBLIC_MEMBERSHIP_NFT_CONTRACT=${addresses.membershipNFT}
NEXT_PUBLIC_ANALYTICS_TRACKER_CONTRACT=${addresses.analyticsTracker}

# Firebase Configuration (from settings folder)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAe8v5EV3gVQPKl3ySX2zT8cQ9vE2zR8uY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ulink-dev.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ulink-dev
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ulink-dev.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEFGHIJ
  `.trim();
}