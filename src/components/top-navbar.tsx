'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Search,
  Menu,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  ChevronDown,
  X,
  CheckCheck
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface TopNavbarProps {
  onMenuClick?: () => void
  isSidebarOpen?: boolean
}

export function TopNavbar({ onMenuClick, isSidebarOpen }: TopNavbarProps) {
  const { user, profile, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  // 1.4 — mobile search expand state
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // 1.4 — real notifications from hook instead of mock array
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  useEffect(() => { setMounted(true) }, [])

  // Focus search input when expanded on mobile
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus()
  }, [searchOpen])

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':   return 'from-red-500 to-pink-500'
      case 'faculty': return 'from-blue-500 to-indigo-500'
      case 'student': return 'from-green-500 to-emerald-500'
      default:        return 'from-gray-500 to-gray-600'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'attendance':     return 'text-green-500'
      case 'remark':         return 'text-blue-500'
      case 'announcement':   return 'text-purple-500'
      case 'admin_message':  return 'text-orange-500'
      default:               return 'text-muted-foreground'
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
    }
  }

  if (!mounted) return null

  return (
    <header className="navbar-glass border-b border-border/50 px-3 md:px-6 py-2 shrink-0">
      {/* 1.4 — Mobile search overlay */}
      {searchOpen && (
        <div className="absolute inset-0 z-50 flex items-center px-3 bg-background/95 backdrop-blur-sm lg:hidden">
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              ref={searchInputRef}
              type="search"
              placeholder="Search students, subjects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              aria-label="Search"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => { setSearchOpen(false); setSearchQuery('') }}
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      <div className="flex items-center justify-between w-full gap-2">
        {/* Left */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* 1.1 — Hamburger: visible below lg, triggers parent state */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-11 w-11 shrink-0"
            onClick={onMenuClick}
            aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isSidebarOpen}
            aria-controls="sidebar-nav"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Search bar — visible sm+ on desktop, hidden on mobile (uses overlay) */}
          <form onSubmit={handleSearch} role="search" className="relative flex-1 max-w-sm hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search students, subjects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
              aria-label="Search"
            />
          </form>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 shrink-0">
          {/* 1.4 — Mobile search toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-11 w-11"
            aria-label="Open search"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Theme toggle — 1.6 ensure ≥44px touch target */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-11 w-11"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* 1.4 — Notifications wired to real hook */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 relative"
                aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground"
                    aria-hidden="true"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h4 className="font-semibold text-sm">Notifications</h4>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1"
                    onClick={() => markAllAsRead()}
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </Button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto scrollbar-modern" role="list" aria-label="Notifications">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.slice(0, 10).map(n => (
                      <button
                        key={n.id}
                        role="listitem"
                        onClick={() => markAsRead(n.id)}
                        className={cn(
                          'w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors',
                          !n.is_read && 'bg-primary/5'
                        )}
                      >
                        <div className="flex gap-3 items-start">
                          <div className={cn('mt-0.5 shrink-0', getNotificationColor(n.type))}>
                            <Bell className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{n.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.content}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {new Date(n.created_at).toLocaleString()}
                            </p>
                          </div>
                          {!n.is_read && (
                            <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" aria-label="Unread" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="px-4 py-2 border-t">
                <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                  <Link href="/notifications">View all notifications</Link>
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-11 px-2 gap-2">
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarImage src="" alt={profile?.full_name ?? user?.email ?? 'User'} />
                  <AvatarFallback className={cn('text-white text-xs font-semibold bg-gradient-to-r', getRoleBadgeColor(profile?.role || 'student'))}>
                    {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left min-w-0">
                  {/* 1.8 bonus — show full_name */}
                  <p className="text-sm font-medium truncate max-w-[120px]">
                    {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{profile?.role}</p>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <p className="text-sm font-medium">{profile?.full_name || user?.email}</p>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">{profile?.role}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile"><User className="h-4 w-4 mr-2" />Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings"><Settings className="h-4 w-4 mr-2" />Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
