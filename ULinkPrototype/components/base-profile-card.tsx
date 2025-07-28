"use client"

import Image from "next/image"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MapPin, X, MessageSquare, Github, Globe } from "lucide-react"

const profileData = {
  ensName: "juliomcruz.base.eth",
  avatarUrl: "/pixelated-avatar.png",
  bio: "I am a proactive and creative professional with exceptional decision-making skills and a strong capacity for analysis and generating solutions",
  location: "onChain",
  socials: [
    { icon: X, handle: "JulioMCruz", url: "https://x.com/JulioMCruz" },
    { icon: MessageSquare, handle: "JulioMCruz", url: "https://warpcast.com/JulioMCruz" },
    { icon: Github, handle: "JulioMCruz", url: "https://github.com/JulioMCruz" },
    {
      icon: Globe,
      handle: "www.basetree.xyz/juliomcruz.base.eth",
      url: "https://www.basetree.xyz/juliomcruz.base.eth",
    },
  ],
}

export function BaseProfileCard() {
  return (
    <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
      <AccordionItem
        value="item-1"
        className="overflow-hidden rounded-2xl border-none bg-white shadow-lg shadow-silver-500/10"
      >
        <AccordionTrigger className="group bg-blue-600 p-6 text-white hover:no-underline [&[data-state=open]>div>svg]:rotate-180">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src={profileData.avatarUrl || "/placeholder.svg"}
                alt="User Avatar"
                width={40}
                height={40}
                className="rounded-md bg-white/20 p-1"
              />
              <span className="text-xl font-semibold">{profileData.ensName}</span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 shrink-0 text-white/80 transition-transform duration-200"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-6">
          <p className="text-text-secondary">{profileData.bio}</p>
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 text-text-secondary">
              <MapPin className="h-5 w-5" />
              <span>{profileData.location}</span>
            </div>
            {profileData.socials.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-text-secondary transition-colors hover:text-primary-600"
              >
                <social.icon className="h-5 w-5" />
                <span>{social.handle}</span>
              </a>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
