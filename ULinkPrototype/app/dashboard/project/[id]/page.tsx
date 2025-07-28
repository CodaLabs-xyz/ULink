"use client"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Settings,
  Eye,
  QrCode,
  Trash2,
  GripVertical,
  Plus,
  Globe,
  Database,
  Trophy,
  Mail,
  Gift,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { EditLinkModal, type LinkData } from "@/components/dashboard/edit-link-modal"
import { availableIcons, type IconName } from "@/components/dashboard/icon-picker"
import { QrCodeModal } from "@/components/dashboard/qr-code-modal"
import { LinkQrCodeModal } from "@/components/dashboard/link-qr-code-modal"
import { AddonCard } from "@/components/dashboard/addon-card"
import { DisplayLayoutEditor } from "@/components/dashboard/display-layout-editor"
import { Toaster } from "@/components/ui/toaster"
import { EditProjectModal, type ProjectData, type Layout } from "@/components/dashboard/edit-project-modal"

// Mock data based on specifications
const initialProject: ProjectData = {
  id: "1",
  name: "Web3 Creator Hub",
  description: "Your ultimate link destination for Web3 projects and content.",
  slug: "web3-creator",
  logoUrl: "/images/logo-placeholder-1.png",
  status: "Active",
  theme: "light",
  banner: {
    type: "image",
    url: "/images/abstract-blue-gradient.png",
  },
  background: {
    type: "solid",
    value: "#fafbfc",
  },
  createdAt: "Mar 15, 2024",
  stats: {
    totalViews: 1247,
    countries: 23,
    linkCount: 5,
    linkLimit: 10,
  },
  addons: {
    baseProfile: true,
    talentProtocol: true,
    contactForm: true,
    donations: true,
  },
  layout: [
    {
      id: "default-section-1",
      type: "single",
      columns: { main: [] },
    },
    {
      id: "default-section-2",
      type: "double",
      columns: { left: [], right: [] },
    },
    {
      id: "default-section-3",
      type: "single",
      columns: { main: [] },
    },
  ],
  links: [
    {
      id: "1",
      type: "web",
      icon: "Globe" as IconName,
      label: "Official Website",
      url: "https://mywebsite.com",
      linkSlug: "website",
      clicks: 456,
      ctr: 37,
      isDefault: true,
      isActive: true,
    },
    {
      id: "2",
      type: "x",
      icon: "X" as IconName,
      label: "Follow on X",
      url: "https://x.com/username",
      linkSlug: "x",
      clicks: 324,
      ctr: 26,
      isDefault: false,
      isActive: true,
    },
    {
      id: "5",
      type: "farcaster",
      icon: "MessageSquare" as IconName,
      label: "Farcaster Profile",
      url: "https://warpcast.com/username",
      linkSlug: "farcaster",
      clicks: 112,
      ctr: 9,
      isDefault: false,
      isActive: true,
    },
    {
      id: "3",
      type: "youtube",
      icon: "Youtube" as IconName,
      label: "YouTube Channel",
      url: "https://youtube.com/channel/...",
      linkSlug: "youtube",
      clicks: 289,
      ctr: 23,
      isDefault: false,
      isActive: false,
    },
    {
      id: "4",
      type: "newsletter",
      icon: "Mail" as IconName,
      label: "Newsletter Signup",
      url: "https://newsletter.com/signup",
      linkSlug: "newsletter",
      clicks: 178,
      ctr: 14,
      isDefault: false,
      isActive: true,
    },
  ],
  analytics: {
    weeklyTraffic: [100, 150, 120, 180, 160, 200, 190],
    topCountries: [
      { name: "United States", value: 456, percentage: 37, code: "🇺🇸" },
      { name: "United Kingdom", value: 234, percentage: 19, code: "🇬🇧" },
      { name: "Canada", value: 156, percentage: 13, code: "🇨🇦" },
    ],
    deviceBreakdown: [
      { name: "Mobile", value: 687, percentage: 55 },
      { name: "Desktop", value: 436, percentage: 35 },
      { name: "Tablet", value: 124, percentage: 10 },
    ],
  },
}

export default function ProjectDetailsPage() {
  const [project, setProject] = useState<ProjectData>(initialProject)
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<LinkData | null>(null)
  const [isProjectQrModalOpen, setIsProjectQrModalOpen] = useState(false)
  const [qrLink, setQrLink] = useState<LinkData | null>(null)

  const handleSaveProject = (updatedProject: ProjectData) => {
    setProject(updatedProject)
    setIsEditProjectModalOpen(false)
  }

  const handleEditClick = (link: LinkData) => {
    setEditingLink(link)
    setIsEditModalOpen(true)
  }

  const handleSaveLink = (updatedLink: LinkData) => {
    const newLinks = project.links.map((l) => (l.id === updatedLink.id ? { ...l, ...updatedLink } : l))
    setProject((prev) => ({ ...prev, links: newLinks }))
    setIsEditModalOpen(false)
    setEditingLink(null)
  }

  const handleToggleAddon = (addonName: keyof typeof project.addons) => {
    setProject((prev) => {
      const newAddons = { ...prev.addons, [addonName]: !prev.addons[addonName] }
      let newLayout = JSON.parse(JSON.stringify(prev.layout)) as Layout

      // If addon is deactivated, remove it from all columns in the layout
      if (!newAddons[addonName]) {
        newLayout = newLayout.map((section) => {
          const newColumns = { ...section.columns }
          if (newColumns.main) {
            newColumns.main = newColumns.main.filter((item) => item !== addonName)
          }
          if (newColumns.left) {
            newColumns.left = newColumns.left.filter((item) => item !== addonName)
          }
          if (newColumns.right) {
            newColumns.right = newColumns.right.filter((item) => item !== addonName)
          }
          return { ...section, columns: newColumns }
        })
      }
      // If an addon is activated, it will automatically appear in the "Available Components" bank.
      // No need to modify the layout here.

      return { ...prev, addons: newAddons, layout: newLayout }
    })
  }

  const handleToggleLinkStatus = (linkId: string) => {
    setProject((prev) => ({
      ...prev,
      links: prev.links.map((link) => (link.id === linkId ? { ...link, isActive: !link.isActive } : link)),
    }))
  }

  const handleLayoutChange = (newLayout: Layout) => {
    setProject((prev) => ({ ...prev, layout: newLayout }))
  }

  const activeAddons = Object.entries(project.addons)
    .filter(([, isActive]) => isActive)
    .map(([name]) => name)

  return (
    <>
      <EditProjectModal
        isOpen={isEditProjectModalOpen}
        onClose={() => setIsEditProjectModalOpen(false)}
        project={project}
        onSave={handleSaveProject}
      />
      <EditLinkModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        link={editingLink}
        onSave={handleSaveLink}
        projectSlug={project.slug}
      />
      <QrCodeModal
        isOpen={isProjectQrModalOpen}
        onClose={() => setIsProjectQrModalOpen(false)}
        projectSlug={project.slug}
        projectLogoUrl={project.logoUrl}
        projectName={project.name}
        projectDescription={project.description}
      />
      <LinkQrCodeModal
        isOpen={!!qrLink}
        onClose={() => setQrLink(null)}
        link={qrLink}
        projectSlug={project.slug}
        projectLogoUrl={project.logoUrl}
        projectName={project.name}
        projectDescription={project.description}
      />
      <Toaster />
      <div className="min-h-screen bg-silver-100 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
          {/* Breadcrumbs & Back Button */}
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              <Link href="/dashboard" className="hover:text-primary-600">
                Dashboard
              </Link>
              <span className="mx-2">/</span>
              <span className="font-medium text-text-primary">{project.name}</span>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Link>
            </Button>
          </div>

          {/* Project Header */}
          <header className="rounded-2xl border border-silver-200/50 bg-white/60 p-6 backdrop-blur-lg sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-6">
                <Image
                  src={project.logoUrl || "/placeholder.svg"}
                  alt={project.name}
                  width={128}
                  height={128}
                  className="hidden h-24 w-24 rounded-lg border border-silver-200 sm:block md:h-32 md:w-32"
                />
                <div>
                  <h1 className="text-2xl font-bold text-text-primary font-display md:text-3xl">{project.name}</h1>
                  <p className="mt-1 text-text-secondary">{project.description}</p>
                  <p className="mt-2 text-sm text-primary-600 hover:underline">ulink.dev/app/{project.slug}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-text-secondary">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      {project.status}
                    </span>
                    <span>•</span>
                    <span>Created {project.createdAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="action-btn bg-transparent"
                  onClick={() => setIsEditProjectModalOpen(true)}
                >
                  <Settings className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="action-btn bg-transparent" asChild>
                  <Link href={`/app/${project.slug}`} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-5 w-5" />
                    <span className="sr-only">Preview Project</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="action-btn bg-transparent"
                  onClick={() => setIsProjectQrModalOpen(true)}
                >
                  <QrCode className="h-5 w-5" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="action-btn !border-red-500/30 !bg-red-500/10 hover:!bg-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-silver-200 pt-4 text-sm text-text-secondary">
              <p>📊 {project.stats.totalViews.toLocaleString()} total views</p>
              <p>🌍 {project.stats.countries} countries</p>
              <p>🔗 {project.links.length} links</p>
            </div>
          </header>

          {/* Main Content */}
          <main className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column: Links Management */}
            <div className="lg:col-span-2">
              {/* Addons Section */}
              <div className="mb-8 rounded-2xl border border-silver-200 bg-white p-6">
                <h2 className="text-xl font-bold font-display">Addons</h2>
                <p className="mt-1 text-sm text-text-secondary">Enhance your page with powerful integrations.</p>
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
                  <AddonCard
                    icon={Database}
                    title="Base Profile"
                    description="Display your on-chain identity from Base."
                    isActive={project.addons.baseProfile}
                    onToggle={() => handleToggleAddon("baseProfile")}
                  />
                  <AddonCard
                    icon={Trophy}
                    title="Talent Protocol"
                    description="Showcase your Talent Protocol score."
                    isActive={project.addons.talentProtocol}
                    onToggle={() => handleToggleAddon("talentProtocol")}
                  />
                  <AddonCard
                    icon={Mail}
                    title="Contact Form"
                    description="Allow visitors to send you a message."
                    isActive={project.addons.contactForm}
                    onToggle={() => handleToggleAddon("contactForm")}
                  />
                  <AddonCard
                    icon={Gift}
                    title="Donations"
                    description="Accept donations via crypto wallet."
                    isActive={project.addons.donations}
                    onToggle={() => handleToggleAddon("donations")}
                  />
                </div>
              </div>

              {/* Links Section */}
              <div className="rounded-2xl border border-silver-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold font-display">Custom Links</h2>
                  <span className="text-sm text-text-secondary">
                    {project.links.length}/{project.stats.linkLimit}
                  </span>
                </div>
                <div className="mt-4 rounded-lg border-2 border-dashed border-silver-200 p-4 text-center">
                  <Button variant="ghost" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Link
                  </Button>
                </div>
                <div className="mt-6 space-y-4">
                  {project.links.map((link) => {
                    const Icon = availableIcons[link.icon] || Globe
                    return (
                      <div
                        key={link.id}
                        className={cn(
                          "link-item rounded-xl border bg-white p-4 transition-all duration-200",
                          link.isDefault
                            ? "border-gold-400 bg-gradient-to-br from-gold-50/50 to-gold-100/30"
                            : "border-silver-200",
                          !link.isActive && "opacity-50",
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <GripVertical className="h-5 w-5 cursor-grab text-silver-400" />
                          <Icon className="h-6 w-6 flex-shrink-0 text-text-secondary" />
                          <div className="flex-1">
                            <p className="font-semibold text-text-primary">{link.label}</p>
                            <p className="text-sm text-primary-600">
                              ulink.dev/app/{project.slug}/{link.linkSlug}
                            </p>
                          </div>
                          <div className="hidden items-center gap-4 text-right sm:flex">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={`active-switch-${link.id}`} className="text-sm">
                                Active
                              </Label>
                              <Switch
                                id={`active-switch-${link.id}`}
                                checked={link.isActive}
                                onCheckedChange={() => handleToggleLinkStatus(link.id)}
                              />
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQrLink(link)}>
                              <QrCode className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditClick(link)}>
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Analytics & Layout */}
            <div className="space-y-8">
              <div className="rounded-2xl border border-silver-200 bg-white p-6">
                <h2 className="text-xl font-bold font-display">Analytics Overview</h2>
                <div className="mt-4">
                  <p className="text-sm font-medium text-text-secondary">Weekly Traffic</p>
                  <div className="mt-2 h-32 w-full rounded-lg bg-silver-100 p-2">
                    {/* Mock Chart */}
                    <div className="flex h-full items-end gap-1">
                      {project.analytics.weeklyTraffic.map((val, i) => (
                        <div
                          key={i}
                          className="w-full rounded-t-sm bg-primary-400"
                          style={{ height: `${(val / 200) * 100}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-2">
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href={`/dashboard/project/${project.id}/analytics`}>View Full Analytics</Link>
                  </Button>
                  <Button variant="secondary" className="w-full">
                    Export Data
                  </Button>
                </div>
              </div>
              <DisplayLayoutEditor
                layout={project.layout}
                onLayoutChange={handleLayoutChange}
                activeAddons={activeAddons}
              />
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
