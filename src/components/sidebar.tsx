'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Home, 
  Users, 
  BookOpen, 
  Calendar,
  ClipboardCheck,
  BarChart3,
  MessageSquare,
  Bell,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  GraduationCap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
  badge?: string | number
  description?: string
}

const navigationItems: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: Home, 
    roles: ['student', 'faculty', 'admin'],
    description: 'Overview and statistics'
  },
  { 
    name: 'User Management', 
    href: '/admin/users', 
    icon: Users, 
    roles: ['admin'],
    description: 'Manage students and faculty'
  },
  { 
    name: 'Subjects', 
    href: '/admin/subjects', 
    icon: BookOpen, 
    roles: ['admin', 'faculty'],
    description: 'Course management'
  },
  { 
    name: 'Attendance', 
    href: '/admin/attendance', 
    icon: ClipboardCheck, 
    roles: ['admin', 'faculty'],
    description: 'Mark and track attendance'
  },
  { 
    name: 'Timetable', 
    href: '/timetable', 
    icon: Calendar, 
    roles: ['student', 'faculty', 'admin'],
    description: 'Schedule management'
  },
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: BarChart3, 
    roles: ['admin'],
    description: 'Performance insights'
  },
  { 
    name: 'Remarks', 
    href: '/remarks', 
    icon: MessageSquare, 
    roles: ['student', 'faculty', 'admin'],
    description: 'Student feedback'
  },
  { 
    name: 'Notifications', 
    href: '/notifications', 
    icon: Bell, 
    roles: ['student', 'faculty', 'admin'],
    badge: 3,
    description: 'System alerts'
  }
]

interface SidebarProps {
  className?: string
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ className, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!mounted) {
    return null
  }

  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(profile?.role || 'student')
  )

  // Resolve dashboard href based on actual role
  const getDashboardHref = () => {
    switch (profile?.role) {
      case 'admin': return '/admin'
      case 'faculty': return '/faculty'
      default: return '/student'
    }
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/' || pathname === '/student' || pathname === '/faculty' || pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-gradient-to-r from-red-500 to-pink-500'
      case 'faculty': return 'bg-gradient-to-r from-blue-500 to-indigo-500'
      case 'student': return 'bg-gradient-to-r from-green-500 to-emerald-500'
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600'
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const resolvedItems = filteredNavItems.map(item => ({
    ...item,
    href: item.href === '/dashboard' ? getDashboardHref() : item.href
  }))

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div 
        id="sidebar-nav"
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          'flex flex-col h-screen bg-white dark:bg-gray-950 border-r border-border/50 transition-all duration-300 ease-in-out sidebar-blur z-40',
          // Desktop: always visible, collapsible
          'hidden md:flex',
          isCollapsed ? 'md:w-16' : 'md:w-72',
          // Mobile: fixed overlay when open
          isOpen && 'fixed top-0 left-0 flex md:relative w-72',
          className
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-gradient">Academy LMS</h2>
                  <p className="text-xs text-muted-foreground">Management System</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 hover:bg-muted hidden md:flex"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-border/50">
          <div className={cn(
            'flex items-center gap-3',
            isCollapsed && 'justify-center'
          )}>
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src="" alt={user?.email ?? 'User avatar'} />
              <AvatarFallback className={getRoleBadgeColor(profile?.role || 'student')}>
                <span className="text-white font-semibold">
                  {user?.email?.[0]?.toUpperCase()}
                </span>
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user?.email}</p>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      'text-xs capitalize text-white border-0',
                      getRoleBadgeColor(profile?.role || 'student')
                    )}
                  >
                    {profile?.role}
                  </Badge>
                  <div className="status-indicator status-online"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 scrollbar-modern overflow-y-auto">
          {resolvedItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative',
                  active
                    ? 'bg-gradient-to-r from-primary/10 to-purple-600/10 text-primary border border-primary/20 shadow-sm'
                    : 'hover:bg-muted hover:shadow-sm text-muted-foreground hover:text-foreground',
                  isCollapsed && 'justify-center px-0 w-12 h-12 mx-auto'
                )}
              >
                <div className="relative">
                  <Icon className={cn(
                    'transition-colors duration-300',
                    active ? 'text-primary' : 'group-hover:text-foreground',
                    isCollapsed ? 'h-5 w-5' : 'h-4 w-4'
                  )} />
                  {item.badge && !isCollapsed && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center animate-pulse"
                      aria-hidden="true"
                    >
                      {item.badge}
                    </Badge>
                  )}
                  {item.badge && isCollapsed && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" aria-hidden="true"></div>
                  )}
                </div>
                
                {!isCollapsed && (
                  <>
                    <div className="flex-1">
                      <span>{item.name}</span>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 font-normal">
                          {item.description}
                        </p>
                      )}
                    </div>
                    {item.badge && (
                      <Badge variant="secondary" className="h-5 px-2 text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border text-sm whitespace-nowrap">
                      {item.name}
                      {item.badge && (
                        <Badge variant="destructive" className="ml-2 h-4 w-4 p-0 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        <Separator className="mx-4" />

        {/* Footer Actions */}
        <div className="p-4 space-y-2">
          <Link
            href="/settings"
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-muted text-muted-foreground hover:text-foreground group relative',
              isCollapsed && 'justify-center px-0 w-12 h-12 mx-auto'
            )}
          >
            <Settings className={cn(
              'transition-colors duration-300 group-hover:text-foreground',
              isCollapsed ? 'h-5 w-5' : 'h-4 w-4'
            )} />
            {!isCollapsed && <span>Settings</span>}
            {isCollapsed && (
              <div className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border text-sm whitespace-nowrap">Settings</div>
              </div>
            )}
          </Link>
          
          <button
            onClick={handleSignOut}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-destructive/10 text-muted-foreground hover:text-destructive w-full group relative',
              isCollapsed && 'justify-center px-0 w-12 h-12 mx-auto'
            )}
            aria-label="Sign out"
          >
            <LogOut className={cn(
              'transition-colors duration-300 group-hover:text-destructive',
              isCollapsed ? 'h-5 w-5' : 'h-4 w-4'
            )} />
            {!isCollapsed && <span>Sign Out</span>}
            {isCollapsed && (
              <div className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border text-sm whitespace-nowrap">Sign Out</div>
              </div>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
