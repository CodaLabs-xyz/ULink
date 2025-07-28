"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Wallet } from "lucide-react"

export function DonationCard() {
  const { toast } = useToast()
  const [amount, setAmount] = useState("5")
  const presetAmounts = ["5", "10", "20", "50"]

  const handleDonate = () => {
    // In a real app, you would integrate with a payment provider or wallet here.
    toast({
      title: "Donation Initiated!",
      description: `Thank you for your $${amount} contribution. Please confirm in your wallet.`,
    })
  }

  return (
    <Card className="sticky top-24 bg-white/80 backdrop-blur-lg border-silver-200/80 shadow-lg shadow-silver-500/10">
      <CardHeader>
        <CardTitle className="font-display text-2xl">Support My Work</CardTitle>
        <CardDescription>Your contribution helps me continue creating. Thank you!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {presetAmounts.map((preset) => (
              <Button
                key={preset}
                variant="outline"
                className={cn(amount === preset && "border-primary-500 bg-primary-50 ring-2 ring-primary-500")}
                onClick={() => setAmount(preset)}
              >
                ${preset}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-amount">Or enter a custom amount (USD)</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                $
              </span>
              <Input
                id="custom-amount"
                type="number"
                placeholder="25"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>
          <Button onClick={handleDonate} className="w-full bg-primary-600 hover:bg-primary-700">
            <Wallet className="mr-2 h-4 w-4" />
            Donate with Crypto
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
