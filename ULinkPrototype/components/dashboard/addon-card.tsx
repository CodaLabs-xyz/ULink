"use client"

import type { LucideIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type AddonCardProps = {
  icon: LucideIcon
  title: string
  description: string
  isActive: boolean
  onToggle: () => void
}

export function AddonCard({ icon: Icon, title, description, isActive, onToggle }: AddonCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-xl border p-4 transition-all",
        isActive ? "border-primary-300 bg-primary-50/50" : "border-silver-200 bg-white",
      )}
    >
      <div>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              isActive ? "bg-primary-100 text-primary-600" : "bg-silver-100 text-silver-600",
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-text-primary">{title}</h3>
        </div>
        <p className="mt-2 text-sm text-text-secondary">{description}</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Label htmlFor={`addon-${title}`} className="text-sm font-medium">
          {isActive ? "Active" : "Inactive"}
        </Label>
        <Switch id={`addon-${title}`} checked={isActive} onCheckedChange={onToggle} aria-label={`Activate ${title}`} />
      </div>
    </div>
  )
}
