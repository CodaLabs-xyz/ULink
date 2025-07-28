"use client"
import {
  Globe,
  X,
  MessageSquare,
  Youtube,
  Mail,
  FileText,
  Calendar,
  DollarSign,
  Github,
  Linkedin,
  Instagram,
  Facebook,
  Twitch,
  ShoppingCart,
  Music,
  Phone,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

export const availableIcons = {
  Globe,
  X,
  MessageSquare,
  Youtube,
  Mail,
  FileText,
  Calendar,
  DollarSign,
  Github,
  Linkedin,
  Instagram,
  Facebook,
  Twitch,
  ShoppingCart,
  Music,
  Phone,
}

export type IconName = keyof typeof availableIcons

export function IconPicker({
  selectedIcon,
  onSelectIcon,
}: {
  selectedIcon: IconName
  onSelectIcon: (iconName: IconName) => void
}) {
  return (
    <ScrollArea className="h-32 w-full rounded-md border p-2">
      <div className="grid grid-cols-8 gap-2 sm:grid-cols-10">
        {(Object.keys(availableIcons) as IconName[]).map((iconName) => {
          const Icon = availableIcons[iconName]
          return (
            <button
              key={iconName}
              type="button"
              onClick={() => onSelectIcon(iconName)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-md border p-2 transition-colors",
                selectedIcon === iconName
                  ? "border-primary-500 bg-primary-100 ring-2 ring-primary-500"
                  : "hover:bg-silver-100",
              )}
            >
              <Icon className="h-5 w-5 text-text-secondary" />
              <span className="sr-only">{iconName}</span>
            </button>
          )
        })}
      </div>
    </ScrollArea>
  )
}
