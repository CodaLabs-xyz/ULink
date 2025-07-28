# CLAUDE.md - ULink Development Guide

This guide provides essential context for Claude Code instances working with the ULink project.

## Project Overview

**ULink** is a modern link-in-bio platform with Web3 integration, built on Next.js 15 with TypeScript. It enables creators and businesses to create beautiful, customizable link hubs with powerful analytics and blockchain connectivity.

### Core Value Proposition
- Beautiful, customizable link hubs
- Real-time analytics with GeoIP tracking
- Web3 integration (Base L2 blockchain)
- QR code generation with embedded logos
- Drag-and-drop layout editor
- Multi-tier membership system

## Technology Stack

- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.17 + shadcn/ui
- **UI Components**: 35+ Radix UI components
- **Fonts**: Inter (sans-serif) + Cal Sans (display)
- **Icons**: Lucide React
- **Analytics**: Custom with Recharts
- **QR Codes**: qrcode.react
- **Drag & Drop**: @dnd-kit
- **Forms**: React Hook Form + Zod validation

## High-Level Architecture

### 1. App Router Structure
```
app/
├── page.tsx                    # Landing page
├── layout.tsx                  # Root layout with fonts
├── globals.css                 # Global styles + CSS variables
├── dashboard/
│   ├── page.tsx               # User dashboard
│   └── [project-id]/
│       └── page.tsx           # Project details/editor
├── admin/
│   └── page.tsx               # Platform administration
└── [project-slug]/
    └── page.tsx               # Public project pages
```

### 2. Component Organization
```
components/
├── ui/                        # shadcn/ui base components (35+)
├── dashboard/                 # Dashboard-specific components
├── admin/                     # Admin panel components
├── [page-name]/              # Page-specific components
├── header.tsx                # Global navigation
├── hero.tsx                  # Landing page hero
├── features.tsx              # Feature showcase
├── pricing.tsx               # Pricing plans
└── footer.tsx                # Global footer
```

### 3. Design System Architecture

#### Color System (Tier-Based)
- **Silver**: Light neutral tones (#f8fafc → #475569)
- **Platinum**: Mid-range neutrals (#fafafa → #71717a)  
- **Gold**: Premium accent colors (#fffbeb → #d97706)
- **Primary**: Blue scale (#f0f9ff → #0c4a6e)
- **Semantic**: success, warning, error, info

#### Typography System
- **Sans**: Inter font family (primary text)
- **Display**: Cal Sans font family (headings/brand)
- **Variables**: `--font-inter`, `--font-cal-sans`

## Key Configuration Files

### tailwind.config.ts
- Custom color palette with tier system
- Font family configurations
- Container settings and responsive breakpoints
- Custom animations (accordion effects)
- shadcn/ui CSS variable integration

### components.json
- shadcn/ui configuration
- Component aliases and paths
- Lucide icon library setup
- TypeScript and RSC enabled

### package.json
- Next.js 15 + React 19 stack
- Comprehensive Radix UI component suite
- Development tools (TypeScript, Tailwind)
- Web3 libraries (future integration)

## Data Architecture

### Core Interfaces
```typescript
// Project structure
interface Project {
  id: string
  title: string
  description: string
  logo?: string
  heroImage?: string
  links: Link[]
  analytics: Analytics
  settings: ProjectSettings
}

// Link types
interface Link {
  id: string
  label: string
  url: string
  type: 'web' | 'social' | 'calendar' | 'form'
  isDefault?: boolean
  analytics: LinkAnalytics
}
```

### Mock Data Strategy
- Comprehensive mock data throughout prototype
- Realistic sample projects and analytics
- Ready for backend integration
- TypeScript interfaces define data contracts

## Development Patterns

### 1. Component Development
```typescript
// Standard component pattern
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ComponentProps {
  className?: string
  // Define props with TypeScript
}

export function Component({ className, ...props }: ComponentProps) {
  return (
    <div className={cn("base-classes", className)}>
      {/* Component content */}
    </div>
  )
}
```

### 2. Page Structure Pattern
```typescript
// Standard page component
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page Title - ULink",
  description: "Page description"
}

export default function PageName() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Page content */}
    </div>
  )
}
```

### 3. Styling Conventions
- Use semantic color classes: `bg-surface`, `text-primary`
- Prefer Tailwind utilities over custom CSS
- Use `cn()` utility for conditional classes
- Follow mobile-first responsive design

## Development Workflow

### Essential Commands
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# shadcn/ui components
npx shadcn-ui@latest add [component]   # Add new UI components
```

### Common Development Tasks

1. **Adding New Pages**
   - Create in appropriate app/ directory
   - Add metadata export
   - Follow existing layout patterns

2. **Creating Components**
   - Use shadcn/ui as base when possible
   - Place in appropriate components/ subdirectory
   - Export from index files for clean imports

3. **Styling New Elements**
   - Use existing color system (silver/platinum/gold)
   - Follow spacing and typography conventions
   - Test responsive behavior

## Key Files for New Developers

### Must Read First
1. `tailwind.config.ts` - Design system configuration
2. `app/layout.tsx` - Global layout and font setup
3. `components/ui/` - Base component library
4. `app/page.tsx` - Landing page example

### Architecture Understanding
1. `app/dashboard/page.tsx` - Dashboard patterns
2. `app/admin/page.tsx` - Admin interface patterns
3. `app/[project-slug]/page.tsx` - Public page patterns
4. `components/dashboard/` - Feature-specific components

## Integration Points

### Future Backend Integration
- Mock data in components ready for API replacement
- TypeScript interfaces define data contracts
- Analytics components ready for real-time data
- Authentication placeholders in place

### Web3 Integration
- Base L2 blockchain targeting
- Wallet connection components prepared
- Smart contract interaction patterns defined

### Analytics System
- GeoIP tracking implementation ready
- Chart components with Recharts
- Real-time data display patterns

## Common Patterns

### 1. Conditional Rendering
```typescript
{isLoading ? <LoadingSpinner /> : <Content />}
{error && <ErrorMessage error={error} />}
```

### 2. Form Handling
```typescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const schema = z.object({
  // Define validation schema
})

const form = useForm({
  resolver: zodResolver(schema)
})
```

### 3. Data Fetching Preparation
```typescript
// Ready for React Query/SWR integration
const [data, setData] = useState(mockData)
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)
```

## Performance Considerations

- Next.js 15's optimized App Router
- Lazy loading with dynamic imports ready
- Image optimization with Next.js Image
- Bundle analysis available via build tools
- Component-level code splitting prepared

## Quick Start for New Features

1. **Identify the feature domain** (dashboard, admin, public)
2. **Check existing patterns** in similar components
3. **Use shadcn/ui components** as building blocks
4. **Follow color system** (silver/platinum/gold tiers)
5. **Add TypeScript interfaces** for data structures
6. **Test responsive behavior** across breakpoints
7. **Consider analytics integration** for user interactions

This guide provides the essential context needed to be immediately productive in the ULink codebase. The project follows modern React/Next.js patterns with a comprehensive design system and clear architectural boundaries.