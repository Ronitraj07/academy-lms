'use client'

import { useState } from 'react'
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
  Settings,
  LogOut,
  GraduationCap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
  badge?: boolean // true = show live unread count
  priority: Record<string, number> // per-role priority for bottom bar ordering
}

// 1.5 — each item has role-specific priorities so bottom 4 are always the
// most relevant for that role, not just the first 4 in array order
const navigationItems: NavItem[] = [
  { name: 'Dashboard',  href: '__dashboard__',      icon: Home,          roles: ['student','faculty','admin'], priority: { student:1, faculty:1, admin:1 } },
  { name: 'Timetable',  href: '/timetable',          icon: Calendar,      roles: ['student','faculty','admin'], priority: { student:2, faculty:3, admin:5 } },
  { name: 'Attendance', href: '/admin/attendance',    icon: ClipboardCheck,roles: ['admin','faculty'],          priority: { faculty:2, admin:2 } },
  { name: 'Remarks',    href: '/remarks',             icon: MessageSquare, roles: ['student','faculty','admin'], priority: { student:3, faculty:4, admin:4 } },
  { name: 'Notifications', href: '/notifications',   icon: Bell,          roles: ['student','faculty','admin'], priority: { student:4, faculty:5, admin:6 }, badge: true },
  { name: 'Subjects',   href: '/admin/subjects',      icon: BookOpen,      roles: ['admin','faculty'],          priority: { faculty:6, admin:3 } },
  { name: 'Users',      href: '/admin/users',          icon: Users,         roles: ['admin'],                   priority: { admin:7 } },
  { name: 'Analytics',  href: '/analytics',            icon: BarChart3,     roles: ['admin'],                   priority: { admin:8 } },
]

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut } = useAuth()
  const { unreadCount } = useNotifications()
  const [sheetOpen, setSheetOpen] = useState(false)

  // 1.5 — resolve __dashboard__ placeholder to role-based href
  const getDashboardHref = () => {
    switch (profile?.role) {
      case 'admin':   return '/admin'
      case 'faculty': return '/faculty'
      default:        return '/student'
    }
  }

  const resolveHref = (href: string) =>
    href === '__dashboard__' ? getDashboardHref() : href

  const isActive = (href: string) => {
    const resolved = resolveHref(href)
    if (href === '__dashboard__') {
      return ['/dashboard', '/', '/student', '/faculty', '/admin'].includes(pathname)
    }
    return pathname.startsWith(resolved)
  }

  const role = profile?.role || 'student'

  // 1.5 — filter by role, sort by role-specific priority
  const roleItems = navigationItems
    .filter(item => item.roles.includes(role))
    .sort((a, b) => (a.priority[role] ?? 99) - (b.priority[role] ?? 99))

  const bottomItems = roleItems.slice(0, 4)
  const sheetItems  = roleItems.slice(4)

  const handleSignOut = async () => {
    setSheetOpen(false)
    await signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Bottom Navigation Bar — hidden on lg+ */}
      <div
        className="mobile-nav lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-stretch justify-around h-14">
          {bottomItems.map(item => {
            const Icon = item.icon
            const active = isActive(item.href)
            const href = resolveHref(item.href)
            const badgeCount = item.badge ? unreadCount : 0

            return (
              <Link
                key={item.name}
                href={href}
                className={cn(
                  'mobile-nav-item',
                  active && 'active'
                )}
                aria-label={item.name}
                aria-current={active ? 'page' : undefined}
              >
                <div className="relative">
                  <Icon className="mobile-nav-icon" />
                  {badgeCount > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white"
                      aria-hidden="true"
                    >
                      {badgeCount > 9 ? '9+' : badgeCount}
                    </span>
                  )}
                </div>
                <span className="truncate text-[11px] mt-0.5">{item.name}</span>
              </Link>
            )
          })}

          {/* More sheet trigger — only if there are extra items */}
          {sheetItems.length > 0 && (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <button
                className="mobile-nav-item"
                onClick={() => setSheetOpen(true)}
                aria-label="More navigation options"
              >
                <div className="relative">
                  <GraduationCap className="mobile-nav-icon" />
                  {sheetItems.some(i => i.badge && unreadCount > 0) && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive" aria-hidden="true" />
                  )}
                </div>
                <span className="text-[11px] mt-0.5">More</span>
              </button>

              <SheetContent side="right" className="w-72 p-0 flex flex-col">
                <SheetHeader className="px-5 py-4 border-b">
                  <SheetTitle className="text-left flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-r from-primary to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4 text-white" />
                    </div>
                    Academy LMS
                  </SheetTitle>
                </SheetHeader>

                {/* User info */}
                <div className="px-5 py-4 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src="" alt={profile?.full_name || 'User'} />
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm">
                        {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {profile?.full_name || user?.email?.split('@')[0]}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{role}</p>
                    </div>
                  </div>
                </div>

                {/* Extra nav items */}
                <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
                  {sheetItems.map(item => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    const href = resolveHref(item.href)
                    const badgeCount = item.badge ? unreadCount : 0
                    return (
                      <Link
                        key={item.name}
                        href={href}
                        onClick={() => setSheetOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                          active
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{item.name}</span>
                        {badgeCount > 0 && (
                          <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                            {badgeCount}
                          </Badge>
                        )}
                      </Link>
                    )
                  })}
                </nav>

                <Separator />

                {/* Bottom actions */}
                <div className="px-3 py-3 space-y-1" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
                  <Link
                    href="/settings"
                    onClick={() => setSheetOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      {/* 1.6 — FAB: positioned above bottom nav + safe area inset */}
      {(profile?.role === 'faculty' || profile?.role === 'admin') && (
        <div
          className="fixed right-4 z-40 lg:hidden"
          style={{ bottom: 'calc(3.5rem + env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
        >
          <Link
            href={profile.role === 'admin' ? '/admin/users' : '/admin/attendance'}
            className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow"
            aria-label={profile.role === 'admin' ? 'Manage users' : 'Mark attendance'}
          >
            {profile.role === 'admin'
              ? <Users className="h-5 w-5" />
              : <ClipboardCheck className="h-5 w-5" />}
          </Link>
        </div>
      )}
    </>
  )
}
