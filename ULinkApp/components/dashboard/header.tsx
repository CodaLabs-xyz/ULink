import Link from "next/link"
import Image from "next/image"
import { Bell, Wallet } from "lucide-react"
import { ULinkLogo } from "@/components/ulink-logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type User = {
  name: string
  avatarUrl: string
  subscriptionTier: string
  walletAddress: string
}

const tierColors: { [key: string]: string } = {
  Gold: "bg-gold-400 text-gold-900 border-gold-500",
  Silver: "bg-platinum-300 text-platinum-600 border-platinum-400",
  Free: "bg-silver-200 text-silver-600 border-silver-300",
}

export function Header({ user }: { user: User }) {
  const truncateAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

  return (
    <header className="sticky top-0 z-50 w-full border-b border-silver-200 bg-white/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <ULinkLogo className="h-8 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-full border border-silver-300 bg-white px-3 py-1.5 text-sm md:flex">
            <Wallet className="h-4 w-4 text-silver-500" />
            <span className="font-mono text-text-secondary">{truncateAddress(user.walletAddress)}</span>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Image
              src={user.avatarUrl || "/placeholder.svg"}
              alt={user.name}
              width={32}
              height={32}
              className="rounded-full border-2 border-white"
            />
            <div className="hidden flex-col items-start text-sm sm:flex">
              <span className="font-semibold text-text-primary">{user.name}</span>
              <span
                className={cn(
                  "text-xs font-bold px-1.5 py-0.5 rounded-full border",
                  tierColors[user.subscriptionTier] || tierColors.Free,
                )}
              >
                {user.subscriptionTier}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
