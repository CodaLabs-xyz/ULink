'use client';

import { useState, useEffect } from 'react';
import { useConnect, useAccount } from 'wagmi';
import { useSignInWithEmail, useVerifyEmailOTP, useCurrentUser } from '@coinbase/cdp-hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Smartphone, Wallet, Chrome, ArrowRight } from 'lucide-react';

export function SocialLogin() {
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

  return <SocialLoginContent />;
}

function SocialLoginContent() {
  try {
    const { connect, connectors, isPending, error } = useConnect();
    const { isConnected } = useAccount();
    const [isConnecting, setIsConnecting] = useState(false);
    const [activeConnector, setActiveConnector] = useState<string | null>(null);
    
    // CDP Email Authentication
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [cdpError, setCdpError] = useState<string | null>(null);
    
    // CDP Hooks
    const { signInWithEmail } = useSignInWithEmail();
    const { verifyEmailOTP } = useVerifyEmailOTP();
    const { currentUser } = useCurrentUser();
    
    const [isEmailPending, setIsEmailPending] = useState(false);
    const [isOtpPending, setIsOtpPending] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [otpError, setOtpError] = useState<string | null>(null);

    if (isConnected || currentUser) {
      return (
        <Card className="w-full max-w-md border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <div className="text-green-600 mb-2">✅ Wallet Connected</div>
            <p className="text-sm text-green-700">You're ready to use ULink!</p>
          </CardContent>
        </Card>
      );
    }

    const handleConnect = async (connectorId: string) => {
      try {
        setIsConnecting(true);
        setActiveConnector(connectorId);
        
        const connector = connectors.find(c => c.id === connectorId);
        if (connector) {
          console.log('Connecting with:', connector.name);
          await connect({ connector });
        }
      } catch (err) {
        console.error('Connection error:', err);
      } finally {
        setIsConnecting(false);
        setActiveConnector(null);
      }
    };

    const handleEmailSignIn = async () => {
      if (!email) return;
      
      try {
        setIsEmailPending(true);
        setEmailError(null);
        setCdpError(null);
        console.log('Signing in with email:', email);
        
        await signInWithEmail({ email });
        console.log('Email sent successfully');
        setShowOtpInput(true);
      } catch (error: any) {
        console.error('Email sign-in error:', error);
        const errorMessage = error?.message || 'Failed to send verification email';
        setEmailError(errorMessage);
        setCdpError(errorMessage);
      } finally {
        setIsEmailPending(false);
      }
    };

    const handleOtpVerification = async () => {
      if (!email || !otp) return;
      
      try {
        setIsOtpPending(true);
        setOtpError(null);
        setCdpError(null);
        console.log('Verifying OTP:', otp);
        
        await verifyEmailOTP({ email, otp });
        console.log('OTP verified successfully');
        // User should be signed in now
      } catch (error: any) {
        console.error('OTP verification error:', error);
        const errorMessage = error?.message || 'Invalid verification code';
        setOtpError(errorMessage);
        setCdpError(errorMessage);
      } finally {
        setIsOtpPending(false);
      }
    };

    // Find specific connectors
    const cdpConnector = connectors.find(c => c.id.includes('cdp') || c.name.includes('CDP'));
    const coinbaseConnector = connectors.find(c => c.id === 'coinbaseWalletSDK');
    const injectedConnector = connectors.find(c => c.id === 'injected');
    const walletConnectConnector = connectors.find(c => c.id === 'walletConnect');

    const isConnectorPending = (connectorId: string) => {
      if (connectorId === 'email') return isEmailPending;
      if (connectorId === 'otp') return isOtpPending;
      return (isPending || isConnecting) && activeConnector === connectorId;
    };

    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">Connect to ULink</CardTitle>
          <p className="text-sm text-gray-600">
            Choose how you'd like to connect your wallet
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email Authentication (Recommended) */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Login (Recommended)
            </h3>
            
            {!showOtpInput ? (
              // Email Input
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isConnecting}
                  />
                </div>
                <Button
                  variant="default"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleEmailSignIn}
                  disabled={!email || isEmailPending}
                >
                  {isEmailPending ? (
                    'Sending verification...'
                  ) : (
                    <>
                      Continue with Email
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  We'll send you a verification code
                </p>
              </div>
            ) : (
              // OTP Input
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm">Verification code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={isConnecting}
                    maxLength={6}
                  />
                </div>
                <Button
                  variant="default"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleOtpVerification}
                  disabled={!otp || isOtpPending}
                >
                  {isOtpPending ? (
                    'Verifying...'
                  ) : (
                    'Verify & Connect'
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setShowOtpInput(false);
                    setOtp('');
                  }}
                  disabled={isEmailPending || isOtpPending}
                >
                  ← Back to email
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Sent to {email}
                </p>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* CDP Connector Fallback */}
          {cdpConnector && (
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleConnect(cdpConnector.id)}
                disabled={isPending || isConnecting}
              >
                {isConnectorPending(cdpConnector.id) ? (
                  'Connecting...'
                ) : (
                  <>
                    <Chrome className="mr-2 h-4 w-4" />
                    CDP Wallet Connector
                  </>
                )}
              </Button>
            </div>
          )}

          <Separator className="my-4" />

          {/* Traditional Wallet Options */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Wallet Apps
            </h3>
            
            {/* Coinbase Wallet */}
            {coinbaseConnector && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleConnect(coinbaseConnector.id)}
                disabled={isPending || isConnecting}
              >
                {isConnectorPending(coinbaseConnector.id) ? (
                  'Connecting...'
                ) : (
                  <>
                    <div className="mr-2 h-4 w-4 bg-blue-600 rounded-full"></div>
                    Coinbase Wallet
                  </>
                )}
              </Button>
            )}

            {/* Browser Wallet */}
            {injectedConnector && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleConnect(injectedConnector.id)}
                disabled={isPending || isConnecting}
              >
                {isConnectorPending(injectedConnector.id) ? (
                  'Connecting...'
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Browser Wallet
                  </>
                )}
              </Button>
            )}

            {/* WalletConnect */}
            {walletConnectConnector && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleConnect(walletConnectConnector.id)}
                disabled={isPending || isConnecting}
              >
                {isConnectorPending(walletConnectConnector.id) ? (
                  'Connecting...'
                ) : (
                  <>
                    <Smartphone className="mr-2 h-4 w-4" />
                    WalletConnect
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Error Display */}
          {(error || cdpError || emailError || otpError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-600">
                {error?.message || cdpError || emailError?.message || otpError?.message}
              </p>
            </div>
          )}

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="text-xs text-gray-500 cursor-pointer">
                Debug Info ({connectors.length} connectors)
              </summary>
              <div className="mt-2 text-xs text-gray-400 space-y-1">
                <div>CDP User: {currentUser ? 'Authenticated' : 'Not authenticated'}</div>
                <div>Is Connected: {isConnected ? 'Yes' : 'No'}</div>
                <div>Email Pending: {isEmailPending ? 'Yes' : 'No'}</div>
                <div>OTP Pending: {isOtpPending ? 'Yes' : 'No'}</div>
                {connectors.map((connector) => (
                  <div key={connector.id}>
                    {connector.name} ({connector.id})
                  </div>
                ))}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    );
  } catch (error) {
    return (
      <Card className="w-full max-w-md border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <div className="text-red-600 mb-2">❌ Connection Error</div>
          <p className="text-xs text-red-700">
            {String(error)}
          </p>
        </CardContent>
      </Card>
    );
  }
}