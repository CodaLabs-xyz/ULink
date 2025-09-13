import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, BarChart, Siren, UserSearch, CreditCard, Wrench } from "lucide-react"

const actions = [
  { label: "Restart Services", icon: RefreshCw },
  { label: "Generate Report", icon: BarChart },
  { label: "Send Alert", icon: Siren },
  { label: "User Lookup", icon: UserSearch },
  { label: "Payment Check", icon: CreditCard },
  { label: "Maintenance Mode", icon: Wrench },
]

export function QuickActionsCard() {
  return (
    <Card className="bg-white/60 backdrop-blur-lg border-silver-200/50">
      <CardHeader>
        <CardTitle className="text-lg font-display">⚡ Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button key={action.label} variant="outline" className="flex items-center justify-start gap-2 bg-transparent">
            <action.icon className="h-4 w-4" />
            <span>{action.label}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
