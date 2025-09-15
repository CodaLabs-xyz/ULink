import { createPublicClient, createWalletClient, custom, http, Hash, Address } from 'viem';
import { baseSepolia, base } from 'viem/chains';
import { toast } from 'sonner';

// Project metadata interface for blockchain storage
export interface ProjectBlockchainMetadata {
  id: string;
  title: string;
  slug: string;
  owner: Address;
  metadataHash: string; // IPFS hash or Firebase reference
  createdAt: number;
  isActive: boolean;
  membershipTier: number;
}

// Transaction result interface
export interface BlockchainTransactionResult {
  txHash: Hash;
  blockNumber: bigint;
  gasUsed: bigint;
  status: 'success' | 'reverted';
}

export class BlockchainService {
  private static readonly CHAIN = baseSepolia; // Use Base Sepolia testnet
  
  // Project Registry contract ABI
  private static readonly PROJECT_REGISTRY_ABI = [
    // Create project function
    {
      name: 'createProject',
      type: 'function',
      inputs: [
        { name: 'projectId', type: 'string' },
        { name: 'title', type: 'string' },
        { name: 'slug', type: 'string' },
        { name: 'metadataHash', type: 'string' },
        { name: 'membershipTier', type: 'uint256' }
      ],
      outputs: [],
      stateMutability: 'nonpayable'
    },
    // Get project function
    {
      name: 'getProject',
      type: 'function',
      inputs: [{ name: 'projectId', type: 'string' }],
      outputs: [
        {
          name: '',
          type: 'tuple',
          components: [
            { name: 'projectId', type: 'string' },
            { name: 'title', type: 'string' },
            { name: 'slug', type: 'string' },
            { name: 'owner', type: 'address' },
            { name: 'metadataHash', type: 'string' },
            { name: 'createdAt', type: 'uint256' },
            { name: 'isActive', type: 'bool' },
            { name: 'membershipTier', type: 'uint256' }
          ]
        }
      ],
      stateMutability: 'view'
    },
    // Is slug available function
    {
      name: 'isSlugAvailable',
      type: 'function',
      inputs: [{ name: 'slug', type: 'string' }],
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'view'
    },
    // Is project owner function
    {
      name: 'isProjectOwner',
      type: 'function',
      inputs: [
        { name: 'projectId', type: 'string' },
        { name: 'owner', type: 'address' }
      ],
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'view'
    },
    // Project created event
    {
      name: 'ProjectCreated',
      type: 'event',
      inputs: [
        { name: 'projectId', type: 'string', indexed: true },
        { name: 'owner', type: 'address', indexed: true },
        { name: 'slug', type: 'string', indexed: false },
        { name: 'metadataHash', type: 'string', indexed: false },
        { name: 'membershipTier', type: 'uint256', indexed: false }
      ]
    }
  ] as const;
  
  // Contract address (will be updated after deployment)
  private static readonly CONTRACT_ADDRESS = (
    process.env.NEXT_PUBLIC_PROJECT_REGISTRY_CONTRACT || 
    '0x742d35Cc6754Cb7C67d15C5a4C6b37e2c50cBf38'
  ) as Address;
  
  /**
   * Get public client for reading blockchain data
   */
  private static getPublicClient() {
    return createPublicClient({
      chain: this.CHAIN,
      transport: http()
    });
  }
  
  /**
   * Get wallet client for writing transactions
   */
  private static getWalletClient() {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No wallet found');
    }
    
    return createWalletClient({
      chain: this.CHAIN,
      transport: custom(window.ethereum)
    });
  }
  
  /**
   * Create project on blockchain
   */
  static async createProject(
    projectMetadata: Omit<ProjectBlockchainMetadata, 'createdAt' | 'isActive'>,
    walletAddress: Address
  ): Promise<BlockchainTransactionResult> {
    try {
      const walletClient = this.getWalletClient();
      const publicClient = this.getPublicClient();
      
      console.log('🔗 Creating project on Base Sepolia:', {
        projectMetadata,
        walletAddress,
        chain: this.CHAIN.name,
        contractAddress: this.CONTRACT_ADDRESS
      });
      
      // Check if we have a deployed contract address
      if (this.CONTRACT_ADDRESS === '0x742d35Cc6754Cb7C67d15C5a4C6b37e2c50cBf38') {
        // This is the placeholder address, simulate for now
        const simulatedTx = await this.simulateContractCall(
          'createProject',
          [
            projectMetadata.id,
            projectMetadata.title,
            projectMetadata.slug,
            projectMetadata.metadataHash,
            projectMetadata.membershipTier
          ],
          walletAddress
        );
        return simulatedTx;
      }
      
      // Actual contract call (when contract is deployed):
      const { request } = await publicClient.simulateContract({
        address: this.CONTRACT_ADDRESS,
        abi: this.PROJECT_REGISTRY_ABI,
        functionName: 'createProject',
        args: [
          projectMetadata.id,
          projectMetadata.title,
          projectMetadata.slug,
          projectMetadata.metadataHash,
          BigInt(projectMetadata.membershipTier)
        ],
        account: walletAddress,
      });
      
      const txHash = await walletClient.writeContract(request);
      
      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 2 // Wait for 2 confirmations
      });
      
      return {
        txHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        status: receipt.status
      };
      
    } catch (error: any) {
      console.error('Blockchain project creation error:', error);
      throw new Error(`Failed to create project on blockchain: ${error.message}`);
    }
  }
  
  /**
   * Get project from blockchain
   */
  static async getProject(projectId: string): Promise<ProjectBlockchainMetadata | null> {
    try {
      const publicClient = this.getPublicClient();
      
      // Check if we have a deployed contract address
      if (this.CONTRACT_ADDRESS === '0x742d35Cc6754Cb7C67d15C5a4C6b37e2c50cBf38') {
        // This is the placeholder address, simulate for now
        console.log('📖 Simulating project read from Base Sepolia:', {
          projectId,
          contractAddress: this.CONTRACT_ADDRESS
        });
        return null;
      }
      
      // Actual contract read (when contract is deployed):
      const result = await publicClient.readContract({
        address: this.CONTRACT_ADDRESS,
        abi: this.PROJECT_REGISTRY_ABI,
        functionName: 'getProject',
        args: [projectId]
      });
      
      // Result is a tuple with ProjectInfo structure
      if (!result || !result.projectId) {
        return null; // Project not found
      }
      
      return {
        id: result.projectId,
        title: result.title,
        slug: result.slug,
        owner: result.owner,
        metadataHash: result.metadataHash,
        createdAt: Number(result.createdAt),
        isActive: result.isActive,
        membershipTier: Number(result.membershipTier)
      };
      
    } catch (error: any) {
      console.error('Blockchain project read error:', error);
      return null;
    }
  }
  
  /**
   * Verify project ownership
   */
  static async verifyProjectOwnership(projectId: string, walletAddress: Address): Promise<boolean> {
    try {
      const project = await this.getProject(projectId);
      
      if (!project) {
        return false;
      }
      
      return project.owner.toLowerCase() === walletAddress.toLowerCase();
      
    } catch (error: any) {
      console.error('Ownership verification error:', error);
      return false;
    }
  }
  
  /**
   * Generate metadata hash for IPFS or Firebase reference
   */
  static generateMetadataHash(projectData: any): string {
    // Simple hash generation - in production, this would be an IPFS hash
    // or a reference to Firebase document
    const jsonString = JSON.stringify(projectData);
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonString);
    
    // Create a simple hash (in production, use proper cryptographic hash)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data[i];
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `firebase:projects:${Math.abs(hash).toString(16)}`;
  }
  
  /**
   * Get current gas prices
   */
  static async getGasPrices() {
    try {
      const publicClient = this.getPublicClient();
      const gasPrice = await publicClient.getGasPrice();
      
      return {
        gasPrice: gasPrice.toString(),
        formatted: `${Number(gasPrice) / 1e9} gwei`
      };
    } catch (error: any) {
      console.error('Gas price fetch error:', error);
      return {
        gasPrice: '1000000000', // 1 gwei fallback
        formatted: '1 gwei'
      };
    }
  }
  
  /**
   * Check wallet connection and network
   */
  static async checkWalletConnection(): Promise<{
    isConnected: boolean;
    address?: Address;
    chainId?: number;
    isCorrectNetwork: boolean;
  }> {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        return { isConnected: false, isCorrectNetwork: false };
      }
      
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      const isConnected = accounts && accounts.length > 0;
      const currentChainId = parseInt(chainId, 16);
      const isCorrectNetwork = currentChainId === this.CHAIN.id;
      
      return {
        isConnected,
        address: isConnected ? accounts[0] : undefined,
        chainId: currentChainId,
        isCorrectNetwork
      };
      
    } catch (error: any) {
      console.error('Wallet connection check error:', error);
      return { isConnected: false, isCorrectNetwork: false };
    }
  }
  
  /**
   * Switch to correct network
   */
  static async switchToCorrectNetwork(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        return false;
      }
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${this.CHAIN.id.toString(16)}` }]
      });
      
      return true;
      
    } catch (error: any) {
      // If chain is not added to wallet, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${this.CHAIN.id.toString(16)}`,
              chainName: this.CHAIN.name,
              rpcUrls: [this.CHAIN.rpcUrls.default.http[0]],
              blockExplorerUrls: this.CHAIN.blockExplorers?.default ? [this.CHAIN.blockExplorers.default.url] : [],
              nativeCurrency: this.CHAIN.nativeCurrency
            }]
          });
          return true;
        } catch (addError) {
          console.error('Failed to add network:', addError);
          return false;
        }
      }
      
      console.error('Failed to switch network:', error);
      return false;
    }
  }
  
  /**
   * Check if slug is available on blockchain
   */
  static async isSlugAvailable(slug: string): Promise<boolean> {
    try {
      const publicClient = this.getPublicClient();
      
      // Check if we have a deployed contract address
      if (this.CONTRACT_ADDRESS === '0x742d35Cc6754Cb7C67d15C5a4C6b37e2c50cBf38') {
        // This is the placeholder address, simulate for now
        return true;
      }
      
      // Actual contract call (when contract is deployed):
      const isAvailable = await publicClient.readContract({
        address: this.CONTRACT_ADDRESS,
        abi: this.PROJECT_REGISTRY_ABI,
        functionName: 'isSlugAvailable',
        args: [slug]
      });
      
      return isAvailable;
      
    } catch (error: any) {
      console.error('Slug availability check error:', error);
      return false;
    }
  }

  /**
   * Get membership NFT contract addresses
   */
  static getMembershipNFTAddress(): Address {
    return (
      process.env.NEXT_PUBLIC_MEMBERSHIP_NFT_CONTRACT || 
      '0x0000000000000000000000000000000000000000'
    ) as Address;
  }

  /**
   * Get analytics tracker contract address
   */
  static getAnalyticsTrackerAddress(): Address {
    return (
      process.env.NEXT_PUBLIC_ANALYTICS_TRACKER_CONTRACT || 
      '0x0000000000000000000000000000000000000000'
    ) as Address;
  }

  /**
   * Get contract deployment information
   */
  static getContractInfo() {
    return {
      projectRegistry: this.CONTRACT_ADDRESS,
      membershipNFT: this.getMembershipNFTAddress(),
      analyticsTracker: this.getAnalyticsTrackerAddress(),
      network: this.CHAIN.name,
      chainId: this.CHAIN.id,
      blockExplorer: this.CHAIN.blockExplorers?.default?.url
    };
  }

  /**
   * Generate deployment command for smart contracts
   */
  static generateDeploymentCommand(): string {
    return `
# Deploy ULink contracts to Base Sepolia
cd ULinkContracts
cp .env.example .env
# Edit .env with your private keys and addresses
make deploy-sepolia

# Update frontend .env.local with deployed addresses
echo "NEXT_PUBLIC_PROJECT_REGISTRY_CONTRACT=<deployed-address>" >> ../ULinkApp/.env.local
echo "NEXT_PUBLIC_MEMBERSHIP_NFT_CONTRACT=<deployed-address>" >> ../ULinkApp/.env.local
echo "NEXT_PUBLIC_ANALYTICS_TRACKER_CONTRACT=<deployed-address>" >> ../ULinkApp/.env.local
    `.trim();
  }

  /**
   * Simulate contract call for development/testing
   */
  private static async simulateContractCall(
    functionName: string,
    args: any[],
    from: Address
  ): Promise<BlockchainTransactionResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
    
    // Generate realistic mock transaction data
    const mockTxHash = `0x${Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}` as Hash;
    
    const mockBlockNumber = BigInt(Math.floor(Math.random() * 1000000) + 5000000);
    const mockGasUsed = BigInt(Math.floor(Math.random() * 100000) + 50000);
    
    console.log('🔗 Simulated blockchain transaction:', {
      functionName,
      args,
      from,
      txHash: mockTxHash,
      blockNumber: mockBlockNumber.toString(),
      gasUsed: mockGasUsed.toString(),
      status: 'success',
      contractAddress: this.CONTRACT_ADDRESS,
      network: this.CHAIN.name
    });
    
    return {
      txHash: mockTxHash,
      blockNumber: mockBlockNumber,
      gasUsed: mockGasUsed,
      status: 'success'
    };
  }
}