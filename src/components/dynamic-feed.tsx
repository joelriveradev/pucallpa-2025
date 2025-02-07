'use client'

import { useState, useEffect, useTransition } from 'react'
import { Card } from '@/components/ui/card'
import { ScrollTop } from '@/components/scroll-top'
import { PhotoCarousel } from '@/components/photo-carousel'
import { formatDateCreated } from '@/lib/utils'
import { PostWithLikes } from '@/lib/supabase/types/derived'
import { LikeButton } from '@/components/like-button'
import { createClient } from '@/lib/supabase/client'

import Image from 'next/image'

interface Props {
  limit: number
  count: number
  posts: PostWithLikes[]
}

export function DynamicFeed({ posts: initialPosts, limit }: Props) {
  const db = createClient()

  const [currentPage, setCurrentPage] = useState(1)
  const [posts, setPosts] = useState(initialPosts)
  const [isBottom, setIsBottom] = useState(false)

  const [_, startTransition] = useTransition()
  const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL

  async function fetchPosts() {
    const from = currentPage * limit
    const to = from + limit - 1

    const { data: newPosts, error } = await db
      .from('posts')
      .select(
        'id, title, content, likes(id), photo_urls, photo_captions, video_urls, created_at'
      )
      .order('created_at', { ascending: false })
      .eq('stage', 'PUBLISHED')
      .range(from, to)

    if (error) {
      console.error(error.message)
    }

    setCurrentPage((prev) => prev + 1)
    setPosts((prev) => [...prev, ...(newPosts as PostWithLikes[])])
  }

  useEffect(() => {
    if (isBottom) {
      startTransition(async () => await fetchPosts())
    }
  }, [isBottom])

  useEffect(() => {
    function handleScroll() {
      const offset = 500

      const scrollTop = document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight

      startTransition(() => {
        setIsBottom(
          scrollTop + clientHeight + offset >= scrollHeight ? true : false
        )
      })
    }

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className='relative w-full mt-12'>
      {posts.map(
        (
          { photo_urls, photo_captions, content, created_at, id, title, likes },
          index
        ) => {
          return (
            <Card
              key={id}
              className='p-5 bg-neutral-900/30 mb-7 pb-7 rounded-3xl'
            >
              <header className='w-full flex items-start justify-between mb-7'>
                <div>
                  <h2 className='font-semibold'>{title}</h2>

                  <small className='block text-neutral-300 font-mono'>
                    {formatDateCreated(created_at)}
                  </small>
                </div>

                <LikeButton postId={id} likes={likes.length} />
              </header>

              {photo_urls !== null && photo_urls.length === 1 && (
                <Image
                  src={`${storageUrl}/${photo_urls[0]}`}
                  width={0}
                  height={0}
                  sizes='(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px'
                  style={{ width: '100%', height: 'auto' }}
                  alt={(photo_captions as any)![0].caption}
                  className='rounded-xl mb-7'
                  priority={index <= 3}
                  quality={50}
                />
              )}

              {photo_urls !== null && photo_urls.length > 1 && (
                <PhotoCarousel
                  priority={index <= 3}
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

      <ScrollTop />
    </div>
  )
}
