import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { NewPost, PostStage } from '@/lib/supabase/types/derived'
import { Post } from '@/lib/supabase/types/derived'
import { sendSMSNotification } from '@/actions'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import Link from 'next/link'

async function sendNotification({ title }: Partial<Post>) {
  'use server'

  const db = await createClient()

  const { data: subscribers, error } = await db
    .from('subscribers')
    .select('name, phone_number')

  if (error) {
    throw new Error('Failed to fetch subscribers', { cause: error.message })
  }

  await Promise.all(
    subscribers.map(async ({ name, phone_number }) => {
      const message = `
      Hey ${name}, This is Joel! I just posted a new update.
      "${title}"
      Check it out! https://pucallpa-2025.vercel.app/
    `
      return await sendSMSNotification(message, phone_number)
    })
  ).catch((error) => {
    throw new Error('Failed to send SMS notifications', {
      cause: error.message,
    })
  })
}

async function storePost(post: NewPost) {
  'use server'
  const db = await createClient()
  await db.from('posts').insert(post)
}

async function submitPost(data: FormData) {
  'use server'

  const db = await createClient()
  const title = data.get('title') as string
  const content = data.get('content') as string
  const stage = data.get('stage') as PostStage
  const media = data.getAll('media') as File[]

  const post: NewPost = { title, content, stage }

  if (media.length > 0) {
    const photos: File[] = []
    const videos: File[] = []

    const photo_urls: string[] = []
    const video_urls: string[] = []

    media.forEach((file) => {
      const { type } = file
      if (type.includes('image')) photos.push(file)
      if (type.includes('video')) videos.push(file)
    })

    if (photos.length > 0) {
      const photoUploads = photos.map(async (photo) => {
        const filename = `photos/${photo.name}`

        const { data, error } = await db.storage
          .from('media')
          .upload(filename, photo, {
            cacheControl: '3600',
            upsert: true,
          })

        if (error) {
          console.error(error)
          return null
        }

        return data?.fullPath
      })

      const results = await Promise.all(photoUploads)
      photo_urls.push(...results.filter((url) => url !== null))
    }

    if (videos.length > 0) {
      const videoUploads = videos.map(async (video) => {
        const filename = `videos/${video.name}`

        const { data, error } = await db.storage
          .from('media')
          .upload(filename, video, {
            cacheControl: '3600',
            upsert: true,
          })

        if (error) {
          console.error(error)
          return null
        }

        return data?.fullPath
      })

      const results = await Promise.all(videoUploads)
      video_urls.push(...results.filter((url) => url !== null))
    }

    await storePost({ ...post, video_urls, photo_urls })
  }

  await storePost(post)
  await sendNotification(post)
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

        <form action={submitPost} className='space-y-5'>
          <div className='w-full lg:flex items-center space-y-5 lg:space-x-5 lg:space-y-0'>
            <Input
              type='text'
              placeholder="What's the title?"
              className='p-4 h-10'
              required
              name='title'
            />

            <Select name='stage'>
              <SelectTrigger className='h-10'>
                <SelectValue placeholder='Stage' />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value='DRAFT'>Draft</SelectItem>
                <SelectItem value='PUBLISHED'>Publish</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input type='file' name='media' accept='image/*, video/*' multiple />

          <Textarea
            rows={5}
            placeholder="What's going on?"
            className='p-4'
            required
            name='content'
          />

          <Button
            className='w-full mt-5 bg-neutral-900/50 hover:bg-neutral-900/75 p-5'
            variant='outline'
          >
            Post Update <ArrowRight size={16} />
          </Button>
        </form>
      </main>
    </div>
  )
}
