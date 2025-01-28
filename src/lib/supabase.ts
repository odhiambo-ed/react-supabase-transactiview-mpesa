import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env'

if (!env.supabase.url || !env.supabase.anonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(
  env.supabase.url,
  env.supabase.anonKey
)

// Example of using the environment variables in your API calls
export const api = {
  checkPaymentStatus: async (transactionId: string) => {
    const response = await fetch(
      `${env.api.baseUrl}/check-payment-status?transactionId=${transactionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return response.json()
  },

  initiatePayment: async (data: { phone: string; amount: number; ref: string }) => {
    const response = await fetch(
      `${env.api.baseUrl}/mpesa-stk-push`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          callbackUrl: env.mpesa.callbackUrl,
        }),
      }
    )
    return response.json()
  },
}