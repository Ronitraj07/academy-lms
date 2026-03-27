'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Users, 
  BookOpen, 
  Calendar,
  ClipboardCheck,
  BarChart3,
  MessageSquare,
  Bell,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
  badge?: string | number
}

const navigationItems: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: Home, 
    roles: ['student', 'faculty', 'admin'] 
  },
  { 
    name: 'Users', 
    href: '/admin/users', 
    icon: Users, 
    roles: ['admin'] 
  },
  { 
    name: 'Subjects', 
    href: '/admin/subjects', 
    icon: BookOpen, 
    roles: ['admin', 'faculty'] 
  },
  { 
    name: 'Attendance', 
    href: '/admin/attendance', 
    icon: ClipboardCheck, 
    roles: ['admin', 'faculty'] 
  },
  { 
    name: 'Timetable', 
    href: '/timetable', 
    icon: Calendar, 
    roles: ['student', 'faculty', 'admin'] 
  },
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: BarChart3, 
    roles: ['admin'] 
  },
  { 
    name: 'Remarks', 
    href: '/remarks', 
    icon: MessageSquare, 
    roles: ['student', 'faculty', 'admin'] 
  },
  { 
    name: 'Notifications', 
    href: '/notifications', 
    icon: Bell, 
    roles: ['student', 'faculty', 'admin'],
    badge: 3
  }
]

export function MobileNav() {
  const pathname = usePathname()
  const { user, profile } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  // Filter navigation items based on user role
  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(profile?.role || 'student')
  )

  // Bottom navigation items (4 most important)
  const bottomNavItems = filteredNavItems.slice(0, 4)
  
  // Remaining items for the hamburger menu
  const menuItems = filteredNavItems.slice(4)

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/' || pathname === '/student' || pathname === '/faculty' || pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Bottom Navigation Bar - Mobile Only */}
      <div className="mobile-nav md:hidden">
        <div className="flex items-center justify-around">
          {/* Main navigation items */}
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'mobile-nav-item',
                  active && 'active'
                )}
              >
                <div className="relative">
                  <Icon className="mobile-nav-icon" />
                  {item.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}

          {/* Hamburger menu for additional items */}
          {menuItems.length > 0 && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button className="mobile-nav-item">
                  <div className="relative">
                    <Menu className="mobile-nav-icon" />
                    {menuItems.some(item => item.badge) && (
                      <div className="notification-dot" />
                    )}
                  </div>
                  <span>More</span>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <SheetHeader className="p-6 pb-0">
                  <SheetTitle className="text-left">Navigation Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  <div className="flex-1 px-6 py-4">
                    <div className="space-y-2">
                      {menuItems.map((item) => {
                        const Icon = item.icon
                        const active = isActive(item.href)
                        
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                              active
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="flex-1">{item.name}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        )
                      })}
                    </div>
                    
                    <Separator className="my-6" />
                    
                    {/* User Info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">
                            {user?.email?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user?.email}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {profile?.role}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          Settings
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      {/* Floating Action Button - For Quick Actions */}
      <div className="fixed bottom-20 right-4 z-40 md:hidden">
        {profile?.role === 'faculty' && (
          <Link 
            href="/admin/attendance" 
            className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          >
            <ClipboardCheck className="h-6 w-6" />
          </Link>
        )}
        {profile?.role === 'admin' && (
          <Link 
            href="/admin/users" 
            className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          >
            <Users className="h-6 w-6" />
          </Link>
        )}
      </div>
    </>
  )
}