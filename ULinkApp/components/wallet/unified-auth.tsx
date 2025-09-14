'use client';

import { useIsInitialized, useIsSignedIn, useSignOut } from '@coinbase/cdp-hooks';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Mail, Phone, Wallet } from 'lucide-react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Avatar as OnchainAvatar, 
  Identity, 
  Name as OnchainName, 
  Badge as OnchainBadge
} from '@coinbase/onchainkit/identity';
import { useChainId } from 'wagmi';
import { base, mainnet } from 'viem/chains';

interface UnifiedAuthProps {
  onAuthSuccess?: () => void;
  variant?: 'header' | 'full';
  config?: {
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
  };
}

export function UnifiedAuth({ onAuthSuccess, variant = 'full', config = {} }: UnifiedAuthProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return variant === 'header' ? (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
    ) : (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return variant === 'header' ? 
    <UnifiedAuthHeader onAuthSuccess={onAuthSuccess} config={config} /> : 
    <UnifiedAuthFull onAuthSuccess={onAuthSuccess} config={config} />;
}

function UnifiedAuthHeader({ 
  onAuthSuccess, 
  config 
}: { 
  onAuthSuccess?: () => void;
  config: UnifiedAuthProps['config'];
}) {
  const router = useRouter();
  const { isInitialized } = useIsInitialized();
  const { isSignedIn } = useIsSignedIn();
  const { signOut } = useSignOut();
  const { address: wagmiAddress, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  
  // Debug logging for Base name resolution
  React.useEffect(() => {
    if (wagmiAddress && chainId) {
      console.log('🔍 Identity Debug:', {
        address: wagmiAddress,
        chainId,
        chainName: chainId === 8453 ? 'Base Mainnet' : chainId === 84532 ? 'Base Sepolia' : 'Other',
        connector: connector?.name,
        note: 'Base names are on Base Mainnet (8453), OnchainKit configured for Base Mainnet resolution'
      });
    }
  }, [wagmiAddress, chainId, connector]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isConnected = isSignedIn || !!wagmiAddress;

  const {
    connectPageUrl = '/connect',
    homePageUrl = '/',
    customMessages = {},
    onSignOut: customOnSignOut,
  } = config || {};

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      if (isSignedIn) {
        await signOut();
      }
      if (wagmiAddress) {
        disconnect();
      }
      setError(null);
      
      // Use custom callback or default to home page
      if (customOnSignOut) {
        customOnSignOut();
      } else {
        router.push(homePageUrl);
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError(error?.message || 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 h-12 px-4 min-w-[200px] border border-gray-200 hover:border-gray-300 rounded-lg bg-white hover:bg-gray-50 shadow-sm">
              {wagmiAddress ? (
                <div className="flex items-center gap-3 w-full">
                  <Identity address={wagmiAddress}>
                    <OnchainAvatar chain={base} className="h-8 w-8 ring-2 ring-blue-100" />
                  </Identity>
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <div className="flex items-center gap-1 w-full">
                      <OnchainName 
                        address={wagmiAddress}
                        chain={base}
                        className="text-sm font-semibold text-gray-800 max-w-[200px] truncate leading-tight"
                      >
                        <OnchainBadge />
                      </OnchainName>
                    </div>
                    <span className="text-xs font-medium text-blue-600 max-w-[250px] truncate leading-tight">
                      {wagmiAddress.slice(0, 5)}...{wagmiAddress.slice(-6)}
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <Avatar className="h-8 w-8 ring-2 ring-blue-100">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-800 leading-tight">
                      {customMessages.connected || 'Connected'}
                    </span>
                    <span className="text-xs font-medium text-blue-600 leading-tight">
                      Wallet Active
                    </span>
                  </div>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            {/* <DropdownMenuItem className="p-4 focus:bg-gray-50">
              {wagmiAddress ? (
                <Identity address={wagmiAddress}>
                  <div className="flex items-center gap-3 w-full">
                    <OnchainAvatar chain={base} className="h-10 w-10" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <OnchainName 
                        address={wagmiAddress}
                        chain={base}
                        className="font-semibold text-gray-900 truncate"
                      >
                        <OnchainBadge />
                      </OnchainName>
                      <span className="text-xs text-blue-600 truncate">
                        {wagmiAddress.slice(0, 5)}...{wagmiAddress.slice(-6)}
                      </span>
                      <span className="text-xs text-green-600 mt-1">
                        {isSignedIn ? 'CDP Smart Account' : 'Browser Wallet'}
                      </span>
                    </div>
                  </div>
                </Identity>
              ) : (
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">✅ Wallet Connected</span>
                  <span className="text-xs text-gray-600">
                    {isSignedIn ? 'CDP Smart Account' : 'Browser Wallet'}
                  </span>
                </div>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator /> */}
            <DropdownMenuItem 
              onClick={handleSignOut}
              disabled={isLoading}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoading ? (customMessages.connecting || 'Disconnecting...') : 'Disconnect'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {error && (
          <div className="absolute top-16 right-4 bg-red-50 border border-red-200 rounded-lg p-2 z-50">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Button 
      variant="default" 
      className="h-9 px-4"
      onClick={() => window.location.href = connectPageUrl}
    >
      {customMessages.connectWallet || 'Connect Wallet'}
    </Button>
  );
}

function UnifiedAuthFull({ 
  onAuthSuccess, 
  config 
}: { 
  onAuthSuccess?: () => void;
  config: UnifiedAuthProps['config'];
}) {
  const { isInitialized } = useIsInitialized();
  const { isSignedIn } = useIsSignedIn();
  const { address: wagmiAddress } = useAccount();
  const { connect, connectors, isPending, error: connectError } = useConnect();
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cdpAuthButtonRef = useRef<HTMLDivElement>(null);

  const isConnected = isSignedIn || !!wagmiAddress;

  // Track if this is initial mount to prevent auto-redirect on page load
  const [isInitialMount, setIsInitialMount] = useState(true);

  const {
    customMessages = {},
    excludeConnectors = ['cdpEmbeddedWallet', 'cdp-embedded-wallet', 'walletConnect'],
  } = config || {};
  
  useEffect(() => {
    setIsInitialMount(false);
  }, []);
  
  // Trigger success callback when wallet connects (but not on initial mount if already connected)
  useEffect(() => {
    if (wagmiAddress && onAuthSuccess && !isInitialMount) {
      // Only trigger callback if user actually connected during this session
      const timeoutId = setTimeout(() => {
        onAuthSuccess();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [wagmiAddress, onAuthSuccess, isInitialMount]);

  const handleCDPAuthSuccess = () => {
    console.log('CDP auth successful!');
    onAuthSuccess?.();
  };

  const handleCustomCDPClick = () => {
    // Find and click the actual CDP AuthButton
    if (cdpAuthButtonRef.current) {
      const cdpButton = cdpAuthButtonRef.current.querySelector('button');
      if (cdpButton) {
        cdpButton.click();
      }
    }
  };

  const handleWalletConnect = async (connectorId: string) => {
    try {
      setConnectionState('connecting');
      setErrorMessage(null);
      
      const connector = connectors.find(c => c.id === connectorId);
      if (!connector) {
        throw new Error('Connector not found');
      }

      connect({ connector });
      // Success callback will be triggered by the useEffect when wagmiAddress changes
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setErrorMessage(error?.message || 'Failed to connect wallet');
      setConnectionState('error');
    } finally {
      setConnectionState('idle');
    }
  };

  // Get available wallet connectors (excluding CDP embedded wallet and specific wallets)
  const walletConnectors = connectors.filter(connector => 
    !excludeConnectors.includes(connector.id) &&
    connector.id !== 'io.metamask' &&
    connector.id !== 'app.phantom'
  );

  if (!isInitialized) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-600">
                {customMessages.connected || 'Connected!'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isSignedIn ? 'CDP Smart Account Ready' : 'Browser Wallet Connected'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold">
          {customMessages.connectWallet || 'Connect Your Wallet'}
        </CardTitle>
        <CardDescription>
          {customMessages.chooseConnection || "Choose how you'd like to connect to ULink"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* CDP Social Login */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Mail className="w-4 h-4" />
            <Phone className="w-4 h-4" />
            <span>{customMessages.signInEmail || 'Sign in with Email or Phone'}</span>
          </div>
          
          {/* Custom CDP Button */}
          <Button 
            onClick={handleCustomCDPClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            {customMessages.signInEmail || 'Sign in with Email or Phone'}
          </Button>
          
          {/* Hidden CDP AuthButton */}
          <div ref={cdpAuthButtonRef} className="opacity-0 pointer-events-none absolute -z-10">
            <AuthButton onSignInSuccess={handleCDPAuthSuccess} />
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            {customMessages.cdpDescription || 'Creates a gasless Smart Account - no browser extension needed'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">OR</span>
          <Separator className="flex-1" />
        </div>

        {/* Browser Wallets */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Wallet className="w-4 h-4" />
            <span>{customMessages.connectBrowser || 'Connect Browser Wallet'}</span>
          </div>
          
          <div className="space-y-2">
            {walletConnectors.map((connector) => (
              <Button
                key={connector.id}
                variant="outline"
                className={`w-full flex items-center justify-center gap-2 border-2 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 ${
                  connector.id === 'injected' 
                    ? 'border-orange-200 hover:border-orange-300 hover:bg-orange-50' 
                    : 'border-blue-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
                onClick={() => handleWalletConnect(connector.id)}
                disabled={connectionState === 'connecting' || isPending}
              >
                {connector.id === 'injected' && <Wallet className="w-4 h-4 text-orange-600" />}
                {connector.id === 'coinbaseWallet' && <div className="w-4 h-4 bg-blue-600 rounded-full" />}
                <span className={
                  connector.id === 'injected' 
                    ? 'text-orange-700 font-medium' 
                    : 'text-blue-700 font-medium'
                }>
                  {connector.id === 'injected' ? 'Browser Wallet' : 
                   connector.id === 'coinbaseWallet' ? 'Coinbase Wallet' : 
                   connector.name}
                </span>
                {connectionState === 'connecting' && (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
              </Button>
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            {customMessages.browserDescription || 'Connect your existing wallet (MetaMask, Coinbase Wallet, etc.)'}
          </p>
        </div>

        {/* Error Message */}
        {(errorMessage || connectError) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              {errorMessage || connectError?.message || 'Connection failed'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}