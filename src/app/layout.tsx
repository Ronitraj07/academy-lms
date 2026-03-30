import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { PWAInitializer } from '@/components/pwa-initializer';

/* ── Viewport (must be separate export in Next.js 13+) ─────────────────── */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#2563eb',
};

/* ── Metadata ──────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: 'Academy LMS - Learning Management System',
  description: 'A comprehensive academy management system with role-based access control',
  keywords: ['academy', 'learning', 'management', 'education', 'lms'],
  authors: [{ name: 'Academy LMS' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Academy LMS',
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    siteName: 'Academy LMS',
    title: 'Academy LMS - Learning Management System',
    description: 'A comprehensive academy management system with role-based access control',
  },
  twitter: {
    card: 'summary',
    title: 'Academy LMS - Learning Management System',
    description: 'A comprehensive academy management system with role-based access control',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Academy LMS',
    'application-name': 'Academy LMS',
    'msapplication-TileColor': '#2563eb',
    'msapplication-config': '/browserconfig.xml',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/pwa/icon-192x192.png" />
      </head>
      <body className="antialiased min-h-full pwa-safe-area">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          storageKey="academy-lms-theme"
        >
          <AuthProvider>
            <PWAInitializer />
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
