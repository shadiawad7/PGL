'use client'

import Link from 'next/link'

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="reservation-page grid min-h-screen place-items-center px-6">
    <section className="max-w-lg rounded-2xl border border-white/20 bg-black/40 p-8">
      <p className="font-mono text-xs tracking-widest text-lime-300">PGL TRAINNING</p>
      <h1 className="mt-6 text-3xl font-bold">No hemos podido cargar esta página.</h1>
      <p className="mt-4 leading-7 text-white/75">Ha ocurrido un problema al consultar tus datos. Inténtalo de nuevo en unos instantes.</p>
      <div className="mt-8 flex items-center gap-6"><button onClick={reset} className="rounded-lg bg-lime-300 px-5 py-3 font-semibold text-black">Reintentar</button><Link href="/">Volver al inicio</Link></div>
    </section>
  </main>
}
