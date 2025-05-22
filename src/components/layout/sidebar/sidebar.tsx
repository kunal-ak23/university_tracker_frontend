"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { sidebarConfig, UserRole } from "@/config/sidebar"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/service/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSession } from "next-auth/react"

const SIDEBAR_STATE_KEY = 'sidebar-collapsed'

interface SidebarItem {
  title: string
  href: string
  icon: any
  roles: UserRole[]
}

interface SidebarSection {
  title: string
  items: SidebarItem[]
  roles: UserRole[]
}

export function Sidebar({className}: {className?: string}) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { data: session } = useSession()

  // Load initial state from localStorage
  useEffect(() => {
    const storedState = localStorage.getItem(SIDEBAR_STATE_KEY)
    if (storedState !== null) {
      setIsCollapsed(storedState === 'true')
    }
  }, [])

  // Update localStorage when state changes
  const toggleCollapsed = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem(SIDEBAR_STATE_KEY, newState.toString())
  }

  // Filter sections and items based on user role
  const filteredConfig = ((sidebarConfig as unknown) as SidebarSection[]).filter(section => {
    const userRole = (session?.user?.role || "") as UserRole
    return section.roles.includes(userRole)
  }).map(section => ({
    ...section,
    items: section.items.filter(item => {
      const userRole = (session?.user?.role || "") as UserRole
      return item.roles.includes(userRole)
    })
  })).filter(section => section.items.length > 0)

  return (
    <div className={cn(
      "relative flex flex-col bg-background",
      isCollapsed ? "w-16" : "w-64",
      "transition-all duration-300 ease-in-out",
      className
    )}>
      <div className="hidden lg:block">
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-4 top-6 h-8 w-8 rounded-full border bg-background"
          onClick={toggleCollapsed}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <TooltipProvider delayDuration={0}>
              {filteredConfig.map((section) => (
                <div key={section.title} className="space-y-1">
                  {!isCollapsed && (
                    <h4 className="px-2 text-sm font-semibold text-muted-foreground">
                      {section.title}
                    </h4>
                  )}
                  {section.items.map((item) => (
                    <Tooltip key={item.href} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Link href={item.href}>
                          <Button
                            variant={pathname === item.href ? "secondary" : "ghost"}
                            className={cn(
                              "w-full justify-start",
                              isCollapsed && "justify-center px-2"
                            )}
                          >
                            <item.icon className={cn(
                              "h-4 w-4",
                              !isCollapsed && "mr-2"
                            )} />
                            {!isCollapsed && item.title}
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right">
                          {item.title}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  ))}
                </div>
              ))}
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  )
} 
