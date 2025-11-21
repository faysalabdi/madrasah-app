import React, { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'

interface Student {
  id: number
  student_id: string | null
  first_name: string
  last_name: string
  grade: string
  parent_id: number
}

interface Parent {
  id: number
  parent_id: string | null
  parent1_first_name: string
  parent1_last_name: string
  parent1_email: string
}

interface Teacher {
  id: number
  first_name: string
  last_name: string
  email: string
  mobile: string | null
}

interface Payment {
  id: number
  parent_id: number
  student_id: number | null
  amount: number
  currency: string
  payment_type: string
  status: string
  paid_term_fees: boolean
  paid_for_books: boolean
  created_at: string
}

const AdminPortal: React.FC = () => {
  const [, setLocation] = useLocation()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')

  // Dashboard stats
  const [stats, setStats] = useState({
    totalParents: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalPayments: 0,
    unpaidStudents: 0,
  })

  // Teachers
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [showCreateTeacher, setShowCreateTeacher] = useState(false)
  const [newTeacher, setNewTeacher] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    password: '',
  })

  // Students
  const [students, setStudents] = useState<Student[]>([])
  const [parents, setParents] = useState<Parent[]>([])

  // Payments
  const [payments, setPayments] = useState<Payment[]>([])
  const [showCreatePayment, setShowCreatePayment] = useState(false)
  const [selectedParentForPayment, setSelectedParentForPayment] = useState<Parent | null>(null)
  const [selectedStudentsForPayment, setSelectedStudentsForPayment] = useState<number[]>([])
  const [selectedBooksForPayment, setSelectedBooksForPayment] = useState<{ [studentId: number]: string[] }>({}) // studentId -> array of book IDs
  const [bookProducts, setBookProducts] = useState<any[]>([])
  const [newPayment, setNewPayment] = useState({
    term_fees: true,
    books: false,
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  // Student assignment
  const [selectedTeacher, setSelectedTeacher] = useState<string>('')
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLocation('/admin-login')
        return
      }
      loadDashboardData()
    }
    checkAuth()
  }, [setLocation])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load stats
      const [parentsRes, studentsRes, teachersRes, paymentsRes] = await Promise.all([
        supabase.from('parents').select('id', { count: 'exact' }),
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('teachers').select('id', { count: 'exact' }),
        supabase.from('payments').select('id', { count: 'exact' }),
      ])

      // Count unpaid students (students without recent term fee payments)
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
      
      const { data: allPayments } = await supabase
        .from('payments')
        .select('student_id, created_at, paid_term_fees, status')
        .eq('paid_term_fees', true)
        .eq('status', 'succeeded')

      const paidStudentIds = new Set(
        allPayments
          ?.filter(p => p.student_id && new Date(p.created_at) >= threeMonthsAgo)
          .map(p => p.student_id) || []
      )

      const { data: allStudents } = await supabase.from('students').select('id')
      const unpaidCount = (allStudents?.length || 0) - paidStudentIds.size

      setStats({
        totalParents: parentsRes.count || 0,
        totalStudents: studentsRes.count || 0,
        totalTeachers: teachersRes.count || 0,
        totalPayments: paymentsRes.count || 0,
        unpaidStudents: unpaidCount,
      })

      // Load teachers
      const { data: teachersData } = await supabase
        .from('teachers')
        .select('*')
        .order('last_name', { ascending: true })
      setTeachers(teachersData || [])

      // Load students and parents
      const { data: studentsData } = await supabase
        .from('students')
        .select('*')
        .order('grade', { ascending: true })
      setStudents(studentsData || [])

      const { data: parentsData } = await supabase
        .from('parents')
        .select('id, parent_id, parent1_first_name, parent1_last_name, parent1_email')
        .order('parent1_last_name', { ascending: true })
      setParents(parentsData || [])

      // Load recent payments
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
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
          const books = products.filter((p: any) => 
            !p.metadata?.term_fee && 
            !p.name.toLowerCase().includes('term fee')
          )
          setBookProducts(books)
        }
      } catch (err) {
        console.error('Failed to load book products:', err)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeacher = async () => {
    try {
      setLoading(true)

      // First create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newTeacher.email,
        password: newTeacher.password,
      })

      if (authError) throw authError

      // Then create the teacher record
      if (!authData.user?.id) {
        throw new Error('Failed to create user account')
      }

      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .insert({
          user_id: authData.user.id,
          first_name: newTeacher.first_name,
          last_name: newTeacher.last_name,
          email: newTeacher.email,
          mobile: newTeacher.mobile || null,
        })
        .select()
        .single()

      if (teacherError) throw teacherError

      toast({
        title: 'Success',
        description: `Teacher ${newTeacher.first_name} ${newTeacher.last_name} created successfully.`,
      })

      setShowCreateTeacher(false)
      setNewTeacher({ first_name: '', last_name: '', email: '', mobile: '', password: '' })
      loadDashboardData()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create teacher',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePayment = async () => {
    if (!selectedParentForPayment) {
      toast({
        title: 'Error',
        description: 'Please select a parent',
        variant: 'destructive',
      })
      return
    }

    if (selectedStudentsForPayment.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one student',
        variant: 'destructive',
      })
      return
    }

    if (!newPayment.term_fees && !newPayment.books) {
      toast({
        title: 'Error',
        description: 'Please select at least one payment type (Term Fees or Books)',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)

      // Calculate total amount from books if selected
      let totalBookAmount = 0
      if (newPayment.books) {
        selectedStudentsForPayment.forEach(studentId => {
          const bookIds = selectedBooksForPayment[studentId] || []
          bookIds.forEach(bookId => {
            const book = bookProducts.find(b => b.id === bookId)
            if (book) {
              totalBookAmount += book.price
            }
          })
        })
      }

      // Get term fee amount (you might want to fetch this from Stripe or set a default)
      const termFeeAmount = 500 // Default term fee - adjust as needed
      const totalAmount = (newPayment.term_fees ? termFeeAmount * selectedStudentsForPayment.length : 0) + totalBookAmount

      // Create payment records for each student
      const paymentRecords = selectedStudentsForPayment.map(studentId => {
        const studentBookIds = selectedBooksForPayment[studentId] || []
        const studentBookAmount = studentBookIds.reduce((sum, bookId) => {
          const book = bookProducts.find(b => b.id === bookId)
          return sum + (book?.price || 0)
        }, 0)

        const studentAmount = (newPayment.term_fees ? termFeeAmount : 0) + studentBookAmount

        return {
          parent_id: selectedParentForPayment.id,
          student_id: studentId,
          amount: studentAmount,
          currency: 'aud',
          payment_type: newPayment.term_fees && studentBookAmount > 0 ? 'full_payment' : 
                        newPayment.term_fees ? 'term_fees' : 'books',
          status: 'succeeded',
          paid_term_fees: newPayment.term_fees,
          paid_for_books: studentBookAmount > 0,
          created_at: newPayment.payment_date,
          metadata: {
            payment_method: 'manual',
            notes: newPayment.notes,
            created_by: 'admin',
            book_ids: studentBookIds,
          },
        }
      })

      const { error } = await supabase.from('payments').insert(paymentRecords)

      if (error) throw error

      toast({
        title: 'Success',
        description: `Created ${paymentRecords.length} payment record(s) successfully.`,
      })

      setShowCreatePayment(false)
      setSelectedParentForPayment(null)
      setSelectedStudentsForPayment([])
      setSelectedBooksForPayment({})
      setNewPayment({
        term_fees: true,
        books: false,
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
      })
      loadDashboardData()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create payment',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAssignStudents = async () => {
    if (!selectedTeacher || selectedStudents.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select a teacher and at least one student',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)

      // Remove existing assignments for these students to this teacher
      await supabase
        .from('teacher_students')
        .delete()
        .eq('teacher_id', parseInt(selectedTeacher))
        .in('student_id', selectedStudents)

      // Create new assignments
      const assignments = selectedStudents.map(studentId => ({
        teacher_id: parseInt(selectedTeacher),
        student_id: studentId,
      }))

      const { error } = await supabase.from('teacher_students').insert(assignments)

      if (error) throw error

      toast({
        title: 'Success',
        description: `Assigned ${selectedStudents.length} student(s) to teacher.`,
      })

      setSelectedTeacher('')
      setSelectedStudents([])
      loadDashboardData()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to assign students',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('adminId')
    localStorage.removeItem('adminEmail')
    localStorage.removeItem('adminName')
    setLocation('/admin-login')
  }

  if (loading && stats.totalParents === 0) {
    return (
      <div className="min-h-screen bg-neutral-background py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary font-amiri">
                Admin Portal
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome, {localStorage.getItem('adminName') || 'Administrator'}
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="teachers">Teachers</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="parents">Parents</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Parents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalParents}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Students</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalStudents}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Teachers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalTeachers}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Payments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalPayments}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Unpaid Students</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">{stats.unpaidStudents}</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Payment Management</h2>
                <Dialog open={showCreatePayment} onOpenChange={setShowCreatePayment}>
                  <DialogTrigger asChild>
                    <Button>Create Manual Payment</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Manual Payment</DialogTitle>
                      <DialogDescription>
                        Record a payment made outside of Stripe. Select parent, students, and books paid for.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      {/* Step 1: Select Parent */}
                      <div className="space-y-2">
                        <Label>Step 1: Select Parent</Label>
                        <Select
                          value={selectedParentForPayment?.id.toString() || ''}
                          onValueChange={(value) => {
                            const parent = parents.find(p => p.id.toString() === value)
                            setSelectedParentForPayment(parent || null)
                            setSelectedStudentsForPayment([])
                            setSelectedBooksForPayment({})
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Click to select a parent" />
                          </SelectTrigger>
                          <SelectContent>
                            {parents.map((p) => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                {p.parent1_first_name} {p.parent1_last_name} ({p.parent1_email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Step 2: Select Students */}
                      {selectedParentForPayment && (
                        <div className="space-y-2">
                          <Label>Step 2: Select Students</Label>
                          <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                            {students
                              .filter(s => s.parent_id === selectedParentForPayment.id)
                              .map((student) => {
                                const isSelected = selectedStudentsForPayment.includes(student.id)
                                return (
                                  <div
                                    key={student.id}
                                    className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                                      isSelected ? 'bg-primary/10' : 'hover:bg-gray-50'
                                    }`}
                                    onClick={() => {
                                      if (isSelected) {
                                        setSelectedStudentsForPayment(selectedStudentsForPayment.filter(id => id !== student.id))
                                        // Remove books for this student
                                        const newBooks = { ...selectedBooksForPayment }
                                        delete newBooks[student.id]
                                        setSelectedBooksForPayment(newBooks)
                                      } else {
                                        setSelectedStudentsForPayment([...selectedStudentsForPayment, student.id])
                                      }
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {}}
                                      className="cursor-pointer"
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium">
                                        {student.first_name} {student.last_name}
                                      </p>
                                      <p className="text-sm text-gray-600">{student.grade}</p>
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        </div>
                      )}

                      {/* Step 3: Payment Types */}
                      {selectedStudentsForPayment.length > 0 && (
                        <div className="space-y-2">
                          <Label>Step 3: What was paid for?</Label>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="term_fees_check"
                                checked={newPayment.term_fees}
                                onChange={(e) => setNewPayment({ ...newPayment, term_fees: e.target.checked })}
                                className="cursor-pointer"
                              />
                              <Label htmlFor="term_fees_check" className="cursor-pointer font-normal">
                                Term Fees (${200 * selectedStudentsForPayment.length} AUD for {selectedStudentsForPayment.length} student{selectedStudentsForPayment.length > 1 ? 's' : ''})
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="books_check"
                                checked={newPayment.books}
                                onChange={(e) => setNewPayment({ ...newPayment, books: e.target.checked })}
                                className="cursor-pointer"
                              />
                              <Label htmlFor="books_check" className="cursor-pointer font-normal">
                                Books (select books per student below)
                              </Label>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Select Books for Each Student */}
                      {newPayment.books && selectedStudentsForPayment.length > 0 && (
                        <div className="space-y-4">
                          <Label>Step 4: Select Books for Each Student</Label>
                          <p className="text-sm text-gray-600">
                            Each student receives all selected books. Select which books were purchased for each student.
                          </p>
                          {selectedStudentsForPayment.map((studentId) => {
                            const student = students.find(s => s.id === studentId)
                            const studentBookIds = selectedBooksForPayment[studentId] || []
                            return (
                              <div key={studentId} className="border rounded-lg p-4 space-y-2">
                                <h4 className="font-medium">
                                  Books for {student?.first_name} {student?.last_name}:
                                </h4>
                                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                                  {bookProducts.map((book) => {
                                    const isSelected = studentBookIds.includes(book.id)
                                    return (
                                      <div
                                        key={book.id}
                                        className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                                          isSelected ? 'bg-primary/10' : 'hover:bg-gray-50'
                                        }`}
                                        onClick={() => {
                                          const currentBooks = selectedBooksForPayment[studentId] || []
                                          if (isSelected) {
                                            setSelectedBooksForPayment({
                                              ...selectedBooksForPayment,
                                              [studentId]: currentBooks.filter(id => id !== book.id),
                                            })
                                          } else {
                                            setSelectedBooksForPayment({
                                              ...selectedBooksForPayment,
                                              [studentId]: [...currentBooks, book.id],
                                            })
                                          }
                                        }}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() => {}}
                                          className="cursor-pointer"
                                        />
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">{book.name}</p>
                                          <p className="text-xs text-gray-600">${book.price.toFixed(2)} AUD</p>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Payment Date and Notes */}
                      {selectedStudentsForPayment.length > 0 && (
                        <>
                          <div className="space-y-2">
                            <Label>Payment Date</Label>
                            <Input
                              type="date"
                              value={newPayment.payment_date}
                              onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Notes (Optional)</Label>
                            <Textarea
                              value={newPayment.notes}
                              onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                              placeholder="Additional notes about this payment"
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button variant="outline" onClick={() => {
                              setShowCreatePayment(false)
                              setSelectedParentForPayment(null)
                              setSelectedStudentsForPayment([])
                              setSelectedBooksForPayment({})
                            }}>
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleCreatePayment} 
                              disabled={loading || !selectedParentForPayment || selectedStudentsForPayment.length === 0 || (!newPayment.term_fees && !newPayment.books)}
                            >
                              {loading ? 'Creating...' : 'Create Payment(s)'}
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {payments.slice(0, 20).map((payment) => {
                      const parent = parents.find(p => p.id === payment.parent_id)
                      const student = payment.student_id ? students.find(s => s.id === payment.student_id) : null
                      return (
                        <div key={payment.id} className="border rounded-lg p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium">
                              ${payment.amount} {payment.currency.toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {parent?.parent1_first_name} {parent?.parent1_last_name}
                              {student && ` - ${student.first_name} ${student.last_name}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(payment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={payment.status === 'succeeded' ? 'default' : 'secondary'}>
                              {payment.status}
                            </Badge>
                            {payment.paid_term_fees && <Badge variant="outline">Term Fees</Badge>}
                            {payment.paid_for_books && <Badge variant="outline">Books</Badge>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Teachers Tab */}
            <TabsContent value="teachers" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Teacher Management</h2>
                <Dialog open={showCreateTeacher} onOpenChange={setShowCreateTeacher}>
                  <DialogTrigger asChild>
                    <Button>Create New Teacher</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Teacher</DialogTitle>
                      <DialogDescription>
                        Add a new teacher to the system. They will receive login credentials.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input
                          value={newTeacher.first_name}
                          onChange={(e) => setNewTeacher({ ...newTeacher, first_name: e.target.value })}
                          placeholder="John"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input
                          value={newTeacher.last_name}
                          onChange={(e) => setNewTeacher({ ...newTeacher, last_name: e.target.value })}
                          placeholder="Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newTeacher.email}
                          onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                          placeholder="john.doe@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Mobile (Optional)</Label>
                        <Input
                          value={newTeacher.mobile}
                          onChange={(e) => setNewTeacher({ ...newTeacher, mobile: e.target.value })}
                          placeholder="0412345678"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input
                          type="password"
                          value={newTeacher.password}
                          onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                          placeholder="Minimum 6 characters"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowCreateTeacher(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateTeacher}
                          disabled={loading || !newTeacher.first_name || !newTeacher.last_name || !newTeacher.email || !newTeacher.password || newTeacher.password.length < 6}
                        >
                          Create Teacher
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Teachers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {teachers.map((teacher) => (
                      <div key={teacher.id} className="border rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {teacher.first_name} {teacher.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{teacher.email}</p>
                          {teacher.mobile && (
                            <p className="text-xs text-gray-500">{teacher.mobile}</p>
                          )}
                        </div>
                        <Badge variant="outline">Teacher</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assign Students to Teachers</CardTitle>
                  <CardDescription>
                    Select a teacher and students to assign them
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Teacher</Label>
                    <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id.toString()}>
                            {teacher.first_name} {teacher.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Students (Multiple)</Label>
                    <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                      {students.map((student) => {
                        const parent = parents.find(p => p.id === student.parent_id)
                        const isSelected = selectedStudents.includes(student.id)
                        return (
                          <div
                            key={student.id}
                            className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                              isSelected ? 'bg-primary/10' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedStudents(selectedStudents.filter(id => id !== student.id))
                              } else {
                                setSelectedStudents([...selectedStudents, student.id])
                              }
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="cursor-pointer"
                            />
                            <div className="flex-1">
                              <p className="font-medium">
                                {student.first_name} {student.last_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {student.grade} • {parent?.parent1_first_name} {parent?.parent1_last_name}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <Button
                    onClick={handleAssignStudents}
                    disabled={!selectedTeacher || selectedStudents.length === 0 || loading}
                    className="w-full"
                  >
                    Assign {selectedStudents.length} Student(s) to Teacher
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Parents Tab */}
            <TabsContent value="parents" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Parents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {parents.map((parent) => {
                      const parentStudents = students.filter(s => s.parent_id === parent.id)
                      return (
                        <div key={parent.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {parent.parent1_first_name} {parent.parent1_last_name}
                              </p>
                              <p className="text-sm text-gray-600">{parent.parent1_email}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {parentStudents.length} student(s): {parentStudents.map(s => `${s.first_name} ${s.last_name}`).join(', ')}
                              </p>
                            </div>
                            <Badge variant="outline">Parent</Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default AdminPortal

