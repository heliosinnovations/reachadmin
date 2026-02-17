'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { tokenStorage } from '@/lib/utils/token-storage'
import { authApi } from '@/lib/api/auth'
import { LayoutDashboard, Layers, Users, Settings, LogOut, FileText } from 'lucide-react'

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Platforms', href: '/dashboard/platforms', icon: Layers },
  { name: 'Post Fields', href: '/dashboard/post-fields', icon: FileText },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tokenStorage.hasTokens()) {
      router.push('/signin')
      return
    }
    // Verify auth and check admin role
    authApi.getProfile()
      .then((profile) => {
        const roles: string[] = (profile.roles || []).map((r: any) => r.name || r)
        if (!roles.includes('admin')) {
          tokenStorage.clearTokens()
          router.push('/signin?error=unauthorized')
          return
        }
        setLoading(false)
      })
      .catch(() => {
        tokenStorage.clearTokens()
        router.push('/signin')
      })
  }, [router])

  const handleSignOut = async () => {
    await authApi.signOut()
    router.push('/signin')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">Reach Admin</h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 p-6">{children}</main>
    </div>
  )
}
