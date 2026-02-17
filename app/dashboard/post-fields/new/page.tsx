'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminPostFieldsApi } from '@/lib/api/post-fields'
import { PostFieldForm } from '@/components/admin/post-field-form'
import type { CreatePostFieldData } from '@/lib/types/post-field.types'

export default function NewPostFieldPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: CreatePostFieldData) => {
    setLoading(true)
    try {
      await adminPostFieldsApi.createField(data)
      router.push('/dashboard/post-fields')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Post Field</h1>
        <p className="text-sm text-gray-500 mt-1">Define a new field for the post creation registry.</p>
      </div>
      <PostFieldForm onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
