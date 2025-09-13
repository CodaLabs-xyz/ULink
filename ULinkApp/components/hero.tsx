import { Button } from "@/components/ui/button"
import Image from "next/image"

export function Hero() {
  return (
    <section className="relative py-20 sm:py-32">
      <div className="absolute inset-0">
        <Image
          src="/images/abstract-blue-gradient.png"
          alt="Hero background"
          fill
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent" />
      </div>
      <div className="container relative mx-auto px-4 text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-text-primary sm:text-6xl">
          Your Links, Beautifully Organized
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
          Create stunning link hubs with powerful analytics and Web3 integration. ULink is the all-in-one solution for
          creators and businesses.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button size="lg" className="bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20">
            Get Started for Free
          </Button>
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  )
}
