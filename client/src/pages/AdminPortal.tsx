import React, { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trash2, Calendar, BookOpen, FileText, UserCheck, Search, User, LogOut, Settings, Plus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  program: string | null
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

  // Admins
  const [admins, setAdmins] = useState<any[]>([])
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [newAdmin, setNewAdmin] = useState({
    first_name: '',
    last_name: '',
    email: '',
  })

  // Students
  const [students, setStudents] = useState<Student[]>([])
  const [parents, setParents] = useState<Parent[]>([])

  // Payments
  const [payments, setPayments] = useState<Payment[]>([])
  const [paymentDateFilter, setPaymentDateFilter] = useState<string>('all') // 'all', '7days', '30days', '90days', '1year'
  
  // Bulk Invoice
  const [showBulkInvoiceDialog, setShowBulkInvoiceDialog] = useState(false)
  const [bulkInvoiceDays, setBulkInvoiceDays] = useState(30)
  const [bulkInvoiceSendEmails, setBulkInvoiceSendEmails] = useState(true)
  const [bulkInvoiceLoading, setBulkInvoiceLoading] = useState(false)
  const [selectedParentsForInvoice, setSelectedParentsForInvoice] = useState<number[]>([])
  const [bulkInvoiceMode, setBulkInvoiceMode] = useState<'all' | 'selected'>('all')
  
  // Teacher Attendance
  const [teacherAttendance, setTeacherAttendance] = useState<any[]>([])
  const [showTeacherAttendanceDialog, setShowTeacherAttendanceDialog] = useState(false)
  const [selectedTeacherForAttendance, setSelectedTeacherForAttendance] = useState<Teacher | null>(null)
  const [teacherAttendanceDate, setTeacherAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceHours, setAttendanceHours] = useState('2.00')
  const [teacherAttendanceNotes, setTeacherAttendanceNotes] = useState('')
  
  // Account Settings
  const [newEmail, setNewEmail] = useState('')
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('')
  const [currentPasswordForPassword, setCurrentPasswordForPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updatingAccount, setUpdatingAccount] = useState(false)
  const [showAccountSettingsDialog, setShowAccountSettingsDialog] = useState(false)
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
  const [selectedQuranTeacher, setSelectedQuranTeacher] = useState<string>('')
  const [selectedIslamicStudiesTeacher, setSelectedIslamicStudiesTeacher] = useState<string>('')
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  
  // Program filtering
  const [programFilter, setProgramFilter] = useState<string>('all') // 'all', 'A', 'B', 'none'

  // Student Detail View
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null)
  const [showStudentDetailDialog, setShowStudentDetailDialog] = useState(false)
  const [loadingStudentRecords, setLoadingStudentRecords] = useState(false)
  const [studentAttendance, setStudentAttendance] = useState<any[]>([])
  const [studentHomework, setStudentHomework] = useState<any[]>([])
  const [studentBehaviorNotes, setStudentBehaviorNotes] = useState<any[]>([])
  const [studentNotes, setStudentNotes] = useState<any[]>([])

  // Admin record creation state (similar to TeacherPortal)
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false)
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceStatus, setAttendanceStatus] = useState('present_with_uniform')
  const [attendanceNotes, setAttendanceNotes] = useState('')

  const [showHomeworkDialog, setShowHomeworkDialog] = useState(false)
  const [homeworkTitle, setHomeworkTitle] = useState('')
  const [homeworkDescription, setHomeworkDescription] = useState('')
  const [homeworkDueDate, setHomeworkDueDate] = useState('')

  const [showBehaviorDialog, setShowBehaviorDialog] = useState(false)
  const [behaviorType, setBehaviorType] = useState('positive')
  const [behaviorTitle, setBehaviorTitle] = useState('')
  const [behaviorDescription, setBehaviorDescription] = useState('')

  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLocation('/admin-login')
        return
      }

      // Verify the user is actually an admin
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        setLocation('/admin-login')
        return
      }

      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('id, first_name, last_name, email')
        .eq('email', user.email.toLowerCase())
        .maybeSingle()

      if (adminError || !adminData) {
        // User is not an admin, redirect to login
        await supabase.auth.signOut()
        localStorage.removeItem('adminId')
        localStorage.removeItem('adminEmail')
        localStorage.removeItem('adminName')
        setLocation('/admin-login')
        return
      }

      // User is an admin, load dashboard
      loadDashboardData()
      loadAdmins()
    }
    checkAuth()
  }, [setLocation])

  const loadStudentRecords = async (studentId: number) => {
    try {
      setLoadingStudentRecords(true)
      
      // Load all record types in parallel
      const [attendanceRes, homeworkRes, behaviorRes, notesRes] = await Promise.all([
        supabase.from('attendance').select(`
          *,
          teachers (id, first_name, last_name)
        `).eq('student_id', studentId).order('date', { ascending: false }),
        
        supabase.from('homework').select(`
          *,
          teachers (id, first_name, last_name)
        `).eq('student_id', studentId).order('assigned_date', { ascending: false }),
        
        supabase.from('behavior_notes').select(`
          *,
          teachers (id, first_name, last_name)
        `).eq('student_id', studentId).order('date', { ascending: false }),
        
        supabase.from('student_notes').select(`
          *,
          teachers (id, first_name, last_name)
        `).eq('student_id', studentId).order('created_at', { ascending: false }),
      ])
      
      setStudentAttendance(attendanceRes.data || [])
      setStudentHomework(homeworkRes.data || [])
      setStudentBehaviorNotes(behaviorRes.data || [])
      setStudentNotes(notesRes.data || [])
    } catch (err: any) {
      console.error('Error loading student records:', err)
      setError(err.message || 'Failed to load student records')
    } finally {
      setLoadingStudentRecords(false)
    }
  }

  const handleStudentClick = async (student: Student) => {
    setSelectedStudentForDetail(student)
    setShowStudentDetailDialog(true)
    await loadStudentRecords(student.id)
  }

  // Admin record creation handlers (similar to TeacherPortal but with null teacher_id)
  const handleMarkAttendance = async () => {
    if (!selectedStudentForDetail) return

    try {
      const { error } = await supabase
        .from('attendance')
        .upsert({
          student_id: selectedStudentForDetail.id,
          teacher_id: null, // Admin-created records have null teacher_id
          date: attendanceDate,
          status: attendanceStatus,
          notes: attendanceNotes || null,
        }, {
          onConflict: 'student_id,date'
        })

      if (error) throw error

      setShowAttendanceDialog(false)
      setAttendanceDate(new Date().toISOString().split('T')[0])
      setAttendanceStatus('present_with_uniform')
      setAttendanceNotes('')
      await loadStudentRecords(selectedStudentForDetail.id)
      
      toast({
        title: 'Success',
        description: 'Attendance recorded successfully.',
      })
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to mark attendance',
        variant: 'destructive',
      })
    }
  }

  const handleAddBehaviorNote = async () => {
    if (!selectedStudentForDetail) return

    try {
      const { error } = await supabase
        .from('behavior_notes')
        .insert({
          student_id: selectedStudentForDetail.id,
          teacher_id: null, // Admin-created records have null teacher_id
          date: new Date().toISOString().split('T')[0],
          type: behaviorType,
          title: behaviorTitle,
          description: behaviorDescription,
        })

      if (error) throw error

      setShowBehaviorDialog(false)
      setBehaviorType('positive')
      setBehaviorTitle('')
      setBehaviorDescription('')
      await loadStudentRecords(selectedStudentForDetail.id)
      
      toast({
        title: 'Success',
        description: 'Behavior note added successfully.',
      })
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to add behavior note',
        variant: 'destructive',
      })
    }
  }

  const handleAddHomework = async () => {
    if (!selectedStudentForDetail) return

    try {
      const { error } = await supabase
        .from('homework')
        .insert({
          student_id: selectedStudentForDetail.id,
          teacher_id: null, // Admin-created records have null teacher_id
          title: homeworkTitle,
          description: homeworkDescription || null,
          assigned_date: new Date().toISOString().split('T')[0],
          due_date: homeworkDueDate || null,
          completed: false,
        })

      if (error) throw error

      setShowHomeworkDialog(false)
      setHomeworkTitle('')
      setHomeworkDescription('')
      setHomeworkDueDate('')
      await loadStudentRecords(selectedStudentForDetail.id)
      
      toast({
        title: 'Success',
        description: 'Homework added successfully.',
      })
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to add homework',
        variant: 'destructive',
      })
    }
  }

  const handleAddNote = async () => {
    if (!selectedStudentForDetail) return

    try {
      const { error } = await supabase
        .from('student_notes')
        .insert({
          student_id: selectedStudentForDetail.id,
          teacher_id: null, // Admin-created records have null teacher_id
          note: noteText,
        })

      if (error) throw error

      setShowNoteDialog(false)
      setNoteText('')
      await loadStudentRecords(selectedStudentForDetail.id)
      
      toast({
        title: 'Success',
        description: 'Note added successfully.',
      })
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to add note',
        variant: 'destructive',
      })
    }
  }

  const loadTeacherAttendance = async (teacherId: number) => {
    try {
      const { data, error } = await supabase
        .from('teacher_attendance')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('date', { ascending: false })
      
      if (error) throw error
      setTeacherAttendance(data || [])
    } catch (err: any) {
      console.error('Error loading teacher attendance:', err)
      setError(err.message || 'Failed to load teacher attendance')
    }
  }

  const handleTeacherAttendanceClick = async (teacher: Teacher) => {
    setSelectedTeacherForAttendance(teacher)
    setShowTeacherAttendanceDialog(true)
    await loadTeacherAttendance(teacher.id)
  }

  const handleMarkTeacherAttendance = async () => {
    if (!selectedTeacherForAttendance) return

    try {
      const { error } = await supabase
        .from('teacher_attendance')
        .upsert({
          teacher_id: selectedTeacherForAttendance.id,
          date: teacherAttendanceDate,
          hours: parseFloat(attendanceHours) || 2.00,
          notes: teacherAttendanceNotes || null,
        }, {
          onConflict: 'teacher_id,date'
        })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Teacher attendance recorded successfully.',
      })

      setAttendanceDate(new Date().toISOString().split('T')[0])
      setAttendanceHours('2.00')
      setAttendanceNotes('')
      await loadTeacherAttendance(selectedTeacherForAttendance.id)
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to record teacher attendance',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteTeacherAttendance = async (attendanceId: number) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return

    try {
      const { error } = await supabase
        .from('teacher_attendance')
        .delete()
        .eq('id', attendanceId)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Attendance record deleted successfully.',
      })

      if (selectedTeacherForAttendance) {
        await loadTeacherAttendance(selectedTeacherForAttendance.id)
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete attendance record',
        variant: 'destructive',
      })
    }
  }

  const calculateTotalHours = (startDate?: string, endDate?: string) => {
    let records = teacherAttendance
    if (startDate || endDate) {
      records = teacherAttendance.filter(record => {
        const recordDate = new Date(record.date)
        if (startDate && recordDate < new Date(startDate)) return false
        if (endDate && recordDate > new Date(endDate)) return false
        return true
      })
    }
    return records.reduce((total, record) => total + parseFloat(record.hours || 0), 0)
  }

  const handleDeleteTeacher = async (teacher: Teacher) => {
    if (!confirm(`Are you sure you want to delete teacher ${teacher.first_name} ${teacher.last_name}? This will also delete all their attendance records, assigned students, and related data. This action cannot be undone.`)) {
      return
    }

    try {
      setLoading(true)

      // Delete teacher record (cascade will handle related records)
      const { error: deleteError } = await supabase
        .from('teachers')
        .delete()
        .eq('id', teacher.id)

      if (deleteError) throw deleteError

      // Delete auth user if exists (using Edge Function)
      try {
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ email: teacher.email }),
          }
        )
      } catch (authErr) {
        console.error('Failed to delete auth user:', authErr)
        // Continue even if auth deletion fails
      }

      toast({
        title: 'Success',
        description: `Teacher ${teacher.first_name} ${teacher.last_name} deleted successfully.`,
      })

      loadDashboardData()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete teacher',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteParent = async (parent: Parent) => {
    const parentStudents = students.filter(s => s.parent_id === parent.id)
    const studentCount = parentStudents.length

    if (!confirm(`Are you sure you want to delete parent ${parent.parent1_first_name} ${parent.parent1_last_name}?${studentCount > 0 ? ` This will also delete ${studentCount} student(s) and all their related records.` : ''} This action cannot be undone.`)) {
      return
    }

    try {
      setLoading(true)

      // Delete parent record (cascade will handle students and related records)
      const { error: deleteError } = await supabase
        .from('parents')
        .delete()
        .eq('id', parent.id)

      if (deleteError) throw deleteError

      // Delete auth user if exists (using Edge Function)
      try {
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ email: parent.parent1_email }),
          }
        )
      } catch (authErr) {
        console.error('Failed to delete auth user:', authErr)
        // Continue even if auth deletion fails
      }

      toast({
        title: 'Success',
        description: `Parent ${parent.parent1_first_name} ${parent.parent1_last_name} and ${studentCount > 0 ? `${studentCount} student(s) ` : ''}deleted successfully.`,
      })

      loadDashboardData()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete parent',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStudent = async (student: Student) => {
    if (!confirm(`Are you sure you want to delete student ${student.first_name} ${student.last_name}? This will also delete all their attendance records, homework, behavior notes, and related data. This action cannot be undone.`)) {
      return
    }

    try {
      setLoading(true)

      // Delete student record (cascade will handle related records)
      const { error: deleteError } = await supabase
        .from('students')
        .delete()
        .eq('id', student.id)

      if (deleteError) throw deleteError

      toast({
        title: 'Success',
        description: `Student ${student.first_name} ${student.last_name} deleted successfully.`,
      })

      loadDashboardData()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete student',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAdmins(data || [])
    } catch (err: any) {
      console.error('Failed to load admins:', err)
    }
  }

  const handleCreateAdmin = async () => {
    if (!newAdmin.first_name || !newAdmin.last_name || !newAdmin.email) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-admin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(newAdmin),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin')
      }

      toast({
        title: 'Success',
        description: `Admin ${newAdmin.first_name} ${newAdmin.last_name} created successfully.`,
      })

      setNewAdmin({ first_name: '', last_name: '', email: '' })
      setShowCreateAdmin(false)
      loadAdmins()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create admin',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAdmin = async (admin: any) => {
    if (!confirm(`Are you sure you want to delete admin ${admin.first_name} ${admin.last_name}? This action cannot be undone.`)) {
      return
    }

    try {
      setLoading(true)

      // Delete admin record
      const { error: deleteError } = await supabase
        .from('admins')
        .delete()
        .eq('id', admin.id)

      if (deleteError) throw deleteError

      // Delete auth user if exists (using Edge Function)
      try {
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ email: admin.email }),
          }
        )
      } catch (authErr) {
        console.error('Failed to delete auth user:', authErr)
        // Continue even if auth deletion fails
      }

      toast({
        title: 'Success',
        description: `Admin ${admin.first_name} ${admin.last_name} deleted successfully.`,
      })

      loadAdmins()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete admin',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePromoteTeacherToAdmin = async (teacher: Teacher) => {
    if (!confirm(`Are you sure you want to promote ${teacher.first_name} ${teacher.last_name} to admin? They will gain access to the admin portal.`)) {
      return
    }

    try {
      setLoading(true)

      // Check if teacher is already an admin
      const { data: existingAdmin } = await supabase
        .from('admins')
        .select('id')
        .eq('email', teacher.email.toLowerCase())
        .maybeSingle()

      if (existingAdmin) {
        toast({
          title: 'Already Admin',
          description: `${teacher.first_name} ${teacher.last_name} is already an admin.`,
          variant: 'default',
        })
        return
      }

      // Create admin record using the Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-admin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            email: teacher.email,
            first_name: teacher.first_name,
            last_name: teacher.last_name,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to promote teacher to admin')
      }

      toast({
        title: 'Success',
        description: `${teacher.first_name} ${teacher.last_name} has been promoted to admin.`,
      })

      loadAdmins()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to promote teacher to admin',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
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

      // Load all payments (no limit for full history)
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
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

      // Use Edge Function to create teacher (bypasses email confirmation)
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-teacher`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            first_name: newTeacher.first_name,
            last_name: newTeacher.last_name,
            email: newTeacher.email,
            mobile: newTeacher.mobile || null,
            password: newTeacher.password,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create teacher')
      }

      const data = await response.json()

      toast({
        title: 'Success',
        description: data.message || `Teacher ${newTeacher.first_name} ${newTeacher.last_name} created successfully. They can now log in with their email and password.`,
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
    if (!selectedQuranTeacher || !selectedIslamicStudiesTeacher || selectedStudents.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select both Quran and Islamic Studies teachers and at least one student',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)

      // Remove existing assignments for these students
      await supabase
        .from('teacher_students')
        .delete()
        .in('student_id', selectedStudents)

      // Create new assignments with both teachers
      const assignments = selectedStudents.map(studentId => ({
        quran_teacher_id: parseInt(selectedQuranTeacher),
        islamic_studies_teacher_id: parseInt(selectedIslamicStudiesTeacher),
        student_id: studentId,
      }))

      const { error } = await supabase.from('teacher_students').insert(assignments)

      if (error) throw error

      toast({
        title: 'Success',
        description: `Assigned ${selectedStudents.length} student(s) to teachers.`,
      })

      setSelectedQuranTeacher('')
      setSelectedIslamicStudiesTeacher('')
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

  useEffect(() => {
    // Load current user email
    const loadCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setNewEmail(user.email)
      }
    }
    loadCurrentUser()
  }, [])

  const handleUpdateEmail = async () => {
    if (!newEmail || !currentPasswordForEmail) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    setUpdatingAccount(true)
    try {
      // First verify current password by attempting to re-authenticate
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        throw new Error('No user found')
      }

      // Verify password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPasswordForEmail,
      })

      if (signInError) {
        throw new Error('Current password is incorrect')
      }

      // Update email
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail.trim().toLowerCase(),
      })

      if (updateError) throw updateError

      toast({
        title: 'Success',
        description: 'Email updated successfully. Please check your new email for verification.',
      })
      setCurrentPasswordForEmail('')
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update email',
        variant: 'destructive',
      })
    } finally {
      setUpdatingAccount(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!currentPasswordForPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all password fields.',
        variant: 'destructive',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      })
      return
    }

    setUpdatingAccount(true)
    try {
      // First verify current password
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        throw new Error('No user found')
      }

      // Verify password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPasswordForPassword,
      })

      if (signInError) {
        throw new Error('Current password is incorrect')
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) throw updateError

      toast({
        title: 'Success',
        description: 'Password updated successfully.',
      })
      setCurrentPasswordForPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update password',
        variant: 'destructive',
      })
    } finally {
      setUpdatingAccount(false)
    }
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {localStorage.getItem('adminName') || 'Administrator'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {localStorage.getItem('adminEmail') || ''}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowAccountSettingsDialog(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
              <TabsTrigger value="admins">Admins</TabsTrigger>
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
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <CardTitle>Payment History</CardTitle>
                      <CardDescription>Click the trash icon to delete a payment record</CardDescription>
                    </div>
                    <Select value={paymentDateFilter} onValueChange={setPaymentDateFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by date" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="7days">Last 7 Days</SelectItem>
                        <SelectItem value="30days">Last 30 Days</SelectItem>
                        <SelectItem value="90days">Last 90 Days</SelectItem>
                        <SelectItem value="1year">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {(() => {
                    // Filter payments by date range
                    const now = new Date()
                    const filteredPayments = payments.filter((payment) => {
                      if (paymentDateFilter === 'all') return true
                      
                      const paymentDate = new Date(payment.created_at)
                      const daysDiff = Math.floor((now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24))
                      
                      switch (paymentDateFilter) {
                        case '7days':
                          return daysDiff <= 7
                        case '30days':
                          return daysDiff <= 30
                        case '90days':
                          return daysDiff <= 90
                        case '1year':
                          return daysDiff <= 365
                        default:
                          return true
                      }
                    })

                    if (filteredPayments.length === 0) {
                      return (
                        <div className="text-center py-8 text-gray-500">
                          No payments found for the selected period.
                        </div>
                      )
                    }

                    return (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600 mb-4">
                          Showing {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
                        </div>
                        {filteredPayments.map((payment) => {
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
                    )
                  })()}
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
                  <CardDescription>
                    Click on a teacher's name to view and manage their attendance records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {teachers.map((teacher) => {
                      const isAdmin = admins.some(admin => admin.email.toLowerCase() === teacher.email.toLowerCase())
                      return (
                        <div key={teacher.id} className="border rounded-lg p-3 flex justify-between items-center">
                          <div className="flex-1">
                            <p 
                              className="font-medium cursor-pointer hover:text-primary hover:underline"
                              onClick={() => handleTeacherAttendanceClick(teacher)}
                            >
                              {teacher.first_name} {teacher.last_name}
                            </p>
                            <p className="text-sm text-gray-600">{teacher.email}</p>
                            {teacher.mobile && (
                              <p className="text-xs text-gray-500">{teacher.mobile}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {isAdmin ? (
                              <Badge variant="default" className="bg-purple-600">Admin</Badge>
                            ) : (
                              <>
                                <Badge variant="outline">Teacher</Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePromoteTeacherToAdmin(teacher)}
                                  disabled={loading}
                                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                  title="Promote to Admin"
                                >
                                  <User className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTeacher(teacher)}
                              disabled={loading}
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

              {/* Teacher Attendance Dialog */}
              <Dialog open={showTeacherAttendanceDialog} onOpenChange={setShowTeacherAttendanceDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  {!selectedTeacherForAttendance ? (
                    <div className="py-12 text-center">
                      <p className="text-gray-500">No teacher selected</p>
                    </div>
                  ) : (
                    <>
                      <DialogHeader>
                        <DialogTitle className="text-2xl">
                          Teacher Attendance: {selectedTeacherForAttendance.first_name} {selectedTeacherForAttendance.last_name}
                        </DialogTitle>
                        <DialogDescription>
                          Track attendance for fortnightly payment calculations. Each class is 2 hours.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6 mt-4">
                        {/* Mark Attendance Form */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Mark Attendance</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="attendance-date">Date</Label>
                                <Input
                                  id="attendance-date"
                                  type="date"
                                  value={teacherAttendanceDate}
                                  onChange={(e) => setTeacherAttendanceDate(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="attendance-hours">Hours</Label>
                                <Input
                                  id="attendance-hours"
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  max="24"
                                  value={attendanceHours}
                                  onChange={(e) => setAttendanceHours(e.target.value)}
                                  placeholder="2.00"
                                />
                                <p className="text-xs text-gray-500">Default: 2 hours per class</p>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="attendance-notes">Notes (Optional)</Label>
                                <Input
                                  id="attendance-notes"
                                  type="text"
                                  value={teacherAttendanceNotes}
                                  onChange={(e) => setTeacherAttendanceNotes(e.target.value)}
                                  placeholder=""
                                />
                              </div>
                            </div>
                            <Button onClick={handleMarkTeacherAttendance} className="w-full">
                              Record Attendance
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Attendance Records */}
                        <Card>
                          <CardHeader>
                            <div className="flex justify-between items-center">
                              <div>
                                <CardTitle>Attendance Records</CardTitle>
                                <CardDescription>
                                  Total Hours: {calculateTotalHours().toFixed(2)} hours
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {teacherAttendance.length === 0 ? (
                              <p className="text-gray-500 text-center py-8">No attendance records found.</p>
                            ) : (
                              <div className="space-y-3">
                                {teacherAttendance.map((record) => (
                                  <Card key={record.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <p className="font-medium">
                                            {new Date(record.date).toLocaleDateString('en-US', { 
                                              weekday: 'long', 
                                              year: 'numeric', 
                                              month: 'long', 
                                              day: 'numeric' 
                                            })}
                                          </p>
                                          <p className="text-sm text-gray-600">
                                            {record.hours} hours
                                          </p>
                                          {record.notes && (
                                            <p className="text-sm text-gray-700 mt-1">{record.notes}</p>
                                          )}
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteTeacherAttendance(record.id)}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Fortnightly Summary */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Fortnightly Summary</CardTitle>
                            <CardDescription>
                              Calculate hours for the last 14 days
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {(() => {
                              const twoWeeksAgo = new Date()
                              twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
                              const twoWeeksAgoStr = twoWeeksAgo.toISOString().split('T')[0]
                              const todayStr = new Date().toISOString().split('T')[0]
                              const fortnightHours = calculateTotalHours(twoWeeksAgoStr, todayStr)
                              
                              return (
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Last 14 Days:</span>
                                    <span className="text-2xl font-bold text-primary">
                                      {fortnightHours.toFixed(2)} hours
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    From {new Date(twoWeeksAgoStr).toLocaleDateString()} to {new Date(todayStr).toLocaleDateString()}
                                  </p>
                                </div>
                              )
                            })()}
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students" className="mt-6 space-y-6">
              {/* Students List with Payment Status */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>All Students</CardTitle>
                      <CardDescription>
                        View all students and their term fee payment status
                      </CardDescription>
                    </div>
                    <Select value={programFilter} onValueChange={setProgramFilter}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Programs</SelectItem>
                        <SelectItem value="A">Program A</SelectItem>
                        <SelectItem value="B">Program B</SelectItem>
                        <SelectItem value="none">Not Set</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {students
                      .filter((student) => {
                        if (programFilter === 'all') return true
                        if (programFilter === 'none') return !student.program
                        return student.program === programFilter
                      })
                      .map((student) => {
                      const parent = parents.find(p => p.id === student.parent_id)
                      return (
                        <div key={student.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p 
                                  className="font-medium cursor-pointer hover:text-primary hover:underline"
                                  onClick={() => handleStudentClick(student)}
                                >
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
                                {student.grade} • {student.program ? `Program ${student.program}` : 'Program Not Set'} • {parent?.parent1_first_name} {parent?.parent1_last_name}
                              </p>
                              {student.lastPaymentDate && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Last payment: {new Date(student.lastPaymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteStudent(student)}
                              disabled={loading}
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

              {/* Assign Students to Teachers */}
              <Card>
                <CardHeader>
                  <CardTitle>Assign Students to Teachers</CardTitle>
                  <CardDescription>
                    Select Quran teacher (First Hour) and Islamic Studies teacher (Second Hour) for students
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Quran Teacher (First Hour)</Label>
                      <Select value={selectedQuranTeacher} onValueChange={setSelectedQuranTeacher}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Quran teacher" />
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
                      <Label>Islamic Studies Teacher (Second Hour)</Label>
                      <Select value={selectedIslamicStudiesTeacher} onValueChange={setSelectedIslamicStudiesTeacher}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Islamic Studies teacher" />
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
                    disabled={!selectedQuranTeacher || !selectedIslamicStudiesTeacher || selectedStudents.length === 0 || loading}
                    className="w-full"
                  >
                    Assign {selectedStudents.length} Student(s) to Teachers
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
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col gap-2 items-end">
                                {parent.stripe_customer_id ? (
                                  <Badge variant="default" className="bg-green-500">Stripe Customer</Badge>
                                ) : (
                                  <Badge variant="secondary">No Stripe Customer</Badge>
                                )}
                                <Badge variant="outline">Parent</Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteParent(parent)
                                }}
                                disabled={loading}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Admins Tab */}
            <TabsContent value="admins" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Admin Management</h2>
                <Dialog open={showCreateAdmin} onOpenChange={setShowCreateAdmin}>
                  <DialogTrigger asChild>
                    <Button>Create New Admin</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Admin</DialogTitle>
                      <DialogDescription>
                        Add a new administrator. The email must match an existing user account in the system.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input
                          value={newAdmin.first_name}
                          onChange={(e) => setNewAdmin({ ...newAdmin, first_name: e.target.value })}
                          placeholder="John"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input
                          value={newAdmin.last_name}
                          onChange={(e) => setNewAdmin({ ...newAdmin, last_name: e.target.value })}
                          placeholder="Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input
                          type="email"
                          value={newAdmin.email}
                          onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                          placeholder="admin@example.com"
                        />
                        <p className="text-xs text-gray-500">
                          The user must already have an account with this email address.
                        </p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowCreateAdmin(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateAdmin} disabled={loading}>
                          {loading ? 'Creating...' : 'Create Admin'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>All Admins</CardTitle>
                  <CardDescription>
                    Administrators who can access the admin portal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {admins.map((admin) => (
                      <div key={admin.id} className="border rounded-lg p-3 flex justify-between items-center">
                        <div className="flex-1">
                          <p className="font-medium">
                            {admin.first_name} {admin.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{admin.email}</p>
                          <p className="text-xs text-gray-500">
                            Created: {new Date(admin.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Admin</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAdmin(admin)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {admins.length === 0 && (
                      <p className="text-gray-500 text-center py-8">No admins found.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Student Detail Dialog */}
            <Dialog open={showStudentDetailDialog} onOpenChange={setShowStudentDetailDialog}>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                {loadingStudentRecords ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading student records...</span>
                  </div>
                ) : !selectedStudentForDetail ? (
                  <div className="py-12 text-center">
                    <p className="text-gray-500">No student selected</p>
                  </div>
                ) : (
                  <>
                    <DialogHeader>
                      <DialogTitle className="text-2xl">
                        {selectedStudentForDetail.first_name} {selectedStudentForDetail.last_name}
                      </DialogTitle>
                      <DialogDescription className="text-base">
                        Grade {selectedStudentForDetail.grade} • {selectedStudentForDetail.program ? `Program ${selectedStudentForDetail.program}` : 'Program Not Set'} • Student ID: {selectedStudentForDetail.student_id || `STU-${selectedStudentForDetail.id.toString().padStart(4, '0')}`}
                      </DialogDescription>
                    </DialogHeader>

                    {/* Program Edit Section */}
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle>Edit Program</CardTitle>
                        <CardDescription>Update the student's program assignment</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <Select
                            value={selectedStudentForDetail.program || 'none'}
                            onValueChange={async (value) => {
                              const newProgram = value === 'none' ? null : value
                              try {
                                const { error } = await supabase
                                  .from('students')
                                  .update({ program: newProgram })
                                  .eq('id', selectedStudentForDetail.id)
                                
                                if (error) throw error
                                
                                setSelectedStudentForDetail({ ...selectedStudentForDetail, program: newProgram })
                                loadDashboardData()
                                
                                toast({
                                  title: 'Success',
                                  description: 'Program updated successfully.',
                                })
                              } catch (err: any) {
                                toast({
                                  title: 'Error',
                                  description: err.message || 'Failed to update program',
                                  variant: 'destructive',
                                })
                              }
                            }}
                          >
                            <SelectTrigger className="w-[300px]">
                              <SelectValue placeholder="Select program" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Not Set</SelectItem>
                              <SelectItem value="A">Program A (Saturday, Tuesday, Thursday)</SelectItem>
                              <SelectItem value="B">Program B (Monday, Wednesday, Friday)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>

                    <Tabs defaultValue="attendance" className="w-full mt-4">
                      <TabsList className="grid w-full grid-cols-4 h-12">
                        <TabsTrigger value="attendance" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Attendance ({studentAttendance.length})
                        </TabsTrigger>
                        <TabsTrigger value="homework" className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Homework ({studentHomework.length})
                        </TabsTrigger>
                        <TabsTrigger value="behavior" className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Behavior ({studentBehaviorNotes.length})
                        </TabsTrigger>
                        <TabsTrigger value="notes" className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Notes ({studentNotes.length})
                        </TabsTrigger>
                      </TabsList>

                      {/* Attendance Tab */}
                      <TabsContent value="attendance" className="mt-6">
                        <div className="flex justify-end mb-4">
                          <Button onClick={() => setShowAttendanceDialog(true)} size="sm" className="gap-2">
                            <Calendar className="h-4 w-4" />
                            Mark Attendance
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {studentAttendance.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No attendance records found.</p>
                          ) : (
                            studentAttendance.map((record: any) => {
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
                                        <p className="text-sm text-gray-600">
                                          {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                          {teacher ? ` • Teacher: ${teacher.first_name} ${teacher.last_name}` : ' • Admin'}
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
                      </TabsContent>

                      {/* Homework Tab */}
                      <TabsContent value="homework" className="mt-6">
                        <div className="flex justify-end mb-4">
                          <Button onClick={() => setShowHomeworkDialog(true)} size="sm" className="gap-2">
                            <BookOpen className="h-4 w-4" />
                            Add Homework
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {studentHomework.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No homework assignments found.</p>
                          ) : (
                            studentHomework.map((hw: any) => {
                              const teacher = hw.teachers
                              const isOverdue = hw.due_date && !hw.completed && new Date(hw.due_date) < new Date()
                              return (
                                <Card key={hw.id} className={`hover:shadow-md transition-shadow ${hw.completed ? 'opacity-75' : ''} ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}>
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1">
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
                                          {teacher ? <span>Teacher: {teacher.first_name} {teacher.last_name}</span> : <span>Admin</span>}
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
                      </TabsContent>

                      {/* Behavior Tab */}
                      <TabsContent value="behavior" className="mt-6">
                        <div className="flex justify-end mb-4">
                          <Button onClick={() => setShowBehaviorDialog(true)} size="sm" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Add Behavior Note
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {studentBehaviorNotes.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No behavior notes found.</p>
                          ) : (
                            studentBehaviorNotes.map((note: any) => {
                              const teacher = note.teachers
                              return (
                                <Card key={note.id} className="hover:shadow-md transition-shadow">
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1">
                                        <p className="font-medium mb-1">{note.title}</p>
                                        <p className="text-sm text-gray-700 mb-2">{note.description}</p>
                                        <p className="text-xs text-gray-500">
                                          {new Date(note.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                          {teacher ? ` • Teacher: ${teacher.first_name} ${teacher.last_name}` : ' • Admin'}
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
                      </TabsContent>

                      {/* Notes Tab */}
                      <TabsContent value="notes" className="mt-6">
                        <div className="flex justify-end mb-4">
                          <Button onClick={() => setShowNoteDialog(true)} size="sm" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Add Note
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {studentNotes.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No general notes found.</p>
                          ) : (
                            studentNotes.map((note: any) => {
                              const teacher = note.teachers
                              return (
                                <Card key={note.id} className="hover:shadow-md transition-shadow">
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1">
                                        <p className="text-gray-800 whitespace-pre-wrap mb-2">{note.note}</p>
                                        <p className="text-xs text-gray-500">
                                          {new Date(note.created_at).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                          {teacher ? ` • Teacher: ${teacher.first_name} ${teacher.last_name}` : ' • Admin'}
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            })
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </>
                )}
              </DialogContent>
            </Dialog>

            {/* Account Settings Dialog */}
            <Dialog open={showAccountSettingsDialog} onOpenChange={setShowAccountSettingsDialog}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Account Settings</DialogTitle>
                  <DialogDescription>
                    Update your email address or change your password
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Update Email Address</CardTitle>
                      <CardDescription>
                        Change your admin account email address. You'll need to verify the new email.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-email">New Email Address</Label>
                        <Input
                          id="new-email"
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="admin@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="current-password-email">Current Password</Label>
                        <Input
                          id="current-password-email"
                          type="password"
                          value={currentPasswordForEmail}
                          onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                          placeholder="Enter current password to confirm"
                        />
                      </div>
                      <Button
                        onClick={handleUpdateEmail}
                        disabled={updatingAccount || !newEmail || !currentPasswordForEmail}
                      >
                        {updatingAccount ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Update Email'
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                      <CardDescription>
                        Update your admin account password. Password must be at least 6 characters long.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={currentPasswordForPassword}
                          onChange={(e) => setCurrentPasswordForPassword(e.target.value)}
                          placeholder="Enter current password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password (min 6 characters)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>
                      <Button
                        onClick={handleUpdatePassword}
                        disabled={updatingAccount || !currentPasswordForPassword || !newPassword || !confirmPassword}
                      >
                        {updatingAccount ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Update Password'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </DialogContent>
            </Dialog>

            {/* Attendance Dialog */}
            <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mark Attendance</DialogTitle>
                  <DialogDescription>
                    Record attendance for {selectedStudentForDetail?.first_name} {selectedStudentForDetail?.last_name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={attendanceStatus} onValueChange={setAttendanceStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present_with_uniform">Present with Uniform</SelectItem>
                        <SelectItem value="present_no_uniform">Present No Uniform</SelectItem>
                        <SelectItem value="late_uniform">Late Uniform</SelectItem>
                        <SelectItem value="late_no_uniform">Late No Uniform</SelectItem>
                        <SelectItem value="absent_with_excuse">Absent with Excuse</SelectItem>
                        <SelectItem value="absent_no_excuse">Absent No Excuse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      value={attendanceNotes}
                      onChange={(e) => setAttendanceNotes(e.target.value)}
                      placeholder="Additional notes..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAttendanceDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleMarkAttendance}>
                      Mark Attendance
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Homework Dialog */}
            <Dialog open={showHomeworkDialog} onOpenChange={setShowHomeworkDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Homework</DialogTitle>
                  <DialogDescription>
                    Assign homework to {selectedStudentForDetail?.first_name} {selectedStudentForDetail?.last_name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      value={homeworkTitle}
                      onChange={(e) => setHomeworkTitle(e.target.value)}
                      placeholder="Homework title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Textarea
                      value={homeworkDescription}
                      onChange={(e) => setHomeworkDescription(e.target.value)}
                      placeholder="Homework description..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date (Optional)</Label>
                    <Input
                      type="date"
                      value={homeworkDueDate}
                      onChange={(e) => setHomeworkDueDate(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowHomeworkDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddHomework} disabled={!homeworkTitle}>
                      Add Homework
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Behavior Note Dialog */}
            <Dialog open={showBehaviorDialog} onOpenChange={setShowBehaviorDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Behavior Note</DialogTitle>
                  <DialogDescription>
                    Record a behavior note for {selectedStudentForDetail?.first_name} {selectedStudentForDetail?.last_name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={behaviorType} onValueChange={setBehaviorType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="concern">Concern</SelectItem>
                        <SelectItem value="incident">Incident</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      value={behaviorTitle}
                      onChange={(e) => setBehaviorTitle(e.target.value)}
                      placeholder="Note title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Textarea
                      value={behaviorDescription}
                      onChange={(e) => setBehaviorDescription(e.target.value)}
                      placeholder="Describe the behavior..."
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowBehaviorDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddBehaviorNote} disabled={!behaviorTitle || !behaviorDescription}>
                      Add Note
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* General Note Dialog */}
            <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Note</DialogTitle>
                  <DialogDescription>
                    Add a general note for {selectedStudentForDetail?.first_name} {selectedStudentForDetail?.last_name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Note *</Label>
                    <Textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Enter your note..."
                      rows={6}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddNote} disabled={!noteText.trim()}>
                      Add Note
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default AdminPortal

