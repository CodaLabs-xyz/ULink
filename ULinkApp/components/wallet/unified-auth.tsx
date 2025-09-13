'use client';

import { useIsInitialized, useIsSignedIn, useSignOut } from '@coinbase/cdp-hooks';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import { LogOut, User, Mail, Phone, Wallet } from 'lucide-react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UnifiedAuthProps {
  onAuthSuccess?: () => void;
  variant?: 'header' | 'full';
}

export function UnifiedAuth({ onAuthSuccess, variant = 'full' }: UnifiedAuthProps) {
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

  return variant === 'header' ? <UnifiedAuthHeader onAuthSuccess={onAuthSuccess} /> : <UnifiedAuthFull onAuthSuccess={onAuthSuccess} />;
}

function UnifiedAuthHeader({ onAuthSuccess }: { onAuthSuccess?: () => void }) {
  const { isInitialized } = useIsInitialized();
  const { isSignedIn } = useIsSignedIn();
  const { signOut } = useSignOut();
  const { address: wagmiAddress } = useAccount();
  const { disconnect } = useDisconnect();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isConnected = isSignedIn || !!wagmiAddress;

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
            <Button variant="ghost" className="flex items-center gap-2 h-9 px-3">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-primary-100 text-primary-600 text-xs">
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">Connected</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="text-green-600">
              <div className="flex flex-col">
                <span className="font-medium">✅ Wallet Connected</span>
                <span className="text-xs text-muted-foreground">
                  {isSignedIn ? 'CDP Smart Account' : 'Browser Wallet'}
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut}
              disabled={isLoading}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoading ? 'Disconnecting...' : 'Disconnect'}
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" className="h-9 px-4">
          Connect Wallet
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-4">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-medium text-sm">Connect Your Wallet</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Choose how you'd like to connect
            </p>
          </div>
          
          {/* CDP Social Login */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Mail className="w-3 h-3" />
              <Phone className="w-3 h-3" />
              <span>Email or Phone</span>
            </div>
            <div className="[&>*]:w-full [&>*]:text-sm [&>*]:h-8">
              <AuthButton onSignInSuccess={onAuthSuccess} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>

          {/* Browser Wallets */}
          <HeaderWalletOptions onSuccess={onAuthSuccess} />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function HeaderWalletOptions({ onSuccess }: { onSuccess?: () => void }) {
  const { connect, connectors, isPending, error: connectError } = useConnect();
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleWalletConnect = async (connectorId: string) => {
    try {
      setConnectionState('connecting');
      setErrorMessage(null);
      
      const connector = connectors.find(c => c.id === connectorId);
      if (!connector) {
        throw new Error('Connector not found');
      }

      await connect({ connector });
      onSuccess?.();
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setErrorMessage(error?.message || 'Failed to connect wallet');
      setConnectionState('error');
    } finally {
      setConnectionState('idle');
    }
  };

  // Get available wallet connectors (excluding CDP embedded wallet)
  const walletConnectors = connectors.filter(connector => 
    connector.id !== 'cdpEmbeddedWallet' && 
    connector.id !== 'cdp-embedded-wallet' && 
    connector.id !== 'io.metamask' && 
    connector.id !== 'app.phantom' && 
    connector.id !== 'walletConnect' // Hide WalletConnect for now
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Wallet className="w-3 h-3" />
        <span>Browser Wallets *</span>
      </div>
      
      <div className="space-y-1">
        {walletConnectors.map((connector) => (
          <Button
            key={connector.id}
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs flex items-center justify-center gap-2"
            onClick={() => handleWalletConnect(connector.id)}
            disabled={connectionState === 'connecting' || isPending}
          >
            {connector.id === 'injected' && <Wallet className="w-3 h-3" />}
            {connector.id === 'coinbaseWallet' && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
            <span>
              {connector.id === 'injected' ? 'Browser Wallet' : 
               connector.id === 'coinbaseWallet' ? 'Coinbase Wallet' : 
               connector.name }
            </span>
            {connectionState === 'connecting' && (
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
          </Button>
        ))}
      </div>
      
      {/* Error Message */}
      {(errorMessage || connectError) && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
          {errorMessage || connectError?.message || 'Connection failed'}
        </div>
      )}
    </div>
  );
}

function UnifiedAuthFull({ onAuthSuccess }: { onAuthSuccess?: () => void }) {
  const { isInitialized } = useIsInitialized();
  const { isSignedIn } = useIsSignedIn();
  const { address: wagmiAddress } = useAccount();
  const { connect, connectors, isPending, error: connectError } = useConnect();
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isConnected = isSignedIn || !!wagmiAddress;

  const handleCDPAuthSuccess = () => {
    console.log('CDP auth successful!');
    onAuthSuccess?.();
  };

  const handleWalletConnect = async (connectorId: string) => {
    try {
      setConnectionState('connecting');
      setErrorMessage(null);
      
      const connector = connectors.find(c => c.id === connectorId);
      if (!connector) {
        throw new Error('Connector not found');
      }

      await connect({ connector });
      onAuthSuccess?.();
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setErrorMessage(error?.message || 'Failed to connect wallet');
      setConnectionState('error');
    } finally {
      setConnectionState('idle');
    }
  };

  // Get available wallet connectors (excluding CDP embedded wallet)
  const walletConnectors = connectors.filter(connector => 
    connector.id !== 'cdpEmbeddedWallet' && 
    connector.id !== 'walletConnect' // Hide WalletConnect for now as it requires more setup
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
              <h3 className="text-lg font-semibold text-green-600">Connected!</h3>
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
        <CardTitle className="text-xl font-bold">Connect Your Wallet</CardTitle>
        <CardDescription>
          Choose how you'd like to connect to ULink
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* CDP Social Login */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Mail className="w-4 h-4" />
            <Phone className="w-4 h-4" />
            <span>Sign in with Email or Phone</span>
          </div>
          <div className="[&>*]:w-full">
            <AuthButton onSignInSuccess={handleCDPAuthSuccess} />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Creates a gasless Smart Account - no browser extension needed
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
            <span>Connect Browser Wallet</span>
          </div>
          
          <div className="space-y-2">
            {walletConnectors.map((connector) => (
              <Button
                key={connector.id}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => handleWalletConnect(connector.id)}
                disabled={connectionState === 'connecting' || isPending}
              >
                {connector.id === 'injected' && <Wallet className="w-4 h-4" />}
                {connector.id === 'coinbaseWallet' && <div className="w-4 h-4 bg-blue-600 rounded-full" />}
                <span>
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
            Connect your existing wallet (MetaMask, Coinbase Wallet, etc.)
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