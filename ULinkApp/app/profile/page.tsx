'use client';

import { useIsSignedIn } from '@coinbase/cdp-hooks';
import { useAccount, useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, ExternalLink, Wallet, CheckCircle, User, Mail, LogOut } from 'lucide-react';
import { 
  Avatar as OnchainAvatar, 
  Identity, 
  Name as OnchainName, 
  Badge as OnchainBadge, 
  Address as OnchainAddress 
} from '@coinbase/onchainkit/identity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { formatAddress } from '@/lib/utils';
import { FundWallet } from '@/components/wallet/fund-wallet';
import { Header } from '@/components/header';

export default function ProfilePage() {
  const router = useRouter();
  const { isSignedIn } = useIsSignedIn();
  const { address, connector, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isConnected = isSignedIn || !!address;

  // Redirect to connect page if not connected
  useEffect(() => {
    if (mounted && !isConnected) {
      router.push('/connect');
    }
  }, [mounted, isConnected, router]);

  const handleCopyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  const handleDisconnect = () => {
    disconnect();
    router.push('/');
  };

  const getChainName = (chainId?: number) => {
    switch (chainId) {
      case 84532: return 'Base Sepolia'; // Prioritize Base Sepolia
      case 8453: return 'Base';
      case 1: return 'Ethereum Mainnet';
      case 137: return 'Polygon';
      case 10: return 'Optimism';
      default: return `Chain ${chainId}`;
    }
  };

  const getExplorerUrl = (address: string, chainId?: number) => {
    switch (chainId) {
      case 84532: return `https://sepolia.basescan.org/address/${address}`; // Base Sepolia first
      case 8453: return `https://basescan.org/address/${address}`;
      case 1: return `https://etherscan.io/address/${address}`;
      case 137: return `https://polygonscan.com/address/${address}`;
      case 10: return `https://optimistic.etherscan.io/address/${address}`;
      default: return `https://sepolia.basescan.org/address/${address}`; // Default to Base Sepolia
    }
  };

  // Show loading state during hydration or while redirecting
  if (!mounted || !isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-blue-600">
                Loading Profile...
              </h1>
              <p className="text-gray-600">
                Please wait while we load your wallet information
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <div className="container mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-2">
              <Link href="/dashboard" className="hover:text-blue-600">
                Dashboard
              </Link>
              <span className="mx-1">/</span>
              <span className="font-medium text-gray-900">Profile</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 font-display">
              👤 Wallet Profile
            </h1>
            <p className="text-gray-600 mt-1">Manage your wallet connection and view account details</p>
          </div>
          <Button variant="outline" asChild className="bg-transparent">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Profile Card */}
          <div className="space-y-6">
            {/* Account Overview */}
            <Card className="bg-white/60 backdrop-blur-lg border-silver-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {address ? (
                    <Identity address={address}>
                      <OnchainAvatar className="h-12 w-12" />
                      <div>
                        <OnchainName className="text-xl font-semibold">
                          <OnchainBadge />
                        </OnchainName>
                        <p className="text-sm text-gray-600">
                          {isSignedIn ? 'CDP Smart Account' : 'Browser Wallet'}
                        </p>
                      </div>
                    </Identity>
                  ) : (
                    <>
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-xl font-semibold">Wallet Account</h2>
                        <p className="text-sm text-gray-600">
                          {isSignedIn ? 'CDP Smart Account' : 'Browser Wallet'}
                        </p>
                      </div>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Wallet Address */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Wallet Address</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                    <Wallet className="h-4 w-4 text-gray-500" />
                    <code className="flex-1 text-sm font-mono">
                      {address ? formatAddress(address, 10, 8) : 'No address available'}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyAddress}
                      className="h-8 w-8 p-0"
                      disabled={!address}
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                    {address && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0"
                      >
                        <a 
                          href={getExplorerUrl(address, chainId)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 text-gray-500" />
                        </a>
                      </Button>
                    )}
                  </div>
                  {copied && (
                    <p className="text-xs text-green-600">Address copied to clipboard!</p>
                  )}
                </div>

                {/* Connection Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Connection Type</label>
                    <div className="flex items-center gap-2">
                      <Badge variant={isSignedIn ? "default" : "secondary"} className="text-xs">
                        {isSignedIn ? (
                          <>
                            <Mail className="w-3 h-3 mr-1" />
                            CDP Smart Account
                          </>
                        ) : (
                          <>
                            <Wallet className="w-3 h-3 mr-1" />
                            Browser Wallet
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Network</label>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-900">
                        {getChainName(chainId)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Connector Info */}
                {connector && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Connected Via</label>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Wallet className="h-4 w-4" />
                      <span>{connector.name}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card className="bg-white/60 backdrop-blur-lg border-silver-200/50">
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>
                  Manage your wallet connection and account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCopyAddress}
                    disabled={!address}
                    className="flex-1"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {copied ? 'Copied!' : 'Copy Address'}
                  </Button>
                  
                  {address && (
                    <Button variant="outline" asChild className="flex-1">
                      <a 
                        href={getExplorerUrl(address, chainId)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View on Explorer
                      </a>
                    </Button>
                  )}
                </div>

                <Separator />

                <Button
                  variant="destructive"
                  onClick={handleDisconnect}
                  className="w-full"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect Wallet
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Fund Wallet */}
            <FundWallet onSuccess={() => console.log('Wallet funded successfully!')} />

            {/* OnchainKit Identity */}
            <Card className="bg-white/60 backdrop-blur-lg border-silver-200/50">
              <CardHeader className="text-center">
                <div className="flex flex-col items-center space-y-4">
                  {address && (
                    <Identity address={address}>
                      <OnchainAvatar className="w-16 h-16" />
                      <OnchainName className="text-lg font-semibold text-gray-900">
                        <OnchainBadge />
                      </OnchainName>
                      <OnchainAddress className="text-sm text-gray-600 font-mono" />
                    </Identity>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600 font-medium">Connected</span>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white/60 backdrop-blur-lg border-silver-200/50">
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Account Type</span>
                  <span className="font-medium">
                    {isSignedIn ? 'Smart Account' : 'Browser Wallet'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Chain ID</span>
                  <span className="font-medium">{chainId || 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Status</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-green-600">Online</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="bg-white/60 backdrop-blur-lg border-silver-200/50">
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">
                  Having trouble with your wallet connection or need support?
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Documentation
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}