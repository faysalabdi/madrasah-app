import React, { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trash2, Calendar, BookOpen, FileText, UserCheck, Search } from 'lucide-react'
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
  hasPaidTermFees?: boolean
  lastPaymentDate?: string
}

interface Parent {
  id: number
  parent_id: string | null
  parent1_first_name: string
  parent1_last_name: string
  parent1_email: string
  stripe_customer_id: string | null
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
  
  // Bulk Invoice
  const [showBulkInvoiceDialog, setShowBulkInvoiceDialog] = useState(false)
  const [bulkInvoiceDays, setBulkInvoiceDays] = useState(30)
  const [bulkInvoiceSendEmails, setBulkInvoiceSendEmails] = useState(true)
  const [bulkInvoiceLoading, setBulkInvoiceLoading] = useState(false)
  const [selectedParentsForInvoice, setSelectedParentsForInvoice] = useState<number[]>([])
  const [bulkInvoiceMode, setBulkInvoiceMode] = useState<'all' | 'selected'>('all')
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

  // Student Records
  const [selectedStudentForRecords, setSelectedStudentForRecords] = useState<string>('')
  const [recordsType, setRecordsType] = useState<'attendance' | 'homework' | 'behavior' | 'notes'>('attendance')
  const [allAttendance, setAllAttendance] = useState<any[]>([])
  const [allHomework, setAllHomework] = useState<any[]>([])
  const [allBehaviorNotes, setAllBehaviorNotes] = useState<any[]>([])
  const [allStudentNotes, setAllStudentNotes] = useState<any[]>([])

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

  useEffect(() => {
    if (activeTab === 'records') {
      loadAllRecords()
    }
  }, [activeTab, selectedStudentForRecords, recordsType])

  const loadAllRecords = async () => {
    try {
      if (recordsType === 'attendance') {
        let query = supabase.from('attendance').select(`
          *,
          students (id, first_name, last_name, grade, student_id),
          teachers (id, first_name, last_name)
        `).order('date', { ascending: false }).limit(100)
        
        if (selectedStudentForRecords) {
          query = query.eq('student_id', parseInt(selectedStudentForRecords))
        }
        
        const { data } = await query
        setAllAttendance(data || [])
      } else if (recordsType === 'homework') {
        let query = supabase.from('homework').select(`
          *,
          students (id, first_name, last_name, grade, student_id),
          teachers (id, first_name, last_name)
        `).order('assigned_date', { ascending: false }).limit(100)
        
        if (selectedStudentForRecords) {
          query = query.eq('student_id', parseInt(selectedStudentForRecords))
        }
        
        const { data } = await query
        setAllHomework(data || [])
      } else if (recordsType === 'behavior') {
        let query = supabase.from('behavior_notes').select(`
          *,
          students (id, first_name, last_name, grade, student_id),
          teachers (id, first_name, last_name)
        `).order('date', { ascending: false }).limit(100)
        
        if (selectedStudentForRecords) {
          query = query.eq('student_id', parseInt(selectedStudentForRecords))
        }
        
        const { data } = await query
        setAllBehaviorNotes(data || [])
      } else if (recordsType === 'notes') {
        let query = supabase.from('student_notes').select(`
          *,
          students (id, first_name, last_name, grade, student_id),
          teachers (id, first_name, last_name)
        `).order('created_at', { ascending: false }).limit(100)
        
        if (selectedStudentForRecords) {
          query = query.eq('student_id', parseInt(selectedStudentForRecords))
        }
        
        const { data } = await query
        setAllStudentNotes(data || [])
      }
    } catch (err) {
      console.error('Error loading records:', err)
      toast({
        title: 'Error',
        description: 'Failed to load records.',
        variant: 'destructive',
      })
    }
  }

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
      
      // Calculate payment status for each student (reuse threeMonthsAgo from stats calculation above)
      const { data: termFeePayments } = await supabase
        .from('payments')
        .select('student_id, created_at, paid_term_fees, status')
        .eq('paid_term_fees', true)
        .eq('status', 'succeeded')
        .not('student_id', 'is', null)
      
      // Create a map of student payment status
      const studentPaymentMap = new Map<number, { hasPaid: boolean; lastPaymentDate: string | null }>()
      
      if (termFeePayments) {
        termFeePayments.forEach(payment => {
          if (payment.student_id) {
            const paymentDate = new Date(payment.created_at)
            const existing = studentPaymentMap.get(payment.student_id)
            
            // Check if payment is within last 3 months
            const isRecent = paymentDate >= threeMonthsAgo
            
            // Keep the most recent payment date
            if (!existing) {
              studentPaymentMap.set(payment.student_id, {
                hasPaid: isRecent,
                lastPaymentDate: payment.created_at
              })
            } else {
              const existingDate = existing.lastPaymentDate ? new Date(existing.lastPaymentDate) : new Date(0)
              const isNewer = paymentDate > existingDate
              
              if (isNewer) {
                studentPaymentMap.set(payment.student_id, {
                  hasPaid: isRecent || existing.hasPaid,
                  lastPaymentDate: payment.created_at
                })
              } else if (existing.hasPaid && isRecent) {
                // Keep existing date but update hasPaid status
                studentPaymentMap.set(payment.student_id, {
                  hasPaid: true,
                  lastPaymentDate: existing.lastPaymentDate
                })
              }
            }
          }
        })
      }
      
      // Add payment status to students
      const studentsWithPaymentStatus = (studentsData || []).map(student => ({
        ...student,
        hasPaidTermFees: studentPaymentMap.get(student.id)?.hasPaid || false,
        lastPaymentDate: studentPaymentMap.get(student.id)?.lastPaymentDate || null
      }))
      
      setStudents(studentsWithPaymentStatus)

      const { data: parentsData } = await supabase
        .from('parents')
        .select('id, parent_id, parent1_first_name, parent1_last_name, parent1_email, stripe_customer_id')
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
      const termFeeAmount = 200 // Default term fee - adjust as needed
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
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="teachers">Teachers</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="parents">Parents</TabsTrigger>
              <TabsTrigger value="records">Student Records</TabsTrigger>
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
                  <CardDescription>Click the trash icon to delete a payment record</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {payments.slice(0, 20).map((payment) => {
                      const parent = parents.find(p => p.id === payment.parent_id)
                      const student = payment.student_id ? students.find(s => s.id === payment.student_id) : null
                      return (
                        <div key={payment.id} className="border rounded-lg p-3 flex justify-between items-center">
                          <div className="flex-1">
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
                          <div className="flex gap-2 items-center">
                            <Badge variant={payment.status === 'succeeded' ? 'default' : 'secondary'}>
                              {payment.status}
                            </Badge>
                            {payment.paid_term_fees && <Badge variant="outline">Term Fees</Badge>}
                            {payment.paid_for_books && <Badge variant="outline">Books</Badge>}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                if (confirm(`Are you sure you want to delete this payment record for $${payment.amount}? This action cannot be undone.`)) {
                                  try {
                                    const { error } = await supabase
                                      .from('payments')
                                      .delete()
                                      .eq('id', payment.id)
                                    
                                    if (error) throw error
                                    
                                    toast({
                                      title: 'Success',
                                      description: 'Payment record deleted successfully.',
                                    })
                                    
                                    loadDashboardData()
                                  } catch (err: any) {
                                    toast({
                                      title: 'Error',
                                      description: err.message || 'Failed to delete payment record.',
                                      variant: 'destructive',
                                    })
                                  }
                                }
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
            <TabsContent value="students" className="mt-6 space-y-6">
              {/* Students List with Payment Status */}
              <Card>
                <CardHeader>
                  <CardTitle>All Students</CardTitle>
                  <CardDescription>
                    View all students and their term fee payment status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {students.map((student) => {
                      const parent = parents.find(p => p.id === student.parent_id)
                      return (
                        <div key={student.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">
                                  {student.first_name} {student.last_name}
                                </p>
                                {student.hasPaidTermFees ? (
                                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                                    Term Fees Paid
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-300">
                                    Term Fees Unpaid
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {student.grade} • {parent?.parent1_first_name} {parent?.parent1_last_name}
                              </p>
                              {student.lastPaymentDate && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Last payment: {new Date(student.lastPaymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Assign Students to Teachers */}
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
                              <div className="flex items-center gap-2">
                                <p className="font-medium">
                                  {student.first_name} {student.last_name}
                                </p>
                                {student.hasPaidTermFees ? (
                                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                                    Paid
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-300">
                                    Unpaid
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {student.grade} • {parent?.parent1_first_name} {parent?.parent1_last_name}
                                {student.lastPaymentDate && (
                                  <span className="ml-2 text-xs">
                                    (Last paid: {new Date(student.lastPaymentDate).toLocaleDateString()})
                                  </span>
                                )}
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
              <div className="mb-4 space-y-3">
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      if (confirm('This will create Stripe customers for all parents who don\'t have one yet. This allows them to receive payment notifications from Stripe. Continue?')) {
                        setLoading(true)
                        try {
                          const response = await fetch(
                            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-stripe-customers`,
                            {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                              },
                            }
                          )

                          if (!response.ok) {
                            const errorData = await response.json().catch(() => ({}))
                            throw new Error(errorData.error || 'Failed to create Stripe customers')
                          }

                          const data = await response.json()
                          toast({
                            title: 'Success',
                            description: `Created Stripe customers for ${data.created || 0} parent(s). ${data.skipped || 0} already had customers.`,
                          })
                          loadDashboardData()
                        } catch (err: any) {
                          toast({
                            title: 'Error',
                            description: err.message || 'Failed to create Stripe customers.',
                            variant: 'destructive',
                          })
                        } finally {
                          setLoading(false)
                        }
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Stripe Customers for All Parents'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (confirm('This will sync all parent Stripe customer IDs with Stripe. Invalid or deleted customers will be cleared and recreated. Continue?')) {
                        setLoading(true)
                        try {
                          const response = await fetch(
                            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-stripe-customers`,
                            {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                              },
                            }
                          )

                          if (!response.ok) {
                            const errorData = await response.json().catch(() => ({}))
                            throw new Error(errorData.error || 'Failed to sync Stripe customers')
                          }

                          const data = await response.json()
                          toast({
                            title: 'Success',
                            description: `Synced ${data.total || 0} parent(s): ${data.valid || 0} valid, ${data.invalid || 0} invalid (cleared), ${data.recreated || 0} recreated.`,
                          })
                          loadDashboardData()
                        } catch (err: any) {
                          toast({
                            title: 'Error',
                            description: err.message || 'Failed to sync Stripe customers.',
                            variant: 'destructive',
                          })
                        } finally {
                          setLoading(false)
                        }
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Syncing...' : 'Sync Stripe Customers'}
                  </Button>
                  <Button
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setBulkInvoiceMode('all')
                      setShowBulkInvoiceDialog(true)
                    }}
                    disabled={loading}
                  >
                    Bulk Invoice All Parents
                  </Button>
                  <Button
                    variant="default"
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      if (selectedParentsForInvoice.length === 0) {
                        toast({
                          title: 'No Parents Selected',
                          description: 'Please select at least one parent from the list below.',
                          variant: 'destructive',
                        })
                        return
                      }
                      setBulkInvoiceMode('selected')
                      setShowBulkInvoiceDialog(true)
                    }}
                    disabled={loading || selectedParentsForInvoice.length === 0}
                  >
                    Invoice Selected ({selectedParentsForInvoice.length})
                  </Button>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    <strong>Create:</strong> Creates Stripe customer records for all parents who don't have one yet. 
                    This enables Stripe billing/invoicing features and payment notifications.
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Sync:</strong> Verifies all existing Stripe customer IDs against Stripe. 
                    Invalid or deleted customers will be cleared from the database and recreated if possible.
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Bulk Invoice:</strong> Creates and sends invoices to all parents with Stripe customer IDs. 
                    Each parent will be invoiced for term fees for all their students. Invoices will attempt to charge automatically.
                  </p>
                </div>
              </div>
              
              {/* Bulk Invoice Dialog */}
              <Dialog open={showBulkInvoiceDialog} onOpenChange={setShowBulkInvoiceDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {bulkInvoiceMode === 'all' ? 'Bulk Invoice All Parents' : `Invoice Selected Parents (${selectedParentsForInvoice.length})`}
                    </DialogTitle>
                    <DialogDescription>
                      {bulkInvoiceMode === 'all' 
                        ? 'This will create invoices for all parents with Stripe customer IDs. Each invoice will include term fees for all their students.'
                        : `This will create invoices for ${selectedParentsForInvoice.length} selected parent(s). Each invoice will include term fees for all their students.`
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="days-until-due">Days Until Due</Label>
                      <Input
                        id="days-until-due"
                        type="number"
                        min="0"
                        max="365"
                        value={bulkInvoiceDays}
                        onChange={(e) => setBulkInvoiceDays(parseInt(e.target.value) || 30)}
                      />
                      <p className="text-xs text-gray-500">
                        Number of days until the invoice is due. Set to 0 for immediate payment.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="send-emails"
                        checked={bulkInvoiceSendEmails}
                        onCheckedChange={(checked) => setBulkInvoiceSendEmails(checked === true)}
                      />
                      <Label htmlFor="send-emails" className="cursor-pointer">
                        Send invoice emails to parents
                      </Label>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> This will create invoices for all parents with Stripe customer IDs. 
                        Stripe will attempt to automatically charge saved payment methods. 
                        Parents without saved payment methods will receive an invoice to pay manually.
                      </p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowBulkInvoiceDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={async () => {
                          const confirmMessage = bulkInvoiceMode === 'all'
                            ? 'This will create invoices for all parents with Stripe customer IDs. Continue?'
                            : `This will create invoices for ${selectedParentsForInvoice.length} selected parent(s). Continue?`
                          
                          if (!confirm(confirmMessage)) {
                            return
                          }
                          
                          setBulkInvoiceLoading(true)
                          try {
                            const requestBody: any = {
                              daysUntilDue: bulkInvoiceDays,
                              sendEmails: bulkInvoiceSendEmails,
                            }
                            
                            // Add parent IDs if invoicing selected parents
                            if (bulkInvoiceMode === 'selected') {
                              requestBody.parentIds = selectedParentsForInvoice
                            }
                            
                            const response = await fetch(
                              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bulk-invoice`,
                              {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                                },
                                body: JSON.stringify(requestBody),
                              }
                            )

                            if (!response.ok) {
                              const errorData = await response.json().catch(() => ({}))
                              throw new Error(errorData.error || 'Failed to create bulk invoices')
                            }

                            const data = await response.json()
                            
                            if (data.failed && data.failed.length > 0) {
                              toast({
                                title: 'Partial Success',
                                description: `Created ${data.succeeded || 0} invoice(s) successfully. ${data.failed.length} failed. Check console for details.`,
                                variant: 'default',
                              })
                              console.log('Failed invoices:', data.results.failed)
                            } else {
                              toast({
                                title: 'Success',
                                description: `Successfully created ${data.succeeded || 0} invoice(s) for all parents.`,
                              })
                            }
                            
                            setShowBulkInvoiceDialog(false)
                            setSelectedParentsForInvoice([]) // Clear selection after invoicing
                            loadDashboardData()
                          } catch (err: any) {
                            toast({
                              title: 'Error',
                              description: err.message || 'Failed to create bulk invoices.',
                              variant: 'destructive',
                            })
                          } finally {
                            setBulkInvoiceLoading(false)
                          }
                        }}
                        disabled={bulkInvoiceLoading}
                      >
                        {bulkInvoiceLoading ? 'Creating Invoices...' : 'Create Invoices'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>All Parents</CardTitle>
                      <CardDescription>
                        Select parents to invoice individually
                      </CardDescription>
                    </div>
                    {selectedParentsForInvoice.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedParentsForInvoice([])}
                      >
                        Clear Selection ({selectedParentsForInvoice.length})
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {parents.map((parent) => {
                      const parentStudents = students.filter(s => s.parent_id === parent.id)
                      const isSelected = selectedParentsForInvoice.includes(parent.id)
                      const hasStripeCustomer = !!parent.stripe_customer_id
                      return (
                        <div
                          key={parent.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-gray-50'
                          } ${!hasStripeCustomer ? 'opacity-60' : ''}`}
                          onClick={() => {
                            if (!hasStripeCustomer) return
                            if (isSelected) {
                              setSelectedParentsForInvoice(selectedParentsForInvoice.filter(id => id !== parent.id))
                            } else {
                              setSelectedParentsForInvoice([...selectedParentsForInvoice, parent.id])
                            }
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3 flex-1">
                              {hasStripeCustomer && (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="mt-1 cursor-pointer"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-medium">
                                  {parent.parent1_first_name} {parent.parent1_last_name}
                                </p>
                                <p className="text-sm text-gray-600">{parent.parent1_email}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {parentStudents.length} student(s): {parentStudents.map(s => `${s.first_name} ${s.last_name}`).join(', ')}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                              {parent.stripe_customer_id ? (
                                <Badge variant="default" className="bg-green-500">Stripe Customer</Badge>
                              ) : (
                                <Badge variant="secondary">No Stripe Customer</Badge>
                              )}
                              <Badge variant="outline">Parent</Badge>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Student Records Tab */}
            <TabsContent value="records" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Student Records</h2>
                </div>

                {/* Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle>Filters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Student</Label>
                        <Select value={selectedStudentForRecords} onValueChange={setSelectedStudentForRecords}>
                          <SelectTrigger>
                            <SelectValue placeholder="All students" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All students</SelectItem>
                            {students.map((student) => (
                              <SelectItem key={student.id} value={student.id.toString()}>
                                {student.first_name} {student.last_name} ({student.grade})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Record Type</Label>
                        <Select value={recordsType} onValueChange={(v: any) => setRecordsType(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="attendance">Attendance</SelectItem>
                            <SelectItem value="homework">Homework</SelectItem>
                            <SelectItem value="behavior">Behavior Notes</SelectItem>
                            <SelectItem value="notes">General Notes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Records Display */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {recordsType === 'attendance' && <Calendar className="h-5 w-5" />}
                      {recordsType === 'homework' && <BookOpen className="h-5 w-5" />}
                      {(recordsType === 'behavior' || recordsType === 'notes') && <FileText className="h-5 w-5" />}
                      {recordsType === 'attendance' && 'Attendance Records'}
                      {recordsType === 'homework' && 'Homework Assignments'}
                      {recordsType === 'behavior' && 'Behavior Notes'}
                      {recordsType === 'notes' && 'General Notes'}
                    </CardTitle>
                    <CardDescription>
                      {recordsType === 'attendance' && `${allAttendance.length} records`}
                      {recordsType === 'homework' && `${allHomework.length} assignments`}
                      {recordsType === 'behavior' && `${allBehaviorNotes.length} notes`}
                      {recordsType === 'notes' && `${allStudentNotes.length} notes`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recordsType === 'attendance' && (
                      <div className="space-y-3">
                        {allAttendance.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">No attendance records found.</p>
                        ) : (
                          allAttendance.map((record: any) => {
                            const student = record.students
                            const teacher = record.teachers
                            const getStatusColor = (status: string) => {
                              if (status.includes('present_with_uniform')) return 'bg-green-100 text-green-800 border-green-300'
                              if (status.includes('present_no_uniform')) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
                              if (status.includes('late_uniform')) return 'bg-orange-100 text-orange-800 border-orange-300'
                              if (status.includes('late_no_uniform')) return 'bg-amber-100 text-amber-800 border-amber-300'
                              if (status.includes('absent_with_excuse')) return 'bg-blue-100 text-blue-800 border-blue-300'
                              if (status.includes('absent_no_excuse')) return 'bg-red-100 text-red-800 border-red-300'
                              return 'bg-gray-100 text-gray-800 border-gray-300'
                            }
                            const getStatusLabel = (status: string) => {
                              return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                            }
                            return (
                              <Card key={record.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <p className="font-semibold text-lg">
                                        {student?.first_name} {student?.last_name} ({student?.grade})
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                        {teacher && ` • Teacher: ${teacher.first_name} ${teacher.last_name}`}
                                      </p>
                                      {record.notes && (
                                        <p className="text-sm text-gray-700 mt-1">{record.notes}</p>
                                      )}
                                    </div>
                                    <Badge className={`${getStatusColor(record.status)} border font-medium`}>
                                      {getStatusLabel(record.status)}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })
                        )}
                      </div>
                    )}

                    {recordsType === 'homework' && (
                      <div className="space-y-3">
                        {allHomework.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">No homework assignments found.</p>
                        ) : (
                          allHomework.map((hw: any) => {
                            const student = hw.students
                            const teacher = hw.teachers
                            const isOverdue = hw.due_date && !hw.completed && new Date(hw.due_date) < new Date()
                            return (
                              <Card key={hw.id} className={`hover:shadow-md transition-shadow ${hw.completed ? 'opacity-75' : ''} ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}>
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <p className="font-semibold text-lg mb-1">
                                        {student?.first_name} {student?.last_name} ({student?.grade})
                                      </p>
                                      <p className="font-medium mb-1">{hw.title}</p>
                                      {hw.description && (
                                        <p className="text-sm text-gray-700 mb-2">{hw.description}</p>
                                      )}
                                      <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>Assigned: {new Date(hw.assigned_date).toLocaleDateString()}</span>
                                        {hw.due_date && (
                                          <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
                                            Due: {new Date(hw.due_date).toLocaleDateString()}
                                            {isOverdue && ' (Overdue)'}
                                          </span>
                                        )}
                                        {hw.completed && hw.completion_date && (
                                          <span className="text-green-600 font-medium">
                                            Completed: {new Date(hw.completion_date).toLocaleDateString()}
                                          </span>
                                        )}
                                        {teacher && <span>Teacher: {teacher.first_name} {teacher.last_name}</span>}
                                      </div>
                                    </div>
                                    <Badge variant={hw.completed ? 'default' : isOverdue ? 'destructive' : 'secondary'}>
                                      {hw.completed ? 'Completed' : isOverdue ? 'Overdue' : 'Pending'}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })
                        )}
                      </div>
                    )}

                    {recordsType === 'behavior' && (
                      <div className="space-y-3">
                        {allBehaviorNotes.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">No behavior notes found.</p>
                        ) : (
                          allBehaviorNotes.map((note: any) => {
                            const student = note.students
                            const teacher = note.teachers
                            return (
                              <Card key={note.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <p className="font-semibold text-lg mb-1">
                                        {student?.first_name} {student?.last_name} ({student?.grade})
                                      </p>
                                      <p className="font-medium mb-1">{note.title}</p>
                                      <p className="text-sm text-gray-700 mb-2">{note.description}</p>
                                      <p className="text-xs text-gray-500">
                                        {new Date(note.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                        {teacher && ` • Teacher: ${teacher.first_name} ${teacher.last_name}`}
                                      </p>
                                    </div>
                                    <Badge
                                      variant={
                                        note.type === 'positive' ? 'default' :
                                        note.type === 'concern' ? 'secondary' :
                                        'destructive'
                                      }
                                      className="shrink-0"
                                    >
                                      {note.type.charAt(0).toUpperCase() + note.type.slice(1)}
                                    </Badge>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })
                        )}
                      </div>
                    )}

                    {recordsType === 'notes' && (
                      <div className="space-y-3">
                        {allStudentNotes.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">No general notes found.</p>
                        ) : (
                          allStudentNotes.map((note: any) => {
                            const student = note.students
                            const teacher = note.teachers
                            return (
                              <Card key={note.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <p className="font-semibold text-lg mb-1">
                                        {student?.first_name} {student?.last_name} ({student?.grade})
                                      </p>
                                      <p className="text-gray-800 whitespace-pre-wrap mb-2">{note.note}</p>
                                      <p className="text-xs text-gray-500">
                                        {new Date(note.created_at).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        {teacher && ` • Teacher: ${teacher.first_name} ${teacher.last_name}`}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default AdminPortal

