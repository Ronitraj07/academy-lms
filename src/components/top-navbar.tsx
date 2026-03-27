'use client'

import { useState, useEffect } from 'react'
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
  ChevronDown
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/hooks/useAuth'
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

interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'info' | 'warning' | 'success' | 'error'
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Attendance Marked',
    message: 'Your attendance has been marked for Mathematics class',
    time: '5 minutes ago',
    read: false,
    type: 'success'
  },
  {
    id: '2',
    title: 'New Assignment',
    message: 'Physics assignment has been posted for next week',
    time: '1 hour ago',
    read: false,
    type: 'info'
  },
  {
    id: '3',
    title: 'Grade Updated',
    message: 'Your Chemistry test grade has been updated',
    time: '2 hours ago',
    read: true,
    type: 'success'
  }
]

export function TopNavbar() {
  const { user, profile } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications] = useState<Notification[]>(mockNotifications)

  useEffect(() => {
    setMounted(true)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return 'ℹ️'
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'from-red-500 to-pink-500'
      case 'faculty':
        return 'from-blue-500 to-indigo-500'
      case 'student':
        return 'from-green-500 to-emerald-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const handleSignOut = () => {
    // Clear any stored auth data
    localStorage.removeItem('demo-user')
    sessionStorage.removeItem('demo-user')
    
    // Redirect to login
    router.push('/login')
  }

  if (!mounted) {
    return null
  }

  return (
    <header className="navbar-glass border-b border-border/50 px-4 md:px-6 py-3">
      <div className="flex items-center justify-between w-full">
        {/* Left Section - Search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Search */}
          <div className="relative flex-1 max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search students, subjects, or records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 input-modern"
            />
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3">
          {/* Search Button - Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden h-9 w-9"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9 hover:bg-muted"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 relative hover:bg-muted">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between p-4 border-b">
                <h4 className="font-medium">Notifications</h4>
                <Badge variant="secondary" className="h-6 px-2 text-xs">
                  {unreadCount} new
                </Badge>
              </div>
              <div className="max-h-80 overflow-auto scrollbar-modern">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-4 hover:bg-muted/50 cursor-pointer transition-colors',
                          !notification.read && 'bg-primary/5'
                        )}
                      >
                        <div className="flex gap-3">
                          <span className="text-sm mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.time}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 border-t bg-muted/30">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    View All Notifications
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 px-2 hover:bg-muted group">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src="" alt={user?.email} />
                    <AvatarFallback className={cn(
                      'text-white text-xs font-semibold bg-gradient-to-r',
                      getRoleBadgeColor(profile?.role || 'student')
                    )}>
                      {user?.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left min-w-0">
                    <p className="text-sm font-medium truncate max-w-32">
                      {user?.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {profile?.role}
                    </p>
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {profile?.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}