import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const ParentPasswordSetup: React.FC = () => {
  const [, setLocation] = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [verifying, setVerifying] = useState(true)

  useEffect(() => {
    // Check if we have a token in the URL (from email confirmation)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const type = hashParams.get('type')

    if (accessToken) {
      // This is a password reset/confirmation link from email
      setVerifying(false)
    } else {
      // Check if email is in sessionStorage (from previous step)
      const storedEmail = sessionStorage.getItem('passwordSetupEmail')
      if (storedEmail) {
        setEmail(storedEmail)
        setVerifying(false)
      } else {
        setError('No setup link found. Please request a new password setup email from the login page.')
        setVerifying(false)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const emailLower = email.trim().toLowerCase()

      // Check if we have a token in the URL (email confirmation)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (accessToken && refreshToken) {
        // User came from email confirmation link
        // Set the session
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (sessionError) throw sessionError

        // Update password
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        })

        if (updateError) throw updateError

        // Success - redirect to portal
        await handleSuccessfulSetup()
      } else {
        // No token - try to sign up (create new account)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: emailLower,
          password: password,
          options: {
            emailRedirectTo: `${window.location.origin}/portal`,
          },
        })

        if (authError) {
          // If user already exists, try password reset
          if (authError.message.includes('already registered')) {
            // Request password reset to get confirmation email
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(emailLower, {
              redirectTo: `${window.location.origin}/portal`,
            })

            if (resetError) throw resetError

            setSuccess(true)
            setError('An account with this email already exists. Please check your email for a password reset link, or try logging in with your existing password.')
            setLoading(false)
            return
          }
          throw authError
        }

        // Check if email confirmation is required
        if (authData.user && !authData.session) {
          setSuccess(true)
          setError('Please check your email to confirm your account. After confirmation, you can set your password.')
          setLoading(false)
          return
        }

        // Successfully created and signed in
        await handleSuccessfulSetup()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to set up password. Please try again.')
      setLoading(false)
    }
  }

  const handleSuccessfulSetup = async () => {
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
      sessionStorage.removeItem('passwordSetupEmail')

      // Redirect to portal
      setLocation('/parent-portal')
    } catch (err: any) {
      setError(err.message || 'Setup failed. Please try again.')
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-neutral-background py-16 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <p className="text-center">Verifying setup link...</p>
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
                Set Up Your Password
              </CardTitle>
              <CardDescription className="text-center">
                Create a password to access your parent portal
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
                  <AlertDescription>{error || 'Password setup email sent! Please check your email.'}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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
                    disabled={loading || !!email}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password (min 6 characters)"
                    className="w-full"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500">
                    Password must be at least 6 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm your password"
                    className="w-full"
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || success}
                  className="w-full"
                >
                  {loading ? 'Setting Up...' : 'Set Up Password'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Already have a password?{' '}
                  <button
                            onClick={() => setLocation('/portal')}
                    className="text-primary hover:underline font-medium"
                  >
                    Log In
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

export default ParentPasswordSetup

