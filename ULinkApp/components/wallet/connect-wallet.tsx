'use client';

import { useConnect, useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export function WalletConnect() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" className="font-medium" disabled>
        Loading...
      </Button>
    );
  }

  return <WalletConnectContent />;
}

function WalletConnectContent() {
  try {
    const { connect, connectors, isPending, error } = useConnect();
    const { isConnected } = useAccount();
    const [isConnecting, setIsConnecting] = useState(false);

    if (isConnected) return null;

    const handleConnect = async () => {
      try {
        setIsConnecting(true);
        console.log('Available connectors:', connectors.map(c => ({ id: c.id, name: c.name })));
        
        // Try Coinbase Wallet first
        const coinbaseConnector = connectors.find(
          (connector) => connector.id === 'coinbaseWalletSDK'
        );
        
        if (coinbaseConnector) {
          console.log('Using Coinbase Wallet connector');
          await connect({ connector: coinbaseConnector });
        } else if (connectors[0]) {
          console.log('Using first available connector:', connectors[0].name);
          await connect({ connector: connectors[0] });
        } else {
          console.error('No connectors available');
        }
      } catch (err) {
        console.error('Connection error:', err);
      } finally {
        setIsConnecting(false);
      }
    };

    return (
      <div className="flex flex-col gap-2">
        <Button 
          variant="outline" 
          className="font-medium" 
          onClick={handleConnect}
          disabled={isPending || isConnecting}
        >
          {isPending || isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
        {error && (
          <p className="text-xs text-red-600">
            {error.message}
          </p>
        )}
      </div>
    );
  } catch (error) {
    console.error('WalletConnect error:', error);
    return (
      <Button variant="outline" className="font-medium" disabled>
        Wallet Error
      </Button>
    );
  }
}