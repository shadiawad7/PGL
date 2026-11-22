'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cookieNoticeStorageKey, cookiesPath } from '@/lib/legal'

export function TechnicalCookieNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      setVisible(sessionStorage.getItem(cookieNoticeStorageKey) !== 'dismissed')
    } catch {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    setVisible(false)
    try {
      sessionStorage.setItem(cookieNoticeStorageKey, 'dismissed')
    } catch {
      // The notice can still be dismissed on this visit when storage is unavailable.
    }
  }

  if (!visible) return null

  return (
    <aside aria-label="Aviso sobre cookies" className="fixed inset-x-4 bottom-4 z-40 max-w-sm rounded-lg border border-border bg-background p-4 text-sm text-foreground shadow-lg sm:left-auto">
      <p>Este portal web únicamente utiliza cookies propias con finalidad técnica para el funcionamiento de la cuenta y las reservas.</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Link href={cookiesPath} className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">Política de Cookies</Link>
        <button type="button" onClick={dismiss} className="min-h-11 rounded-md border border-border px-3 text-sm font-semibold">Entendido</button>
      </div>
    </aside>
  )
}
