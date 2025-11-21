import React, { useState } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const TeacherLogin: React.FC = () => {
  const [, setLocation] = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const emailLower = email.trim().toLowerCase()

      // Check if teacher exists in database
      const { data: teacher, error: dbError } = await supabase
        .from('teachers')
        .select('id, email, first_name, last_name')
        .eq('email', emailLower)
        .maybeSingle()

      if (dbError || !teacher) {
        throw new Error('No teacher account found with this email address. Please contact the administrator.')
      }

      // For now, we'll use a simple password check
      // In production, you should use Supabase Auth or a proper authentication system
      // For MVP, we'll store teacher credentials in a secure way
      // For now, let's use Supabase Auth similar to parents
      
      // Try to sign in with Supabase Auth
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: emailLower,
        password: password,
      })

      if (signInError) {
        // If sign-in fails, check if teacher needs to set up password
        throw new Error('Invalid email or password. Please contact the administrator to set up your account.')
      }

      // Store teacher ID in localStorage for persistence
      localStorage.setItem('teacherId', teacher.id.toString())
      localStorage.setItem('teacherEmail', emailLower)
      sessionStorage.setItem('teacherId', teacher.id.toString())
      sessionStorage.setItem('teacherEmail', emailLower)

      // Redirect to teacher portal
      setLocation('/teacher-portal')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
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
                Teacher Portal Login
              </CardTitle>
              <CardDescription className="text-center">
                Enter your email and password to access the teacher portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
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
                    disabled={loading}
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
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Need help?{' '}
                  <button
                    onClick={() => setLocation('/contact')}
                    className="text-primary hover:underline font-medium"
                  >
                    Contact Administrator
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

export default TeacherLogin

