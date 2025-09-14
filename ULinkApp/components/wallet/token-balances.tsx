'use client';

import { useAccount, useBalance } from 'wagmi';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Token contracts on Base and Base Sepolia
const TOKENS = {
  // Base Mainnet (8453)
  8453: {
    USDC: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    ETH: '0x0000000000000000000000000000000000000000', // Native ETH
  },
  // Base Sepolia (84532) 
  84532: {
    USDC: '0x036cbd53842c5426634e7929541ec2318f3dcf7e', // Base Sepolia USDC
    ETH: '0x0000000000000000000000000000000000000000', // Native ETH
  }
} as const;

interface TokenBalanceProps {
  className?: string;
}

export function TokenBalances({ className }: TokenBalanceProps) {
  const { address, chainId } = useAccount();
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Get native ETH balance
  const { 
    data: ethBalance, 
    isError: ethError, 
    isLoading: ethLoading,
    refetch: refetchEth 
  } = useBalance({
    address: address,
  });

  // Get USDC balance
  const currentTokens = chainId ? TOKENS[chainId as keyof typeof TOKENS] : null;
  const { 
    data: usdcBalance, 
    isError: usdcError, 
    isLoading: usdcLoading,
    refetch: refetchUsdc 
  } = useBalance({
    address: address,
    token: currentTokens?.USDC as `0x${string}`,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchEth(), refetchUsdc()]);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to refresh balances:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatBalance = (balance: bigint | undefined, decimals: number = 18) => {
    if (!balance) return '0.00';
    
    const divisor = BigInt(10 ** decimals);
    const wholePart = balance / divisor;
    const fractionalPart = balance % divisor;
    
    // Convert to string with proper decimals
    const wholeStr = wholePart.toString();
    const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    
    // Take first 6 decimal places for display
    const displayDecimals = fractionalStr.substring(0, 6);
    const result = `${wholeStr}.${displayDecimals}`;
    
    // Remove trailing zeros
    return parseFloat(result).toFixed(6).replace(/\.?0+$/, '');
  };

  const getChainName = (chainId?: number) => {
    switch (chainId) {
      case 84532: return 'Base Sepolia';
      case 8453: return 'Base';
      default: return `Chain ${chainId}`;
    }
  };

  if (!address) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Token Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <p>Connect your wallet to view token balances</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-blue-600" />
            Token Balances
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>{getChainName(chainId)}</span>
          {lastRefresh && (
            <>
              <span>•</span>
              <span>Updated {lastRefresh.toLocaleTimeString()}</span>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ETH Balance */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-semibold text-sm">ETH</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Ethereum</h3>
              <p className="text-sm text-gray-600">Native token</p>
            </div>
          </div>
          <div className="text-right">
            {ethLoading ? (
              <div className="animate-pulse">
                <div className="h-5 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-16 bg-gray-200 rounded mt-1"></div>
              </div>
            ) : ethError ? (
              <div className="text-red-500">
                <p className="font-medium">Error</p>
                <p className="text-xs">Failed to load</p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-gray-900">
                  {formatBalance(ethBalance?.value)} ETH
                </p>
                <p className="text-xs text-gray-600">
                  ${ethBalance?.value ? (parseFloat(formatBalance(ethBalance.value)) * 3000).toFixed(2) : '0.00'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* USDC Balance */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">USDC</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">USD Coin</h3>
              <p className="text-sm text-gray-600">Stablecoin</p>
            </div>
          </div>
          <div className="text-right">
            {usdcLoading ? (
              <div className="animate-pulse">
                <div className="h-5 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-16 bg-gray-200 rounded mt-1"></div>
              </div>
            ) : usdcError ? (
              <div className="text-red-500">
                <p className="font-medium">Error</p>
                <p className="text-xs">Failed to load</p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-gray-900">
                  {formatBalance(usdcBalance?.value, 6)} USDC
                </p>
                <p className="text-xs text-gray-600">
                  ${formatBalance(usdcBalance?.value, 6)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Total Portfolio Value */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Total Portfolio</span>
            </div>
            <div className="text-right">
              {ethLoading || usdcLoading ? (
                <div className="animate-pulse">
                  <div className="h-5 w-16 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <p className="font-semibold text-gray-900">
                  ${(
                    (ethBalance?.value ? parseFloat(formatBalance(ethBalance.value)) * 3000 : 0) +
                    (usdcBalance?.value ? parseFloat(formatBalance(usdcBalance.value, 6)) : 0)
                  ).toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Network Badge */}
        <div className="flex justify-center pt-2">
          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
            {getChainName(chainId)} Network
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}