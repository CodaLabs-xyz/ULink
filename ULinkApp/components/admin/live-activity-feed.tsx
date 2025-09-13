import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { UserPlus, CreditCard, BarChart, AlertTriangle, DatabaseBackup } from "lucide-react"

const activityLog = [
  {
    time: "14:32:15",
    icon: UserPlus,
    text: "New user registration: sarah@web3.com",
    category: "Users",
    color: "text-blue-500",
  },
  {
    time: "14:31:45",
    icon: CreditCard,
    text: "Payment processed: $9.99 Gold subscription",
    category: "Payments",
    color: "text-green-500",
  },
  {
    time: "14:31:23",
    icon: BarChart,
    text: "Project analytics spike: 500+ views in 5min",
    category: "System",
    color: "text-purple-500",
  },
  {
    time: "14:30:12",
    icon: AlertTriangle,
    text: "Rate limit triggered: IP 192.168.1.100",
    category: "Errors",
    color: "text-red-500",
  },
  {
    time: "14:29:56",
    icon: DatabaseBackup,
    text: "Database backup completed successfully",
    category: "System",
    color: "text-gray-500",
  },
  {
    time: "14:29:34",
    icon: UserPlus,
    text: "Bulk user import: 250 users via CSV",
    category: "Users",
    color: "text-blue-500",
  },
  {
    time: "14:28:19",
    icon: CreditCard,
    text: "Revenue milestone: $25K monthly target reached",
    category: "Payments",
    color: "text-green-500",
  },
]

export function LiveActivityFeed() {
  return (
    <Card className="h-full bg-white/60 backdrop-blur-lg border-silver-200/50">
      <CardHeader>
        <CardTitle className="text-lg font-display">🔴 Live System Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          {["All", "Users", "Payments", "Errors", "System"].map((filter) => (
            <Button key={filter} variant={filter === "All" ? "secondary" : "outline"} size="sm">
              {filter}
            </Button>
          ))}
        </div>
        <ScrollArea className="h-[350px] w-full">
          <div className="space-y-4 pr-4">
            {activityLog.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <item.icon className={`mt-1 h-4 w-4 flex-shrink-0 ${item.color}`} />
                <div className="flex-1">
                  <p className="text-sm text-text-primary">
                    <span className="font-mono text-xs text-text-secondary">{item.time}</span> {item.text}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
