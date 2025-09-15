# ULink Smart Contracts

Smart contracts for the ULink platform on Base blockchain, providing decentralized project registry, membership NFTs, and analytics tracking.

## Overview

ULink is a modern link-in-bio platform with Web3 integration. The smart contracts handle:

- **Project Registry**: Decentralized storage of project metadata and ownership
- **Membership NFTs**: Tiered membership system (Pro/Premium) with expiration
- **Analytics Tracker**: On-chain analytics for views, clicks, and engagement

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ProjectRegistry   │◄───┤  AnalyticsTracker  │    │   MembershipNFT    │
│                 │    │                 │    │                 │
│ • Project CRUD  │    │ • Page views    │    │ • Pro/Premium   │
│ • Slug mapping  │    │ • Link clicks   │    │ • Expiration    │
│ • Ownership     │    │ • Visitor tracking│    │ • Upgrades      │
│ • Tier limits   │    │ • Event storage │    │ • Renewals      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Contracts

### ProjectRegistry

Main registry for ULink projects with ownership and metadata management.

**Key Features:**
- Unique project IDs and slugs
- IPFS/Firebase metadata hashes
- Membership tier restrictions
- Project limits per tier
- Admin management functions

**Membership Limits:**
- Free: 3 projects
- Pro: 25 projects  
- Premium: Unlimited

### MembershipNFT

ERC-721 NFT representing paid memberships with automatic expiration.

**Key Features:**
- Pro and Premium tier NFTs
- Time-based expiration
- Renewal and upgrade functionality
- Dynamic pricing for different durations
- Metadata URIs per tier

**Pricing (Base Sepolia):**
- Pro: 0.01 ETH/month, 0.025 ETH/3mo, 0.08 ETH/year
- Premium: 0.025 ETH/month, 0.065 ETH/3mo, 0.2 ETH/year

### AnalyticsTracker

On-chain analytics with privacy-preserving visitor tracking.

**Key Features:**
- Page view tracking
- Link click analytics
- Share event monitoring
- Unique visitor counting
- Event retention management

## Development

### Prerequisites

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Clone and setup
git clone <repository>
cd ULinkContracts
make setup
```

### Build and Test

```bash
# Compile contracts
make build

# Run tests
make test

# Generate coverage
make coverage

# Gas report
make gas-report
```

### Deployment

#### Base Sepolia Testnet

```bash
# Set environment variables
cp .env.example .env
# Edit .env with your keys

# Deploy to Base Sepolia
make deploy-sepolia

# Verify contracts
make verify
```

#### Base Mainnet

```bash
# Deploy to Base Mainnet (requires confirmation)
make deploy-mainnet
```

### Local Development

```bash
# Start local Anvil node
make anvil

# Deploy to local node
make deploy-local
```

## Environment Variables

Create `.env` file from `.env.example`:

```bash
# RPC URLs
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_MAINNET_RPC_URL=https://mainnet.base.org

# Private keys (use test keys only!)
DEPLOYER_PRIVATE_KEY=your_private_key_here
ADMIN_PRIVATE_KEY=your_admin_key_here

# Addresses
DEPLOYER_ADDRESS=0x...
ADMIN_ADDRESS=0x...
TREASURY_ADDRESS=0x...

# API keys for verification
BASESCAN_API_KEY=your_basescan_key_here
```

## Contract Addresses

### Base Sepolia

```
ProjectRegistry:   0x...
MembershipNFT:     0x...
AnalyticsTracker:  0x...
```

### Base Mainnet

```
ProjectRegistry:   TBD
MembershipNFT:     TBD
AnalyticsTracker:  TBD
```

## Integration

### Frontend Integration

```typescript
import { ProjectRegistry__factory } from './typechain';

const registry = ProjectRegistry__factory.connect(
  PROJECT_REGISTRY_ADDRESS,
  signer
);

// Create project
await registry.createProject(
  projectId,
  title,
  slug,
  metadataHash,
  membershipTier
);
```

### Environment Variables for Frontend

Add to your `.env.local`:

```bash
NEXT_PUBLIC_PROJECT_REGISTRY_CONTRACT=0x...
NEXT_PUBLIC_MEMBERSHIP_NFT_CONTRACT=0x...
NEXT_PUBLIC_ANALYTICS_TRACKER_CONTRACT=0x...
```

## Security

### Access Control

- **Admin Role**: Contract administration and emergency functions
- **Project Manager**: Project lifecycle management
- **Emergency Role**: Pause/unpause functionality

### Safety Features

- Reentrancy protection on all state-changing functions
- Pausable contracts for emergency stops
- Input validation and bounds checking
- Event retention limits for gas optimization

### Audit Status

- [ ] Internal security review
- [ ] External security audit
- [ ] Bug bounty program

## Gas Optimization

The contracts are optimized for Base's low gas costs:

- Batch operations where possible
- Event-based architecture for off-chain indexing
- Storage-efficient data structures
- Gas reporting in tests

## Testing

Comprehensive test suite covering:

- Contract deployment and initialization
- Access control and permissions
- Business logic edge cases
- Gas usage optimization
- Integration between contracts

Run tests:

```bash
forge test -vvv
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Links

- [Base Network](https://base.org)
- [Foundry Documentation](https://book.getfoundry.sh)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [ULink Platform](https://ulink.dev)