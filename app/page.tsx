'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { tokenStorage } from '@/lib/utils/token-storage'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    if (tokenStorage.hasTokens()) {
      router.push('/dashboard')
    } else {
      router.push('/signin')
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
    </div>
  )
}
