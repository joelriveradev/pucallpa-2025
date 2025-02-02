import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { formatDateCreated } from '@/lib/utils'

export default async function HomePage() {
  const db = await createClient()

  const { data: posts, error } = await db
    .from('posts')
    .select('id, title, content, video_urls, photo_urls, created_at')
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
    <main className='w-full h-dvh px-10 py-20 lg:px-20'>
      <h1 className='text-xl lg:text-2xl font-bold'>
        Pucallpa Mission 2025 🇵🇪
      </h1>

      <p className='text-neutral-300'>
        Sharing the love of Christ the people of Pucallpa.
      </p>

      <div className='mt-20'>
        {posts.map(({ id, title, content, created_at }) => {
          return (
            <Card key={id} className='p-5 bg-neutral-900/30 max-w-lg -ml-5'>
              <h2 className='font-semibold mb-1'>{title}</h2>

              <small className='mb-7 block text-neutral-300'>
                {formatDateCreated(created_at)}
              </small>

              <p className='antialised text-pretty text-neutral-200'>
                {content}
              </p>
            </Card>
          )
        })}
      </div>
    </main>
  )
}
