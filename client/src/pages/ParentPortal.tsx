import React, { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
  created_at: string
  trial_end_date: string | null
}

const ParentPortal: React.FC = () => {
  const [, setLocation] = useLocation()
  const [parent, setParent] = useState<Parent | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [payingFor, setPayingFor] = useState<number | null>(null) // student ID being paid for

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // No auth session, check if parentId exists in sessionStorage (legacy)
        const parentId = sessionStorage.getItem('parentId')
        if (!parentId) {
          setLocation('/parent-login')
          return
        }
      }

      const parentId = sessionStorage.getItem('parentId')
      if (!parentId) {
        setLocation('/parent-login')
        return
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
        .limit(10)

      if (paymentsError) throw paymentsError
      setPayments(paymentsData || [])
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
            studentId: studentId || null, // null means pay for all children
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

  // Check if term fees are due (simplified: check if last payment was more than 3 months ago or never paid)
  const needsTermFees = () => {
    if (payments.length === 0) return true
    const lastTermFeePayment = payments.find(p => p.paid_term_fees && p.status === 'succeeded')
    if (!lastTermFeePayment) return true
    
    const lastPaymentDate = new Date(lastTermFeePayment.created_at)
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    
    return lastPaymentDate < threeMonthsAgo
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
              <AlertDescription className="flex items-center justify-between">
                <span className="font-medium">
                  Term fees are due. Please make a payment to continue enrollment.
                </span>
                <Button
                  onClick={() => handlePayTermFees()}
                  disabled={payingFor !== null}
                  size="sm"
                >
                  {payingFor === 0 ? 'Processing...' : 'Pay Term Fees'}
                </Button>
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
                              {student.grade} • Student ID: {student.student_id}
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePayTermFees(student.id)}
                            disabled={payingFor === student.id}
                          >
                            {payingFor === student.id ? 'Processing...' : 'Pay Term Fees'}
                          </Button>
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
                    {payments.map((payment) => (
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
                    ))}
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
                <Button variant="outline" disabled>
                  Order Books (Coming Soon)
                </Button>
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

