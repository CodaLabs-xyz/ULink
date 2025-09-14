'use client';

import { FundModal, type FundModalProps } from "@coinbase/cdp-react";
import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, DollarSign, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { getBuyOptions, createBuyQuote } from "@/lib/onramp-api";

/**
 * A component that wraps the FundModal component for wallet funding
 *
 * @param props - The props for the FundWallet component
 * @param props.onSuccess - The callback function to call when the onramp purchase is successful
 * @returns The FundWallet component
 */
interface FundWalletProps {
  onSuccess?: () => void;
  className?: string;
}

export function FundWallet({ onSuccess, className }: FundWalletProps) {
  const { address, chainId } = useAccount();
  const [showModal, setShowModal] = useState(false);

  const fetchBuyQuote: FundModalProps["fetchBuyQuote"] = useCallback(async params => {
    return createBuyQuote(params);
  }, []);

  const fetchBuyOptions: FundModalProps["fetchBuyOptions"] = useCallback(async params => {
    return getBuyOptions(params);
  }, []);

  const handleSuccess = () => {
    console.log('🎉 Onramp funding successful!');
    setShowModal(false);
    onSuccess?.();
  };

  const getNetworkName = (chainId?: number) => {
    // For onramp, always use 'base' regardless of testnet/mainnet
    // The sandbox/production mode is controlled by CDP_ENVIRONMENT, not network param
    switch (chainId) {
      case 84532: return 'base'; // Base Sepolia testnet uses 'base' for onramp
      case 8453: return 'base';  // Base mainnet
      case 1: return 'ethereum'; // Ethereum mainnet
      default: return 'base';    // Default to Base for onramp compatibility
    }
  };

  if (!address) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Fund Wallet
          </CardTitle>
          <CardDescription>
            Connect your wallet to access funding options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to fund your account with cryptocurrency.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card className="bg-white/60 backdrop-blur-lg border-silver-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Fund Your Wallet</h3>
                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                  SANDBOX
                </Badge>
              </div>
              <p className="text-sm text-gray-600 font-normal">
                Add cryptocurrency to your wallet instantly
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Wallet Address</span>
              <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                {address.slice(0, 8)}...{address.slice(-6)}
              </code>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Network</span>
              <Badge variant="secondary" className="text-xs">
                {getNetworkName(chainId)}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-semibold text-blue-600">$10</div>
                <div className="text-xs text-gray-600">Quick</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-semibold text-blue-600">$25</div>
                <div className="text-xs text-gray-600">Popular</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-semibold text-blue-600">$50</div>
                <div className="text-xs text-gray-600">Value</div>
              </div>
            </div>

            <Button 
              onClick={() => setShowModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Fund Wallet
            </Button>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Sandbox Mode:</strong> This onramp is configured for testing purposes. 
              No real money will be charged. You can test the full purchase flow with mock payments.{' '}
              <a
                href="https://docs.cdp.coinbase.com/onramp-&-offramp/integration/sandbox-testing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Learn more about sandbox testing
              </a>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {showModal && (
        <FundModal
          country="US"
          subdivision="CA"
          cryptoCurrency="eth"
          fiatCurrency="usd"
          fetchBuyQuote={fetchBuyQuote}
          fetchBuyOptions={fetchBuyOptions}
          network={getNetworkName(chainId)}
          presetAmountInputs={[10, 25, 50]}
          onSuccess={handleSuccess}
        />
      )}
      
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
          <strong>Debug:</strong> ChainID: {chainId}, Network: {getNetworkName(chainId)}, 
          CDP_ENV: {process.env.CDP_ENVIRONMENT || 'not set'}
        </div>
      )}
    </div>
  );
}