import { Header } from "@/components/dashboard/header"
import { StatCard } from "@/components/dashboard/stat-card"
import { ProjectCard } from "@/components/dashboard/project-card"
import { AddNewProjectCard } from "@/components/dashboard/add-new-project-card"
import { BarChart, FolderGit2, Activity } from "lucide-react"

// Mock data based on specifications
const user = {
  name: "Alex",
  avatarUrl: "/images/avatar-placeholder.png",
  subscriptionTier: "Gold",
  walletAddress: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r",
}

const stats = {
  totalViews: {
    value: "1,247",
    change: "+15%",
    changeType: "increase",
  },
  activeProjects: {
    value: "3",
    limit: "10",
  },
  recentActivity: {
    value: "42",
    period: "today",
  },
}

const projects = [
  {
    id: "1",
    name: "My Design Portfolio",
    description: "A collection of my best work.",
    slug: "alex-design",
    logoUrl: "/images/logo-placeholder-1.png",
    views: 1200,
    links: 8,
    countries: 25,
    performance: 80,
    status: "active",
  },
  {
    id: "2",
    name: "Web3 Startup",
    description: "The next big thing in decentralization.",
    slug: "web3-startup",
    logoUrl: "/images/logo-placeholder-2.png",
    views: 850,
    links: 5,
    countries: 15,
    performance: 65,
    status: "active",
  },
  {
    id: "3",
    name: "Side Project",
    description: "A fun project I'm working on.",
    slug: "side-hustle",
    logoUrl: "/images/logo-placeholder-3.png",
    views: 300,
    links: 2,
    countries: 5,
    performance: 40,
    status: "paused",
  },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-silver-50 text-text-primary">
      <Header user={user} />
      <main className="container mx-auto px-4 py-8 md:px-6">
        {/* Stats Overview */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Views"
            value={stats.totalViews.value}
            change={stats.totalViews.change}
            changeType={stats.totalViews.changeType}
            icon={BarChart}
            tier="Silver"
          />
          <StatCard
            title="Active Projects"
            value={`${stats.activeProjects.value}/${stats.activeProjects.limit}`}
            icon={FolderGit2}
            tier="Platinum"
          >
            <div className="mt-2 h-2 w-full rounded-full bg-platinum-200">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-platinum-300 to-platinum-500"
                style={{
                  width: `${(Number.parseInt(stats.activeProjects.value) / Number.parseInt(stats.activeProjects.limit)) * 100}%`,
                }}
              />
            </div>
          </StatCard>
          <StatCard
            title="Recent Activity"
            value={stats.recentActivity.value}
            change={stats.recentActivity.period}
            icon={Activity}
            tier="Gold"
          />
        </section>

        {/* Projects Grid */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-text-primary font-display">Your Projects</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            <AddNewProjectCard />
          </div>
        </section>
      </main>
    </div>
  )
}
