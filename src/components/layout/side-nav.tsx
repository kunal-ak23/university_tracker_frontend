"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth"
import { sidebarConfig } from "@/config/sidebar"

export function SideNav() {
  const pathname = usePathname()
  const { user } = useAuthStore()

  console.log('Current user:', user)
  console.log('User role:', user?.role)

  const filteredNavigation = sidebarConfig.filter((item) => {
    const hasAccess = item.roles.includes(user?.role || "")
    console.log(`Item ${item.title}:`, { roles: item.roles, hasAccess })
    return hasAccess
  })

  console.log('Filtered navigation:', filteredNavigation)

  return (
    <nav className="grid items-start gap-2">
      {filteredNavigation.map((item) => {
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
    </nav>
  )
} 