'use client'

import { ReactNode } from 'react'
import { Sidebar } from '@/components/sidebar'
import { MobileNav } from '@/components/mobile-nav'
import { TopNavbar } from '@/components/top-navbar'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: ReactNode
  className?: string
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="loading-spinner w-8 h-8" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex" />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Navigation */}
          <TopNavbar />
          
          {/* Content */}
          <main className={cn(
            'flex-1 overflow-auto bg-gradient-to-br from-background to-muted/30',
            'scrollbar-modern p-4 md:p-6 lg:p-8',
            'pb-20 md:pb-6', // Extra bottom padding for mobile nav
            className
          )}>
            <div className="container-responsive max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}