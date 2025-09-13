'use client';

import { useIsInitialized, useIsSignedIn, useSignOut } from '@coinbase/cdp-hooks';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, Zap, Users, Globe, LogOut } from 'lucide-react';

export function CDPAuthentication() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 rounded mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <CDPAuthenticationClient />;
}

function CDPAuthenticationClient() {
  console.log('[CDPAuthentication] Client component rendering...');
  
  const { isInitialized } = useIsInitialized();
  const { isSignedIn } = useIsSignedIn();
  const { signOut } = useSignOut();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Debug logs for development
  if (process.env.NODE_ENV === 'development') {
    console.log('CDP State:', { isInitialized, isSignedIn });
  }
  
  const handleSignInSuccess = () => {
    console.log('Sign-in successful!');
    setError(null);
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      console.log('Signing out...');
      
      await signOut();
      setError(null);
      
      console.log('Signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      setError(error?.message || 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 rounded mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isSignedIn) {
    return (
      <Card className="w-full max-w-md border-green-200 bg-green-50">
        <CardContent className="p-6 text-center space-y-4">
          <div>
            <div className="text-green-600 mb-2">✅ Wallet Connected</div>
            <p className="text-sm text-green-700">You're ready to use ULink!</p>
          </div>
          
          <Button 
            onClick={handleSignOut}
            disabled={isLoading}
            variant="outline" 
            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            {isLoading ? (
              <>Signing out...</>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </>
            )}
          </Button>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">Connect to ULink</CardTitle>
        <p className="text-sm text-gray-600">
          Sign in with email or phone number to get started
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CDP React AuthButton - handles email and SMS with built-in country selection */}
        <div className="space-y-4">
          <AuthButton onSignInSuccess={handleSignInSuccess} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <Separator className="my-4" />

        {/* Benefits Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Why Connect?
          </h3>
          
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
            <div className="flex items-start gap-2">
              <Zap className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
              <span>Gasless transactions</span>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Self-custodial wallet</span>
            </div>
            <div className="flex items-start gap-2">
              <Users className="h-3 w-3 text-purple-500 mt-0.5 flex-shrink-0" />
              <span>Social recovery</span>
            </div>
            <div className="flex items-start gap-2">
              <Globe className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
              <span>Web3 native</span>
            </div>
          </div>
        </div>

        {/* Smart Account Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Zap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <div className="font-medium mb-1">Smart Account Powered</div>
              <div>
                Your wallet uses smart contracts for better security, gasless transactions, 
                and social recovery features.
              </div>
            </div>
          </div>
        </div>
        
        {/* Debug Section for Development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Info</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Initialized: {isInitialized ? '✅ Yes' : '❌ No'}</div>
              <div>Signed In: {isSignedIn ? '✅ Yes' : '❌ No'}</div>
              <div>Project ID: {process.env.NEXT_PUBLIC_CDP_PROJECT_ID ? '✅ Set' : '❌ Missing'}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}