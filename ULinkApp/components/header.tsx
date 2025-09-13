import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ULinkLogo } from "@/components/ulink-logo"

export function Header() {
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
          <Link
            href="/dashboard"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-primary-600"
          >
            Dashboard
          </Link>
          <Link
            href="/admin"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-primary-600"
          >
            Admin
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            Login
          </Button>
          <Button size="sm" className="bg-primary-600 hover:bg-primary-700">
            Sign Up
          </Button>
        </div>
      </div>
    </header>
  )
}
