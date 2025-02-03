import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { PhotoCarousel } from '@/components/photo-carousel'
import { formatDateCreated } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MessageSquare } from 'lucide-react'

import Image from 'next/image'
import Link from 'next/link'

export default async function HomePage() {
  const db = await createClient()
  const storageUrl = process.env.SUPABASE_STORAGE_URL

  const { data: posts, error } = await db
    .from('posts')
    .select('id, title, content, photo_urls, video_urls, created_at')
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
    <main className='w-full min-h-dvh px-10 py-20 lg:px-20 max-w-3xl mx-auto'>
      <h1 className='text-xl lg:text-2xl font-bold mb-2'>
        Pucallpa Mission 2025 🇵🇪
      </h1>

      <p className='text-muted-foreground'>
        Sharing the love of Christ the people of Pucallpa.
      </p>

      <Link
        href='/subscribe'
        prefetch
        className={cn(
          buttonVariants({ variant: 'outline', className: 'mt-5' })
        )}
      >
        Subscribe for SMS updates! <MessageSquare size={20} />
      </Link>

      <div className='mt-20'>
        {posts.length === 0 ? (
          <p className='text-muted-foreground'>
            No posts to show yet. Check back later!
          </p>
        ) : null}

        {posts.map(
          ({ photo_urls, video_urls, content, created_at, id, title }) => {
            return (
              <Card
                key={id}
                className='p-5 bg-neutral-900/30 mb-7 pb-7 rounded-2xl'
              >
                <h2 className='font-semibold mb-1'>{title}</h2>

                <small className='mb-7 block text-neutral-300 font-mono'>
                  {formatDateCreated(created_at)}
                </small>

                {video_urls !== null && video_urls.length === 1 && (
                  <video
                    src={`${storageUrl}/${video_urls[0]}`}
                    width={0}
                    height={0}
                    style={{ width: '100%', height: 'auto' }}
                    className='rounded-xl mb-7'
                    controls
                  />
                )}

                {photo_urls !== null && photo_urls.length === 1 && (
                  <Image
                    src={`${storageUrl}/${photo_urls[0]}`}
                    width={0}
                    height={0}
                    sizes='100vw'
                    style={{ width: '100%', height: 'auto' }}
                    alt=''
                    className='rounded-xl mb-7'
                  />
                )}

                {photo_urls !== null && photo_urls.length > 1 && (
                  <PhotoCarousel
                    photos={photo_urls.map((url) => `${storageUrl}/${url}`)}
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
    </main>
  )
}
