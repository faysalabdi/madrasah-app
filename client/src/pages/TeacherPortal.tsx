import React, { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trash2, Calendar, BookOpen, FileText, UserCheck, Plus, CheckCircle2, AlertCircle, Award, TrendingUp, Circle, User, LogOut, Settings, MessageCircle, Send, Reply } from 'lucide-react'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell, Legend } from 'recharts'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'

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

interface Teacher {
  id: number
  first_name: string
  last_name: string
  email: string
  mobile: string | null
}

interface Student {
  id: number
  student_id: string | null
  first_name: string
  last_name: string
  grade: string
  date_of_birth: string | null
  gender: string | null
  current_school: string | null
  program: string | null
  quran_level: string | null
  quran_page: number | null
  quran_surah: string | null
  quran_ayah: string | null
  behavior_standing: string | null
  parent_id: number
}

interface Attendance {
  id: number
  student_id: number
  date: string
  status: 'present_with_uniform' | 'present_no_uniform' | 'late_uniform' | 'late_no_uniform' | 'absent_with_excuse' | 'absent_no_excuse'
  notes: string | null
}

interface BehaviorNote {
  id: number
  student_id: number
  date: string
  type: 'positive' | 'concern' | 'incident'
  title: string
  description: string
}

interface Homework {
  id: number
  student_id: number
  title: string
  description: string | null
  assigned_date: string
  due_date: string | null
  completed: boolean
  completion_date: string | null
  notes: string | null
}

interface StudentNote {
  id: number
  student_id: number
  note: string
  created_at: string
}

const TeacherPortal: React.FC = () => {
  const [, setLocation] = useLocation()
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [quranStudents, setQuranStudents] = useState<Student[]>([])
  const [islamicStudiesStudents, setIslamicStudiesStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [programFilter, setProgramFilter] = useState<string>('all') // 'all', 'A', 'B', 'none'
  const [activeTab, setActiveTab] = useState<string>('my-students') // 'my-students', 'all-teachers', or 'absence-notes'
  
  // Student assignment
  const [showAssignStudentsDialog, setShowAssignStudentsDialog] = useState(false)
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [selectedStudentsForQuran, setSelectedStudentsForQuran] = useState<number[]>([])
  const [selectedStudentsForIslamicStudies, setSelectedStudentsForIslamicStudies] = useState<number[]>([])
  const [assignProgramFilter, setAssignProgramFilter] = useState<string>('all')
  const [assignGradeFilter, setAssignGradeFilter] = useState<string>('all')
  const [assignQuranLevelFilter, setAssignQuranLevelFilter] = useState<string>('all')
  const [quranAssignedStudentIds, setQuranAssignedStudentIds] = useState<Set<number>>(new Set())
  const [islamicStudiesAssignedStudentIds, setIslamicStudiesAssignedStudentIds] = useState<Set<number>>(new Set())
  
  // All teachers view
  const [allTeachers, setAllTeachers] = useState<any[]>([])
  const [selectedTeacherForView, setSelectedTeacherForView] = useState<any | null>(null)
  const [showTeacherViewDialog, setShowTeacherViewDialog] = useState(false)
  const [teacherViewQuranStudents, setTeacherViewQuranStudents] = useState<Student[]>([])
  const [teacherViewIslamicStudiesStudents, setTeacherViewIslamicStudiesStudents] = useState<Student[]>([])
  
  // Absence notes
  const [absenceNotes, setAbsenceNotes] = useState<any[]>([])
  const [showAbsenceNoteDialog, setShowAbsenceNoteDialog] = useState(false)
  const [absenceDate, setAbsenceDate] = useState('')
  const [absenceReason, setAbsenceReason] = useState('')
  const [absenceNoteText, setAbsenceNoteText] = useState('')
  const [loadingAbsenceNotes, setLoadingAbsenceNotes] = useState(false)
  
  // Bulk attendance
  const [showBulkAttendanceDialog, setShowBulkAttendanceDialog] = useState(false)
  const [bulkAttendanceDate, setBulkAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [bulkAttendanceRecords, setBulkAttendanceRecords] = useState<{ [studentId: number]: string }>({})
  const [bulkAttendanceNotes, setBulkAttendanceNotes] = useState<{ [studentId: number]: string }>({})
  const [savingBulkAttendance, setSavingBulkAttendance] = useState(false)
  
  // Student detail data
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [behaviorNotes, setBehaviorNotes] = useState<BehaviorNote[]>([])
  const [homework, setHomework] = useState<Homework[]>([])
  const [studentNotes, setStudentNotes] = useState<StudentNote[]>([])
  const [classContent, setClassContent] = useState<any[]>([])
  const [loadingStudentDetails, setLoadingStudentDetails] = useState(false)
  const [parentInfo, setParentInfo] = useState<{ first_name: string; last_name: string; email: string; mobile: string | null } | null>(null)
  
  // Dialog states
  const [showStudentDetail, setShowStudentDetail] = useState(false)
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false)
  const [showBehaviorDialog, setShowBehaviorDialog] = useState(false)
  const [showHomeworkDialog, setShowHomeworkDialog] = useState(false)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [showClassContentDialog, setShowClassContentDialog] = useState(false)
  
  // Form states
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceStatus, setAttendanceStatus] = useState<'present_with_uniform' | 'present_no_uniform' | 'late_uniform' | 'late_no_uniform' | 'absent_with_excuse' | 'absent_no_excuse'>('present_with_uniform')
  const [attendanceNotes, setAttendanceNotes] = useState('')
  
  const [behaviorType, setBehaviorType] = useState<'positive' | 'concern' | 'incident'>('positive')
  const [behaviorTitle, setBehaviorTitle] = useState('')
  const [behaviorDescription, setBehaviorDescription] = useState('')
  
  const [homeworkTitle, setHomeworkTitle] = useState('')
  const [homeworkDescription, setHomeworkDescription] = useState('')
  const [homeworkDueDate, setHomeworkDueDate] = useState('')
  
  const [classContentDate, setClassContentDate] = useState(new Date().toISOString().split('T')[0])
  const [classContentSubject, setClassContentSubject] = useState<'quran' | 'islamic_studies'>('quran')
  const [classContentSubSubject, setClassContentSubSubject] = useState<'surah_and_dua' | 'fiqh' | 'islamic_curriculum' | ''>('')
  const [classContentText, setClassContentText] = useState('')
  const [classContentLabel, setClassContentLabel] = useState<'needs_revision' | 'exam_content' | 'important' | 'completed' | ''>('')
  
  const [noteText, setNoteText] = useState('')
  
  // Student profile editing
  const [showProfileEditDialog, setShowProfileEditDialog] = useState(false)
  const [quranType, setQuranType] = useState<'iqra' | 'quran'>('iqra')
  const [quranLevel, setQuranLevel] = useState<string>('')
  const [quranPage, setQuranPage] = useState<string>('')
  const [quranSurah, setQuranSurah] = useState<string>('')
  const [quranAyah, setQuranAyah] = useState<string>('')
  const [behaviorStanding, setBehaviorStanding] = useState<string>('')
  
  // Password change
  const [showPasswordChangeDialog, setShowPasswordChangeDialog] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  
  // Messaging state
  const [messages, setMessages] = useState<any[]>([])
  const [replyText, setReplyText] = useState('')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [sendingReply, setSendingReply] = useState(false)

  // Term selection
  const [terms, setTerms] = useState<any[]>([])
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null)
  const [currentTermId, setCurrentTermId] = useState<number | null>(null)
  
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      let teacherId = localStorage.getItem('teacherId') || sessionStorage.getItem('teacherId')
      
      if (!teacherId) {
        setLocation('/portal')
        return
      }
      
      // Sync to both for compatibility
      if (!sessionStorage.getItem('teacherId')) {
        sessionStorage.setItem('teacherId', teacherId)
      }
      if (!localStorage.getItem('teacherId')) {
        localStorage.setItem('teacherId', teacherId)
      }

      loadTeacherData(parseInt(teacherId))
    }

    checkAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (!session && !localStorage.getItem('teacherId'))) {
        setLocation('/portal')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setLocation])

  const loadTeacherData = async (teacherId: number) => {
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

      // Load teacher data
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', teacherId)
        .single()

      if (teacherError) throw teacherError
      setTeacher(teacherData)

      // Load Quran students (where this teacher is the Quran teacher)
      const { data: quranTeacherStudents, error: quranStudentsError } = await supabase
        .from('teacher_students')
        .select(`
          student_id,
          students (
            id,
            student_id,
            first_name,
            last_name,
            grade,
            date_of_birth,
            gender,
            current_school,
            program,
            quran_level,
            quran_page,
            quran_surah,
            quran_ayah,
            behavior_standing,
            parent_id
          )
        `)
        .eq('quran_teacher_id', teacherId)

      if (quranStudentsError) throw quranStudentsError
      
      // Load Islamic Studies students (where this teacher is the Islamic Studies teacher)
      const { data: islamicStudiesTeacherStudents, error: islamicStudiesStudentsError } = await supabase
        .from('teacher_students')
        .select(`
          student_id,
          students (
            id,
            student_id,
            first_name,
            last_name,
            grade,
            date_of_birth,
            gender,
            current_school,
            program,
            quran_level,
            quran_page,
            quran_surah,
            quran_ayah,
            behavior_standing,
            parent_id
          )
        `)
        .eq('islamic_studies_teacher_id', teacherId)

      if (islamicStudiesStudentsError) throw islamicStudiesStudentsError
      
      // Extract students from the join results
      const quranStudentList = (quranTeacherStudents || [])
        .map((ts: any) => ts.students)
        .filter(Boolean)
      
      const islamicStudiesStudentList = (islamicStudiesTeacherStudents || [])
        .map((ts: any) => ts.students)
        .filter(Boolean)
      
      setQuranStudents(quranStudentList)
      setIslamicStudiesStudents(islamicStudiesStudentList)
      
      // Load all teachers for the "All Teachers" view
      await loadAllTeachers()
      
      // Load absence notes
      await loadAbsenceNotes()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teacher data')
    } finally {
      setLoading(false)
    }
  }
  
  const loadAbsenceNotes = async () => {
    try {
      setLoadingAbsenceNotes(true)
      const { data, error } = await supabase
        .from('teacher_absence_notes')
        .select(`
          *,
          teachers (id, first_name, last_name)
        `)
        .order('absence_date', { ascending: true })
        .gte('absence_date', new Date().toISOString().split('T')[0]) // Only show future absences
      
      if (error) throw error
      setAbsenceNotes(data || [])
    } catch (err) {
      console.error('Error loading absence notes:', err)
    } finally {
      setLoadingAbsenceNotes(false)
    }
  }
  
  const handleCreateAbsenceNote = async () => {
    if (!teacher || !absenceDate || !absenceNoteText) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    try {
      const { error } = await supabase
        .from('teacher_absence_notes')
        .insert({
          teacher_id: teacher.id,
          absence_date: absenceDate,
          reason: absenceReason || null,
          notes: absenceNoteText,
        })

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Absence note created successfully.',
      })

      setShowAbsenceNoteDialog(false)
      setAbsenceDate('')
      setAbsenceReason('')
      setAbsenceNoteText('')
      await loadAbsenceNotes()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create absence note',
        variant: 'destructive',
      })
    }
  }
  
  const handleDeleteAbsenceNote = async (noteId: number) => {
    if (!teacher || !confirm('Are you sure you want to delete this absence note?')) return

    try {
      const { error } = await supabase
        .from('teacher_absence_notes')
        .delete()
        .eq('id', noteId)
        .eq('teacher_id', teacher.id) // Only allow deleting own notes

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Absence note deleted successfully.',
      })

      await loadAbsenceNotes()
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete absence note',
        variant: 'destructive',
      })
    }
  }

  const loadAllStudents = async () => {
    if (!teacher) return
    
    try {
      // Load all students
      const { data, error } = await supabase
        .from('students')
        .select('id, first_name, last_name, grade, program, quran_level')
        .order('first_name')
      
      if (error) throw error
      
      // Load current assignments to filter out already-assigned students
      const { data: currentAssignments } = await supabase
        .from('teacher_students')
        .select('student_id, quran_teacher_id, islamic_studies_teacher_id')
        .eq('quran_teacher_id', teacher.id)
        .or(`islamic_studies_teacher_id.eq.${teacher.id}`)
      
      // Create sets of already-assigned student IDs
      const quranAssignedIds = new Set(
        (currentAssignments || [])
          .filter(ts => ts.quran_teacher_id === teacher.id)
          .map(ts => ts.student_id)
      )
      
      const islamicStudiesAssignedIds = new Set(
        (currentAssignments || [])
          .filter(ts => ts.islamic_studies_teacher_id === teacher.id)
          .map(ts => ts.student_id)
      )
      
      // Store the assigned IDs for filtering in the dialog
      setAllStudents(data as any || [])
      // Store assigned IDs in state for use in the dialog
      setQuranAssignedStudentIds(quranAssignedIds)
      setIslamicStudiesAssignedStudentIds(islamicStudiesAssignedIds)
    } catch (err) {
      console.error('Error loading all students:', err)
    }
  }

  const loadAllTeachers = async () => {
    try {
      const { data: teachersData, error: teachersError } = await supabase
        .from('teachers')
        .select('id, first_name, last_name, email')
        .order('first_name')
      
      if (teachersError) throw teachersError
      
      // Get student counts for each teacher
      const teachersWithCounts = await Promise.all(
        (teachersData || []).map(async (t) => {
          const { count: quranCount } = await supabase
            .from('teacher_students')
            .select('*', { count: 'exact', head: true })
            .eq('quran_teacher_id', t.id)
          
          const { count: islamicStudiesCount } = await supabase
            .from('teacher_students')
            .select('*', { count: 'exact', head: true })
            .eq('islamic_studies_teacher_id', t.id)
          
          return {
            ...t,
            quran_student_count: quranCount || 0,
            islamic_studies_student_count: islamicStudiesCount || 0,
          }
        })
      )
      
      setAllTeachers(teachersWithCounts)
    } catch (err) {
      console.error('Error loading all teachers:', err)
    }
  }

  const handleAssignQuranStudents = async () => {
    if (!teacher || selectedStudentsForQuran.length === 0) return

    try {
      for (const studentId of selectedStudentsForQuran) {
        // Check if student already has a teacher_students record
        const { data: existing } = await supabase
          .from('teacher_students')
          .select('*')
          .eq('student_id', studentId)
          .maybeSingle()

        if (existing) {
          // Update existing record
          await supabase
            .from('teacher_students')
            .update({ quran_teacher_id: teacher.id })
            .eq('student_id', studentId)
        } else {
          // Create new record
          await supabase
            .from('teacher_students')
            .insert({
              student_id: studentId,
              quran_teacher_id: teacher.id,
              islamic_studies_teacher_id: null,
            })
        }
      }

      setShowAssignStudentsDialog(false)
      setSelectedStudentsForQuran([])
      setSelectedStudentsForIslamicStudies([])
      await loadTeacherData(teacher.id)
      
      toast({
        title: 'Success',
        description: `Assigned ${selectedStudentsForQuran.length} student(s) to you for Quran.`,
      })
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to assign students',
        variant: 'destructive',
      })
    }
  }

  const handleAssignIslamicStudiesStudents = async () => {
    if (!teacher || selectedStudentsForIslamicStudies.length === 0) return

    try {
      for (const studentId of selectedStudentsForIslamicStudies) {
        // Check if student already has a teacher_students record
        const { data: existing } = await supabase
          .from('teacher_students')
          .select('*')
          .eq('student_id', studentId)
          .maybeSingle()

        if (existing) {
          // Update existing record
          await supabase
            .from('teacher_students')
            .update({ islamic_studies_teacher_id: teacher.id })
            .eq('student_id', studentId)
        } else {
          // Create new record
          await supabase
            .from('teacher_students')
            .insert({
              student_id: studentId,
              quran_teacher_id: null,
              islamic_studies_teacher_id: teacher.id,
            })
        }
      }

      setShowAssignStudentsDialog(false)
      setSelectedStudentsForQuran([])
      setSelectedStudentsForIslamicStudies([])
      await loadTeacherData(teacher.id)
      
      toast({
        title: 'Success',
        description: `Assigned ${selectedStudentsForIslamicStudies.length} student(s) to you for Islamic Studies.`,
      })
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to assign students',
        variant: 'destructive',
      })
    }
  }

  const handleUnassignQuranStudent = async (studentId: number) => {
    if (!teacher || !confirm('Are you sure you want to unassign this student from Quran?')) return

    try {
      // Check if student has Islamic Studies teacher
      const { data: existing } = await supabase
        .from('teacher_students')
        .select('*')
        .eq('student_id', studentId)
        .maybeSingle()

      if (existing) {
        if (existing.islamic_studies_teacher_id) {
          // Update to remove only Quran teacher
          await supabase
            .from('teacher_students')
            .update({ quran_teacher_id: null })
            .eq('student_id', studentId)
        } else {
          // Delete the entire record if no Islamic Studies teacher
          await supabase
            .from('teacher_students')
            .delete()
            .eq('student_id', studentId)
        }
      }

      await loadTeacherData(teacher.id)
      
      toast({
        title: 'Success',
        description: 'Student unassigned from Quran.',
      })
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to unassign student',
        variant: 'destructive',
      })
    }
  }

  const handleUnassignIslamicStudiesStudent = async (studentId: number) => {
    if (!teacher || !confirm('Are you sure you want to unassign this student from Islamic Studies?')) return

    try {
      // Check if student has Quran teacher
      const { data: existing } = await supabase
        .from('teacher_students')
        .select('*')
        .eq('student_id', studentId)
        .maybeSingle()

      if (existing) {
        if (existing.quran_teacher_id) {
          // Update to remove only Islamic Studies teacher
          await supabase
            .from('teacher_students')
            .update({ islamic_studies_teacher_id: null })
            .eq('student_id', studentId)
        } else {
          // Delete the entire record if no Quran teacher
          await supabase
            .from('teacher_students')
            .delete()
            .eq('student_id', studentId)
        }
      }

      await loadTeacherData(teacher.id)
      
      toast({
        title: 'Success',
        description: 'Student unassigned from Islamic Studies.',
      })
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to unassign student',
        variant: 'destructive',
      })
    }
  }

  const handleTeacherViewClick = async (teacherData: any) => {
    setSelectedTeacherForView(teacherData)
    setShowTeacherViewDialog(true)
    
    try {
      // Load Quran students
      const { data: quranData } = await supabase
        .from('teacher_students')
        .select(`
          student_id,
          students (
            id,
            first_name,
            last_name,
            grade,
            program,
            quran_level
          )
        `)
        .eq('quran_teacher_id', teacherData.id)
      
      const quranStudentList = (quranData || [])
        .map((ts: any) => ts.students)
        .filter(Boolean)
      setTeacherViewQuranStudents(quranStudentList)

      // Load Islamic Studies students
      const { data: islamicStudiesData } = await supabase
        .from('teacher_students')
        .select(`
          student_id,
          students (
            id,
            first_name,
            last_name,
            grade,
            program,
            quran_level
          )
        `)
        .eq('islamic_studies_teacher_id', teacherData.id)
      
      const islamicStudiesStudentList = (islamicStudiesData || [])
        .map((ts: any) => ts.students)
        .filter(Boolean)
      setTeacherViewIslamicStudiesStudents(islamicStudiesStudentList)
    } catch (err) {
      console.error('Error loading teacher students:', err)
    }
  }

  const loadStudentDetails = async (studentId: number) => {
    if (!teacher) return

    try {
      setLoadingStudentDetails(true)
      
      // Reload student data to get latest quran fields and behavior_standing
      const { data: updatedStudent } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single()
      
      if (updatedStudent) {
        setSelectedStudent(updatedStudent as Student)
        // Determine if it's Iqra or Quran
        if (updatedStudent.quran_surah && updatedStudent.quran_ayah) {
          setQuranType('quran')
          setQuranSurah(updatedStudent.quran_surah)
          setQuranAyah(updatedStudent.quran_ayah)
          setQuranLevel('')
          setQuranPage('')
        } else if (updatedStudent.quran_level) {
          setQuranType('iqra')
          setQuranLevel(updatedStudent.quran_level)
          setQuranPage(updatedStudent.quran_page?.toString() || '')
          setQuranSurah('')
          setQuranAyah('')
        } else {
          setQuranType('iqra')
          setQuranLevel('')
          setQuranPage('')
          setQuranSurah('')
          setQuranAyah('')
        }
        setBehaviorStanding(updatedStudent.behavior_standing || '')
      }

      // Load attendance (filtered by selected term)
      let attendanceQuery = supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
      
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
        .eq('student_id', studentId)
      
      if (selectedTermId) {
        behaviorQuery = behaviorQuery.eq('term_id', selectedTermId)
      }
      
      const { data: behaviorData } = await behaviorQuery
        .order('date', { ascending: false })
        .limit(20)

      setBehaviorNotes(behaviorData || [])

      // Load homework (filtered by selected term)
      let homeworkQuery = supabase
        .from('homework')
        .select('*')
        .eq('student_id', studentId)
      
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
        .eq('student_id', studentId)
      
      if (selectedTermId) {
        notesQuery = notesQuery.eq('term_id', selectedTermId)
      }
      
      const { data: notesData } = await notesQuery
        .order('created_at', { ascending: false })
        .limit(20)

      setStudentNotes(notesData || [])

      // Load class content (filtered by selected term)
      let classContentQuery = supabase
        .from('class_content')
        .select('*')
        .eq('student_id', studentId)
      
      if (selectedTermId) {
        classContentQuery = classContentQuery.eq('term_id', selectedTermId)
      }
      
      const { data: classContentData } = await classContentQuery
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      setClassContent(classContentData || [])

      // Load parent information
      if (updatedStudent?.parent_id) {
        const { data: parentData } = await supabase
          .from('parents')
          .select('parent1_first_name, parent1_last_name, parent1_email, parent1_mobile')
          .eq('id', updatedStudent.parent_id)
          .single()
        
        if (parentData) {
          setParentInfo({
            first_name: parentData.parent1_first_name,
            last_name: parentData.parent1_last_name,
            email: parentData.parent1_email,
            mobile: parentData.parent1_mobile,
          })
        } else {
          setParentInfo(null)
        }
      } else {
        setParentInfo(null)
      }

      // Load messages from parents about this student
      const { data: messagesData } = await supabase
        .from('parent_teacher_messages')
        .select(`
          *,
          parent:parents(parent1_first_name, parent1_last_name)
        `)
        .eq('student_id', studentId)
        .eq('teacher_id', teacher.id)
        .order('created_at', { ascending: false })
        .limit(50)

      setMessages(messagesData || [])

      setError(null) // Clear any previous errors
    } catch (err) {
      console.error('Error loading student details:', err)
      setError(err instanceof Error ? err.message : 'Failed to load student details')
      setSelectedStudent(null) // Clear student on error
    } finally {
      setLoadingStudentDetails(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!selectedStudent) return

    try {
      const updateData: any = {}
      
      // Update Quran/Iqra fields based on type
      if (quranType === 'iqra') {
        if (quranLevel && quranLevel !== 'none' && quranPage) {
          updateData.quran_level = quranLevel
          updateData.quran_page = parseInt(quranPage)
          // Clear Quran fields
          updateData.quran_surah = null
          updateData.quran_ayah = null
        } else {
          updateData.quran_level = null
          updateData.quran_page = null
          updateData.quran_surah = null
          updateData.quran_ayah = null
        }
      } else if (quranType === 'quran') {
        if (quranSurah && quranAyah) {
          updateData.quran_surah = quranSurah
          updateData.quran_ayah = quranAyah
          // Clear Iqra fields
          updateData.quran_level = null
          updateData.quran_page = null
        } else {
          updateData.quran_surah = null
          updateData.quran_ayah = null
          updateData.quran_level = null
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
        .eq('id', selectedStudent.id)

      if (error) throw error

      setShowProfileEditDialog(false)
      loadStudentDetails(selectedStudent.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update student profile')
    }
  }

  // Send a reply to a parent message
  const handleSendReply = async (parentMessageId: number) => {
    if (!teacher || !selectedStudent || !replyText) {
      toast({
        title: "Error",
        description: "Please enter a reply message.",
        variant: "destructive",
      })
      return
    }

    try {
      setSendingReply(true)
      
      // Get the parent message to get parent_id
      const { data: parentMessage } = await supabase
        .from('parent_teacher_messages')
        .select('parent_id')
        .eq('id', parentMessageId)
        .single()

      if (!parentMessage) {
        throw new Error('Parent message not found')
      }

      const { error: insertError } = await supabase
        .from('parent_teacher_messages')
        .insert({
          student_id: selectedStudent.id,
          parent_id: parentMessage.parent_id,
          teacher_id: teacher.id,
          sender_type: 'teacher',
          subject: 'Re: Parent Inquiry',
          message: replyText,
          parent_read: false,
          teacher_read: true,
          parent_reply_to: parentMessageId,
        })

      if (insertError) throw insertError

      // Reload messages
      const { data: messagesData } = await supabase
        .from('parent_teacher_messages')
        .select(`
          *,
          parent:parents(parent1_first_name, parent1_last_name)
        `)
        .eq('student_id', selectedStudent.id)
        .eq('teacher_id', teacher.id)
        .order('created_at', { ascending: false })
        .limit(50)

      setMessages(messagesData || [])
      
      // Reset reply form
      setReplyText('')
      setReplyingTo(null)
      
      toast({
        title: "Success",
        description: "Reply sent successfully!",
      })
    } catch (err) {
      console.error('Error sending reply:', err)
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSendingReply(false)
    }
  }

  // Mark message as read
  const markMessageAsRead = async (messageId: number) => {
    try {
      await supabase
        .from('parent_teacher_messages')
        .update({ teacher_read: true })
        .eq('id', messageId)
      
      // Update local state
      setMessages(prev => 
        prev.map(m => 
          m.id === messageId ? { ...m, teacher_read: true } : m
        )
      )
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

  // Format Quran progress display
  const getQuranProgressDisplay = () => {
    if (!selectedStudent) return null

    try {
      // Check if it's Quran (has surah/ayah) or Iqra (has level/page)
      if (selectedStudent.quran_surah && selectedStudent.quran_ayah) {
        return {
          type: 'quran',
          display: `Surah ${selectedStudent.quran_surah}, Ayah ${selectedStudent.quran_ayah}`,
        }
      } else if (selectedStudent.quran_level && selectedStudent.quran_page) {
        const level = String(selectedStudent.quran_level)
        const page = Number(selectedStudent.quran_page)
        // Validate Iqra level (1-6) and page (1-30)
        if (['1', '2', '3', '4', '5', '6'].includes(level) && page >= 1 && page <= 30) {
          return {
            type: 'iqra',
            display: `Iqra Level ${level}, Page ${page}`,
          }
        }
      }
    } catch (err) {
      console.error('Error formatting Quran progress:', err)
    }

    return null
  }

  // Get attendance chart data for pie chart
  const getAttendanceChartData = () => {
    try {
      if (!selectedStudent || !attendance || attendance.length === 0) {
        return []
      }

      const chartData = [
        { name: 'Present (Uniform)', value: attendance.filter(a => a?.status === 'present_with_uniform').length, color: '#22c55e' },
        { name: 'Present (No Uniform)', value: attendance.filter(a => a?.status === 'present_no_uniform').length, color: '#eab308' },
        { name: 'Late (Uniform)', value: attendance.filter(a => a?.status === 'late_uniform').length, color: '#f97316' },
        { name: 'Late (No Uniform)', value: attendance.filter(a => a?.status === 'late_no_uniform').length, color: '#f59e0b' },
        { name: 'Absent (Excused)', value: attendance.filter(a => a?.status === 'absent_with_excuse').length, color: '#3b82f6' },
        { name: 'Absent (No Excuse)', value: attendance.filter(a => a?.status === 'absent_no_excuse').length, color: '#ef4444' },
      ].filter(item => item.value > 0) // Only show categories with data

      return chartData
    } catch (err) {
      console.error('Error getting attendance chart data:', err)
      return []
    }
  }

  const handleStudentClick = async (student: Student) => {
    setSelectedStudent(student) // Set initial student data
    setShowStudentDetail(true)
    setError(null) // Clear any previous errors
    await loadStudentDetails(student.id)
  }

  const sendNotification = async (
    parentEmail: string,
    parentName: string,
    studentName: string,
    notificationType: 'homework' | 'attendance' | 'behavior' | 'note',
    subject?: string,
    message?: string,
    htmlMessage?: string
  ) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            parentEmail,
            parentName,
            studentName,
            notificationType,
            subject,
            message,
            htmlMessage,
          }),
        }
      )

      if (!response.ok) {
        console.error('Failed to send notification email')
      }
    } catch (err) {
      console.error('Error sending notification:', err)
      // Don't throw - email failure shouldn't break the operation
    }
  }

  const handleMarkAttendance = async () => {
    if (!selectedStudent || !teacher) return

    try {
      const { error } = await supabase
        .from('attendance')
        .upsert({
          student_id: selectedStudent.id,
          teacher_id: teacher.id,
          date: attendanceDate,
          status: attendanceStatus,
          notes: attendanceNotes || null,
        }, {
          onConflict: 'student_id,date'
        })

      if (error) throw error

      // Send email notification for absences or lateness
      if (attendanceStatus.includes('absent') || attendanceStatus.includes('late')) {
        // Get parent information
        const { data: parent } = await supabase
          .from('parents')
          .select('parent1_email, parent1_first_name, parent1_last_name')
          .eq('id', selectedStudent.parent_id)
          .single()

        if (parent?.parent1_email) {
          const statusLabel = attendanceStatus.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          const studentName = `${selectedStudent.first_name} ${selectedStudent.last_name}`
          const parentName = `${parent.parent1_first_name} ${parent.parent1_last_name}`
          
          const htmlMessage = `
            <p>Assalamu Alaikum ${parentName},</p>
            <p>This is to inform you that ${studentName}'s attendance has been recorded for ${new Date(attendanceDate).toLocaleDateString()}.</p>
            <p><strong>Status:</strong> ${statusLabel}</p>
            ${attendanceNotes ? `<p><strong>Notes:</strong> ${attendanceNotes}</p>` : ''}
            <p>Please check the parent portal for more details.</p>
            <p>Jazakallahu Khairan,<br>Madrasah Abu Bakr As-Siddiq Team</p>
          `

          await sendNotification(
            parent.parent1_email,
            parentName,
            studentName,
            'attendance',
            `Attendance Update - ${studentName}`,
            undefined,
            htmlMessage
          )
        }
      }

      setShowAttendanceDialog(false)
      setAttendanceDate(new Date().toISOString().split('T')[0])
      setAttendanceStatus('present_with_uniform')
      setAttendanceNotes('')
      loadStudentDetails(selectedStudent.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark attendance')
    }
  }

  const handleBulkMarkAttendance = async () => {
    if (!teacher) return

    try {
      setSavingBulkAttendance(true)
      
      // Get all unique students (combine Quran and Islamic Studies)
      const allMyStudents = [...quranStudents, ...islamicStudiesStudents]
      const uniqueStudents = Array.from(new Map(allMyStudents.map(s => [s.id, s])).values())
      
      // Prepare attendance records
      const attendanceRecords = uniqueStudents
        .filter(student => bulkAttendanceRecords[student.id]) // Only include students with a status
        .map(student => ({
          student_id: student.id,
          teacher_id: teacher.id,
          date: bulkAttendanceDate,
          status: bulkAttendanceRecords[student.id],
          notes: bulkAttendanceNotes[student.id] || null,
        }))

      if (attendanceRecords.length === 0) {
        toast({
          title: 'Error',
          description: 'Please mark attendance for at least one student.',
          variant: 'destructive',
        })
        return
      }

      // Upsert all attendance records
      const { error } = await supabase
        .from('attendance')
        .upsert(attendanceRecords, {
          onConflict: 'student_id,date'
        })

      if (error) throw error

      // Send email notifications for absences or lateness
      const studentsToNotify = uniqueStudents.filter(student => {
        const status = bulkAttendanceRecords[student.id]
        return status && (status.includes('absent') || status.includes('late'))
      })

      for (const student of studentsToNotify) {
        const { data: parent } = await supabase
          .from('parents')
          .select('parent1_email, parent1_first_name, parent1_last_name')
          .eq('id', student.parent_id)
          .single()

        if (parent?.parent1_email) {
          const status = bulkAttendanceRecords[student.id]
          const statusLabel = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          const studentName = `${student.first_name} ${student.last_name}`
          const parentName = `${parent.parent1_first_name} ${parent.parent1_last_name}`
          const notes = bulkAttendanceNotes[student.id]
          
          const htmlMessage = `
            <p>Assalamu Alaikum ${parentName},</p>
            <p>This is to inform you that ${studentName}'s attendance has been recorded for ${new Date(bulkAttendanceDate).toLocaleDateString()}.</p>
            <p><strong>Status:</strong> ${statusLabel}</p>
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
            <p>Please check the parent portal for more details.</p>
            <p>Jazakallahu Khairan,<br>Madrasah Abu Bakr As-Siddiq Team</p>
          `

          await sendNotification(
            parent.parent1_email,
            parentName,
            studentName,
            'attendance',
            `Attendance Update - ${studentName}`,
            undefined,
            htmlMessage
          )
        }
      }

      toast({
        title: 'Success',
        description: `Attendance marked for ${attendanceRecords.length} student(s).`,
      })

      setShowBulkAttendanceDialog(false)
      setBulkAttendanceDate(new Date().toISOString().split('T')[0])
      setBulkAttendanceRecords({})
      setBulkAttendanceNotes({})
      
      // Reload teacher data to refresh student lists
      if (teacher) {
        await loadTeacherData(teacher.id)
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to mark bulk attendance',
        variant: 'destructive',
      })
    } finally {
      setSavingBulkAttendance(false)
    }
  }

  const handleAddBehaviorNote = async () => {
    if (!selectedStudent || !teacher) return

    try {
      const { error } = await supabase
        .from('behavior_notes')
        .insert({
          student_id: selectedStudent.id,
          teacher_id: teacher.id,
          date: new Date().toISOString().split('T')[0],
          type: behaviorType,
          title: behaviorTitle,
          description: behaviorDescription,
        })

      if (error) throw error

      // Get parent information and send email notification
      const { data: parent } = await supabase
        .from('parents')
        .select('parent1_email, parent1_first_name, parent1_last_name')
        .eq('id', selectedStudent.parent_id)
        .single()

      if (parent?.parent1_email) {
        const studentName = `${selectedStudent.first_name} ${selectedStudent.last_name}`
        const parentName = `${parent.parent1_first_name} ${parent.parent1_last_name}`
        const typeLabel = behaviorType.charAt(0).toUpperCase() + behaviorType.slice(1)
        
        const htmlMessage = `
          <p>Assalamu Alaikum ${parentName},</p>
          <p>A ${typeLabel.toLowerCase()} behavior note has been added for ${studentName}.</p>
          <p><strong>Title:</strong> ${behaviorTitle}</p>
          <p><strong>Description:</strong> ${behaviorDescription}</p>
          <p>Please check the parent portal for more details.</p>
          <p>Jazakallahu Khairan,<br>Madrasah Abu Bakr As-Siddiq Team</p>
        `

        await sendNotification(
          parent.parent1_email,
          parentName,
          studentName,
          'behavior',
          `Behavior Note - ${studentName}`,
          undefined,
          htmlMessage
        )
      }

      setShowBehaviorDialog(false)
      setBehaviorType('positive')
      setBehaviorTitle('')
      setBehaviorDescription('')
      loadStudentDetails(selectedStudent.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add behavior note')
    }
  }

  const handleAddHomework = async () => {
    if (!selectedStudent || !teacher) return

    // Ensure we have a current term
    if (!currentTermId) {
      setError('No active term found. Please contact admin to set up the current term.')
      return
    }

    try {
      const { error } = await supabase
        .from('homework')
        .insert({
          student_id: selectedStudent.id,
          teacher_id: teacher.id,
          title: homeworkTitle,
          description: homeworkDescription || null,
          assigned_date: new Date().toISOString().split('T')[0],
          due_date: homeworkDueDate || null,
          completed: false,
          term_id: currentTermId, // Add current term ID
        })

      if (error) throw error

      // Get parent information and send email notification
      const { data: parent } = await supabase
        .from('parents')
        .select('parent1_email, parent1_first_name, parent1_last_name')
        .eq('id', selectedStudent.parent_id)
        .single()

      if (parent?.parent1_email) {
        const studentName = `${selectedStudent.first_name} ${selectedStudent.last_name}`
        const parentName = `${parent.parent1_first_name} ${parent.parent1_last_name}`
        
        const htmlMessage = `
          <p>Assalamu Alaikum ${parentName},</p>
          <p>New homework has been assigned to ${studentName}.</p>
          <p><strong>Title:</strong> ${homeworkTitle}</p>
          ${homeworkDescription ? `<p><strong>Description:</strong> ${homeworkDescription}</p>` : ''}
          ${homeworkDueDate ? `<p><strong>Due Date:</strong> ${new Date(homeworkDueDate).toLocaleDateString()}</p>` : ''}
          <p>Please check the parent portal for more details and to track completion.</p>
          <p>Jazakallahu Khairan,<br>Madrasah Abu Bakr As-Siddiq Team</p>
        `

        await sendNotification(
          parent.parent1_email,
          parentName,
          studentName,
          'homework',
          `New Homework Assignment - ${studentName}`,
          undefined,
          htmlMessage
        )
      }

      setShowHomeworkDialog(false)
      setHomeworkTitle('')
      setHomeworkDescription('')
      setHomeworkDueDate('')
      loadStudentDetails(selectedStudent.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add homework')
    }
  }

  const handleAddNote = async () => {
    if (!selectedStudent || !teacher) return

    try {
      const { error } = await supabase
        .from('student_notes')
        .insert({
          student_id: selectedStudent.id,
          teacher_id: teacher.id,
          note: noteText,
        })

      if (error) throw error

      // Get parent information and send email notification
      const { data: parent } = await supabase
        .from('parents')
        .select('parent1_email, parent1_first_name, parent1_last_name')
        .eq('id', selectedStudent.parent_id)
        .single()

      if (parent?.parent1_email) {
        const studentName = `${selectedStudent.first_name} ${selectedStudent.last_name}`
        const parentName = `${parent.parent1_first_name} ${parent.parent1_last_name}`
        
        const htmlMessage = `
          <p>Assalamu Alaikum ${parentName},</p>
          <p>A teacher note has been added for ${studentName}.</p>
          <p><strong>Note:</strong> ${noteText}</p>
          <p>Please check the parent portal for more details.</p>
          <p>Jazakallahu Khairan,<br>Madrasah Abu Bakr As-Siddiq Team</p>
        `

        await sendNotification(
          parent.parent1_email,
          parentName,
          studentName,
          'note',
          `Teacher Note - ${studentName}`,
          undefined,
          htmlMessage
        )
      }

      setShowNoteDialog(false)
      setNoteText('')
      loadStudentDetails(selectedStudent.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note')
    }
  }

  const handleAddClassContent = async () => {
    if (!selectedStudent || !teacher) return

    if (!classContentText.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter the content that was covered.',
        variant: 'destructive',
      })
      return
    }

    try {
      // Validate sub-subject for Islamic Studies
      if (classContentSubject === 'islamic_studies' && !classContentSubSubject) {
        toast({
          title: 'Error',
          description: 'Please select a sub-subject for Islamic Studies.',
          variant: 'destructive',
        })
        return
      }

      const { error } = await supabase
        .from('class_content')
        .insert({
          student_id: selectedStudent.id,
          teacher_id: teacher.id,
          date: classContentDate,
          subject: classContentSubject,
          sub_subject: classContentSubject === 'islamic_studies' ? classContentSubSubject : null,
          content: classContentText,
          label: classContentLabel || null,
        })

      if (error) throw error

      // Get parent information for email notification
      const { data: parent } = await supabase
        .from('parents')
        .select('parent1_email, parent1_first_name, parent1_last_name')
        .eq('id', selectedStudent.parent_id)
        .single()

      if (parent?.parent1_email) {
        const studentName = `${selectedStudent.first_name} ${selectedStudent.last_name}`
        const parentName = `${parent.parent1_first_name} ${parent.parent1_last_name}`
        const subjectLabel = classContentSubject === 'quran' ? 'Quran' : 'Islamic Studies'
        const subSubjectLabel = classContentSubSubject 
          ? classContentSubSubject.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
          : ''
        const labelText = classContentLabel 
          ? classContentLabel.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
          : ''
        
        const htmlMessage = `
          <p>Assalamu Alaikum ${parentName},</p>
          <p>This is to inform you about what was covered in class for ${studentName}.</p>
          <p><strong>Date:</strong> ${new Date(classContentDate).toLocaleDateString()}</p>
          <p><strong>Subject:</strong> ${subjectLabel}</p>
          ${subSubjectLabel ? `<p><strong>Sub-Subject:</strong> ${subSubjectLabel}</p>` : ''}
          ${labelText ? `<p><strong>Label:</strong> ${labelText}</p>` : ''}
          <p><strong>Content Covered:</strong></p>
          <p>${classContentText.replace(/\n/g, '<br>')}</p>
          <p>Please check the parent portal for the full history.</p>
          <p>Jazakallahu Khairan,<br>Madrasah Abu Bakr As-Siddiq Team</p>
        `

        await sendNotification(
          parent.parent1_email,
          parentName,
          studentName,
          'note',
          `Class Content Update - ${subjectLabel} - ${studentName}`,
          undefined,
          htmlMessage
        )
      }

      setShowClassContentDialog(false)
      setClassContentDate(new Date().toISOString().split('T')[0])
      setClassContentSubject('quran')
      setClassContentSubSubject('')
      setClassContentText('')
      setClassContentLabel('')
      loadStudentDetails(selectedStudent.id)
      
      toast({
        title: 'Success',
        description: 'Class content added successfully. Parent has been notified.',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add class content')
    }
  }

  const handleDeleteNote = async (noteId: number) => {
    if (!selectedStudent || !confirm('Are you sure you want to delete this note?')) return

    try {
      const { error } = await supabase
        .from('student_notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error

      loadStudentDetails(selectedStudent.id)
      
      toast({
        title: 'Success',
        description: 'Note deleted successfully.',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note')
    }
  }

  const handleDeleteAttendance = async (attendanceId: number) => {
    if (!selectedStudent || !confirm('Are you sure you want to delete this attendance record?')) return

    try {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', attendanceId)

      if (error) throw error

      loadStudentDetails(selectedStudent.id)
      
      toast({
        title: 'Success',
        description: 'Attendance record deleted successfully.',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete attendance record')
    }
  }

  const handleDeleteBehaviorNote = async (behaviorId: number) => {
    if (!selectedStudent || !confirm('Are you sure you want to delete this behavior note?')) return

    try {
      const { error } = await supabase
        .from('behavior_notes')
        .delete()
        .eq('id', behaviorId)

      if (error) throw error

      loadStudentDetails(selectedStudent.id)
      
      toast({
        title: 'Success',
        description: 'Behavior note deleted successfully.',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete behavior note')
    }
  }

  const handleDeleteHomework = async (homeworkId: number) => {
    if (!selectedStudent || !confirm('Are you sure you want to delete this homework assignment?')) return

    try {
      const { error } = await supabase
        .from('homework')
        .delete()
        .eq('id', homeworkId)

      if (error) throw error

      loadStudentDetails(selectedStudent.id)
      
      toast({
        title: 'Success',
        description: 'Homework assignment deleted successfully.',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete homework assignment')
    }
  }

  const handleDeleteClassContent = async (contentId: number) => {
    if (!selectedStudent || !confirm('Are you sure you want to delete this class content entry?')) return

    try {
      const { error } = await supabase
        .from('class_content')
        .delete()
        .eq('id', contentId)

      if (error) throw error

      loadStudentDetails(selectedStudent.id)
      
      toast({
        title: 'Success',
        description: 'Class content deleted successfully.',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete class content')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('teacherId')
    localStorage.removeItem('teacherEmail')
    sessionStorage.removeItem('teacherId')
    sessionStorage.removeItem('teacherEmail')
    setLocation('/portal')
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
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

    setChangingPassword(true)
    try {
      // First verify current password
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        throw new Error('No user found')
      }

      // Verify password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
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
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordChangeDialog(false)
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update password',
        variant: 'destructive',
      })
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-background py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !teacher) {
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

  return (
    <div className="min-h-screen bg-neutral-background py-8">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary font-amiri">
                Teacher Portal
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Welcome, {teacher?.first_name} {teacher?.last_name}
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
                      {teacher?.first_name} {teacher?.last_name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {teacher?.email || ''}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowPasswordChangeDialog(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Change Password</span>
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

          {/* Tabs for My Students, All Teachers, and Absence Notes */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 sm:mb-6 gap-1 w-full flex-wrap">
              <TabsTrigger value="my-students" className="flex-1 text-xs sm:text-sm min-w-[100px]">My Students</TabsTrigger>
              <TabsTrigger value="all-teachers" className="flex-1 text-xs sm:text-sm min-w-[100px]">All Teachers</TabsTrigger>
              <TabsTrigger value="absence-notes" className="flex-1 text-xs sm:text-sm min-w-[100px]">Absence Notes</TabsTrigger>
            </TabsList>

            {/* My Students Tab */}
            <TabsContent value="my-students" className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-lg sm:text-xl font-semibold">My Assigned Students</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button onClick={() => {
                    setShowBulkAttendanceDialog(true)
                    // Initialize all students with default status
                    const allMyStudents = [...quranStudents, ...islamicStudiesStudents]
                    const uniqueStudents = Array.from(new Map(allMyStudents.map(s => [s.id, s])).values())
                    const initialRecords: { [key: number]: string } = {}
                    uniqueStudents.forEach(student => {
                      initialRecords[student.id] = 'present_with_uniform'
                    })
                    setBulkAttendanceRecords(initialRecords)
                    setBulkAttendanceNotes({})
                  }} size="sm" variant="default" className="w-full sm:w-auto">
                    <Calendar className="mr-2 h-4 w-4" />
                    Mark All Attendance
                  </Button>
                  <Button onClick={() => {
                    setShowAssignStudentsDialog(true)
                    loadAllStudents()
                  }} size="sm" variant="outline" className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Assign Students to Me
                  </Button>
                </div>
              </div>

              {/* Program Filter */}
              <div className="flex justify-end">
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

              {/* Students List - Two Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quran Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Quran Students
                </CardTitle>
                <CardDescription>
                  Students assigned to you for Quran studies (First Hour)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {quranStudents.filter((s) => {
                  if (programFilter === 'all') return true
                  if (programFilter === 'none') return !s.program
                  return s.program === programFilter
                }).length === 0 ? (
                  <p className="text-gray-500">No Quran students assigned yet.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {quranStudents
                      .filter((s) => {
                        if (programFilter === 'all') return true
                        if (programFilter === 'none') return !s.program
                        return s.program === programFilter
                      })
                      .map((student) => (
                      <div
                        key={`quran-${student.id}`}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div
                          onClick={() => handleStudentClick(student)}
                          className="cursor-pointer"
                        >
                          <h3 className="font-semibold text-lg">
                            {student.first_name} {student.last_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {student.grade} • {student.program ? `Program ${student.program}` : 'Program Not Set'} • ID: {student.student_id || `STU-${student.id.toString().padStart(4, '0')}`}
                          </p>
                          {student.current_school && (
                            <p className="text-sm text-gray-500 mt-1">
                              {student.current_school}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUnassignQuranStudent(student.id)
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Unassign
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Islamic Studies Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Islamic Studies Students
                </CardTitle>
                <CardDescription>
                  Students assigned to you for Islamic Studies (Second Hour)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {islamicStudiesStudents.filter((s) => {
                  if (programFilter === 'all') return true
                  if (programFilter === 'none') return !s.program
                  return s.program === programFilter
                }).length === 0 ? (
                  <p className="text-gray-500">No Islamic Studies students assigned yet.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {islamicStudiesStudents
                      .filter((s) => {
                        if (programFilter === 'all') return true
                        if (programFilter === 'none') return !s.program
                        return s.program === programFilter
                      })
                      .map((student) => (
                      <div
                        key={`islamic-${student.id}`}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div
                          onClick={() => handleStudentClick(student)}
                          className="cursor-pointer"
                        >
                          <h3 className="font-semibold text-lg">
                            {student.first_name} {student.last_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {student.grade} • {student.program ? `Program ${student.program}` : 'Program Not Set'} • ID: {student.student_id || `STU-${student.id.toString().padStart(4, '0')}`}
                          </p>
                          {student.current_school && (
                            <p className="text-sm text-gray-500 mt-1">
                              {student.current_school}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUnassignIslamicStudiesStudent(student.id)
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Unassign
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
            </TabsContent>

            {/* All Teachers Tab */}
            <TabsContent value="all-teachers" className="space-y-4">
              <h2 className="text-xl font-semibold">All Teachers and Their Students</h2>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading teachers...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allTeachers.map((t) => (
                    <Card
                      key={t.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleTeacherViewClick(t)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {t.first_name} {t.last_name}
                        </CardTitle>
                        <CardDescription>{t.email}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Quran Students:</span>
                            <Badge variant="outline">{t.quran_student_count || 0}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Islamic Studies Students:</span>
                            <Badge variant="outline">{t.islamic_studies_student_count || 0}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Absence Notes Tab */}
            <TabsContent value="absence-notes" className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-lg sm:text-xl font-semibold">Teacher Absence Notes</h2>
                <Button onClick={() => setShowAbsenceNoteDialog(true)} size="sm" className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Absence Note
                </Button>
              </div>

              {loadingAbsenceNotes ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading absence notes...</span>
                </div>
              ) : absenceNotes.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No upcoming absences scheduled.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {absenceNotes.map((note: any) => {
                    const noteTeacher = note.teachers
                    const isUpcoming = new Date(note.absence_date) >= new Date()
                    const isToday = new Date(note.absence_date).toDateString() === new Date().toDateString()
                    const isMyNote = teacher && note.teacher_id === teacher.id
                    
                    return (
                      <Card key={note.id} className={`hover:shadow-md transition-shadow ${isToday ? 'border-primary border-2' : ''} ${!isUpcoming ? 'opacity-75' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                <p className="font-semibold text-lg">
                                  {new Date(note.absence_date).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </p>
                                {isToday && (
                                  <Badge className="bg-primary text-white">Today</Badge>
                                )}
                                {isMyNote && (
                                  <Badge variant="outline">My Note</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                <strong>Teacher:</strong> {noteTeacher?.first_name} {noteTeacher?.last_name}
                              </p>
                              {note.reason && (
                                <p className="text-sm text-gray-600 mb-2">
                                  <strong>Reason:</strong> {note.reason}
                                </p>
                              )}
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-1">Coverage Instructions:</p>
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.notes}</p>
                              </div>
                            </div>
                            {isMyNote && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAbsenceNote(note.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Student Detail Dialog */}
      <Dialog open={showStudentDetail} onOpenChange={setShowStudentDetail}>
        <DialogContent className="w-[95vw] sm:w-full max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          {loadingStudentDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading student details...</span>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : !selectedStudent ? (
            <div className="py-12 text-center">
              <p className="text-gray-500">No student selected</p>
            </div>
          ) : (
            <>
              <DialogHeader className="space-y-2">
                <DialogTitle className="text-xl sm:text-2xl break-words">
                  {selectedStudent?.first_name || 'Unknown'} {selectedStudent?.last_name || ''}
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base break-words">
                  <span className="block sm:inline">Grade {selectedStudent?.grade || 'N/A'}</span>
                  <span className="hidden sm:inline"> • </span>
                  <span className="block sm:inline">Student ID: {selectedStudent?.student_id || (selectedStudent?.id ? `STU-${selectedStudent.id.toString().padStart(4, '0')}` : 'N/A')}</span>
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
                          loadStudentDetails(selectedStudent.id)
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
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
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
                <span className="hidden sm:inline">Parent Messages</span>
                {messages.filter(m => m.sender_type === 'parent' && !m.teacher_read).length > 0 && (
                  <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                    {messages.filter(m => m.sender_type === 'parent' && !m.teacher_read).length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-4 sm:mt-6 space-y-4 sm:space-y-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  <span>Student Profile</span>
                </h3>
                <Button onClick={() => setShowProfileEditDialog(true)} size="sm" className="text-sm px-3">
                  <Plus className="h-4 w-4 mr-1" />
                  Edit Profile
                </Button>
              </div>

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
                        <Badge className={`${
                          selectedStudent.behavior_standing === 'excellent' ? 'bg-green-100 text-green-800 border-green-300' :
                          selectedStudent.behavior_standing === 'good' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                          selectedStudent.behavior_standing === 'satisfactory' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                          selectedStudent.behavior_standing === 'needs_improvement' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                          'bg-red-100 text-red-800 border-red-300'
                      } border text-sm sm:text-base font-semibold px-4 py-2`}>
                          {selectedStudent.behavior_standing.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                    ) : (
                    <p className="text-sm text-gray-500 pl-7">Not set yet</p>
                    )}
                </div>
              </div>

              {/* Parent Contact Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-5 w-5 text-primary shrink-0" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Parent Contact</h3>
                </div>
                  {parentInfo ? (
                  <div className="space-y-3 pl-7">
                      <div>
                      <p className="text-sm text-gray-600 mb-1">Name</p>
                      <p className="text-base font-semibold">{parentInfo.first_name} {parentInfo.last_name}</p>
                      </div>
                      <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="text-sm font-medium break-all">{parentInfo.email}</p>
                      </div>
                      {parentInfo.mobile && (
                        <div>
                        <p className="text-sm text-gray-600 mb-1">Phone</p>
                        <p className="text-base font-semibold">{parentInfo.mobile}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                  <p className="text-sm text-gray-500 pl-7">Not available</p>
                  )}
              </div>

              {/* Attendance Statistics */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-primary shrink-0" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Attendance Summary</h3>
                </div>
                  {(() => {
                    const chartData = getAttendanceChartData()
                    if (attendance.length === 0 || chartData.length === 0) {
                    return <p className="text-sm text-gray-500 pl-7">No records yet</p>
                  }
                  const stats = {
                    presentWithUniform: attendance.filter(a => a.status === 'present_with_uniform').length,
                    presentNoUniform: attendance.filter(a => a.status === 'present_no_uniform').length,
                    lateUniform: attendance.filter(a => a.status === 'late_uniform').length,
                    lateNoUniform: attendance.filter(a => a.status === 'late_no_uniform').length,
                    absentExcused: attendance.filter(a => a.status === 'absent_with_excuse').length,
                    absentUnexcused: attendance.filter(a => a.status === 'absent_no_excuse').length,
                    }
                    return (
                    <div className="space-y-2 pl-7">
                      <p className="text-sm text-gray-600 mb-3 font-medium">Total: {attendance.length} days</p>
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
                    </div>
                    )
                  })()}
              </div>
            </TabsContent>

            <TabsContent value="attendance" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Attendance Records
                </h3>
                <Button onClick={() => setShowAttendanceDialog(true)} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Mark Attendance
                </Button>
              </div>
              {attendance.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <UserCheck className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No attendance records yet.</p>
                    <Button onClick={() => setShowAttendanceDialog(true)} className="mt-4" size="sm">
                      Mark First Attendance
                    </Button>
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
                            <div className="flex items-center gap-2">
                              <Badge className={`${getStatusColor(record.status)} border font-medium`}>
                                {getStatusLabel(record.status)}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAttendance(record.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
                <Button onClick={() => setShowHomeworkDialog(true)} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Assign Homework
                </Button>
              </div>
              {homework.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No homework assigned yet.</p>
                    <Button onClick={() => setShowHomeworkDialog(true)} className="mt-4" size="sm">
                      Assign First Homework
                    </Button>
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
                                {hw.completed ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Circle className="h-5 w-5 text-gray-400" />
                                )}
                                <span className={`font-semibold text-lg ${hw.completed ? 'line-through text-gray-500' : ''}`}>
                                  {hw.title}
                                </span>
                              </div>
                              {hw.description && (
                                <p className="text-sm text-gray-700 mb-2 ml-8">{hw.description}</p>
                              )}
                              <div className="flex items-center gap-4 ml-8 text-xs text-gray-500">
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
                            <div className="flex items-center gap-2">
                              <Badge variant={hw.completed ? 'default' : isOverdue ? 'destructive' : 'secondary'}>
                                {hw.completed ? 'Completed' : isOverdue ? 'Overdue' : 'Pending'}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteHomework(hw.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Behavior Notes
                </h3>
                <Button onClick={() => setShowBehaviorDialog(true)} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Note
                </Button>
              </div>
              {behaviorNotes.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No behavior notes yet.</p>
                    <Button onClick={() => setShowBehaviorDialog(true)} className="mt-4" size="sm">
                      Add First Note
                    </Button>
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
                          <div className="flex items-center gap-2">
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBehaviorNote(note.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
                  General Notes
                </h3>
                <Button onClick={() => setShowNoteDialog(true)} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Note
                </Button>
              </div>
              {studentNotes.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No notes yet.</p>
                    <Button onClick={() => setShowNoteDialog(true)} className="mt-4" size="sm">
                      Add First Note
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {studentNotes.map((note) => (
                    <Card key={note.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-2">
                              {new Date(note.created_at).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-gray-800 whitespace-pre-wrap">{note.note}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                <Button onClick={() => setShowClassContentDialog(true)} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Class Content
                </Button>
              </div>
              {classContent.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No class content recorded yet.</p>
                    <Button onClick={() => setShowClassContentDialog(true)} className="mt-4" size="sm">
                      Add First Entry
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {classContent.map((content) => (
                    <Card key={content.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClassContent(content.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                  Parent Communications
                </h3>
                <Badge variant="outline">{messages.length} messages</Badge>
              </div>

              {messages.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No messages from parents yet.</p>
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
                              <Badge variant={thread.root.sender_type === 'parent' ? 'secondary' : 'default'}>
                                {thread.root.sender_type === 'parent' ? 'From Parent' : 'Your Reply'}
                              </Badge>
                              {thread.root.sender_type === 'parent' && !thread.root.teacher_read && (
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
                          {thread.root.parent && (
                            <p className="text-xs text-gray-500 mt-2">
                              From: {thread.root.parent.parent1_first_name} {thread.root.parent.parent1_last_name}
                            </p>
                          )}
                          {thread.root.sender_type === 'parent' && !thread.root.teacher_read && (
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
                                    <Badge variant={reply.sender_type === 'parent' ? 'secondary' : 'default'} className="text-xs">
                                      {reply.sender_type === 'parent' ? 'From Parent' : 'Your Reply'}
                                    </Badge>
                                    {reply.sender_type === 'parent' && !reply.teacher_read && (
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
                                {reply.sender_type === 'parent' && !reply.teacher_read && (
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

                        {/* Reply Form */}
                        {thread.root.sender_type === 'parent' && (
                          <div className="p-4 bg-gray-50 border-t">
                            {replyingTo === thread.root.id ? (
                              <div className="space-y-3">
                                <Label htmlFor={`reply-${thread.root.id}`} className="text-sm font-medium">
                                  Reply to Parent
                                </Label>
                                <Textarea
                                  id={`reply-${thread.root.id}`}
                                  placeholder="Type your reply here..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  rows={3}
                                  className="w-full resize-none"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleSendReply(thread.root.id)}
                                    disabled={sendingReply || !replyText}
                                    size="sm"
                                    className="gap-2"
                                  >
                                    {sendingReply ? (
                                      <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Sending...
                                      </>
                                    ) : (
                                      <>
                                        <Send className="h-4 w-4" />
                                        Send Reply
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setReplyingTo(null)
                                      setReplyText('')
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setReplyingTo(thread.root.id)}
                                className="gap-2"
                              >
                                <Reply className="h-4 w-4" />
                                Reply to Parent
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
            <DialogDescription>
              Record attendance for {selectedStudent?.first_name} {selectedStudent?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="attendance-date">Date</Label>
              <Input
                id="attendance-date"
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="attendance-status">Status</Label>
              <Select value={attendanceStatus} onValueChange={(v: any) => setAttendanceStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present_with_uniform">Present with Uniform</SelectItem>
                  <SelectItem value="present_no_uniform">Present (No Uniform)</SelectItem>
                  <SelectItem value="late_uniform">Late (with Uniform)</SelectItem>
                  <SelectItem value="late_no_uniform">Late (No Uniform)</SelectItem>
                  <SelectItem value="absent_with_excuse">Absent (with Excuse)</SelectItem>
                  <SelectItem value="absent_no_excuse">Absent (No Excuse)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="attendance-notes">Notes (optional)</Label>
              <Textarea
                id="attendance-notes"
                value={attendanceNotes}
                onChange={(e) => setAttendanceNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAttendanceDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleMarkAttendance}>
                Save
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
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="behavior-type">Type</Label>
              <Select value={behaviorType} onValueChange={(v: any) => setBehaviorType(v)}>
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
            <div>
              <Label htmlFor="behavior-title">Title</Label>
              <Input
                id="behavior-title"
                value={behaviorTitle}
                onChange={(e) => setBehaviorTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="behavior-description">Description</Label>
              <Textarea
                id="behavior-description"
                value={behaviorDescription}
                onChange={(e) => setBehaviorDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowBehaviorDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBehaviorNote}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Homework Dialog */}
      <Dialog open={showHomeworkDialog} onOpenChange={setShowHomeworkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Homework</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="homework-title">Title</Label>
              <Input
                id="homework-title"
                value={homeworkTitle}
                onChange={(e) => setHomeworkTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="homework-description">Description</Label>
              <Textarea
                id="homework-description"
                value={homeworkDescription}
                onChange={(e) => setHomeworkDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="homework-due-date">Due Date (optional)</Label>
              <Input
                id="homework-due-date"
                type="date"
                value={homeworkDueDate}
                onChange={(e) => setHomeworkDueDate(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowHomeworkDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddHomework}>
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="note-text">Note</Label>
              <Textarea
                id="note-text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={5}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNote}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Edit Dialog */}
      <Dialog open={showProfileEditDialog} onOpenChange={setShowProfileEditDialog}>
        <DialogContent className="w-[95vw] sm:w-full max-w-2xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Edit Student Profile</DialogTitle>
            <DialogDescription>
              Update Quran/Iqra progress and behavior standing for {selectedStudent?.first_name} {selectedStudent?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="quran-type">Level</Label>
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
                <div>
                  <Label htmlFor="quran-level">Iqra Level (1-6)</Label>
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
                <div>
                  <Label htmlFor="quran-page">Page (1-30)</Label>
                  <Input
                    id="quran-page"
                    type="number"
                    min="1"
                    max="30"
                    value={quranPage}
                    onChange={(e) => setQuranPage(e.target.value)}
                    placeholder="Enter page number (1-30)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Each Iqra level has 30 pages</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="quran-surah">Surah</Label>
                  <Select 
                    value={quranSurah || ''} 
                    onValueChange={(v) => {
                      setQuranSurah(v)
                      // Reset ayah when surah changes
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
                <div>
                  <Label htmlFor="quran-ayah">Ayah (Verse)</Label>
                  {quranSurah && (() => {
                    const selectedSurah = SURAHS.find(s => s.name === quranSurah)
                    if (!selectedSurah) return null
                    
                    return (
                      <>
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
                      </>
                    )
                  })()}
                  {!quranSurah && (
                    <Input
                      id="quran-ayah"
                      type="text"
                      value={quranAyah}
                      onChange={(e) => setQuranAyah(e.target.value)}
                      placeholder="Select Surah first"
                      disabled
                    />
                  )}
                </div>
              </>
            )}

            <div>
              <Label htmlFor="behavior-standing">Behavior Standing</Label>
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
              <Button variant="outline" onClick={() => setShowProfileEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProfile}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordChangeDialog} onOpenChange={setShowPasswordChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your password. Password must be at least 6 characters long.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPasswordChangeDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleChangePassword}
                disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Class Content Dialog */}
      <Dialog open={showClassContentDialog} onOpenChange={setShowClassContentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Class Content</DialogTitle>
            <DialogDescription>
              Record what was covered in class for {selectedStudent?.first_name} {selectedStudent?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="class-content-date">Date</Label>
              <Input
                id="class-content-date"
                type="date"
                value={classContentDate}
                onChange={(e) => setClassContentDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="class-content-subject">Subject</Label>
              <Select value={classContentSubject} onValueChange={(v: 'quran' | 'islamic_studies') => {
                setClassContentSubject(v)
                if (v === 'quran') {
                  setClassContentSubSubject('') // Clear sub-subject when switching to Quran
                }
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quran">Quran</SelectItem>
                  <SelectItem value="islamic_studies">Islamic Studies</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {classContentSubject === 'islamic_studies' && (
              <div>
                <Label htmlFor="class-content-sub-subject">Sub-Subject *</Label>
                <Select 
                  value={classContentSubSubject || 'none'} 
                  onValueChange={(v) => setClassContentSubSubject(v === 'none' ? '' : v as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub-subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select...</SelectItem>
                    <SelectItem value="surah_and_dua">Surah and Dua</SelectItem>
                    <SelectItem value="fiqh">Fiqh</SelectItem>
                    <SelectItem value="islamic_curriculum">Islamic Curriculum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="class-content-text">Content Covered *</Label>
              <Textarea
                id="class-content-text"
                value={classContentText}
                onChange={(e) => setClassContentText(e.target.value)}
                placeholder="Describe what was covered in class today..."
                rows={6}
              />
            </div>
            <div>
              <Label htmlFor="class-content-label">Label (optional)</Label>
              <Select value={classContentLabel || 'none'} onValueChange={(v) => setClassContentLabel(v === 'none' ? '' : v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="needs_revision">Needs Revision</SelectItem>
                  <SelectItem value="exam_content">Exam Content</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowClassContentDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddClassContent}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Students Dialog */}
      <Dialog open={showAssignStudentsDialog} onOpenChange={setShowAssignStudentsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Students to Me</DialogTitle>
            <DialogDescription>
              Select students to assign to yourself for Quran and/or Islamic Studies.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Filters */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Program</Label>
                <Select value={assignProgramFilter} onValueChange={setAssignProgramFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    <SelectItem value="A">Program A</SelectItem>
                    <SelectItem value="B">Program B</SelectItem>
                    <SelectItem value="none">Not Set</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Grade</Label>
                <Select value={assignGradeFilter} onValueChange={setAssignGradeFilter}>
                  <SelectTrigger>
                    <SelectValue />
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
              <div>
                <Label>Quran Level</Label>
                <Select value={assignQuranLevelFilter} onValueChange={setAssignQuranLevelFilter}>
                  <SelectTrigger>
                    <SelectValue />
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

            {/* Two columns for Quran and Islamic Studies */}
            <div className="grid grid-cols-2 gap-4">
              {/* Quran Students */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Assign for Quran</Label>
                <div className="border rounded-lg p-3 max-h-96 overflow-y-auto space-y-2">
                  {allStudents
                    .filter((s) => {
                      // Filter out students already assigned to this teacher for Quran
                      if (quranAssignedStudentIds.has(s.id)) return false
                      if (assignProgramFilter !== 'all' && assignProgramFilter !== 'none' && s.program !== assignProgramFilter) return false
                      if (assignProgramFilter === 'none' && s.program) return false
                      if (assignGradeFilter !== 'all' && s.grade !== assignGradeFilter) return false
                      if (assignQuranLevelFilter !== 'all' && s.quran_level !== assignQuranLevelFilter) return false
                      return true
                    })
                    .map((student) => {
                      const isSelected = selectedStudentsForQuran.includes(student.id)
                      return (
                        <div
                          key={student.id}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
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
                          <span className="text-sm">
                            {student.first_name} {student.last_name} ({student.grade})
                          </span>
                        </div>
                      )
                    })}
                </div>
                <Button
                  onClick={handleAssignQuranStudents}
                  disabled={selectedStudentsForQuran.length === 0}
                  className="w-full"
                >
                  Assign {selectedStudentsForQuran.length} Student(s) for Quran
                </Button>
              </div>

              {/* Islamic Studies Students */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Assign for Islamic Studies</Label>
                <div className="border rounded-lg p-3 max-h-96 overflow-y-auto space-y-2">
                  {allStudents
                    .filter((s) => {
                      // Filter out students already assigned to this teacher for Islamic Studies
                      if (islamicStudiesAssignedStudentIds.has(s.id)) return false
                      if (assignProgramFilter !== 'all' && assignProgramFilter !== 'none' && s.program !== assignProgramFilter) return false
                      if (assignProgramFilter === 'none' && s.program) return false
                      if (assignGradeFilter !== 'all' && s.grade !== assignGradeFilter) return false
                      if (assignQuranLevelFilter !== 'all' && s.quran_level !== assignQuranLevelFilter) return false
                      return true
                    })
                    .map((student) => {
                      const isSelected = selectedStudentsForIslamicStudies.includes(student.id)
                      return (
                        <div
                          key={student.id}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
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
                          <span className="text-sm">
                            {student.first_name} {student.last_name} ({student.grade})
                          </span>
                        </div>
                      )
                    })}
                </div>
                <Button
                  onClick={handleAssignIslamicStudiesStudents}
                  disabled={selectedStudentsForIslamicStudies.length === 0}
                  className="w-full"
                >
                  Assign {selectedStudentsForIslamicStudies.length} Student(s) for Islamic Studies
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Teacher View Dialog */}
      <Dialog open={showTeacherViewDialog} onOpenChange={setShowTeacherViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTeacherForView?.first_name} {selectedTeacherForView?.last_name}'s Students
            </DialogTitle>
            <DialogDescription>
              View all students assigned to this teacher.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Quran Students */}
            <Card>
              <CardHeader>
                <CardTitle>Quran Students</CardTitle>
              </CardHeader>
              <CardContent>
                {teacherViewQuranStudents.length === 0 ? (
                  <p className="text-gray-500 text-sm">No Quran students assigned.</p>
                ) : (
                  <div className="space-y-2">
                    {teacherViewQuranStudents.map((student) => (
                      <div key={student.id} className="border rounded p-2">
                        <p className="font-medium text-sm">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {student.grade} • {student.program ? `Program ${student.program}` : 'Program Not Set'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Islamic Studies Students */}
            <Card>
              <CardHeader>
                <CardTitle>Islamic Studies Students</CardTitle>
              </CardHeader>
              <CardContent>
                {teacherViewIslamicStudiesStudents.length === 0 ? (
                  <p className="text-gray-500 text-sm">No Islamic Studies students assigned.</p>
                ) : (
                  <div className="space-y-2">
                    {teacherViewIslamicStudiesStudents.map((student) => (
                      <div key={student.id} className="border rounded p-2">
                        <p className="font-medium text-sm">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {student.grade} • {student.program ? `Program ${student.program}` : 'Program Not Set'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Attendance Dialog */}
      <Dialog open={showBulkAttendanceDialog} onOpenChange={setShowBulkAttendanceDialog}>
        <DialogContent className="w-[95vw] sm:w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mark Attendance for All Students</DialogTitle>
            <DialogDescription>
              Mark attendance for all your assigned students at once. Select the date and status for each student.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="bulk-attendance-date">Date *</Label>
              <Input
                id="bulk-attendance-date"
                type="date"
                value={bulkAttendanceDate}
                onChange={(e) => setBulkAttendanceDate(e.target.value)}
                required
              />
            </div>

            {/* Get all unique students */}
            {(() => {
              const allMyStudents = [...quranStudents, ...islamicStudiesStudents]
              const uniqueStudents = Array.from(new Map(allMyStudents.map(s => [s.id, s])).values())
              
              if (uniqueStudents.length === 0) {
                return (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-gray-500">No students assigned yet.</p>
                    </CardContent>
                  </Card>
                )
              }

              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-base font-semibold">Students ({uniqueStudents.length})</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const allPresent: { [key: number]: string } = {}
                          uniqueStudents.forEach(student => {
                            allPresent[student.id] = 'present_with_uniform'
                          })
                          setBulkAttendanceRecords(allPresent)
                        }}
                      >
                        Mark All Present
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const allAbsent: { [key: number]: string } = {}
                          uniqueStudents.forEach(student => {
                            allAbsent[student.id] = 'absent_no_excuse'
                          })
                          setBulkAttendanceRecords(allAbsent)
                        }}
                      >
                        Mark All Absent
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="max-h-[500px] overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Student</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Grade</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {uniqueStudents.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {student.first_name} {student.last_name}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{student.grade}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <Select
                                  value={bulkAttendanceRecords[student.id] || 'present_with_uniform'}
                                  onValueChange={(value) => {
                                    setBulkAttendanceRecords(prev => ({
                                      ...prev,
                                      [student.id]: value
                                    }))
                                  }}
                                >
                                  <SelectTrigger className="w-[200px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="present_with_uniform">Present (Uniform)</SelectItem>
                                    <SelectItem value="present_no_uniform">Present (No Uniform)</SelectItem>
                                    <SelectItem value="late_uniform">Late (Uniform)</SelectItem>
                                    <SelectItem value="late_no_uniform">Late (No Uniform)</SelectItem>
                                    <SelectItem value="absent_with_excuse">Absent (Excused)</SelectItem>
                                    <SelectItem value="absent_no_excuse">Absent (No Excuse)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-4 py-3">
                                <Input
                                  type="text"
                                  placeholder="Optional notes"
                                  value={bulkAttendanceNotes[student.id] || ''}
                                  onChange={(e) => {
                                    setBulkAttendanceNotes(prev => ({
                                      ...prev,
                                      [student.id]: e.target.value
                                    }))
                                  }}
                                  className="w-full"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )
            })()}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBulkAttendanceDialog(false)
                  setBulkAttendanceRecords({})
                  setBulkAttendanceNotes({})
                }}
                disabled={savingBulkAttendance}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkMarkAttendance}
                disabled={savingBulkAttendance || Object.keys(bulkAttendanceRecords).length === 0}
              >
                {savingBulkAttendance ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save All Attendance'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Absence Note Dialog */}
      <Dialog open={showAbsenceNoteDialog} onOpenChange={setShowAbsenceNoteDialog}>
        <DialogContent className="w-[95vw] sm:w-full max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Absence Note</DialogTitle>
            <DialogDescription>
              Leave instructions for other teachers to cover your classes when you're absent.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="absence-date">Absence Date *</Label>
              <Input
                id="absence-date"
                type="date"
                value={absenceDate}
                onChange={(e) => setAbsenceDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <Label htmlFor="absence-reason">Reason (Optional)</Label>
              <Input
                id="absence-reason"
                type="text"
                value={absenceReason}
                onChange={(e) => setAbsenceReason(e.target.value)}
                placeholder="e.g., Sick leave, Personal appointment, etc."
              />
            </div>
            <div>
              <Label htmlFor="absence-notes">Coverage Instructions *</Label>
              <Textarea
                id="absence-notes"
                value={absenceNoteText}
                onChange={(e) => setAbsenceNoteText(e.target.value)}
                placeholder="Provide detailed instructions for covering teachers, including what topics to cover, which students need special attention, homework assignments, etc."
                rows={6}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Be specific about what needs to be covered and any important information for substitute teachers.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowAbsenceNoteDialog(false)
                setAbsenceDate('')
                setAbsenceReason('')
                setAbsenceNoteText('')
              }}>
                Cancel
              </Button>
              <Button onClick={handleCreateAbsenceNote} disabled={!absenceDate || !absenceNoteText}>
                Create Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TeacherPortal

