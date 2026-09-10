'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setPending(true)
    const data = new FormData(event.currentTarget)
    const result = mode === 'sign-up'
      ? await authClient.signUp.email({ name: String(data.get('name')), email: String(data.get('email')), password: String(data.get('password')) })
      : await authClient.signIn.email({ email: String(data.get('email')), password: String(data.get('password')) })
    setPending(false)
    if (result.error) { setError('No hemos podido completar la solicitud. Revisa tus datos e inténtalo de nuevo.'); return }
    router.push('/reservar'); router.refresh()
  }
  return <main className="grid min-h-screen place-items-center bg-secondary px-6 py-12"><div className="w-full max-w-md bg-background p-8 sm:p-10"><Link href="/" className="font-mono text-sm font-bold tracking-[0.18em]">PGL<span className="text-accent">.</span>TRAINNING</Link><h1 className="mt-16 text-4xl font-bold tracking-[-0.05em]">{mode === 'sign-up' ? 'Crea tu cuenta.' : 'Bienvenido de nuevo.'}</h1><p className="mt-4 text-sm leading-6 text-muted-foreground">{mode === 'sign-up' ? 'Reserva tus sesiones y sigue tu progreso.' : 'Accede a tus reservas y tu espacio personal.'}</p><form onSubmit={submit} className="mt-10 flex flex-col gap-5">{mode === 'sign-up' && <label className="flex flex-col gap-2 text-sm font-medium">Nombre<input name="name" required className="border border-border bg-transparent px-4 py-3 outline-none focus:border-accent" /></label>}<label className="flex flex-col gap-2 text-sm font-medium">Email<input name="email" type="email" required className="border border-border bg-transparent px-4 py-3 outline-none focus:border-accent" /></label><label className="flex flex-col gap-2 text-sm font-medium">Contraseña<input name="password" type="password" minLength={8} required className="border border-border bg-transparent px-4 py-3 outline-none focus:border-accent" /></label>{error && <p className="text-sm text-accent" role="alert">{error}</p>}<button disabled={pending} className="bg-accent px-5 py-4 text-sm font-bold uppercase tracking-[0.1em] text-accent-foreground disabled:opacity-60">{pending ? 'Cargando…' : mode === 'sign-up' ? 'Crear cuenta' : 'Iniciar sesión'}</button></form><p className="mt-8 text-sm text-muted-foreground">{mode === 'sign-up' ? '¿Ya tienes cuenta?' : '¿Todavía no tienes cuenta?'} <Link className="font-semibold text-foreground underline underline-offset-4" href={mode === 'sign-up' ? '/sign-in' : '/sign-up'}>{mode === 'sign-up' ? 'Inicia sesión' : 'Regístrate'}</Link></p></div></main>
}
