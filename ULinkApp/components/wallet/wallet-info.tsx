'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';

export function WalletInfo() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <WalletInfoContent />;
}

function WalletInfoContent() {
  try {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();

    if (!address || !isConnected) return null;

    const shortenAddress = (addr: string) => {
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary-100 text-primary-600 text-xs">
              {address.slice(2, 4).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-text-primary">
            {shortenAddress(address)}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => disconnect()}
          className="text-xs text-text-secondary hover:text-text-primary"
        >
          Disconnect
        </Button>
      </div>
    );
  } catch (error) {
    console.error('WalletInfo error:', error);
    return null;
  }
}