'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { adminPostFieldsApi } from '@/lib/api/post-fields'
import { adminPlatformsApi } from '@/lib/api/platforms'
import { PlatformFieldMapper } from '@/components/admin/platform-field-mapper'
import type { PostField, PlatformPostField, BulkPlatformFieldMapping } from '@/lib/types/post-field.types'
import type { AdPlatform } from '@/lib/types/platform.types'

export default function PlatformFieldConfigPage() {
  const params = useParams()
  const router = useRouter()
  const platformId = params.platformId as string

  const [platform, setPlatform] = useState<AdPlatform | null>(null)
  const [allFields, setAllFields] = useState<PostField[]>([])
  const [mappings, setMappings] = useState<PlatformPostField[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [platformData, fieldsData, mappingsData] = await Promise.all([
          adminPlatformsApi.getPlatform(platformId),
          adminPostFieldsApi.getFields(),
          adminPostFieldsApi.getPlatformMappings(platformId),
        ])
        setPlatform(platformData)
        setAllFields(fieldsData)
        setMappings(mappingsData)
      } catch (error) {
        console.error('Failed to fetch data:', error)
        router.push('/dashboard/platforms')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [platformId, router])

  const handleSave = async (bulkMappings: BulkPlatformFieldMapping[]) => {
    setSaving(true)
    try {
      const updated = await adminPostFieldsApi.bulkUpdateMappings(platformId, bulkMappings)
      setMappings(updated)
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
    <div className="max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/platforms')}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium mb-2 inline-block"
        >
          &larr; Back to Platforms
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Configure Fields: {platform.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Select which fields this platform uses for post creation, and configure per-platform overrides.
        </p>
      </div>

      <PlatformFieldMapper
        platformId={platformId}
        platformName={platform.name}
        allFields={allFields}
        currentMappings={mappings}
        onSave={handleSave}
        loading={saving}
      />
    </div>
  )
}
