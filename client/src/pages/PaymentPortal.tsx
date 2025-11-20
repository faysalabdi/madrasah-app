import React, { useState } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'

const PaymentPortal: React.FC = () => {
  const [, setLocation] = useLocation()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Find customer by email in Supabase
      const { data: parents, error: dbError } = await supabase
        .from('parents')
        .select('stripe_customer_id')
        .eq('parent1_email', email)
        .single()

      if (dbError || !parents?.stripe_customer_id) {
        throw new Error('Customer not found. Please check your email address.')
      }

      // Create portal session via Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            customerId: parents.stripe_customer_id,
            returnUrl: window.location.origin + '/payment-portal',
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create portal session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-primary mb-6 font-amiri text-center">
            Payment Portal
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Enter your email address to access your payment portal and manage your account.
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-neutral-border rounded px-3 py-2"
                placeholder="your.email@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary hover:bg-secondary-dark text-white font-medium py-3 px-6 rounded shadow transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Access Payment Portal'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setLocation('/admission')}
              className="text-primary hover:underline"
            >
              Back to Admission Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPortal

