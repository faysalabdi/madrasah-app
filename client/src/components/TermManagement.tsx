import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar, Plus, Loader2, AlertTriangle, CheckCircle2, ArrowRight, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Term {
  id: number
  name: string
  term_number: number
  start_date: string
  end_date: string
  academic_year: string
  is_current: boolean
  invoice_sent: boolean
  invoice_sent_date: string | null
  created_at: string
  dataCount?: {
    attendance: number
    homework: number
    snapshots: number
  }
}

export const TermManagement: React.FC = () => {
  const { toast } = useToast()
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(true)
  const [showTransitionDialog, setShowTransitionDialog] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [currentTerm, setCurrentTerm] = useState<Term | null>(null)
  
  // Delete term state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [termToDelete, setTermToDelete] = useState<Term | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  
  // New term form
  const [newTermNumber, setNewTermNumber] = useState(1)
  const [newStartDate, setNewStartDate] = useState('')
  const [newEndDate, setNewEndDate] = useState('')
  const [newAcademicYear, setNewAcademicYear] = useState('')

  useEffect(() => {
    loadTerms()
  }, [])

  const loadTerms = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('terms')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setTerms(data || [])
      const current = data?.find(t => t.is_current)
      setCurrentTerm(current || null)

      // Auto-populate next term details
      if (current) {
        const nextTermNumber = current.term_number === 4 ? 1 : current.term_number + 1
        const nextYear = current.term_number === 4 
          ? String(parseInt(current.academic_year) + 1)
          : current.academic_year
        
        setNewTermNumber(nextTermNumber)
        setNewAcademicYear(nextYear)
      }
    } catch (err: any) {
      console.error('Error loading terms:', err)
      toast({
        title: 'Error',
        description: 'Failed to load terms',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOpenTransitionDialog = () => {
    if (!currentTerm) {
      toast({
        title: 'Error',
        description: 'No current term found. Please create a term first.',
        variant: 'destructive',
      })
      return
    }
    setShowTransitionDialog(true)
  }

  const handleTransitionTerm = async () => {
    if (!currentTerm) return

    if (!newStartDate || !newAcademicYear) {
      toast({
        title: 'Error',
        description: 'Please fill in required fields',
        variant: 'destructive',
      })
      return
    }

    // If no end date provided for new term, use a placeholder far in future
    const endDate = newEndDate || '2099-12-31'

    if (newTermNumber < 1 || newTermNumber > 4) {
      toast({
        title: 'Error',
        description: 'Term number must be between 1 and 4',
        variant: 'destructive',
      })
      return
    }

    // Check for duplicate term
    const duplicate = terms.find(
      t => t.term_number === newTermNumber && t.academic_year === newAcademicYear
    )
    if (duplicate) {
      toast({
        title: 'Error',
        description: `Term ${newTermNumber} for ${newAcademicYear} already exists!`,
        variant: 'destructive',
      })
      return
    }

    // Generate term name
    const newTermName = `Term ${newTermNumber} - ${newAcademicYear}`

    try {
      setTransitioning(true)

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transition-term`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          currentTermId: currentTerm.id,
          newTermName,
          newTermNumber,
          newStartDate,
          newEndDate: endDate,
          newAcademicYear,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to transition term')
      }

      toast({
        title: 'Success',
        description: `Term transition completed! ${result.snapshotsCreated} student snapshots created.${result.gradeProgressionApplied ? ' Students promoted to next grade.' : ''}`,
      })

      setShowTransitionDialog(false)
      await loadTerms()

    } catch (err: any) {
      console.error('Error transitioning term:', err)
      toast({
        title: 'Error',
        description: err.message || 'Failed to transition term',
        variant: 'destructive',
      })
    } finally {
      setTransitioning(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getTermBadgeVariant = (term: Term): "default" | "secondary" | "destructive" | "outline" => {
    if (term.is_current) return "default"
    return "outline"
  }

  const handleDeleteTerm = async () => {
    if (!termToDelete || deleteConfirmation !== termToDelete.name) {
      toast({
        title: 'Error',
        description: 'Please type the term name exactly to confirm deletion',
        variant: 'destructive',
      })
      return
    }

    try {
      setDeleting(true)

      const { error } = await supabase
        .from('terms')
        .delete()
        .eq('id', termToDelete.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: `${termToDelete.name} has been deleted`,
      })

      setShowDeleteDialog(false)
      setTermToDelete(null)
      setDeleteConfirmation('')
      await loadTerms()

    } catch (err: any) {
      console.error('Error deleting term:', err)
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete term',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
    }
  }

  const openDeleteDialog = async (term: Term) => {
    // Check if there's data associated with this term
    const { count: attendanceCount } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('term_id', term.id)
    
    const { count: homeworkCount } = await supabase
      .from('homework')
      .select('*', { count: 'exact', head: true })
      .eq('term_id', term.id)
    
    const { count: snapshotCount } = await supabase
      .from('student_term_snapshots')
      .select('*', { count: 'exact', head: true })
      .eq('term_id', term.id)

    // Store counts for display
    term.dataCount = {
      attendance: attendanceCount || 0,
      homework: homeworkCount || 0,
      snapshots: snapshotCount || 0,
    }

    setTermToDelete(term)
    setShowDeleteDialog(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Term Management</h2>
          <p className="text-muted-foreground">
            Manage academic terms and transition between periods
          </p>
        </div>
        <Button onClick={handleOpenTransitionDialog} disabled={!currentTerm}>
          <Plus className="mr-2 h-4 w-4" />
          New Term
        </Button>
      </div>

      {/* Current Term Alert */}
      {currentTerm && (
        <Alert>
          <Calendar className="h-4 w-4" />
          <AlertDescription>
            <span className="font-semibold">Current Term: </span>
            {currentTerm.name} ({formatDate(currentTerm.start_date)} - {formatDate(currentTerm.end_date)})
          </AlertDescription>
        </Alert>
      )}

      {/* Warning about term transitions */}
      <Alert variant="default" className="border-yellow-500 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Important:</strong> Starting a new term will:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Create snapshots of all student data (attendance, homework, behavior)</li>
            <li>Reset payment statuses - new invoices will need to be sent</li>
            <li>If transitioning from Term 4 to Term 1, students will be promoted to the next grade</li>
            <li>Grade 6 students will become Grade 7</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Terms List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {terms.map((term) => (
          <Card key={term.id} className={term.is_current ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{term.name}</CardTitle>
                  <CardDescription>
                    Term {term.term_number} • {term.academic_year}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getTermBadgeVariant(term)}>
                    {term.is_current ? 'Current' : 'Past'}
                  </Badge>
                  {!term.is_current && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => openDeleteDialog(term)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start:</span>
                  <span>{formatDate(term.start_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End:</span>
                  <span>{term.end_date === '2099-12-31' ? 'Not set' : formatDate(term.end_date)}</span>
                </div>
                {term.invoice_sent && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Invoices sent {term.invoice_sent_date ? formatDate(term.invoice_sent_date) : ''}</span>
                  </div>
                )}
                {term.is_current && (
                  <Button 
                    onClick={handleOpenTransitionDialog}
                    className="w-full mt-2"
                    size="sm"
                  >
                    End Term & Start New
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transition Dialog */}
      <Dialog open={showTransitionDialog} onOpenChange={setShowTransitionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Start New Term</DialogTitle>
            <DialogDescription>
              This will archive the current term and create a new one. All student data will be preserved in snapshots.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {currentTerm && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Current Term</p>
                    <p className="text-sm text-muted-foreground">{currentTerm.name}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">New Term</p>
                    <p className="text-sm text-muted-foreground">Term {newTermNumber}</p>
                  </div>
                </div>
                {currentTerm.term_number === 4 && newTermNumber === 1 && (
                  <Alert variant="default" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Grade Progression:</strong> All students will be promoted to the next grade level.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="term-number">Term Number *</Label>
                  <Input
                    id="term-number"
                    type="number"
                    min="1"
                    max="4"
                    value={newTermNumber}
                    onChange={(e) => setNewTermNumber(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academic-year">Academic Year *</Label>
                  <Input
                    id="academic-year"
                    type="number"
                    value={newAcademicYear}
                    onChange={(e) => setNewAcademicYear(e.target.value)}
                    placeholder="e.g., 2026"
                  />
                  <p className="text-xs text-muted-foreground">
                    Term will be named: "Term {newTermNumber} - {newAcademicYear || 'YYYY'}"
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date *</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date (Optional)</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank if unknown - can set later with "End Term" button
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowTransitionDialog(false)}
                disabled={transitioning}
              >
                Cancel
              </Button>
              <Button
                onClick={handleTransitionTerm}
                disabled={transitioning}
              >
                {transitioning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Start New Term'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Term Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Delete Term - {termToDelete?.name}</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Please read carefully.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {termToDelete?.is_current && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Cannot delete current term!</strong> Please create and transition to a new term first.
                </AlertDescription>
              </Alert>
            )}

            {!termToDelete?.is_current && (
              <>
                <Alert variant="default" className="border-red-500 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <strong>What will happen:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Preserved:</strong> Attendance, homework, behavior notes, payments will remain in the database but lose their term association (term_id becomes NULL)</li>
                      <li><strong>Permanently Deleted:</strong> {termToDelete?.dataCount?.snapshots || 0} historical snapshot(s) will be lost forever</li>
                      <li>This is typically only needed if a term was created by mistake</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p className="font-semibold">Data associated with this term:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Attendance records:</div>
                    <div className="font-medium">{termToDelete?.dataCount?.attendance || 0}</div>
                    <div>Homework records:</div>
                    <div className="font-medium">{termToDelete?.dataCount?.homework || 0}</div>
                    <div>Historical snapshots:</div>
                    <div className="font-medium text-red-600">{termToDelete?.dataCount?.snapshots || 0} (will be deleted)</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-delete">
                    Type the term name <strong className="text-red-600">{termToDelete?.name}</strong> to confirm deletion:
                  </Label>
                  <Input
                    id="confirm-delete"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder={termToDelete?.name}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteDialog(false)
                      setTermToDelete(null)
                      setDeleteConfirmation('')
                    }}
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteTerm}
                    disabled={deleting || deleteConfirmation !== termToDelete?.name}
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Term
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

