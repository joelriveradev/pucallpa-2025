'use server'

import { createClient } from '@/lib/supabase/server'
import { OpenAI } from 'openai'
import { Twilio } from 'twilio'

export async function sendSMSNotification(message: string, recipient: string) {
  const isDev = process.env.NODE_ENV === 'development'
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER!

  const accountSid = isDev
    ? process.env.TWILIO_ACCOUNT_SID_DEV!
    : process.env.TWILIO_ACCOUNT_SID_PROD!

  const authToken = isDev
    ? process.env.TWILIO_AUTH_TOKEN_DEV!
    : process.env.TWILIO_AUTH_TOKEN_PROD!

  const twilio = new Twilio(accountSid, authToken)

  await twilio.messages
    .create({
      body: message,
      from: twilioPhone,
      to: recipient,
    })
    .catch((error) => {
      throw new Error('Failed to send SMS notification', {
        cause: error.message,
      })
    })
}

export async function generateCaption(photoUrl: string) {
  const db = await createClient()
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const prompt = `
    You are a helpful image captioning assistant. 
    Write a short and concise description 
    of the image provided by the user. Here are some examples:
    "A photo of a cat sitting on a couch."
    "A photo of a white car parked in a crowded parking lot."
  `

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
            image_url: { url: photoUrl },
          },
        ],
      },
    ],
  })

  return choices[0].message.content
}
