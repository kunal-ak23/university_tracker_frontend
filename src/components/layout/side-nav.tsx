"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { sidebarConfig, UserRole } from "@/config/sidebar"
import { useSession } from "next-auth/react"
import { cn } from "@/service/utils"

export interface SidebarItem {
  title: string
  href: string
  icon: any
  roles: UserRole[]
}

export interface SidebarSection {
  title: string
  items: SidebarItem[]
  roles: UserRole[]
}

export function SideNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user

  // Filter sections and items based on user role
  const filteredNavigation = ((sidebarConfig as unknown) as SidebarSection[]).filter((section) => {
    const userRole = (user?.role || "") as UserRole
    return section.roles.includes(userRole)
  }).map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      const userRole = (user?.role || "") as UserRole
      return item.roles.includes(userRole)
    })
  })).filter(section => section.items.length > 0)

  return (
    <nav className="grid items-start gap-2">
      {filteredNavigation.map((section) => (
        <div key={section.title} className="space-y-1">
          <h4 className="px-3 text-sm font-semibold text-muted-foreground">
            {section.title}
          </h4>
          {section.items.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent" : "transparent"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
} 
