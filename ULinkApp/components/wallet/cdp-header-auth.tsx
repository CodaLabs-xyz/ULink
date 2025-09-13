'use client';

import { useIsInitialized, useIsSignedIn, useSignOut } from '@coinbase/cdp-hooks';
import { AuthButton } from '@coinbase/cdp-react/components/AuthButton';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function CDPHeaderAuth() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return <CDPHeaderAuthContent />;
}

function CDPHeaderAuthContent() {
  const { isInitialized } = useIsInitialized();
  const { isSignedIn } = useIsSignedIn();
  const { signOut } = useSignOut();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Debug logs for development
  if (process.env.NODE_ENV === 'development') {
    console.log('CDP Header Auth State:', { isInitialized, isSignedIn });
  }

  const handleSignInSuccess = () => {
    console.log('Header sign-in successful!');
    setError(null);
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      setError(null);
    } catch (error: any) {
      console.error('Header sign out error:', error);
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

  if (isSignedIn) {
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
              <span className="text-sm font-medium">Wallet Connected</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="text-green-600">
              <div className="flex flex-col">
                <span className="font-medium">✅ Wallet Connected</span>
                <span className="text-xs text-muted-foreground">Ready to use ULink!</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut}
              disabled={isLoading}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoading ? 'Signing out...' : 'Sign Out'}
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
    <div className="flex items-center">
      {/* Compact AuthButton for header */}
      <div className="[&>*]:text-sm [&>*]:h-9">
        <AuthButton onSignInSuccess={handleSignInSuccess} />
      </div>
    </div>
  );
}