import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { PhotoCarousel } from '@/components/photo-carousel'
import { formatDateCreated } from '@/lib/utils'
import { ScrollTop } from '@/components/scroll-top'

import Image from 'next/image'

export default async function HomePage() {
  const db = await createClient()
  const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL

  const { data: posts, error } = await db
    .from('posts')
    .select('id, title, content, photo_urls, photo_captions, created_at')
    .order('created_at', { ascending: false })
    .eq('stage', 'PUBLISHED')

  if (error) {
    console.error(error.message)

    return (
      <main className='w-full h-dvh p-5 lg:p-8'>
        <h1 className='font-bold'>Oh no, Something went wrong!</h1>
        <p className='text-sm text-neutral-200'>Please refresh the page.</p>
      </main>
    )
  }

  return (
    <main className='relative w-full min-h-dvh py-10 lg:py-20 max-w-2xl mx-auto'>
      <header className='px-5'>
        <h1 className='text-xl lg:text-2xl font-bold mb-0'>
          Pucallpa Mission Trip 2025 🇵🇪
        </h1>

        <p className='text-muted-foreground'>
          Sharing the love of Christ to the people of Pucallpa.
        </p>
      </header>

      <div className='mt-[50px]'>
        {posts.map(
          ({ photo_urls, photo_captions, content, created_at, id, title }) => {
            return (
              <Card
                key={id}
                className='p-5 bg-neutral-900/30 mb-7 pb-7 rounded-3xl'
              >
                <header className='w-full md:flex lg:items-center md:justify-between mb-7'>
                  <h2 className='font-semibold'>{title}</h2>

                  <small className='block text-neutral-300 font-mono'>
                    {formatDateCreated(created_at)}
                  </small>
                </header>

                {photo_urls !== null && photo_urls.length === 1 && (
                  <Image
                    src={`${storageUrl}/${photo_urls[0]}`}
                    width={0}
                    height={0}
                    sizes='100vw'
                    style={{ width: '100%', height: 'auto' }}
                    alt={(photo_captions as any)![0].caption}
                    placeholder='blur'
                    blurDataURL={`${storageUrl}/${photo_urls[0]}`}
                    className='rounded-xl mb-7'
                  />
                )}

                {photo_urls !== null && photo_urls.length > 1 && (
                  <PhotoCarousel
                    photos={photo_urls.map((url) => {
                      const caption: any = photo_captions!.find(
                        (caption: any) => caption.url === url
                      )

                      return {
                        url: `${storageUrl}/${url}`,
                        caption: caption.caption,
                      }
                    })}
                  />
                )}

                <p className='antialised text-pretty text-neutral-300'>
                  {content}
                </p>
              </Card>
            )
          }
        )}
      </div>

      <ScrollTop />
    </main>
  )
}
