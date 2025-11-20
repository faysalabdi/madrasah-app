import React, { useState } from 'react'
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

interface ProductSelection {
  fiqhBook: boolean
  surahsDua: boolean
  islamicStudies: boolean
  termFees: boolean // Always true, but included for consistency
}

const PRODUCT_PRICES = {
  fiqhBook: 20,
  surahsDua: 20,
  islamicStudies: 40,
  termFees: 200, // Always included
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ formData, onSuccess }) => {
  const { createCheckout, loading, error } = useStripeCheckout()
  const numberOfChildren = formData?.numberOfChildren || 1
  
  // Default: all products selected (term fees always included)
  const [productSelection, setProductSelection] = useState<ProductSelection>({
    fiqhBook: true,
    surahsDua: true,
    islamicStudies: true,
    termFees: true, // Always true - term fees are mandatory
  })
  
  const [useTrial, setUseTrial] = useState(true) // Default to 14-day trial

  const calculateTotal = () => {
    let total = PRODUCT_PRICES.termFees // Term fees are always included
    if (productSelection.fiqhBook) total += PRODUCT_PRICES.fiqhBook
    if (productSelection.surahsDua) total += PRODUCT_PRICES.surahsDua
    if (productSelection.islamicStudies) total += PRODUCT_PRICES.islamicStudies
    return total * numberOfChildren
  }

  const handleCheckout = async () => {
    try {
      const selectedProducts = {
        fiqhBook: productSelection.fiqhBook,
        surahsDua: productSelection.surahsDua,
        islamicStudies: productSelection.islamicStudies,
        termFees: true, // Always true - term fees are mandatory
      }

      await createCheckout({
        numberOfChildren,
        parentEmail: formData?.parent1Email || '',
        parentName: formData
          ? `${formData.parent1FirstName} ${formData.parent1LastName}`
          : undefined,
        formData: formData,
        productSelection: selectedProducts,
        useTrial: useTrial,
      })
      onSuccess?.()
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const total = calculateTotal()

  return (
    <div className="mt-12 pt-8">
      <h2 className="text-3xl font-bold text-primary mb-6 font-amiri text-center">
        Step 2: Payment
      </h2>
      <div className="bg-secondary-light text-primary-dark p-6 rounded-lg shadow-sm max-w-xl mx-auto">
        {/* Trial Period Option */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useTrial}
              onChange={(e) => setUseTrial(e.target.checked)}
              className="mr-3 w-5 h-5"
            />
            <div>
              <span className="font-semibold text-primary">14-Day Free Trial</span>
              <p className="text-sm text-gray-600 mt-1">
                Start your child's enrollment immediately. Payment will be processed after 14 days.
                You can cancel anytime during the trial period.
              </p>
            </div>
          </label>
        </div>

        {/* Product Selection */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Select Books (Per Child)</h3>
          <p className="text-sm text-gray-600 mb-4">Term fees ($200) are included automatically</p>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={productSelection.fiqhBook}
                  onChange={(e) => setProductSelection({ ...productSelection, fiqhBook: e.target.checked })}
                  className="mr-3 w-5 h-5"
                />
                <span>Fiqh Book</span>
              </div>
              <span className="font-semibold">${PRODUCT_PRICES.fiqhBook.toFixed(2)}</span>
            </label>

            <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={productSelection.surahsDua}
                  onChange={(e) => setProductSelection({ ...productSelection, surahsDua: e.target.checked })}
                  className="mr-3 w-5 h-5"
                />
                <span>Surahs and Dua Book</span>
              </div>
              <span className="font-semibold">${PRODUCT_PRICES.surahsDua.toFixed(2)}</span>
            </label>

            <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={productSelection.islamicStudies}
                  onChange={(e) => setProductSelection({ ...productSelection, islamicStudies: e.target.checked })}
                  className="mr-3 w-5 h-5"
                />
                <span>Islamic Studies Book</span>
              </div>
              <span className="font-semibold">${PRODUCT_PRICES.islamicStudies.toFixed(2)}</span>
            </label>

            {/* Term Fees - Always included, shown as info */}
            <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
              <div className="flex items-center">
                <span className="material-icons text-gray-500 mr-3 text-xl">check_circle</span>
                <span className="font-medium">Term Fees (Required)</span>
              </div>
              <span className="font-semibold">${PRODUCT_PRICES.termFees.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Payment Summary</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Number of Children:</span>
              <span className="font-semibold">{numberOfChildren}</span>
            </div>
            <div className="flex justify-between">
              <span>Per Child Total:</span>
              <span className="font-semibold">
                ${(calculateTotal() / numberOfChildren).toFixed(2)}
              </span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total:</span>
                <span className="font-bold">${total.toFixed(2)} AUD</span>
              </div>
            </div>
            {useTrial && (
              <div className="mt-2 text-sm text-blue-600">
                <span className="font-semibold">Trial Period:</span> Payment will be processed in 14 days
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading || total === 0}
          className="w-full bg-secondary hover:bg-secondary-dark text-white font-medium py-3 px-6 rounded shadow transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading 
            ? 'Processing...' 
            : useTrial 
              ? `Start 14-Day Trial (Pay $${total.toFixed(2)} AUD in 14 days)`
              : `Pay $${total.toFixed(2)} AUD Now`
          }
        </button>

        <p className="mt-4 text-sm text-center text-gray-600">
          {useTrial 
            ? "You'll be redirected to securely save your payment method. No charge until after the 14-day trial."
            : "You will be redirected to Stripe's secure payment page to complete your payment."
          }
        </p>
      </div>
    </div>
  )
}

export default StripeCheckout