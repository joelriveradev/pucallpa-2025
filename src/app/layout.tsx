import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import { Info } from 'lucide-react'

import { Separator } from '@radix-ui/react-select'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import Link from 'next/link'
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
      <body>
        <div className='w-full max-w-2xl mx-auto'>
          <nav className='p-4'>
            <Link href='/about' prefetch className='text-muted-foreground'>
              <Info size={22} />
            </Link>
          </nav>

          {children}
        </div>
      </body>
    </html>
  )
}
