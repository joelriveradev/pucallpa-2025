'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {}

export function ScrollTop({}: Props) {
  const [_, startTransition] = useTransition()
  const [isTop, setIsTop] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      startTransition(() => setIsTop(window.scrollY > 100 ? false : true))
    }

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scroll = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }, [])

  return (
    <Button
      className={cn(
        '!w-14 !h-14 sticky bottom-7 left-1/2 transform -translate-x-1/2 rounded-full transition-all bg-white/70 backdrop-blur-md',
        {
          'scale-0 opacity-0': isTop,
          'scale-100 opacity-100': !isTop,
        }
      )}
      onClick={scroll}
    >
      <ArrowUp size={24} />
    </Button>
  )
}
