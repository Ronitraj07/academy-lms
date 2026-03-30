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
}

const navigationItems: NavItem[] = [
  { name: 'Dashboard',      href: '/dashboard',         icon: Home,          roles: ['student', 'faculty', 'admin'] },
  { name: 'User Management',href: '/admin/users',        icon: Users,         roles: ['admin'] },
  { name: 'Subjects',       href: '/admin/subjects',     icon: BookOpen,      roles: ['admin', 'faculty'] },
  { name: 'Attendance',     href: '/admin/attendance',   icon: ClipboardCheck,roles: ['admin', 'faculty'] },
  { name: 'Timetable',      href: '/timetable',          icon: Calendar,      roles: ['student', 'faculty', 'admin'] },
  { name: 'Analytics',      href: '/analytics',          icon: BarChart3,     roles: ['admin'] },
  { name: 'Remarks',        href: '/remarks',            icon: MessageSquare, roles: ['student', 'faculty', 'admin'] },
  { name: 'Notifications',  href: '/notifications',      icon: Bell,          roles: ['student', 'faculty', 'admin'], badge: 3 },
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

  // 1.2 — auto-collapse on window resize (desktop only)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) setIsCollapsed(true)
      else setIsCollapsed(false)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 1.2 — close mobile drawer when route changes
  useEffect(() => {
    onClose?.()
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

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
    return pathname.startsWith(href)
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

  const filteredNavItems = navigationItems.filter(item =>
    item.roles.includes(profile?.role || 'student')
  )

  const resolvedItems = filteredNavItems.map(item => ({
    ...item,
    href: item.href === '/dashboard' ? getDashboardHref() : item.href,
  }))

  // 1.7 — no early return on !mounted; we always render the sidebar so layout
  // is stable. Visibility for mobile is controlled via translate/opacity only.
  const isMobileVisible = isOpen

  return (
    <>
      {/* 1.1 — Mobile overlay backdrop; only below lg */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          'fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300',
          isMobileVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      {/*
        1.2 + 1.7 — Sidebar element:
        - lg+: static in flex flow, always visible, collapsible
        - <lg: fixed overlay, translated off-screen when closed, slides in when isOpen
        No `returns null` — element always in DOM so layout never shifts.
      */}
      <div
        id="sidebar-nav"
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          // Base
          'flex flex-col h-screen bg-white dark:bg-gray-950 border-r border-border/50 transition-all duration-300 ease-in-out sidebar-blur z-40',
          // Desktop (lg+): static, collapsible width
          'lg:relative lg:translate-x-0 lg:flex',
          isCollapsed ? 'lg:w-16' : 'lg:w-72',
          // Mobile/Tablet (<lg): fixed overlay, translate controls visibility
          'fixed top-0 left-0 h-full w-72',
          isMobileVisible ? 'translate-x-0' : '-translate-x-full',
          // On lg+ override translate so desktop sidebar is always visible
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
              variant="ghost"
              size="icon"
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
                {/* 1.8 bonus — show full_name not just email */}
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
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-modern">
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
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative',
                  active
                    ? 'bg-gradient-to-r from-primary/10 to-purple-600/10 text-primary border border-primary/20 shadow-sm'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground',
                  isCollapsed && 'justify-center px-0 w-11 h-11 mx-auto'
                )}
              >
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

                {/* Tooltip for collapsed desktop state */}
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
        <div className="p-3 space-y-1 shrink-0">
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
