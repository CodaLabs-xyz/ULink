'use client';

import Link from "next/link"
import { ULinkLogo } from "@/components/ulink-logo"
import { UnifiedAuth } from "@/components/wallet/unified-auth"
import { useAccount } from 'wagmi'
import { useIsSignedIn } from '@coinbase/cdp-hooks'

export function Header() {
  const { address: wagmiAddress } = useAccount();
  const { isSignedIn } = useIsSignedIn();
  
  const isConnected = isSignedIn || !!wagmiAddress;
  const currentAddress = wagmiAddress || '';
  const adminWallet = process.env.NEXT_PUBLIC_ADMIN_WALLET;
  const isAdmin = currentAddress && adminWallet && currentAddress.toLowerCase() === adminWallet.toLowerCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-silver-200 bg-white/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <ULinkLogo className="h-8 w-auto" />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="#features"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-primary-600"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-primary-600"
          >
            Pricing
          </Link>
          {isConnected && (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-text-secondary transition-colors hover:text-primary-600"
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-text-secondary transition-colors hover:text-primary-600"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/profile"
                className="text-sm font-medium text-text-secondary transition-colors hover:text-primary-600"
              >
                Profile
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-4">
          <UnifiedAuth variant="header" />
        </div>
      </div>
    </header>
  )
}
