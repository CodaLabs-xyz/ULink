# ULink Smart Contract Deployment Guide

This guide walks through deploying the ULink smart contracts to Base Sepolia testnet and integrating them with the frontend.

## Prerequisites

### 1. Install Foundry
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 2. Get Test Funds
1. Get Base Sepolia ETH from [Base Sepolia Faucet](https://bridge.base.org/deposit)
2. You'll need ~0.01 ETH for deployment and testing

### 3. Create Wallet for Deployment
```bash
# Generate a new wallet for testing (save the private key)
cast wallet new

# Or use existing test wallet private key
```

## Deployment Steps

### 1. Configure Environment
```bash
cd ULinkContracts
cp .env.example .env
```

Edit `.env` with your values:
```bash
# Required for deployment
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
DEPLOYER_PRIVATE_KEY=0x1234567890abcdef... # Your test wallet private key
BASESCAN_API_KEY=your_basescan_api_key_here # For contract verification

# Optional - if not set, will use deployer address for all roles
DEPLOYER_ADDRESS=0x... # Auto-derived from private key if not set
ADMIN_ADDRESS=0x...    # Defaults to deployer address
TREASURY_ADDRESS=0x... # Defaults to admin address
```

### 2. Setup Dependencies
```bash
make setup
```

### 3. Build and Test
```bash
# Compile contracts
make build

# Run tests to ensure everything works
make test

# Optional: Generate gas report
make gas-report
```

### 4. Deploy to Base Sepolia
```bash
# Deploy all contracts
make deploy-sepolia
```

This will:
- Deploy ProjectRegistry contract
- Deploy MembershipNFT contract  
- Deploy AnalyticsTracker contract
- Set up contract relationships
- Output deployed addresses

### 5. Verify Contracts (Optional)
```bash
# After deployment, verify on Basescan
make verify
```

## Expected Output

After successful deployment, you should see:
```
== Logs ==
🚀 Deploying ULink contracts to Base Sepolia...

📋 Deployment Summary:
ProjectRegistry:   0x742d35Cc6754Cb7C67d15C5a4C6b37e2c50cBf38
MembershipNFT:     0x1234567890123456789012345678901234567890
AnalyticsTracker:  0xabcdefabcdefabcdefabcdefabcdefabcdefabcd

⚡ Gas Used:
ProjectRegistry:   1,234,567
MembershipNFT:     987,654
AnalyticsTracker:  456,789
Total:             2,679,010

✅ All contracts deployed successfully!
```

## Frontend Integration

### 1. Update Frontend Environment
```bash
cd ../ULinkApp

# Add contract addresses to .env.local
echo "NEXT_PUBLIC_PROJECT_REGISTRY_CONTRACT=0x742d35Cc6754Cb7C67d15C5a4C6b37e2c50cBf38" >> .env.local
echo "NEXT_PUBLIC_MEMBERSHIP_NFT_CONTRACT=0x1234567890123456789012345678901234567890" >> .env.local
echo "NEXT_PUBLIC_ANALYTICS_TRACKER_CONTRACT=0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" >> .env.local
```

### 2. Update Blockchain Service
The blockchain service is already configured to use these environment variables. After adding the contract addresses, the frontend will automatically use the real contracts instead of simulated calls.

### 3. Test Integration
```bash
# Start the frontend
npm run dev

# Test creating a project with your connected wallet
# Make sure your wallet is connected to Base Sepolia
```

## Testing the Full Flow

### 1. Connect Wallet
- Open ULink app at http://localhost:3000
- Connect your wallet (same one used for deployment)
- Switch to Base Sepolia network

### 2. Create Project
- Go to `/dashboard/project/new`
- Fill out project form
- Submit and confirm transaction

### 3. Verify on Blockchain
```bash
# Check contract on Basescan
# https://sepolia.basescan.org/address/0x742d35Cc6754Cb7C67d15C5a4C6b37e2c50cBf38

# Or use cast to verify
cast call 0x742d35Cc6754Cb7C67d15C5a4C6b37e2c50cBf38 "totalProjects()" --rpc-url https://sepolia.base.org
```

## Contract Addresses (Base Sepolia)

After deployment, update this section:

```
ProjectRegistry:   0x...
MembershipNFT:     0x...
AnalyticsTracker:  0x...

Deployed Block:    12345678
Gas Used:          2,679,010 gas
Total Cost:        ~0.005 ETH
```

## Troubleshooting

### Common Issues

1. **Insufficient funds**: Ensure your wallet has enough Base Sepolia ETH
2. **Wrong network**: Make sure you're on Base Sepolia (Chain ID: 84532)
3. **RPC issues**: Try different RPC URLs if deployment fails
4. **Private key format**: Ensure private key starts with '0x'

### Useful Commands
```bash
# Check wallet balance
cast balance $DEPLOYER_ADDRESS --rpc-url https://sepolia.base.org

# Get current gas price
cast gas-price --rpc-url https://sepolia.base.org

# Check transaction status
cast tx $TX_HASH --rpc-url https://sepolia.base.org
```

## Security Notes

- **Never use real funds**: Only use testnet tokens
- **Private keys**: Store securely, never commit to git
- **Test thoroughly**: Test all functionality before mainnet
- **Contract verification**: Always verify contracts on Basescan

## Next Steps

After deployment:
1. Test project creation flow end-to-end
2. Test membership NFT minting
3. Verify analytics tracking works
4. Consider security audit for mainnet deployment
5. Set up monitoring and alerts