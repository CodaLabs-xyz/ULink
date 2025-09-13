"use client"

import { useRef } from "react"
import { QRCodeCanvas } from "qrcode.react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, Share2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type QrCodeModalProps = {
  isOpen: boolean
  onClose: () => void
  projectSlug: string
  projectLogoUrl: string
  projectName: string
  projectDescription: string
}

export function QrCodeModal({
  isOpen,
  onClose,
  projectSlug,
  projectLogoUrl,
  projectName,
  projectDescription,
}: QrCodeModalProps) {
  const { toast } = useToast()
  const qrCodeRef = useRef<HTMLDivElement>(null)
  const projectUrl = `https://ulink.dev/app/${projectSlug}`

  const handleDownload = () => {
    const canvas = qrCodeRef.current?.querySelector("canvas")
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")
      const downloadLink = document.createElement("a")
      downloadLink.href = pngUrl
      downloadLink.download = `${projectSlug}-qr-code.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: `ULink: ${projectName}`,
      text: `Check out my ULink page: ${projectName}`,
      url: projectUrl,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.error("Error sharing:", error)
        toast({
          variant: "destructive",
          title: "Sharing failed",
          description: "Could not share the link at this moment.",
        })
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(projectUrl).then(
        () => {
          toast({
            title: "Copied to clipboard!",
            description: "The project link has been copied to your clipboard.",
          })
        },
        () => {
          toast({
            variant: "destructive",
            title: "Copy failed",
            description: "Could not copy the link to your clipboard.",
          })
        },
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Project</DialogTitle>
          <DialogDescription>
            Scan, download, or share this QR code to direct people to your ULink page.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <div className="text-center">
            <h2 className="text-xl font-bold font-display text-text-primary">{projectName}</h2>
            <p className="mt-1 text-sm text-text-secondary">{projectDescription}</p>
          </div>
          <div ref={qrCodeRef} className="mt-2 rounded-lg border-4 border-primary-500 bg-white p-2 shadow-lg">
            <QRCodeCanvas
              value={projectUrl}
              size={256}
              bgColor={"#ffffff"}
              fgColor={"#111827"}
              level={"H"}
              includeMargin={false}
              imageSettings={{
                src: projectLogoUrl,
                x: undefined,
                y: undefined,
                height: 48,
                width: 48,
                excavate: true,
              }}
            />
          </div>
          <p className="w-full truncate rounded-md bg-silver-100 px-3 py-1.5 text-center text-sm font-mono text-text-secondary">
            {projectUrl}
          </p>
        </div>
        <DialogFooter className="grid grid-cols-2 gap-2 sm:grid-cols-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
