import type { StorageRecord } from '@/lib/supabase/types/derived'

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { OpenAI } from 'openai'

export interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: StorageRecord
  schema: 'public'
  old_record: null | StorageRecord
}

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const db = await createClient()
  const payload = await request.json()
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const prompt = `
    You are a helpful image captioning assistant. 
    Write a short and concise description 
    of the image provided by the user. Here are some examples:
    "A photo of a cat sitting on a couch."
    "A photo of a white car parked in a crowded parking lot."
  `

  const { data, error } = await db.storage
    .from('media')
    .createSignedUrl(payload.record.path_tokens!.join('/'), 60)

  if (error) {
    throw new Error('Failed to sign URL', {
      cause: error.message,
    })
  }

  const { choices } = await openai.chat.completions.create({
    model: 'gpt-4o-2024-11-20',
    messages: [
      { role: 'system', content: prompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Please describe this photo.' },
          {
            type: 'image_url',
            image_url: { url: data.signedUrl },
          },
        ],
      },
    ],
  })

  const caption = choices[0].message.content as string

  const { error: captionError } = await db.from('photo_captions').insert({
    photo_id: payload.record.id,
    caption,
  })

  if (captionError) {
    throw new Error('Failed to insert caption', {
      cause: captionError.message,
    })
  }

  return new Response(null, { status: 200 })
}
