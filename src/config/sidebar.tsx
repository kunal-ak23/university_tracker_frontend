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
  BarChart3,
  Settings,
  Calendar,
  Calculator,
} from "lucide-react"
import { LucideIcon } from "lucide-react"

export type UserRole = "admin" | "agent" | "provider_poc" | "university_poc" | "channel_partner_poc" | "staff"

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
    roles: ["admin", "agent", "provider_poc", "university_poc", "channel_partner_poc", "staff"],
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["admin", "agent", "provider_poc", "university_poc", "channel_partner_poc", "staff"],
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
        title: "Batches",
        href: "/batches",
        icon: FileText,
        roles: ["admin", "provider_poc"],
      },
    ],
  },
  {
    title: "University Management",
    roles: ["admin", "university_poc", "staff"],
    items: [
      {
        title: "Universities",
        href: "/universities",
        icon: Building2,
        roles: ["admin", "university_poc", "staff"],
      },
      {
        title: "Contracts",
        href: "/contracts",
        icon: FileText,
        roles: ["admin", "university_poc", "staff"],
      },
      {
        title: "Events",
        href: "/events",
        icon: Calendar,
        roles: ["admin", "university_poc", "staff"],
      },
    ],
  },
  {
    title: "Finance",
    roles: ["admin", "staff"],
    items: [
      {
        title: "Receivables",
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
      {
        title: "Expenses",
        href: "/expenses",
        icon: BarChart3,
        roles: ["admin", "university_poc", "staff"],
      },
      {
        title: "Ledger",
        href: "/ledger",
        icon: Calculator,
        roles: ["admin"],
      }
    ],
  },
  {
    title: "Administration",
    roles: ["admin"],
    items: [
      {
        title: "User Management",
        href: "/user-management",
        icon: Users,
        roles: ["admin"],
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        roles: ["admin"],
      },
    ],
  },
] 