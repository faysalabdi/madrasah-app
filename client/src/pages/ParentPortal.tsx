import React, { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, User, LogOut, CreditCard, CheckCircle2, Circle, Trash2, Calendar, BookOpen, FileText, UserCheck, Star, TrendingUp, Award, Send, MessageCircle, Reply } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Student {
  id: number
  student_id: string
  first_name: string
  last_name: string
  grade: string
  date_of_birth: string | null
  current_school: string | null
  program: string | null
  quran_level: string | null
  quran_page: number | null
  quran_surah: string | null
  quran_ayah: string | null
  behavior_standing: string | null
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
  const [selectedStudentsForBooks, setSelectedStudentsForBooks] = useState<number[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showStudentDetail, setShowStudentDetail] = useState(false)
  
  // Student detail data
  const [attendance, setAttendance] = useState<any[]>([])
  const [behaviorNotes, setBehaviorNotes] = useState<any[]>([])
  const [homework, setHomework] = useState<any[]>([])
  const [studentNotes, setStudentNotes] = useState<any[]>([])
  const [classContent, setClassContent] = useState<any[]>([])
  const [quranTeacher, setQuranTeacher] = useState<{ first_name: string; last_name: string } | null>(null)
  const [islamicStudiesTeacher, setIslamicStudiesTeacher] = useState<{ first_name: string; last_name: string } | null>(null)
  
  // Messaging state
  const [messages, setMessages] = useState<any[]>([])
  const [newMessageSubject, setNewMessageSubject] = useState('')
  const [newMessageText, setNewMessageText] = useState('')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messageRecipient, setMessageRecipient] = useState<'quran' | 'islamic_studies' | null>(null)

  // Term selection
  const [terms, setTerms] = useState<any[]>([])
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null)
  const [currentTermId, setCurrentTermId] = useState<number | null>(null)

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
          setLocation('/portal')
          return
        }
      }
      
      if (!parentId) {
        setLocation('/portal')
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
        setLocation('/portal')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setLocation])

  const loadPortalData = async (parentId: number) => {
    try {
      setLoading(true)

      // Load terms
      const { data: termsData, error: termsError } = await supabase
        .from('terms')
        .select('*')
        .order('created_at', { ascending: false })

      if (!termsError && termsData) {
        setTerms(termsData)
        const current = termsData.find((t: any) => t.is_current)
        if (current) {
          setCurrentTermId(current.id)
          if (!selectedTermId) {
            setSelectedTermId(current.id)
          }
        }
      }

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
      // Call Edge Function to create checkout session for term fees
      // If studentId is provided, pay for that specific student
      // If studentId is null/undefined, pay for all students (only used when all need payment)
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

  const handleStudentClick = async (student: Student) => {
    setSelectedStudent(student)
    setShowStudentDetail(true)
    
    // Load student details
    try {
      // Reload student data to get latest quran_page and behavior_standing
      const { data: updatedStudent } = await supabase
        .from('students')
        .select('*')
        .eq('id', student.id)
        .single()
      
      if (updatedStudent) {
        setSelectedStudent(updatedStudent as Student)
      }

      // Load attendance (filtered by selected term)
      let attendanceQuery = supabase
        .from('attendance')
        .select('*')
        .eq('student_id', student.id)
      
      if (selectedTermId) {
        attendanceQuery = attendanceQuery.eq('term_id', selectedTermId)
      }
      
      const { data: attendanceData } = await attendanceQuery
        .order('date', { ascending: false })
        .limit(100)

      setAttendance(attendanceData || [])

      // Load behavior notes (filtered by selected term)
      let behaviorQuery = supabase
        .from('behavior_notes')
        .select('*')
        .eq('student_id', student.id)
      
      if (selectedTermId) {
        behaviorQuery = behaviorQuery.eq('term_id', selectedTermId)
      }
      
      const { data: behaviorData } = await behaviorQuery
        .order('date', { ascending: false })
        .limit(20)

      // Load teacher assignments
      const { data: teacherAssignments } = await supabase
        .from('teacher_students')
        .select(`
          quran_teacher_id,
          islamic_studies_teacher_id,
          quran_teacher:teachers!teacher_students_quran_teacher_id_fkey(first_name, last_name),
          islamic_studies_teacher:teachers!teacher_students_islamic_studies_teacher_id_fkey(first_name, last_name)
        `)
        .eq('student_id', student.id)
        .maybeSingle()

      if (teacherAssignments) {
        setQuranTeacher(teacherAssignments.quran_teacher as any || null)
        setIslamicStudiesTeacher(teacherAssignments.islamic_studies_teacher as any || null)
      } else {
        setQuranTeacher(null)
        setIslamicStudiesTeacher(null)
      }

      setBehaviorNotes(behaviorData || [])

      // Load homework (filtered by selected term)
      let homeworkQuery = supabase
        .from('homework')
        .select('*')
        .eq('student_id', student.id)
      
      if (selectedTermId) {
        homeworkQuery = homeworkQuery.eq('term_id', selectedTermId)
      }
      
      const { data: homeworkData } = await homeworkQuery
        .order('assigned_date', { ascending: false })
        .limit(20)

      setHomework(homeworkData || [])

      // Load student notes (filtered by selected term)
      let notesQuery = supabase
        .from('student_notes')
        .select('*')
        .eq('student_id', student.id)
      
      if (selectedTermId) {
        notesQuery = notesQuery.eq('term_id', selectedTermId)
      }
      
      const { data: notesData } = await notesQuery
        .order('created_at', { ascending: false })
        .limit(50)

      setStudentNotes(notesData || [])

      // Load class content (filtered by selected term)
      let classContentQuery = supabase
        .from('class_content')
        .select('*')
        .eq('student_id', student.id)
      
      if (selectedTermId) {
        classContentQuery = classContentQuery.eq('term_id', selectedTermId)
      }
      
      const { data: classContentData } = await classContentQuery
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      setClassContent(classContentData || [])

      // Load messages
      if (parent) {
        const { data: messagesData } = await supabase
          .from('parent_teacher_messages')
          .select(`
            *,
            teacher:teachers(first_name, last_name)
          `)
          .eq('student_id', student.id)
          .eq('parent_id', parent.id)
          .order('created_at', { ascending: false })
          .limit(50)

        setMessages(messagesData || [])
      }
    } catch (err) {
      console.error('Error loading student details:', err)
    }
  }

  // Calculate attendance statistics for pie chart
  const getAttendanceChartData = () => {
    if (!selectedStudent || attendance.length === 0) {
      return []
    }

    const stats = {
      presentWithUniform: attendance.filter(a => a.status === 'present_with_uniform').length,
      presentNoUniform: attendance.filter(a => a.status === 'present_no_uniform').length,
      lateUniform: attendance.filter(a => a.status === 'late_uniform').length,
      lateNoUniform: attendance.filter(a => a.status === 'late_no_uniform').length,
      absentWithExcuse: attendance.filter(a => a.status === 'absent_with_excuse').length,
      absentNoExcuse: attendance.filter(a => a.status === 'absent_no_excuse').length,
    }

    const chartData = [
      { name: 'Present (Uniform)', value: stats.presentWithUniform, color: '#22c55e' },
      { name: 'Present (No Uniform)', value: stats.presentNoUniform, color: '#eab308' },
      { name: 'Late (Uniform)', value: stats.lateUniform, color: '#f97316' },
      { name: 'Late (No Uniform)', value: stats.lateNoUniform, color: '#f59e0b' },
      { name: 'Absent (Excused)', value: stats.absentWithExcuse, color: '#3b82f6' },
      { name: 'Absent (No Excuse)', value: stats.absentNoExcuse, color: '#ef4444' },
    ].filter(item => item.value > 0) // Only show categories with data

    return chartData
  }

  // Format Quran progress display
  const getQuranProgressDisplay = () => {
    if (!selectedStudent) return null

    // Check if it's Quran (has surah/ayah) or Iqra (has level/page)
    if (selectedStudent.quran_surah && selectedStudent.quran_ayah) {
      return {
        type: 'quran',
        display: `Surah ${selectedStudent.quran_surah}, Ayah ${selectedStudent.quran_ayah}`,
      }
    } else if (selectedStudent.quran_level && selectedStudent.quran_page) {
      const level = selectedStudent.quran_level
      const page = selectedStudent.quran_page
      // Validate Iqra level (1-6) and page (1-30)
      if (['1', '2', '3', '4', '5', '6'].includes(level) && page >= 1 && page <= 30) {
        return {
          type: 'iqra',
          display: `Iqra Level ${level}, Page ${page}`,
        }
      }
    }

    return null
  }

  const getBehaviorStandingColor = (standing: string | null) => {
    if (!standing) return 'bg-gray-100 text-gray-800 border-gray-300'
    switch (standing) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'satisfactory':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'needs_improvement':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'concern':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getBehaviorStandingLabel = (standing: string | null) => {
    if (!standing) return 'Not Set'
    return standing.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Send a new message to teacher
  const handleSendMessage = async () => {
    if (!parent || !selectedStudent || !newMessageSubject || !newMessageText || !messageRecipient) {
      setError('Please fill in all fields and select a teacher')
      return
    }

    // Get the teacher ID based on recipient
    const teacherId = messageRecipient === 'quran' 
      ? quranTeacher 
      : islamicStudiesTeacher

    if (!teacherId) {
      setError('No teacher assigned for this class. Please contact the administrator.')
      return
    }

    try {
      setSendingMessage(true)
      
      // Get teacher ID from teacher_students table
      const { data: teacherAssignment } = await supabase
        .from('teacher_students')
        .select(messageRecipient === 'quran' ? 'quran_teacher_id' : 'islamic_studies_teacher_id')
        .eq('student_id', selectedStudent.id)
        .single()

      const teacherIdValue = messageRecipient === 'quran' 
        ? teacherAssignment?.quran_teacher_id 
        : teacherAssignment?.islamic_studies_teacher_id

      if (!teacherIdValue) {
        setError('Teacher not found. Please contact the administrator.')
        return
      }

      const { error: insertError } = await supabase
        .from('parent_teacher_messages')
        .insert({
          student_id: selectedStudent.id,
          parent_id: parent.id,
          teacher_id: teacherIdValue,
          sender_type: 'parent',
          subject: newMessageSubject,
          message: newMessageText,
          parent_read: true,
          teacher_read: false,
        })

      if (insertError) throw insertError

      // Send email notification to teacher
      try {
        const teacherData = messageRecipient === 'quran' ? quranTeacher : islamicStudiesTeacher
        if (teacherData) {
          // Get teacher email from teachers table
          const { data: teacherDetails } = await supabase
            .from('teachers')
            .select('email, first_name, last_name')
            .eq(messageRecipient === 'quran' ? 'id' : 'id', teacherIdValue)
            .single()

          if (teacherDetails?.email) {
            await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-teacher-message`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({
                teacherEmail: teacherDetails.email,
                teacherName: `${teacherDetails.first_name} ${teacherDetails.last_name}`,
                parentName: `${parent.parent1_first_name} ${parent.parent1_last_name}`,
                studentName: `${selectedStudent.first_name} ${selectedStudent.last_name}`,
                subject: newMessageSubject,
                messagePreview: newMessageText,
              }),
            })
          }
        }
      } catch (notifError) {
        // Don't fail the message send if notification fails
        console.error('Failed to send notification:', notifError)
      }

      // Reload messages
      const { data: messagesData } = await supabase
        .from('parent_teacher_messages')
        .select(`
          *,
          teacher:teachers(first_name, last_name)
        `)
        .eq('student_id', selectedStudent.id)
        .eq('parent_id', parent.id)
        .order('created_at', { ascending: false })
        .limit(50)

      setMessages(messagesData || [])
      
      // Reset form
      setNewMessageSubject('')
      setNewMessageText('')
      setMessageRecipient(null)
      setError(null)
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Failed to send message. Please try again.')
    } finally {
      setSendingMessage(false)
    }
  }

  // Mark message as read
  const markMessageAsRead = async (messageId: number) => {
    try {
      await supabase
        .from('parent_teacher_messages')
        .update({ parent_read: true })
        .eq('id', messageId)
    } catch (err) {
      console.error('Error marking message as read:', err)
    }
  }

  // Group messages by thread
  const getMessageThreads = () => {
    if (!messages.length) return []
    
    // Find all root messages (messages without parent_reply_to)
    const rootMessages = messages.filter(m => !m.parent_reply_to)
    
    // For each root message, find its replies
    const threads = rootMessages.map(root => {
      const replies = messages.filter(m => m.parent_reply_to === root.id)
      return {
        root,
        replies: replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      }
    })
    
    return threads
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('parentId')
    localStorage.removeItem('parentEmail')
    sessionStorage.removeItem('parentId')
    sessionStorage.removeItem('parentEmail')
    setLocation('/portal')
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
              <Button onClick={() => setLocation('/portal')} className="mt-4 w-full">
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Check if term fees are paid for a specific student
  const hasPaidTermFees = (studentId: number | null): boolean => {
    if (!studentId) {
      // Check if all students have paid individually
      return students.every(student => hasPaidTermFees(student.id))
    }
    
    // Check for specific student - ONLY count payments for the CURRENT TERM
    // Payments with student_id === null are NOT counted for specific students
    // Only count succeeded payments (not refunded, canceled, or failed)
    const studentPayments = payments.filter(p => 
      p.student_id === studentId && // Must match exactly - no null checks
      p.paid_term_fees && 
      p.status === 'succeeded' && // Only count successful payments, not refunded/canceled/failed
      p.term_id === currentTermId // CRITICAL: Only check payments for current term
    )
    
    return studentPayments.length > 0
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

    if (selectedStudentsForBooks.length === 0) {
      setError('Please select at least one student to order books for')
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
            studentIds: selectedStudentsForBooks, // Array of student IDs
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
    <div className="min-h-screen bg-gray-50">
      {/* Portal Header Banner */}
      <div className="bg-gradient-to-r from-primary via-primary-dark to-secondary text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-amiri">
                  Parent Portal
                </h1>
                <p className="text-xs sm:text-sm text-white/90">
                  Madrasah Abu Bakr As-Siddiq
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-white/10">
                  <Avatar className="h-8 w-8 border-2 border-white/30">
                    <AvatarFallback className="bg-white/20 text-white">
                      {parent?.parent1_first_name?.[0]}{parent?.parent1_last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">{parent?.parent1_first_name} {parent?.parent1_last_name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {parent?.stripe_customer_id && (
                  <DropdownMenuItem
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
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Manage Billing</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-2 sm:px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Banner */}
          <div className="bg-white border-l-4 border-primary rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  As-salamu alaykum, {parent?.parent1_first_name}!
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Welcome to your Parent Portal. Here you can view your children's progress, attendance, homework, and communicate with teachers.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Term Fees Alert */}
          {needsTermFees() && (
            <Alert className="mb-6 border-yellow-500 bg-yellow-50">
              <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="font-medium text-sm sm:text-base">
                  Term fees are due for {studentsNeedingTermFees().length} student{studentsNeedingTermFees().length !== 1 ? 's' : ''}: {studentsNeedingTermFees().map(s => `${s.first_name} ${s.last_name}`).join(', ')}
                </span>
                {allStudentsNeedPayment() ? (
                  <Button
                    onClick={() => handlePayTermFees()}
                    disabled={payingFor !== null}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    {payingFor === 0 ? 'Processing...' : 'Pay Term Fees for All'}
                  </Button>
                ) : (
                  <span className="text-xs sm:text-sm text-gray-600">
                    Click "Pay Term Fees" on each student above to pay individually
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                          <div className="flex-1 cursor-pointer" onClick={() => handleStudentClick(student)}>
                            <h3 className="font-semibold text-base sm:text-lg hover:text-primary">
                              {student.first_name} {student.last_name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 break-words">
                              {student.grade} • {student.program ? `Program ${student.program}` : 'Program Not Set'} • Student ID: {student.student_id || `STU-${student.id.toString().padStart(4, '0')}`}
                            </p>
                            {student.quran_level && (
                              <p className="text-xs sm:text-sm text-gray-500">
                                Quran Level: {student.quran_level}
                              </p>
                            )}
                            {student.current_school && (
                              <p className="text-xs sm:text-sm text-gray-500">
                                School: {student.current_school}
                              </p>
                            )}
                            <p className="text-xs text-primary mt-2 hover:underline">
                              Click to view details →
                            </p>
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto">
                            {hasPaidTermFees(student.id) ? (
                              <Badge variant="default" className="bg-green-500 text-xs sm:text-sm">
                                Term Fees Paid
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handlePayTermFees(student.id)
                                }}
                                disabled={payingFor === student.id}
                                className="text-xs sm:text-sm flex-1 sm:flex-initial"
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
                          className="border rounded-lg p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm sm:text-base">
                              ${payment.amount} {payment.currency.toUpperCase()}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
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
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge
                                variant={
                                  payment.status === 'succeeded' || payment.status === 'trial_active'
                                    ? 'default'
                                    : payment.status === 'refunded'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                              >
                                {payment.status === 'refunded' ? 'Refunded' : payment.status}
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

          {/* Books Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Order Books</CardTitle>
              <CardDescription>
                Purchase books for your children. Select which students need books and which books to purchase.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={showBookDialog} onOpenChange={(open) => {
                setShowBookDialog(open)
                if (!open) {
                  setSelectedBooks({})
                  setSelectedStudentsForBooks([])
                }
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto">
                    Order Books
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                  <DialogHeader>
                    <DialogTitle>Order Books</DialogTitle>
                    <DialogDescription>
                      Select which students need books and which books to purchase
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 mt-4">
                    {/* Student Selection */}
                    <div>
                      <h3 className="font-semibold mb-3">Select Students</h3>
                      <div className="space-y-2">
                        {students.length === 0 ? (
                          <p className="text-gray-500">No students enrolled.</p>
                        ) : (
                          students.map((student) => (
                            <div key={student.id} className="flex items-center space-x-2 p-2 border rounded-lg">
                              <Checkbox
                                id={`student-book-${student.id}`}
                                checked={selectedStudentsForBooks.includes(student.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedStudentsForBooks(prev => [...prev, student.id])
                                  } else {
                                    setSelectedStudentsForBooks(prev => prev.filter(id => id !== student.id))
                                  }
                                }}
                              />
                              <label
                                htmlFor={`student-book-${student.id}`}
                                className="flex-1 cursor-pointer font-medium"
                              >
                                {student.first_name} {student.last_name} ({student.grade})
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Book Selection */}
                    <div>
                      <h3 className="font-semibold mb-3">Select Books</h3>
                      {bookProducts.length === 0 ? (
                        <p className="text-gray-500">Loading books...</p>
                      ) : (
                        <div className="space-y-2">
                          {bookProducts.map((book) => (
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
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowBookDialog(false)
                          setSelectedBooks({})
                          setSelectedStudentsForBooks([])
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handlePurchaseBooks}
                        disabled={
                          purchasingBooks || 
                          Object.values(selectedBooks).every(v => !v) ||
                          selectedStudentsForBooks.length === 0
                        }
                      >
                        {purchasingBooks ? 'Processing...' : 'Purchase Selected Books'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Student Detail Dialog */}
      <Dialog open={showStudentDetail} onOpenChange={setShowStudentDetail}>
        <DialogContent className="w-[95vw] sm:w-full max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl sm:text-2xl break-words">
              {selectedStudent?.first_name} {selectedStudent?.last_name}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base break-words">
              <span className="block sm:inline">Grade {selectedStudent?.grade}</span>
              <span className="hidden sm:inline"> • </span>
              <span className="block sm:inline">Student ID: {selectedStudent?.student_id || `STU-${selectedStudent?.id.toString().padStart(4, '0')}`}</span>
            </DialogDescription>
          </DialogHeader>

          {/* Term Selector within Student Profile */}
          {terms.length > 0 && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Label htmlFor="student-term-select" className="text-sm font-medium whitespace-nowrap flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  View Term:
                </Label>
                <Select
                  value={selectedTermId?.toString() || ''}
                  onValueChange={(value) => {
                    setSelectedTermId(parseInt(value))
                    // Reload student data for the new term
                    if (selectedStudent) {
                      handleStudentClick(selectedStudent)
                    }
                  }}
                >
                  <SelectTrigger id="student-term-select" className="w-full sm:w-64">
                    <SelectValue placeholder="Select term..." />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((term) => (
                      <SelectItem key={term.id} value={term.id.toString()}>
                        {term.name} {term.is_current && '(Current)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTermId !== currentTermId && (
                  <Badge variant="secondary" className="whitespace-nowrap">
                    Historical
                  </Badge>
                )}
              </div>
            </div>
          )}

          <Tabs defaultValue="profile" className="w-full mt-4">
            <TabsList className="flex-wrap h-auto w-full gap-1">
              <TabsTrigger value="profile" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Attendance</span>
              </TabsTrigger>
              <TabsTrigger value="homework" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Homework</span>
              </TabsTrigger>
              <TabsTrigger value="behavior" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Behavior</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Notes</span>
              </TabsTrigger>
              <TabsTrigger value="class-content" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Class Content</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Messages</span>
                {messages.filter(m => m.sender_type === 'teacher' && !m.parent_read).length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                    {messages.filter(m => m.sender_type === 'teacher' && !m.parent_read).length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-4 sm:mt-6 space-y-4 sm:space-y-5">
              {/* Simple Info List */}
              <div className="space-y-4 sm:space-y-5">
                {/* Quran Progress */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-5 w-5 text-primary shrink-0" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Quran / Iqra Progress</h3>
                  </div>
                  {(() => {
                    const progress = getQuranProgressDisplay()
                    if (progress) {
                      return (
                        <div className="space-y-2 pl-7">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Type:</span>
                            <Badge variant="outline" className="text-sm px-3 py-1">
                              {progress.type === 'iqra' ? 'Iqra' : 'Quran'}
                            </Badge>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-600 mb-1">Progress:</span>
                            <span className="text-xl sm:text-2xl font-bold text-primary">{progress.display}</span>
                          </div>
                        </div>
                      )
                    }
                    return <p className="text-sm text-gray-500 pl-7">Not set yet</p>
                  })()}
                </div>

                {/* Behavior Standing */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="h-5 w-5 text-primary shrink-0" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Behavior Standing</h3>
                  </div>
                  {selectedStudent?.behavior_standing ? (
                    <div className="pl-7">
                      <Badge className={`${getBehaviorStandingColor(selectedStudent.behavior_standing)} border text-sm sm:text-base font-semibold px-4 py-2`}>
                        {getBehaviorStandingLabel(selectedStudent.behavior_standing)}
                      </Badge>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 pl-7">Not set yet</p>
                  )}
                </div>

                {/* Teachers */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <UserCheck className="h-5 w-5 text-primary shrink-0" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Teachers</h3>
                  </div>
                  <div className="space-y-3 pl-7">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Quran Teacher (First Hour)</p>
                      {quranTeacher ? (
                        <p className="text-base font-semibold">
                          {quranTeacher.first_name} {quranTeacher.last_name}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400">Not assigned</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Islamic Studies Teacher (Second Hour)</p>
                      {islamicStudiesTeacher ? (
                        <p className="text-base font-semibold">
                          {islamicStudiesTeacher.first_name} {islamicStudiesTeacher.last_name}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400">Not assigned</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Statistics */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-primary shrink-0" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Attendance Summary</h3>
                </div>
                {attendance.length === 0 ? (
                  <p className="text-sm text-gray-500 pl-7">No records yet</p>
                ) : (
                  <div className="space-y-2 pl-7">
                    <p className="text-sm text-gray-600 mb-3 font-medium">Total: {attendance.length} days</p>
                    {(() => {
                      const stats = {
                        presentWithUniform: attendance.filter(a => a.status === 'present_with_uniform').length,
                        presentNoUniform: attendance.filter(a => a.status === 'present_no_uniform').length,
                        lateUniform: attendance.filter(a => a.status === 'late_uniform').length,
                        lateNoUniform: attendance.filter(a => a.status === 'late_no_uniform').length,
                        absentExcused: attendance.filter(a => a.status === 'absent_with_excuse').length,
                        absentUnexcused: attendance.filter(a => a.status === 'absent_no_excuse').length,
                      }
                      return (
                        <>
                          {stats.presentWithUniform > 0 && (
                            <div className="flex justify-between items-center py-1">
                              <span className="text-sm text-gray-700">Present (Uniform)</span>
                              <span className="text-base font-semibold text-green-700">{stats.presentWithUniform}</span>
                            </div>
                          )}
                          {stats.presentNoUniform > 0 && (
                            <div className="flex justify-between items-center py-1">
                              <span className="text-sm text-gray-700">Present (No Uniform)</span>
                              <span className="text-base font-semibold text-yellow-700">{stats.presentNoUniform}</span>
                            </div>
                          )}
                          {stats.lateUniform > 0 && (
                            <div className="flex justify-between items-center py-1">
                              <span className="text-sm text-gray-700">Late (Uniform)</span>
                              <span className="text-base font-semibold text-orange-700">{stats.lateUniform}</span>
                            </div>
                          )}
                          {stats.lateNoUniform > 0 && (
                            <div className="flex justify-between items-center py-1">
                              <span className="text-sm text-gray-700">Late (No Uniform)</span>
                              <span className="text-base font-semibold text-orange-600">{stats.lateNoUniform}</span>
                            </div>
                          )}
                          {stats.absentExcused > 0 && (
                            <div className="flex justify-between items-center py-1">
                              <span className="text-sm text-gray-700">Absent (Excused)</span>
                              <span className="text-base font-semibold text-blue-700">{stats.absentExcused}</span>
                            </div>
                          )}
                          {stats.absentUnexcused > 0 && (
                            <div className="flex justify-between items-center py-1">
                              <span className="text-sm text-gray-700">Absent (No Excuse)</span>
                              <span className="text-base font-semibold text-red-700">{stats.absentUnexcused}</span>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="attendance" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Attendance Records
                </h3>
                <Badge variant="outline">{attendance.length} records</Badge>
              </div>
              {attendance.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <UserCheck className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No attendance records yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {attendance.map((record) => {
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
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col">
                                <p className="font-semibold text-lg">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                {record.notes && (
                                  <p className="text-sm text-gray-600 mt-1">{record.notes}</p>
                                )}
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(record.status)} border font-medium`}>
                              {getStatusLabel(record.status)}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="homework" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Homework Assignments
                </h3>
                <Badge variant="outline">
                  {homework.filter(h => !h.completed).length} pending • {homework.filter(h => h.completed).length} completed
                </Badge>
              </div>
              {homework.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No homework assigned yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {homework.map((hw) => {
                    const isOverdue = hw.due_date && !hw.completed && new Date(hw.due_date) < new Date()
                    return (
                      <Card key={hw.id} className={`hover:shadow-md transition-shadow ${hw.completed ? 'opacity-75' : ''} ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <button
                                  onClick={async () => {
                                    if (!selectedStudent) return
                                    try {
                                      const { error } = await supabase
                                        .from('homework')
                                        .update({
                                          completed: !hw.completed,
                                          completion_date: !hw.completed ? new Date().toISOString().split('T')[0] : null,
                                        })
                                        .eq('id', hw.id)
                                      
                                      if (error) throw error
                                      
                                      // Reload homework data
                                      const { data: homeworkData } = await supabase
                                        .from('homework')
                                        .select('*')
                                        .eq('student_id', selectedStudent.id)
                                        .order('assigned_date', { ascending: false })
                                        .limit(20)
                                      
                                      setHomework(homeworkData || [])
                                    } catch (err) {
                                      console.error('Error updating homework:', err)
                                      setError('Failed to update homework status')
                                    }
                                  }}
                                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                >
                                  {hw.completed ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <Circle className="h-5 w-5 text-gray-400" />
                                  )}
                                  <span className={`font-semibold text-lg ${hw.completed ? 'line-through text-gray-500' : ''}`}>
                                    {hw.title}
                                  </span>
                                </button>
                              </div>
                              {hw.description && (
                                <p className="text-sm text-gray-700 mb-2 ml-7">{hw.description}</p>
                              )}
                              <div className="flex items-center gap-4 ml-7 text-xs text-gray-500">
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
                              </div>
                            </div>
                            <Badge variant={hw.completed ? 'default' : isOverdue ? 'destructive' : 'secondary'}>
                              {hw.completed ? 'Completed' : isOverdue ? 'Overdue' : 'Pending'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="behavior" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Behavior Notes
                </h3>
                <Badge variant="outline">{behaviorNotes.length} notes</Badge>
              </div>
              {behaviorNotes.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No behavior notes yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {behaviorNotes.map((note) => (
                    <Card key={note.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-lg mb-1">{note.title}</p>
                            <p className="text-sm text-gray-500 mb-2">
                              {new Date(note.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-sm text-gray-700">{note.description}</p>
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
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  General Notes from Teacher
                </h3>
                <Badge variant="outline">{studentNotes.length} notes</Badge>
              </div>
              {studentNotes.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No notes from teacher yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {studentNotes.map((note) => (
                    <Card key={note.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-2">
                              {new Date(note.created_at).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-gray-800 whitespace-pre-wrap">{note.note}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Class Content Tab */}
            <TabsContent value="class-content" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Class Content History
                </h3>
                <Badge variant="outline">{classContent.length} entries</Badge>
              </div>
              {classContent.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No class content recorded yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {classContent.map((content) => (
                    <Card key={content.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">
                                {content.subject === 'quran' ? 'Quran' : 'Islamic Studies'}
                              </Badge>
                              {content.sub_subject && (
                                <Badge variant="secondary">
                                  {content.sub_subject.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                </Badge>
                              )}
                              <span className="text-sm text-gray-500">
                                {new Date(content.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                              {content.label && (
                                <Badge 
                                  variant={
                                    content.label === 'needs_revision' ? 'destructive' :
                                    content.label === 'exam_content' ? 'default' :
                                    content.label === 'important' ? 'secondary' :
                                    'outline'
                                  }
                                >
                                  {content.label.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-800 whitespace-pre-wrap">{content.content}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Teacher Communication
                </h3>
                <Badge variant="outline">{messages.length} messages</Badge>
              </div>

              {/* New Message Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Send a Message to Teacher</CardTitle>
                  <CardDescription className="text-sm">
                    Contact your child's teacher about their progress, concerns, or questions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Select Teacher</Label>
                    <Select
                      value={messageRecipient || ''}
                      onValueChange={(value) => setMessageRecipient(value as 'quran' | 'islamic_studies')}
                    >
                      <SelectTrigger id="recipient" className="w-full">
                        <SelectValue placeholder="Choose a teacher..." />
                      </SelectTrigger>
                      <SelectContent>
                        {quranTeacher && (
                          <SelectItem value="quran">
                            Quran Teacher: {quranTeacher.first_name} {quranTeacher.last_name}
                          </SelectItem>
                        )}
                        {islamicStudiesTeacher && (
                          <SelectItem value="islamic_studies">
                            Islamic Studies Teacher: {islamicStudiesTeacher.first_name} {islamicStudiesTeacher.last_name}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {!quranTeacher && !islamicStudiesTeacher && (
                      <p className="text-sm text-yellow-600">
                        No teachers assigned yet. Please contact the administrator.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Question about homework, Progress inquiry..."
                      value={newMessageSubject}
                      onChange={(e) => setNewMessageSubject(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Type your message here..."
                      value={newMessageText}
                      onChange={(e) => setNewMessageText(e.target.value)}
                      rows={4}
                      className="w-full resize-none"
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !newMessageSubject || !newMessageText || !messageRecipient}
                    className="w-full sm:w-auto gap-2"
                  >
                    {sendingMessage ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Message Threads */}
              <div className="space-y-4">
                <h4 className="font-semibold text-base sm:text-lg">Message History</h4>
                
                {messages.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500">No messages yet. Start a conversation with your child's teacher!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {getMessageThreads().map((thread) => (
                      <Card key={thread.root.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          {/* Root Message */}
                          <div className={`p-4 ${thread.root.sender_type === 'parent' ? 'bg-blue-50' : 'bg-green-50'}`}>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant={thread.root.sender_type === 'parent' ? 'default' : 'secondary'}>
                                  {thread.root.sender_type === 'parent' ? 'You' : 'Teacher'}
                                </Badge>
                                {thread.root.sender_type === 'teacher' && !thread.root.parent_read && (
                                  <Badge variant="destructive" className="text-xs">New</Badge>
                                )}
                                <span className="text-xs text-gray-500">
                                  {new Date(thread.root.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                            <h5 className="font-semibold text-sm sm:text-base mb-2 break-words">{thread.root.subject}</h5>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{thread.root.message}</p>
                            {thread.root.teacher && (
                              <p className="text-xs text-gray-500 mt-2">
                                To: {thread.root.teacher.first_name} {thread.root.teacher.last_name}
                              </p>
                            )}
                            {thread.root.sender_type === 'teacher' && !thread.root.parent_read && (
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => markMessageAsRead(thread.root.id)}
                                className="mt-2 p-0 h-auto text-xs"
                              >
                                Mark as read
                              </Button>
                            )}
                          </div>

                          {/* Replies */}
                          {thread.replies.length > 0 && (
                            <div className="border-t">
                              {thread.replies.map((reply, index) => (
                                <div
                                  key={reply.id}
                                  className={`p-4 pl-8 ${reply.sender_type === 'parent' ? 'bg-blue-50/50' : 'bg-green-50/50'} ${
                                    index !== thread.replies.length - 1 ? 'border-b' : ''
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Reply className="h-3 w-3 text-gray-400" />
                                      <Badge variant={reply.sender_type === 'parent' ? 'default' : 'secondary'} className="text-xs">
                                        {reply.sender_type === 'parent' ? 'You' : 'Teacher'}
                                      </Badge>
                                      {reply.sender_type === 'teacher' && !reply.parent_read && (
                                        <Badge variant="destructive" className="text-xs">New</Badge>
                                      )}
                                      <span className="text-xs text-gray-500">
                                        {new Date(reply.created_at).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{reply.message}</p>
                                  {reply.sender_type === 'teacher' && !reply.parent_read && (
                                    <Button
                                      variant="link"
                                      size="sm"
                                      onClick={() => markMessageAsRead(reply.id)}
                                      className="mt-2 p-0 h-auto text-xs"
                                    >
                                      Mark as read
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </div>
  )
}

export default ParentPortal

