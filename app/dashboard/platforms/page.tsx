'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminPlatformsApi } from '@/lib/api/platforms'
import type { AdPlatform } from '@/lib/types/platform.types'
import { PlatformTable } from '@/components/admin/platform-table'

export default function AdminPlatformsPage() {
  const [platforms, setPlatforms] = useState<AdPlatform[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPlatforms = async () => {
    try {
      const data = await adminPlatformsApi.getPlatforms()
      setPlatforms(data)
    } catch (error) {
      console.error('Failed to fetch platforms:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlatforms()
  }, [])

  const handleToggle = async (id: string) => {
    try {
      const updated = await adminPlatformsApi.togglePlatform(id)
      setPlatforms((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isEnabled: updated.isEnabled } : p))
      )
    } catch (error) {
      console.error('Failed to toggle platform:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this platform?')) return
    try {
      await adminPlatformsApi.deletePlatform(id)
      setPlatforms((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      console.error('Failed to delete platform:', error)
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
          <h1 className="text-2xl font-bold text-gray-900">Platforms</h1>
          <p className="text-sm text-gray-500 mt-1">Manage ad platform configurations.</p>
        </div>
        <Link
          href="/dashboard/platforms/new"
          className="h-9 px-4 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Platform
        </Link>
      </div>

      <PlatformTable
        platforms={platforms}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />
    </div>
  )
}
