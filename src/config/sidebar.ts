import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Building2,
  UserPlus,
  MessageSquare,
  Settings,
  BarChart3,
  Calendar,
} from "lucide-react"
import { LucideIcon } from "lucide-react"

export type UserRole = "admin" | "agent" | "poc"

export interface SidebarItem {
  title: string
  href: string
  icon: LucideIcon
  roles: UserRole[]
}

export const sidebarConfig: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "agent", "poc"],
  },
  {
    title: "Leads",
    href: "/leads",
    icon: UserPlus,
    roles: ["agent"],
  },
  {
    title: "Students",
    href: "/students",
    icon: GraduationCap,
    roles: ["admin", "poc"],
  },
  {
    title: "Programs",
    href: "/programs",
    icon: BookOpen,
    roles: ["admin", "poc"],
  },
  {
    title: "Universities",
    href: "/universities",
    icon: Building2,
    roles: ["admin", "poc"],
  },
  {
    title: "Events",
    href: "/events",
    icon: Calendar,
    roles: ["admin", "poc"],
  },
  {
    title: "Channel Partners",
    href: "/channel-partners",
    icon: Users,
    roles: ["admin", "poc"],
  },
  {
    title: "Messages",
    href: "/messages",
    icon: MessageSquare,
    roles: ["admin", "agent", "poc"],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["admin", "poc"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["admin", "poc"],
  },
] 