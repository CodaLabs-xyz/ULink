'use client';

import { useConnect, useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';

export function DebugWallet() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;
  if (!mounted) return <div>Loading debug info...</div>;

  return <DebugWalletContent />;
}

function DebugWalletContent() {
  try {
    const { connectors, isPending, error } = useConnect();
    const { address, isConnected, isConnecting, isReconnecting } = useAccount();

    return (
      <Card className="mt-4 border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-sm text-amber-800">🐛 Wallet Debug Info</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div>
            <strong>Account Status:</strong>
            <ul className="ml-4 list-disc">
              <li>Connected: {isConnected ? '✅' : '❌'}</li>
              <li>Connecting: {isConnecting ? '⏳' : '❌'}</li>
              <li>Reconnecting: {isReconnecting ? '🔄' : '❌'}</li>
              <li>Address: {address ? `${address.slice(0, 8)}...` : 'None'}</li>
            </ul>
          </div>
          <div>
            <strong>Connect Status:</strong>
            <ul className="ml-4 list-disc">
              <li>Pending: {isPending ? '⏳' : '❌'}</li>
              <li>Error: {error ? error.message : 'None'}</li>
            </ul>
          </div>
          <div>
            <strong>Available Connectors ({connectors.length}):</strong>
            <ul className="ml-4 list-disc">
              {connectors.map((connector) => (
                <li key={connector.id}>
                  {connector.name} (ID: {connector.id})
                </li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Environment:</strong>
            <ul className="ml-4 list-disc">
              <li>WC Project ID: {process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ? '✅' : '❌'}</li>
              <li>OnchainKit API: {process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY ? '✅' : '❌'}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  } catch (error) {
    return (
      <Card className="mt-4 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-sm text-red-800">❌ Wallet Debug Error</CardTitle>
        </CardHeader>
        <CardContent className="text-xs">
          <pre className="text-red-600">{String(error)}</pre>
        </CardContent>
      </Card>
    );
  }
}