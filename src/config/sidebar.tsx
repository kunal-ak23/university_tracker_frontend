import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  Users,
  BookOpen,
  Receipt,
  CreditCard,
  FileText,
  UserPlus,
} from "lucide-react"
import { LucideIcon } from "lucide-react"

export type UserRole = "admin" | "agent" | "provider_poc" | "university_poc" | "channel_partner_poc"

export interface SidebarItem {
  title: string
  href: string
  icon: LucideIcon
  roles: UserRole[]
}

export interface SidebarSection {
  title: string
  items: SidebarItem[]
  roles: UserRole[]
}

export const sidebarConfig: SidebarSection[] = [
  {
    title: "Dashboard",
    roles: ["admin", "agent", "provider_poc", "university_poc", "channel_partner_poc"],
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["admin", "agent", "provider_poc", "university_poc", "channel_partner_poc"],
      },
    ],
  },
  {
    title: "Student Management",
    roles: ["admin", "agent", "provider_poc", "university_poc"],
    items: [
      {
        title: "Students",
        href: "/students",
        icon: Users,
        roles: ["admin", "provider_poc", "university_poc"],
      },
      {
        title: "Leads",
        href: "/leads",
        icon: UserPlus,
        roles: ["admin", "agent"],
      },
    ],
  },
  {
    title: "Channel Partners",
    roles: ["admin", "channel_partner_poc"],
    items: [
      {
        title: "Partners",
        href: "/channel-partners",
        icon: Building2,
        roles: ["admin", "channel_partner_poc"],
      },
      {
        title: "Student Enrollments",
        href: "/channel-partner-students",
        icon: GraduationCap,
        roles: ["admin", "channel_partner_poc"],
      },
    ],
  },
  {
    title: "OEM Management",
    roles: ["admin", "provider_poc"],
    items: [
      {
        title: "OEMs",
        href: "/oems",
        icon: Building2,
        roles: ["admin", "provider_poc"],
      },
      {
        title: "Programs",
        href: "/programs",
        icon: BookOpen,
        roles: ["admin", "provider_poc"],
      },
      {
        title: "Batches",
        href: "/batches",
        icon: FileText,
        roles: ["admin", "provider_poc"],
      },
    ],
  },
  {
    title: "University Management",
    roles: ["admin", "university_poc"],
    items: [
      {
        title: "Universities",
        href: "/universities",
        icon: Building2,
        roles: ["admin", "university_poc"],
      },
      {
        title: "Contracts",
        href: "/contracts",
        icon: FileText,
        roles: ["admin", "university_poc"],
      },
    ],
  },
  {
    title: "Finance",
    roles: ["admin"],
    items: [
      {
        title: "Billings",
        href: "/billings",
        icon: Receipt,
        roles: ["admin"],
      },
      {
        title: "Invoices",
        href: "/invoices",
        icon: FileText,
        roles: ["admin"],
      },
      {
        title: "Payments",
        href: "/payments",
        icon: CreditCard,
        roles: ["admin"],
      },
    ],
  },
] 