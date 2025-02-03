import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import { NewPost, PostStage } from '@/lib/supabase/types/derived'
import { generateCaption } from '@/actions'
import { Form } from '@/components/form'

import Link from 'next/link'

export const maxDuration = 60

async function storePost(post: NewPost) {
  'use server'
  const db = await createClient()
  await db.from('posts').insert(post)
  revalidatePath('/')
}

async function submitPost(data: FormData) {
  'use server'

  const db = await createClient()
  const title = data.get('title') as string
  const content = data.get('content') as string
  const stage = data.get('stage') as PostStage
  const media = data.getAll('media') as File[]

  const post: NewPost = { title, content, stage }
  const storage = process.env.SUPABASE_STORAGE_URL

  if (media.length > 0) {
    const uploads = media.map(async (photo) => {
      const filename = `photos/${photo.name}`

      const { data } = await db.storage.from('media').upload(filename, photo, {
        cacheControl: '3600',
        upsert: true,
      })

      const caption =
        (await generateCaption(`${storage}/${data?.fullPath}`)) ?? ''

      return {
        id: data?.id,
        caption,
        url: data?.fullPath ?? '',
      }
    })

    const results = await Promise.all(uploads)

    await storePost({
      ...post,
      photo_urls: results.map(({ url }) => url),
      photo_captions: results.map((caption) => caption),
    }).catch((error) => {
      throw new Error('Failed to store post', { cause: error.message })
    })
  }

  await storePost(post)
  revalidatePath('/', 'page')
  return redirect('/')
}

export default async function PostPage() {
  return (
    <div className='w-full min-h-dvh p-8 lg:p-10'>
      <main className='max-w-3xl mx-auto'>
        <header className='flex items-center justify-between mb-5'>
          <h1 className='font-bold'>Post</h1>

          <Link
            prefetch
            href='/'
            className='flex items-center text-neutral-500 text-sm hover:underline hover:underline-offset-4'
          >
            <ArrowLeft size={16} className='mr-2' />
            All Posts
          </Link>
        </header>

        <Form />
      </main>
    </div>
  )
}
