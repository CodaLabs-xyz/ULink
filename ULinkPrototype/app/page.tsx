import type { LinkProps } from "@/components/link-card"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { Pricing } from "@/components/pricing"
import { Footer } from "@/components/footer"

// Mock data based on the project specifications
const projectData = {
  title: "The Vercel Dispatch",
  description:
    "A weekly newsletter for developers, designers, and creators. Join us for the latest in tech, design, and innovation.",
  logo: "/images/abstract-v-logo.png",
  heroImage: "/images/abstract-blue-gradient.png",
  links: [
    {
      id: "1",
      label: "Latest Newsletter Issue",
      url: "vercel.com/newsletter",
      type: "web",
      isDefault: true,
    },
    {
      id: "2",
      label: "Follow on X (Twitter)",
      url: "twitter.com/vercel",
      type: "social",
    },
    {
      id: "3",
      label: "Book a Demo",
      url: "calendly.com/vercel-demo",
      type: "calendar",
    },
    {
      id: "4",
      label: "Read our Docs",
      url: "vercel.com/docs",
      type: "form",
    },
  ] as LinkProps[],
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface text-text-primary">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <Pricing />
      </main>
      <Footer />
    </div>
  )
}
