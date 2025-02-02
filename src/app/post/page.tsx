import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { NewPost, PostStage } from '@/lib/supabase/types/derived'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import Link from 'next/link'
import { revalidatePath } from 'next/cache'

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

  const photo_urls: string[] = []
  const video_urls: string[] = []

  if (media.length > 0) {
    const photos: File[] = []
    const videos: File[] = []

    media.forEach(async (file) => {
      const { type } = file

      if (type === 'image') {
        photos.push(file)
      }
      if (type === 'video') {
        videos.push(file)
      }
    })

    if (photos.length > 0) {
      photos.forEach(async (photo) => {
        const filename = `public/${photo.name}`

        const { data, error } = await db.storage
          .from('media')
          .upload(filename, photo, {
            cacheControl: '3600',
            upsert: true,
          })

        if (error) {
          console.error(error)
        }

        if (data) {
          photo_urls.push(data.fullPath)
        }
      })
    }

    if (videos.length > 0) {
      videos.forEach(async (video) => {
        const filename = `public/${video.name}`

        const { data, error } = await db.storage
          .from('photos')
          .upload(filename, video, {
            cacheControl: '3600',
            upsert: true,
          })

        if (error) {
          console.error(error)
        }

        if (data) {
          video_urls.push(data.fullPath)
        }
      })
    }
  }

  await storePost({ title, content, stage, video_urls, photo_urls })
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
