import { ULinkLogo } from "@/components/ulink-logo"

export function Footer() {
  return (
    <footer className="bg-white border-t border-silver-200">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <ULinkLogo className="h-8 w-auto" />
          <p className="text-center text-sm text-text-secondary">
            &copy; {new Date().getFullYear()} ULink. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
