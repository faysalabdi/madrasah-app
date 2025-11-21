import React, { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
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
  parent_id: number
}

interface Attendance {
  id: number
  student_id: number
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
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
  
  // Dialog states
  const [showStudentDetail, setShowStudentDetail] = useState(false)
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false)
  const [showBehaviorDialog, setShowBehaviorDialog] = useState(false)
  const [showHomeworkDialog, setShowHomeworkDialog] = useState(false)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  
  // Form states
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceStatus, setAttendanceStatus] = useState<'present' | 'absent' | 'late' | 'excused'>('present')
  const [attendanceNotes, setAttendanceNotes] = useState('')
  
  const [behaviorType, setBehaviorType] = useState<'positive' | 'concern' | 'incident'>('positive')
  const [behaviorTitle, setBehaviorTitle] = useState('')
  const [behaviorDescription, setBehaviorDescription] = useState('')
  
  const [homeworkTitle, setHomeworkTitle] = useState('')
  const [homeworkDescription, setHomeworkDescription] = useState('')
  const [homeworkDueDate, setHomeworkDueDate] = useState('')
  
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      let teacherId = localStorage.getItem('teacherId') || sessionStorage.getItem('teacherId')
      
      if (!teacherId) {
        setLocation('/teacher-login')
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
        setLocation('/teacher-login')
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
      // Load attendance
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false })
        .limit(30)

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
    } catch (err) {
      console.error('Error loading student details:', err)
    }
  }

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student)
    setShowStudentDetail(true)
    loadStudentDetails(student.id)
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
      setAttendanceStatus('present')
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('teacherId')
    localStorage.removeItem('teacherEmail')
    sessionStorage.removeItem('teacherId')
    sessionStorage.removeItem('teacherEmail')
    setLocation('/teacher-login')
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
              <Button onClick={() => setLocation('/teacher-login')} className="mt-4 w-full">
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedStudent?.first_name} {selectedStudent?.last_name}
            </DialogTitle>
            <DialogDescription>
              Grade {selectedStudent?.grade} • Student ID: {selectedStudent?.student_id || `STU-${selectedStudent?.id.toString().padStart(4, '0')}`}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="attendance" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="behavior">Behavior</TabsTrigger>
              <TabsTrigger value="homework">Homework</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="attendance" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Attendance Records</h3>
                <Button onClick={() => setShowAttendanceDialog(true)} size="sm">
                  Mark Attendance
                </Button>
              </div>
              <div className="space-y-2">
                {attendance.length === 0 ? (
                  <p className="text-gray-500">No attendance records yet.</p>
                ) : (
                  attendance.map((record) => (
                    <div key={record.id} className="border rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                        {record.notes && (
                          <p className="text-sm text-gray-600 mt-1">{record.notes}</p>
                        )}
                      </div>
                      <Badge
                        variant={
                          record.status === 'present' ? 'default' :
                          record.status === 'late' ? 'secondary' :
                          'destructive'
                        }
                      >
                        {record.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="behavior" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Behavior Notes</h3>
                <Button onClick={() => setShowBehaviorDialog(true)} size="sm">
                  Add Note
                </Button>
              </div>
              <div className="space-y-2">
                {behaviorNotes.length === 0 ? (
                  <p className="text-gray-500">No behavior notes yet.</p>
                ) : (
                  behaviorNotes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{note.title}</p>
                          <p className="text-sm text-gray-600">{new Date(note.date).toLocaleDateString()}</p>
                        </div>
                        <Badge
                          variant={
                            note.type === 'positive' ? 'default' :
                            note.type === 'concern' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {note.type}
                        </Badge>
                      </div>
                      <p className="text-sm">{note.description}</p>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="homework" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Homework</h3>
                <Button onClick={() => setShowHomeworkDialog(true)} size="sm">
                  Assign Homework
                </Button>
              </div>
              <div className="space-y-2">
                {homework.length === 0 ? (
                  <p className="text-gray-500">No homework assigned yet.</p>
                ) : (
                  homework.map((hw) => (
                    <div key={hw.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{hw.title}</p>
                          <p className="text-sm text-gray-600">
                            Assigned: {new Date(hw.assigned_date).toLocaleDateString()}
                            {hw.due_date && ` • Due: ${new Date(hw.due_date).toLocaleDateString()}`}
                          </p>
                        </div>
                        <Badge variant={hw.completed ? 'default' : 'secondary'}>
                          {hw.completed ? 'Completed' : 'Pending'}
                        </Badge>
                      </div>
                      {hw.description && (
                        <p className="text-sm text-gray-600">{hw.description}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">General Notes</h3>
                <Button onClick={() => setShowNoteDialog(true)} size="sm">
                  Add Note
                </Button>
              </div>
              <div className="space-y-2">
                {studentNotes.length === 0 ? (
                  <p className="text-gray-500">No notes yet.</p>
                ) : (
                  studentNotes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-1">
                        {new Date(note.created_at).toLocaleDateString()}
                      </p>
                      <p>{note.note}</p>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
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
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="excused">Excused</SelectItem>
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
    </div>
  )
}

export default TeacherPortal

