import {
  Activity,
  BarChart,
  Cpu,
  CreditCard,
  DollarSign,
  HardDrive,
  Server,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react"
import { StatCard } from "@/components/admin/stat-card"
import { PerformanceMetricsCard } from "@/components/admin/performance-metrics-card"
import { QuickActionsCard } from "@/components/admin/quick-actions-card"
import { LiveActivityFeed } from "@/components/admin/live-activity-feed"

const overviewStats = [
  {
    title: "System Status",
    value: "Healthy",
    change: "99.97% uptime",
    changeType: "increase",
    icon: ShieldCheck,
  },
  {
    title: "Total Users",
    value: "12,847",
    change: "+234 today",
    changeType: "increase",
    icon: Users,
  },
  {
    title: "Monthly Revenue",
    value: "$23,456",
    change: "+$2,134 MoM",
    changeType: "increase",
    icon: DollarSign,
  },
  {
    title: "Growth Rate",
    value: "+15.3%",
    change: "This week",
    changeType: "increase",
    icon: BarChart,
  },
]

const performanceMetrics = [
  { title: "API Response Time", value: "156ms avg", icon: Zap },
  { title: "Database Uptime", value: "99.9% uptime", icon: Server },
  { title: "CDN Performance", value: "89ms global", icon: Cpu },
  { title: "Storage Used", value: "2.3TB / 10TB", icon: HardDrive },
  { title: "Error Rate", value: "0.03%", icon: Activity },
  { title: "Bandwidth", value: "45GB / 500GB", icon: CreditCard },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-text-primary font-display">System Overview</h1>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LiveActivityFeed />
        </div>
        <div className="space-y-8">
          <PerformanceMetricsCard metrics={performanceMetrics} />
          <QuickActionsCard />
        </div>
      </div>
    </div>
  )
}
