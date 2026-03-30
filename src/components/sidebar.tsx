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
  GraduationCap,
  UserCheck,
  ClipboardList,
  Send,
  FileText,
  User
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
}

const navigationItems: NavItem[] = [
  // ── Shared ────────────────────────────────────────────────────────────────
  { name: 'Dashboard',        href: '/dashboard',               icon: Home,          roles: ['student', 'faculty', 'admin'] },
  { name: 'Notifications',    href: '/notifications',           icon: Bell,          roles: ['student', 'faculty', 'admin'], badge: 3 },

  // ── Student ───────────────────────────────────────────────────────────────
  { name: 'Attendance',       href: '/student/attendance',      icon: UserCheck,     roles: ['student'] },
  { name: 'Timetable',        href: '/student/timetable',       icon: Calendar,      roles: ['student'] },
  { name: 'Subjects',         href: '/student/subjects',        icon: BookOpen,      roles: ['student'] },
  { name: 'Remarks',          href: '/student/remarks',         icon: MessageSquare, roles: ['student'] },

  // ── Faculty ───────────────────────────────────────────────────────────────
  { name: 'My Subjects',      href: '/faculty/subjects',        icon: BookOpen,      roles: ['faculty'] },
  { name: 'Attendance',       href: '/faculty/attendance',      icon: ClipboardList, roles: ['faculty'] },
  { name: 'Students',         href: '/faculty/students',        icon: Users,         roles: ['faculty'] },
  { name: 'Timetable',        href: '/faculty/timetable',       icon: Calendar,      roles: ['faculty'] },
  { name: 'Remarks',          href: '/faculty/remarks',         icon: MessageSquare, roles: ['faculty'] },
  { name: 'Analytics',        href: '/faculty/analytics',       icon: BarChart3,     roles: ['faculty'] },
  { name: 'Send Notification',href: '/notifications/send',      icon: Send,          roles: ['faculty', 'admin'] },

  // ── Admin ─────────────────────────────────────────────────────────────────
  { name: 'User Management',  href: '/admin/users',             icon: Users,         roles: ['admin'] },
  { name: 'Students',         href: '/admin/students',          icon: GraduationCap, roles: ['admin'] },
  { name: 'Faculty',          href: '/admin/faculty',           icon: User,          roles: ['admin'] },
  { name: 'Subjects',         href: '/admin/subjects',          icon: BookOpen,      roles: ['admin'] },
  { name: 'Enrollments',      href: '/admin/enrollments',       icon: ClipboardList, roles: ['admin'] },
  { name: 'Attendance',       href: '/admin/attendance',        icon: ClipboardCheck,roles: ['admin'] },
  { name: 'Analytics',        href: '/analytics',               icon: BarChart3,     roles: ['admin'] },
  { name: 'Feedback',         href: '/admin/feedback',          icon: FileText,      roles: ['admin'] },
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

  // Auto-collapse only in the 1024-1279px gap zone (between lg and xl).
  // Below 1024px the mobile nav handles navigation.
  // Above 1280px always expand fully.
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth
      if (w >= 1024 && w < 1280) setIsCollapsed(true)
      else if (w >= 1280)        setIsCollapsed(false)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => { onClose?.() }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  const getDashboardHref = () => {
    switch (profile?.role) {
      case 'admin':   return '/admin'
      case 'faculty': return '/faculty'
      default:        return '/student'
    }
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return ['/dashboard', '/', '/student', '/faculty', '/admin'].includes(pathname)
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':   return 'bg-gradient-to-r from-red-500 to-pink-500'
      case 'faculty': return 'bg-gradient-to-r from-blue-500 to-indigo-500'
      case 'student': return 'bg-gradient-to-r from-green-500 to-emerald-500'
      default:        return 'bg-gradient-to-r from-gray-500 to-gray-600'
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  // Filter by role, then resolve /dashboard to role-specific href
  const resolvedItems = navigationItems
    .filter(item => item.roles.includes(profile?.role || 'student'))
    .map(item => ({
      ...item,
      href: item.href === '/dashboard' ? getDashboardHref() : item.href,
    }))

  return (
    <>
      {/* Mobile overlay */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      <div
        id="sidebar-nav"
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          'flex flex-col h-screen bg-white dark:bg-gray-950 border-r border-border/50 transition-all duration-300 ease-in-out sidebar-blur z-40',
          'lg:relative lg:translate-x-0 lg:flex',
          isCollapsed ? 'lg:w-16' : 'lg:w-72',
          'fixed top-0 left-0 h-full w-72',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
          className
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border/50 shrink-0">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-lg text-gradient leading-tight">Academy LMS</h2>
                  <p className="text-xs text-muted-foreground">Management System</p>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center mx-auto">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
            )}
            <Button
              variant="ghost" size="icon"
              onClick={() => setIsCollapsed(c => !c)}
              className="h-8 w-8 hover:bg-muted hidden lg:flex shrink-0"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-border/50 shrink-0">
          <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
            <Avatar className="h-10 w-10 ring-2 ring-primary/20 shrink-0">
              <AvatarImage src="" alt={profile?.full_name ?? user?.email ?? 'User'} />
              <AvatarFallback className={getRoleBadgeColor(profile?.role || 'student')}>
                <span className="text-white font-semibold text-sm">
                  {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
                </span>
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge
                    variant="secondary"
                    className={cn('text-xs capitalize text-white border-0 px-2 py-0', getRoleBadgeColor(profile?.role || 'student'))}
                  >
                    {profile?.role || 'student'}
                  </Badge>
                  <div className="status-indicator status-online" aria-hidden="true" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-modern">
          {resolvedItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={`${item.name}-${item.href}`}
                href={item.href}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                  active
                    ? 'bg-primary/8 text-primary border border-primary/15'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground',
                  isCollapsed && 'justify-center px-0 w-11 h-11 mx-auto'
                )}
              >
                {/* Active left-border indicator */}
                {active && !isCollapsed && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary"
                  />
                )}

                <div className="relative shrink-0">
                  <Icon className={cn(
                    'transition-colors duration-200',
                    active ? 'text-primary' : 'group-hover:text-foreground',
                    isCollapsed ? 'h-5 w-5' : 'h-4 w-4'
                  )} />
                  {item.badge && isCollapsed && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
                  )}
                </div>

                {!isCollapsed && (
                  <>
                    <span className="flex-1 truncate">{item.name}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs shrink-0">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}

                {isCollapsed && (
                  <div
                    role="tooltip"
                    className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50"
                  >
                    <div className="bg-popover text-popover-foreground px-3 py-1.5 rounded-lg shadow-lg border text-sm whitespace-nowrap">
                      {item.name}
                    </div>
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        <Separator className="mx-3 shrink-0" />

        {/* Footer */}
        <div className="p-3 space-y-0.5 shrink-0">
          <Link
            href="/settings"
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-muted text-muted-foreground hover:text-foreground group relative',
              isCollapsed && 'justify-center px-0 w-11 h-11 mx-auto'
            )}
          >
            <Settings className={cn('h-4 w-4 shrink-0', isCollapsed && 'h-5 w-5')} />
            {!isCollapsed && <span>Settings</span>}
            {isCollapsed && (
              <div role="tooltip" className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                <div className="bg-popover text-popover-foreground px-3 py-1.5 rounded-lg shadow-lg border text-sm whitespace-nowrap">Settings</div>
              </div>
            )}
          </Link>

          <button
            onClick={handleSignOut}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-destructive/10 text-muted-foreground hover:text-destructive w-full group relative',
              isCollapsed && 'justify-center px-0 w-11 h-11 mx-auto'
            )}
            aria-label="Sign out"
          >
            <LogOut className={cn('h-4 w-4 shrink-0', isCollapsed && 'h-5 w-5')} />
            {!isCollapsed && <span>Sign Out</span>}
            {isCollapsed && (
              <div role="tooltip" className="absolute left-14 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                <div className="bg-popover text-popover-foreground px-3 py-1.5 rounded-lg shadow-lg border text-sm whitespace-nowrap">Sign Out</div>
              </div>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
