import { User } from "@prisma/client"

export type NavItem = {
  title: string
  href: string
  disabled?: boolean
}

export type MainNavItem = NavItem

export type SiteConfig = {
  name: string
  description: string
  url: string
  links: {
    github: string
  }
}

export type UserProfile = User & {
  personalityProfile?: {
    traits: Record<string, number>
    interests: string[]
  }
}

export type DashboardConfig = {
  mainNav: MainNavItem[]
  sidebarNav: NavItem[]
} 