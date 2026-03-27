'use client'

import { useEffect, useState } from 'react'
import { usePWA } from '@/hooks/usePWA'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, RefreshCw, Share, X } from 'lucide-react'

export function PWAInitializer() {
  const {
    isInstallable,
    isUpdateAvailable,
    isOnline,
    installApp,
    updateApp,
    shareApp,
    requestNotificationPermission
  } = usePWA()

  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [hasRequestedPermission, setHasRequestedPermission] = useState(false)

  // Show install prompt after a delay
  useEffect(() => {
    if (isInstallable && !showInstallPrompt) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true)
      }, 10000) // Show after 10 seconds

      return () => clearTimeout(timer)
    }
  }, [isInstallable, showInstallPrompt])

  // Show update prompt when available
  useEffect(() => {
    if (isUpdateAvailable) {
      setShowUpdatePrompt(true)
    }
  }, [isUpdateAvailable])

  // Request notification permission after initial load
  useEffect(() => {
    if (!hasRequestedPermission && isOnline) {
      const timer = setTimeout(() => {
        requestNotificationPermission()
        setHasRequestedPermission(true)
      }, 5000) // Request after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [hasRequestedPermission, isOnline, requestNotificationPermission])

  const handleInstall = async () => {
    const success = await installApp()
    if (success) {
      setShowInstallPrompt(false)
    }
  }

  const handleUpdate = () => {
    updateApp()
    setShowUpdatePrompt(false)
  }

  const handleShare = async () => {
    await shareApp()
  }

  // Install Prompt
  if (showInstallPrompt) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] slide-in-right">
        <Card className="card-glassmorphism border-primary/20 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">Install Academy LMS</CardTitle>
                <CardDescription>
                  Add to your home screen for quick access
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground"
                onClick={() => setShowInstallPrompt(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                className="flex-1 btn-gradient"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Install
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
              >
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Update Prompt
  if (showUpdatePrompt) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] slide-in-right">
        <Card className="card-glassmorphism border-blue-500/20 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">Update Available</CardTitle>
                <CardDescription>
                  A new version of Academy LMS is ready
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground"
                onClick={() => setShowUpdatePrompt(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Button
                onClick={handleUpdate}
                className="flex-1"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Now
              </Button>
              <Button
                onClick={() => setShowUpdatePrompt(false)}
                variant="outline"
                size="sm"
              >
                Later
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Offline Indicator
  if (!isOnline) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Card className="card-glassmorphism border-yellow-500/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-muted-foreground">You're offline</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}