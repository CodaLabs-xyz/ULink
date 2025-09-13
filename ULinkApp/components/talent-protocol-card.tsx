"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, MapPin } from "lucide-react"

const talentData = {
  ensName: "JulioMCruz.base.eth",
  location: "VA, United States",
  bio: "OnChain Engineer | Developing decentralized solutions that empower",
  profileUrl: "#",
  builderScore: 454,
  maxScore: 1000, // Assuming a max score for percentage calculation
}

function TalentProtocolLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </svg>
  )
}

function BuilderScoreGauge({ score, maxScore }: { score: number; maxScore: number }) {
  const percentage = (score / maxScore) * 100
  const circumference = 2 * Math.PI * 45 // radius = 45
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative h-32 w-32">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" strokeWidth="10" className="stroke-gray-700" fill="transparent" />
        <circle
          cx="50"
          cy="50"
          r="45"
          strokeWidth="10"
          className="stroke-gray-300"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-sm text-gray-400">points</span>
      </div>
    </div>
  )
}

export function TalentProtocolCard() {
  return (
    <div className="rounded-2xl bg-gray-900 p-6 text-white shadow-lg">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        {/* Left Side */}
        <div className="flex flex-1 items-start gap-4">
          <TalentProtocolLogo className="mt-1 h-8 w-8 flex-shrink-0 text-gray-400" />
          <div className="flex flex-col">
            <h3 className="text-xl font-bold">{talentData.ensName}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
              <MapPin className="h-4 w-4" />
              {talentData.location}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-300">
              <span className="text-lg">🚀</span>
              {talentData.bio}
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4 w-fit bg-gray-700/80 text-white hover:bg-gray-600"
              asChild
            >
              <a href={talentData.profileUrl} target="_blank" rel="noopener noreferrer">
                View Profile <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex flex-shrink-0 flex-col items-center">
          <h4 className="text-sm font-semibold text-gray-400">Builder Score</h4>
          <div className="mt-2">
            <BuilderScoreGauge score={talentData.builderScore} maxScore={talentData.maxScore} />
          </div>
        </div>
      </div>
    </div>
  )
}
