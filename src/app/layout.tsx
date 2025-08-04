import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "MindBridge Nigeria - Mental Health Made Accessible",
    template: "%s | MindBridge Nigeria"
  },
  description: "Connect with licensed therapists across Nigeria. Get the mental health support you need, when you need it, wherever you are.",
  keywords: [
    "mental health",
    "therapy",
    "therapist",
    "Nigeria",
    "counseling",
    "psychology",
    "mental wellness",
    "online therapy",
    "video sessions",
    "support groups"
  ],
  authors: [{ name: "MindBridge Nigeria Team" }],
  creator: "MindBridge Nigeria",
  publisher: "MindBridge Nigeria",
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: '/',
    title: 'MindBridge Nigeria - Mental Health Made Accessible',
    description: 'Connect with licensed therapists across Nigeria. Professional mental health support at your fingertips.',
    siteName: 'MindBridge Nigeria',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'MindBridge Nigeria - Mental Health Platform',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MindBridge Nigeria - Mental Health Made Accessible',
    description: 'Connect with licensed therapists across Nigeria. Professional mental health support at your fingertips.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e293b' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: 'dark light',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MindBridge" />
        <meta name="application-name" content="MindBridge Nigeria" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          {children}
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#f1f5f9',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f1f5f9',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
