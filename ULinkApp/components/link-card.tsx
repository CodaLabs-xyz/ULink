"use client"

import {
  Globe,
  X,
  Youtube,
  FileText,
  Calendar,
  DollarSign,
  BarChart2,
  type LucideIcon,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type LinkProps = {
  id: string
  label: string
  description: string
  url: string
  type: "web" | "x" | "farcaster" | "video" | "form" | "calendar" | "payment"
  isDefault?: boolean
}

const iconMap: { [key: string]: LucideIcon } = {
  web: Globe,
  x: X,
  farcaster: MessageSquare,
  video: Youtube,
  form: FileText,
  calendar: Calendar,
  payment: DollarSign,
}

export function LinkCard({ label, description, url, type, isDefault }: LinkProps) {
  const Icon = iconMap[type] || Globe

  const cardContent = (
    <div className="flex items-center space-x-4">
      <div className="flex-shrink-0">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-300",
            isDefault ? "bg-gold-100/80" : "bg-silver-100/80",
            "group-hover:scale-105",
          )}
        >
          <Icon
            className={cn(
              "h-6 w-6 transition-colors duration-300",
              isDefault ? "text-gold-600" : "text-silver-600",
              "group-hover:text-primary-600",
            )}
          />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-text-primary">{label}</h3>
        <p className="truncate text-sm text-text-secondary">{description}</p>
      </div>
      <div className="flex-shrink-0">
        <BarChart2 className="h-5 w-5 text-silver-400 transition-colors duration-300 group-hover:text-primary-500" />
      </div>
    </div>
  )

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "link-card group block w-full rounded-2xl border bg-white/80 p-4 backdrop-blur-lg transition-all duration-300 ease-out",
        isDefault
          ? "border-gold-400/50 shadow-lg shadow-gold-500/10 hover:border-gold-400"
          : "border-silver-200/80 shadow-md shadow-silver-500/50 hover:border-silver-300",
        "hover:-translate-y-1 hover:shadow-xl",
      )}
    >
      {cardContent}
    </a>
  )
}
