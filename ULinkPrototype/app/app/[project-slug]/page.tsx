"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { LinkCard, type LinkProps } from "@/components/link-card"
import { ULinkLogo } from "@/components/ulink-logo"
import { ContactForm } from "@/components/contact-form"
import { DonationCard } from "@/components/donation-card"
import { BaseProfileCard } from "@/components/base-profile-card"
import { TalentProtocolCard } from "@/components/talent-protocol-card"
import { cn } from "@/lib/utils"

// Mock data based on the new project specifications
const projectData = {
  title: "My Awesome Project",
  description: "Building the future of Web3. Join my journey as I create innovative solutions...",
  logo: "/images/abstract-v-logo.png",
  heroImage: "/images/abstract-blue-gradient.png",
  location: "Based in San Francisco",
  canonicalUrl: "ulink.dev/my-project",
  redirectEnabled: false,
  defaultLink: "https://mywebsite.com",
  addons: {
    baseProfileActive: true,
    talentProtocolActive: true,
    contactFormActive: true,
    donationsActive: true,
  },
  layout: [
    {
      id: "section-1",
      type: "double",
      columns: {
        left: ["links"],
        right: ["baseProfile", "talentProtocol"],
      },
    },
    {
      id: "section-2",
      type: "single",
      columns: {
        main: ["donations", "contactForm"],
      },
    },
  ],
  links: [
    {
      id: "1",
      label: "Official Website",
      description: "Learn more about our mission",
      url: "https://mywebsite.com",
      type: "web",
      isDefault: true,
      isActive: true,
    },
    {
      id: "2",
      label: "Follow on X",
      description: "Follow for daily updates",
      url: "https://x.com/vercel",
      type: "x",
      isActive: true,
    },
    {
      id: "7",
      label: "Farcaster Profile",
      description: "Join the conversation on Farcaster",
      url: "https://warpcast.com/vercel",
      type: "farcaster",
      isActive: true,
    },
    {
      id: "3",
      label: "YouTube Channel",
      description: "Subscribe for weekly content",
      url: "https://youtube.com/vercel",
      type: "video",
      isActive: false,
    },
  ] as (LinkProps & { isActive: boolean })[],
}

function RedirectOverlay({ onCancel }: { onCancel: () => void }) {
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  return (
    <div className="redirect-overlay fixed inset-0 z-50 flex flex-col items-center justify-center bg-silver-900/90 p-4 text-white backdrop-blur-sm">
      <div className="text-center">
        <p className="mb-4 text-lg">Redirecting to {projectData.title}...</p>
        <div className="relative mx-auto mb-6 h-32 w-32">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-white/30 border-t-white" />
          <div className="flex h-full w-full items-center justify-center text-5xl font-bold">{countdown}</div>
        </div>
        <button
          onClick={onCancel}
          className="rounded-full bg-white/10 px-6 py-2 text-sm transition-colors hover:bg-white/20"
        >
          Stay on this page
        </button>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <p className="text-sm text-silver-300">Powered by</p>
          <ULinkLogo className="h-6 w-auto" />
        </div>
      </div>
    </div>
  )
}

export default function PublicProjectPage({ params }: { params: { "project-slug": string } }) {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (projectData.redirectEnabled && projectData.defaultLink) {
      const redirectTimer = setTimeout(() => {
        setIsRedirecting(true)
      }, 2000) // Start redirect process after 2 seconds

      const navigateTimer = setTimeout(() => {
        router.push(projectData.defaultLink)
      }, 5000) // Redirect after 5 seconds (2s wait + 3s countdown)

      return () => {
        clearTimeout(redirectTimer)
        clearTimeout(navigateTimer)
      }
    }
  }, [router])

  const cancelRedirect = () => {
    setIsRedirecting(false)
    const newWindow = window.open(window.location.href, "_self")
    newWindow?.stop()
    window.location.reload()
  }

  const componentMap = {
    links: (
      <div className="space-y-4">
        {projectData.links
          .filter((link) => link.isActive)
          .map((link) => (
            <LinkCard key={link.id} {...link} />
          ))}
      </div>
    ),
    baseProfile: <BaseProfileCard />,
    talentProtocol: <TalentProtocolCard />,
    donations: <DonationCard />,
    contactForm: <ContactForm />,
  }

  const hasContent = projectData.layout.some(
    (section) =>
      section.columns.left?.length > 0 || section.columns.right?.length > 0 || section.columns.main?.length > 0,
  )

  return (
    <div className="min-h-screen bg-surface font-sans text-text-primary">
      {isRedirecting && <RedirectOverlay onCancel={cancelRedirect} />}

      {/* Hero Section */}
      <header className="hero-section relative py-12 sm:py-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${projectData.heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />

        <div className="hero-content container relative mx-auto max-w-2xl rounded-3xl border border-white/30 bg-white/80 p-6 shadow-2xl shadow-black/10 backdrop-blur-2xl sm:p-8">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <Image
              src={projectData.logo || "/placeholder.svg"}
              alt={`${projectData.title} logo`}
              width={128}
              height={128}
              className="h-24 w-24 flex-shrink-0 rounded-2xl border-2 border-white shadow-lg sm:h-32 sm:w-32"
            />
            <div>
              <h1 className="font-display text-3xl font-bold text-text-primary sm:text-4xl">{projectData.title}</h1>
              <p className="mt-2 text-base text-text-secondary sm:text-lg">{projectData.description}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-text-secondary sm:justify-start">
                {projectData.location && <span>📍 {projectData.location}</span>}
                <span>🔗 ulink.dev/app/{params["project-slug"]}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Section */}
      {hasContent && (
        <main className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
          <div className="space-y-8">
            {projectData.layout.map((section) => (
              <div
                key={section.id}
                className={cn(
                  "grid gap-x-12 gap-y-8",
                  section.type === "double" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1",
                )}
              >
                {section.type === "double" ? (
                  <>
                    <div className="space-y-8">
                      {section.columns.left?.map((key) => (
                        <div key={key}>{componentMap[key]}</div>
                      ))}
                    </div>
                    <div className="space-y-8">
                      {section.columns.right?.map((key) => (
                        <div key={key}>{componentMap[key]}</div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="space-y-8">
                    {section.columns.main?.map((key) => (
                      <div key={key}>{componentMap[key]}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="py-12 text-center">
        <a
          href="https://ulink.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-text-tertiary transition-colors hover:text-primary-600"
        >
          ⚡ Powered by <ULinkLogo className="h-6 w-auto" />
        </a>
      </footer>
    </div>
  )
}
