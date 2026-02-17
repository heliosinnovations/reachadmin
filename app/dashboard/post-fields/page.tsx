'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminPostFieldsApi } from '@/lib/api/post-fields'
import { PostFieldTable } from '@/components/admin/post-field-table'
import type { PostField } from '@/lib/types/post-field.types'

export default function PostFieldsPage() {
  const [fields, setFields] = useState<PostField[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFields = async () => {
    try {
      const data = await adminPostFieldsApi.getFields()
      setFields(data)
    } catch (error) {
      console.error('Failed to fetch fields:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFields()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this field? This will also remove all platform mappings for it.')) return
    try {
      await adminPostFieldsApi.deleteField(id)
      setFields((prev) => prev.filter((f) => f.id !== id))
    } catch (error) {
      console.error('Failed to delete field:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Post Fields</h1>
          <p className="text-sm text-gray-500 mt-1">Define the field registry for post creation across platforms.</p>
        </div>
        <Link
          href="/dashboard/post-fields/new"
          className="h-9 px-4 inline-flex items-center rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          + New Field
        </Link>
      </div>

      <PostFieldTable fields={fields} onDelete={handleDelete} />
    </div>
  )
}
