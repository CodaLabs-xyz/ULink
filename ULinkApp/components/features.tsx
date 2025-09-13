import { BarChart3, Link2, QrCode, Wallet, Zap } from "lucide-react"

const features = [
  {
    name: "Customizable Link Hubs",
    description: "Create branded link pages with your logo, colors, and a unique URL.",
    icon: Link2,
  },
  {
    name: "Real-time Analytics",
    description: "Track clicks, geographic location, device types, and referrers for each link.",
    icon: BarChart3,
  },
  {
    name: "Smart Redirects",
    description: "Optionally show your branding before redirecting visitors to a primary link.",
    icon: Zap,
  },
  {
    name: "Web3 Integration",
    description: "Use your crypto wallet to log in and pay for subscriptions on the Base blockchain.",
    icon: Wallet,
  },
  {
    name: "Branded QR Codes",
    description: "Generate QR codes for your project page with your logo embedded in the center.",
    icon: QrCode,
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl font-display">
            Everything you need to share your content
          </h2>
          <p className="mt-6 text-lg text-text-secondary">
            ULink provides a powerful suite of tools to help you manage and track your links with ease.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-none">
          <div className="grid grid-cols-1 gap-y-10 gap-x-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                  <feature.icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-text-primary">{feature.name}</h3>
                <p className="mt-2 text-base text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
