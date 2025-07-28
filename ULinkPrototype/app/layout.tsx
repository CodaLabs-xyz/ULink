import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import localFont from "next/font/local"
import "./globals.css"
import { cn } from "@/lib/utils"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const fontDisplay = localFont({
  src: "../public/fonts/CalSans-SemiBold.woff",
  variable: "--font-cal-sans",
  weight: "600",
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
        {children}
      </body>
    </html>
  )
}
