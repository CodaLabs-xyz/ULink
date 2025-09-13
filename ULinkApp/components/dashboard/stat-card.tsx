import type React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type StatCardProps = {
  title: string
  value: string
  icon: LucideIcon
  change?: string
  changeType?: "increase" | "decrease"
  tier: "Silver" | "Platinum" | "Gold"
  children?: React.ReactNode
}

const tierStyles: { [key: string]: { border: string; iconBg: string; iconText: string } } = {
  Silver: {
    border: "border-silver-300",
    iconBg: "bg-silver-100",
    iconText: "text-silver-600",
  },
  Platinum: {
    border: "border-platinum-300",
    iconBg: "bg-platinum-100",
    iconText: "text-platinum-600",
  },
  Gold: {
    border: "border-gold-300",
    iconBg: "bg-gold-100",
    iconText: "text-gold-600",
  },
}

export function StatCard({ title, value, icon: Icon, change, changeType, tier, children }: StatCardProps) {
  const styles = tierStyles[tier]

  return (
    <div
      className={cn(
        "rounded-2xl border p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        "bg-white/60 backdrop-blur-lg",
        styles.border,
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", styles.iconBg)}>
          <Icon className={cn("h-5 w-5", styles.iconText)} />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-text-primary">{value}</p>
        {change && (
          <p
            className={cn(
              "text-sm",
              changeType === "increase"
                ? "text-green-600"
                : changeType === "decrease"
                  ? "text-red-600"
                  : "text-text-secondary",
            )}
          >
            {change}
          </p>
        )}
        {children}
      </div>
    </div>
  )
}
