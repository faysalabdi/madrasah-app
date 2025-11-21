import React, { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'

interface Student {
  id: number
  student_id: string
  first_name: string
  last_name: string
  grade: string
  date_of_birth: string | null
  current_school: string | null
  quran_level: string | null
}

interface Parent {
  id: number
  parent_id: string
  parent1_first_name: string
  parent1_last_name: string
  parent1_email: string
  parent1_mobile: string
  parent1_address: string | null
  stripe_customer_id: string | null
}

interface Payment {
  id: number
  amount: number
  currency: string
  status: string
  payment_type: string
  paid_for_books: boolean
  paid_term_fees: boolean
  student_id: number | null
  created_at: string
  trial_end_date: string | null
}

interface BookProduct {
  id: string
  name: string
  description: string
  priceId: string
  price: number
  metadata: any
}

const ParentPortal: React.FC = () => {
  const [, setLocation] = useLocation()
  const [parent, setParent] = useState<Parent | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [bookProducts, setBookProducts] = useState<BookProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [payingFor, setPayingFor] = useState<number | null>(null) // student ID being paid for
  const [purchasingBooks, setPurchasingBooks] = useState(false)
  const [showBookDialog, setShowBookDialog] = useState(false)
  const [selectedBooks, setSelectedBooks] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    // Check authentication and restore session
    const checkAuth = async () => {
      // Check localStorage first (persistent), then sessionStorage (legacy)
      let parentId = localStorage.getItem('parentId') || sessionStorage.getItem('parentId')
      
      // Check Supabase auth session
      const { data: { session } } = await supabase.auth.getSession()
      
      // If we have a parentId but no auth session, try to restore
      if (parentId && !session) {
        // Check if we can restore from localStorage
        const parentEmail = localStorage.getItem('parentEmail')
        if (parentEmail) {
          // Session will be restored on next page load or we can continue with parentId
          // For now, just continue with parentId
        } else {
          // No email stored, need to re-login
          setLocation('/parent-login')
          return
        }
      }
      
      if (!parentId) {
        setLocation('/parent-login')
        return
      }
      
      // Sync to both for compatibility
      if (!sessionStorage.getItem('parentId')) {
        sessionStorage.setItem('parentId', parentId)
      }
      if (!localStorage.getItem('parentId')) {
        localStorage.setItem('parentId', parentId)
      }

      // Handle payment redirects
      const urlParams = new URLSearchParams(window.location.search)
      const paymentStatus = urlParams.get('payment')
      
      if (paymentStatus === 'success') {
        // Reload data after successful payment
        loadPortalData(parseInt(parentId))
        // Clean URL
        window.history.replaceState({}, '', '/parent-portal')
      } else if (paymentStatus === 'canceled') {
        setError('Payment was canceled. You can try again anytime.')
        // Clean URL
        window.history.replaceState({}, '', '/parent-portal')
      } else {
        loadPortalData(parseInt(parentId))
      }
    }

    checkAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (!session && !localStorage.getItem('parentId'))) {
        setLocation('/parent-login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setLocation])

  const loadPortalData = async (parentId: number) => {
    try {
      setLoading(true)

      // Load parent data
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .select('*')
        .eq('id', parentId)
        .single()

      if (parentError) throw parentError
      setParent(parentData)

      // Load students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('parent_id', parentId)
        .order('grade', { ascending: true })

      if (studentsError) throw studentsError
      setStudents(studentsData || [])

      // Load payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: false })
        .limit(50) // Increased to check all payments

      if (paymentsError) throw paymentsError
      setPayments(paymentsData || [])

      // Load book products
      try {
        const productsResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-products`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        )
        if (productsResponse.ok) {
          const { products } = await productsResponse.json()
          // Filter out term fee products, only show book products
          const books = products.filter((p: BookProduct) => 
            !p.metadata?.term_fee && 
            !p.name.toLowerCase().includes('term fee')
          )
          setBookProducts(books)
        }
      } catch (err) {
        console.error('Failed to load book products:', err)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portal data')
    } finally {
      setLoading(false)
    }
  }

  const handlePayTermFees = async (studentId?: number) => {
    if (!parent) return

    setPayingFor(studentId || 0)
    try {
      // If no studentId provided, pay for all students who need payment
      let targetStudentId: number | null = studentId || null
      
      // If paying from banner and not all students need payment, pay only for unpaid students
      // We'll handle this by passing null but the Edge Function will get all students
      // Actually, we need to pass the unpaid student IDs
      if (!studentId && !allStudentsNeedPayment()) {
        // Pay for all unpaid students - pass null and let Edge Function handle it
        // The Edge Function will get all students, but we want to filter to unpaid ones
        // For now, we'll create a checkout for all students and let the webhook handle splitting
        // Actually, better approach: create checkout for all students, webhook will create records for all
        // But we want to only charge for unpaid ones... 
        // Let me think: if we pass null, it gets all students. But we want only unpaid.
        // We could pass an array of unpaid student IDs, but the function expects a single studentId
        // For now, let's pass null and the function will charge for all students
        // The webhook will create payment records for all students in the metadata
        // But we only want to charge for unpaid ones...
        
        // Actually, the simplest: if some have paid, don't use "Pay for All" button
        // User should click individual student buttons instead
        // But user wants a banner button that pays for unpaid students
        
        // Let's modify: if not all need payment, we need to pass the unpaid student IDs
        // But the function only accepts one studentId. We need to modify the function or
        // create a new approach. For now, let's just disable the "Pay for All" when some have paid
        // and show individual buttons only.
        targetStudentId = null // Will pay for all, but webhook should handle it correctly
      }

      // Call Edge Function to create checkout session for term fees
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pay-term-fees`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            parentId: parent.id,
            studentId: targetStudentId, // null means pay for all children
            parentEmail: parent.parent1_email,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create payment session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment')
      setPayingFor(null)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('parentId')
    localStorage.removeItem('parentEmail')
    sessionStorage.removeItem('parentId')
    sessionStorage.removeItem('parentEmail')
    setLocation('/parent-login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-background py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !parent) {
    return (
      <div className="min-h-screen bg-neutral-background py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button onClick={() => setLocation('/parent-login')} className="mt-4 w-full">
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Check if term fees are paid for a specific student
  const hasPaidTermFees = (studentId: number | null) => {
    if (!studentId) {
      // Check if all students have paid individually
      return students.every(student => hasPaidTermFees(student.id))
    }
    
    // Check for specific student - ONLY count payments explicitly for this student
    // Payments with student_id === null are NOT counted for specific students
    const studentPayments = payments.filter(p => 
      p.student_id === studentId && // Must match exactly - no null checks
      p.paid_term_fees && 
      p.status === 'succeeded'
    )
    if (studentPayments.length === 0) return false
    
    const lastPayment = studentPayments[0]
    const lastPaymentDate = new Date(lastPayment.created_at)
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    return lastPaymentDate >= threeMonthsAgo
  }

  // Check if term fees are due (for all students)
  const needsTermFees = () => {
    return !hasPaidTermFees(null)
  }

  // Get students who need term fees
  const studentsNeedingTermFees = () => {
    return students.filter(student => !hasPaidTermFees(student.id))
  }

  // Check if all students need payment (none have paid)
  const allStudentsNeedPayment = () => {
    return students.length > 0 && students.every(student => !hasPaidTermFees(student.id))
  }

  const handlePurchaseBooks = async () => {
    if (!parent) return

    const selectedBookProducts = bookProducts.filter(book => selectedBooks[book.id])
    if (selectedBookProducts.length === 0) {
      setError('Please select at least one book to purchase')
      return
    }

    setPurchasingBooks(true)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/purchase-books`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            parentId: parent.id,
            parentEmail: parent.parent1_email,
            bookProducts: selectedBookProducts.map(book => ({
              priceId: book.priceId,
              quantity: 1,
            })),
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create payment session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate book purchase')
      setPurchasingBooks(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary font-amiri">
                Parent Portal
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome, {parent?.parent1_first_name} {parent?.parent1_last_name}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Term Fees Alert */}
          {needsTermFees() && (
            <Alert className="mb-6 border-yellow-500 bg-yellow-50">
              <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-medium">
                  Term fees are due for {studentsNeedingTermFees().length} student{studentsNeedingTermFees().length !== 1 ? 's' : ''}: {studentsNeedingTermFees().map(s => `${s.first_name} ${s.last_name}`).join(', ')}
                </span>
                {allStudentsNeedPayment() ? (
                  <Button
                    onClick={() => handlePayTermFees()}
                    disabled={payingFor !== null}
                    size="sm"
                  >
                    {payingFor === 0 ? 'Processing...' : 'Pay Term Fees for All'}
                  </Button>
                ) : (
                  <span className="text-sm text-gray-600">
                    Click "Pay Term Fees" on each student above to pay individually
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Children Section */}
            <Card>
              <CardHeader>
                <CardTitle>Your Children</CardTitle>
                <CardDescription>Enrolled students</CardDescription>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <p className="text-gray-500">No students enrolled yet.</p>
                ) : (
                  <div className="space-y-4">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {student.first_name} {student.last_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {student.grade} • Student ID: {student.student_id || `STU-${student.id.toString().padStart(4, '0')}`}
                            </p>
                            {student.quran_level && (
                              <p className="text-sm text-gray-500">
                                Quran Level: {student.quran_level}
                              </p>
                            )}
                            {student.current_school && (
                              <p className="text-sm text-gray-500">
                                School: {student.current_school}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {hasPaidTermFees(student.id) ? (
                              <Badge variant="default" className="bg-green-500">
                                Term Fees Paid
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePayTermFees(student.id)}
                                disabled={payingFor === student.id}
                              >
                                {payingFor === student.id ? 'Processing...' : 'Pay Term Fees'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Recent payments and transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-gray-500">No payment history available.</p>
                ) : (
                  <div className="space-y-2">
                    {payments.map((payment) => {
                      const paymentStudent = payment.student_id 
                        ? students.find(s => s.id === payment.student_id)
                        : null
                      
                      return (
                        <div
                          key={payment.id}
                          className="border rounded-lg p-3 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium">
                              ${payment.amount} {payment.currency.toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(payment.created_at).toLocaleDateString()}
                            </p>
                            {paymentStudent && (
                              <p className="text-xs text-gray-500 mt-1">
                                For: {paymentStudent.first_name} {paymentStudent.last_name}
                              </p>
                            )}
                            {!paymentStudent && payment.paid_term_fees && (
                              <p className="text-xs text-gray-500 mt-1">
                                For: All students
                              </p>
                            )}
                            <div className="flex gap-2 mt-1">
                              <Badge
                                variant={
                                  payment.status === 'succeeded' || payment.status === 'trial_active'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {payment.status}
                              </Badge>
                              {payment.paid_term_fees && (
                                <Badge variant="outline">Term Fees</Badge>
                              )}
                              {payment.paid_for_books && (
                                <Badge variant="outline">Books</Badge>
                              )}
                              {payment.trial_end_date && (
                                <Badge variant="outline">
                                  Trial ends: {new Date(payment.trial_end_date).toLocaleDateString()}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {parent?.stripe_customer_id && (
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`,
                          {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                            },
                            body: JSON.stringify({
                              customerId: parent.stripe_customer_id,
                              returnUrl: window.location.origin + '/parent-portal',
                            }),
                          }
                        )

                        if (!response.ok) throw new Error('Failed to create portal session')
                        const { url } = await response.json()
                        window.location.href = url
                      } catch (err) {
                        setError(err instanceof Error ? err.message : 'Failed to open billing portal')
                      }
                    }}
                  >
                    Manage Billing & Subscriptions
                  </Button>
                )}
                <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      Order Books
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Order Books</DialogTitle>
                      <DialogDescription>
                        Select the books you would like to purchase
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      {bookProducts.length === 0 ? (
                        <p className="text-gray-500">Loading books...</p>
                      ) : (
                        bookProducts.map((book) => (
                          <div key={book.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                            <Checkbox
                              id={book.id}
                              checked={selectedBooks[book.id] || false}
                              onCheckedChange={(checked) => {
                                setSelectedBooks(prev => ({
                                  ...prev,
                                  [book.id]: checked === true,
                                }))
                              }}
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={book.id}
                                className="font-medium cursor-pointer"
                              >
                                {book.name}
                              </label>
                              {book.description && (
                                <p className="text-sm text-gray-600 mt-1">{book.description}</p>
                              )}
                              <p className="text-sm font-semibold text-primary mt-1">
                                ${book.price.toFixed(2)} AUD
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowBookDialog(false)
                            setSelectedBooks({})
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handlePurchaseBooks}
                          disabled={purchasingBooks || Object.values(selectedBooks).every(v => !v)}
                        >
                          {purchasingBooks ? 'Processing...' : 'Purchase Selected Books'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" disabled>
                  View Grades (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ParentPortal

