import { ArrowLeft } from 'lucide-react'
import { Form } from '@/components/form'

import Link from 'next/link'

export default async function PostPage() {
  return (
    <div className='w-full min-h-dvh p-4'>
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
