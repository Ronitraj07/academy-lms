'use client'

import { ReactNode, useState } from 'react'
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
  const { loading } = useAuth()
  // 1.1 — single source of truth for sidebar open state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
      {/* 1.2 — flex wrapper: sidebar visible lg+ only; below lg handled by MobileNav */}
      <div className="flex h-screen overflow-hidden">
        {/*
          1.1 + 1.2 — Sidebar:
          - Desktop (lg+): always rendered, collapsible
          - Mobile/Tablet (<lg): rendered as fixed overlay drawer, toggled via isSidebarOpen
          className on the outer wrapper is no longer used for visibility;
          the Sidebar itself handles hidden/shown state via isOpen prop.
        */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* 1.1 — TopNavbar receives the toggle handler */}
          <TopNavbar
            onMenuClick={() => setIsSidebarOpen(prev => !prev)}
            isSidebarOpen={isSidebarOpen}
          />

          {/* Content */}
          <main
            className={cn(
              'flex-1 overflow-auto bg-gradient-to-br from-background to-muted/30',
              'scrollbar-modern p-4 md:p-6 lg:p-8',
              // 1.2 — bottom padding: mobile nav visible only <lg, use safe-area too
              'pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-8',
              className
            )}
          >
            <div className="container-responsive max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Navigation — only renders visible UI below lg */}
      <MobileNav />
    </div>
  )
}
