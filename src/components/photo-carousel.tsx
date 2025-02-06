'use client'

import { useState, useEffect } from 'react'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from '@/components/ui/carousel'

import Image from 'next/image'

interface Props {
  priority?: boolean
  photos: Array<{ url: string; caption: string }>
}

export function PhotoCarousel({ photos, priority }: Props) {
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const [api, setApi] = useState<CarouselApi>()

  useEffect(() => {
    if (!api) return

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  return (
    <div className='w-full mb-7'>
      <Carousel setApi={setApi}>
        <CarouselContent>
          {photos.map(({ url, caption }) => {
            return (
              <CarouselItem key={url}>
                <Image
                  src={url}
                  width={0}
                  height={0}
                  sizes='(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px'
                  style={{ width: '100%', height: 'auto' }}
                  priority={priority}
                  alt={caption}
                  className='rounded-xl mb-2'
                />
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>

      <div className=' text-sm text-muted-foreground'>
        Slide {current} of {count}
      </div>
    </div>
  )
}
