import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/auth-provider'
import SonnerToaster from '@/components/providers/sonner-toaster'
import { ClientProvider } from '@/contexts/ClientContext'

export const metadata: Metadata = {
  title: 'Virukshaa-Construction-product',
  description: 'One of the Dezprox company products under building',
  icons: {
    icon: '/dezproxlogo.png',
  },
}

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <ClientProvider>
            {children}
            <SonnerToaster />
          </ClientProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
