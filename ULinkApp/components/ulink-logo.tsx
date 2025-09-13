export function ULinkLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>
      <text
        x="0"
        y="24"
        fontFamily="var(--font-cal-sans), sans-serif"
        fontSize="32"
        fontWeight="600"
        fill="url(#logo-gradient)"
      >
        ULink
      </text>
    </svg>
  )
}
