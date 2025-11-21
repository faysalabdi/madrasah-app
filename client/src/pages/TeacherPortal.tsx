import React, { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trash2, Calendar, BookOpen, FileText, UserCheck, Plus, CheckCircle2, AlertCircle, Award, TrendingUp, Circle } from 'lucide-react'
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
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Student detail data
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [behaviorNotes, setBehaviorNotes] = useState<BehaviorNote[]>([])
  const [homework, setHomework] = useState<Homework[]>([])
  const [studentNotes, setStudentNotes] = useState<StudentNote[]>([])
  const [loadingStudentDetails, setLoadingStudentDetails] = useState(false)
  
  // Dialog states
  const [showStudentDetail, setShowStudentDetail] = useState(false)
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false)
  const [showBehaviorDialog, setShowBehaviorDialog] = useState(false)
  const [showHomeworkDialog, setShowHomeworkDialog] = useState(false)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  
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
  
  const [noteText, setNoteText] = useState('')
  
  // Student profile editing
  const [showProfileEditDialog, setShowProfileEditDialog] = useState(false)
  const [quranType, setQuranType] = useState<'iqra' | 'quran'>('iqra')
  const [quranLevel, setQuranLevel] = useState<string>('')
  const [quranPage, setQuranPage] = useState<string>('')
  const [quranSurah, setQuranSurah] = useState<string>('')
  const [quranAyah, setQuranAyah] = useState<string>('')
  const [behaviorStanding, setBehaviorStanding] = useState<string>('')

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

      // Load teacher data
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', teacherId)
        .single()

      if (teacherError) throw teacherError
      setTeacher(teacherData)

      // Load assigned students
      const { data: teacherStudents, error: studentsError } = await supabase
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
            quran_level,
            quran_page,
            quran_surah,
            quran_ayah,
            behavior_standing,
            parent_id
          )
        `)
        .eq('teacher_id', teacherId)

      if (studentsError) throw studentsError
      
      // Extract students from the join result
      const studentList = (teacherStudents || [])
        .map((ts: any) => ts.students)
        .filter(Boolean)
      
      setStudents(studentList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teacher data')
    } finally {
      setLoading(false)
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

      // Load attendance
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false })
        .limit(100)

      setAttendance(attendanceData || [])

      // Load behavior notes
      const { data: behaviorData } = await supabase
        .from('behavior_notes')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false })
        .limit(20)

      setBehaviorNotes(behaviorData || [])

      // Load homework
      const { data: homeworkData } = await supabase
        .from('homework')
        .select('*')
        .eq('student_id', studentId)
        .order('assigned_date', { ascending: false })
        .limit(20)

      setHomework(homeworkData || [])

      // Load student notes
      const { data: notesData } = await supabase
        .from('student_notes')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(20)

      setStudentNotes(notesData || [])
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

      setShowAttendanceDialog(false)
      setAttendanceDate(new Date().toISOString().split('T')[0])
      setAttendanceStatus('present_with_uniform')
      setAttendanceNotes('')
      loadStudentDetails(selectedStudent.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark attendance')
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
        })

      if (error) throw error

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

      setShowNoteDialog(false)
      setNoteText('')
      loadStudentDetails(selectedStudent.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note')
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note')
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
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary font-amiri">
                Teacher Portal
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome, {teacher?.first_name} {teacher?.last_name}
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

          {/* Students List */}
          <Card>
            <CardHeader>
              <CardTitle>My Students</CardTitle>
              <CardDescription>Click on a student to view and manage their details</CardDescription>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <p className="text-gray-500">No students assigned yet. Please contact the administrator.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleStudentClick(student)}
                      className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-semibold text-lg">
                        {student.first_name} {student.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {student.grade} • ID: {student.student_id || `STU-${student.id.toString().padStart(4, '0')}`}
                      </p>
                      {student.current_school && (
                        <p className="text-sm text-gray-500 mt-1">
                          {student.current_school}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Student Detail Dialog */}
      <Dialog open={showStudentDetail} onOpenChange={setShowStudentDetail}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
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
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {selectedStudent?.first_name || 'Unknown'} {selectedStudent?.last_name || ''}
                </DialogTitle>
                <DialogDescription className="text-base">
                  Grade {selectedStudent?.grade || 'N/A'} • Student ID: {selectedStudent?.student_id || (selectedStudent?.id ? `STU-${selectedStudent.id.toString().padStart(4, '0')}` : 'N/A')}
                </DialogDescription>
              </DialogHeader>

          <Tabs defaultValue="profile" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-5 h-12">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Attendance
              </TabsTrigger>
              <TabsTrigger value="homework" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Homework
              </TabsTrigger>
              <TabsTrigger value="behavior" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Behavior
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Notes
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" />
                  Student Profile
                </h3>
                <Button onClick={() => setShowProfileEditDialog(true)} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quran Progress Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Quran / Iqra Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const progress = getQuranProgressDisplay()
                      if (progress) {
                        return (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Type</span>
                              <Badge variant="outline" className="text-base px-3 py-1">
                                {progress.type === 'iqra' ? 'Iqra' : 'Quran'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Current Progress</span>
                              <span className="text-2xl font-bold text-primary">{progress.display}</span>
                            </div>
                          </div>
                        )
                      }
                      return <p className="text-gray-500">Quran/Iqra progress not set yet.</p>
                    })()}
                  </CardContent>
                </Card>

                {/* Behavior Standing Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Behavior Standing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedStudent?.behavior_standing ? (
                      <div className="flex items-center justify-center py-4">
                        <Badge className={`${
                          selectedStudent.behavior_standing === 'excellent' ? 'bg-green-100 text-green-800 border-green-300' :
                          selectedStudent.behavior_standing === 'good' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                          selectedStudent.behavior_standing === 'satisfactory' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                          selectedStudent.behavior_standing === 'needs_improvement' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                          'bg-red-100 text-red-800 border-red-300'
                        } border text-lg font-semibold px-6 py-3`}>
                          {selectedStudent.behavior_standing.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">Behavior standing not set yet.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Attendance Statistics with Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Attendance Statistics
                  </CardTitle>
                  <CardDescription>
                    Total records: {attendance.length}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const chartData = getAttendanceChartData()
                    if (attendance.length === 0 || chartData.length === 0) {
                      return <p className="text-gray-500 text-center py-8">No attendance records yet.</p>
                    }
                    return (
                      <ChartContainer
                        config={{
                          'Present (Uniform)': { label: 'Present (Uniform)', color: '#22c55e' },
                          'Present (No Uniform)': { label: 'Present (No Uniform)', color: '#eab308' },
                          'Late (Uniform)': { label: 'Late (Uniform)', color: '#f97316' },
                          'Late (No Uniform)': { label: 'Late (No Uniform)', color: '#f59e0b' },
                          'Absent (Excused)': { label: 'Absent (Excused)', color: '#3b82f6' },
                          'Absent (No Excuse)': { label: 'Absent (No Excuse)', color: '#ef4444' },
                        }}
                        className="h-[400px]"
                      >
                        <PieChart>
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Legend />
                        </PieChart>
                      </ChartContainer>
                    )
                  })()}
                </CardContent>
              </Card>
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
        <DialogContent className="max-w-2xl">
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
    </div>
  )
}

export default TeacherPortal

