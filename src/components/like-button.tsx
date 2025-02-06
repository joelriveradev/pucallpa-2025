'use client'

import { FormEvent, useState, useTransition } from 'react'
import { ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { submitLike } from '@/actions'

interface Props {
  postId: string
  likes?: number
}

export function LikeButton({ postId, likes = 0 }: Props) {
  const [state, setState] = useState(likes)
  const [loading, setLoading] = useState(false)
  const [_, startTransition] = useTransition()

  function handleLike(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    startTransition(async () => {
      setLoading(true)
      setState(state + 1)

      await submitLike(postId).catch((error) => {
        throw new Error('Failed to submit like', {
          cause: error.message,
        })
      })
      setLoading(false)
    })
  }

  return (
    <form className='flex items-center gap-x-2' onSubmit={handleLike}>
      <Button
        size='icon'
        className='bg-transparent pb-[2px] rounded-lg text-muted-foreground'
        variant='outline'
        type='submit'
        disabled={loading}
      >
        <ThumbsUp size={24} />
      </Button>
      <span className='text-sm text-muted-foreground'>{state}</span>
    </form>
  )
}
