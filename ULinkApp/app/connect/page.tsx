'use client';

import { CDPAuthentication } from '@/components/wallet/cdp-auth';
import { SignedInInfo } from '@/components/wallet/signed-in-info';
import { WalletInfo } from '@/components/wallet/wallet-info';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ConnectPage() {
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

        {/* CDP Authentication Component */}
        <div className="flex justify-center">
          <CDPAuthentication />
        </div>

        {/* Connected State */}
        <div className="flex justify-center">
          <SignedInInfo />
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

        {/* CTA */}
        <div className="text-center">
          <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Link href="/dashboard">
              Continue to Dashboard →
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}