import Link from "next/link"
import {
  ArrowLeft,
  Download,
  Settings,
  QrCode,
  BarChart3,
  Users,
  MousePointerClick,
  Clock,
  Globe,
  Smartphone,
  RefreshCw,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for the analytics page
const analyticsData = {
  projectName: "Web3 Creator Hub",
  projectSlug: "web3-creator",
  timePeriod: "Last 30 days",
  keyMetrics: [
    {
      title: "Total Views",
      value: "12,847",
      change: "+15.3%",
      changeType: "increase",
      icon: BarChart3,
    },
    {
      title: "Unique Visitors",
      value: "8,432",
      change: "+12.8%",
      changeType: "increase",
      icon: Users,
    },
    {
      title: "Click-Through Rate",
      value: "68.5%",
      change: "+5.2%",
      changeType: "increase",
      icon: MousePointerClick,
    },
    {
      title: "Avg. Time on Page",
      value: "2:34",
      change: "+0:18",
      changeType: "increase",
      icon: Clock,
    },
    {
      title: "Countries Reached",
      value: "47",
      change: "+3 new",
      changeType: "increase",
      icon: Globe,
    },
    {
      title: "Mobile Traffic",
      value: "78%",
      change: "+2.1%",
      changeType: "increase",
      icon: Smartphone,
    },
    {
      title: "Return Visitors",
      value: "34%",
      change: "+8.4%",
      changeType: "increase",
      icon: RefreshCw,
    },
    {
      title: "Top Link",
      value: "Website",
      change: "456 clicks",
      changeType: "none",
      icon: Star,
    },
  ],
  trafficOverview: {
    chartData: [
      { day: 1, views: 120 },
      { day: 5, views: 280 },
      { day: 10, views: 200 },
      { day: 15, views: 450 },
      { day: 20, views: 380 },
      { day: 25, views: 500 },
      { day: 30, views: 480 },
    ],
  },
  geo: {
    topCountries: [
      { name: "United States", views: 1247, code: "🇺🇸" },
      { name: "United Kingdom", views: 834, code: "🇬🇧" },
      { name: "Canada", views: 567, code: "🇨🇦" },
      { name: "Germany", views: 423, code: "🇩🇪" },
      { name: "France", views: 312, code: "🇫🇷" },
    ],
  },
  tech: {
    devices: [
      { name: "Mobile", percentage: 58 },
      { name: "Desktop", percentage: 33 },
      { name: "Tablet", percentage: 9 },
    ],
    browsers: [
      { name: "Chrome", percentage: 45 },
      { name: "Safari", percentage: 26 },
      { name: "Firefox", percentage: 14 },
    ],
  },
  linkPerformance: [
    { name: "Website", clicks: 1456, ctr: 37.2, trend: 15.3 },
    { name: "Twitter Profile", clicks: 834, ctr: 21.3, trend: 8.7 },
    { name: "YouTube Channel", clicks: 567, ctr: 14.5, trend: 2.1 },
    { name: "Newsletter Signup", clicks: 423, ctr: 10.8, trend: 12.4 },
  ],
}

const MetricCard = ({ metric }: { metric: (typeof analyticsData.keyMetrics)[0] }) => (
  <Card className="bg-white/60 backdrop-blur-lg border-silver-200/50">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-text-secondary">{metric.title}</CardTitle>
      <metric.icon className="h-4 w-4 text-text-secondary" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{metric.value}</div>
      <p
        className={`text-xs ${
          metric.changeType === "increase" ? "text-green-600" : "text-red-600"
        } ${metric.changeType === "none" && "text-text-secondary"}`}
      >
        {metric.change}
      </p>
    </CardContent>
  </Card>
)

export default function ProjectAnalyticsPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-silver-100 p-4 sm:p-6 md:p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm text-text-secondary mb-2">
              <Link href="/dashboard" className="hover:text-primary-600">
                Dashboard
              </Link>
              <span className="mx-1">/</span>
              <Link href={`/dashboard/project/${params.id}`} className="hover:text-primary-600">
                {analyticsData.projectName}
              </Link>
              <span className="mx-1">/</span>
              <span className="font-medium text-text-primary">Analytics</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary font-display">
              📊 {analyticsData.projectName} Analytics
            </h1>
            <p className="text-sm text-text-secondary">{analyticsData.timePeriod} • Real-time data</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-transparent">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <QrCode className="h-5 w-5" />
            </Button>
            <Button variant="outline" asChild className="bg-transparent">
              <Link href={`/dashboard/project/${params.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="mb-8 flex flex-wrap items-center gap-2 rounded-xl border border-silver-200/50 bg-white/60 p-2 backdrop-blur-lg">
          {["24h", "7 days", "30 days", "3 months", "Custom"].map((range) => (
            <Button key={range} variant={range === "30 days" ? "secondary" : "ghost"} className="text-sm">
              {range}
            </Button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4">
          {analyticsData.keyMetrics.map((metric) => (
            <MetricCard key={metric.title} metric={metric} />
          ))}
        </div>

        {/* Main Dashboard Grids */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Traffic Overview */}
          <Card className="lg:col-span-2 bg-white/60 backdrop-blur-lg border-silver-200/50">
            <CardHeader>
              <CardTitle>📈 Traffic Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{ views: { label: "Views", color: "hsl(var(--chart-1))" } }}
                className="h-[250px] w-full"
              >
                <ResponsiveContainer>
                  <LineChart data={analyticsData.trafficOverview.chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line dataKey="views" type="monotone" stroke="var(--color-views)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Geographic Distribution */}
          <Card className="bg-white/60 backdrop-blur-lg border-silver-200/50">
            <CardHeader>
              <CardTitle>🌍 Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analyticsData.geo.topCountries.map((country) => (
                  <li key={country.name} className="flex items-center justify-between text-sm">
                    <span>
                      {country.code} {country.name}
                    </span>
                    <span className="font-semibold">{country.views.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Device & Tech */}
          <Card className="bg-white/60 backdrop-blur-lg border-silver-200/50">
            <CardHeader>
              <CardTitle>📱 Device & Technology</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold mb-2">Devices</h4>
                <ul className="space-y-1 text-sm">
                  {analyticsData.tech.devices.map((d) => (
                    <li key={d.name} className="flex justify-between">
                      <span>{d.name}</span>
                      <span>{d.percentage}%</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2">Browsers</h4>
                <ul className="space-y-1 text-sm">
                  {analyticsData.tech.browsers.map((b) => (
                    <li key={b.name} className="flex justify-between">
                      <span>{b.name}</span>
                      <span>{b.percentage}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Link Performance */}
          <Card className="bg-white/60 backdrop-blur-lg border-silver-200/50">
            <CardHeader>
              <CardTitle>🔗 Link Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-text-secondary">
                      <th className="pb-2 font-normal">Link</th>
                      <th className="pb-2 font-normal">Clicks</th>
                      <th className="pb-2 font-normal">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.linkPerformance.map((link) => (
                      <tr key={link.name} className="border-t border-silver-200">
                        <td className="py-2">{link.name}</td>
                        <td>{link.clicks.toLocaleString()}</td>
                        <td>{link.ctr}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
