'use client';

import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, DollarSign, Wallet, CheckCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FundButton, getOnrampBuyUrl } from '@coinbase/onchainkit/fund';

/**
 * A component that provides wallet funding using OnchainKit's FundButton
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
  const [fundingUrl, setFundingUrl] = useState<string>('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const getChainName = (chainId?: number) => {
    switch (chainId) {
      case 84532: return 'Base Sepolia';
      case 8453: return 'Base';
      case 1: return 'Ethereum';
      default: return `Chain ${chainId}`;
    }
  };

  // Generate onramp URL using session token approach
  useEffect(() => {
    if (!address) return;
    
    const generateFundingUrl = async () => {
      setIsLoadingUrl(true);
      setError(null);
      
      try {
        console.log('Generating session token for address:', address);

        // Get session token from our API
        const response = await fetch('/api/onramp/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            addresses: [{
              address: address,
              blockchains: ['base']
            }],
            assets: ['ETH', 'USDC']
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || errorData.error || 'Failed to create session token');
        }

        const { token: sessionToken } = await response.json();
        console.log('Session token received, generating URL...');

        // Use OnchainKit's getOnrampBuyUrl with sessionToken
        const onrampUrl = getOnrampBuyUrl({
          sessionToken: sessionToken,
          presetFiatAmount: 20,
          fiatCurrency: 'USD',
          defaultAsset: 'USDC'
          // No redirectUrl - let popup handle completion naturally
        });

        console.log('Generated funding URL:', onrampUrl);
        setFundingUrl(onrampUrl);
        
      } catch (err) {
        console.error('Failed to generate funding URL:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoadingUrl(false);
      }
    };

    generateFundingUrl();
  }, [address]);


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
                {getChainName(chainId)}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Buy USDC instantly with your credit card or bank account
              </p>
              
              {error && (
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Error:</strong> {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="w-full">
                {isLoadingUrl ? (
                  <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm text-gray-600">Preparing funding...</span>
                  </div>
                ) : fundingUrl ? (
                  <FundButton 
                    fundingUrl={fundingUrl}
                    openIn="popup"
                    onPopupClose={() => {
                      console.log('🎉 Funding popup closed - showing success message');
                      setShowSuccess(true);
                    }}
                  >
                    Buy USDC
                  </FundButton>
                ) : (
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <span className="text-sm text-gray-600">Unable to load funding options</span>
                  </div>
                )}
              </div>
            </div>
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
      
      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
          <strong>Debug:</strong> ChainID: {chainId}, Network: {getChainName(chainId)}, 
          CDP_ENV: {process.env.NEXT_PUBLIC_CDP_ENVIRONMENT || 'not set'}, 
          App URL: {process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-white max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-xl text-green-800">Transaction Completed!</CardTitle>
              <CardDescription>
                Your USDC purchase has been processed. The funds should appear in your wallet shortly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Asset Purchased</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">USDC</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Network</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">Base</Badge>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => {
                    setShowSuccess(false);
                    onSuccess?.();
                  }}
                  className="flex-1"
                >
                  Continue to App
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowSuccess(false)}
                  className="px-3"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}