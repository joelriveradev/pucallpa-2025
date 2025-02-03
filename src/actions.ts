'use server'

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
