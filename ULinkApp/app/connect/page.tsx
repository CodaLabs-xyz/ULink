'use client';

import { UnifiedAuth } from '@/components/wallet/unified-auth';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useIsSignedIn } from '@coinbase/cdp-hooks';

export default function ConnectPage() {
  const router = useRouter();
  const { address: wagmiAddress } = useAccount();
  const { isSignedIn } = useIsSignedIn();
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const isAlreadyConnected = isSignedIn || !!wagmiAddress;
  
  // If user is already connected, redirect to dashboard
  useEffect(() => {
    if (isAlreadyConnected && !showSuccess) {
      setIsRedirecting(true);
      router.push('/dashboard');
    }
  }, [isAlreadyConnected, showSuccess, router]);
  
  // Show loading if redirecting
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-blue-600">
                Already Connected! 
              </h1>
              <p className="text-gray-600">
                Redirecting to your dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAuthSuccess = () => {
    setShowSuccess(true);
    
    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup timer on unmount
    return () => clearInterval(timer);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-green-600">
                Successfully Connected! 🎉
              </h1>
              <p className="text-gray-600">
                Welcome to ULink! Redirecting to your dashboard...
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="text-sm text-gray-500">
              Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to ULink
          </h1>
          <p className="text-gray-600">
            Connect your wallet to create beautiful link hubs on Base
          </p>
        </div>

        {/* Unified Authentication Component */}
        <div className="flex justify-center">
          <UnifiedAuth onAuthSuccess={handleAuthSuccess} />
        </div>

        {/* Benefits */}
        <div className="bg-white/60 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
          <h2 className="font-semibold text-gray-800 mb-3">Why connect your wallet?</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              Create and manage your personalized link hubs
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              Prove ownership of your projects on-chain
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              Access advanced analytics and insights
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              Enable Web3-native features and integrations
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}