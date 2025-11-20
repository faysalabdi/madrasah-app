import { useState, useCallback } from 'react'

interface UseSupabaseFunctionOptions {
  requireAuth?: boolean
}

export function useSupabaseFunction<T = any>(
  functionName: string,
  options: UseSupabaseFunctionOptions = {}
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const callFunction = useCallback(
    async (body?: any): Promise<T> => {
      setLoading(true)
      setError(null)

      try {
        // Ensure we have the Supabase URL
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

        // Debug: log env vars (remove in production)
        console.log('Environment check:', {
          hasSupabaseUrl: !!supabaseUrl,
          hasAnonKey: !!supabaseAnonKey,
          supabaseUrl: supabaseUrl?.substring(0, 30) + '...',
        })

        if (!supabaseUrl) {
          throw new Error(
            'VITE_SUPABASE_URL is not set. Please check your .env file and restart the dev server. ' +
            `Current value: ${import.meta.env.VITE_SUPABASE_URL}`
          )
        }

        if (!supabaseAnonKey) {
          throw new Error(
            'VITE_SUPABASE_ANON_KEY is not set. Please check your .env file and restart the dev server. ' +
            `Current value: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'set' : 'not set'}`
          )
        }

        // Ensure URL is absolute (starts with http:// or https://)
        const functionUrl = supabaseUrl.startsWith('http')
          ? `${supabaseUrl}/functions/v1/${functionName}`
          : `https://${supabaseUrl}/functions/v1/${functionName}`

        console.log('Calling Edge Function:', functionUrl)

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify(body),
        })

        // Check if response is JSON or HTML (error page)
        const contentType = response.headers.get("content-type") || ""
        const isJson = contentType.includes("application/json")
        
        if (!response.ok) {
          let errorMessage = `Function call failed: ${response.statusText}`
          
          if (isJson) {
            try {
              const errorData = await response.json()
              errorMessage = errorData.error || errorData.message || errorMessage
            } catch (e) {
              // JSON parse failed, use default message
            }
          } else {
            // Response is HTML (error page), try to extract error
            const text = await response.text()
            if (response.status === 404) {
              errorMessage = `Edge Function "${functionName}" not found. The function may not be deployed yet.`
            } else {
              errorMessage = `Server returned HTML instead of JSON. Status: ${response.status}. The function may not be properly configured.`
            }
          }
          
          throw new Error(errorMessage)
        }

        if (!isJson) {
          const text = await response.text()
          throw new Error(`Expected JSON response but got: ${text.substring(0, 100)}`)
        }

        const data = await response.json()
        return data as T
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [functionName, options.requireAuth]
  )

  return {
    callFunction,
    loading,
    error,
  }
}