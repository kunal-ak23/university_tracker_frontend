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
} from "lucide-react"

export const sidebarConfig = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Student Management",
    icon: User,
    items: [
      {
        title: "Students",
        href: "/students",
        icon: Users,
      },
    ],
  },
  {
    title: "Channel Partners",
    icon: Handshake,
    items: [
      {
        title: "Partners",
        href: "/channel-partners",
        icon: Handshake,
      },
    ],
  },
  {
    title: "OEM Management",
    icon: Building,
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
    ],
  },
  {
    title: "University Management",
    icon: School,
    items: [
      {
        title: "Universities",
        href: "/universities",
        icon: GraduationCap,
      },
      {
        title: "Batches",
        href: "/batches",
        icon: Users,
      },
      {
        title: "Contracts",
        href: "/contracts",
        icon: FileArchiveIcon,
      },
    ],
  },
  {
    title: "Finance",
    icon: Wallet,
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