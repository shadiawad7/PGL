'use client'

import { BrandLogo } from '@/components/brand-logo'

import Link from 'next/link'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'

export default function ProfilePage() {
  const [message, setMessage] = useState('')
  async function save(formData: FormData) {
    setMessage('Guardando...')
    const response = await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: formData.get('phone'), goals: formData.get('goals') }) })
    setMessage(response.ok ? 'Perfil actualizado.' : 'No hemos podido guardar el perfil.')
  }
  return <main className="min-h-screen bg-secondary"><header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-background px-6 py-6 lg:px-10"><BrandLogo priority /><button onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/' } } })} className="text-sm font-semibold">Cerrar sesión</button></header><div className="mx-auto max-w-xl px-6 py-16 lg:px-10"><p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Tu perfil</p><h1 className="mt-5 text-5xl font-bold tracking-[-0.06em]">Entrena para algo.</h1><form action={save} className="mt-12 flex flex-col gap-6 bg-background p-7"><label className="flex flex-col gap-2 text-sm font-medium">Teléfono<input name="phone" className="border border-border bg-transparent px-4 py-3 outline-none focus:border-accent" /></label><label className="flex flex-col gap-2 text-sm font-medium">¿Cuál es tu objetivo?<textarea name="goals" rows={5} className="resize-none border border-border bg-transparent px-4 py-3 outline-none focus:border-accent" /></label>{message && <p className="text-sm text-muted-foreground">{message}</p>}<button className="bg-accent px-5 py-4 text-sm font-bold uppercase tracking-[0.1em] text-accent-foreground">Guardar perfil</button></form></div></main>
}
