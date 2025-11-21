import React, { useState } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

const AdminLogin: React.FC = () => {
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
      // For admin, we'll use a simple approach: check if it's a teacher email
      // In production, you might want to add an is_admin flag to teachers table
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      })

      if (signInError) {
        throw signInError
      }

      if (data.session) {
        // Check if the logged-in user is a teacher (admins are teachers for now)
        const { data: teacherData, error: teacherError } = await supabase
          .from('teachers')
          .select('id, first_name, last_name, email')
          .eq('email', email.trim().toLowerCase())
          .maybeSingle()

        if (teacherError && teacherError.code !== 'PGRST116') {
          throw teacherError
        }

        if (!teacherData) {
          // For now, allow any authenticated user to access admin
          // In production, add an is_admin flag check here
          localStorage.setItem('adminEmail', email.trim().toLowerCase())
          localStorage.setItem('adminName', 'Administrator')
          setLocation('/admin-portal')
        } else {
          localStorage.setItem('adminId', teacherData.id.toString())
          localStorage.setItem('adminEmail', email.trim().toLowerCase())
          localStorage.setItem('adminName', `${teacherData.first_name} ${teacherData.last_name}`)
          setLocation('/admin-portal')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
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
                Admin Portal Login
              </CardTitle>
              <CardDescription className="text-center">
                Administrative access only
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
                    placeholder="admin@example.com"
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
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging In...
                    </>
                  ) : (
                    'Log In'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  <button
                    onClick={() => setLocation('/portal')}
                    className="text-primary hover:underline font-medium"
                  >
                    Back to Portal
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

export default AdminLogin

