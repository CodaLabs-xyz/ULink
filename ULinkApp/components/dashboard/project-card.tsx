import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Settings, BarChart, QrCode, LucideLink, Globe, PauseCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

type Project = {
  id: string
  name: string
  description: string
  slug: string
  logoUrl: string
  views: number
  links: number
  countries: number
  performance: number
  status: "active" | "paused"
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border border-silver-200 bg-white p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        project.status === "paused" && "bg-silver-50",
      )}
    >
      {project.status === "paused" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70">
          <PauseCircle className="h-10 w-10 text-silver-400" />
        </div>
      )}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Image
            src={project.logoUrl || "/placeholder.svg"}
            alt={project.name}
            width={48}
            height={48}
            className="rounded-lg"
          />
          <div>
            <h3 className="font-semibold text-text-primary">{project.name}</h3>
            <p className="text-sm text-primary-600">ulink.dev/app/{project.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" asChild>
            <Link href={`/dashboard/project/${project.id}`}>
              <Settings className="h-4 w-4" />
              <span className="sr-only">Edit Project</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
            <BarChart className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
            <QrCode className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="my-4 flex items-center justify-between text-sm text-text-secondary">
        <div className="flex items-center gap-1">
          <BarChart className="h-4 w-4" />
          <span>{project.views.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <LucideLink className="h-4 w-4" />
          <span>{project.links}</span>
        </div>
        <div className="flex items-center gap-1">
          <Globe className="h-4 w-4" />
          <span>{project.countries}</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-text-secondary">
          <span>Performance</span>
          <span>{project.performance}%</span>
        </div>
        <div className="mt-1 h-2 w-full rounded-full bg-silver-200">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-primary-400 to-primary-600"
            style={{ width: `${project.performance}%` }}
          />
        </div>
      </div>
    </div>
  )
}
