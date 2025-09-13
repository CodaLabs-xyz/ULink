'use client';

import { WalletConnect } from '@/components/wallet/connect-wallet';
import { WalletInfo } from '@/components/wallet/wallet-info';
import { DebugWallet } from '@/components/wallet/debug-wallet';
import { SocialLogin } from '@/components/wallet/social-login';
import { CDPAuthentication } from '@/components/wallet/cdp-auth';
import { SignedInInfo } from '@/components/wallet/signed-in-info';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">🔧 Wallet Debug Page</h1>
          <Link href="/connect">
            <Button>Social Login Page</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Legacy Components */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Legacy Components</h2>
            <div className="flex gap-4">
              <WalletInfo />
              <WalletConnect />
            </div>
          </div>
          
          {/* Social Login Component */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Custom Social Login</h2>
            <SocialLogin />
          </div>
          
          {/* CDP Authentication Component */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">CDP Authentication</h2>
            <CDPAuthentication />
          </div>
        </div>
        
        {/* Additional Components */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Signed In State</h2>
          <div className="flex justify-center">
            <SignedInInfo />
          </div>
        </div>
        
        <DebugWallet />
      </div>
    </div>
  );
}