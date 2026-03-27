import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { PWAInitializer } from "@/components/pwa-initializer";

export const metadata: Metadata = {
  title: "Academy LMS - Learning Management System",
  description: "A comprehensive academy management system with role-based access control",
  keywords: ["academy", "learning", "management", "education", "lms"],
  authors: [{ name: "Academy LMS" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Academy LMS",
    startupImage: [
      {
        url: "/pwa/startup-768x1024.png",
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
      {
        url: "/pwa/startup-414x896.png", 
        media: "(device-width: 414px) and (device-height: 896px)",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Academy LMS",
    title: "Academy LMS - Learning Management System",
    description: "A comprehensive academy management system with role-based access control",
  },
  twitter: {
    card: "summary",
    title: "Academy LMS - Learning Management System",
    description: "A comprehensive academy management system with role-based access control",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Academy LMS",
    "application-name": "Academy LMS",
    "msapplication-TileColor": "#ec4899",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#ec4899",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/pwa/icon-192x192.png" />
        <meta name="theme-color" content="#ec4899" />
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
