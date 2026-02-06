import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const PortalLogin: React.FC = () => {
  const [, setLocation] = useLocation()
  const [userType, setUserType] = useState<'parent' | 'teacher'>('parent')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  // Check for existing session on mount (handles email confirmation redirects)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user?.email) {
          const userEmail = session.user.email.toLowerCase()
          
          // Check if user is a parent
          const { data: parent } = await supabase
            .from('parents')
            .select('id, parent1_email')
            .eq('parent1_email', userEmail)
            .maybeSingle()
          
          if (parent) {
            localStorage.setItem('parentId', parent.id.toString())
            localStorage.setItem('parentEmail', userEmail)
            sessionStorage.setItem('parentId', parent.id.toString())
            sessionStorage.setItem('parentEmail', userEmail)
            setLocation('/parent-portal')
            return
          }
          
          // Check if user is a teacher
          const { data: teacher } = await supabase
            .from('teachers')
            .select('id, email, first_name, last_name')
            .eq('email', userEmail)
            .maybeSingle()
          
          if (teacher) {
            localStorage.setItem('teacherId', teacher.id.toString())
            localStorage.setItem('teacherEmail', userEmail)
            localStorage.setItem('teacherName', `${teacher.first_name} ${teacher.last_name}`)
            setLocation('/teacher-portal')
            return
          }
        }
      } catch (err) {
        console.error('Error checking session:', err)
      } finally {
        setCheckingSession(false)
      }
    }
    
    checkSession()
  }, [setLocation])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCheckingEmail(true)
    setError(null)
    setSuccess(false)

    try {
      const emailLower = email.trim().toLowerCase()

      if (userType === 'parent') {
        // Check if parent exists in our 'parents' table
        const { data: parent, error: dbError } = await supabase
          .from('parents')
          .select('id, parent1_email, parent1_first_name, parent1_last_name')
          .eq('parent1_email', emailLower)
          .maybeSingle()

        if (dbError) throw dbError

        if (!parent) {
          setError('No account found with this email address. Please contact the school if you believe this is an error.')
          return
        }

        // Try to sign in with a dummy password to check if user exists in auth
        // This will fail, but tells us if the user exists
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: emailLower,
          password: 'dummy_check_password_12345',
        })

        if (signInError && signInError.message.includes('Invalid login credentials')) {
          // User exists in Auth, prompt for password
          setNeedsPasswordSetup(true)
        } else if (signInError && (signInError.message.includes('Email not confirmed') || signInError.message.includes('not found'))) {
          // User doesn't exist in Auth or not confirmed, send setup email
          await sendPasswordSetupEmail(emailLower, `${parent.parent1_first_name} ${parent.parent1_last_name}`)
          setSuccess(true)
          setError(null)
        } else {
          // Other error or user exists, prompt for password
          setNeedsPasswordSetup(true)
        }
      } else {
        // Teacher login
        const { data: teacher, error: dbError } = await supabase
          .from('teachers')
          .select('id, email, first_name, last_name')
          .eq('email', emailLower)
          .maybeSingle()

        if (dbError) throw dbError

        if (!teacher) {
          setError('No teacher account found with this email address.')
          return
        }

        // Try to sign in with a dummy password to check if user exists in auth
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: emailLower,
          password: 'dummy_check_password_12345',
        })

        if (signInError && signInError.message.includes('Invalid login credentials')) {
          // User exists in Auth, prompt for password
          setNeedsPasswordSetup(true)
        } else if (signInError && (signInError.message.includes('Email not confirmed') || signInError.message.includes('not found'))) {
          setError('Please contact the administrator to set up your account.')
          return
        } else {
          // User exists, prompt for password
          setNeedsPasswordSetup(true)
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setCheckingEmail(false)
    }
  }

  const sendPasswordSetupEmail = async (targetEmail: string, fullName: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-password-setup-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            toEmail: targetEmail,
            parentName: fullName,
            redirectUrl: `${window.location.origin}/portal`,
          }),
        }
      )
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to send password setup email:', errorData)
        throw new Error(errorData.error || 'Failed to send password setup email.')
      }
    } catch (emailError: any) {
      console.error('Error in sendPasswordSetupEmail:', emailError)
      setError(`Failed to send password setup email: ${emailError.message}. Please contact support.`)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const emailLower = email.trim().toLowerCase()

      // Try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: emailLower,
        password: password,
      })

      if (signInError) {
        throw new Error('Invalid password. Please try again or set up a new password.')
      }

      // Successfully signed in
      if (userType === 'parent') {
        await handleSuccessfulParentLogin()
      } else {
        await handleSuccessfulTeacherLogin()
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
      setLoading(false)
    }
  }

  const handleSuccessfulParentLogin = async () => {
    try {
      const emailLower = email.trim().toLowerCase()
      const { data: parent, error: dbError } = await supabase
        .from('parents')
        .select('id, parent1_email, parent_id')
        .eq('parent1_email', emailLower)
        .single()

      if (dbError || !parent) {
        throw new Error('Could not find your account. Please contact support.')
      }

      localStorage.setItem('parentId', parent.id.toString())
      localStorage.setItem('parentEmail', emailLower)
      sessionStorage.setItem('parentId', parent.id.toString())
      sessionStorage.setItem('parentEmail', emailLower)

      setLocation('/parent-portal')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
      setLoading(false)
    }
  }

  const handleSuccessfulTeacherLogin = async () => {
    try {
      const emailLower = email.trim().toLowerCase()
      const { data: teacher, error: dbError } = await supabase
        .from('teachers')
        .select('id, first_name, last_name, email')
        .eq('email', emailLower)
        .single()

      if (dbError || !teacher) {
        throw new Error('Could not find your account. Please contact support.')
      }

      localStorage.setItem('teacherId', teacher.id.toString())
      localStorage.setItem('teacherEmail', emailLower)
      localStorage.setItem('teacherName', `${teacher.first_name} ${teacher.last_name}`)

      setLocation('/teacher-portal')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
      setLoading(false)
    }
  }

  // Show loading while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-neutral-background py-16 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <p className="text-center">Checking session...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-primary font-amiri text-center">
                Portal Login
              </CardTitle>
              <CardDescription className="text-center">
                Select your account type and enter your credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={userType} onValueChange={(value) => {
                setUserType(value as 'parent' | 'teacher')
                setEmail('')
                setPassword('')
                setError(null)
                setSuccess(false)
                setNeedsPasswordSetup(false)
              }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="parent">Parent</TabsTrigger>
                  <TabsTrigger value="teacher">Teacher</TabsTrigger>
                </TabsList>

                <TabsContent value={userType}>
                  {error && !success && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="mb-4 border-green-500 bg-green-50">
                      <AlertDescription>
                        Password setup email sent! Please check your email and click the link to set up your password.
                        <br />
                        <Button
                          variant="link"
                          className="p-0 h-auto mt-2"
                          onClick={() => setLocation('/parent-password-setup')}
                        >
                          Or continue to password setup page
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  {!needsPasswordSetup ? (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="your.email@example.com"
                          className="w-full"
                          disabled={checkingEmail}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={checkingEmail}
                        className="w-full"
                      >
                        {checkingEmail ? 'Checking...' : 'Continue'}
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          type="password"
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="Enter your password"
                          className="w-full"
                          disabled={loading}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? 'Logging In...' : 'Log In'}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setNeedsPasswordSetup(false)
                          setPassword('')
                          setSuccess(false)
                        }}
                        className="w-full"
                      >
                        Back
                      </Button>

                      {userType === 'parent' && (
                        <div className="text-center">
                          <p className="text-sm text-gray-600">
                            Don't have a password?{' '}
                            <button
                              type="button"
                              onClick={() => {
                                sessionStorage.setItem('passwordSetupEmail', email)
                                setLocation('/parent-password-setup')
                              }}
                              className="text-primary hover:underline font-medium"
                            >
                              Set up password
                            </button>
                          </p>
                        </div>
                      )}
                    </form>
                  )}
                </TabsContent>
              </Tabs>

              {userType === 'parent' && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    New parent?{' '}
                    <button
                      onClick={() => setLocation('/admission')}
                      className="text-primary hover:underline font-medium"
                    >
                      Apply for Admission
                    </button>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PortalLogin

