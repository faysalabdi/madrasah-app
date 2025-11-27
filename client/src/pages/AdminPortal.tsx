import React, { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trash2, Calendar, BookOpen, FileText, UserCheck, Search, User, LogOut, Settings, Plus, Pencil, Download, KeyRound } from 'lucide-react'

// Complete list of all 114 Surahs with their ayah counts
const SURAHS = [
  { number: 1, name: 'Al-Fatiha', ayahs: 7 },
  { number: 2, name: 'Al-Baqarah', ayahs: 286 },
  { number: 3, name: 'Ali Imran', ayahs: 200 },
  { number: 4, name: 'An-Nisa', ayahs: 176 },
  { number: 5, name: 'Al-Maidah', ayahs: 120 },
  { number: 6, name: 'Al-Anam', ayahs: 165 },
  { number: 7, name: 'Al-Araf', ayahs: 206 },
  { number: 8, name: 'Al-Anfal', ayahs: 75 },
  { number: 9, name: 'At-Tawbah', ayahs: 129 },
  { number: 10, name: 'Yunus', ayahs: 109 },
  { number: 11, name: 'Hud', ayahs: 123 },
  { number: 12, name: 'Yusuf', ayahs: 111 },
  { number: 13, name: 'Ar-Rad', ayahs: 43 },
  { number: 14, name: 'Ibrahim', ayahs: 52 },
  { number: 15, name: 'Al-Hijr', ayahs: 99 },
  { number: 16, name: 'An-Nahl', ayahs: 128 },
  { number: 17, name: 'Al-Isra', ayahs: 111 },
  { number: 18, name: 'Al-Kahf', ayahs: 110 },
  { number: 19, name: 'Maryam', ayahs: 98 },
  { number: 20, name: 'Ta-Ha', ayahs: 135 },
  { number: 21, name: 'Al-Anbiya', ayahs: 112 },
  { number: 22, name: 'Al-Hajj', ayahs: 78 },
  { number: 23, name: 'Al-Muminun', ayahs: 118 },
  { number: 24, name: 'An-Nur', ayahs: 64 },
  { number: 25, name: 'Al-Furqan', ayahs: 77 },
  { number: 26, name: 'Ash-Shuara', ayahs: 227 },
  { number: 27, name: 'An-Naml', ayahs: 93 },
  { number: 28, name: 'Al-Qasas', ayahs: 88 },
  { number: 29, name: 'Al-Ankabut', ayahs: 69 },
  { number: 30, name: 'Ar-Rum', ayahs: 60 },
  { number: 31, name: 'Luqman', ayahs: 34 },
  { number: 32, name: 'As-Sajdah', ayahs: 30 },
  { number: 33, name: 'Al-Ahzab', ayahs: 73 },
  { number: 34, name: 'Saba', ayahs: 54 },
  { number: 35, name: 'Fatir', ayahs: 45 },
  { number: 36, name: 'Ya-Sin', ayahs: 83 },
  { number: 37, name: 'As-Saffat', ayahs: 182 },
  { number: 38, name: 'Sad', ayahs: 88 },
  { number: 39, name: 'Az-Zumar', ayahs: 75 },
  { number: 40, name: 'Ghafir', ayahs: 85 },
  { number: 41, name: 'Fussilat', ayahs: 54 },
  { number: 42, name: 'Ash-Shura', ayahs: 53 },
  { number: 43, name: 'Az-Zukhruf', ayahs: 89 },
  { number: 44, name: 'Ad-Dukhan', ayahs: 59 },
  { number: 45, name: 'Al-Jathiyah', ayahs: 37 },
  { number: 46, name: 'Al-Ahqaf', ayahs: 35 },
  { number: 47, name: 'Muhammad', ayahs: 38 },
  { number: 48, name: 'Al-Fath', ayahs: 29 },
  { number: 49, name: 'Al-Hujurat', ayahs: 18 },
  { number: 50, name: 'Qaf', ayahs: 45 },
  { number: 51, name: 'Adh-Dhariyat', ayahs: 60 },
  { number: 52, name: 'At-Tur', ayahs: 49 },
  { number: 53, name: 'An-Najm', ayahs: 62 },
  { number: 54, name: 'Al-Qamar', ayahs: 55 },
  { number: 55, name: 'Ar-Rahman', ayahs: 78 },
  { number: 56, name: 'Al-Waqiah', ayahs: 96 },
  { number: 57, name: 'Al-Hadid', ayahs: 29 },
  { number: 58, name: 'Al-Mujadila', ayahs: 22 },
  { number: 59, name: 'Al-Hashr', ayahs: 24 },
  { number: 60, name: 'Al-Mumtahanah', ayahs: 13 },
  { number: 61, name: 'As-Saff', ayahs: 14 },
  { number: 62, name: 'Al-Jumuah', ayahs: 11 },
  { number: 63, name: 'Al-Munafiqun', ayahs: 11 },
  { number: 64, name: 'At-Taghabun', ayahs: 18 },
  { number: 65, name: 'At-Talaq', ayahs: 12 },
  { number: 66, name: 'At-Tahrim', ayahs: 12 },
  { number: 67, name: 'Al-Mulk', ayahs: 30 },
  { number: 68, name: 'Al-Qalam', ayahs: 52 },
  { number: 69, name: 'Al-Haqqah', ayahs: 52 },
  { number: 70, name: 'Al-Maarij', ayahs: 44 },
  { number: 71, name: 'Nuh', ayahs: 28 },
  { number: 72, name: 'Al-Jinn', ayahs: 28 },
  { number: 73, name: 'Al-Muzzammil', ayahs: 20 },
  { number: 74, name: 'Al-Muddathir', ayahs: 56 },
  { number: 75, name: 'Al-Qiyamah', ayahs: 40 },
  { number: 76, name: 'Al-Insan', ayahs: 31 },
  { number: 77, name: 'Al-Mursalat', ayahs: 50 },
  { number: 78, name: 'An-Naba', ayahs: 40 },
  { number: 79, name: 'An-Naziat', ayahs: 46 },
  { number: 80, name: 'Abasa', ayahs: 42 },
  { number: 81, name: 'At-Takwir', ayahs: 29 },
  { number: 82, name: 'Al-Infitar', ayahs: 19 },
  { number: 83, name: 'Al-Mutaffifin', ayahs: 36 },
  { number: 84, name: 'Al-Inshiqaq', ayahs: 25 },
  { number: 85, name: 'Al-Buruj', ayahs: 22 },
  { number: 86, name: 'At-Tariq', ayahs: 17 },
  { number: 87, name: 'Al-Ala', ayahs: 19 },
  { number: 88, name: 'Al-Ghashiyah', ayahs: 26 },
  { number: 89, name: 'Al-Fajr', ayahs: 30 },
  { number: 90, name: 'Al-Balad', ayahs: 20 },
  { number: 91, name: 'Ash-Shams', ayahs: 15 },
  { number: 92, name: 'Al-Layl', ayahs: 21 },
  { number: 93, name: 'Ad-Duha', ayahs: 11 },
  { number: 94, name: 'Ash-Sharh', ayahs: 8 },
  { number: 95, name: 'At-Tin', ayahs: 8 },
  { number: 96, name: 'Al-Alaq', ayahs: 19 },
  { number: 97, name: 'Al-Qadr', ayahs: 5 },
  { number: 98, name: 'Al-Bayyinah', ayahs: 8 },
  { number: 99, name: 'Az-Zalzalah', ayahs: 8 },
  { number: 100, name: 'Al-Adiyat', ayahs: 11 },
  { number: 101, name: 'Al-Qariah', ayahs: 11 },
  { number: 102, name: 'At-Takathur', ayahs: 8 },
  { number: 103, name: 'Al-Asr', ayahs: 3 },
  { number: 104, name: 'Al-Humazah', ayahs: 9 },
  { number: 105, name: 'Al-Fil', ayahs: 5 },
  { number: 106, name: 'Quraysh', ayahs: 4 },
  { number: 107, name: 'Al-Maun', ayahs: 7 },
  { number: 108, name: 'Al-Kawthar', ayahs: 3 },
  { number: 109, name: 'Al-Kafirun', ayahs: 6 },
  { number: 110, name: 'An-Nasr', ayahs: 3 },
  { number: 111, name: 'Al-Masad', ayahs: 5 },
  { number: 112, name: 'Al-Ikhlas', ayahs: 4 },
  { number: 113, name: 'Al-Falaq', ayahs: 5 },
  { number: 114, name: 'An-Nas', ayahs: 6 },
]
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'

interface Student {
  id: number
  student_id: string | null
  first_name: string
  last_name: string
  grade: string
  parent_id: number
  program: string | null
  quran_level: string | null
  quran_page: number | null
  quran_surah: string | null
  quran_ayah: string | null
  behavior_standing: string | null
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
  quran_students_count?: number
  islamic_studies_students_count?: number
  total_students_count?: number
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
  
  // Invoices
  const [invoices, setInvoices] = useState<any[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  
  // Email
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [sendToAllParents, setSendToAllParents] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [selectedParentEmails, setSelectedParentEmails] = useState<string[]>([])
  const [emailSearchTerm, setEmailSearchTerm] = useState('')
  
  // Bulk Invoice
  const [showBulkInvoiceDialog, setShowBulkInvoiceDialog] = useState(false)
  const [bulkInvoiceDays, setBulkInvoiceDays] = useState(30)
  const [bulkInvoiceLoading, setBulkInvoiceLoading] = useState(false)
  const [selectedParentsForInvoice, setSelectedParentsForInvoice] = useState<number[]>([])
  const [bulkInvoiceMode, setBulkInvoiceMode] = useState<'all' | 'selected'>('all')
  const [bulkInvoiceTermFees, setBulkInvoiceTermFees] = useState(true)
  const [bulkInvoiceBooks, setBulkInvoiceBooks] = useState(false)
  const [bulkInvoiceSelectedStudents, setBulkInvoiceSelectedStudents] = useState<{ [parentId: number]: number[] }>({}) // parentId -> array of student IDs
  const [bulkInvoiceAllStudents, setBulkInvoiceAllStudents] = useState(true) // If true, invoice all students; if false, use selected students
  
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

  // Teacher student assignment (per teacher dialog)
  const [showTeacherAssignmentDialog, setShowTeacherAssignmentDialog] = useState(false)
  const [selectedTeacherForAssignment, setSelectedTeacherForAssignment] = useState<Teacher | null>(null)
  const [quranStudents, setQuranStudents] = useState<Student[]>([])
  const [islamicStudiesStudents, setIslamicStudiesStudents] = useState<Student[]>([])
  const [selectedStudentsForQuran, setSelectedStudentsForQuran] = useState<number[]>([])
  const [selectedStudentsForIslamicStudies, setSelectedStudentsForIslamicStudies] = useState<number[]>([])
  const [selectedQuranStudentsToDelete, setSelectedQuranStudentsToDelete] = useState<number[]>([])
  const [selectedIslamicStudiesStudentsToDelete, setSelectedIslamicStudiesStudentsToDelete] = useState<number[]>([])
  
  // Filters for teacher assignment dialog
  const [assignmentProgramFilter, setAssignmentProgramFilter] = useState<string>('all')
  const [assignmentGradeFilter, setAssignmentGradeFilter] = useState<string>('all')
  const [assignmentQuranLevelFilter, setAssignmentQuranLevelFilter] = useState<string>('all')
  
  // Filters for Students tab
  const [studentsGradeFilter, setStudentsGradeFilter] = useState<string>('all')
  const [studentsQuranLevelFilter, setStudentsQuranLevelFilter] = useState<string>('all')
  const [studentsPaymentFilter, setStudentsPaymentFilter] = useState<string>('all') // 'all', 'paid', 'unpaid'
  const [studentsSearchTerm, setStudentsSearchTerm] = useState<string>('')
  
  // Program filtering
  const [programFilter, setProgramFilter] = useState<string>('all') // 'all', 'A', 'B', 'none'
  
  // Search terms for Parents and Teachers
  const [parentsSearchTerm, setParentsSearchTerm] = useState<string>('')
  const [teachersSearchTerm, setTeachersSearchTerm] = useState<string>('')
  
  // CSV Import
  const [showCSVImportDialog, setShowCSVImportDialog] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [importingCSV, setImportingCSV] = useState(false)

  // Student Detail View
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null)
  const [showStudentDetailDialog, setShowStudentDetailDialog] = useState(false)
  const [loadingStudentRecords, setLoadingStudentRecords] = useState(false)
  const [studentAttendance, setStudentAttendance] = useState<any[]>([])
  const [studentHomework, setStudentHomework] = useState<any[]>([])
  const [studentBehaviorNotes, setStudentBehaviorNotes] = useState<any[]>([])
  const [studentNotes, setStudentNotes] = useState<any[]>([])
  const [studentParentInfo, setStudentParentInfo] = useState<{ first_name: string; last_name: string; email: string; mobile: string | null } | null>(null)

  // Edit dialogs
  const [showEditStudentDialog, setShowEditStudentDialog] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [quranType, setQuranType] = useState<'iqra' | 'quran'>('iqra')
  const [quranLevel, setQuranLevel] = useState<string>('')
  const [quranPage, setQuranPage] = useState<string>('')
  const [quranSurah, setQuranSurah] = useState<string>('')
  const [quranAyah, setQuranAyah] = useState<string>('')
  const [quranLevelSimple, setQuranLevelSimple] = useState<string>('') // For simple quran_level column
  const [behaviorStanding, setBehaviorStanding] = useState<string>('')
  const [showEditParentDialog, setShowEditParentDialog] = useState(false)
  const [editingParent, setEditingParent] = useState<Parent | null>(null)
  const [showEditTeacherDialog, setShowEditTeacherDialog] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false)
  const [passwordResetEmail, setPasswordResetEmail] = useState('')
  const [passwordResetNewPassword, setPasswordResetNewPassword] = useState('')
  const [resettingPassword, setResettingPassword] = useState(false)
  const [showEditPaymentDialog, setShowEditPaymentDialog] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)

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
      loadInvoices()
    }
    checkAuth()
  }, [setLocation])

  const loadInvoices = async () => {
    try {
      setLoadingInvoices(true)
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/list-invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ limit: 100 }),
      })

      if (!response.ok) {
        throw new Error('Failed to load invoices')
      }

      const data = await response.json()
      if (data.success) {
        setInvoices(data.invoices || [])
      }
    } catch (error: any) {
      console.error('Error loading invoices:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load invoices',
        variant: 'destructive',
      })
    } finally {
      setLoadingInvoices(false)
    }
  }

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

      // Load parent information
      const { data: studentData } = await supabase
        .from('students')
        .select('parent_id')
        .eq('id', studentId)
        .single()
      
      if (studentData?.parent_id) {
        const { data: parentData } = await supabase
          .from('parents')
          .select('parent1_first_name, parent1_last_name, parent1_email, parent1_mobile')
          .eq('id', studentData.parent_id)
          .single()
        
        if (parentData) {
          setStudentParentInfo({
            first_name: parentData.parent1_first_name,
            last_name: parentData.parent1_last_name,
            email: parentData.parent1_email,
            mobile: parentData.parent1_mobile,
          })
        } else {
          setStudentParentInfo(null)
        }
      } else {
        setStudentParentInfo(null)
      }
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

  // Edit handlers
  const handleEditStudent = async (student: Student) => {
    setEditingStudent(student)
    
    // Load full student data including Quran fields
    const { data: fullStudent } = await supabase
      .from('students')
      .select('quran_level, quran_page, quran_surah, quran_ayah, behavior_standing')
      .eq('id', student.id)
      .single()
    
    if (fullStudent) {
      setEditingStudent({ ...student, ...fullStudent })
      
      // Set simple quran_level field
      setQuranLevelSimple(fullStudent.quran_level || '')
      
      // Set Quran type and fields based on existing data
      if (fullStudent.quran_surah && fullStudent.quran_ayah) {
        setQuranType('quran')
        setQuranSurah(fullStudent.quran_surah)
        setQuranAyah(fullStudent.quran_ayah)
        setQuranLevel('')
        setQuranPage('')
      } else if (fullStudent.quran_level && fullStudent.quran_page) {
        setQuranType('iqra')
        setQuranLevel(fullStudent.quran_level)
        setQuranPage(fullStudent.quran_page.toString())
        setQuranSurah('')
        setQuranAyah('')
      } else {
        setQuranType('iqra')
        setQuranLevel('')
        setQuranPage('')
        setQuranSurah('')
        setQuranAyah('')
      }
      
      setBehaviorStanding(fullStudent.behavior_standing || '')
    }
    
    setShowEditStudentDialog(true)
  }

  const handleSaveStudent = async () => {
    if (!editingStudent) return

    try {
      const updateData: any = {
        first_name: editingStudent.first_name,
        last_name: editingStudent.last_name,
        grade: editingStudent.grade,
        program: editingStudent.program || null,
      }
      
      // Update simple quran_level field (this is the main quran_level column)
      // This field is independent and should always be updated if changed
      if (quranLevelSimple !== undefined) {
        if (quranLevelSimple && quranLevelSimple !== 'none') {
          updateData.quran_level = quranLevelSimple
        } else {
          updateData.quran_level = null
        }
      }
      
      // Update detailed Quran/Iqra tracking fields (these are separate from quran_level)
      if (quranType === 'iqra') {
        if (quranLevel && quranLevel !== 'none' && quranPage) {
          updateData.quran_page = parseInt(quranPage)
          // Clear Quran fields
          updateData.quran_surah = null
          updateData.quran_ayah = null
        } else {
          // Clear page if no level/page set
          updateData.quran_page = null
          updateData.quran_surah = null
          updateData.quran_ayah = null
        }
      } else if (quranType === 'quran') {
        if (quranSurah && quranAyah) {
          updateData.quran_surah = quranSurah
          updateData.quran_ayah = quranAyah
          // Clear Iqra page field
          updateData.quran_page = null
        } else {
          updateData.quran_surah = null
          updateData.quran_ayah = null
          updateData.quran_page = null
        }
      }
      
      // Update behavior standing
      if (behaviorStanding && behaviorStanding !== 'none') {
        updateData.behavior_standing = behaviorStanding
      } else {
        updateData.behavior_standing = null
      }

      const { error } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', editingStudent.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Student updated successfully.',
      })

      setShowEditStudentDialog(false)
      setEditingStudent(null)
      setQuranType('iqra')
      setQuranLevel('')
      setQuranPage('')
      setQuranSurah('')
      setQuranAyah('')
      setQuranLevelSimple('')
      setBehaviorStanding('')
      loadDashboardData()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update student',
        variant: 'destructive',
      })
    }
  }

  const handleEditParent = (parent: Parent) => {
    setEditingParent(parent)
    setShowEditParentDialog(true)
  }

  const handleSaveParent = async () => {
    if (!editingParent) return

    try {
      const { error } = await supabase
        .from('parents')
        .update({
          parent1_first_name: editingParent.parent1_first_name,
          parent1_last_name: editingParent.parent1_last_name,
          parent1_email: editingParent.parent1_email,
          parent1_mobile: editingParent.parent1_mobile,
        })
        .eq('id', editingParent.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Parent updated successfully.',
      })

      setShowEditParentDialog(false)
      setEditingParent(null)
      loadDashboardData()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update parent',
        variant: 'destructive',
      })
    }
  }

  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setShowEditTeacherDialog(true)
  }

  const handleSaveTeacher = async () => {
    if (!editingTeacher) return

    try {
      const { error } = await supabase
        .from('teachers')
        .update({
          first_name: editingTeacher.first_name,
          last_name: editingTeacher.last_name,
          email: editingTeacher.email,
          mobile: editingTeacher.mobile || null,
        })
        .eq('id', editingTeacher.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Teacher updated successfully.',
      })

      setShowEditTeacherDialog(false)
      setEditingTeacher(null)
      loadDashboardData()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update teacher',
        variant: 'destructive',
      })
    }
  }

  const handleResetPassword = async () => {
    if (!passwordResetEmail || !passwordResetNewPassword) {
      toast({
        title: 'Error',
        description: 'Please provide email and new password.',
        variant: 'destructive',
      })
      return
    }

    if (passwordResetNewPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      })
      return
    }

    try {
      setResettingPassword(true)

      // Use Supabase Admin API to update password
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            email: passwordResetEmail,
            newPassword: passwordResetNewPassword,
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to reset password')
      }

      toast({
        title: 'Success',
        description: 'Password reset successfully.',
      })

      setShowPasswordResetDialog(false)
      setPasswordResetEmail('')
      setPasswordResetNewPassword('')
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to reset password',
        variant: 'destructive',
      })
    } finally {
      setResettingPassword(false)
    }
  }

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment)
    setShowEditPaymentDialog(true)
  }

  const handleSavePayment = async () => {
    if (!editingPayment) return

    try {
      const { error } = await supabase
        .from('payments')
        .update({
          amount: editingPayment.amount,
          status: editingPayment.status,
          paid_term_fees: editingPayment.paid_term_fees,
          paid_for_books: editingPayment.paid_for_books,
        })
        .eq('id', editingPayment.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Payment updated successfully.',
      })

      setShowEditPaymentDialog(false)
      setEditingPayment(null)
      loadDashboardData()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update payment',
        variant: 'destructive',
      })
    }
  }

  // Export functions
  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header] || ''
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportStudents = () => {
    const headers = ['ID', 'Student ID', 'First Name', 'Last Name', 'Grade', 'Program', 'Quran Level', 'Parent Name', 'Parent Email']
    const data = students.map(s => {
      const parent = parents.find(p => p.id === s.parent_id)
      return {
        'ID': s.id,
        'Student ID': s.student_id || '',
        'First Name': s.first_name,
        'Last Name': s.last_name,
        'Grade': s.grade,
        'Program': s.program || '',
        'Quran Level': s.quran_level || '',
        'Parent Name': parent ? `${parent.parent1_first_name} ${parent.parent1_last_name}` : '',
        'Parent Email': parent?.parent1_email || '',
      }
    })
    exportToCSV(data, `students_export_${new Date().toISOString().split('T')[0]}.csv`, headers)
    toast({
      title: 'Success',
      description: 'Students exported successfully.',
    })
  }

  const handleExportParents = () => {
    const headers = ['ID', 'Parent ID', 'First Name', 'Last Name', 'Email', 'Mobile', 'Stripe Customer ID']
    const data = parents.map(p => ({
      'ID': p.id,
      'Parent ID': p.parent_id || '',
      'First Name': p.parent1_first_name,
      'Last Name': p.parent1_last_name,
      'Email': p.parent1_email,
      'Mobile': p.parent1_mobile || '',
      'Stripe Customer ID': p.stripe_customer_id || '',
    }))
    exportToCSV(data, `parents_export_${new Date().toISOString().split('T')[0]}.csv`, headers)
    toast({
      title: 'Success',
      description: 'Parents exported successfully.',
    })
  }

  const handleExportPayments = () => {
    const headers = ['ID', 'Parent ID', 'Student ID', 'Amount', 'Currency', 'Status', 'Payment Type', 'Term Fees', 'Books', 'Created At']
    const data = payments.map(p => {
      const parent = parents.find(par => par.id === p.parent_id)
      const student = p.student_id ? students.find(s => s.id === p.student_id) : null
      return {
        'ID': p.id,
        'Parent ID': parent ? `${parent.parent1_first_name} ${parent.parent1_last_name}` : p.parent_id,
        'Student ID': student ? `${student.first_name} ${student.last_name}` : (p.student_id || 'All Students'),
        'Amount': p.amount,
        'Currency': p.currency,
        'Status': p.status,
        'Payment Type': p.payment_type,
        'Term Fees': p.paid_term_fees ? 'Yes' : 'No',
        'Books': p.paid_for_books ? 'Yes' : 'No',
        'Created At': new Date(p.created_at).toLocaleString(),
      }
    })
    exportToCSV(data, `payments_export_${new Date().toISOString().split('T')[0]}.csv`, headers)
    toast({
      title: 'Success',
      description: 'Payments exported successfully.',
    })
  }

  const handleCSVImport = async () => {
    if (!csvFile) {
      toast({
        title: 'Error',
        description: 'Please select a CSV file to import.',
        variant: 'destructive',
      })
      return
    }

    try {
      setImportingCSV(true)
      const fileText = await csvFile.text()

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-csv-data`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ csvData: fileText }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to import CSV data')
      }

      const data = await response.json()
      
      toast({
        title: 'Success',
        description: `CSV imported successfully! ${data.parentsCreated || 0} parent(s) and ${data.studentsCreated || 0} student(s) created.`,
      })

      setShowCSVImportDialog(false)
      setCsvFile(null)
      loadDashboardData()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to import CSV data',
        variant: 'destructive',
      })
    } finally {
      setImportingCSV(false)
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

      // Load teachers with student counts
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('*')
        .order('last_name', { ascending: true })
      
      if (teachersError) {
        console.error('Error loading teachers:', teachersError)
        setTeachers([])
      } else if (teachersData) {
        // Load student counts for each teacher
        try {
          const teachersWithCounts = await Promise.all(
            teachersData.map(async (teacher) => {
              try {
                // Count Quran students
                const { count: quranCount, error: quranError } = await supabase
                  .from('teacher_students')
                  .select('*', { count: 'exact', head: true })
                  .eq('quran_teacher_id', teacher.id)
                
                if (quranError) console.error(`Error counting Quran students for teacher ${teacher.id}:`, quranError)
                
                // Count Islamic Studies students
                const { count: islamicCount, error: islamicError } = await supabase
                  .from('teacher_students')
                  .select('*', { count: 'exact', head: true })
                  .eq('islamic_studies_teacher_id', teacher.id)
                
                if (islamicError) console.error(`Error counting Islamic Studies students for teacher ${teacher.id}:`, islamicError)
                
                // Count total unique students (students assigned to either subject)
                // Use separate queries and combine to avoid .or() syntax issues
                const [quranData, islamicData] = await Promise.all([
                  supabase.from('teacher_students').select('student_id').eq('quran_teacher_id', teacher.id),
                  supabase.from('teacher_students').select('student_id').eq('islamic_studies_teacher_id', teacher.id)
                ])
                
                if (quranData.error) console.error(`Error loading Quran students for teacher ${teacher.id}:`, quranData.error)
                if (islamicData.error) console.error(`Error loading Islamic Studies students for teacher ${teacher.id}:`, islamicData.error)
                
                const allIds = [
                  ...(quranData.data || []).map(t => t.student_id),
                  ...(islamicData.data || []).map(t => t.student_id)
                ]
                const uniqueStudentIds = new Set(allIds)
                
                return {
                  ...teacher,
                  quran_students_count: quranCount || 0,
                  islamic_studies_students_count: islamicCount || 0,
                  total_students_count: uniqueStudentIds.size,
                }
              } catch (err) {
                console.error(`Error processing teacher ${teacher.id}:`, err)
                // Return teacher with zero counts if there's an error
                return {
                  ...teacher,
                  quran_students_count: 0,
                  islamic_studies_students_count: 0,
                  total_students_count: 0,
                }
              }
            })
          )
          setTeachers(teachersWithCounts)
        } catch (err) {
          console.error('Error loading teacher counts:', err)
          // Fallback to teachers without counts
          setTeachers(teachersData)
        }
      } else {
        setTeachers([])
      }

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

  const handleTeacherClickForAssignment = async (teacher: Teacher) => {
    setSelectedTeacherForAssignment(teacher)
    setShowTeacherAssignmentDialog(true)
    
    // Load current student assignments for this teacher
    try {
      // Load Quran students (where this teacher is the Quran teacher)
      // Exclude students where both teachers are the same (they should only appear in IS list if both are set)
      const { data: quranData } = await supabase
        .from('teacher_students')
        .select(`
          student_id,
          quran_teacher_id,
          islamic_studies_teacher_id,
          students (
            id,
            first_name,
            last_name,
            grade,
            program,
            quran_level
          )
        `)
        .eq('quran_teacher_id', teacher.id)
      
      // Include all students where this teacher is the Quran teacher
      // (IS teacher can be NULL or a different teacher)
      const quranStudentList = (quranData || [])
        .map((ts: any) => ts.students)
        .filter(Boolean)
      setQuranStudents(quranStudentList)

      // Load Islamic Studies students (where this teacher is the Islamic Studies teacher)
      const { data: islamicStudiesData } = await supabase
        .from('teacher_students')
        .select(`
          student_id,
          quran_teacher_id,
          islamic_studies_teacher_id,
          students (
            id,
            first_name,
            last_name,
            grade,
            program,
            quran_level
          )
        `)
        .eq('islamic_studies_teacher_id', teacher.id)
      
      // Include all students where this teacher is the Islamic Studies teacher
      // (Quran teacher can be NULL or a different teacher)
      const islamicStudiesStudentList = (islamicStudiesData || [])
        .map((ts: any) => ts.students)
        .filter(Boolean)
      setIslamicStudiesStudents(islamicStudiesStudentList)

      setSelectedStudentsForQuran([])
      setSelectedStudentsForIslamicStudies([])
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to load student assignments',
        variant: 'destructive',
      })
    }
  }

  const handleAssignQuranStudents = async () => {
    if (!selectedTeacherForAssignment || selectedStudentsForQuran.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one student',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)

      // For each selected student, update or create the teacher_students record
      for (const studentId of selectedStudentsForQuran) {
        // Check if student already has a teacher_students record
        const { data: existing } = await supabase
          .from('teacher_students')
          .select('id, islamic_studies_teacher_id')
          .eq('student_id', studentId)
          .maybeSingle()

        if (existing) {
          // Update existing record - only change the Quran teacher, preserve Islamic Studies teacher
          const { error } = await supabase
            .from('teacher_students')
            .update({ quran_teacher_id: selectedTeacherForAssignment.id })
            .eq('id', existing.id)
          
          if (error) throw error
        } else {
          // Create new record - only set Quran teacher, leave IS teacher as NULL
          const { error } = await supabase
            .from('teacher_students')
            .insert({
              student_id: studentId,
              quran_teacher_id: selectedTeacherForAssignment.id,
              islamic_studies_teacher_id: null,
            })
          
          if (error) throw error
        }
      }

      toast({
        title: 'Success',
        description: `Assigned ${selectedStudentsForQuran.length} student(s) to ${selectedTeacherForAssignment.first_name} ${selectedTeacherForAssignment.last_name} for Quran.`,
      })

      setSelectedStudentsForQuran([])
      await handleTeacherClickForAssignment(selectedTeacherForAssignment) // Reload assignments
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

  const handleAssignIslamicStudiesStudents = async () => {
    if (!selectedTeacherForAssignment || selectedStudentsForIslamicStudies.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one student',
        variant: 'destructive',
      })
      return
    }

    try {
      setLoading(true)

      // For each selected student, update or create the teacher_students record
      for (const studentId of selectedStudentsForIslamicStudies) {
        // Check if student already has a teacher_students record
        const { data: existing } = await supabase
          .from('teacher_students')
          .select('id, quran_teacher_id')
          .eq('student_id', studentId)
          .maybeSingle()

        if (existing) {
          // Update existing record - only change the Islamic Studies teacher, preserve Quran teacher
          const { error } = await supabase
            .from('teacher_students')
            .update({ islamic_studies_teacher_id: selectedTeacherForAssignment.id })
            .eq('id', existing.id)
          
          if (error) throw error
        } else {
          // Create new record - only set Islamic Studies teacher, leave Quran teacher as NULL
          const { error } = await supabase
            .from('teacher_students')
            .insert({
              student_id: studentId,
              quran_teacher_id: null,
              islamic_studies_teacher_id: selectedTeacherForAssignment.id,
            })
          
          if (error) throw error
        }
      }

      toast({
        title: 'Success',
        description: `Assigned ${selectedStudentsForIslamicStudies.length} student(s) to ${selectedTeacherForAssignment.first_name} ${selectedTeacherForAssignment.last_name} for Islamic Studies.`,
      })

      setSelectedStudentsForIslamicStudies([])
      await handleTeacherClickForAssignment(selectedTeacherForAssignment) // Reload assignments
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

  const handleUnassignQuranStudent = async (studentId: number) => {
    if (!selectedTeacherForAssignment) return

    if (!confirm('Are you sure you want to unassign this student from Quran class?')) {
      return
    }

    try {
      setLoading(true)

      // Get the current record
      const { data: existing } = await supabase
        .from('teacher_students')
        .select('id, islamic_studies_teacher_id')
        .eq('student_id', studentId)
        .eq('quran_teacher_id', selectedTeacherForAssignment.id)
        .maybeSingle()

      if (existing) {
        // If student has an Islamic Studies teacher, set Quran teacher to NULL
        // (This keeps the record but removes the Quran assignment)
        if (existing.islamic_studies_teacher_id) {
          // Update to set Quran teacher to NULL, keep IS teacher
          const { error } = await supabase
            .from('teacher_students')
            .update({ quran_teacher_id: null })
            .eq('id', existing.id)
          
          if (error) throw error
        } else {
          // No IS teacher, delete the entire record
          const { error } = await supabase
            .from('teacher_students')
            .delete()
            .eq('id', existing.id)
          
          if (error) throw error
        }
      }

      toast({
        title: 'Success',
        description: 'Student unassigned from Quran class.',
      })

      await handleTeacherClickForAssignment(selectedTeacherForAssignment) // Reload assignments
      loadDashboardData()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to unassign student',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUnassignIslamicStudiesStudent = async (studentId: number) => {
    if (!selectedTeacherForAssignment) return

    if (!confirm('Are you sure you want to unassign this student from Islamic Studies class?')) {
      return
    }

    try {
      setLoading(true)

      // Get the current record
      const { data: existing } = await supabase
        .from('teacher_students')
        .select('id, quran_teacher_id')
        .eq('student_id', studentId)
        .eq('islamic_studies_teacher_id', selectedTeacherForAssignment.id)
        .maybeSingle()

      if (existing) {
        // If student has a Quran teacher, set IS teacher to NULL
        // (This keeps the record but removes the IS assignment)
        if (existing.quran_teacher_id) {
          // Update to set IS teacher to NULL, keep Quran teacher
          const { error } = await supabase
            .from('teacher_students')
            .update({ islamic_studies_teacher_id: null })
            .eq('id', existing.id)
          
          if (error) throw error
        } else {
          // No Quran teacher, delete the entire record
          const { error } = await supabase
            .from('teacher_students')
            .delete()
            .eq('id', existing.id)
          
          if (error) throw error
        }
      }

      toast({
        title: 'Success',
        description: 'Student unassigned from Islamic Studies class.',
      })

      await handleTeacherClickForAssignment(selectedTeacherForAssignment) // Reload assignments
      loadDashboardData()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to unassign student',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBulkUnassignQuranStudents = async () => {
    if (!selectedTeacherForAssignment || selectedQuranStudentsToDelete.length === 0) return

    if (!confirm(`Are you sure you want to unassign ${selectedQuranStudentsToDelete.length} student(s) from Quran class?`)) {
      return
    }

    try {
      setLoading(true)

      for (const studentId of selectedQuranStudentsToDelete) {
        const { data: existing } = await supabase
          .from('teacher_students')
          .select('id, islamic_studies_teacher_id')
          .eq('student_id', studentId)
          .eq('quran_teacher_id', selectedTeacherForAssignment.id)
          .maybeSingle()

        if (existing) {
          if (existing.islamic_studies_teacher_id) {
            // Has IS teacher, set Quran teacher to NULL
            await supabase
              .from('teacher_students')
              .update({ quran_teacher_id: null })
              .eq('id', existing.id)
          } else {
            // No IS teacher, delete the entire record
            await supabase
              .from('teacher_students')
              .delete()
              .eq('id', existing.id)
          }
        }
      }

      toast({
        title: 'Success',
        description: `Unassigned ${selectedQuranStudentsToDelete.length} student(s) from Quran class.`,
      })

      setSelectedQuranStudentsToDelete([])
      await handleTeacherClickForAssignment(selectedTeacherForAssignment)
      loadDashboardData()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to unassign students',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBulkUnassignIslamicStudiesStudents = async () => {
    if (!selectedTeacherForAssignment || selectedIslamicStudiesStudentsToDelete.length === 0) return

    if (!confirm(`Are you sure you want to unassign ${selectedIslamicStudiesStudentsToDelete.length} student(s) from Islamic Studies class?`)) {
      return
    }

    try {
      setLoading(true)

      for (const studentId of selectedIslamicStudiesStudentsToDelete) {
        const { data: existing } = await supabase
          .from('teacher_students')
          .select('id, quran_teacher_id')
          .eq('student_id', studentId)
          .eq('islamic_studies_teacher_id', selectedTeacherForAssignment.id)
          .maybeSingle()

        if (existing) {
          if (existing.quran_teacher_id) {
            // Has Quran teacher, set IS teacher to NULL
            await supabase
              .from('teacher_students')
              .update({ islamic_studies_teacher_id: null })
              .eq('id', existing.id)
          } else {
            // No Quran teacher, delete the entire record
            await supabase
              .from('teacher_students')
              .delete()
              .eq('id', existing.id)
          }
        }
      }

      toast({
        title: 'Success',
        description: `Unassigned ${selectedIslamicStudiesStudentsToDelete.length} student(s) from Islamic Studies class.`,
      })

      setSelectedIslamicStudiesStudentsToDelete([])
      await handleTeacherClickForAssignment(selectedTeacherForAssignment)
      loadDashboardData()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to unassign students',
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
    <div className="min-h-screen bg-neutral-background py-4 sm:py-8">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary font-amiri">
                Admin Portal
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
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
            <TabsList className="flex-wrap h-auto w-full gap-1">
              <TabsTrigger value="dashboard" className="text-xs sm:text-sm px-2 sm:px-3">Dashboard</TabsTrigger>
              <TabsTrigger value="payments" className="text-xs sm:text-sm px-2 sm:px-3">Payments</TabsTrigger>
              <TabsTrigger value="invoices" className="text-xs sm:text-sm px-2 sm:px-3">Invoices</TabsTrigger>
              <TabsTrigger value="email" className="text-xs sm:text-sm px-2 sm:px-3">Email</TabsTrigger>
              <TabsTrigger value="teachers" className="text-xs sm:text-sm px-2 sm:px-3">Teachers</TabsTrigger>
              <TabsTrigger value="students" className="text-xs sm:text-sm px-2 sm:px-3">Students</TabsTrigger>
              <TabsTrigger value="parents" className="text-xs sm:text-sm px-2 sm:px-3">Parents</TabsTrigger>
              <TabsTrigger value="admins" className="text-xs sm:text-sm px-2 sm:px-3">Admins</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
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
                <Button
                  variant="outline"
                  onClick={handleExportPayments}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Payments to CSV
                </Button>
                <Dialog open={showCreatePayment} onOpenChange={setShowCreatePayment}>
                  <DialogTrigger asChild>
                    <Button>Create Manual Payment</Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] sm:w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
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
                              onClick={() => handleEditPayment(payment)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
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

            {/* Invoices Tab */}
            <TabsContent value="invoices" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Sent Invoices</h2>
                <Button onClick={loadInvoices} disabled={loadingInvoices}>
                  {loadingInvoices ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
              
              {loadingInvoices ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-gray-500">Loading invoices...</div>
                </div>
              ) : invoices.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    No invoices found.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>All Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="text-xs sm:text-sm">Invoice #</TableHead>
                                <TableHead className="text-xs sm:text-sm">Parent</TableHead>
                                <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                                <TableHead className="text-xs sm:text-sm">Status</TableHead>
                              <TableHead className="text-xs sm:text-sm hidden md:table-cell">Due Date</TableHead>
                              <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Created</TableHead>
                              <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {invoices.map((invoice: any) => {
                              const amount = (invoice.amount_due || 0) / 100
                              const status = invoice.status
                              const dueDate = invoice.due_date ? new Date(invoice.due_date * 1000).toLocaleDateString() : 'N/A'
                              const createdDate = new Date(invoice.created * 1000).toLocaleDateString()
                              const invoiceUrl = invoice.hosted_invoice_url || invoice.invoice_pdf
                              
                              return (
                                <TableRow key={invoice.id}>
                                  <TableCell className="font-mono text-xs sm:text-sm">
                                    {invoice.number || invoice.id.substring(0, 12)}
                                  </TableCell>
                                  <TableCell className="text-xs sm:text-sm">
                                    {invoice.parent 
                                      ? `${invoice.parent.parent1_first_name} ${invoice.parent.parent1_last_name}`
                                      : 'Unknown Parent'
                                    }
                                  </TableCell>
                                  <TableCell className="text-xs sm:text-sm">${amount.toFixed(2)}</TableCell>
                                  <TableCell className="text-xs sm:text-sm">
                                    <Badge 
                                      variant={
                                        status === 'paid' ? 'default' :
                                        status === 'open' ? 'secondary' :
                                        status === 'draft' ? 'outline' :
                                        'destructive'
                                      }
                                      className="text-xs"
                                    >
                                      {status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-xs sm:text-sm hidden md:table-cell">{dueDate}</TableCell>
                                  <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{createdDate}</TableCell>
                                  <TableCell className="text-xs sm:text-sm">
                                    {invoiceUrl && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(invoiceUrl, '_blank')}
                                      >
                                        View
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Email Tab */}
            <TabsContent value="email" className="mt-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold">Send Email</h2>
                <p className="text-gray-600 mt-1">
                  Send emails to parents using Resend. You can send to specific recipients or all parents.
                </p>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Compose Email</CardTitle>
                  <CardDescription>
                    Fill in the details below to send an email
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="send-to-all"
                          checked={sendToAllParents}
                          onCheckedChange={(checked) => {
                            setSendToAllParents(checked === true)
                            if (checked) {
                              setSelectedParentEmails([])
                            }
                          }}
                        />
                        <Label htmlFor="send-to-all" className="cursor-pointer">
                          Send to all parents
                        </Label>
                      </div>
                      {!sendToAllParents && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Select Parent Email(s)</Label>
                            {selectedParentEmails.length > 0 && (
                              <Badge variant="secondary">
                                {selectedParentEmails.length} selected
                              </Badge>
                            )}
                          </div>
                          <Input
                            placeholder="Search parents by name or email..."
                            value={emailSearchTerm}
                            onChange={(e) => setEmailSearchTerm(e.target.value)}
                            className="mb-2"
                          />
                          <div className="border rounded-lg p-3 max-h-64 overflow-y-auto space-y-2">
                            {parents
                              .filter((p) => {
                                if (!emailSearchTerm) return true
                                const search = emailSearchTerm.toLowerCase()
                                const name = `${p.parent1_first_name} ${p.parent1_last_name}`.toLowerCase()
                                const email = (p.parent1_email || '').toLowerCase()
                                return name.includes(search) || email.includes(search)
                              })
                              .filter((p) => p.parent1_email) // Only show parents with emails
                              .map((parent) => {
                                const email = parent.parent1_email || ''
                                const isSelected = selectedParentEmails.includes(email)
                                return (
                                  <div
                                    key={parent.id}
                                    className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                                    onClick={() => {
                                      if (isSelected) {
                                        setSelectedParentEmails(selectedParentEmails.filter(e => e !== email))
                                      } else {
                                        setSelectedParentEmails([...selectedParentEmails, email])
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
                                      <span className="text-sm font-medium">
                                        {parent.parent1_first_name} {parent.parent1_last_name}
                                      </span>
                                      <span className="text-sm text-gray-600 ml-2">
                                        ({email})
                                      </span>
                                    </div>
                                  </div>
                                )
                              })}
                            {parents.filter((p) => {
                              if (!emailSearchTerm) return p.parent1_email
                              const search = emailSearchTerm.toLowerCase()
                              const name = `${p.parent1_first_name} ${p.parent1_last_name}`.toLowerCase()
                              const email = (p.parent1_email || '').toLowerCase()
                              return (name.includes(search) || email.includes(search)) && p.parent1_email
                            }).length === 0 && (
                              <p className="text-sm text-gray-500 text-center py-4">
                                No parents found matching your search.
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const allEmails = parents
                                  .filter(p => p.parent1_email)
                                  .map(p => p.parent1_email!)
                                setSelectedParentEmails(allEmails)
                              }}
                            >
                              Select All
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedParentEmails([])}
                            >
                              Clear Selection
                            </Button>
                          </div>
                        </div>
                      )}
                      {sendToAllParents && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-800">
                            This email will be sent to all parents in the database ({parents.filter(p => p.parent1_email).length} parents with email addresses).
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-subject">Subject *</Label>
                    <Input
                      id="email-subject"
                      placeholder="Email subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-message">Message *</Label>
                    <Textarea
                      id="email-message"
                      placeholder="Enter your message here. You can use line breaks for formatting."
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      rows={10}
                    />
                    <p className="text-xs text-gray-500">
                      The message will be formatted as HTML. Line breaks will be preserved.
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEmailSubject('')
                        setEmailMessage('')
                        setSelectedParentEmails([])
                        setEmailSearchTerm('')
                        setSendToAllParents(false)
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!emailSubject.trim() || !emailMessage.trim()) {
                          toast({
                            title: 'Error',
                            description: 'Please fill in both subject and message.',
                            variant: 'destructive',
                          })
                          return
                        }

                        if (!sendToAllParents && selectedParentEmails.length === 0) {
                          toast({
                            title: 'Error',
                            description: 'Please select at least one parent email or select "Send to all parents".',
                            variant: 'destructive',
                          })
                          return
                        }

                        setSendingEmail(true)
                        try {
                          const recipients = sendToAllParents ? [] : selectedParentEmails

                          const response = await fetch(
                            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,
                            {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                              },
                              body: JSON.stringify({
                                to: recipients,
                                subject: emailSubject,
                                message: emailMessage,
                                sendToAllParents,
                              }),
                            }
                          )

                          if (!response.ok) {
                            const errorData = await response.json().catch(() => ({}))
                            throw new Error(errorData.error || 'Failed to send email')
                          }

                          const data = await response.json()
                          
                          toast({
                            title: 'Success',
                            description: `Email sent successfully! ${data.succeeded || 0} succeeded, ${data.failed || 0} failed.`,
                          })

                          // Clear form
                          setEmailSubject('')
                          setEmailMessage('')
                          setSelectedParentEmails([])
                          setEmailSearchTerm('')
                          setSendToAllParents(false)
                        } catch (err: any) {
                          toast({
                            title: 'Error',
                            description: err.message || 'Failed to send email',
                            variant: 'destructive',
                          })
                        } finally {
                          setSendingEmail(false)
                        }
                      }}
                      disabled={sendingEmail}
                    >
                      {sendingEmail ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Email'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Teachers Tab */}
            <TabsContent value="teachers" className="mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold">Teacher Management</h2>
                <div className="flex gap-2">
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
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPasswordResetDialog(true)
                      setPasswordResetEmail('')
                    }}
                    className="gap-2"
                  >
                    <KeyRound className="h-4 w-4" />
                    Reset Password
                  </Button>
                </div>
              </div>
              <div className="mb-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search teachers by name or email..."
                    value={teachersSearchTerm}
                    onChange={(e) => setTeachersSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Teachers</CardTitle>
                  <CardDescription>
                    Click on a teacher's name to view attendance records, or use the buttons to manage student assignments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {teachers
                      .filter((teacher) => {
                        if (teachersSearchTerm) {
                          const search = teachersSearchTerm.toLowerCase()
                          const name = `${teacher.first_name} ${teacher.last_name}`.toLowerCase()
                          const email = teacher.email.toLowerCase()
                          return name.includes(search) || email.includes(search)
                        }
                        return true
                      })
                      .map((teacher) => {
                        const quranCount = teacher.quran_students_count || 0
                        const islamicCount = teacher.islamic_studies_students_count || 0
                        const totalCount = teacher.total_students_count || 0
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
                            <div className="flex gap-3 mt-2 text-xs text-gray-600">
                              <span>Quran: <strong>{quranCount}</strong></span>
                              <span>Islamic Studies: <strong>{islamicCount}</strong></span>
                              <span>Total: <strong>{totalCount}</strong></span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTeacherClickForAssignment(teacher)}
                              disabled={loading}
                              className="gap-2"
                            >
                              <User className="h-4 w-4" />
                              Assign Students
                            </Button>
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
                              onClick={() => handleEditTeacher(teacher)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setPasswordResetEmail(teacher.email)
                                setShowPasswordResetDialog(true)
                              }}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Reset Password"
                            >
                              <KeyRound className="h-4 w-4" />
                            </Button>
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

              {/* Teacher Student Assignment Dialog */}
              <Dialog open={showTeacherAssignmentDialog} onOpenChange={setShowTeacherAssignmentDialog}>
                <DialogContent className="w-[95vw] sm:w-full max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                  {!selectedTeacherForAssignment ? (
                    <div className="py-12 text-center">
                      <p className="text-gray-500">No teacher selected</p>
                    </div>
                  ) : (
                    <>
                      <DialogHeader>
                        <DialogTitle className="text-2xl">
                          Assign Students: {selectedTeacherForAssignment.first_name} {selectedTeacherForAssignment.last_name}
                        </DialogTitle>
                        <DialogDescription>
                          Manage student assignments for Quran (First Hour) and Islamic Studies (Second Hour)
                        </DialogDescription>
                      </DialogHeader>

                      {/* Filters */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="space-y-2">
                          <Label>Filter by Program</Label>
                          <Select value={assignmentProgramFilter} onValueChange={setAssignmentProgramFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="All Programs" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Programs</SelectItem>
                              <SelectItem value="A">Program A</SelectItem>
                              <SelectItem value="B">Program B</SelectItem>
                              <SelectItem value="none">Not Set</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Filter by Grade</Label>
                          <Select value={assignmentGradeFilter} onValueChange={setAssignmentGradeFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="All Grades" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Grades</SelectItem>
                              <SelectItem value="Prep">Prep</SelectItem>
                              <SelectItem value="Grade 1">Grade 1</SelectItem>
                              <SelectItem value="Grade 2">Grade 2</SelectItem>
                              <SelectItem value="Grade 3">Grade 3</SelectItem>
                              <SelectItem value="Grade 4">Grade 4</SelectItem>
                              <SelectItem value="Grade 5">Grade 5</SelectItem>
                              <SelectItem value="Grade 6">Grade 6</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Filter by Quran Level</Label>
                          <Select value={assignmentQuranLevelFilter} onValueChange={setAssignmentQuranLevelFilter}>
                            <SelectTrigger>
                              <SelectValue placeholder="All Levels" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Levels</SelectItem>
                              <SelectItem value="Iqra 1">Iqra 1</SelectItem>
                              <SelectItem value="Iqra 2">Iqra 2</SelectItem>
                              <SelectItem value="Iqra 3">Iqra 3</SelectItem>
                              <SelectItem value="Iqra 4">Iqra 4</SelectItem>
                              <SelectItem value="Iqra 5">Iqra 5</SelectItem>
                              <SelectItem value="Iqra 6">Iqra 6</SelectItem>
                              <SelectItem value="Quran">Quran</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        {/* Quran Students Section */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Quran Students (First Hour)</CardTitle>
                            <CardDescription>Students assigned for Quran studies</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Current Quran Students */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <Label>Currently Assigned ({quranStudents.filter((s: any) => {
                                  if (assignmentProgramFilter !== 'all') {
                                    if (assignmentProgramFilter === 'none' && s.program) return false
                                    if (assignmentProgramFilter !== 'none' && s.program !== assignmentProgramFilter) return false
                                  }
                                  if (assignmentGradeFilter !== 'all' && s.grade !== assignmentGradeFilter) return false
                                  if (assignmentQuranLevelFilter !== 'all' && s.quran_level !== assignmentQuranLevelFilter) return false
                                  return true
                                }).length})</Label>
                                {selectedQuranStudentsToDelete.length > 0 && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleBulkUnassignQuranStudents}
                                    disabled={loading}
                                  >
                                    Remove Selected ({selectedQuranStudentsToDelete.length})
                                  </Button>
                                )}
                              </div>
                              {quranStudents.length === 0 ? (
                                <p className="text-sm text-gray-500 py-4">No students assigned yet.</p>
                              ) : (
                                <>
                                  <div className="space-y-1 max-h-48 overflow-y-auto border rounded-lg p-2">
                                    {quranStudents
                                      .filter((s: any) => {
                                        if (assignmentProgramFilter !== 'all') {
                                          if (assignmentProgramFilter === 'none' && s.program) return false
                                          if (assignmentProgramFilter !== 'none' && s.program !== assignmentProgramFilter) return false
                                        }
                                        if (assignmentGradeFilter !== 'all' && s.grade !== assignmentGradeFilter) return false
                                        if (assignmentQuranLevelFilter !== 'all' && s.quran_level !== assignmentQuranLevelFilter) return false
                                        return true
                                      })
                                      .map((student: any) => {
                                        const isSelected = selectedQuranStudentsToDelete.includes(student.id)
                                        return (
                                          <div
                                            key={student.id}
                                            className={`flex items-center space-x-2 p-2 rounded ${
                                              isSelected ? 'bg-red-50' : 'hover:bg-gray-50'
                                            }`}
                                          >
                                            <input
                                              type="checkbox"
                                              checked={isSelected}
                                              onChange={(e) => {
                                                e.stopPropagation()
                                                if (isSelected) {
                                                  setSelectedQuranStudentsToDelete(selectedQuranStudentsToDelete.filter(id => id !== student.id))
                                                } else {
                                                  setSelectedQuranStudentsToDelete([...selectedQuranStudentsToDelete, student.id])
                                                }
                                              }}
                                              className="cursor-pointer"
                                            />
                                            <div className="flex-1">
                                              <p className="font-medium text-sm">
                                                {student.first_name} {student.last_name}
                                              </p>
                                              <p className="text-xs text-gray-600">
                                                {student.grade} • {student.program ? `Program ${student.program}` : 'No Program'}
                                                {student.quran_level && ` • ${student.quran_level}`}
                                              </p>
                                            </div>
                                          </div>
                                        )
                                      })}
                                  </div>
                                  {quranStudents.filter((s: any) => {
                                    if (assignmentProgramFilter !== 'all') {
                                      if (assignmentProgramFilter === 'none' && s.program) return false
                                      if (assignmentProgramFilter !== 'none' && s.program !== assignmentProgramFilter) return false
                                    }
                                    if (assignmentGradeFilter !== 'all' && s.grade !== assignmentGradeFilter) return false
                                    if (assignmentQuranLevelFilter !== 'all' && s.quran_level !== assignmentQuranLevelFilter) return false
                                    return true
                                  }).length === 0 && quranStudents.length > 0 && (
                                    <p className="text-sm text-gray-500 py-2 text-center">No students match the current filters.</p>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Assign New Quran Students */}
                            <div>
                              <Label className="mb-2 block">Assign New Students</Label>
                              <div className="border rounded-lg p-2 max-h-48 overflow-y-auto">
                                {students
                                  .filter((s) => {
                                    // Not already assigned
                                    if (quranStudents.some((qs: any) => qs.id === s.id)) return false
                                    // Apply filters
                                    if (assignmentProgramFilter !== 'all') {
                                      if (assignmentProgramFilter === 'none' && s.program) return false
                                      if (assignmentProgramFilter !== 'none' && s.program !== assignmentProgramFilter) return false
                                    }
                                    if (assignmentGradeFilter !== 'all' && s.grade !== assignmentGradeFilter) return false
                                    if (assignmentQuranLevelFilter !== 'all' && s.quran_level !== assignmentQuranLevelFilter) return false
                                    return true
                                  })
                                  .map((student) => {
                                    const isSelected = selectedStudentsForQuran.includes(student.id)
                                    return (
                                      <div
                                        key={student.id}
                                        className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                                          isSelected ? 'bg-primary/10' : 'hover:bg-gray-50'
                                        }`}
                                        onClick={() => {
                                          if (isSelected) {
                                            setSelectedStudentsForQuran(selectedStudentsForQuran.filter(id => id !== student.id))
                                          } else {
                                            setSelectedStudentsForQuran([...selectedStudentsForQuran, student.id])
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
                                          <p className="font-medium text-sm">
                                            {student.first_name} {student.last_name}
                                          </p>
                                          <p className="text-xs text-gray-600">
                                            {student.grade} • {student.program ? `Program ${student.program}` : 'No Program'}
                                            {student.quran_level && ` • ${student.quran_level}`}
                                          </p>
                                        </div>
                                      </div>
                                    )
                                  })}
                                {students.filter((s) => {
                                  if (quranStudents.some((qs: any) => qs.id === s.id)) return false
                                  if (assignmentProgramFilter !== 'all') {
                                    if (assignmentProgramFilter === 'none' && s.program) return false
                                    if (assignmentProgramFilter !== 'none' && s.program !== assignmentProgramFilter) return false
                                  }
                                  if (assignmentGradeFilter !== 'all' && s.grade !== assignmentGradeFilter) return false
                                  if (assignmentQuranLevelFilter !== 'all' && s.quran_level !== assignmentQuranLevelFilter) return false
                                  return true
                                }).length === 0 && (
                                  <p className="text-sm text-gray-500 py-4 text-center">No students available to assign.</p>
                                )}
                              </div>
                              <Button
                                onClick={handleAssignQuranStudents}
                                disabled={selectedStudentsForQuran.length === 0 || loading}
                                className="w-full mt-2"
                                size="sm"
                              >
                                Assign {selectedStudentsForQuran.length} Student{selectedStudentsForQuran.length !== 1 ? 's' : ''} for Quran
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Islamic Studies Students Section */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Islamic Studies Students (Second Hour)</CardTitle>
                            <CardDescription>Students assigned for Islamic Studies</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Current Islamic Studies Students */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <Label>Currently Assigned ({islamicStudiesStudents.filter((s: any) => {
                                  if (assignmentProgramFilter !== 'all') {
                                    if (assignmentProgramFilter === 'none' && s.program) return false
                                    if (assignmentProgramFilter !== 'none' && s.program !== assignmentProgramFilter) return false
                                  }
                                  if (assignmentGradeFilter !== 'all' && s.grade !== assignmentGradeFilter) return false
                                  if (assignmentQuranLevelFilter !== 'all' && s.quran_level !== assignmentQuranLevelFilter) return false
                                  return true
                                }).length})</Label>
                                {selectedIslamicStudiesStudentsToDelete.length > 0 && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleBulkUnassignIslamicStudiesStudents}
                                    disabled={loading}
                                  >
                                    Remove Selected ({selectedIslamicStudiesStudentsToDelete.length})
                                  </Button>
                                )}
                              </div>
                              {islamicStudiesStudents.length === 0 ? (
                                <p className="text-sm text-gray-500 py-4">No students assigned yet.</p>
                              ) : (
                                <>
                                  <div className="space-y-1 max-h-48 overflow-y-auto border rounded-lg p-2">
                                    {islamicStudiesStudents
                                      .filter((s: any) => {
                                        if (assignmentProgramFilter !== 'all') {
                                          if (assignmentProgramFilter === 'none' && s.program) return false
                                          if (assignmentProgramFilter !== 'none' && s.program !== assignmentProgramFilter) return false
                                        }
                                        if (assignmentGradeFilter !== 'all' && s.grade !== assignmentGradeFilter) return false
                                        if (assignmentQuranLevelFilter !== 'all' && s.quran_level !== assignmentQuranLevelFilter) return false
                                        return true
                                      })
                                      .map((student: any) => {
                                        const isSelected = selectedIslamicStudiesStudentsToDelete.includes(student.id)
                                        return (
                                          <div
                                            key={student.id}
                                            className={`flex items-center space-x-2 p-2 rounded ${
                                              isSelected ? 'bg-red-50' : 'hover:bg-gray-50'
                                            }`}
                                          >
                                            <input
                                              type="checkbox"
                                              checked={isSelected}
                                              onChange={(e) => {
                                                e.stopPropagation()
                                                if (isSelected) {
                                                  setSelectedIslamicStudiesStudentsToDelete(selectedIslamicStudiesStudentsToDelete.filter(id => id !== student.id))
                                                } else {
                                                  setSelectedIslamicStudiesStudentsToDelete([...selectedIslamicStudiesStudentsToDelete, student.id])
                                                }
                                              }}
                                              className="cursor-pointer"
                                            />
                                            <div className="flex-1">
                                              <p className="font-medium text-sm">
                                                {student.first_name} {student.last_name}
                                              </p>
                                              <p className="text-xs text-gray-600">
                                                {student.grade} • {student.program ? `Program ${student.program}` : 'No Program'}
                                                {student.quran_level && ` • ${student.quran_level}`}
                                              </p>
                                            </div>
                                          </div>
                                        )
                                      })}
                                  </div>
                                  {islamicStudiesStudents.filter((s: any) => {
                                    if (assignmentProgramFilter !== 'all') {
                                      if (assignmentProgramFilter === 'none' && s.program) return false
                                      if (assignmentProgramFilter !== 'none' && s.program !== assignmentProgramFilter) return false
                                    }
                                    if (assignmentGradeFilter !== 'all' && s.grade !== assignmentGradeFilter) return false
                                    if (assignmentQuranLevelFilter !== 'all' && s.quran_level !== assignmentQuranLevelFilter) return false
                                    return true
                                  }).length === 0 && islamicStudiesStudents.length > 0 && (
                                    <p className="text-sm text-gray-500 py-2 text-center">No students match the current filters.</p>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Assign New Islamic Studies Students */}
                            <div>
                              <Label className="mb-2 block">Assign New Students</Label>
                              <div className="border rounded-lg p-2 max-h-48 overflow-y-auto">
                                {students
                                  .filter((s) => {
                                    // Not already assigned
                                    if (islamicStudiesStudents.some((iss: any) => iss.id === s.id)) return false
                                    // Apply filters
                                    if (assignmentProgramFilter !== 'all') {
                                      if (assignmentProgramFilter === 'none' && s.program) return false
                                      if (assignmentProgramFilter !== 'none' && s.program !== assignmentProgramFilter) return false
                                    }
                                    if (assignmentGradeFilter !== 'all' && s.grade !== assignmentGradeFilter) return false
                                    if (assignmentQuranLevelFilter !== 'all' && s.quran_level !== assignmentQuranLevelFilter) return false
                                    return true
                                  })
                                  .map((student) => {
                                    const isSelected = selectedStudentsForIslamicStudies.includes(student.id)
                                    return (
                                      <div
                                        key={student.id}
                                        className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                                          isSelected ? 'bg-primary/10' : 'hover:bg-gray-50'
                                        }`}
                                        onClick={() => {
                                          if (isSelected) {
                                            setSelectedStudentsForIslamicStudies(selectedStudentsForIslamicStudies.filter(id => id !== student.id))
                                          } else {
                                            setSelectedStudentsForIslamicStudies([...selectedStudentsForIslamicStudies, student.id])
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
                                          <p className="font-medium text-sm">
                                            {student.first_name} {student.last_name}
                                          </p>
                                          <p className="text-xs text-gray-600">
                                            {student.grade} • {student.program ? `Program ${student.program}` : 'No Program'}
                                            {student.quran_level && ` • ${student.quran_level}`}
                                          </p>
                                        </div>
                                      </div>
                                    )
                                  })}
                                {students.filter((s) => {
                                  if (islamicStudiesStudents.some((iss: any) => iss.id === s.id)) return false
                                  if (assignmentProgramFilter !== 'all') {
                                    if (assignmentProgramFilter === 'none' && s.program) return false
                                    if (assignmentProgramFilter !== 'none' && s.program !== assignmentProgramFilter) return false
                                  }
                                  if (assignmentGradeFilter !== 'all' && s.grade !== assignmentGradeFilter) return false
                                  if (assignmentQuranLevelFilter !== 'all' && s.quran_level !== assignmentQuranLevelFilter) return false
                                  return true
                                }).length === 0 && (
                                  <p className="text-sm text-gray-500 py-4 text-center">No students available to assign.</p>
                                )}
                              </div>
                              <Button
                                onClick={handleAssignIslamicStudiesStudents}
                                disabled={selectedStudentsForIslamicStudies.length === 0 || loading}
                                className="w-full mt-2"
                                size="sm"
                              >
                                Assign {selectedStudentsForIslamicStudies.length} Student{selectedStudentsForIslamicStudies.length !== 1 ? 's' : ''} for Islamic Studies
                              </Button>
                            </div>
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div className="flex-1 w-full sm:max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search students by name, grade, or parent..."
                      value={studentsSearchTerm}
                      onChange={(e) => setStudentsSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCSVImportDialog(true)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4 rotate-180" />
                    Import CSV
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleExportStudents}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
              {/* Students List with Payment Status */}
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>All Students</CardTitle>
                    <CardDescription>
                      View all students and their term fee payment status
                    </CardDescription>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>Filter by Program</Label>
                      <Select value={programFilter} onValueChange={setProgramFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Programs" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Programs</SelectItem>
                          <SelectItem value="A">Program A</SelectItem>
                          <SelectItem value="B">Program B</SelectItem>
                          <SelectItem value="none">Not Set</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Filter by Grade</Label>
                      <Select value={studentsGradeFilter} onValueChange={setStudentsGradeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Grades" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Grades</SelectItem>
                          <SelectItem value="Prep">Prep</SelectItem>
                          <SelectItem value="Grade 1">Grade 1</SelectItem>
                          <SelectItem value="Grade 2">Grade 2</SelectItem>
                          <SelectItem value="Grade 3">Grade 3</SelectItem>
                          <SelectItem value="Grade 4">Grade 4</SelectItem>
                          <SelectItem value="Grade 5">Grade 5</SelectItem>
                          <SelectItem value="Grade 6">Grade 6</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Filter by Quran Level</Label>
                      <Select value={studentsQuranLevelFilter} onValueChange={setStudentsQuranLevelFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="Iqra 1">Iqra 1</SelectItem>
                          <SelectItem value="Iqra 2">Iqra 2</SelectItem>
                          <SelectItem value="Iqra 3">Iqra 3</SelectItem>
                          <SelectItem value="Iqra 4">Iqra 4</SelectItem>
                          <SelectItem value="Iqra 5">Iqra 5</SelectItem>
                          <SelectItem value="Iqra 6">Iqra 6</SelectItem>
                          <SelectItem value="Quran">Quran</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Filter by Payment Status</Label>
                      <Select value={studentsPaymentFilter} onValueChange={setStudentsPaymentFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Students" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Students</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="unpaid">Unpaid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {students
                      .filter((student) => {
                        // Search filter
                        if (studentsSearchTerm) {
                          const search = studentsSearchTerm.toLowerCase()
                          const studentName = `${student.first_name} ${student.last_name}`.toLowerCase()
                          const parent = parents.find(p => p.id === student.parent_id)
                          const parentName = parent ? `${parent.parent1_first_name} ${parent.parent1_last_name}`.toLowerCase() : ''
                          const parentEmail = parent?.parent1_email?.toLowerCase() || ''
                          if (!studentName.includes(search) && !student.grade.toLowerCase().includes(search) && 
                              !parentName.includes(search) && !parentEmail.includes(search)) {
                            return false
                          }
                        }
                        // Other filters
                        if (programFilter !== 'all') {
                          if (programFilter === 'none' && student.program) return false
                          if (programFilter !== 'none' && student.program !== programFilter) return false
                        }
                        if (studentsGradeFilter !== 'all' && student.grade !== studentsGradeFilter) return false
                        if (studentsQuranLevelFilter !== 'all' && student.quran_level !== studentsQuranLevelFilter) return false
                        if (studentsPaymentFilter !== 'all') {
                          if (studentsPaymentFilter === 'paid' && !student.hasPaidTermFees) return false
                          if (studentsPaymentFilter === 'unpaid' && student.hasPaidTermFees) return false
                        }
                        return true
                      })
                      .map((student) => {
                      const parent = parents.find(p => p.id === student.parent_id)
                      return (
                        <div key={student.id} className="border rounded-lg p-3">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <p 
                                  className="font-medium text-sm sm:text-base cursor-pointer hover:text-primary hover:underline break-words"
                                  onClick={() => handleStudentClick(student)}
                                >
                                  {student.first_name} {student.last_name}
                                </p>
                                {student.hasPaidTermFees ? (
                                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-300 text-xs">
                                    Term Fees Paid
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-300 text-xs">
                                    Term Fees Unpaid
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-gray-600 break-words">
                                {student.grade} • {student.program ? `Program ${student.program}` : 'Program Not Set'} • {parent?.parent1_first_name} {parent?.parent1_last_name}
                                {student.quran_level && ` • ${student.quran_level}`}
                              </p>
                              {student.lastPaymentDate && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Last payment: {new Date(student.lastPaymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditStudent(student)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
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
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

            </TabsContent>

            {/* Parents Tab */}
            <TabsContent value="parents" className="mt-6">
              <div className="mb-4 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
                  <div className="flex-1 w-full sm:max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search parents by name or email..."
                        value={parentsSearchTerm}
                        onChange={(e) => setParentsSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleExportParents}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
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
                <DialogContent className="w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
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
                    {/* Clear indication of who will be invoiced */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        {bulkInvoiceMode === 'all' 
                          ? '📧 Invoicing: ALL parents with Stripe customer IDs'
                          : `📧 Invoicing: ${selectedParentsForInvoice.length} selected parent(s)`
                        }
                      </p>
                      {bulkInvoiceMode === 'selected' && (
                        <p className="text-xs text-blue-700 mt-1">
                          Only the parents you selected will receive invoices.
                        </p>
                      )}
                      {bulkInvoiceMode === 'all' && (
                        <p className="text-xs text-blue-700 mt-1">
                          All parents who have a Stripe customer ID will receive invoices.
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>What to Invoice For</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="invoice-term-fees"
                              checked={bulkInvoiceTermFees}
                              onCheckedChange={(checked) => setBulkInvoiceTermFees(checked === true)}
                            />
                            <Label htmlFor="invoice-term-fees" className="cursor-pointer">
                              Term Fees (per student)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="invoice-books"
                              checked={bulkInvoiceBooks}
                              onCheckedChange={(checked) => setBulkInvoiceBooks(checked === true)}
                            />
                            <Label htmlFor="invoice-books" className="cursor-pointer">
                              Books
                            </Label>
                          </div>
                        </div>
                        {!bulkInvoiceTermFees && !bulkInvoiceBooks && (
                          <p className="text-xs text-red-600 mt-1">
                            Please select at least one item to invoice for.
                          </p>
                        )}
                      </div>
                      
                      {/* Student Selection - only show if term fees are selected */}
                      {bulkInvoiceTermFees && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 mb-2">
                            <Checkbox
                              id="invoice-all-students"
                              checked={bulkInvoiceAllStudents}
                              onCheckedChange={(checked) => {
                                setBulkInvoiceAllStudents(checked === true)
                                if (checked) {
                                  setBulkInvoiceSelectedStudents({}) // Clear selections
                                }
                              }}
                            />
                            <Label htmlFor="invoice-all-students" className="cursor-pointer">
                              Invoice all students for each parent
                            </Label>
                          </div>
                          {!bulkInvoiceAllStudents && (
                            <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                              <Label className="text-sm font-medium">Select Students to Invoice</Label>
                              <p className="text-xs text-gray-500 mb-2">
                                {bulkInvoiceMode === 'all' 
                                  ? 'Select which students to invoice for each parent. If a parent is not expanded, all their students will be invoiced.'
                                  : 'Select which students to invoice for the selected parents.'
                                }
                              </p>
                              {bulkInvoiceMode === 'selected' ? (
                                // Show students for selected parents only
                                selectedParentsForInvoice.map((parentId) => {
                                  const parent = parents.find(p => p.id === parentId)
                                  const parentStudents = students.filter(s => s.parent_id === parentId)
                                  const selectedForParent = bulkInvoiceSelectedStudents[parentId] || []
                                  
                                  return (
                                    <div key={parentId} className="border-b pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
                                      <p className="font-medium text-sm mb-2">
                                        {parent?.parent1_first_name} {parent?.parent1_last_name}
                                      </p>
                                      <div className="space-y-1 pl-4">
                                        {parentStudents.map((student) => {
                                          const isSelected = selectedForParent.includes(student.id)
                                          return (
                                            <div
                                              key={student.id}
                                              className="flex items-center space-x-2 p-1 rounded hover:bg-gray-50 cursor-pointer"
                                              onClick={() => {
                                                const current = bulkInvoiceSelectedStudents[parentId] || []
                                                if (isSelected) {
                                                  setBulkInvoiceSelectedStudents({
                                                    ...bulkInvoiceSelectedStudents,
                                                    [parentId]: current.filter(id => id !== student.id)
                                                  })
                                                } else {
                                                  setBulkInvoiceSelectedStudents({
                                                    ...bulkInvoiceSelectedStudents,
                                                    [parentId]: [...current, student.id]
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
                                              <span className="text-sm">
                                                {student.first_name} {student.last_name} ({student.grade})
                                              </span>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  )
                                })
                              ) : (
                                <p className="text-sm text-gray-500 text-center py-4">
                                  Student selection is only available when invoicing selected parents.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
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
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Invoice emails will be sent automatically to all parents. 
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
                          
                          // Validate that at least one item is selected
                          if (!bulkInvoiceTermFees && !bulkInvoiceBooks) {
                            toast({
                              title: 'Error',
                              description: 'Please select at least one item to invoice for (Term Fees or Books).',
                              variant: 'destructive',
                            })
                            return
                          }
                          
                          // Validate student selection if term fees are selected and not invoicing all students
                          if (bulkInvoiceTermFees && !bulkInvoiceAllStudents && bulkInvoiceMode === 'selected') {
                            const hasSelectedStudents = selectedParentsForInvoice.some(
                              parentId => (bulkInvoiceSelectedStudents[parentId] || []).length > 0
                            )
                            if (!hasSelectedStudents) {
                              toast({
                                title: 'Error',
                                description: 'Please select at least one student to invoice for term fees.',
                                variant: 'destructive',
                              })
                              return
                            }
                          }
                          
                          setBulkInvoiceLoading(true)
                          try {
                            const requestBody: any = {
                              daysUntilDue: bulkInvoiceDays,
                              sendEmails: true, // Always send emails
                              invoiceTermFees: bulkInvoiceTermFees,
                              invoiceBooks: bulkInvoiceBooks,
                              invoiceAllStudents: bulkInvoiceAllStudents,
                            }
                            
                            // Add parent IDs if invoicing selected parents
                            if (bulkInvoiceMode === 'selected') {
                              requestBody.parentIds = selectedParentsForInvoice
                              // Add student selections if not invoicing all students
                              if (!bulkInvoiceAllStudents) {
                                requestBody.studentSelections = bulkInvoiceSelectedStudents
                              }
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

                            const data = await response.json()
                            
                            // Check for error response (either from non-ok status or error field)
                            if (!response.ok || data.error) {
                              toast({
                                title: 'Error',
                                description: data.error || `Failed to create invoices (${response.status})`,
                                variant: 'destructive',
                              })
                              console.error('Bulk invoice error:', data)
                            } else if (data.failed && data.failed.length > 0) {
                              // Get the first error message to show
                              const firstError = data.results?.failed?.[0] || data.failed?.[0]
                              const errorMessage = firstError?.error || 'Unknown error'
                              const parentName = firstError?.parentName || 'Unknown parent'
                              
                              toast({
                                title: data.succeeded > 0 ? 'Partial Success' : 'Error',
                                description: data.succeeded > 0 
                                  ? `Created ${data.succeeded} invoice(s) successfully. ${data.failed.length} failed. First error: ${parentName} - ${errorMessage}`
                                  : `Failed to create invoices. Error: ${parentName} - ${errorMessage}`,
                                variant: data.succeeded > 0 ? 'default' : 'destructive',
                              })
                              console.log('Failed invoices:', data.results?.failed || data.failed)
                            } else {
                              toast({
                                title: 'Success',
                                description: `Successfully created ${data.succeeded || 0} invoice(s) for ${data.total || 0} parent(s).`,
                              })
                            }
                            
                            // Log full response for debugging
                            console.log('Bulk invoice response:', data)
                            
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
                    {parents
                      .filter((parent) => {
                        if (parentsSearchTerm) {
                          const search = parentsSearchTerm.toLowerCase()
                          const name = `${parent.parent1_first_name} ${parent.parent1_last_name}`.toLowerCase()
                          const email = parent.parent1_email.toLowerCase()
                          return name.includes(search) || email.includes(search)
                        }
                        return true
                      })
                      .map((parent) => {
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
                                  handleEditParent(parent)
                                }}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setPasswordResetEmail(parent.parent1_email)
                                  setShowPasswordResetDialog(true)
                                }}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Reset Password"
                              >
                                <KeyRound className="h-4 w-4" />
                              </Button>
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

                    <Tabs defaultValue="profile" className="w-full mt-4">
                      <TabsList className="flex-wrap h-auto w-full gap-1">
                        <TabsTrigger value="profile" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                          <UserCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Profile</span>
                        </TabsTrigger>
                        <TabsTrigger value="attendance" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Attendance</span>
                          <span className="sm:hidden">({studentAttendance.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="homework" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Homework</span>
                          <span className="sm:hidden">({studentHomework.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="behavior" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Behavior</span>
                          <span className="sm:hidden">({studentBehaviorNotes.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="notes" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Notes</span>
                          <span className="sm:hidden">({studentNotes.length})</span>
                        </TabsTrigger>
                      </TabsList>

                      {/* Profile Tab */}
                      <TabsContent value="profile" className="mt-6 space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <User className="h-5 w-5 text-primary" />
                              Parent Contact Information
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {studentParentInfo ? (
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm text-gray-600">Parent Name</p>
                                  <p className="font-medium">{studentParentInfo.first_name} {studentParentInfo.last_name}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">Email</p>
                                  <p className="font-medium">{studentParentInfo.email}</p>
                                </div>
                                {studentParentInfo.mobile && (
                                  <div>
                                    <p className="text-sm text-gray-600">Phone Number</p>
                                    <p className="font-medium">{studentParentInfo.mobile}</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-500">Parent information not available.</p>
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

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
              <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
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

            {/* Edit Student Dialog */}
            <Dialog open={showEditStudentDialog} onOpenChange={setShowEditStudentDialog}>
              <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Student</DialogTitle>
                  <DialogDescription>
                    Update student information
                  </DialogDescription>
                </DialogHeader>
                {editingStudent && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>First Name *</Label>
                      <Input
                        value={editingStudent.first_name}
                        onChange={(e) => setEditingStudent({ ...editingStudent, first_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name *</Label>
                      <Input
                        value={editingStudent.last_name}
                        onChange={(e) => setEditingStudent({ ...editingStudent, last_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Grade *</Label>
                      <Select
                        value={editingStudent.grade}
                        onValueChange={(value) => setEditingStudent({ ...editingStudent, grade: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Prep">Prep</SelectItem>
                          <SelectItem value="Grade 1">Grade 1</SelectItem>
                          <SelectItem value="Grade 2">Grade 2</SelectItem>
                          <SelectItem value="Grade 3">Grade 3</SelectItem>
                          <SelectItem value="Grade 4">Grade 4</SelectItem>
                          <SelectItem value="Grade 5">Grade 5</SelectItem>
                          <SelectItem value="Grade 6">Grade 6</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Program</Label>
                      <Select
                        value={editingStudent.program || 'none'}
                        onValueChange={(value) => setEditingStudent({ ...editingStudent, program: value === 'none' ? null : value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not Set</SelectItem>
                          <SelectItem value="A">Program A</SelectItem>
                          <SelectItem value="B">Program B</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Quran Level (Simple)</Label>
                      <Select
                        value={quranLevelSimple || 'none'}
                        onValueChange={(value) => setQuranLevelSimple(value === 'none' ? '' : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Quran Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Not Set</SelectItem>
                          <SelectItem value="Iqra 1">Iqra 1</SelectItem>
                          <SelectItem value="Iqra 2">Iqra 2</SelectItem>
                          <SelectItem value="Iqra 3">Iqra 3</SelectItem>
                          <SelectItem value="Iqra 4">Iqra 4</SelectItem>
                          <SelectItem value="Iqra 5">Iqra 5</SelectItem>
                          <SelectItem value="Iqra 6">Iqra 6</SelectItem>
                          <SelectItem value="Quran">Quran</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">This updates the quran_level column directly</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Quran/Iqra Progress (Detailed)</Label>
                      <Select value={quranType} onValueChange={(v: 'iqra' | 'quran') => setQuranType(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="iqra">Iqra</SelectItem>
                          <SelectItem value="quran">Quran (Surah & Ayah)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {quranType === 'iqra' ? (
                      <>
                        <div className="space-y-2">
                          <Label>Iqra Level (1-6)</Label>
                          <Select value={quranLevel || 'none'} onValueChange={(v) => setQuranLevel(v === 'none' ? '' : v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Iqra level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Level 1</SelectItem>
                              <SelectItem value="2">Level 2</SelectItem>
                              <SelectItem value="3">Level 3</SelectItem>
                              <SelectItem value="4">Level 4</SelectItem>
                              <SelectItem value="5">Level 5</SelectItem>
                              <SelectItem value="6">Level 6</SelectItem>
                              <SelectItem value="none">Clear</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Page (1-30)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="30"
                            value={quranPage}
                            onChange={(e) => setQuranPage(e.target.value)}
                            placeholder="Enter page number (1-30)"
                          />
                          <p className="text-xs text-gray-500">Each Iqra level has 30 pages</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label>Surah</Label>
                          <Select 
                            value={quranSurah || ''} 
                            onValueChange={(v) => {
                              setQuranSurah(v)
                              setQuranAyah('')
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Surah" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              {SURAHS.map((surah) => (
                                <SelectItem key={surah.number} value={surah.name}>
                                  {surah.number}. {surah.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Ayah (Verse)</Label>
                          {quranSurah && (() => {
                            const selectedSurah = SURAHS.find(s => s.name === quranSurah)
                            if (!selectedSurah) return null
                            
                            return (
                              <Select 
                                value={quranAyah || ''} 
                                onValueChange={setQuranAyah}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Ayah" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                  {Array.from({ length: selectedSurah.ayahs }, (_, i) => i + 1).map((ayah) => (
                                    <SelectItem key={ayah} value={ayah.toString()}>
                                      {ayah}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )
                          })()}
                          {!quranSurah && (
                            <Input
                              type="text"
                              value={quranAyah}
                              placeholder="Select Surah first"
                              disabled
                            />
                          )}
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label>Behavior Standing</Label>
                      <Select value={behaviorStanding || 'none'} onValueChange={(v) => setBehaviorStanding(v === 'none' ? '' : v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select behavior standing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="satisfactory">Satisfactory</SelectItem>
                          <SelectItem value="needs_improvement">Needs Improvement</SelectItem>
                          <SelectItem value="concern">Concern</SelectItem>
                          <SelectItem value="none">Clear (Not Set)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowEditStudentDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveStudent} disabled={!editingStudent.first_name || !editingStudent.last_name || !editingStudent.grade}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Edit Parent Dialog */}
            <Dialog open={showEditParentDialog} onOpenChange={setShowEditParentDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Parent</DialogTitle>
                  <DialogDescription>
                    Update parent information
                  </DialogDescription>
                </DialogHeader>
                {editingParent && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>First Name *</Label>
                      <Input
                        value={editingParent.parent1_first_name}
                        onChange={(e) => setEditingParent({ ...editingParent, parent1_first_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name *</Label>
                      <Input
                        value={editingParent.parent1_last_name}
                        onChange={(e) => setEditingParent({ ...editingParent, parent1_last_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={editingParent.parent1_email}
                        onChange={(e) => setEditingParent({ ...editingParent, parent1_email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mobile</Label>
                      <Input
                        value={editingParent.parent1_mobile || ''}
                        onChange={(e) => setEditingParent({ ...editingParent, parent1_mobile: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowEditParentDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveParent} disabled={!editingParent.parent1_first_name || !editingParent.parent1_last_name || !editingParent.parent1_email}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Edit Teacher Dialog */}
            <Dialog open={showEditTeacherDialog} onOpenChange={setShowEditTeacherDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Teacher</DialogTitle>
                  <DialogDescription>
                    Update teacher information
                  </DialogDescription>
                </DialogHeader>
                {editingTeacher && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>First Name *</Label>
                      <Input
                        value={editingTeacher.first_name}
                        onChange={(e) => setEditingTeacher({ ...editingTeacher, first_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name *</Label>
                      <Input
                        value={editingTeacher.last_name}
                        onChange={(e) => setEditingTeacher({ ...editingTeacher, last_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={editingTeacher.email}
                        onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Mobile</Label>
                      <Input
                        value={editingTeacher.mobile || ''}
                        onChange={(e) => setEditingTeacher({ ...editingTeacher, mobile: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowEditTeacherDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveTeacher} disabled={!editingTeacher.first_name || !editingTeacher.last_name || !editingTeacher.email}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Password Reset Dialog */}
            <Dialog open={showPasswordResetDialog} onOpenChange={setShowPasswordResetDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Password</DialogTitle>
                  <DialogDescription>
                    Reset password for a user account
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Email Address *</Label>
                    <Input
                      type="email"
                      value={passwordResetEmail}
                      onChange={(e) => setPasswordResetEmail(e.target.value)}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password *</Label>
                    <Input
                      type="password"
                      value={passwordResetNewPassword}
                      onChange={(e) => setPasswordResetNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                      setShowPasswordResetDialog(false)
                      setPasswordResetEmail('')
                      setPasswordResetNewPassword('')
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={handleResetPassword} disabled={resettingPassword || !passwordResetEmail || !passwordResetNewPassword || passwordResetNewPassword.length < 6}>
                      {resettingPassword ? 'Resetting...' : 'Reset Password'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Payment Dialog */}
            <Dialog open={showEditPaymentDialog} onOpenChange={setShowEditPaymentDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Payment</DialogTitle>
                  <DialogDescription>
                    Update payment information
                  </DialogDescription>
                </DialogHeader>
                {editingPayment && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Amount *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editingPayment.amount}
                        onChange={(e) => setEditingPayment({ ...editingPayment, amount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status *</Label>
                      <Select
                        value={editingPayment.status}
                        onValueChange={(value) => setEditingPayment({ ...editingPayment, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="succeeded">Succeeded</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                          <SelectItem value="trial_active">Trial Active</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="paid_term_fees"
                          checked={editingPayment.paid_term_fees}
                          onCheckedChange={(checked) => setEditingPayment({ ...editingPayment, paid_term_fees: checked === true })}
                        />
                        <Label htmlFor="paid_term_fees" className="cursor-pointer">Paid Term Fees</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="paid_for_books"
                          checked={editingPayment.paid_for_books}
                          onCheckedChange={(checked) => setEditingPayment({ ...editingPayment, paid_for_books: checked === true })}
                        />
                        <Label htmlFor="paid_for_books" className="cursor-pointer">Paid for Books</Label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowEditPaymentDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSavePayment}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* CSV Import Dialog */}
            <Dialog open={showCSVImportDialog} onOpenChange={setShowCSVImportDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Data from CSV</DialogTitle>
                  <DialogDescription>
                    Upload a CSV file to import parent and student data. The CSV should match the expected format.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>CSV File *</Label>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setCsvFile(file)
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500">
                      Select a CSV file containing parent and student data.
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                      setShowCSVImportDialog(false)
                      setCsvFile(null)
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={handleCSVImport} disabled={!csvFile || importingCSV}>
                      {importingCSV ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        'Import CSV'
                      )}
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

