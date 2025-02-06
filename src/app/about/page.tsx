import { ArrowLeft } from 'lucide-react'

import Link from 'next/link'

export default async function PostPage() {
  return (
    <div className='w-full min-h-dvh p-4'>
      <main>
        <Link
          prefetch
          href='/'
          className='flex items-center text-neutral-500 text-sm hover:underline hover:underline-offset-4'
        >
          <ArrowLeft size={16} className='mr-2' />
          Home
        </Link>

        <section className='my-10'>
          <h1 className='font-bold mb-1'>What's this about?</h1>

          <p className='text-neutral-300'>
            If it wasn't already obvious, this is a mission trip blog that I
            (Joel) built specifically for updates on things happening during the
            2025 mission trip and camp meeting in Pucallpa, Peru for the
            Maranatha Mission group.
          </p>
        </section>

        <section className='mt-10'>
          <h2 className='font-bold mb-1'>Who built the blog?</h2>

          <p className='text-neutral-300'>
            The blog was designed and built by Joel Rivera in just a few short
            days. Joel is a designer and software engineer who loves Jesus and
            has a passion for using modern technology to preach the gospel to
            the world.
          </p>
        </section>

        <section className='mt-10'>
          <h2 className='font-bold mb-1'>Can you build me one?</h2>

          <p className='text-neutral-300'>
            Sure! I'd love to help you, I'm available for hire. If you like what
            you see, feel free to reach out to me to discuss your needs. Email
            me by clicking{' '}
            <a
              href='mailto:joel@rivasyst.com?subject=I need a blog like this!'
              className='underline underline-offset-2 hover:text-muted-foreground'
            >
              this link.
            </a>
          </p>
        </section>
      </main>
    </div>
  )
}
