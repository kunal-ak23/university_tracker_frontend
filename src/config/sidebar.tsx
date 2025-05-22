import {
  LayoutDashboard,
  FileArchiveIcon,
  Building2,
  GraduationCap,
  Users,
  BookOpen,
  Receipt,
  CreditCard,
  FileText,
  Building,
  School,
  Wallet,
  User,
  Handshake,
  Calendar,
  UserPlus,
} from "lucide-react"
import { LucideIcon } from "lucide-react"

export interface SidebarItem {
  title: string
  href: string
  icon: LucideIcon
}

export interface SidebarSection {
  title: string
  items: SidebarItem[]
}

export const sidebarConfig: SidebarSection[] = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Student Management",
    items: [
      {
        title: "Students",
        href: "/students",
        icon: Users,
      },
      {
        title: "Leads",
        href: "/leads",
        icon: UserPlus,
      },
    ],
  },
  {
    title: "Channel Partners",
    items: [
      {
        title: "Partners",
        href: "/channel-partners",
        icon: Building2,
      },
      {
        title: "Student Enrollments",
        href: "/channel-partner-students",
        icon: GraduationCap,
      },
    ],
  },
  {
    title: "OEM Management",
    items: [
      {
        title: "OEMs",
        href: "/oems",
        icon: Building2,
      },
      {
        title: "Programs",
        href: "/programs",
        icon: BookOpen,
      },
      {
        title: "Batches",
        href: "/batches",
        icon: FileText,
      },
    ],
  },
  {
    title: "University Management",
    items: [
      {
        title: "Universities",
        href: "/universities",
        icon: Building2,
      },
      {
        title: "Contracts",
        href: "/contracts",
        icon: FileText,
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        title: "Billings",
        href: "/billings",
        icon: Receipt,
      },
      {
        title: "Invoices",
        href: "/invoices",
        icon: FileText,
      },
      {
        title: "Payments",
        href: "/payments",
        icon: CreditCard,
      },
    ],
  },
] 