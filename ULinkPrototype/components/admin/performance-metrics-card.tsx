import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Metric = {
  title: string
  value: string
  icon: LucideIcon
}

export function PerformanceMetricsCard({ metrics }: { metrics: Metric[] }) {
  return (
    <Card className="bg-white/60 backdrop-blur-lg border-silver-200/50">
      <CardHeader>
        <CardTitle className="text-lg font-display">🚀 Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {metrics.map((metric) => (
            <li key={metric.title} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <metric.icon className="h-4 w-4 text-text-secondary" />
                <span className="text-text-secondary">{metric.title}</span>
              </div>
              <span className="font-medium text-text-primary">{metric.value}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
