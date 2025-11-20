import React from 'react'
import { useStripeCheckout } from '@/hooks/useStripeCheckout'

interface StripeCheckoutProps {
  formData?: {
    parent1Email: string
    parent1FirstName: string
    parent1LastName: string
    numberOfChildren: number
    children: any[]
  }
  onSuccess?: () => void
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ formData, onSuccess }) => {
  const { createCheckout, loading, error } = useStripeCheckout()

  const handleCheckout = async () => {
    try {
      await createCheckout({
        numberOfChildren: formData?.numberOfChildren || 1,
        parentEmail: formData?.parent1Email || '',
        parentName: formData
          ? `${formData.parent1FirstName} ${formData.parent1LastName}`
          : undefined,
        // Pass full formData - Edge Function will store it in Supabase
        formData: formData,
      })
      onSuccess?.()
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const numberOfChildren = formData?.numberOfChildren || 1
  const totalPerChild = 280
  const total = totalPerChild * numberOfChildren

  return (
    <div className="mt-12 pt-8">
      <h2 className="text-3xl font-bold text-primary mb-6 font-amiri text-center">
        Step 2: Payment
      </h2>
      <div className="bg-secondary-light text-primary-dark p-6 rounded-lg shadow-sm max-w-xl mx-auto">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Payment Summary</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Number of Children:</span>
              <span className="font-semibold">{numberOfChildren}</span>
            </div>
            <div className="flex justify-between">
              <span>Per Child (Books + Term Fees):</span>
              <span className="font-semibold">${totalPerChild.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total:</span>
                <span className="font-bold">${total.toFixed(2)} AUD</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-secondary hover:bg-secondary-dark text-white font-medium py-3 px-6 rounded shadow transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : `Pay $${total.toFixed(2)} AUD`}
        </button>

        <p className="mt-4 text-sm text-center text-gray-600">
          You will be redirected to Stripe's secure payment page to complete your payment.
        </p>
      </div>
    </div>
  )
}

export default StripeCheckout