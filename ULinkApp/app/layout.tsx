import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Web3Provider } from '@/providers/web3-provider'

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

// Using Inter as display font since CalSans is not available
const fontDisplay = Inter({
  subsets: ["latin"],
  variable: "--font-cal-sans",
  weight: ["600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "ULink - Your Links, Beautifully Organized",
  description:
    "Create stunning link hubs with powerful analytics and Web3 integration. ULink is the all-in-one solution for creators and businesses.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable, fontDisplay.variable)}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}
