'use client'

import { useEffect, useState } from 'react'

interface PWAState {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  isUpdateAvailable: boolean
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function usePWA() {
  const [pwaState, setPwaState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: true,
    isUpdateAvailable: false
  })
  
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Check if app is installed (standalone mode)
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as any).standalone === true

    // Check online status
    const isOnline = navigator.onLine

    setPwaState(prev => ({ ...prev, isInstalled, isOnline }))

    // Register service worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker()
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setPwaState(prev => ({ ...prev, isInstallable: true }))
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setPwaState(prev => ({ ...prev, isOnline: true }))
    }

    const handleOffline = () => {
      setPwaState(prev => ({ ...prev, isOnline: false }))
    }

    // Listen for app installation
    const handleAppInstalled = () => {
      setPwaState(prev => ({ ...prev, isInstalled: true, isInstallable: false }))
      setDeferredPrompt(null)
    }

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('ServiceWorker registered:', registration)

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setPwaState(prev => ({ ...prev, isUpdateAvailable: true }))
            }
          })
        }
      })

      // Handle controller change (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })

    } catch (error) {
      console.error('ServiceWorker registration failed:', error)
    }
  }

  const installApp = async () => {
    if (!deferredPrompt) return false

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
        setPwaState(prev => ({ ...prev, isInstallable: false }))
        setDeferredPrompt(null)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error installing app:', error)
      return false
    }
  }

  const updateApp = () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  const shareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Academy LMS',
          text: 'Check out this amazing learning management system!',
          url: window.location.origin
        })
        return true
      } catch (error) {
        console.error('Error sharing:', error)
        return false
      }
    }
    
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(window.location.origin)
      return true
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      return false
    }
  }

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/pwa/icon-192x192.png',
        badge: '/pwa/icon-72x72.png',
        ...options
      })
    }
  }

  const addToHomeScreen = () => {
    // For iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    
    if (isIOS && isSafari) {
      showNotification('Add to Home Screen', {
        body: 'Tap the Share button and then "Add to Home Screen" to install this app.',
        requireInteraction: true
      })
    }
  }

  return {
    ...pwaState,
    installApp,
    updateApp,
    shareApp,
    requestNotificationPermission,
    showNotification,
    addToHomeScreen
  }
}