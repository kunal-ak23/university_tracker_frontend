import type { Metadata } from "next"
import { Inter, Righteous } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/shared/theme-provider"
import { auth } from "@/auth"
import { AppProviders } from "@/components/providers/app-providers"
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/service/utils'

const inter = Inter({ subsets: ["latin"] })
const righteous = Righteous({ weight: '400', subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Trackie",
  description: "University Batch Tracking System",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '57x57', type: 'image/png' },
      { url: '/apple-icon-60x60.png', sizes: '60x60', type: 'image/png' },
      { url: '/apple-icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/apple-icon-76x76.png', sizes: '76x76', type: 'image/png' },
      { url: '/apple-icon-114x114.png', sizes: '114x114', type: 'image/png' },
      { url: '/apple-icon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/apple-icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/apple-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-icon-precomposed.png', sizes: '57x57', type: 'image/png' },
    ],
    other: [
      {
        rel: 'android-icon',
        url: '/android-icon-36x36.png',
        sizes: '36x36',
        type: 'image/png',
      },
      {
        rel: 'android-icon',
        url: '/android-icon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        rel: 'android-icon',
        url: '/android-icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
      },
      {
        rel: 'android-icon',
        url: '/android-icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        rel: 'android-icon',
        url: '/android-icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
      },
      {
        rel: 'android-icon',
        url: '/android-icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Trackie',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProviders session={session}>
            {children}
            <Toaster />
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  )
}
