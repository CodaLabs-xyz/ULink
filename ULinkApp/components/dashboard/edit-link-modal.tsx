"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { IconPicker, type IconName } from "./icon-picker"

export type LinkData = {
  id: string
  type: string
  icon: IconName
  label: string
  url: string
  linkSlug: string
  clicks?: number
  ctr?: number
}

type EditLinkModalProps = {
  link: LinkData | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedLink: LinkData) => void
  projectSlug: string
}

export function EditLinkModal({ link, isOpen, onClose, onSave, projectSlug }: EditLinkModalProps) {
  const [formData, setFormData] = React.useState<LinkData | null>(null)

  React.useEffect(() => {
    if (link) {
      setFormData(link)
    }
  }, [link])

  if (!formData) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleSelectChange = (name: "type", value: string) => {
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleIconChange = (iconName: IconName) => {
    setFormData((prev) => (prev ? { ...prev, icon: iconName } : null))
  }

  const handleSave = () => {
    if (formData) {
      onSave(formData)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Link</DialogTitle>
          <DialogDescription>Update the details for your link. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input id="label" name="label" value={formData.label} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Destination URL</Label>
            <Input id="url" name="url" value={formData.url} onChange={handleChange} placeholder="https://example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkSlug">Link Slug</Label>
            <div className="flex items-center">
              <span className="rounded-l-md border border-r-0 bg-silver-100 px-3 py-2 text-sm text-text-secondary">
                ulink.dev/app/{projectSlug}/
              </span>
              <Input
                id="linkSlug"
                name="linkSlug"
                value={formData.linkSlug}
                onChange={handleChange}
                className="rounded-l-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <IconPicker selectedIcon={formData.icon} onSelectIcon={handleIconChange} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
