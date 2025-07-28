import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StatCardProps = {
  title: string
  value: string
  icon: LucideIcon
  change?: string
  changeType?: "increase" | "decrease"
}

export function StatCard({ title, value, icon: Icon, change, changeType }: StatCardProps) {
  return (
    <Card className="bg-white/60 backdrop-blur-lg border-silver-200/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-text-secondary">{title}</CardTitle>
        <Icon className="h-4 w-4 text-text-secondary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p
          className={cn(
            "text-xs",
            changeType === "increase" ? "text-green-600" : "text-red-600",
            !changeType && "text-text-secondary",
          )}
        >
          {change}
        </p>
      </CardContent>
    </Card>
  )
}
