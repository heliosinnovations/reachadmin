'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { adminPostFieldsApi } from '@/lib/api/post-fields'
import { PostFieldForm } from '@/components/admin/post-field-form'
import type { PostField, CreatePostFieldData } from '@/lib/types/post-field.types'

export default function EditPostFieldPage() {
  const params = useParams()
  const router = useRouter()
  const [field, setField] = useState<PostField | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchField = async () => {
      try {
        const data = await adminPostFieldsApi.getField(params.id as string)
        setField(data)
      } catch (error) {
        console.error('Failed to fetch field:', error)
        router.push('/dashboard/post-fields')
      } finally {
        setLoading(false)
      }
    }
    fetchField()
  }, [params.id, router])

  const handleSubmit = async (data: CreatePostFieldData) => {
    setSaving(true)
    try {
      await adminPostFieldsApi.updateField(params.id as string, data)
      router.push('/dashboard/post-fields')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !field) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Post Field</h1>
        <p className="text-sm text-gray-500 mt-1">Update the field definition for &ldquo;{field.label}&rdquo;.</p>
      </div>
      <PostFieldForm field={field} onSubmit={handleSubmit} loading={saving} />
    </div>
  )
}
