import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--inter',
})

interface Props {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: 'Pucallpa Mission Trip 2025 🇵🇪',
  description:
    'Follow Joel as he posts real-time updates about his mission trip to Pucallpa, Peru in 2025.',
  openGraph: {
    url: 'https://pucallpa-2025.vercel.app/',
    title: 'Pucallpa Mission Trip 2025 🇵🇪',
    type: 'website',
    description:
      'Follow Joel as he posts real-time updates about his mission trip to Pucallpa, Peru in 2025.',
  },
}

export default function Layout({ children }: Props) {
  return (
    <html
      className={cn(
        'min-h-dvh bg-background font-sans antialiased dark',
        inter.variable
      )}
    >
      <body>{children}</body>
    </html>
  )
}
