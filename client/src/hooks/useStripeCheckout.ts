import { useState } from 'react'
import { useSupabaseFunction } from './useSupabaseFunction'

interface CheckoutParams {
  numberOfChildren: number
  parentEmail: string
  parentName?: string
  formData?: any // Full form data to store in Supabase
}

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { callFunction } = useSupabaseFunction<{ sessionId: string; url?: string }>(
    'create-checkout-session'
  )

  const createCheckout = async (params: CheckoutParams) => {
    setLoading(true)
    setError(null)

    try {
      const response = await callFunction(params)
      
      // Get the checkout session URL from Stripe
      // The Edge Function returns sessionId, but we need the URL
      // So we'll construct it or get it from the response
      if (response.url) {
        // If the Edge Function returns the URL directly, use it
        window.location.href = response.url
      } else if (response.sessionId) {
        // Otherwise, we need to get the session URL
        // For now, we'll fetch it from Stripe, but ideally the Edge Function should return the URL
        const sessionUrl = `https://checkout.stripe.com/c/pay/${response.sessionId}`
        window.location.href = sessionUrl
      } else {
        throw new Error('No checkout session URL or ID received')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      setLoading(false)
      throw err
    }
    // Note: setLoading(false) is not called here because we're redirecting
  }

  return {
    createCheckout,
    loading,
    error,
  }
}