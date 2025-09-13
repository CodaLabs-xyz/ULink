import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const tiers = [
  {
    name: "Free",
    price: "$0",
    monthly: true,
    description: "For individuals getting started.",
    features: ["1 Project", "1 Links per project", "1 addon", "Basic analytics"],
    cta: "Start for free",
    tierClass: "border-silver-300",
  },
  {
    name: "Silver",
    price: "$2.99",
    monthly: true,
    description: "For creators and small businesses.",
    features: ["5 Projects", "6 Links per project", "3 addons", "Enhanced analytics", "Custom branding", "QR codes"],
    cta: "Get started",
    tierClass: "border-platinum-400 ring-2 ring-platinum-400",
    popular: true,
  },
  {
    name: "Gold",
    price: "$9.99",
    monthly: true,
    description: "For power users and teams.",
    features: ["20 Projects", "10 Links per project", "All addons", "Premium analytics", "Team collaboration", "API access"],
    cta: "Contact sales",
    tierClass: "border-gold-400",
  },
  {
    name: "As You Go",
    price: "$1.99",
    description: "Pay as you need, per project or addon.",
    features: ["Many Projects", "Many Links per project", "Many addons", "Premium analytics"],
    cta: "Contact sales",
    tierClass: "border-gold-400",
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl font-display">
            Simple, transparent pricing
          </h2>
          <p className="mt-6 text-lg text-text-secondary">
            Choose the plan that's right for you. Unlock more features as you grow.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-stretch gap-8 lg:max-w-none lg:grid-cols-4">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn("relative flex flex-col h-full rounded-2xl border bg-white p-8 shadow-sm", tier.tierClass)}
            >
              {tier.popular && (
                <div className="absolute top-0 -translate-y-1/2 rounded-full bg-platinum-400 px-3 py-1 text-sm font-semibold text-white">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold leading-6 text-text-primary">{tier.name}</h3>
              <p className="mt-2 text-sm text-text-secondary">{tier.description}</p>
              <p className="mt-6">
                <span className="text-4xl font-bold tracking-tight text-text-primary">{tier.price}</span>
                {tier.price !== "$0" && tier.monthly && <span className="text-sm font-medium text-text-secondary">/month</span>}
              </p>
              <ul role="list" className="mt-10 flex-grow space-y-4 text-sm leading-6 text-text-secondary">
                {tier.features.filter(feature => feature).map((feature, index) => (
                  <li key={`${tier.name}-feature-${index}`} className="flex gap-x-3">
                    <Check className="h-6 w-5 flex-none text-primary-600" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className={cn(
                  "mt-8 w-full",
                  tier.popular ? "bg-primary-600 hover:bg-primary-700" : "bg-gray-800 hover:bg-gray-900",
                )}
              >
                {tier.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
