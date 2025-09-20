import type { Metadata, Viewport } from 'next'
import './globals.css'
import GlobalErrorHandler from '@/components/GlobalErrorHandler'

// Modern Font System - Helvetica Now Text Regular (system font)


export const metadata: Metadata = {
  title: 'Baakh - Sindhi Poetry Archive',
  description: 'A comprehensive Archive of centuries-old Sindhi poetry, and the preservation of literary traditions in the modern world.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32', type: 'image/x-icon' },
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
    apple: { url: '/icon.svg', type: 'image/svg+xml' },
    shortcut: '/favicon.ico'
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Favicon meta tags for cross-browser compatibility */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Modern Font System - Helvetica Now Text Regular (system font) */}
      </head>
      <body>
        <GlobalErrorHandler />
        {children}
      </body>
    </html>
  )
}
