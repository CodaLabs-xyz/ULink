"use client"

import { useState, useEffect, type ChangeEvent } from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type LayoutSection = {
  id: string
  type: "single" | "double"
  columns: {
    main?: string[]
    left?: string[]
    right?: string[]
  }
}
export type Layout = LayoutSection[]

export type ProjectData = {
  id: string
  name: string
  description: string
  slug: string
  logoUrl: string
  status: "Active" | "Paused"
  theme: "light" | "dark"
  banner: {
    type: "image" | "video"
    url: string
  }
  background: {
    type: "solid" | "gradient" | "image"
    value: string | { from: string; to: string } | string
  }
  createdAt: string
  stats: any
  addons: any
  layout: Layout
  links: any[]
  analytics: any
}

type EditProjectModalProps = {
  project: ProjectData
  isOpen: boolean
  onClose: () => void
  onSave: (updatedProject: ProjectData) => void
}

function FileUpload({
  label,
  preview,
  onFileChange,
  accept,
}: {
  label: string
  preview: string | null
  onFileChange: (file: File) => void
  accept: string
}) {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0])
    }
  }
  return (
    <div className="flex items-center gap-4">
      {preview && (
        <Image
          src={preview || "/placeholder.svg"}
          alt="preview"
          width={64}
          height={64}
          className="rounded-lg object-cover"
        />
      )}
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor={label}>{label}</Label>
        <Input id={label} type="file" accept={accept} onChange={handleFileChange} />
      </div>
    </div>
  )
}

export function EditProjectModal({ project, isOpen, onClose, onSave }: EditProjectModalProps) {
  const [formData, setFormData] = useState<ProjectData>(project)
  const [previews, setPreviews] = useState({ logo: project.logoUrl, banner: project.banner.url })

  useEffect(() => {
    setFormData(project)
    setPreviews({ logo: project.logoUrl, banner: project.banner.url })
  }, [project])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (field: "logo" | "banner") => (file: File) => {
    const previewUrl = URL.createObjectURL(file)
    setPreviews((p) => ({ ...p, [field]: previewUrl }))
    // In a real app, you'd upload the file and set the URL from the response
    if (field === "logo") {
      setFormData({ ...formData, logoUrl: previewUrl })
    } else {
      setFormData({ ...formData, banner: { ...formData.banner, url: previewUrl } })
    }
  }

  const handleSave = () => {
    onSave(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>Update your project details. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>
          <div className="max-h-[60vh] overflow-y-auto p-1 pr-4">
            <TabsContent value="general" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Title</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Project Slug</Label>
                <div className="flex items-center">
                  <span className="rounded-l-md border border-r-0 bg-silver-100 px-3 py-2 text-sm text-text-secondary">
                    ulink.dev/app/
                  </span>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="rounded-l-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "Active" | "Paused") => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            <TabsContent value="appearance" className="mt-4 space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <RadioGroup
                  value={formData.theme}
                  onValueChange={(value: "light" | "dark") => setFormData({ ...formData, theme: value })}
                  className="flex gap-4"
                >
                  <Label className="flex items-center gap-2 rounded-md border p-2 hover:bg-accent">
                    <RadioGroupItem value="light" /> Light
                  </Label>
                  <Label className="flex items-center gap-2 rounded-md border p-2 hover:bg-accent">
                    <RadioGroupItem value="dark" /> Dark
                  </Label>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Background</Label>
                <RadioGroup
                  value={formData.background.type}
                  onValueChange={(value: "solid" | "gradient" | "image") =>
                    setFormData({ ...formData, background: { type: value, value: "" } })
                  }
                  className="flex gap-4"
                >
                  <Label className="flex items-center gap-2 rounded-md border p-2 hover:bg-accent">
                    <RadioGroupItem value="solid" /> Solid
                  </Label>
                  <Label className="flex items-center gap-2 rounded-md border p-2 hover:bg-accent">
                    <RadioGroupItem value="gradient" /> Gradient
                  </Label>
                  <Label className="flex items-center gap-2 rounded-md border p-2 hover:bg-accent">
                    <RadioGroupItem value="image" /> Image
                  </Label>
                </RadioGroup>
              </div>
              {/* Conditional inputs for background type */}
            </TabsContent>
            <TabsContent value="media" className="mt-4 space-y-6">
              <FileUpload
                label="Project Logo"
                preview={previews.logo}
                onFileChange={handleFileChange("logo")}
                accept="image/png, image/jpeg, image/gif"
              />
              <div className="space-y-2">
                <Label>Banner</Label>
                <RadioGroup
                  value={formData.banner.type}
                  onValueChange={(value: "image" | "video") =>
                    setFormData({ ...formData, banner: { type: value, url: "" } })
                  }
                  className="flex gap-4"
                >
                  <Label className="flex items-center gap-2 rounded-md border p-2 hover:bg-accent">
                    <RadioGroupItem value="image" /> Image
                  </Label>
                  <Label className="flex items-center gap-2 rounded-md border p-2 hover:bg-accent">
                    <RadioGroupItem value="video" /> Video (MP4)
                  </Label>
                </RadioGroup>
              </div>
              <FileUpload
                label="Banner Media"
                preview={previews.banner}
                onFileChange={handleFileChange("banner")}
                accept={formData.banner.type === "image" ? "image/*" : "video/mp4"}
              />
            </TabsContent>
          </div>
        </Tabs>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
