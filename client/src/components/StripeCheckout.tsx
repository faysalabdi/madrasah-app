import React, { useState, useEffect } from 'react'
import { useStripeCheckout } from '@/hooks/useStripeCheckout'
import { useSupabaseFunction } from '@/hooks/useSupabaseFunction'

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

interface StripeProduct {
  id: string
  name: string
  description: string | null
  priceId: string | null
  price: number
  metadata: Record<string, string>
}

interface ProductSelection {
  [productId: string]: boolean
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ formData, onSuccess }) => {
  const { createCheckout, loading, error } = useStripeCheckout()
  const { callFunction: getProducts } = useSupabaseFunction<{ products: StripeProduct[] }>('get-products')
  const numberOfChildren = formData?.numberOfChildren || 1
  
  const [products, setProducts] = useState<StripeProduct[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productSelection, setProductSelection] = useState<ProductSelection>({})
  const [useTrial, setUseTrial] = useState(true) // Default to 14-day trial

  // Fetch products from Stripe on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true)
        const response = await getProducts()
        const fetchedProducts = response.products || []
        setProducts(fetchedProducts)
        
        // Initialize selection: all products selected by default
        const initialSelection: ProductSelection = {}
        fetchedProducts.forEach((product) => {
          initialSelection[product.id] = true // All products selected by default
        })
        setProductSelection(initialSelection)
      } catch (err) {
        console.error('Error fetching products:', err)
      } finally {
        setProductsLoading(false)
      }
    }
    
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Find term fees product (always required)
  const termFeesProduct = products.find(
    (p) => p.name.toLowerCase().includes('term') || 
           p.metadata?.type === 'term_fees' ||
           p.metadata?.required === 'true'
  )

  // Other products (books)
  const bookProducts = products.filter(
    (p) => p.id !== termFeesProduct?.id
  )

  const calculateTotal = () => {
    let total = 0
    products.forEach((product) => {
      if (productSelection[product.id]) {
        total += product.price
      }
    })
    return total * numberOfChildren
  }

  const handleCheckout = async () => {
    try {
      // Ensure term fees are always included
      if (termFeesProduct) {
        productSelection[termFeesProduct.id] = true
      }

      // Build product selection with price IDs
      const selectedProducts = products
        .filter((p) => productSelection[p.id] && p.priceId)
        .map((p) => ({
          priceId: p.priceId!,
          productId: p.id,
          name: p.name,
          price: p.price,
        }))

      await createCheckout({
        numberOfChildren,
        parentEmail: formData?.parent1Email || '',
        parentName: formData
          ? `${formData.parent1FirstName} ${formData.parent1LastName}`
          : undefined,
        formData: formData,
        products: selectedProducts, // Pass selected products with price IDs
        useTrial: useTrial,
      })
      onSuccess?.()
    } catch (err) {
      // Error is handled by the hook
    }
  }

  const total = calculateTotal()

  if (productsLoading) {
    return (
      <div className="mt-12 pt-8">
        <div className="text-center">
          <p className="text-lg">Loading products...</p>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="mt-12 pt-8">
        <div className="text-center">
          <p className="text-lg text-red-600">No products available. Please contact support.</p>
        </div>
      </div>
    )
  }

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
          <h3 className="text-xl font-semibold mb-4">Select Products (Per Child)</h3>
          {termFeesProduct && (
            <p className="text-sm text-gray-600 mb-4">
              {termFeesProduct.name} (${termFeesProduct.price.toFixed(2)}) is included automatically
            </p>
          )}
          <div className="space-y-3">
            {/* Book Products (selectable) */}
            {bookProducts.map((product) => (
              <label
                key={product.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={productSelection[product.id] || false}
                    onChange={(e) => {
                      setProductSelection({
                        ...productSelection,
                        [product.id]: e.target.checked,
                      })
                    }}
                    className="mr-3 w-5 h-5"
                  />
                  <span>{product.name}</span>
                </div>
                <span className="font-semibold">${product.price.toFixed(2)}</span>
              </label>
            ))}

            {/* Term Fees - Always included, shown as info */}
            {termFeesProduct && (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <span className="material-icons text-gray-500 mr-3 text-xl">check_circle</span>
                  <span className="font-medium">{termFeesProduct.name} (Required)</span>
                </div>
                <span className="font-semibold">${termFeesProduct.price.toFixed(2)}</span>
              </div>
            )}
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