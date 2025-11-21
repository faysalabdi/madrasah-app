import React, { useState } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const ParentLogin: React.FC = () => {
  const [, setLocation] = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [needsPasswordSetup, setNeedsPasswordSetup] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCheckingEmail(true)
    setError(null)

    try {
      const emailLower = email.trim().toLowerCase()

      // Check if parent exists with this email
      const { data: parent, error: dbError } = await supabase
        .from('parents')
        .select('id, parent1_email, parent_id, parent1_first_name, parent1_last_name')
        .eq('parent1_email', emailLower)
        .maybeSingle()

      if (dbError) {
        throw new Error('Error checking email. Please try again.')
      }

      if (!parent) {
        throw new Error('No account found with this email address. Please contact the school if you believe this is an error.')
      }

      // Try to sign in with a dummy password to check if user exists in auth
      // This will fail, but tells us if the user exists
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: emailLower,
        password: 'dummy_check_password_12345',
      })

      // If error is "Invalid login credentials", user exists but password is wrong
      // If error is "Email not confirmed" or "User not found", user doesn't exist
      const userExists = signInError?.message?.includes('Invalid login credentials') || 
                         signInError?.message?.includes('Email not confirmed')

      if (userExists) {
        // User exists in auth - show password login
        setNeedsPasswordSetup(true)
      } else {
        // User doesn't exist in auth - send password setup email
        await sendPasswordSetupEmail(emailLower, parent)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setCheckingEmail(false)
    }
  }

  const sendPasswordSetupEmail = async (email: string, parent: any) => {
    try {
      // Request password reset (this sends a confirmation email)
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/parent-password-setup`,
      })

      if (resetError) {
        // If that fails, try signup which will send confirmation email
        const { error: signupError } = await supabase.auth.signUp({
          email: email,
          password: 'temp_password_' + Math.random().toString(36).slice(2),
          options: {
            emailRedirectTo: `${window.location.origin}/parent-password-setup`,
          },
        })

        if (signupError && !signupError.message.includes('already registered')) {
          throw signupError
        }
      }

      // Also send custom email via Edge Function
      const parentName = `${parent.parent1_first_name} ${parent.parent1_last_name}`
      const confirmationUrl = `${window.location.origin}/parent-password-setup`

      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-password-setup-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: email,
          confirmationUrl: confirmationUrl,
          parentName: parentName,
        }),
      }).catch(() => {
        // Don't fail if email sending fails
      })

      // Store email for password setup page
      sessionStorage.setItem('passwordSetupEmail', email)

      // Show success message
      setError(null)
      setSuccess(true)
      setNeedsPasswordSetup(false)
    } catch (err: any) {
      throw new Error('Failed to send password setup email. Please try again or contact support.')
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
      await handleSuccessfulLogin()
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
      setLoading(false)
    }
  }

  const handleSuccessfulLogin = async () => {
    try {
      // Get parent data
      const emailLower = email.trim().toLowerCase()
      const { data: parent, error: dbError } = await supabase
        .from('parents')
        .select('id, parent1_email, parent_id')
        .eq('parent1_email', emailLower)
        .single()

      if (dbError || !parent) {
        throw new Error('Could not find your account. Please contact support.')
      }

      // Store parent ID in localStorage for persistence
      localStorage.setItem('parentId', parent.id.toString())
      localStorage.setItem('parentEmail', emailLower)
      // Also store in sessionStorage for compatibility
      sessionStorage.setItem('parentId', parent.id.toString())
      sessionStorage.setItem('parentEmail', emailLower)

      // Redirect to portal
      setLocation('/parent-portal')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-primary font-amiri text-center">
                Parent Portal Login
              </CardTitle>
              <CardDescription className="text-center">
                Enter your email address to access your parent portal
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                </form>
              )}

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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ParentLogin

