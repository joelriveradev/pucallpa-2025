import { redirect } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { sendSMSNotification } from '@/actions'

import Link from 'next/link'

async function subscribe(data: FormData) {
  'use server'

  const db = await createClient()
  const name = data.get('name') as string
  const phone = data.get('phone') as string

  const { error } = await db.from('subscribers').insert({
    name,
    phone_number: phone,
  })

  if (error) {
    throw new Error('Failed to subscribe user', { cause: error.message })
  }

  const message = `
    Hey ${name}, Thanks for subscribing! 🎉
    You are now confirmed to receive SMS notifications for new posts.
  `

  await sendSMSNotification(message, phone).catch((error) => {
    throw new Error('Failed to send SMS confirmation', { cause: error.message })
  })

  return redirect('/')
}

export default async function SubscribePage() {
  return (
    <div className='w-full min-h-dvh p-8 lg:p-10'>
      <Link
        href='/'
        prefetch
        className='flex items-center gap-x-1 text-muted-foreground mb-5'
      >
        <ArrowLeft size={20} className='text-sm' /> Posts
      </Link>

      <main className='max-w-3xl mx-auto'>
        <h1 className='font-bold mb-2'>Subscribe for updates!</h1>

        <p className='text-neutral-300'>
          You'll receive an SMS notification everytime I post an update.
        </p>

        <form className='w-full my-10' action={subscribe}>
          <div className='w-full flex flex-col lg:flex-row gap-y-6 lg:gap-x-5 items-center'>
            <div className='w-full'>
              <Label className='mb-2 ml-3'>Name</Label>
              <Input
                placeholder="What's your first name?"
                name='name'
                className='h-10'
                required
              />
            </div>

            <div className='w-full'>
              <Label className='mb-2 ml-3'>Phone Number</Label>
              <Input
                type='tel'
                placeholder='555-555-5555'
                name='phone'
                className='h-10'
                required
              />
            </div>
          </div>

          <Button
            className='w-full mt-8 bg-neutral-900/50 hover:bg-neutral-900/75 p-5'
            variant='outline'
          >
            Subscribe <ArrowRight size={16} />
          </Button>
        </form>
      </main>
    </div>
  )
}
