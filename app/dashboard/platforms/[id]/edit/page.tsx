'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { adminPlatformsApi } from '@/lib/api/platforms'
import type { AdPlatform, CreatePlatformData } from '@/lib/types/platform.types'
import { PlatformForm } from '@/components/admin/platform-form'

export default function EditPlatformPage() {
  const params = useParams()
  const router = useRouter()
  const [platform, setPlatform] = useState<AdPlatform | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchPlatform = async () => {
      try {
        const data = await adminPlatformsApi.getPlatform(params.id as string)
        setPlatform(data)
      } catch (error) {
        console.error('Failed to fetch platform:', error)
        router.push('/dashboard/platforms')
      } finally {
        setLoading(false)
      }
    }
    fetchPlatform()
  }, [params.id, router])

  const handleSubmit = async (data: CreatePlatformData) => {
    setSaving(true)
    try {
      await adminPlatformsApi.updatePlatform(params.id as string, data)
      router.push('/dashboard/platforms')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !platform) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Platform</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update {platform.name} configuration.
        </p>
      </div>
      <PlatformForm platform={platform} onSubmit={handleSubmit} loading={saving} />
    </div>
  )
}
