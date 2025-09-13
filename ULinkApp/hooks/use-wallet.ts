'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function useWallet() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const isLoading = isConnecting || isReconnecting;

  return {
    address,
    isConnected,
    isLoading,
    connect,
    disconnect,
    connectors,
  };
}