'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { ArrowRight, Loader } from 'lucide-react'
import { NewPost, PostStage } from '@/lib/supabase/types/derived'
import { generateCaption, storePost } from '@/actions'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export function Form() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)

    const db = createClient()
    const data = new FormData(event.currentTarget)
    const title = data.get('title') as string
    const content = data.get('content') as string
    const stage = data.get('stage') as PostStage
    const media = data.getAll('media') as File[]

    const post: NewPost = { title, content, stage }
    const storage = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL

    if (media.length > 0) {
      const uploads = media.map(async (photo) => {
        const filename = `photos/${photo.name}`

        const { data } = await db.storage
          .from('media')
          .upload(filename, photo, {
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
    setLoading(false)
    router.push('/')
  }

  return (
    <form className='space-y-5' onSubmit={handleSubmit}>
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
        className='w-full mt-5 bg-neutral-900/50 hover:bg-neutral-900/75 p-5  gap-x-3'
        variant='outline'
        disabled={loading}
      >
        {loading ? (
          <>
            Posting... <Loader size={16} className='animate-spin' />
          </>
        ) : (
          <>
            Post Update <ArrowRight size={16} />
          </>
        )}
      </Button>
    </form>
  )
}
