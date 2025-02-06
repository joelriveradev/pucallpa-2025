import { createClient } from '@/lib/supabase/server'
import { DynamicFeed } from '@/components/dynamic-feed'
import { PostWithLikes } from '@/lib/supabase/types/derived'

export default async function HomePage() {
  const db = await createClient()
  const limit = Number(process.env.FEED_LIMIT!)

  const { data: posts, error } = await db
    .from('posts')
    .select(
      'id, title, content, likes(id), photo_urls, photo_captions, created_at'
    )
    .order('created_at', { ascending: false })
    .eq('stage', 'PUBLISHED')
    .limit(limit)

  const { data: count } = await db
    .from('posts')
    .select('count')
    .eq('stage', 'PUBLISHED')
    .single()

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
    <main className='w-full min-h-dvh py-10'>
      <header className='px-5'>
        <h1 className='text-xl lg:text-2xl font-bold mb-0'>
          Pucallpa Mission Trip 2025 🇵🇪
        </h1>

        <p className='text-muted-foreground'>
          Sharing the love of Christ to the people of Pucallpa.
        </p>
      </header>

      <DynamicFeed
        limit={limit}
        posts={posts as PostWithLikes[]}
        count={count?.count as number}
      />
    </main>
  )
}
