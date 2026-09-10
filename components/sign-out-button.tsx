'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function SignOutButton({ className = '' }: { className?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    if (loading) return
    setLoading(true)
    try {
      await authClient.signOut()
      router.replace('/sign-in')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return <button type="button" onClick={handleSignOut} disabled={loading} className={className}>{loading ? 'Cerrando sesión…' : 'Cerrar sesión'}</button>
}
