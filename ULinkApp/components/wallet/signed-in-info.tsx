'use client';

import { useCurrentUser, useEvmAddress, useIsSignedIn } from '@coinbase/cdp-hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, User, Wallet, Shield } from 'lucide-react';
import { useState } from 'react';

export function SignedInInfo() {
  const { isSignedIn } = useIsSignedIn();
  const { currentUser } = useCurrentUser();
  const { evmAddress } = useEvmAddress();
  const [copied, setCopied] = useState(false);

  if (!isSignedIn || !currentUser) {
    return null;
  }

  const copyAddress = async () => {
    if (evmAddress) {
      await navigator.clipboard.writeText(evmAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="w-full max-w-md border-green-200 bg-green-50">
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-lg font-bold text-green-800 flex items-center justify-center gap-2">
          <Shield className="h-5 w-5" />
          Connected Successfully
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-green-600" />
            <span className="font-medium">User ID:</span>
            <Badge variant="secondary" className="text-xs">
              {currentUser.id?.slice(0, 8)}...
            </Badge>
          </div>
          
          {evmAddress && (
            <div className="flex items-center gap-2 text-sm">
              <Wallet className="h-4 w-4 text-green-600" />
              <span className="font-medium">Wallet:</span>
              <div className="flex items-center gap-1">
                <code className="text-xs bg-white px-2 py-1 rounded border">
                  {formatAddress(evmAddress)}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-green-100"
                  onClick={copyAddress}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Success Features */}
        <div className="bg-white rounded-lg p-3 border border-green-200">
          <div className="text-xs text-green-700 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Smart Account created with gasless transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Self-custodial wallet - you own your assets</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Social recovery enabled for account security</span>
            </div>
          </div>
        </div>

        {/* External Links */}
        {evmAddress && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => window.open(`https://basescan.org/address/${evmAddress}`, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View on BaseScan
            </Button>
          </div>
        )}

        {copied && (
          <div className="text-center text-xs text-green-600 font-medium">
            Address copied to clipboard!
          </div>
        )}

        {/* Development Info */}
        {process.env.NODE_ENV === 'development' && (
          <details className="text-xs">
            <summary className="text-gray-500 cursor-pointer">Debug Info</summary>
            <div className="mt-2 p-2 bg-gray-100 rounded text-gray-600">
              <div>User: {JSON.stringify(currentUser, null, 2)}</div>
              <div>Address: {evmAddress}</div>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}