'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { tokenStorage } from '@/lib/utils/token-storage'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = () => {
      try {
        // Supabase OAuth returns tokens in URL fragment (after #)
        const hash = window.location.hash.substring(1)

        if (!hash) {
          const urlParams = new URLSearchParams(window.location.search)
          const errorParam = urlParams.get('error')
          const errorDescription = urlParams.get('error_description')

          if (errorParam) {
            setError(errorDescription || errorParam)
            setTimeout(() => router.push('/signin?error=oauth_failed'), 2000)
            return
          }

          setError('No authentication data received')
          setTimeout(() => router.push('/signin?error=oauth_failed'), 2000)
          return
        }

        // Parse the hash fragment
        const params = new URLSearchParams(hash)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')

        if (!accessToken || !refreshToken) {
          setError('Missing authentication tokens')
          setTimeout(() => router.push('/signin?error=oauth_failed'), 2000)
          return
        }

        // Store tokens
        tokenStorage.setTokens({ accessToken, refreshToken })

        // Redirect to admin dashboard
        router.push('/dashboard')
      } catch (err) {
        console.error('OAuth callback error:', err)
        setError('Failed to process authentication')
        setTimeout(() => router.push('/signin?error=oauth_failed'), 2000)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="text-red-500 text-lg">{error}</div>
            <p className="text-gray-500">Redirecting to sign in...</p>
          </>
        ) : (
          <>
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto" />
            <p className="text-gray-900 text-lg">Completing sign in...</p>
          </>
        )}
      </div>
    </div>
  )
}
