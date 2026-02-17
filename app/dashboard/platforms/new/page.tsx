'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminPlatformsApi } from '@/lib/api/platforms'
import type { CreatePlatformData } from '@/lib/types/platform.types'
import { PlatformForm } from '@/components/admin/platform-form'

export default function NewPlatformPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: CreatePlatformData) => {
    setLoading(true)
    try {
      await adminPlatformsApi.createPlatform(data)
      router.push('/dashboard/platforms')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Platform</h1>
        <p className="text-sm text-gray-500 mt-1">
          Add a new ad platform with OAuth credentials.
        </p>
      </div>
      <PlatformForm onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
